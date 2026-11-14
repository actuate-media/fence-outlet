-- AlterTable
ALTER TABLE "prenta_jobs" ADD COLUMN "createdById" TEXT;

-- CreateTable
CREATE TABLE "prenta_system_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "prenta_jobs_createdAt_idx" ON "prenta_jobs"("createdAt");
