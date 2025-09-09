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
