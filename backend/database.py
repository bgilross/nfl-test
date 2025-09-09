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
        _maybe_upgrade_sqlite_schema()


def _maybe_upgrade_sqlite_schema():
    """Lightweight, additive schema upgrade for dev SQLite.

    Adds newly introduced columns if they don't exist yet so that code changes
    (e.g. replacing val_2024/prev_2023 with dynamic year fields) don't crash
    on existing local databases. This is NOT a replacement for real migrations
    in production; use Alembic there.
    """
    desired_new_cols = {
        # column_name: SQL fragment
        "current_year": "INTEGER",
        "value_current": "FLOAT",
        "prev_year": "INTEGER",
        "value_prev": "FLOAT",
        "season_year": "INTEGER",
    }
    try:
        with ENGINE.connect() as conn:
            res = conn.exec_driver_sql("PRAGMA table_info(stat_snapshots)")
            existing = {row[1] for row in res.fetchall()}  # column name at index 1
            to_add = [c for c in desired_new_cols if c not in existing]
            for col in to_add:
                ddl = f"ALTER TABLE stat_snapshots ADD COLUMN {col} {desired_new_cols[col]}"
                conn.exec_driver_sql(ddl)
    except Exception:
        # Silent fail; worst case app will still raise the original error and user can recreate DB
        pass


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
