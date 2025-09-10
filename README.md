5. Trigger a scrape: `curl -X POST http://localhost:3000/api/scrape` (add header `x-api-key` if configured)
6. (Optional) Run seed without starting server (build first):
   - `npm run build`
   - `npm run seed`

### Dedupe Logic
Scraper skips inserting a snapshot if an entry with identical `valueCurrent` and `rank` for the same team & category exists in the last hour. A supporting minute-level unique index prevents burst duplicates.
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
   - `DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public`
   - (optional) `SCRAPE_API_KEY=your-key`
3. Run database migrations / generate client:
   - `npm run prisma:migrate`
   - `npm run prisma:generate`
4. Start dev server: `npm run dev` (http://localhost:3000)
5. Trigger a scrape: `curl -X POST http://localhost:3000/api/scrape` (add header `x-api-key` if configured)

### Deployment (Vercel)

The project deploys as a Node (Next.js) app. Python artifacts were removed; `.vercelignore` trimmed. Ensure `DATABASE_URL` (and optional `SCRAPE_API_KEY`) are set in Vercel project settings. Prisma generates client during build automatically (`postinstall`).

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
- `npm run build` – Production build
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
