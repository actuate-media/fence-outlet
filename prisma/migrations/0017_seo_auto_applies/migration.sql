-- SEO Autopilot ledger (spec: 2026-09-07-auto-apply-policy-engine-design.md §4).
-- One row per unattended write. Additive; no backfill.

CREATE TABLE "prenta_seo_auto_applies" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "issueId" TEXT,
    "issueType" TEXT NOT NULL,
    "entityId" TEXT,
    "collection" TEXT,
    "path" TEXT,
    "redirectId" TEXT,
    "before" JSONB,
    "after" JSONB NOT NULL,
    "gate" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'pending',
    "outcomeMetrics" JSONB,
    "outcomeCheckedAt" TIMESTAMP(3),
    "versionId" TEXT,
    "appliedById" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revertedAt" TIMESTAMP(3),
    "revertedById" TEXT,
    "revertReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_seo_auto_applies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prenta_seo_auto_applies_status_appliedAt_idx" ON "prenta_seo_auto_applies"("status", "appliedAt");
CREATE INDEX "prenta_seo_auto_applies_entityId_idx" ON "prenta_seo_auto_applies"("entityId");
CREATE INDEX "prenta_seo_auto_applies_outcome_appliedAt_idx" ON "prenta_seo_auto_applies"("outcome", "appliedAt");
CREATE INDEX "prenta_seo_auto_applies_issueId_idx" ON "prenta_seo_auto_applies"("issueId");
