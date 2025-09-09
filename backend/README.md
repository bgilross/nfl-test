# Backend Scaffold

This directory contains the Python backend scaffold (FastAPI + SQLAlchemy + Alembic) to support persisted Team Rankings data and future migrations (e.g., deploying to Neon Postgres).

## Contents

- `app/` – Application package
  - `main.py` – FastAPI entrypoint
  - `api.py` – APIRouter with placeholder endpoints
  - `database.py` – SQLAlchemy engine/session + Base
  - `models.py` – ORM models (Team, Category, StatSnapshot)
  - `schemas.py` – Pydantic models
  - `scraper.py` – Placeholder for scraping logic (port your existing logic here)
  - `core/config.py` – Settings loader (reads `DATABASE_URL`)
- `alembic.ini` – Alembic configuration
- `alembic/` – Alembic environment + versions
- `requirements.txt` – Python dependencies
- `.env.example` – Example environment variables

## Quick Start (Local SQLite)

```powershell
cd backend
python -m venv .venv
./.venv/Scripts/Activate.ps1
pip install -r requirements.txt
alembic upgrade head  # creates dev.db with tables
uvicorn app.main:app --reload
```

Visit: http://127.0.0.1:8000/docs

## Switch to Neon Postgres

1. Create a Neon project & database.
2. Copy the connection string (ensure it includes `sslmode=require` if Neon requires TLS).
3. Set the environment variable (PowerShell):
   ```powershell
   $env:DATABASE_URL = "postgresql+psycopg://USER:PASSWORD@HOST/DBNAME?sslmode=require"
   ```
4. Run migrations: `alembic upgrade head`.
5. Start the server: `uvicorn app.main:app --reload`.

## Adding New Model Changes

1. Edit models in `models.py`.
2. Autogenerate a migration:
   ```powershell
   alembic revision --autogenerate -m "add new field xyz"
   alembic upgrade head
   ```

## Notes

- This baseline intentionally keeps logic minimal; port your existing scraper & API handlers into the provided placeholders.
- For production, add auth / key protection around any scrape-triggering endpoint.
  Backend service (FastAPI + SQLite) for structured TeamRankings data.

Endpoints:

- GET /categories
- GET /stats/{category_slug}
- GET /team/{team_name}
- POST /scrape (triggers fresh scrape)

Run:

```
pip install -r requirements.txt
uvicorn backend.api:app --reload
```

Local Run:

```
pip install -r requirements.txt
export DATABASE_URL=postgresql://user:pass@host/dbname  # or leave unset for local SQLite
uvicorn backend.api:app --reload
```

Vercel Deployment (Serverless):

1. Ensure `vercel.json` present (added).
2. Add environment variable `DATABASE_URL` in Vercel dashboard (Neon / Supabase / Railway connection string). If it starts with postgres:// Vercel will pass it; code normalizes to postgresql://.
3. Deploy; the FastAPI app is exposed via `api/index.py`.
4. Access docs at `/api/docs`.

Scheduled Scraping:

- GitHub Action `.github/workflows/scrape.yml` runs hourly; configure repo secret `DATABASE_URL`.
- This populates Postgres so serverless function only reads (fast, cheap).

Do NOT trigger long-running scrapes from Vercel requests (time limits). Use the Action.
