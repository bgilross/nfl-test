"""Scraper module integrated with DB layer.

Reuses concept from front-end script but writes structured data into SQLite.
"""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Any
import random
import time

import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from . import models

BASE_URL = "https://www.teamrankings.com/nfl/stat/"
STAT_ENDPOINTS = {
    "opponent-completion-pct": "Opp Cmpltn %",
    "opponent-rushing-yards-per-game": "Opp Rushing Yds",
    "opponent-passing-yards-per-game": "Opp Passing Yds",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; NFLStatsBot/1.0)",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch(url: str) -> requests.Response:
    return requests.get(url, headers=HEADERS, timeout=20)


def parse_table(html: bytes) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    out = []
    for row in table.find_all("tr"):
        tds = row.find_all("td")
        if not tds:
            continue
        try:
            def num(i: int):
                try:
                    return float(tds[i].get_text(strip=True).replace("%", ""))
                except Exception:
                    return None
            out.append(
                {
                    "Rank": int(tds[0].get_text(strip=True)),
                    "Team": tds[1].get_text(strip=True),
                    "2024": num(2),
                    "Last 3": num(3),
                    "Last 1": num(4),
                    "Home": num(5),
                    "Away": num(6),
                    "2023": num(7),
                }
            )
        except Exception:
            continue
    return out


def ensure_category(session: Session, slug: str, display: str) -> models.Category:
    cat = session.query(models.Category).filter_by(slug=slug).one_or_none()
    if not cat:
        cat = models.Category(slug=slug, display_name=display)
        session.add(cat)
        session.flush()
    return cat


def ensure_team(session: Session, name: str) -> models.Team:
    tm = session.query(models.Team).filter_by(name=name).one_or_none()
    if not tm:
        tm = models.Team(name=name)
        session.add(tm)
        session.flush()
    return tm


def scrape_and_store(session: Session, delay: float = 4.0, jitter: float = 1.5) -> int:
    """Scrape all endpoints, persisting rows. Returns count of snapshots inserted."""
    inserted = 0
    timestamp = datetime.utcnow()
    for slug, display in STAT_ENDPOINTS.items():
        url = BASE_URL + slug
        try:
            resp = fetch(url)
            if resp.status_code != 200:
                continue
            rows = parse_table(resp.content)
            category = ensure_category(session, slug, display)
            for r in rows:
                team = ensure_team(session, r["Team"])
                snap = models.StatSnapshot(
                    category=category,
                    team=team,
                    scraped_at=timestamp,
                    rank=r.get("Rank"),
                    val_2024=r.get("2024"),
                    last_3=r.get("Last 3"),
                    last_1=r.get("Last 1"),
                    home=r.get("Home"),
                    away=r.get("Away"),
                    prev_2023=r.get("2023"),
                )
                session.add(snap)
                inserted += 1
        except Exception:
            continue
        time.sleep(delay + random.uniform(0, jitter))
    return inserted
