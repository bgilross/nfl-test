from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, text
from sqlalchemy.orm import relationship
from app.database import Base


class Team(Base):
    __tablename__ = 'teams'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    snapshots = relationship('StatSnapshot', back_populates='team')


class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    slug = Column(String(150), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    snapshots = relationship('StatSnapshot', back_populates='category')


class StatSnapshot(Base):
    __tablename__ = 'stat_snapshots'
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    scraped_at = Column(DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP'), nullable=False)
    rank = Column(Integer, nullable=True)
    season_year = Column(Integer, nullable=True)
    current_year = Column(Integer, nullable=True)
    prev_year = Column(Integer, nullable=True)
    value_current = Column(Float, nullable=True)
    value_prev = Column(Float, nullable=True)
    last_1 = Column(Float, nullable=True)
    last_3 = Column(Float, nullable=True)
    home = Column(Float, nullable=True)
    away = Column(Float, nullable=True)

    team = relationship('Team', back_populates='snapshots')
    category = relationship('Category', back_populates='snapshots')
