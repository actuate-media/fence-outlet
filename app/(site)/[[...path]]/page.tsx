import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { headers } from 'next/headers';
import { sanitizeHtml } from '@prenta/core';
import { recordPublic404 } from '@prenta/core/site';
import { collectFormSlugsFromSections, prefetchPublicForms } from '@prenta/core';
import { coercePostHeader } from '@prenta/core/page-sections';
import {
  PostHeader,
  Sections,
  createLcpController,
  type PostContext,
  type PublicSection,
  type RenderImage,
} from '@prenta/sections-react';
import { getAdminPath } from '@prenta/core/next';
import {
  getCachedPageMetadata,
  getCachedPublishedDocument,
  getPublicForm,
  resolveDocument,
} from '@/lib/cms';
import { isFencePage, pageStateFromSections } from '@/src/homepage/content';
import { HomePage, homeFontClassName } from '@/src/homepage/home-page';
import { PageFrame } from '@/src/homepage/page-state';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ preview?: string }>;
}

const ADMIN_PATH = getAdminPath();

// The site catch-all lives in the (site) route group; the admin SPA lives in
// (admin). Next route precedence usually keeps them separate, but guard here so
// a request under the admin base is never resolved as CMS content.
function isAdminPath(p: string): boolean {
  const base = ADMIN_PATH.endsWith('/') ? ADMIN_PATH.slice(0, -1) : ADMIN_PATH;
  return p === base || p.startsWith(`${base}/`);
}

// Render CMS images through next/image for responsive srcset + optimization.
// The /resolve endpoint enriches section images with intrinsic width/height
// from the media library; when present we hand them to next/image, otherwise
// we fall back to a fluid lazy <img> (next/image requires dimensions).
const renderCmsImage: RenderImage = ({ src, alt, width, height, className, priority, sizes }) => {
  if (!src) return null;
  if (typeof width === 'number' && typeof height === 'number') {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes={sizes ?? '100vw'}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      sizes={sizes}
      className={className}
    />
  );
};

// sanitizeHtml + renderImage are stable; the LCP controller is created
// per-request inside the page so each render gets exactly one priority image.
const renderOptions = { sanitizeHtml, renderImage: renderCmsImage };

function asUrl(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'url' in value) {
    const u = (value as { url?: unknown }).url;
    return typeof u === 'string' ? u : '';
  }
  return '';
}

function asSections(value: unknown): PublicSection[] {
  return Array.isArray(value) ? (value as PublicSection[]) : [];
}

async function reportPublic404(urlPath: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let apiBase: string | null = null;
  if (siteUrl) {
    try {
      apiBase = `${new URL(siteUrl).origin}/api/cms`;
    } catch {
      apiBase = null;
    }
  }
  if (!apiBase) {
    const h = await headers();
    const host = h.get('host');
    if (!host) return;
    const proto = h.get('x-forwarded-proto') ?? 'https';
    apiBase = `${proto}://${host}/api/cms`;
  }
  recordPublic404(apiBase, urlPath);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path } = await params;
  const urlPath = path && path.length ? `/${path.join('/')}` : '/';
  if (isAdminPath(urlPath)) return {};
  if (urlPath === '/') {
    const result = await getCachedPageMetadata(urlPath);
    const title = result && typeof result === 'object' && 'title' in result ? result.title : undefined;
    const titleText = typeof title === 'string' ? title : '';
    if (titleText && titleText !== 'Home' && titleText !== 'fence-outlet') return result;
    return {
      title: 'Fence Materials & Professional Installation | Fence Outlet',
      description:
        'Fence materials and professional installation from Fence Outlet. 30+ years, 8 Florida locations, licensed and insured.',
    };
  }
  const result = await getCachedPageMetadata(urlPath);
  // cms-core composes a Next.js-compatible metadata object server-side, so we
  // can spread it directly instead of re-deriving OG/Twitter/robots tags.
  return result;
}

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const { path } = await params;
  // Editors arrive with `?preview=<signed token>` (admin "View on site" /
  // inline site preview). Forwarding it to /resolve renders the draft at its
  // real URL; without a valid token only PUBLISHED content resolves.
  const { preview } = await searchParams;
  const urlPath = path && path.length ? `/${path.join('/')}` : '/';
  if (isAdminPath(urlPath)) notFound();
  const result = preview
    ? await resolveDocument(urlPath, preview)
    : await getCachedPublishedDocument(urlPath);

  if (!result?.data) {
    if (urlPath === '/') return <HomePage />;
    if (!preview) void reportPublic404(urlPath);
    notFound();
  }

  const doc = result.data;
  const data = (doc.data ?? {}) as Record<string, unknown>;
  const isPage = doc.collection === 'pages';

  const sections = asSections(data.sections);
  const str = (key: string) => (typeof data[key] === 'string' ? (data[key] as string) : '');

  const formSlugs = collectFormSlugsFromSections(sections);
  const prefetchedForms =
    formSlugs.length > 0 ? await prefetchPublicForms(getPublicForm, formSlugs) : {};

  const ctx: PostContext = {
    title: str('title'),
    excerpt: str('excerpt'),
    body: str('body'),
    // Prefer the resolver's featured image (carries intrinsic width/height from
    // the media library) so the post header renders a CLS-free, dimensioned LCP
    // image; fall back to the raw field URL.
    featuredImageUrl: result.post?.featuredImage?.url ?? asUrl(data.featuredImage),
    featuredImageWidth: result.post?.featuredImage?.width,
    featuredImageHeight: result.post?.featuredImage?.height,
    publishDate: str('publishDate') || null,
    category: str('category'),
    author: result.post?.author ?? undefined,
    relatedPosts: result.post?.relatedPosts ?? [],
  };

  // One LCP budget shared by the post header + body sections so only the first
  // image on the page is eager/high-priority; everything else lazy-loads.
  const lcp = createLcpController();
  const pageOptions = { ...renderOptions, lcp, prefetchedForms };

  if (urlPath === '/' && isFencePage(sections)) {
    const state = pageStateFromSections(sections);
    const header = sections.filter((section) => section.sectionType === 'site-header');
    const footer = sections.filter((section) => section.sectionType === 'site-footer');
    const body = sections.filter((section) => section.sectionType !== 'site-header' && section.sectionType !== 'site-footer');
    return (
      <>
        {result.jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(result.jsonLd).replace(/</g, '\u003c'),
            }}
          />
        ) : null}
        {result.preview?.active && (
          <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            Preview mode — you are viewing a draft. This page is not publicly visible.
          </div>
        )}
        <PageFrame className={homeFontClassName} {...state}>
          <Sections sections={header} ctx={ctx} options={pageOptions} />
          <main id="main">
            <Sections sections={body} ctx={ctx} options={pageOptions} />
          </main>
          <Sections sections={footer} ctx={ctx} options={pageOptions} />
        </PageFrame>
      </>
    );
  }

  if (urlPath === '/') return <HomePage />;

  return (
    <main className="min-h-screen bg-white">
      {result.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(result.jsonLd).replace(/</g, '\u003c'),
          }}
        />
      ) : null}
      {result.preview?.active && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          Preview mode — you are viewing a draft. This page is not publicly visible.
        </div>
      )}
      {/* Posts render a design-driven header from their post-type template;
          pages render their own hero section instead. */}
      {!isPage && (
        <PostHeader
          config={coercePostHeader(result.template?.header)}
          ctx={ctx}
          options={pageOptions}
        />
      )}

      {sections.length ? (
        <Sections sections={sections} ctx={ctx} options={pageOptions} />
      ) : (
        <div className="mx-auto max-w-2xl px-6 py-24 text-center text-gray-400">
          This document has no sections yet.
        </div>
      )}
    </main>
  );
}
