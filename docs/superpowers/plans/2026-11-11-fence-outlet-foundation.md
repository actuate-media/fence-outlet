# Fence Outlet Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Prenta CMS into the existing `fence-outlet` repo as a Next.js monolith with Prisma Postgres and Vercel Blob wired, and an empty public site.

**Architecture:** Call `scaffoldProject` from `create-prenta/scaffold` with project name `.` so files land in this repo. Then set the package name and the scaffolder's interpolated project-name strings to `fence-outlet`. Install dependencies, write local secrets without inventing a database URL or Blob token, and run migrate plus the three route checks only when Vercel has provisioned Prisma Postgres and Blob.

**Tech Stack:** Next.js monolith, `create-prenta` 1.7.5, `@prenta/core`, `@prenta/admin`, Prisma Postgres, Vercel Blob, npm.

## Global Constraints

- Official `create-prenta` scaffolder, written into this repo.
- Next.js monolith: public site, admin, and `/api/cms` in one app.
- Designed-sections template (`marketing-custom`).
- Vercel as the deploy platform, with Vercel Blob for media.
- Prisma Postgres for content.
- Plugins: SEO, forms, redirects, media, email.
- Email-and-password auth.
- Admin at `/admin`. Login and the setup wizard at `/securelogin`.
- Canonical URLs without a trailing slash.
- `package.json` name set to `fence-outlet` after the scaffold.
- Existing `README.md` and `LICENSE` left in place.
- Do not build Fence Outlet pages, copy, navigation, the materials catalog, Fence in a Box, locations, financing, galleries, or blog posts.
- Do not run `npm run populate` or `npm run db:seed`. Both load sample marketing content and would replace the `/` welcome message.
- Do not invent `DATABASE_URL`, `DIRECT_DATABASE_URL`, or `BLOB_READ_WRITE_TOKEN`.
- Do not set Resend, SMTP, or other email-provider secrets.
- Do not add the commerce, navigation, AI, or consent plugins.
- If the scaffolder throws, stop and report the error. Do not hand-wire Prenta over a partial write.
- Node.js >= 20, from the scaffolder's deployment guide for the Next monolith.
- Work from `c:\Git Local\fence-outlet`. The shell is PowerShell.

---

### Task 1: Scaffold Prenta into this repo

**Files:**
- Create: `scripts/check-foundation.mjs`
- Create: the scaffolder's Next.js app (`package.json`, `prenta.config.ts`, `app/(site)/[[...path]]/page.tsx`, `app/(admin)/admin/[[...path]]/page.tsx`, `app/(admin)/securelogin/[[...path]]/page.tsx`, `app/api/cms/[[...cms]]/route.ts`, `prisma/schema.prisma`, `prisma/migrations/`, `.env.example`, `.gitignore`)
- Modify: `package.json` (name only) and `prenta.config.ts` (the four project-name strings the scaffolder copies from `.`)
- Test: `scripts/check-foundation.mjs`
- Leave in place: `README.md`, `LICENSE`, `docs/superpowers/specs/2026-11-11-fence-outlet-foundation-design.md`

**Interfaces:**
- Consumes: `scaffoldProject(options: ProjectOptions): Promise<void>` from `create-prenta/scaffold`. `ProjectOptions` requires `projectName`, `adminPath`, `loginPath`, `plugins`, `platform`, `database`, and `authProviders`.
- Produces: a Next.js app whose `package.json` `"name"` is `"fence-outlet"`, whose `prenta.config.ts` contains `storage: { provider: 'vercel-blob' }`, `trailingSlash: 'never'`, `path: '/admin'`, and `loginPath: '/securelogin'`.

- [ ] **Step 1: Write the failing foundation check**

Create `scripts/check-foundation.mjs`:

```js
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
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `node scripts/check-foundation.mjs`

Expected: FAIL with `package.json is missing` and exit code 1.

- [ ] **Step 3: Scaffold, then rename the project identity**

Create `scripts/run-scaffold.mjs`:

```js
import { scaffoldProject } from 'create-prenta/scaffold';

await scaffoldProject({
  projectName: '.',
  adminPath: '/admin',
  loginPath: '/securelogin',
  plugins: ['seo', 'forms', 'redirects', 'media', 'email'],
  platform: 'vercel',
  database: 'prisma-postgres',
  authProviders: ['credentials'],
  template: 'marketing-custom',
  framework: 'next',
  trailingSlash: 'never',
});
```

`create-prenta` must be on disk before Node runs the script. This directory has no `package.json` yet, so the install creates one. The scaffolder then overwrites that file.

Run:

```powershell
npm install --no-save --no-package-lock create-prenta@1.7.5
node scripts/run-scaffold.mjs
```

Expected: `node scripts/run-scaffold.mjs` prints `Your Prenta CMS project is ready!` and exits 0. If it throws, stop. Do not hand-write routes, config, or migrations.

Create `scripts/rename-project.mjs`:

```js
import { readFile, writeFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.name !== '.') {
  throw new Error(`Expected package name ".", got ${pkg.name}`);
}
pkg.name = 'fence-outlet';
await writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n');

let config = await readFile('prenta.config.ts', 'utf8');
const swaps = [
  ["siteName: '.',", "siteName: 'fence-outlet',"],
  ["defaultMetaDescription: 'Welcome to .',", "defaultMetaDescription: 'Welcome to fence-outlet.',"],
  ["name: '.',", "name: 'fence-outlet',"],
];
for (const [from, to] of swaps) {
  const count = config.split(from).length - 1;
  const expected = from.startsWith('name:') ? 2 : 1;
  if (count !== expected) {
    throw new Error(`Expected ${expected} of [${from}], found ${count}`);
  }
  config = config.replaceAll(from, to);
}
await writeFile('prenta.config.ts', config);
```

Run: `node scripts/rename-project.mjs`

Expected: exit 0. The `name: '.',` swap matches exactly two times (organization name and admin branding). `siteName` and `defaultMetaDescription` match exactly once each.

Delete `scripts/run-scaffold.mjs` and `scripts/rename-project.mjs`. Both are one-shots and are not part of the app.

- [ ] **Step 4: Run the check to verify it passes**

Run: `node scripts/check-foundation.mjs`

Expected: `foundation contract ok` and exit code 0.

- [ ] **Step 5: Commit**

```powershell
git add -A
git reset HEAD -- .env .env.local node_modules .vercel scripts/run-scaffold.mjs scripts/rename-project.mjs
git commit -m "feat: scaffold the Prenta CMS foundation"
```

`git reset` may warn for a path that is not staged. That warning is fine. Do not stage secrets or `node_modules`.

---

### Task 2: Install dependencies

**Files:**
- Create: `package-lock.json`
- Modify: none
- Test: `npm ls @prenta/core @prenta/admin @vercel/blob --depth=0`

**Interfaces:**
- Consumes: the `package.json` from Task 1, name `fence-outlet`, with the dependencies listed in `scripts/check-foundation.mjs`.
- Produces: an `npm` install whose top-level tree includes `@prenta/core`, `@prenta/admin`, and `@vercel/blob`. `postinstall` runs `prisma generate`.

- [ ] **Step 1: Confirm the packages are not installed yet**

Run: `npm ls @prenta/core @prenta/admin @vercel/blob --depth=0`

Expected: FAIL with exit code not 0. `node_modules` may already contain `create-prenta` from Task 1. `@prenta/core`, `@prenta/admin`, and `@vercel/blob` are not installed yet, so `npm ls` still fails.

- [ ] **Step 2: Install**

Run: `npm install`

Expected: exit code 0. `postinstall` runs `prisma generate`. The command prints a notice that it added packages.

- [ ] **Step 3: Confirm the packages resolve**

Run: `npm prune`

Expected: exit code 0. `create-prenta` is removed from `node_modules` when `package.json` does not depend on it.

Run: `npm ls @prenta/core @prenta/admin @vercel/blob --depth=0`

Expected: exit code 0, and the output lists all three packages.

Run: `node scripts/check-foundation.mjs`

Expected: `foundation contract ok`.

- [ ] **Step 4: Commit**

```powershell
git add package-lock.json
git commit -m "chore: lock Prenta CMS dependencies"
```

If `npm install` changed `package.json`, stage that file too. Do not stage `node_modules` or `.env`.

---

### Task 3: Write local secrets without inventing infrastructure

**Files:**
- Create: `.env` (gitignored; do not commit)
- Create: `scripts/check-env.mjs`
- Modify: none
- Test: `scripts/check-env.mjs`

**Interfaces:**
- Consumes: `.env.example` written by the scaffolder. Required keys it already documents: `DATABASE_URL`, `DIRECT_DATABASE_URL`, `CMS_SECRET`, `CMS_ENCRYPTION_KEY`, `BACKUP_ENCRYPTION_KEY`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN`.
- Produces: a gitignored `.env` whose four secrets are generated and whose database URLs and Blob token are still the example placeholders.

- [ ] **Step 1: Write the failing env check**

Create `scripts/check-env.mjs`:

```js
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
if (!hex64.test(env.CRON_SECRET ?? '') || env.CRON_SECRET.length < 48) fail('CRON_SECRET must be at least 48 hex characters');
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
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `node scripts/check-env.mjs`

Expected: FAIL with `.env is missing` and exit code 1.

- [ ] **Step 3: Copy the example and fill only the secrets**

Run: `Copy-Item .env.example .env`

Create `scripts/fill-env-secrets.mjs`:

```js
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

let text = await readFile('.env', 'utf8');
const generated = {
  CMS_SECRET: randomBytes(32).toString('hex'),
  CMS_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
  BACKUP_ENCRYPTION_KEY: randomBytes(32).toString('hex'),
  CRON_SECRET: randomBytes(24).toString('hex'),
};
for (const [key, value] of Object.entries(generated)) {
  const pattern = new RegExp(`^${key}=""`, 'm');
  if (!pattern.test(text)) {
    throw new Error(`${key} empty assignment not found`);
  }
  text = text.replace(pattern, `${key}="${value}"`);
}
await writeFile('.env', text);
```

Run: `node scripts/fill-env-secrets.mjs`

Expected: exit 0. `CMS_SECRET` and `CMS_ENCRYPTION_KEY` are 64 hex characters. `CRON_SECRET` is 48 hex characters (`randomBytes(24)`). `BACKUP_ENCRYPTION_KEY` is a different 64-hex value. Database URLs and `BLOB_READ_WRITE_TOKEN` stay as copied from `.env.example`.

Delete `scripts/fill-env-secrets.mjs`. It is a one-shot and is not part of the app.

- [ ] **Step 4: Run the check to verify it passes**

Run: `node scripts/check-env.mjs`

Expected: `env placeholders ok` and exit code 0.

Run: `git check-ignore -v .env`

Expected: a line showing `.gitignore` ignores `.env`.

- [ ] **Step 5: Commit the check only**

```powershell
git add scripts/check-env.mjs
git commit -m "test: check local env secrets stay placeholders"
```

Do not stage `.env`.

---

### Task 4: Migrate and verify routes when infrastructure exists

**Files:**
- Modify: `.env` (only by copying real `DATABASE_URL`, `DIRECT_DATABASE_URL`, and `BLOB_READ_WRITE_TOKEN` from `vercel env pull`; do not commit)
- Test: `npx prisma migrate deploy`, `npm run dev`, `npm run doctor`, `npm run verify`

**Interfaces:**
- Consumes: `.env` from Task 3, and a linked Vercel project that can provision Prisma Postgres (`DATABASE_URL`, `DIRECT_DATABASE_URL`) and a public Blob store (`BLOB_READ_WRITE_TOKEN`).
- Produces: either a migrated database and the three passing route checks, or a stopped run whose open checks are migrate, dev, upload, doctor, and verify.

- [ ] **Step 1: Decide whether infrastructure is available**

Run: `npx vercel whoami`

If the command fails or prints that the user is not logged in, do not run `vercel login`. Print this and stop the task:

```text
OPEN CHECKS
- npx prisma migrate deploy creates the prenta_* tables
- npm run dev: /securelogin shows the setup wizard, /admin shows the signed-out 404 lookalike, / shows the scaffolder welcome message
- a media upload returns a *.public.blob.vercel-storage.com URL
- npm run doctor reports a healthy CMS
- npm run verify reports a healthy CMS
```

That stopped state is success for this session. Do not invent credentials and do not mark those checks passed.

- [ ] **Step 2: Provision Prisma Postgres and a public Blob store**

Run, in order, only after Step 1 succeeded:

```powershell
npx vercel link --yes --project fence-outlet
npx vercel install prisma --name fence-outlet-postgres
npx vercel blob create-store fence-outlet-media --access public
npx vercel env pull .env.local --yes
```

Expected: `vercel whoami` already succeeded. `vercel link` links this directory. `vercel install prisma` creates one Prisma Postgres database and writes `DATABASE_URL` and `DIRECT_DATABASE_URL` onto the project. `vercel blob create-store` creates one public store. `vercel env pull` writes `.env.local`.

If `vercel install prisma` exits non-zero because it requires `--billing-plan` or `--meta`, re-run that one command with the flag the error names. If the error says the database was already created, do not run `vercel install prisma` again.

If `.env.local` has no non-empty `BLOB_READ_WRITE_TOKEN`, stop and report that the public Blob token is missing. Do not invent a token. Leave the Task 4 checks open.

Copy `DATABASE_URL`, `DIRECT_DATABASE_URL`, and `BLOB_READ_WRITE_TOKEN` from `.env.local` into `.env`, replacing only those three keys. Leave `CMS_SECRET`, `CMS_ENCRYPTION_KEY`, `BACKUP_ENCRYPTION_KEY`, and `CRON_SECRET` as generated in Task 3. Set `NEXT_PUBLIC_SITE_URL` in `.env` to `http://localhost:3000`.

- [ ] **Step 3: Apply migrations**

Run: `npx prisma migrate deploy`

Expected: exit code 0. Stdout contains `All migrations have been successfully applied` or `No pending migrations to apply`. A non-zero exit stops the task. Do not run `npm run populate` or `npm run db:seed`.

- [ ] **Step 4: Verify the three routes**

Run `npm run dev` in the background. Wait until `http://localhost:3000` accepts connections.

Run: `curl.exe -s http://localhost:3000/`

Expected: HTTP 200 and a body containing this exact sentence:

```text
Your site is running. Create a page with slug "home" in the CMS to replace this message.
```

Open `http://localhost:3000/securelogin` in the browser. Expected: the setup wizard asks for name, email, and password. It does not show a stack trace.

Open `http://localhost:3000/admin` in the browser while signed out. Expected: a not-found presentation. It does not show the setup form and it does not show the admin navigation. If the running app shows a different screen, stop and report the screen. Do not patch Prenta to fake a 404.

- [ ] **Step 5: Create the first editor and upload one file**

On `http://localhost:3000/securelogin`, submit the setup wizard with a name, an email, and a password you can remember for this session. Do not write the password into the repo.

In the admin media library, upload a small PNG. Expected: the stored URL host ends with `.public.blob.vercel-storage.com`. If the upload errors, stop and report the error. Do not substitute a hand-written Blob URL.

- [ ] **Step 6: Run the CMS health commands**

Run: `npm run doctor`

Expected: exit code 0.

Run: `npm run verify`

Expected: exit code 0.

Stop the dev server when both commands have finished.

- [ ] **Step 7: Commit nothing from this task**

`.env`, `.env.local`, and `.vercel` stay unstaged. This task has no source change when provisioning succeeds. Do not create an empty commit.
