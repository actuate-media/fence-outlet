-- Design-parity delivery controls for script tags:
--   loadAsync         — inject `async` into external <script src> tags at resolve time
--   disableInPreview  — skip the tag when rendering inside CMS preview mode
--   consentCategory   — cookie-consent gate (none | analytics | marketing | functional | preferences)
ALTER TABLE "actuate_script_tags"
  ADD COLUMN "loadAsync" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "disableInPreview" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "consentCategory" TEXT NOT NULL DEFAULT 'none';
