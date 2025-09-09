"""Placeholder scraper module.

Port your existing scraping logic here. Recommended contract:

def scrape_and_store(db, season_year: int | None = None):
    - Fetch remote pages
    - Normalize categories (ensure Category rows exist)
    - Normalize teams (ensure Team rows exist)
    - Insert StatSnapshot rows

Keep network + parsing logic isolated for easier testing.
"""

from sqlalchemy.orm import Session


def scrape_and_store(db: Session, season_year: int | None = None) -> dict:
    # TODO: Implement real scraping (requests + BeautifulSoup) and persistence
    return {"status": "not_implemented", "season_year": season_year}
