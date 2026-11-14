-- AI crawler activity panel: aggregated per-(bot, surface) hit counters for the
-- llms.txt / llms-full.txt / per-page .md surfaces (plus an optional honeypot).
-- Stored aggregated (one row per bot+surface, upserted on hit) so the table
-- stays bounded and needs no periodic pruning.
CREATE TABLE "actuate_ai_crawler_hits" (
    "id" TEXT NOT NULL,
    "bot" TEXT NOT NULL,
    "surface" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "hits" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_ai_crawler_hits_pkey" PRIMARY KEY ("id")
);

-- One aggregate row per bot token + surface.
CREATE UNIQUE INDEX "actuate_ai_crawler_hits_bot_surface_key" ON "actuate_ai_crawler_hits"("bot", "surface");

-- Supports "recently active" ordering in the admin panel.
CREATE INDEX "actuate_ai_crawler_hits_lastSeenAt_idx" ON "actuate_ai_crawler_hits"("lastSeenAt");
