from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas
from app.scraper import scrape_and_store

router = APIRouter()


@router.get('/teams', response_model=List[schemas.TeamOut])
def list_teams(db: Session = Depends(get_db)):
    return db.query(models.Team).order_by(models.Team.name).all()


@router.get('/categories', response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.slug).all()


@router.post('/scrape')
def trigger_scrape(season: Optional[int] = Query(None), db: Session = Depends(get_db)):
    result = scrape_and_store(db, season_year=season)
    return {"detail": result}


@router.get('/snapshots', response_model=List[schemas.StatSnapshotOut])
def list_snapshots(
    season: Optional[int] = Query(None),
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    q = db.query(models.StatSnapshot).order_by(models.StatSnapshot.id.desc())
    if season is not None:
        q = q.filter(models.StatSnapshot.season_year == season)
    return q.limit(limit).all()
