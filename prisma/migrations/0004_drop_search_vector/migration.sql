-- searchVector was never written by the application. Full-text search uses
-- plainText + title via to_tsvector() and idx_actuate_documents_fts (see
-- packages/cms-core/src/search/index.ts).
ALTER TABLE "actuate_documents" DROP COLUMN IF EXISTS "searchVector";
