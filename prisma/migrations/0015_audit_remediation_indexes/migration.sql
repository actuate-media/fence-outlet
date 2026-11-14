-- Audit remediation (PERF-1/2/3/10, SEC-M1, QUAL-1).
-- Prefer transactional CREATE INDEX (not CONCURRENTLY) so `prisma migrate`
-- can run this in one transaction. For large production DBs, operators may
-- apply the equivalent `CREATE INDEX CONCURRENTLY` statements out of band.

DO $$
BEGIN
  -- PGlite and slim Postgres images have no contrib package; skip rather
  -- than fail the whole migration. Real hosts with postgresql-contrib
  -- still get pg_trgm + the GIN indexes below.
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_trgm') THEN
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  ELSE
    RAISE NOTICE 'pg_trgm skipped (extension not available)';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'pg_trgm skipped (insufficient privilege)';
  WHEN undefined_file THEN
    RAISE NOTICE 'pg_trgm skipped (extension files not present)';
  WHEN feature_not_supported THEN
    RAISE NOTICE 'pg_trgm skipped (not supported on this server)';
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm skipped (%)', SQLERRM;
END
$$;

-- Document search + live list (no partial index on status — measured regression).
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS ix_doc_plain_text_trgm
    ON "prenta_documents" USING GIN ("plainText" gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS ix_doc_title_trgm
    ON "prenta_documents" USING GIN ("title" gin_trgm_ops);
EXCEPTION
  WHEN undefined_object THEN
    RAISE NOTICE 'pg_trgm GIN indexes skipped (operator class unavailable)';
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm GIN indexes skipped (%)', SQLERRM;
END
$$;
CREATE INDEX IF NOT EXISTS ix_doc_coll_live_updated
  ON "prenta_documents" ("collection", "updatedAt" DESC)
  WHERE "deletedAt" IS NULL;

-- Hash session JWTs at rest (skip rows that already look like SHA-256 hex).
UPDATE "prenta_sessions"
SET "token" = encode(sha256(convert_to("token", 'UTF8')), 'hex')
WHERE "token" LIKE '%.%.%';

-- FormSubmission: drop boolean indexes, add unread-badge + (formId, submittedAt).
DROP INDEX IF EXISTS "prenta_form_submissions_unread_idx";
DROP INDEX IF EXISTS "prenta_form_submissions_starred_idx";
DROP INDEX IF EXISTS "prenta_form_submissions_archived_idx";
DROP INDEX IF EXISTS "prenta_form_submissions_status_idx";
DROP INDEX IF EXISTS "prenta_form_submissions_spamStatus_idx";
CREATE INDEX IF NOT EXISTS ix_form_sub_unread_badge
  ON "prenta_form_submissions" ("formId")
  WHERE "unread" = true AND "archived" = false;
CREATE INDEX IF NOT EXISTS "prenta_form_submissions_formId_submittedAt_idx"
  ON "prenta_form_submissions" ("formId", "submittedAt" DESC);

-- ContentLock / notifications / API keys
DELETE FROM "prenta_content_locks" t
WHERE t.ctid NOT IN (
  SELECT min(ctid) FROM "prenta_content_locks" GROUP BY "documentId"
);
CREATE UNIQUE INDEX IF NOT EXISTS "prenta_content_locks_documentId_key"
  ON "prenta_content_locks" ("documentId");
CREATE INDEX IF NOT EXISTS "prenta_notifications_userId_idx"
  ON "prenta_notifications" ("userId");
CREATE INDEX IF NOT EXISTS "prenta_api_keys_userId_idx"
  ON "prenta_api_keys" ("userId");

-- Remove unused multi-site / backup / workflow stubs (QUAL-1).
DROP TABLE IF EXISTS "prenta_backup_records";
DROP TABLE IF EXISTS "prenta_workflow_states";
DROP TABLE IF EXISTS "prenta_sites";
ALTER TABLE "prenta_documents" DROP COLUMN IF EXISTS "siteId";
