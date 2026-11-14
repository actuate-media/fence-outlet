-- Persist the decorative-image verdict so empty alt is scored as intentional
-- WCAG treatment rather than missing-alt (#714).
ALTER TABLE "actuate_media" ADD COLUMN "isDecorative" BOOLEAN NOT NULL DEFAULT false;
