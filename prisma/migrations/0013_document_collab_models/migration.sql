-- Collab / comments / notifications models that cms-core already queries
-- (#729). Hosts that declared these by hand keep their data; IF NOT EXISTS
-- lets migrate deploy succeed when the unmapped tables already exist under
-- Prisma's default names — those hosts should rename onto the prenta_* maps
-- in a follow-up if they still use the old names.

CREATE TABLE IF NOT EXISTS "prenta_document_crdts" (
    "documentId" TEXT NOT NULL,
    "state" BYTEA NOT NULL,
    "stateVector" BYTEA NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prenta_document_crdts_pkey" PRIMARY KEY ("documentId")
);

CREATE INDEX IF NOT EXISTS "prenta_document_crdts_lastUpdatedAt_idx" ON "prenta_document_crdts"("lastUpdatedAt");

CREATE TABLE IF NOT EXISTS "prenta_document_comments" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "parentId" TEXT,
    "userId" TEXT,
    "body" TEXT NOT NULL,
    "anchor" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_document_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "prenta_document_comments_documentId_idx" ON "prenta_document_comments"("documentId");
CREATE INDEX IF NOT EXISTS "prenta_document_comments_documentId_resolvedAt_idx" ON "prenta_document_comments"("documentId", "resolvedAt");
CREATE INDEX IF NOT EXISTS "prenta_document_comments_parentId_idx" ON "prenta_document_comments"("parentId");
CREATE INDEX IF NOT EXISTS "prenta_document_comments_userId_idx" ON "prenta_document_comments"("userId");
CREATE INDEX IF NOT EXISTS "prenta_document_comments_createdAt_idx" ON "prenta_document_comments"("createdAt");

ALTER TABLE "prenta_document_comments" DROP CONSTRAINT IF EXISTS "prenta_document_comments_parentId_fkey";
ALTER TABLE "prenta_document_comments" ADD CONSTRAINT "prenta_document_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "prenta_document_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "prenta_document_comments" DROP CONSTRAINT IF EXISTS "prenta_document_comments_userId_fkey";
ALTER TABLE "prenta_document_comments" ADD CONSTRAINT "prenta_document_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "prenta_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "prenta_document_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "documentId" TEXT,
    "commentId" TEXT,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prenta_document_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "prenta_document_notifications_userId_readAt_idx" ON "prenta_document_notifications"("userId", "readAt");
CREATE INDEX IF NOT EXISTS "prenta_document_notifications_userId_createdAt_idx" ON "prenta_document_notifications"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "prenta_document_notifications_documentId_idx" ON "prenta_document_notifications"("documentId");
CREATE INDEX IF NOT EXISTS "prenta_document_notifications_commentId_idx" ON "prenta_document_notifications"("commentId");

ALTER TABLE "prenta_document_notifications" DROP CONSTRAINT IF EXISTS "prenta_document_notifications_userId_fkey";
ALTER TABLE "prenta_document_notifications" ADD CONSTRAINT "prenta_document_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "prenta_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
