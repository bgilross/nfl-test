-- Initial schema migration

CREATE TABLE "Team" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL
);

CREATE TABLE "StatSnapshot" (
    "id" SERIAL PRIMARY KEY,
    "teamId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "seasonYear" INTEGER,
    "currentYear" INTEGER,
    "prevYear" INTEGER,
    "valueCurrent" DOUBLE PRECISION,
    "valuePrev" DOUBLE PRECISION,
    "last1" DOUBLE PRECISION,
    "last3" DOUBLE PRECISION,
    "home" DOUBLE PRECISION,
    "away" DOUBLE PRECISION,
    "rank" INTEGER,
    CONSTRAINT "StatSnapshot_team_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StatSnapshot_category_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "StatSnapshot_team_category_created_idx" ON "StatSnapshot" ("teamId", "categoryId", "createdAt");
CREATE INDEX "StatSnapshot_category_season_idx" ON "StatSnapshot" ("categoryId", "seasonYear");
