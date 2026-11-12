# Fence Outlet foundation

## Purpose

Stand up an empty Next.js site and Prenta admin in the existing `fence-outlet` repo. Editors can sign in, the database and media store are wired, and the public catch-all renders published CMS pages. Fence Outlet pages, catalog, locations, and the quote form wait for the design files.

## Scope

This slice installs Prenta and proves the stack. It does not build the marketing site.

Included:

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

Excluded:

- Fence Outlet page designs, copy, navigation, materials catalog, Fence in a Box, locations, financing, galleries, and blog posts.
- The quote form UI. The forms plugin is installed so submissions have an inbox later.
- Resend, SMTP, and other email-provider secrets.
- Commerce, navigation, AI, and consent plugins.
- Creating the Vercel project, Prisma Postgres database, or Blob store when those accounts are not available in this session. The scaffold and install still land. Migrate, dev, and upload checks wait on the credentials.

## Architecture

`create-prenta` generates the app. The CLI rejects `.` as a project name, and this folder already exists, so the scaffolder library runs with project name `.` and writes files here. The generated `package.json` name is then set to `fence-outlet`, because a name of `.` is not a valid package name.

Scaffold options:

| Option | Value |
| --- | --- |
| Framework | `next` |
| Template | `marketing-custom` |
| Platform | `vercel` |
| Database | `prisma-postgres` |
| Plugins | `seo`, `forms`, `redirects`, `media`, `email` |
| Auth | `credentials` |
| Admin path | `/admin` |
| Login path | `/securelogin` |
| Trailing slash | `never` |

Resulting shape:

- `app/(site)/[[...path]]` renders a published CMS page. The designed-sections template supplies the section schema and the shared admin and public renderers.
- `app/(admin)/admin` mounts the Prenta admin.
- `app/(admin)/securelogin` mounts login, the setup wizard, and password reset.
- `app/api/cms/[[...cms]]` is the CMS API.
- `prenta.config.ts` sets `storage: { provider: 'vercel-blob' }` and depends on `@vercel/blob`.
- `prisma/schema.prisma` and the bundled `prisma/migrations` create the `prenta_*` tables.
- `next/image` allows `*.public.blob.vercel-storage.com`.

`README.md` and `LICENSE` stay. The scaffolder may add `.gitignore`, `DEPLOYMENT.md`, CI, and env examples. Those generated files stay as the scaffolder wrote them.

## Data flow

1. An editor opens `/securelogin` and signs in with email and password. The first visit is the setup wizard unless `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` are set.
2. `/admin` calls `/api/cms`. Pages, posts, forms, SEO, and redirects are stored in Prisma Postgres. `DATABASE_URL` is the pooled runtime connection. `DIRECT_DATABASE_URL` is the direct connection used by migrations.
3. Media uploads go to Vercel Blob using `BLOB_READ_WRITE_TOKEN`. Public pages resolve those file URLs.
4. A public request hits `app/(site)/[[...path]]`, loads the published page, and renders its sections. `/` with no published page whose slug is `home` shows the scaffolder welcome message: the site is running, and an editor creates that page to replace it. Any other missing or unpublished path returns 404.
5. Form submissions land in the forms inbox. Email notifications send only after `RESEND_API_KEY` or SMTP settings exist. This slice does not set those.

Local setup copies `.env.example` to `.env` and fills `DATABASE_URL`, `DIRECT_DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `CMS_SECRET`, `CMS_ENCRYPTION_KEY`, and `CRON_SECRET`. Then `npm install`, `npx prisma migrate deploy`, and `npm run dev`.

Prisma Postgres and the Blob store are created on the Fence Outlet Vercel project. This slice records the env names the app reads. Creating the stores requires that Vercel account. When the account is linked in this session, provisioning and `vercel env pull` happen here. When it is not, those checks stay blocked on the credentials.

## Failure behavior

- A missing required env var stops the command that needs it. `prisma migrate deploy` and `npm run dev` fail with the missing variable named. The process does not invent a database URL, a Blob token, or a secret.
- `npm run build` runs `prisma generate`, then `scripts/deploy-migrate.mjs`, then `next build`. A migrate failure fails the build.
- A signed-out request to `/admin` gets the scaffolder's 404 lookalike. Login stays on `/securelogin`.
- `/` with no published `home` page shows the scaffolder welcome message, not a stack trace and not a generated Fence Outlet page. Any other public path with no published page returns 404.
- A media upload without `BLOB_READ_WRITE_TOKEN` fails that upload. The rest of the app still starts.
- The scaffold writes into the existing repo. It does not delete `LICENSE` or `README.md`. If the scaffolder throws, the run stops and reports the error. A second run does not paper over a partial write by hand-wiring Prenta.
- After a successful scaffold, `package.json` `name` is `fence-outlet`. A name of `.` fails this check.

## Definition of done

- `npm install` finishes.
- `package.json` name is `fence-outlet`.
- `LICENSE` and `README.md` are still in the repo.
- With `.env` filled, `npx prisma migrate deploy` creates the `prenta_*` tables.
- `npm run dev` serves three routes: `/securelogin` shows the setup wizard, `/admin` shows the signed-out 404 lookalike, and `/` shows the scaffolder welcome message without a stack trace.
- After the wizard, a test upload in the media library returns a `*.public.blob.vercel-storage.com` URL.
- `npm run doctor` and `npm run verify` report a healthy CMS.

If Prisma Postgres and Vercel Blob are not available in this session, the done state is the scaffold plus a successful `npm install`. The migrate, dev, upload, doctor, and verify checks stay open until those credentials exist.

## Later slices

Design files drive the next specs. Expected follow-ons, each specced on its own, are the global chrome, the homepage, the materials catalog, Fence in a Box, location pages, and the quote form. Those slices consume this app. They do not replace the scaffolder output.
