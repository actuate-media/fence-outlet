-- Per-submission form notify/webhook/email delivery attempts (#675).
CREATE TABLE "actuate_form_delivery_attempts" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "webhookId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "error" TEXT,
    "responseStatus" INTEGER,
    "skippedReason" TEXT,
    "payload" JSONB,
    "alertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_form_delivery_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "actuate_form_delivery_attempts_formId_status_idx" ON "actuate_form_delivery_attempts"("formId", "status");
CREATE INDEX "actuate_form_delivery_attempts_submissionId_idx" ON "actuate_form_delivery_attempts"("submissionId");
CREATE INDEX "actuate_form_delivery_attempts_status_nextRetryAt_idx" ON "actuate_form_delivery_attempts"("status", "nextRetryAt");

ALTER TABLE "actuate_form_delivery_attempts" ADD CONSTRAINT "actuate_form_delivery_attempts_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "actuate_form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
