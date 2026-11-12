-- Rename MediaUsage.fieldName -> fieldPath so the column matches cms-core's API
-- layer, server actions, and `actuate doctor` schema expectations. The original
-- 0001_init created the column as "fieldName"; this brings existing databases in
-- line without data loss.
ALTER TABLE "actuate_media_usages" RENAME COLUMN "fieldName" TO "fieldPath";

-- Prisma derives the unique-index name from its columns, so recreate it under
-- the fieldPath name (a bare column rename leaves the old index name in place).
DROP INDEX "actuate_media_usages_mediaId_documentId_fieldName_key";

CREATE UNIQUE INDEX "actuate_media_usages_mediaId_documentId_fieldPath_key" ON "actuate_media_usages"("mediaId", "documentId", "fieldPath");
