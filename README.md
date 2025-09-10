5. Trigger a scrape: `curl -X POST http://localhost:3000/api/scrape` (add header `x-api-key` if configured)
6. (Optional) Run seed without starting server (build first):
   - `npm run build`
   - `npm run seed`

### Dedupe & Latest Endpoint

- Dedupe: Scraper skips inserting a snapshot if identical `valueCurrent` and `rank` appeared for same (team, category) within last hour.
- DB index enforces minute-level uniqueness pattern to reduce spam.
- Latest data: `GET /api/latest` returns each category with the latest snapshot per team.

### Scheduling

Local Windows Task Scheduler example (every 2 hours):

1. Create Basic Task -> Name: NFL Scrape
2. Trigger: Daily, repeat every 2 hours (Advanced Settings)
3. Action: Start a Program
   Program/script: powershell.exe
   Args: -NoProfile -ExecutionPolicy Bypass -Command "cd 'C:/Users/yourUser/VSCodeProjects/nfl-test'; npm run dev | Out-Null"
   (Alternatively use a separate script curling the deployed /api/scrape route.)

Vercel Cron (Settings > Cron Jobs) example:

- Path: /api/scrape
- Schedule: 0 \* \* \* \* (hourly)
- Method: POST

Set `SCRAPE_API_KEY` and include header in cron if you enable auth.

## NFL Rankings / Stats App

Full-stack Next.js (Pages Router) application for ingesting and displaying football team ranking & efficiency statistics scraped from public sources (e.g. TeamRankings / ESPN). Legacy Python backend was removed; persistence handled via Prisma + PostgreSQL.

### Stack

- Next.js 14 / React 18
- Prisma ORM (`prisma/schema.prisma`) -> PostgreSQL
- Cheerio-based scraper (server-side) invoked via API route `/api/scrape`
- MUI (Material UI v6) for components

### Data Model (simplified)

- Team(id, name)
- Category(id, slug, name)
- StatSnapshot: point-in-time metric values (valueCurrent, valuePrev, last1, last3, home, away, rank, seasonYear, timestamps)

### Key API Routes

- `GET /api/health` – health check
- `POST /api/scrape` – triggers scrape (optional header `x-api-key` enforced if `SCRAPE_API_KEY` is set)
- `GET /api/categories` – list categories with latest snapshot metadata
- `GET /api/teams` – list teams
- `GET /api/team/[name]` – snapshots grouped by category for a specific team

### Local Development

1. Install deps: `npm install`
2. Set environment variables (create `.env.local`):
   - `DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require&pgbouncer=true`
   - `DIRECT_URL=postgresql://user:pass@host:5432/dbname?sslmode=require`
   - (optional) `SCRAPE_API_KEY=your-key`
3. Run database migrations / generate client:
   - `npm run prisma:migrate`
   - `npm run prisma:generate`
4. Start dev server: `npm run dev` (http://localhost:3000)
5. Trigger a scrape: `curl -X POST http://localhost:3000/api/scrape` (add header `x-api-key` if configured)

### Deployment (Vercel)

The project deploys as a Node (Next.js) app. Ensure the following env vars are configured in Vercel Project Settings:

- `DATABASE_URL` (Neon pooled URL, often contains `-pooler` host and `pgbouncer=true`)
- `DIRECT_URL` (Neon direct, non-pooled URL)
- `SCRAPE_API_KEY` (optional)

Build pipeline runs `prisma migrate deploy` before `next build` to apply migrations on the production DB automatically (see `vercel.json`).

To backfill production data after first deploy:

1. Trigger scrape on the deployed URL: `POST /api/scrape` (include header `x-api-key` if set)
2. Verify data: `GET /api/categories`, `GET /api/teams`, `GET /api/latest`

### Scraper Notes

Current implementation captures baseline metrics (rank + current value). Enhancements planned:

- Historical diff population (prevYear / valuePrev)
- Rolling windows (last1, last3)
- Home / away splits
- Retry & backoff, structured logging
- Scheduled invocation (Vercel cron or external scheduler)

### Contributing / Next Steps

Suggested improvements:

1. Resolve missing generated Prisma delegate typings (.prisma folder visibility issue) and remove any temporary `any` casts.
2. Add Jest tests for scraper normalization & API responses.
3. Add rate limiting & caching (e.g. incremental static regen for read-heavy endpoints).
4. Implement richer category metadata and UI filtering.
5. Add queue / job scheduling for periodic scraping.

### Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build (local only)
- `npm run vercel-build` – Production build for Vercel: `prisma migrate deploy && next build`
- `npm start` – Run built app
- `npm run lint` – Lint
- `npm run prisma:migrate` – Run dev migration (creates new migration)
- `npm run prisma:generate` – Regenerate Prisma client
- `npm test` – Jest tests (placeholder)

### Environment & Safety

- Never commit real API keys or private database credentials.
- Use a separate database/schema for local development.

### License

Internal / personal project (no license specified). Add a LICENSE file if external contribution is desired.

---

Legacy CRA boilerplate removed in favor of current stack documentation.
