"""Pydantic schemas for API serialization."""
from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel


class CategoryOut(BaseModel):
    slug: str
    display_name: str

    class Config:
        from_attributes = True


class StatRow(BaseModel):
    team: str
    category: str
    scraped_at: datetime
    rank: int | None
    val_2024: float | None
    last_3: float | None
    last_1: float | None
    home: float | None
    away: float | None
    prev_2023: float | None


class TeamAggregate(BaseModel):
    team: str
    categories: dict[str, StatRow]
