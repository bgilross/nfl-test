"""Database setup (SQLite + SQLAlchemy).

Creates engine, session factory, and Base declarative class.
"""
from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_PATH = Path(__file__).parent / "stats.db"

DATABASE_URL = os.getenv("DATABASE_URL")

# Normalize some common Postgres URL prefixes for SQLAlchemy
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_engine_url = DATABASE_URL if DATABASE_URL else f"sqlite:///{DB_PATH}"

ENGINE = create_engine(
    _engine_url,
    echo=False,
    future=True,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=ENGINE, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def init_db():
    from . import models  # noqa: F401 (ensure model metadata is registered)
    if _engine_url.startswith("sqlite"):
        # Create tables automatically only for local dev SQLite; for managed DBs use migrations
        Base.metadata.create_all(bind=ENGINE)


@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
