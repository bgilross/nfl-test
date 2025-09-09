from pydantic import BaseModel
from typing import Optional


class TeamOut(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class CategoryOut(BaseModel):
    id: int
    slug: str
    name: str
    class Config:
        from_attributes = True


class StatSnapshotOut(BaseModel):
    id: int
    team_id: int
    category_id: int
    season_year: Optional[int]
    current_year: Optional[int]
    prev_year: Optional[int]
    value_current: Optional[float]
    value_prev: Optional[float]
    last_1: Optional[float]
    last_3: Optional[float]
    home: Optional[float]
    away: Optional[float]
    class Config:
        from_attributes = True
