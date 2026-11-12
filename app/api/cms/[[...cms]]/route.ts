import { getCache, invalidateByTag } from '@vercel/functions';
import { revalidateTag } from 'next/cache';
import { getPrisma } from '../../../../lib/prisma';
import config from '../../../../prenta.config';
import { handlePrentaAPI } from '@prenta/core/api';
import { assertServingOriginConfigured } from '@prenta/core';

// Launch Gate E — fail loud when NEXT_PUBLIC_SITE_URL is unset in production
// (siteUrlFromRequest would otherwise fall back to the request host).
assertServingOriginConfigured({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? config.seo?.siteUrl,
  strict:
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production',
});

/**
 * Tag-based caching for public CMS reads + on-demand invalidation after writes.
 * See https://prentacms.dev/docs/caching — mirrors apps/dev production wiring.
 */
const handler = handlePrentaAPI({
  prismaClient: getPrisma(),
  config: {
    ...config,
    cache: {
      publicReads: {
        enabled: true,
        maxAge: 60,
        staleWhileRevalidate: 300,
      },
      runtimeCache: {
        adapter: getCache(),
        ttl: 60,
      },
      onInvalidate: async (tags: string[]) => {
        for (const tag of tags) revalidateTag(tag, { expire: 0 });
        await getCache().expireTag(tags);
        try {
          await invalidateByTag(tags);
        } catch (err) {
          console.warn('[prenta][cache] invalidateByTag unavailable:', err);
        }
      },
    },
  },
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
