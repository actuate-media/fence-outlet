-- Hot list and retention paths (#399).
-- ContentLock.documentId is already unique (prenta_content_locks_documentId_key).

CREATE INDEX IF NOT EXISTS "prenta_documents_collection_deletedAt_status_idx"
  ON "prenta_documents" ("collection", "deletedAt", "status");

CREATE INDEX IF NOT EXISTS "prenta_versions_createdAt_idx"
  ON "prenta_versions" ("createdAt");

CREATE INDEX IF NOT EXISTS "prenta_seo_issues_entityId_idx"
  ON "prenta_seo_issues" ("entityId");
