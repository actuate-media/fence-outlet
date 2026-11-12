import { createCMSMiddleware } from '@prenta/core/middleware';
import { applyPublicRedirect, observeGeoTraffic } from '@prenta/core/site';
import { NextResponse, type NextRequest } from 'next/server';
import cmsConfig from './prenta.config';

const cmsMiddleware = createCMSMiddleware(cmsConfig);

function toNextRedirect(response: Response): Response {
  if (response.status === 410) return new NextResponse('Gone', { status: 410 });
  const location = response.headers.get('Location');
  if (!location) return response;
  const status = [301, 302, 307, 308].includes(response.status) ? response.status : 301;
  return NextResponse.redirect(location, status as 301 | 302 | 307 | 308);
}

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Admin + API guard (auth, IP allowlist).
  const result = await cmsMiddleware(request);
  if (result) return result;

  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/securelogin');
  const isApi = pathname.startsWith('/api');

  // Yoast-style public sitemap URLs at site root (post-sitemap.xml,
  // post-sitemap2.xml, …) and browser XSLT stylesheets. Rewrites to the
  // cms-core handler; /sitemap.xml is handled by app/sitemap.xml/route.ts.
  if (
    !isAdmin &&
    !isApi &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    new RegExp('^/(?:[a-z0-9-]+-sitemap\\d*\\.xml|sitemap-index\\.xsl|sitemap\\.xsl)$', 'i').test(pathname)
  ) {
    const target = pathname.endsWith('.xsl')
      ? new URL(`/api/cms${pathname}`, origin)
      : new URL(`/api/cms/sitemaps${pathname}`, origin);
    return NextResponse.rewrite(target);
  }

  // Per-page Markdown: rewrite /{path}.md -> the cms-core md route so agents can
  // fetch clean Markdown of any published page. The route serves noindex and the
  // URLs are never in the sitemap, so the HTML page stays canonical.
  if (
    !isAdmin &&
    !isApi &&
    pathname.endsWith('.md') &&
    (request.method === 'GET' || request.method === 'HEAD')
  ) {
    const docPath = pathname.slice(0, -3) || '/';
    const rewriteUrl = new URL('/api/cms/md', origin);
    rewriteUrl.searchParams.set('path', docPath);
    return NextResponse.rewrite(rewriteUrl);
  }

  // SEO redirects — shared engine (chain collapse, preserveQuery, record-hit).
  // Same helper Astro split-deploy sites use via createAstroRedirectMiddleware.
  if (!isAdmin && !isApi) {
    // AI visibility: beacon AI/search-bot hits and AI-engine referrals to the
    // CMS (SEO → AI visibility). Fire-and-forget; nothing is sent for humans.
    // Runs before the redirect check so a bot hitting a redirected URL still counts.
    observeGeoTraffic(request, { baseUrl: origin, adminPaths: ['/admin', '/securelogin'] });
    const redirect = await applyPublicRedirect(request, {
      baseUrl: origin,
      adminPaths: ['/admin', '/securelogin'],
    });
    if (redirect) return toNextRedirect(redirect);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-prenta-pathname', pathname);
  // Editors preview drafts via `?preview=<token>`. Flag those requests so the
  // layout can skip script tags marked "disable in preview" (analytics/pixels
  // shouldn't fire while editing).
  if (request.nextUrl.searchParams.has('preview')) {
    requestHeaders.set('x-prenta-preview', '1');
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Admin + API for the auth guard, plus all public routes for redirects
  // (excluding Next internals and static files). The `(?!md$)` exception lets
  // `/{path}.md` requests through; a dedicated matcher re-admits legacy
  // content-page extensions (.html/.php/.aspx/.jsp/.cfm) so migrated URLs like
  // /products.html can still be redirected. Additional matchers expose
  // Yoast-style `*-sitemap*.xml` and XSL stylesheets at the site root.
  matcher: [
    '/((?!_next/|.*\\.(?!md$)[a-zA-Z0-9]+$).*)',
    '/((?!_next/|api/).*\\.(?:html?|php|aspx?|jsp|cfm)$)',
    '/((?:[a-z0-9-]+-sitemap\\d*)\\.xml)',
    '/sitemap.xsl',
    '/sitemap-index.xsl',
  ],
};
