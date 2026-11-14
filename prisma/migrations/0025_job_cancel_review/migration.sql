-- AlterTable
ALTER TABLE "prenta_jobs" ADD COLUMN "cancelRequestedAt" TIMESTAMP(3),
ADD COLUMN "cancelledById" TEXT,
ADD COLUMN "title" TEXT,
ADD COLUMN "scope" TEXT,
ADD COLUMN "tokensIn" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "tokensOut" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "explain" TEXT,
ADD COLUMN "summary" TEXT,
ADD COLUMN "results" JSONB,
ADD COLUMN "finishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "prenta_job_events" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "detail" TEXT,
    "durationMs" INTEGER,
    "tokens" INTEGER,

    CONSTRAINT "prenta_job_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prenta_job_review_items" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentTitle" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "field" TEXT NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    "editedAfter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "appliedRevisionId" TEXT,

    CONSTRAINT "prenta_job_review_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prenta_job_events_jobId_at_idx" ON "prenta_job_events"("jobId", "at");

-- CreateIndex
CREATE INDEX "prenta_job_review_items_jobId_status_idx" ON "prenta_job_review_items"("jobId", "status");

-- AddForeignKey
ALTER TABLE "prenta_job_events" ADD CONSTRAINT "prenta_job_events_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "prenta_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prenta_job_review_items" ADD CONSTRAINT "prenta_job_review_items_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "prenta_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
