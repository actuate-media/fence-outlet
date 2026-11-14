import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET(request: Request): Promise<NextResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin = siteUrl ? new URL(siteUrl).origin : new URL(request.url).origin;
  try {
    const res = await fetch(`${origin}/api/cms/llms.txt`, {
      headers: { accept: 'text/plain' },
      next: { revalidate: 3600, tags: ['prenta'] },
    });
    if (!res.ok) {
      return new NextResponse('llms.txt unavailable', { status: res.status });
    }
    const body = await res.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch {
    return new NextResponse('llms.txt unavailable', { status: 502 });
  }
}
