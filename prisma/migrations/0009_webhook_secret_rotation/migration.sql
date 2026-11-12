-- AlterTable: grace-window previous secrets for webhook rotation (#679)
ALTER TABLE "actuate_form_webhooks" ADD COLUMN IF NOT EXISTS "previousSecret" TEXT;
ALTER TABLE "actuate_form_webhooks" ADD COLUMN IF NOT EXISTS "previousSecretValidUntil" TIMESTAMP(3);

ALTER TABLE "actuate_webhook_endpoints" ADD COLUMN IF NOT EXISTS "previousSecret" TEXT;
ALTER TABLE "actuate_webhook_endpoints" ADD COLUMN IF NOT EXISTS "previousSecretValidUntil" TIMESTAMP(3);
