import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET(request: Request): Promise<NextResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = siteUrl ? new URL(siteUrl).origin : new URL(request.url).origin;
  try {
    const res = await fetch(`${origin}/api/cms/feed.json`, {
      headers: { accept: 'application/feed+json' },
      next: { revalidate: 300, tags: ['prenta', 'prenta:sitemap'] },
    });
    if (!res.ok) {
      return new NextResponse('Feed unavailable', { status: res.status });
    }
    const body = await res.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/feed+json; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch {
    return new NextResponse('Feed unavailable', { status: 502 });
  }
}
