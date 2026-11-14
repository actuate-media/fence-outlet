-- #784: 0012 renames a fixed table list, then renames every actuate_-prefixed
-- index, constraint, and sequence. Hand-created collaboration tables (#729)
-- were not in that list, so they stayed actuate_document_* while their
-- indexes became prenta_*. 0013 then CREATE TABLE prenta_document_* and
-- collides with those index names, so migrate deploy stops and the rows
-- never move.
--
-- Rename any leftover actuate_* table onto prenta_*. If 0013 already created
-- an empty twin, drop the twin first so the table that holds the data takes
-- the canonical name. Refuse when both copies already have rows.
-- Then repeat 0012's prefix sweep for anything still named actuate_*.
--
-- A deploy stuck on 0013 ("already exists") should run this file once, then
-- re-run `prisma migrate deploy`. After the rename, 0013's
-- CREATE TABLE IF NOT EXISTS is a no-op and this migration runs again as one.

DO $$
DECLARE
  r RECORD;
  target text;
  twin_rows bigint;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'actuate\_%'
    ORDER BY tablename
  LOOP
    target := replace(r.tablename, 'actuate_', 'prenta_');

    IF EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public' AND tablename = target
    ) THEN
      EXECUTE format('SELECT count(*) FROM %I', target) INTO twin_rows;
      IF twin_rows > 0 THEN
        RAISE EXCEPTION
          'refusing to rename % onto %: both tables have rows',
          r.tablename, target;
      END IF;
      EXECUTE format('DROP TABLE %I CASCADE', target);
    END IF;

    EXECUTE format('ALTER TABLE %I RENAME TO %I', r.tablename, target);
  END LOOP;

  FOR r IN
    SELECT con.conname, con.conrelid::regclass AS tbl
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND con.conname LIKE '%actuate\_%'
  LOOP
    EXECUTE format(
      'ALTER TABLE %s RENAME CONSTRAINT %I TO %I',
      r.tbl, r.conname, replace(r.conname, 'actuate_', 'prenta_')
    );
  END LOOP;

  FOR r IN
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE '%actuate\_%'
  LOOP
    EXECUTE format(
      'ALTER INDEX %I RENAME TO %I',
      r.indexname, replace(r.indexname, 'actuate_', 'prenta_')
    );
  END LOOP;

  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'S' AND c.relname LIKE '%actuate\_%'
  LOOP
    EXECUTE format(
      'ALTER SEQUENCE %I RENAME TO %I',
      r.relname, replace(r.relname, 'actuate_', 'prenta_')
    );
  END LOOP;
END $$;
