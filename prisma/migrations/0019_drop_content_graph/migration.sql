-- Roadmap item 8 (spec: 2026-09-14-ai-seo-consolidation-cleanup-design.md 3).
-- `contentGraph` was declared in 0001_init but never written or read by any
-- code path. The column has always been NULL, so this is data-free.
ALTER TABLE "prenta_documents" DROP COLUMN IF EXISTS "contentGraph";
