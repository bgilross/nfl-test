"""Improved TeamRankings.com scraper.

Features:
 - Configurable STAT_ENDPOINTS mapping slug -> Friendly Key (matching existing JSON format)
 - Robust requests with retries + backoff + custom User-Agent
 - Graceful handling of missing tables / partial data
 - Optional command line flags for delay & output path
 - Merges into existing JSON if present (preserves untouched categories)
"""

from __future__ import annotations

import argparse
import json
import random
import time
from pathlib import Path
from typing import Dict, List, Any

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.teamrankings.com/nfl/stat/"

# Map site slug -> Friendly category key used in app JSON
STAT_ENDPOINTS = {
    "opponent-completion-pct": "Opp Cmpltn %",
    "opponent-rushing-yards-per-game": "Opp Rushing Yds",
    "opponent-passing-yards-per-game": "Opp Passing Yds",
}

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; NFLDataBot/1.0; +https://example.com/bot)",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch(url: str, retries: int = 3, backoff: float = 2.0) -> requests.Response:
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=15)
            if resp.status_code == 200:
                return resp
            else:
                last_err = RuntimeError(f"Status {resp.status_code}")
        except Exception as e:  # noqa: BLE001
            last_err = e
        sleep_time = backoff * attempt + random.uniform(0, 0.5)
        time.sleep(sleep_time)
    raise RuntimeError(f"Failed to fetch {url}: {last_err}")


def parse_table(html: bytes) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []
    # Try to detect header labels for numeric columns
    headers = []
    thead = table.find("thead")
    if thead:
        ths = thead.find_all("th")
        headers = [th.get_text(strip=True) for th in ths]
    # Map indices with fallback
    # Expect something like: [Rank, Team, 2024, Last 3, Last 1, Home, Away, 2023]
    label_by_index = {
        2: headers[2] if len(headers) > 2 else "2024",
        3: headers[3] if len(headers) > 3 else "Last 3",
        4: headers[4] if len(headers) > 4 else "Last 1",
        5: headers[5] if len(headers) > 5 else "Home",
        6: headers[6] if len(headers) > 6 else "Away",
        7: headers[7] if len(headers) > 7 else "2023",
    }

    out: List[Dict[str, Any]] = []
    for row in table.find_all("tr"):
        cols = row.find_all("td")
        if not cols:
            continue
        try:
            rank = int(cols[0].get_text(strip=True))
            team = cols[1].get_text(strip=True)
            def parse_num(i: int) -> float:
                try:
                    return float(cols[i].get_text(strip=True).replace("%", "").strip())
                except Exception:
                    return 0.0
            record: Dict[str, Any] = {"Rank": rank, "Team": team}
            for idx, label in label_by_index.items():
                record[label] = parse_num(idx)
            out.append(record)
        except Exception:
            continue
    return out


def load_existing(path: Path) -> Dict[str, Any]:
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return {}
    return {}


def scrape(endpoints: Dict[str, str], delay: float, jitter: float) -> Dict[str, Any]:
    results: Dict[str, Any] = {}
    for slug, friendly in endpoints.items():
        url = BASE_URL + slug
        print(f"Fetching {friendly} -> {url}")
        try:
            resp = fetch(url)
            table_data = parse_table(resp.content)
            if table_data:
                results[friendly] = table_data
                print(f"  Collected {len(table_data)} rows.")
            else:
                print("  WARNING: No data parsed.")
        except Exception as e:  # noqa: BLE001
            print(f"  ERROR: {e}")
        sleep_time = delay + random.uniform(0, jitter)
        print(f"Sleeping {sleep_time:.2f}s...")
        time.sleep(sleep_time)
    return results


def main():
    parser = argparse.ArgumentParser(description="Scrape TeamRankings opponent stats")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).parent / "teamrankings_stats.json",
        help="Output JSON path (will merge with existing if present)",
    )
    parser.add_argument("--delay", type=float, default=5.0, help="Base delay between requests")
    parser.add_argument("--jitter", type=float, default=2.0, help="Random jitter added to delay")
    args = parser.parse_args()

    existing = load_existing(args.output)
    new_data = scrape(STAT_ENDPOINTS, delay=args.delay, jitter=args.jitter)
    merged = {**existing, **new_data}
    args.output.write_text(json.dumps(merged, indent=2))
    print(f"Wrote {len(new_data)} categories (merged total {len(merged)}) to {args.output}")


if __name__ == "__main__":  # pragma: no cover
    main()
