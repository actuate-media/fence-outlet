-- Product rename: ActuateCMS -> Prenta.
-- Renames every actuate_* table to prenta_*, then renames all actuate-prefixed
-- constraints, indexes, and sequences so physical names keep matching what
-- Prisma derives from the new @@map names (drift checks compare index names).
-- Fresh installs run 0001-0011 (which create actuate_* tables) and then this
-- rename; existing databases rename in place with no data movement.

ALTER TABLE "actuate_users" RENAME TO "prenta_users";
ALTER TABLE "actuate_oauth_accounts" RENAME TO "prenta_oauth_accounts";
ALTER TABLE "actuate_sessions" RENAME TO "prenta_sessions";
ALTER TABLE "actuate_api_keys" RENAME TO "prenta_api_keys";
ALTER TABLE "actuate_audit_logs" RENAME TO "prenta_audit_logs";
ALTER TABLE "actuate_folders" RENAME TO "prenta_folders";
ALTER TABLE "actuate_documents" RENAME TO "prenta_documents";
ALTER TABLE "actuate_versions" RENAME TO "prenta_versions";
ALTER TABLE "actuate_media" RENAME TO "prenta_media";
ALTER TABLE "actuate_media_usages" RENAME TO "prenta_media_usages";
ALTER TABLE "actuate_content_locks" RENAME TO "prenta_content_locks";
ALTER TABLE "actuate_notifications" RENAME TO "prenta_notifications";
ALTER TABLE "actuate_content_templates" RENAME TO "prenta_content_templates";
ALTER TABLE "actuate_sites" RENAME TO "prenta_sites";
ALTER TABLE "actuate_workflow_states" RENAME TO "prenta_workflow_states";
ALTER TABLE "actuate_redirects" RENAME TO "prenta_redirects";
ALTER TABLE "actuate_seo_audit_runs" RENAME TO "prenta_seo_audit_runs";
ALTER TABLE "actuate_seo_issues" RENAME TO "prenta_seo_issues";
ALTER TABLE "actuate_redirect_404_hits" RENAME TO "prenta_redirect_404_hits";
ALTER TABLE "actuate_ai_crawler_hits" RENAME TO "prenta_ai_crawler_hits";
ALTER TABLE "actuate_redirect_suggestions" RENAME TO "prenta_redirect_suggestions";
ALTER TABLE "actuate_form_schema_versions" RENAME TO "prenta_form_schema_versions";
ALTER TABLE "actuate_form_submissions" RENAME TO "prenta_form_submissions";
ALTER TABLE "actuate_form_submission_files" RENAME TO "prenta_form_submission_files";
ALTER TABLE "actuate_form_webhooks" RENAME TO "prenta_form_webhooks";
ALTER TABLE "actuate_form_delivery_attempts" RENAME TO "prenta_form_delivery_attempts";
ALTER TABLE "actuate_backup_records" RENAME TO "prenta_backup_records";
ALTER TABLE "actuate_webhook_endpoints" RENAME TO "prenta_webhook_endpoints";
ALTER TABLE "actuate_webhook_deliveries" RENAME TO "prenta_webhook_deliveries";
ALTER TABLE "actuate_password_reset_tokens" RENAME TO "prenta_password_reset_tokens";
ALTER TABLE "actuate_invites" RENAME TO "prenta_invites";
ALTER TABLE "actuate_script_tags" RENAME TO "prenta_script_tags";
ALTER TABLE "actuate_page_templates" RENAME TO "prenta_page_templates";
ALTER TABLE "actuate_saved_sections" RENAME TO "prenta_saved_sections";
ALTER TABLE "actuate_api_request_metrics" RENAME TO "prenta_api_request_metrics";
ALTER TABLE "actuate_content_issues" RENAME TO "prenta_content_issues";

-- Table renames keep the old constraint/index/sequence names. Prisma compares
-- physical names when diffing, so rename everything that carries the prefix.
DO $$
DECLARE r RECORD;
BEGIN
  -- Constraints first: renaming a constraint also renames its backing index
  -- (primary keys, unique constraints, foreign keys).
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

  -- Remaining indexes: plain @@index indexes and the raw-SQL FTS index
  -- (idx_actuate_documents_fts -> idx_prenta_documents_fts).
  FOR r IN
    SELECT indexname FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE '%actuate\_%'
  LOOP
    EXECUTE format(
      'ALTER INDEX %I RENAME TO %I',
      r.indexname, replace(r.indexname, 'actuate_', 'prenta_')
    );
  END LOOP;

  -- Sequences behind autoincrement columns.
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
