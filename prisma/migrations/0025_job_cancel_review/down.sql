-- Down-migration for 0025_job_cancel_review. Prisma Migrate has no down
-- migrations, so run this by hand, with the job worker stopped and the
-- pre-0025 code deployed:
--
--   prisma db execute --file prisma/migrations/0025_job_cancel_review/down.sql
--
-- Then remove 0025 from the history so `migrate deploy` can apply it again:
--
--   DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0025_job_cancel_review';
--
-- (If 0025 failed part-way, use `prisma migrate resolve --rolled-back
-- 0025_job_cancel_review` instead of the DELETE.)
--
-- `status` is plain TEXT, so `cancelled` has no enum value to drop. Code before
-- 0025 reads any unknown status as `queued`, so cancelled rows move to `dead`,
-- the dead-letter that is never claimed again. The cancel columns go away, so
-- the reason is kept in `lastError` when that is empty. A pending cancel on a
-- running job is lost.
--
-- Job events and review items are dropped with their tables. Every statement
-- uses IF EXISTS so a part-applied 0025 rolls back too.

BEGIN;

-- RemapStatus
UPDATE "prenta_jobs"
SET "status" = 'dead', "lastError" = COALESCE("lastError", 'Cancelled')
WHERE "status" = 'cancelled';

-- DropForeignKey
ALTER TABLE IF EXISTS "prenta_job_review_items" DROP CONSTRAINT IF EXISTS "prenta_job_review_items_jobId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "prenta_job_events" DROP CONSTRAINT IF EXISTS "prenta_job_events_jobId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "prenta_job_review_items_jobId_status_idx";

-- DropIndex
DROP INDEX IF EXISTS "prenta_job_events_jobId_at_idx";

-- DropTable
DROP TABLE IF EXISTS "prenta_job_review_items";

-- DropTable
DROP TABLE IF EXISTS "prenta_job_events";

-- AlterTable
ALTER TABLE "prenta_jobs" DROP COLUMN IF EXISTS "finishedAt",
DROP COLUMN IF EXISTS "results",
DROP COLUMN IF EXISTS "summary",
DROP COLUMN IF EXISTS "explain",
DROP COLUMN IF EXISTS "tokensOut",
DROP COLUMN IF EXISTS "tokensIn",
DROP COLUMN IF EXISTS "scope",
DROP COLUMN IF EXISTS "title",
DROP COLUMN IF EXISTS "cancelledById",
DROP COLUMN IF EXISTS "cancelRequestedAt";

COMMIT;
