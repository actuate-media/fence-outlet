import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET(request: Request): Promise<NextResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = siteUrl ? new URL(siteUrl).origin : new URL(request.url).origin;
  try {
    const res = await fetch(`${origin}/api/cms/sitemap.xml`, {
      headers: { accept: 'application/xml' },
      next: { revalidate: 300, tags: ['prenta', 'prenta:sitemap'] },
    });
    if (!res.ok) {
      return new NextResponse('Sitemap unavailable', { status: res.status });
    }
    const xml = await res.text();
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch {
    return new NextResponse('Sitemap unavailable', { status: 502 });
  }
}
