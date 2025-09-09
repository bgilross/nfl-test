"""SQLAlchemy models for team ranking stats."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship

from .database import Base


class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True, nullable=False)
    stats = relationship("StatSnapshot", back_populates="team")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, unique=True, nullable=False)
    stats = relationship("StatSnapshot", back_populates="category")


class StatSnapshot(Base):
    __tablename__ = "stat_snapshots"
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    scraped_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    rank = Column(Integer)
    # Dynamic season columns
    current_year = Column(Integer)  # e.g., 2025
    value_current = Column(Float)
    last_3 = Column(Float)
    last_1 = Column(Float)
    home = Column(Float)
    away = Column(Float)
    prev_year = Column(Integer)  # e.g., 2024
    value_prev = Column(Float)
    # Primary season association for this snapshot (allows filtering across years)
    season_year = Column(Integer, index=True)

    team = relationship("Team", back_populates="stats")
    category = relationship("Category", back_populates="stats")

    __table_args__ = (
        UniqueConstraint(
            "category_id", "team_id", "scraped_at", name="uq_snapshot_point_in_time"
        ),
        Index("ix_category_time", "category_id", "scraped_at"),
    Index("ix_category_season_time", "category_id", "season_year", "scraped_at"),
    )
