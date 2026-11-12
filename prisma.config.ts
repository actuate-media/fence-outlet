import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Migrations (DDL) should run over a NON-pooled connection. Neon/Supabase
// poolers frequently break schema changes, producing opaque "migration failed"
// errors. Prefer DIRECT_DATABASE_URL; fall back to DATABASE_URL but warn loudly
// so the failure mode isn't silent.
const migrationUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '';
if (process.env.DATABASE_URL && !process.env.DIRECT_DATABASE_URL) {
  console.warn(
    '[prenta] DIRECT_DATABASE_URL is not set — running migrations against DATABASE_URL. ' +
      'If that is a pooled connection (e.g. a Neon/Supabase pooler), migrations may fail; ' +
      'set DIRECT_DATABASE_URL to the non-pooled connection string.',
  );
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma', 'migrations'),
  },
  datasource: {
    url: migrationUrl,
  },
});
