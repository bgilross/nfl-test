"""CLI utility to run scraper once against configured DATABASE_URL.

Usage:
  python -m backend.run_scrape
"""
from __future__ import annotations

import os
from backend.database import session_scope, init_db, DATABASE_URL
from backend.scraper import scrape_and_store


def main():
    if not DATABASE_URL:
        print("WARNING: No DATABASE_URL set; using local SQLite fallback.")
    init_db()
    with session_scope() as s:
        inserted = scrape_and_store(s)
        print(f"Inserted {inserted} rows.")


if __name__ == "__main__":  # pragma: no cover
    main()
