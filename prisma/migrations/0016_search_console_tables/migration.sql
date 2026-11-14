-- Search Console + CrUX integration (spec: 2026-08-29-search-console-integration-design.md).
-- Two additive tables written by the nightly search sync:
--   prenta_search_perf_daily    — (date, path) GSC search analytics, 90-day rolling window
--   prenta_search_page_insights — per-page 28d totals/deltas, top-query snapshot, CrUX p75s
-- Dates are stored exactly as GSC reports them (property timezone), never converted to UTC.

CREATE TABLE "prenta_search_perf_daily" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prenta_search_perf_daily_pkey" PRIMARY KEY ("id")
);

-- Upsert key for the nightly sync (idempotent re-fetch of lagging days).
CREATE UNIQUE INDEX "prenta_search_perf_daily_date_path_key" ON "prenta_search_perf_daily"("date", "path");

-- Per-page trend queries (28d windows).
CREATE INDEX "prenta_search_perf_daily_path_idx" ON "prenta_search_perf_daily"("path");

CREATE TABLE "prenta_search_page_insights" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "topQueries" JSONB,
    "clicks28d" INTEGER NOT NULL DEFAULT 0,
    "impressions28d" INTEGER NOT NULL DEFAULT 0,
    "avgPosition28d" DOUBLE PRECISION,
    "clicksPrev28d" INTEGER NOT NULL DEFAULT 0,
    "impressionsPrev28d" INTEGER NOT NULL DEFAULT 0,
    "avgPositionPrev28d" DOUBLE PRECISION,
    "lcpMs" INTEGER,
    "inpMs" INTEGER,
    "cls" DOUBLE PRECISION,
    "cwvStatus" TEXT,
    "cwvCollectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_search_page_insights_pkey" PRIMARY KEY ("id")
);

-- One insight row per normalized path.
CREATE UNIQUE INDEX "prenta_search_page_insights_path_key" ON "prenta_search_page_insights"("path");

-- "Top pages by impressions" ordering (overview table, CrUX rotation).
CREATE INDEX "prenta_search_page_insights_impressions28d_idx" ON "prenta_search_page_insights"("impressions28d");

-- Document-scoped lookups (editor pane, AI prompt context).
CREATE INDEX "prenta_search_page_insights_entityId_idx" ON "prenta_search_page_insights"("entityId");
