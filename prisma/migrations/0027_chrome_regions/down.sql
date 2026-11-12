-- Down-migration for 0027_chrome_regions. Prisma Migrate has no down
-- migrations, so run this by hand, with the pre-0027 code deployed:
--
--   prisma db execute --file prisma/migrations/0027_chrome_regions/down.sql
--
-- Then remove 0027 from the history so `migrate deploy` can apply it again:
--
--   DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0027_chrome_regions';
--
-- (If 0027 failed part-way, use `prisma migrate resolve --rolled-back
-- 0027_chrome_regions` instead of the DELETE.)
--
-- The header and footer schemas, their saved values and orphans, and the
-- announcement bar are lost with the table. The next `prenta push chrome`
-- after 0027 is applied again reads the schema back; the values have to be
-- entered again. Page overrides live on the pages (`_layout`) and are kept.
-- The statement uses IF EXISTS so it is safe to run twice.

BEGIN;

-- DropTable
DROP TABLE IF EXISTS "prenta_chrome_regions";

COMMIT;
