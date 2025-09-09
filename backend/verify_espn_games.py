"""Verify ESPN API data integrity for a given team & season.

Usage examples:
  python backend/verify_espn_games.py --team "Detroit"          # current season
  python backend/verify_espn_games.py --team "Detroit" --season 2023
  python backend/verify_espn_games.py --team "Kansas City" --limit-weeks 5

Checks:
  - Fetch scoreboard each week up to current or full season (past seasons assumed 18 weeks)
  - Collect game IDs involving the team
  - Fetch each boxscore; confirm presence of key structures
  - Validate player stat categories (passing/rushing/receiving/defensive) exist if expected
  - Report missing weeks, duplicate game IDs, categories with zero players, or stat length mismatches

Exit code 0 if no critical issues, 1 if anomalies found.
"""
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass, field
from typing import List, Dict, Any, Set
import requests
from datetime import datetime

KEY_CATEGORIES = {"passing", "rushing", "receiving", "defensive"}


def current_season_year(now: datetime | None = None) -> int:
    now = now or datetime.utcnow()
    return now.year if now.month >= 9 else now.year - 1


def get_week_count(season: int) -> int:
    # Simple heuristic: assume 18 weeks for any past season; current may be partial
    if season < current_season_year():
        return 18
    # Approximate current week (aligning with Thursday season start logic) – coarse but adequate here
    start = datetime(season, 9, 1)
    # Find first Thursday
    while start.weekday() != 3:  # 0 Mon .. 3 Thu
        start = start.replace(day=start.day + 1)
    diff_days = (datetime.utcnow() - start).days
    wk = (diff_days // 7) + 1
    return max(1, min(18, wk))


def fetch_scoreboard(season: int, week: int) -> Dict[str, Any]:
    url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates={season}&seasontype=2&week={week}"
    r = requests.get(url, timeout=25)
    r.raise_for_status()
    return r.json()


def fetch_boxscore(game_id: str) -> Dict[str, Any]:
    url = f"https://cdn.espn.com/core/nfl/boxscore?xhr=1&gameId={game_id}"
    r = requests.get(url, timeout=25)
    r.raise_for_status()
    return r.json()


@dataclass
class Anomalies:
    missing_weeks: List[int] = field(default_factory=list)
    zero_player_categories: Dict[str, List[str]] = field(default_factory=dict)  # game_id -> cats
    duplicate_games: Set[str] = field(default_factory=set)
    stat_mismatches: Dict[str, List[str]] = field(default_factory=dict)  # game_id -> messages
    fetch_errors: Dict[str, str] = field(default_factory=dict)

    def has_issues(self) -> bool:
        return any(
            [
                self.missing_weeks,
                self.zero_player_categories,
                self.duplicate_games,
                self.stat_mismatches,
                self.fetch_errors,
            ]
        )


def verify(team: str, season: int, limit_weeks: int | None = None) -> Anomalies:
    anomalies = Anomalies()
    week_cap = limit_weeks or get_week_count(season)
    found_game_ids: Dict[int, str] = {}
    seen_ids: Set[str] = set()

    for wk in range(1, week_cap + 1):
        try:
            scoreboard = fetch_scoreboard(season, wk)
        except Exception as e:  # noqa: BLE001
            anomalies.fetch_errors[f"week_{wk}"] = str(e)
            continue
        events = scoreboard.get("events", [])
        game = None
        for ev in events:
            name = ev.get("name", "").lower()
            if team.lower() in name:
                game = ev
                break
        if not game:
            anomalies.missing_weeks.append(wk)
            continue
        gid = game.get("id")
        if not gid:
            anomalies.fetch_errors[f"week_{wk}"] = "No game id in event"
            continue
        if gid in seen_ids:
            anomalies.duplicate_games.add(gid)
        seen_ids.add(gid)
        found_game_ids[wk] = gid

    # Fetch each game and inspect box score
    for wk, gid in found_game_ids.items():
        try:
            box = fetch_boxscore(gid)
        except Exception as e:  # noqa: BLE001
            anomalies.fetch_errors[gid] = str(e)
            continue
        try:
            players_root = box["gamepackageJSON"]["boxscore"]["players"]
        except Exception:
            anomalies.fetch_errors[gid] = "Missing players structure"
            continue
        zero_cats: List[str] = []
        mismatch_msgs: List[str] = []
        for team_section in players_root:
            for stat_cat in team_section.get("statistics", []):
                cat_name = stat_cat.get("name", "").lower()
                if cat_name in KEY_CATEGORIES:
                    athletes = stat_cat.get("athletes", [])
                    if not athletes:
                        zero_cats.append(cat_name)
                    else:
                        # Basic stat length check: labels len matches each athlete stats len
                        labels = stat_cat.get("labels", [])
                        for athlete in athletes:
                            stats = athlete.get("stats", [])
                            if len(stats) != len(labels):
                                mismatch_msgs.append(
                                    f"{cat_name}: label/stat length {len(labels)}/{len(stats)} for {athlete.get('athlete', {}).get('displayName')}"
                                )
        if zero_cats:
            anomalies.zero_player_categories[gid] = zero_cats
        if mismatch_msgs:
            anomalies.stat_mismatches[gid] = mismatch_msgs

    return anomalies


def main():
    ap = argparse.ArgumentParser(description="Verify ESPN API data for a team")
    ap.add_argument("--team", required=True, help="Team search token (e.g. 'Detroit' or 'Kansas City')")
    ap.add_argument("--season", type=int, default=current_season_year(), help="Season year (fall year, e.g. 2024)")
    ap.add_argument("--limit-weeks", type=int, help="Limit weeks processed (debug)")
    args = ap.parse_args()

    print(f"Verifying team='{args.team}' season={args.season} weeks={args.limit_weeks or 'auto'}")
    anomalies = verify(args.team, args.season, args.limit_weeks)

    if anomalies.missing_weeks:
        print("Missing weeks:", anomalies.missing_weeks)
    if anomalies.duplicate_games:
        print("Duplicate game IDs:", sorted(anomalies.duplicate_games))
    if anomalies.zero_player_categories:
        for gid, cats in anomalies.zero_player_categories.items():
            print(f"Game {gid} zero-player categories: {', '.join(cats)}")
    if anomalies.stat_mismatches:
        for gid, msgs in anomalies.stat_mismatches.items():
            print(f"Game {gid} stat mismatches:")
            for m in msgs:
                print("  -", m)
    if anomalies.fetch_errors:
        for key, msg in anomalies.fetch_errors.items():
            print(f"Fetch error {key}: {msg}")

    if anomalies.has_issues():
        print("\nResult: ISSUES FOUND")
        sys.exit(1)
    print("\nResult: PASS (no structural anomalies)")


if __name__ == "__main__":  # pragma: no cover
    main()
