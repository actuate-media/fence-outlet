CREATE TABLE "prenta_mcp_oauth_transactions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "codeChallenge" TEXT NOT NULL,
    "state" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prenta_mcp_oauth_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "prenta_mcp_oauth_transactions_expiresAt_idx" ON "prenta_mcp_oauth_transactions"("expiresAt");
