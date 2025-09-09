"""Scraper module integrated with DB layer.

Reuses concept from front-end script but writes structured data into SQLite.
"""
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional
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
    # Added per request
    "opponent-rushing-touchdowns-per-game": "Opp Rush TDs",
    "opponent-gross-passing-yards-per-game": "Opp GROSS Pass Yds",
    "opponent-sacks-per-game": "Opp Sacks Per Game",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; NFLStatsBot/1.0)",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch(url: str) -> requests.Response:
    return requests.get(url, headers=HEADERS, timeout=20)


def _detect_year_labels(soup: BeautifulSoup) -> Tuple[int | None, int | None]:
    """Try to read the current and previous season year numbers from the table header.
    Returns (current_year, prev_year)."""
    thead = soup.find("thead")
    if not thead:
        return None, None
    ths = [th.get_text(strip=True) for th in thead.find_all("th")]
    # Expected headers like: Rank, Team, 2025, Last 3, Last 1, Home, Away, 2024
    cur, prev = None, None
    for txt in ths:
        if txt.isdigit():
            yr = int(txt)
            if cur is None or yr > (cur or 0):
                prev = cur
                cur = yr
            elif prev is None:
                prev = yr
    # Ensure prev < cur if both set
    if cur is not None and prev is not None and prev > cur:
        cur, prev = prev, cur
    return cur, prev


def parse_table(html: bytes) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    cur_year, prev_year = _detect_year_labels(soup)
    # Fallback if detection failed (common if site alters header markup)
    if cur_year is None:
        now = datetime.utcnow()
        # Season year: if before September treat as previous year
        cur_year = now.year if now.month >= 9 else now.year - 1
        prev_year = cur_year - 1
    # Extract header labels to build a flexible index map.
    header_cells = []
    thead = table.find("thead")
    if thead:
        h_row = thead.find("tr")
        if h_row:
            header_cells = [th.get_text(strip=True) for th in h_row.find_all("th")]
    if not header_cells:
        # Fallback: infer by first data row column count
        first_data = table.find("tr")
        if first_data:
            header_cells = [f"col{i}" for i, _ in enumerate(first_data.find_all("td"))]

    # Normalize headers
    norm_headers = [h.lower() for h in header_cells]

    # Identify year columns explicitly by pattern (4 digits starting with 20)
    year_indices = []
    for idx, h in enumerate(norm_headers):
        if h.isdigit() and len(h) == 4 and h.startswith("20"):
            try:
                year_indices.append((idx, int(h)))
            except Exception:
                pass
    # Determine current/prev year indices (override detection if both present)
    year_indices_sorted = sorted(year_indices, key=lambda x: x[1], reverse=True)
    cur_year_idx = prev_year_idx = None
    if year_indices_sorted:
        cur_year = year_indices_sorted[0][1]
        cur_year_idx = year_indices_sorted[0][0]
        if len(year_indices_sorted) > 1:
            prev_year = year_indices_sorted[1][1]
            prev_year_idx = year_indices_sorted[1][0]

    # Map for semantic columns (case-insensitive substring matching)
    def find_index(predicates):
        for i, h in enumerate(norm_headers):
            for p in predicates:
                if p in h:
                    return i
        return None

    idx_last3 = find_index(["last 3", "last3", "l3"])
    idx_last1 = find_index(["last 1", "last1", "l1"])  # sometimes shown as Last 1
    idx_home = find_index(["home"])
    idx_away = find_index(["away"])

    # If year indices still missing, assume a traditional layout after Rank, Team.
    # Traditional order: Rank, Team, currentYear, Last 3, Last 1, Home, Away, prevYear
    # We already forced cur_year/prev_year above.
    if cur_year_idx is None:
        # attempt positional guess
        cur_year_idx = 2
    if prev_year_idx is None:
        # likely last column if length >=8
        prev_year_idx = 7 if len(norm_headers) >= 8 else None
    if idx_last3 is None:
        idx_last3 = 3
    if idx_last1 is None:
        idx_last1 = 4
    if idx_home is None:
        idx_home = 5
    if idx_away is None:
        idx_away = 6

    def parse_num(text: str):
        try:
            return float(text.replace("%", "").strip())
        except Exception:
            return None

    rows_out: List[Dict[str, Any]] = []
    for row in table.find_all("tr"):
        tds = row.find_all("td")
        if len(tds) < 3:  # need at least Rank, Team, one value
            continue
        try:
            rank_txt = tds[0].get_text(strip=True)
            rank_val = int(rank_txt) if rank_txt.isdigit() else None
            team_name = tds[1].get_text(strip=True)
            def col(idx):
                if idx is None or idx >= len(tds):
                    return None
                return parse_num(tds[idx].get_text(strip=True))
            rows_out.append({
                "Rank": rank_val,
                "Team": team_name,
                "current_year": cur_year,
                "value_current": col(cur_year_idx),
                "Last 3": col(idx_last3),
                "Last 1": col(idx_last1),
                "Home": col(idx_home),
                "Away": col(idx_away),
                "prev_year": prev_year,
                "value_prev": col(prev_year_idx),
            })
        except Exception:
            continue
    return rows_out


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


def scrape_and_store(session: Session, delay: float = 4.0, jitter: float = 1.5, season_year: Optional[int] = None) -> int:
    """Scrape all endpoints, persisting rows. Returns count of snapshots inserted.

    season_year: The season context you want to associate this snapshot batch with.
                 If None, uses detected current_year from each table row (may vary but should match).
    """
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
                # derive season_year if not provided
                sy = season_year or r.get("current_year") or datetime.utcnow().year
                snap = models.StatSnapshot(
                    category=category,
                    team=team,
                    scraped_at=timestamp,
                    rank=r.get("Rank"),
                    current_year=r.get("current_year"),
                    value_current=r.get("value_current"),
                    last_3=r.get("Last 3"),
                    last_1=r.get("Last 1"),
                    home=r.get("Home"),
                    away=r.get("Away"),
                    prev_year=r.get("prev_year"),
                    value_prev=r.get("value_prev"),
                    season_year=sy,
                )
                session.add(snap)
                inserted += 1
        except Exception:
            continue
        time.sleep(delay + random.uniform(0, jitter))
    return inserted
