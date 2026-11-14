import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { extractPlainText, hashContent, sanitizeHtml } from '@prenta/core';
import pg from 'pg';
import { Prisma, PrismaClient } from '../generated/prisma/client';

process.loadEnvFile('.env');

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitize(item)]),
    );
  }
  if (typeof value === 'string' && /<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(value);
  return value;
}

const seed = JSON.parse(readFileSync(new URL('../prenta.seed.json', import.meta.url), 'utf8')) as {
  collections: { pages: { status: 'PUBLISHED' | 'DRAFT'; data: Record<string, unknown> }[] };
};
const found = seed.collections.pages.find((item) => item.data.slug === 'home');
if (!found) throw new Error('Home page is missing from prenta.seed.json');
const page = found;

async function main() {
  const data = sanitize(page.data) as Prisma.InputJsonValue;
  const serialized = JSON.stringify(data);
  const plainText = extractPlainText(serialized);
  const contentHash = await hashContent(serialized);
  const record = data as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title : null;
  const slug = typeof record.slug === 'string' ? record.slug : null;

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter: new PrismaPg(pool) } as ConstructorParameters<typeof PrismaClient>[0]);

  try {
    const admin = await db.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  if (!admin) throw new Error('No admin user exists. Finish the setup wizard before publishing the homepage.');

  const existing = await db.document.findFirst({
    where: { collection: 'pages', slug, deletedAt: null },
    select: { id: true, publishedAt: true },
  });

  if (existing) {
    await db.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: existing.id },
        data: {
          title,
          data,
          status: page.status,
          publishedAt: page.status === 'PUBLISHED' ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
          updatedById: admin.id,
          plainText,
          contentHash,
        },
      });
      await tx.version.create({
        data: { documentId: existing.id, data, changedById: admin.id, changeType: 'UPDATE' },
      });
    });
    console.log('updated home page');
  } else {
    await db.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: {
          collection: 'pages',
          title,
          slug,
          data,
          status: page.status,
          publishedAt: page.status === 'PUBLISHED' ? new Date() : null,
          createdById: admin.id,
          updatedById: admin.id,
          plainText,
          contentHash,
        },
      });
      await tx.version.create({
        data: { documentId: created.id, data, changedById: admin.id, changeType: 'CREATE' },
      });
    });
    console.log('created home page');
  }
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Homepage publish failed');
  process.exit(1);
});
