-- Add partial unique index to reduce duplicate rapid inserts for identical metric snapshots within a short period
-- (Not strictly enforcing hour window in DB; using date + basic uniqueness to limit exact repeats per minute)

CREATE UNIQUE INDEX IF NOT EXISTS "StatSnapshot_dedupe_idx" ON "StatSnapshot" ("teamId", "categoryId", date_trunc('minute', "createdAt"), COALESCE("valueCurrent", -999999), COALESCE("rank", -1));
