-- Down-migration for 0026_job_creator_system_settings. Prisma Migrate has no
-- down migrations, so run this by hand, with the job worker stopped and the
-- pre-0026 code deployed:
--
--   prisma db execute --file prisma/migrations/0026_job_creator_system_settings/down.sql
--
-- Then remove 0026 from the history so `migrate deploy` can apply it again:
--
--   DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0026_job_creator_system_settings';
--
-- (If 0026 failed part-way, use `prisma migrate resolve --rolled-back
-- 0026_job_creator_system_settings` instead of the DELETE.)
--
-- Who queued each job is lost, so the Jobs screen shows those rows as cron
-- jobs again. The worker's last-tick time is lost with its table and comes
-- back on the next tick. Every statement uses IF EXISTS so a part-applied
-- 0026 rolls back too.

BEGIN;

-- DropIndex
DROP INDEX IF EXISTS "prenta_jobs_createdAt_idx";

-- DropTable
DROP TABLE IF EXISTS "prenta_system_settings";

-- AlterTable
ALTER TABLE "prenta_jobs" DROP COLUMN IF EXISTS "createdById";

COMMIT;
