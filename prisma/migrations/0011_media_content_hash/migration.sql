-- SHA-256 of final stored bytes for upload dedupe (#718).
ALTER TABLE "actuate_media" ADD COLUMN "contentHash" TEXT;

CREATE INDEX "actuate_media_contentHash_idx" ON "actuate_media"("contentHash");
