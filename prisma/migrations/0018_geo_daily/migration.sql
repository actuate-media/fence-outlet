-- GEO measurement daily buckets (spec: 2026-09-08-geo-measurement-design.md §4).
-- Additive; no backfill. Both tables are optional for consumers (hasModel-guarded).

CREATE TABLE "prenta_geo_crawl_daily" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "bot" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_geo_crawl_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prenta_geo_crawl_daily_date_bot_path_key" ON "prenta_geo_crawl_daily"("date", "bot", "path");
CREATE INDEX "prenta_geo_crawl_daily_date_idx" ON "prenta_geo_crawl_daily"("date");
CREATE INDEX "prenta_geo_crawl_daily_bot_date_idx" ON "prenta_geo_crawl_daily"("bot", "date");

CREATE TABLE "prenta_geo_referral_daily" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "engine" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_geo_referral_daily_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prenta_geo_referral_daily_date_engine_path_key" ON "prenta_geo_referral_daily"("date", "engine", "path");
CREATE INDEX "prenta_geo_referral_daily_date_idx" ON "prenta_geo_referral_daily"("date");
CREATE INDEX "prenta_geo_referral_daily_engine_date_idx" ON "prenta_geo_referral_daily"("engine", "date");
