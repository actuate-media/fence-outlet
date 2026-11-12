import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function exists(rel) {
  try {
    await access(path.join(root, rel));
    return true;
  } catch {
    return false;
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const pkgRaw = await readFile(path.join(root, 'package.json'), 'utf8').catch(() => null);
if (pkgRaw == null) fail('package.json is missing');
const pkg = JSON.parse(pkgRaw);
if (pkg.name !== 'fence-outlet') fail(`package.json name is ${JSON.stringify(pkg.name)}, expected "fence-outlet"`);

const requiredDeps = [
  '@prenta/core',
  '@prenta/admin',
  '@prenta/plugin-seo',
  '@prenta/plugin-forms',
  '@prenta/plugin-redirects',
  '@prenta/plugin-media',
  '@prenta/plugin-email',
  '@vercel/blob',
  'next',
];
for (const name of requiredDeps) {
  if (!pkg.dependencies?.[name]) fail(`missing dependency ${name}`);
}
for (const name of [
  '@prenta/plugin-commerce',
  '@prenta/plugin-navigation',
  '@prenta/plugin-ai',
  '@prenta/plugin-consent',
]) {
  if (pkg.dependencies?.[name]) fail(`unexpected dependency ${name}`);
}

const requiredFiles = [
  'prenta.config.ts',
  'app/(site)/[[...path]]/page.tsx',
  'app/(admin)/admin/[[...path]]/page.tsx',
  'app/(admin)/securelogin/[[...path]]/page.tsx',
  'app/api/cms/[[...cms]]/route.ts',
  'prisma/schema.prisma',
  'prisma/migrations',
  '.env.example',
  '.gitignore',
  'README.md',
  'LICENSE',
  'docs/superpowers/specs/2026-11-11-fence-outlet-foundation-design.md',
];
for (const rel of requiredFiles) {
  if (!(await exists(rel))) fail(`missing ${rel}`);
}
if (await exists('pnpm-workspace.yaml')) fail('pnpm-workspace.yaml means the Astro split scaffold was used');
if (await exists('apps/site')) fail('apps/site means the Astro split scaffold was used');

const config = await readFile(path.join(root, 'prenta.config.ts'), 'utf8');
const requiredSnippets = [
  "provider: 'vercel-blob'",
  "trailingSlash: 'never'",
  "path: '/admin'",
  "loginPath: '/securelogin'",
  "siteName: 'fence-outlet'",
  "defaultMetaDescription: 'Welcome to fence-outlet.'",
  "credentials: { enabled: true }",
];
for (const snippet of requiredSnippets) {
  if (!config.includes(snippet)) fail(`prenta.config.ts missing ${snippet}`);
}
if (config.includes("siteName: '.'")) fail("prenta.config.ts still has siteName '.'");
if (config.includes("name: '.'")) fail("prenta.config.ts still has a project name of '.'");

const readme = await readFile(path.join(root, 'README.md'), 'utf8');
if (!readme.includes('# fence-outlet')) fail('README.md no longer contains the original heading');
const license = await readFile(path.join(root, 'LICENSE'), 'utf8');
if (!license.includes('Copyright (c) 2026 Actuate Media')) fail('LICENSE no longer contains the Actuate Media copyright');

const gitignore = await readFile(path.join(root, '.gitignore'), 'utf8');
for (const line of ['.env', '.env.local']) {
  if (!gitignore.split(/\r?\n/).includes(line)) fail(`.gitignore missing ${line}`);
}

console.log('foundation contract ok');
