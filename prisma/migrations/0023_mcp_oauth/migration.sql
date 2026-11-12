-- MCP OAuth grants. Codes and refresh tokens are stored as hashes.

CREATE TABLE "prenta_mcp_oauth_grants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "codeChallenge" TEXT NOT NULL,
    "codeHash" TEXT,
    "codeExpiresAt" TIMESTAMP(3),
    "codeConsumedAt" TIMESTAMP(3),
    "refreshHash" TEXT,
    "refreshExpiresAt" TIMESTAMP(3),
    "familyId" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prenta_mcp_oauth_grants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prenta_mcp_oauth_grants_codeHash_key" ON "prenta_mcp_oauth_grants"("codeHash");
CREATE UNIQUE INDEX "prenta_mcp_oauth_grants_refreshHash_key" ON "prenta_mcp_oauth_grants"("refreshHash");
CREATE INDEX "prenta_mcp_oauth_grants_userId_idx" ON "prenta_mcp_oauth_grants"("userId");
CREATE INDEX "prenta_mcp_oauth_grants_familyId_idx" ON "prenta_mcp_oauth_grants"("familyId");
CREATE INDEX "prenta_mcp_oauth_grants_clientId_idx" ON "prenta_mcp_oauth_grants"("clientId");

ALTER TABLE "prenta_mcp_oauth_grants" ADD CONSTRAINT "prenta_mcp_oauth_grants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "prenta_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "prenta_mcp_oauth_refresh_replays" (
    "hash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prenta_mcp_oauth_refresh_replays_pkey" PRIMARY KEY ("hash")
);

CREATE INDEX "prenta_mcp_oauth_refresh_replays_familyId_idx" ON "prenta_mcp_oauth_refresh_replays"("familyId");
