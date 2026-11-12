import { readFile } from 'node:fs/promises';

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const env = parseEnv(await readFile('.env', 'utf8').catch(() => fail('.env is missing')));
const hex64 = /^[0-9a-f]{64}$/;

if ((env.CMS_SECRET ?? '').length < 32) fail('CMS_SECRET must be at least 32 characters');
if (!hex64.test(env.CMS_ENCRYPTION_KEY ?? '')) fail('CMS_ENCRYPTION_KEY must be 64 hex characters');
if (!hex64.test(env.BACKUP_ENCRYPTION_KEY ?? '')) fail('BACKUP_ENCRYPTION_KEY must be 64 hex characters');
if (!/^[0-9a-f]+$/.test(env.CRON_SECRET ?? '') || env.CRON_SECRET.length < 48) fail('CRON_SECRET must be at least 48 hex characters');
if (env.CMS_ENCRYPTION_KEY === env.BACKUP_ENCRYPTION_KEY) fail('BACKUP_ENCRYPTION_KEY must differ from CMS_ENCRYPTION_KEY');

if (!(env.DATABASE_URL ?? '').includes('YOUR_API_KEY')) {
  fail('DATABASE_URL was replaced before Vercel provisioned Prisma Postgres');
}
if (!(env.DIRECT_DATABASE_URL ?? '').includes('user:password@db.prisma.io')) {
  fail('DIRECT_DATABASE_URL was replaced before Vercel provisioned Prisma Postgres');
}
if ((env.BLOB_READ_WRITE_TOKEN ?? '') !== '') {
  fail('BLOB_READ_WRITE_TOKEN was filled before Vercel provisioned Blob');
}

console.log('env placeholders ok');
