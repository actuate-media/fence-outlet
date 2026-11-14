-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED', 'SCHEDULED_UNPUBLISH');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'AUTHOR', 'CLIENT', 'OWNER', 'VIEWER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('CREATE', 'UPDATE', 'PUBLISH', 'RESTORE', 'DELETE');

-- CreateEnum
CREATE TYPE "AuditEvent" AS ENUM ('login_success', 'login_failed', 'logout', 'password_change', 'password_reset_request', 'password_reset_complete', 'totp_enabled', 'totp_disabled', 'api_key_created', 'api_key_revoked', 'document_created', 'document_updated', 'document_published', 'document_deleted', 'media_uploaded', 'media_deleted', 'user_created', 'user_updated', 'user_deactivated', 'settings_changed', 'version_restored', 'export_requested', 'import_completed');

-- CreateEnum
CREATE TYPE "ContentIssueType" AS ENUM ('MISSING_META_DESCRIPTION', 'MISSING_ALT_TEXT', 'BROKEN_INTERNAL_LINK', 'OUTDATED_CONTENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DOCUMENT_PUBLISHED', 'DOCUMENT_ASSIGNED', 'REVIEW_REQUESTED', 'REVIEW_APPROVED', 'COMMENT_ADDED', 'SYSTEM_ALERT', 'WORKFLOW_STEP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "WorkflowStage" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL', 'SUBSCRIPTION', 'BUNDLE');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "SeoAuditStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SeoIssueSeverity" AS ENUM ('critical', 'warning', 'info');

-- CreateEnum
CREATE TYPE "SeoIssueStatus" AS ENUM ('open', 'ignored', 'resolved', 'recurring');

-- CreateEnum
CREATE TYPE "SeoIssueCategory" AS ENUM ('content', 'technical', 'redirects', 'media', 'performance', 'schema', 'social', 'indexing');

-- CreateTable
CREATE TABLE "actuate_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AUTHOR',
    "passwordHash" TEXT,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" JSONB,
    "authProvider" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "suspendedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "forcePasswordReset" BOOLEAN NOT NULL DEFAULT false,
    "mfaRequired" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "invitedById" TEXT,
    "acceptedInviteAt" TIMESTAMP(3),

    CONSTRAINT "actuate_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_oauth_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_oauth_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "fingerprintHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "ipRestrictions" JSONB,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_audit_logs" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "parentId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_documents" (
    "id" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "title" TEXT,
    "slug" TEXT,
    "data" JSONB NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "locale" TEXT,
    "localeGroupId" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "scheduledUnpublishAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "searchVector" TEXT,
    "plainText" TEXT,
    "contentHash" TEXT,
    "structuredData" JSONB,
    "contentGraph" JSONB,
    "siteId" TEXT,
    "templateId" TEXT,
    "workflowStage" "WorkflowStage" NOT NULL DEFAULT 'DRAFT',
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "folderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "changedById" TEXT NOT NULL,
    "changeType" "ChangeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "title" TEXT,
    "uploadedById" TEXT NOT NULL,
    "focalPointX" DOUBLE PRECISION,
    "focalPointY" DOUBLE PRECISION,
    "blurHash" TEXT,
    "aiAltText" TEXT,
    "aiTags" JSONB,
    "aiDescription" TEXT,
    "folderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originalFileName" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "focusKeyword" TEXT,
    "tags" JSONB,
    "publicUrl" TEXT,
    "storageProvider" TEXT,
    "durationSeconds" DOUBLE PRECISION,
    "thumbnailUrl" TEXT,
    "responsiveVariants" JSONB,
    "status" "MediaStatus" NOT NULL DEFAULT 'READY',
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "actuate_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_media_usages" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_media_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_content_locks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_content_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_content_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "templateData" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_content_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_sites" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configOverrides" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_workflow_states" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "definition" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_workflow_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_redirects" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isRegex" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "preserveQuery" BOOLEAN NOT NULL DEFAULT false,
    "source_kind" TEXT NOT NULL DEFAULT 'manual',
    "hits" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_seo_audit_runs" (
    "id" TEXT NOT NULL,
    "status" "SeoAuditStatus" NOT NULL DEFAULT 'RUNNING',
    "scope" TEXT NOT NULL DEFAULT 'full',
    "startedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "siteScoreBefore" INTEGER,
    "siteScoreAfter" INTEGER,
    "pagesScanned" INTEGER NOT NULL DEFAULT 0,
    "issuesFound" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "infoCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "metadata" JSONB,

    CONSTRAINT "actuate_seo_audit_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_seo_issues" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT,
    "issueKey" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "entityTitle" TEXT,
    "url" TEXT,
    "severity" "SeoIssueSeverity" NOT NULL,
    "category" "SeoIssueCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "impact" TEXT,
    "recommendation" TEXT,
    "status" "SeoIssueStatus" NOT NULL DEFAULT 'open',
    "fixable" BOOLEAN NOT NULL DEFAULT false,
    "fixActionType" TEXT,
    "relatedEntityIds" JSONB,
    "source" TEXT NOT NULL DEFAULT 'audit',
    "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "metadata" JSONB,

    CONSTRAINT "actuate_seo_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_redirect_404_hits" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,
    "referrer" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_redirect_404_hits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_redirect_suggestions" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "source" TEXT NOT NULL DEFAULT 'ai-404-recovery',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_redirect_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_form_schema_versions" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "fields" JSONB NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_form_schema_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_form_submissions" (
    "id" TEXT NOT NULL,
    "entryNumber" INTEGER,
    "formId" TEXT NOT NULL,
    "schemaVersionId" TEXT,
    "data" JSONB NOT NULL,
    "normalizedData" JSONB,
    "attribution" JSONB,
    "senderName" TEXT,
    "senderEmail" TEXT,
    "senderPhone" TEXT,
    "preview" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "spamStatus" TEXT NOT NULL DEFAULT 'clean',
    "ipAddressHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "pageUrl" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_form_submission_files" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "secureDownloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_form_submission_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_form_webhooks" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "events" JSONB NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastDeliveryAt" TIMESTAMP(3),
    "lastDeliveryStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_form_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_backup_records" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_webhook_endpoints" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_webhook_deliveries" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "tokenHash" TEXT NOT NULL,
    "message" TEXT,
    "invitedByUserId" TEXT,
    "acceptedUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_script_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "targetPaths" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_script_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_page_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'content',
    "tree" JSONB NOT NULL,
    "thumbnail" TEXT,
    "builtIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_page_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_saved_sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'content',
    "tree" JSONB NOT NULL,
    "thumbnail" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_saved_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_api_request_metrics" (
    "id" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "route" TEXT NOT NULL,
    "statusBucket" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "sumLatencyMs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxLatencyMs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latencyHistogram" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actuate_api_request_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actuate_content_issues" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "type" "ContentIssueType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "details" JSONB,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actuate_content_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "actuate_users_email_key" ON "actuate_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_oauth_accounts_provider_providerAccountId_key" ON "actuate_oauth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_sessions_token_key" ON "actuate_sessions"("token");

-- CreateIndex
CREATE INDEX "actuate_sessions_userId_idx" ON "actuate_sessions"("userId");

-- CreateIndex
CREATE INDEX "actuate_sessions_expiresAt_idx" ON "actuate_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_api_keys_keyHash_key" ON "actuate_api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "actuate_audit_logs_event_idx" ON "actuate_audit_logs"("event");

-- CreateIndex
CREATE INDEX "actuate_audit_logs_userId_idx" ON "actuate_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "actuate_audit_logs_timestamp_idx" ON "actuate_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "actuate_folders_scope_idx" ON "actuate_folders"("scope");

-- CreateIndex
CREATE INDEX "actuate_folders_parentId_idx" ON "actuate_folders"("parentId");

-- CreateIndex
CREATE INDEX "actuate_documents_collection_idx" ON "actuate_documents"("collection");

-- CreateIndex
CREATE INDEX "actuate_documents_status_idx" ON "actuate_documents"("status");

-- CreateIndex
CREATE INDEX "actuate_documents_deletedAt_idx" ON "actuate_documents"("deletedAt");

-- CreateIndex
CREATE INDEX "actuate_documents_publishedAt_idx" ON "actuate_documents"("publishedAt");

-- CreateIndex
CREATE INDEX "actuate_documents_folderId_idx" ON "actuate_documents"("folderId");

-- CreateIndex
CREATE INDEX "actuate_documents_scheduledAt_idx" ON "actuate_documents"("scheduledAt");

-- CreateIndex
CREATE INDEX "actuate_documents_localeGroupId_idx" ON "actuate_documents"("localeGroupId");

-- CreateIndex
CREATE INDEX "actuate_documents_createdById_idx" ON "actuate_documents"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_documents_collection_slug_key" ON "actuate_documents"("collection", "slug");

-- CreateIndex
CREATE INDEX "actuate_versions_documentId_idx" ON "actuate_versions"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_media_storageKey_key" ON "actuate_media"("storageKey");

-- CreateIndex
CREATE INDEX "actuate_media_folderId_idx" ON "actuate_media"("folderId");

-- CreateIndex
CREATE INDEX "actuate_media_deletedAt_idx" ON "actuate_media"("deletedAt");

-- CreateIndex
CREATE INDEX "actuate_media_mimeType_idx" ON "actuate_media"("mimeType");

-- CreateIndex
CREATE INDEX "actuate_media_usages_documentId_idx" ON "actuate_media_usages"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_media_usages_mediaId_documentId_fieldName_key" ON "actuate_media_usages"("mediaId", "documentId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_sites_domain_key" ON "actuate_sites"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_workflow_states_documentId_key" ON "actuate_workflow_states"("documentId");

-- CreateIndex
CREATE INDEX "actuate_redirects_enabled_idx" ON "actuate_redirects"("enabled");

-- CreateIndex
CREATE INDEX "actuate_redirects_lastHitAt_idx" ON "actuate_redirects"("lastHitAt");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_redirects_source_key" ON "actuate_redirects"("source");

-- CreateIndex
CREATE INDEX "actuate_seo_audit_runs_status_idx" ON "actuate_seo_audit_runs"("status");

-- CreateIndex
CREATE INDEX "actuate_seo_audit_runs_startedAt_idx" ON "actuate_seo_audit_runs"("startedAt");

-- CreateIndex
CREATE INDEX "actuate_seo_issues_auditRunId_idx" ON "actuate_seo_issues"("auditRunId");

-- CreateIndex
CREATE INDEX "actuate_seo_issues_status_idx" ON "actuate_seo_issues"("status");

-- CreateIndex
CREATE INDEX "actuate_seo_issues_severity_idx" ON "actuate_seo_issues"("severity");

-- CreateIndex
CREATE INDEX "actuate_seo_issues_category_idx" ON "actuate_seo_issues"("category");

-- CreateIndex
CREATE INDEX "actuate_seo_issues_issueKey_idx" ON "actuate_seo_issues"("issueKey");

-- CreateIndex
CREATE INDEX "actuate_redirect_404_hits_lastSeenAt_idx" ON "actuate_redirect_404_hits"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_redirect_404_hits_path_key" ON "actuate_redirect_404_hits"("path");

-- CreateIndex
CREATE INDEX "actuate_redirect_suggestions_status_idx" ON "actuate_redirect_suggestions"("status");

-- CreateIndex
CREATE INDEX "actuate_redirect_suggestions_fromPath_idx" ON "actuate_redirect_suggestions"("fromPath");

-- CreateIndex
CREATE INDEX "actuate_form_schema_versions_formId_idx" ON "actuate_form_schema_versions"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_form_schema_versions_formId_version_key" ON "actuate_form_schema_versions"("formId", "version");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_formId_idx" ON "actuate_form_submissions"("formId");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_status_idx" ON "actuate_form_submissions"("status");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_unread_idx" ON "actuate_form_submissions"("unread");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_starred_idx" ON "actuate_form_submissions"("starred");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_archived_idx" ON "actuate_form_submissions"("archived");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_spamStatus_idx" ON "actuate_form_submissions"("spamStatus");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_submittedAt_idx" ON "actuate_form_submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "actuate_form_submissions_senderEmail_idx" ON "actuate_form_submissions"("senderEmail");

-- CreateIndex
CREATE INDEX "actuate_form_submission_files_submissionId_idx" ON "actuate_form_submission_files"("submissionId");

-- CreateIndex
CREATE INDEX "actuate_form_webhooks_formId_idx" ON "actuate_form_webhooks"("formId");

-- CreateIndex
CREATE INDEX "actuate_webhook_deliveries_endpointId_idx" ON "actuate_webhook_deliveries"("endpointId");

-- CreateIndex
CREATE INDEX "actuate_webhook_deliveries_status_idx" ON "actuate_webhook_deliveries"("status");

-- CreateIndex
CREATE INDEX "actuate_webhook_deliveries_nextRetryAt_idx" ON "actuate_webhook_deliveries"("nextRetryAt");

-- CreateIndex
CREATE INDEX "actuate_password_reset_tokens_tokenHash_idx" ON "actuate_password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "actuate_password_reset_tokens_userId_idx" ON "actuate_password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "actuate_invites_email_idx" ON "actuate_invites"("email");

-- CreateIndex
CREATE INDEX "actuate_invites_tokenHash_idx" ON "actuate_invites"("tokenHash");

-- CreateIndex
CREATE INDEX "actuate_invites_status_idx" ON "actuate_invites"("status");

-- CreateIndex
CREATE INDEX "actuate_script_tags_enabled_idx" ON "actuate_script_tags"("enabled");

-- CreateIndex
CREATE INDEX "actuate_script_tags_placement_idx" ON "actuate_script_tags"("placement");

-- CreateIndex
CREATE INDEX "actuate_page_templates_category_idx" ON "actuate_page_templates"("category");

-- CreateIndex
CREATE INDEX "actuate_page_templates_builtIn_idx" ON "actuate_page_templates"("builtIn");

-- CreateIndex
CREATE INDEX "actuate_saved_sections_category_idx" ON "actuate_saved_sections"("category");

-- CreateIndex
CREATE INDEX "actuate_api_request_metrics_bucketStart_idx" ON "actuate_api_request_metrics"("bucketStart");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_api_request_metrics_bucketStart_route_statusBucket_key" ON "actuate_api_request_metrics"("bucketStart", "route", "statusBucket");

-- CreateIndex
CREATE INDEX "actuate_content_issues_type_idx" ON "actuate_content_issues"("type");

-- CreateIndex
CREATE INDEX "actuate_content_issues_documentId_idx" ON "actuate_content_issues"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "actuate_content_issues_documentId_type_key" ON "actuate_content_issues"("documentId", "type");

-- AddForeignKey
ALTER TABLE "actuate_oauth_accounts" ADD CONSTRAINT "actuate_oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "actuate_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_sessions" ADD CONSTRAINT "actuate_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "actuate_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_api_keys" ADD CONSTRAINT "actuate_api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "actuate_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_folders" ADD CONSTRAINT "actuate_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "actuate_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_documents" ADD CONSTRAINT "actuate_documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "actuate_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_documents" ADD CONSTRAINT "actuate_documents_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "actuate_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_documents" ADD CONSTRAINT "actuate_documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "actuate_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_versions" ADD CONSTRAINT "actuate_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "actuate_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_versions" ADD CONSTRAINT "actuate_versions_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "actuate_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_media" ADD CONSTRAINT "actuate_media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "actuate_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_media" ADD CONSTRAINT "actuate_media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "actuate_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_media_usages" ADD CONSTRAINT "actuate_media_usages_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "actuate_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_media_usages" ADD CONSTRAINT "actuate_media_usages_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "actuate_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_content_locks" ADD CONSTRAINT "actuate_content_locks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "actuate_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_content_locks" ADD CONSTRAINT "actuate_content_locks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "actuate_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_notifications" ADD CONSTRAINT "actuate_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "actuate_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_content_templates" ADD CONSTRAINT "actuate_content_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "actuate_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_workflow_states" ADD CONSTRAINT "actuate_workflow_states_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "actuate_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_seo_issues" ADD CONSTRAINT "actuate_seo_issues_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "actuate_seo_audit_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_form_submission_files" ADD CONSTRAINT "actuate_form_submission_files_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "actuate_form_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_webhook_deliveries" ADD CONSTRAINT "actuate_webhook_deliveries_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "actuate_webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_password_reset_tokens" ADD CONSTRAINT "actuate_password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "actuate_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actuate_content_issues" ADD CONSTRAINT "actuate_content_issues_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "actuate_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Full-text search: GIN index on documents for fast ts_vector queries.
-- Raw index (not modeled in schema.prisma); consumed by src/search/index.ts.
-- Kept in the baseline so a fresh `migrate deploy` reproduces search acceleration.
CREATE INDEX IF NOT EXISTS "idx_actuate_documents_fts"
  ON "actuate_documents"
  USING GIN (to_tsvector('english', COALESCE("title", '') || ' ' || COALESCE("plainText", '')));

