"""Validation utility to sanity‑check live scrape vs expectations.

Usage examples (from project root, venv active):

  python backend/validate_scrape.py
  python backend/validate_scrape.py --compare src/data/teamrankings_stats.json

Checks performed per category:
  - Category reachable (HTTP 200)
  - Parsed 28–34 rows (expecting ~32 NFL teams; len tolerance for bye weeks / anomalies)
  - Ranks are unique integers starting at 1
  - Teams are unique (no duplicates)
  - Sort order by Rank ascending
  - Basic numeric fields convertible to float or None
Optional comparison:
  - Same category key exists in baseline file
  - Team set difference (new teams added / missing)

Exit code is non‑zero if any hard validation fails.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Tuple

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.teamrankings.com/nfl/stat/"
STAT_ENDPOINTS = {
    "opponent-completion-pct": "Opp Cmpltn %",
    "opponent-rushing-yards-per-game": "Opp Rushing Yds",
    "opponent-passing-yards-per-game": "Opp Passing Yds",
    "opponent-rushing-touchdowns-per-game": "Opp Rush TDs",
    "opponent-gross-passing-yards-per-game": "Opp GROSS Pass Yds",
    "opponent-sacks-per-game": "Opp Sacks Per Game",
}

UA = {"User-Agent": "Mozilla/5.0 (Validator/1.0)"}


def fetch(slug: str) -> requests.Response:
    url = BASE_URL + slug
    resp = requests.get(url, headers=UA, timeout=20)
    return resp


def parse_table(html: bytes) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    out = []
    for row in table.find_all("tr"):
        cols = row.find_all("td")
        if not cols:
            continue
        try:
            def num(i: int):
                try:
                    return float(cols[i].get_text(strip=True).replace("%", ""))
                except Exception:
                    return None
            out.append(
                {
                    "Rank": int(cols[0].get_text(strip=True)),
                    "Team": cols[1].get_text(strip=True),
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


def validate_category(key: str, rows: List[Dict[str, Any]]) -> List[str]:
    errors: List[str] = []
    if not (28 <= len(rows) <= 34):
        errors.append(f"{key}: unexpected row count {len(rows)} (expected ~32)")
    ranks = [r.get("Rank") for r in rows]
    if len(set(ranks)) != len(ranks):
        errors.append(f"{key}: duplicate ranks detected")
    if ranks and (min(ranks) != 1 or max(ranks) != len(ranks)):
        # Not fatal if a team missing, but note
        errors.append(f"{key}: rank range anomaly (min={min(ranks)} max={max(ranks)} count={len(ranks)})")
    teams = [r.get("Team") for r in rows]
    if len(set(teams)) != len(teams):
        errors.append(f"{key}: duplicate team names found")
    # Asc order check
    if ranks != sorted(ranks):
        errors.append(f"{key}: ranks not sorted ascending")
    return errors


def compare_baseline(category: str, live_rows: List[Dict[str, Any]], baseline_rows: List[Dict[str, Any]]) -> Tuple[List[str], List[str]]:
    """Return (added, missing) team lists vs baseline ignoring order."""
    live_teams = {r["Team"] for r in live_rows}
    base_teams = {r["Team"] for r in baseline_rows}
    added = sorted(live_teams - base_teams)
    missing = sorted(base_teams - live_teams)
    return added, missing


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--compare", type=Path, help="Path to existing JSON file to diff")
    args = parser.parse_args()

    baseline: Dict[str, Any] = {}
    if args.compare:
        if not args.compare.exists():
            print(f"Baseline file {args.compare} not found", file=sys.stderr)
            sys.exit(2)
        try:
            baseline = json.loads(args.compare.read_text())
        except Exception as e:  # noqa: BLE001
            print(f"Failed to load baseline: {e}", file=sys.stderr)
            sys.exit(2)

    fatal_errors: List[str] = []
    for slug, display in STAT_ENDPOINTS.items():
        print(f"== {display} ({slug}) ==")
        resp = fetch(slug)
        if resp.status_code != 200:
            msg = f"HTTP {resp.status_code} fetching {slug}"
            print(msg)
            fatal_errors.append(msg)
            continue
        rows = parse_table(resp.content)
        print(f"Rows parsed: {len(rows)}")
        errs = validate_category(display, rows)
        if errs:
            for e in errs:
                print("  !", e)
            # treat structural anomalies as fatal
            fatal_errors.extend(errs)
        if baseline:
            if display in baseline:
                added, missing = compare_baseline(display, rows, baseline[display])
                if added:
                    print("  + Added teams:", ", ".join(added))
                if missing:
                    print("  - Missing teams:", ", ".join(missing))
            else:
                print("  (No baseline category to compare)")
    if fatal_errors:
        print("\nValidation FAILED:")
        for fe in fatal_errors:
            print(" -", fe)
        sys.exit(1)
    print("\nValidation PASSED (structural checks)")


if __name__ == "__main__":  # pragma: no cover
    main()
