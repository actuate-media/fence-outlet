import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { ScriptTagGroup } from '@prenta/core/next/script-tags';
import {
  resolveScriptTagsForPath,
  SCRIPT_TAGS_CACHE_TAG,
} from '@prenta/core/script-tags';
import { getPrisma } from '@/lib/prisma';
import '@/src/sections/register';
import './globals.css';
// Utility classes for the public section renderers. Shipped as a stylesheet
// because a Tailwind `@source` into node_modules emits nothing under pnpm
// (symlinked packages are not scanned) — without this, sections render
// unstyled.
import '@prenta/sections-react/styles.css';

// Optional custom fonts — after adding woff2 files under public/fonts/, uncomment
// the preload links below and the @font-face rules in globals.css.
// See public/fonts/README.md for licensing and naming guidance.
/*
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
<link rel="preload" href="/fonts/body.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
*/

// Resolve the browser-tab favicon from CMS Brand Settings (Settings →
// Appearance) so uploading a favicon updates the public site's <head> icons.
// Wrapped in try/catch with a static fallback so builds without a DB still emit
// valid base metadata. The light `appearance` subpath keeps DB codegen out of
// the layout module graph.
export async function generateMetadata(): Promise<Metadata> {
  const base: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: 'fence-outlet',
    description: 'Powered by Prenta CMS',
  };
  try {
    const [{ resolveBrand }, { getPrisma }] = await Promise.all([
      import('@prenta/core/appearance'),
      import('@/lib/prisma'),
    ]);
    const { favicon } = await resolveBrand(getPrisma(), null);
    if (favicon.icon) {
      base.icons = {
        icon: [{ url: favicon.icon, type: favicon.type ?? undefined }],
        shortcut: [{ url: favicon.icon }],
        apple: favicon.apple ? [{ url: favicon.apple }] : undefined,
      };
    }
  } catch {
    // Database unavailable — fall back to base metadata.
  }
  return base;
}

interface ScriptTags {
  head: string[];
  body_open: string[];
  body_close: string[];
}

async function getScriptTags(): Promise<ScriptTags> {
  const headerStore = await headers();
  const pathname =
    headerStore.get('x-prenta-pathname') ??
    headerStore.get('x-invoke-path') ??
    '/';
  const preview = headerStore.get('x-prenta-preview') === '1';
  try {
    // Preview requests bypass the cache: they're rare, and tags flagged
    // "disable in preview" must be filtered per-request, not cached.
    if (preview) {
      return await resolveScriptTagsForPath(getPrisma(), pathname, { preview: true });
    }
    const resolve = unstable_cache(
      async (path: string) => resolveScriptTagsForPath(getPrisma(), path),
      ['script-tags'],
      { revalidate: 60, tags: ['prenta', SCRIPT_TAGS_CACHE_TAG] },
    );
    return await resolve(pathname);
  } catch {
    return { head: [], body_open: [], body_close: [] };
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tags = await getScriptTags();

  return (
    <html lang="en">
      <head>
        <ScriptTagGroup codes={tags.head} idPrefix="head" />
      </head>
      <body>
        <ScriptTagGroup codes={tags.body_open} idPrefix="body-open" />
        {children}
        <ScriptTagGroup codes={tags.body_close} idPrefix="body-close" />
      </body>
    </html>
  );
}
