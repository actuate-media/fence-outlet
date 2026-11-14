# Deployment Guide

## Prerequisites

- Node.js >= 20
- A Prisma Postgres database
- A Vercel account

## Vercel Deployment

### 1. Link your project

```bash
npx vercel link
```

### 2. Provision infrastructure

Via the Vercel dashboard or CLI:

- **Database**: Add Prisma Postgres from the Vercel Marketplace
  - This auto-provisions `DATABASE_URL` and `DIRECT_DATABASE_URL`
- **Blob Storage**: Add Vercel Blob from the dashboard
  - This auto-provisions `BLOB_READ_WRITE_TOKEN`
- **Rate Limiting**: Add Upstash Redis from the Vercel Marketplace
  - This auto-provisions `KV_REST_API_URL` / `KV_REST_API_TOKEN`, which the
    rate limiter reads automatically (the native `UPSTASH_REDIS_REST_URL` /
    `UPSTASH_REDIS_REST_TOKEN` names also work if you set them directly)

### 3. Pull auto-provisioned env vars

```bash
npx vercel env pull .env.local
```

### 4. Set remaining environment variables

In the Vercel dashboard (Settings > Environment Variables), add:

```
CMS_SECRET=<min-32-char-random-string>
CMS_ENCRYPTION_KEY=<64-char-hex-string>
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

```bash
git push  # Vercel auto-deploys on push
```

The build command runs migrations before building. Production builds always
migrate the production database. Preview builds migrate the preview database
only after `DATABASE_URL` and `DIRECT_DATABASE_URL` on the Preview environment
differ from `PRENTA_PRODUCTION_DATABASE_URL` and
`PRENTA_PRODUCTION_DIRECT_DATABASE_URL` (see Preview Deployments below).

### 6. Verify deployment readiness

```bash
npm run doctor
npm run deploy:check
```

These commands check required env vars, Prisma models, and deployment metadata
before you rely on the admin UI.

### 7. Configure SEO & verify public routes

1. Set **Admin → Settings → General** site URL to match `NEXT_PUBLIC_SITE_URL`.
2. Open **Admin → SEO** and confirm:
   - Default OG image (upload 1200×630 to Media or set `public/og-default.png`)
   - Organization name, logo URL, and social profiles (`sameAs`)
   - AI crawler policy under Technical → Robots (GPTBot, ClaudeBot, etc.)
3. Hit these URLs on your deployed domain (scaffold proxies cms-core):
   - `/sitemap.xml`
   - `/robots.txt`
   - `/llms.txt`
4. Work through the **Prototype → Production** checklist in the Prenta docs
   before go-live (forms, consent, performance, accessibility, launch QA).

### 8. Seed first-run content

```bash
CMS_ADMIN_EMAIL=admin@example.com CMS_ADMIN_PASSWORD=change-me npm run db:seed -- --demo
```

This project includes a pre-filled `prenta.seed.json` ("Marketing homepage"
with hero, stats, pricing, and CTA sections). Load it with:

```bash
npm run populate
```

For real projects, create `prenta.seed.json` or `prenta.seed.ts` with pages,
globals, forms, SEO fields, media references, and saved sections, then run
`npm run populate`. Script tags are **not** part of the seed envelope —
bootstrap them in Admin → Script Tags or a custom insert-if-missing seed script
(see Prenta docs: Script Tags / populate guidance).

### 9. Create your admin account

Visit `https://your-domain.com/securelogin` — the setup wizard will
guide you through creating the initial admin account.

Sign-in happens at `/securelogin`; the admin app itself lives at
`/admin`. Signed-out visits to `/admin` show a 404 so the
admin is not advertised at a well-known path.

Alternatively, set `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` env vars
before deploying to auto-create the admin account. If you did this (or ran
the seed in step 7 with those vars set), the admin already exists and the
setup wizard will not appear — sign in with those credentials instead.

### 10. Verify after deploy

```bash
npm run verify
```

---

## Continuous integration (migration gate)

This project ships a `.github/workflows/ci.yml` that runs on every pull
request. It stands up a throwaway Postgres container and runs
`prisma migrate deploy` against it, so a broken or out-of-order migration
fails the PR in review instead of breaking your production build (whose
build applies migrations only on production deploys — see above).

It is **provider-agnostic** — the container is independent of where
production runs (Prisma Postgres, Neon, Supabase, or self-hosted) and needs
no secrets. The workflow points `DATABASE_URL` / `DIRECT_DATABASE_URL` at the
CI container only; it never touches a real environment.

### Dependency updates (Renovate)

This project ships a `renovate.json` preset that groups every
`@prenta/*` upgrade into a single PR. Enable Renovate (the GitHub
app, or self-hosted) on the repo and it will open a grouped "Prenta CMS"
PR on a weekly schedule.

- **Minor/patch** Prenta bumps **auto-merge once CI passes** — including the
  migration gate above — so routine security/patch updates land hands-free.
- **Major** bumps are never auto-merged (they can carry breaking schema/API
  changes); they get a `breaking-change` label for manual review.

For auto-merge to actually wait on CI, add a **branch protection rule** on
`main` that requires the `CI` status check. Without it, Renovate may merge a
green-but-unchecked PR.

Running several Prenta sites? "Patch the fleet" is just merging each
repo's grouped Renovate PR — every one independently CI-gated. See ADR 0003
in the Prenta repo for the full multi-site model.

### Nightly database backups

This project ships `.github/workflows/db-backup.yml`, which runs
`prenta db:backup --upload --retention-days 30` every night at 03:30 UTC: an
encrypted `pg_dump` is stored privately in Vercel Blob under `backups/db/` and
copies older than 30 days are pruned. It stays inert until you add three
repository secrets (Settings > Secrets and variables > Actions):

```
DIRECT_DATABASE_URL=<non-pooled connection string>
BLOB_READ_WRITE_TOKEN=<Vercel Blob token>
BACKUP_ENCRYPTION_KEY=<64-char-hex-string, distinct from CMS_ENCRYPTION_KEY>
```

Escrow `BACKUP_ENCRYPTION_KEY` in your password manager — without it the
backups cannot be decrypted. Trigger the workflow once via **Run workflow**,
then restore with `prenta db:restore latest --target <fresh database url>`
(see the Prenta docs: Backups & Restore).

---

## Preview Deployments

Every PR creates a preview deployment with its own URL. Preview deployments
use one dedicated database, shared by every preview branch. Production is
a different database.

1. Provision a second database (a separate Prisma Postgres database).
2. In Vercel → Settings → Environment Variables, set these on **Preview**:
   - `DATABASE_URL` and `DIRECT_DATABASE_URL` — the preview database
   - `PRENTA_PRODUCTION_DATABASE_URL` — the production pooled `DATABASE_URL`
   - `PRENTA_PRODUCTION_DIRECT_DATABASE_URL` — the production direct URL
   - `CMS_SECRET` and `CMS_ENCRYPTION_KEY` — Preview-scoped values
3. `scripts/deploy-migrate.mjs` applies `prisma migrate deploy` on a preview
   build only when both preview URLs are set and neither equals either
   production URL. If a preview URL matches production, the build fails.
   If a branch ships a bad migration, reset the preview database.

---

## Cron Jobs

The following cron jobs are configured in `vercel.json`:

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Every 5 min | `/api/cms/cron/publish` | Process scheduled publish/unpublish |
| Daily 3 AM | `/api/cms/cron/cleanup` | Clean expired locks, sessions, soft-deleted content |
| Weekly Mon 4 AM | `/api/cms/cron/seo-scan` | Run automated SEO audit |
| Daily 5 AM | `/api/cms/cron/search-sync` | Sync Search Console + CrUX search data |
| Daily 6 AM | `/api/cms/cron/seo-autopilot` | Apply policy-gated SEO fixes (SEO Autopilot) |
| Nightly 2:30 AM | `/api/cms/cron/content-health` | Scan content for missing meta, alt text, broken links, outdated docs |

These require Vercel Pro or Enterprise plan for cron intervals < 1 day.

## Updating Prenta CMS

1. Check for updates in the admin panel (Settings > Updates)
2. Or run: `npm outdated @prenta/core`
3. Upgrade (pre-1.0 minors require an explicit bump — `npm update` alone is not enough):
   `npx prenta upgrade --dry-run` then `npx prenta upgrade && npm install`
4. Sync schema + migrations: `npx prenta db:sync && npx prisma migrate deploy`
5. Deploy: `git push`

## Troubleshooting

### Build fails with "migration failed"

Ensure `DIRECT_DATABASE_URL` is set and points to a non-pooled connection.
Pooled connections (PgBouncer/Neon pooler) cannot run DDL statements.

### "No users found" after deploy

Visit `/securelogin` to trigger the setup wizard, or set
`CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` environment variables.
