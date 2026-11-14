// Applies pending Prisma migrations.
//
// Production builds migrate the production database.
// Preview builds migrate only when Preview DATABASE_URL and DIRECT_DATABASE_URL
// are set and neither equals PRENTA_PRODUCTION_DATABASE_URL or
// PRENTA_PRODUCTION_DIRECT_DATABASE_URL. A match fails the build. Missing
// preview configuration skips the migrate so an unconfigured preview cannot
// apply a branch migration to production.
// Locally (no VERCEL_ENV) it skips — use pnpm db:migrate for local changes.
import { execSync } from 'node:child_process'

const vercelEnv = process.env.VERCEL_ENV || 'unset'
const databaseUrl = (process.env.DATABASE_URL || '').trim()
const directUrl = (process.env.DIRECT_DATABASE_URL || '').trim()
const productionUrl = (process.env.PRENTA_PRODUCTION_DATABASE_URL || '').trim()
const productionDirectUrl = (process.env.PRENTA_PRODUCTION_DIRECT_DATABASE_URL || '').trim()

function applyMigrations() {
  console.log('[deploy-migrate] applying migrations (VERCEL_ENV=' + vercelEnv + ')')
  execSync('prisma migrate deploy', { stdio: 'inherit' })
}

if (vercelEnv === 'production') {
  applyMigrations()
} else if (vercelEnv === 'preview') {
  const previewUrls = [databaseUrl, directUrl].filter(Boolean)
  const productionUrls = [productionUrl, productionDirectUrl].filter(Boolean)
  if (!databaseUrl || !directUrl || !productionUrl || !productionDirectUrl) {
    console.log(
      '[deploy-migrate] skipping prisma migrate deploy. On the Preview environment, set DATABASE_URL and DIRECT_DATABASE_URL to the preview database, and PRENTA_PRODUCTION_DATABASE_URL plus PRENTA_PRODUCTION_DIRECT_DATABASE_URL to the production values.',
    )
  } else if (previewUrls.some((url) => productionUrls.includes(url))) {
    console.error(
      '[deploy-migrate] refusing to migrate: a Preview database URL matches a production URL.',
    )
    process.exit(1)
  } else {
    applyMigrations()
  }
} else {
  console.log(
    '[deploy-migrate] skipping prisma migrate deploy (VERCEL_ENV=' + vercelEnv + '). Use pnpm db:migrate for local changes.',
  )
}
