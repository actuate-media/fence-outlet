-- CreateTable
CREATE TABLE "prenta_chrome_regions" (
    "region" TEXT NOT NULL,
    "schema" JSONB,
    "schemaHash" TEXT,
    "variant" TEXT,
    "values" JSONB NOT NULL DEFAULT '{}',
    "orphans" JSONB NOT NULL DEFAULT '[]',
    "state" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_chrome_regions_pkey" PRIMARY KEY ("region")
);
