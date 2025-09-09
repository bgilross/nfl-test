"""FastAPI application exposing stats endpoints."""
from __future__ import annotations

from collections import defaultdict
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import session_scope, init_db
from . import models
from . import schemas
from .scraper import scrape_and_store, STAT_ENDPOINTS, BASE_URL, parse_table  # type: ignore
import requests
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="NFL Team Rankings API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_session():  # dependency
    with session_scope() as s:
        yield s


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/categories", response_model=list[schemas.CategoryOut])
def list_categories(session: Session = Depends(get_session)):
    cats = session.query(models.Category).all()
    return cats


@app.get("/stats/{category_slug}", response_model=list[schemas.StatRow])
def latest_for_category(category_slug: str, session: Session = Depends(get_session)):
    category = (
        session.query(models.Category).filter_by(slug=category_slug).one_or_none()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    # Find latest timestamp for this category
    latest_ts = (
        session.query(models.StatSnapshot.scraped_at)
        .filter_by(category_id=category.id)
        .order_by(models.StatSnapshot.scraped_at.desc())
        .limit(1)
        .scalar()
    )
    if not latest_ts:
        return []
    snaps = (
        session.query(models.StatSnapshot)
        .filter_by(category_id=category.id, scraped_at=latest_ts)
        .join(models.Team)
        .all()
    )
    out = []
    for s in snaps:
        out.append(
            schemas.StatRow(
                team=s.team.name,
                category=category.display_name,
                scraped_at=s.scraped_at,
                rank=s.rank,
                val_2024=s.val_2024,
                last_3=s.last_3,
                last_1=s.last_1,
                home=s.home,
                away=s.away,
                prev_2023=s.prev_2023,
            )
        )
    return out


@app.get("/team/{team_name}", response_model=schemas.TeamAggregate)
def latest_for_team(team_name: str, session: Session = Depends(get_session)):
    team = session.query(models.Team).filter_by(name=team_name).one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    # For each category, pick latest snapshot for that team
    snaps = (
        session.query(models.StatSnapshot)
        .filter_by(team_id=team.id)
        .join(models.Category)
        .all()
    )
    latest_per_category = {}
    for snap in snaps:
        existing = latest_per_category.get(snap.category.display_name)
        if not existing or snap.scraped_at > existing.scraped_at:
            latest_per_category[snap.category.display_name] = snap
    categories_out = {}
    for display_name, s in latest_per_category.items():
        categories_out[display_name] = schemas.StatRow(
            team=team.name,
            category=display_name,
            scraped_at=s.scraped_at,
            rank=s.rank,
            val_2024=s.val_2024,
            last_3=s.last_3,
            last_1=s.last_1,
            home=s.home,
            away=s.away,
            prev_2023=s.prev_2023,
        )
    return schemas.TeamAggregate(team=team.name, categories=categories_out)


@app.post("/scrape")
def trigger_scrape(session: Session = Depends(get_session)):
    inserted = scrape_and_store(session)
    return {"inserted": inserted}


# ---------------------- DEBUG / DIAGNOSTICS ----------------------

def _validate_scrape() -> dict:
    summary = {"categories": {}, "errors": []}
    headers = {"User-Agent": "Mozilla/5.0 (DebugValidator/1.0)"}
    for slug, display in STAT_ENDPOINTS.items():
        url = BASE_URL + slug
        try:
            r = requests.get(url, headers=headers, timeout=20)
            cat = {"url": url, "status": r.status_code}
            if r.status_code == 200:
                rows = parse_table(r.content)
                cat["rowCount"] = len(rows)
                if rows:
                    cat["first"] = rows[0]
                if not (28 <= len(rows) <= 34):
                    cat["warning"] = "rowCount outside expected 28-34"
            else:
                cat["error"] = "non-200 status"
            summary["categories"][display] = cat
        except Exception as e:  # noqa: BLE001
            summary["errors"].append({"category": display, "error": str(e)})
    return summary


def _verify_espn(team_token: str, season: int, limit_weeks: int | None) -> dict:
    """Lightweight inline version of verify script (reduced for serverless)."""
    def current_season_year(now: datetime | None = None) -> int:
        now = now or datetime.utcnow()
        return now.year if now.month >= 9 else now.year - 1

    def get_week_count(season_year: int) -> int:
        if season_year < current_season_year():
            return 18
        # Approx: assume 18; trimmed by current calendar progression
        return 18

    def fetch_scoreboard(season_year: int, week: int):
        url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates={season_year}&seasontype=2&week={week}"
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        return r.json()

    def fetch_box(game_id: str):
        url = f"https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId={game_id}"
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        return r.json()

    weeks_cap = limit_weeks or get_week_count(season)
    result = {"team": team_token, "season": season, "weeksChecked": weeks_cap, "missingWeeks": [], "games": [], "errors": []}
    seen_ids = set()
    for wk in range(1, weeks_cap + 1):
        try:
            scoreboard = fetch_scoreboard(season, wk)
        except Exception as e:  # noqa: BLE001
            result["errors"].append({"week": wk, "error": str(e)})
            continue
        game_id = None
        for ev in scoreboard.get("events", []):
            if team_token.lower() in ev.get("name", "").lower():
                game_id = ev.get("id")
                break
        if not game_id:
            result["missingWeeks"].append(wk)
            continue
        if game_id in seen_ids:
            result["errors"].append({"week": wk, "error": "duplicate game id"})
            continue
        seen_ids.add(game_id)
        try:
            box = fetch_box(game_id)
            players = box.get("gamepackageJSON", {}).get("boxscore", {}).get("players", [])
            cat_counts = {}
            for team_section in players:
                for stat_cat in team_section.get("statistics", []):
                    nm = stat_cat.get("name", "").lower()
                    if nm in {"passing", "rushing", "receiving", "defensive"}:
                        cat_counts[nm] = cat_counts.get(nm, 0) + len(stat_cat.get("athletes", []))
            result["games"].append({"week": wk, "gameId": game_id, "categoryAthleteCounts": cat_counts})
        except Exception as e:  # noqa: BLE001
            result["errors"].append({"gameId": game_id, "error": str(e)})
    return result


@app.post("/debug/validate-scrape")
def debug_validate_scrape():
    return _validate_scrape()


class VerifyRequest(BaseModel):  # minimal pydantic model
    team: str
    season: int
    limit_weeks: int | None = None


@app.post("/debug/verify-espn")
def debug_verify_espn(req: VerifyRequest):
    return _verify_espn(req.team, req.season, req.limit_weeks)

