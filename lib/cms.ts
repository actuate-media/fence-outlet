import { createNextSiteHelpers } from '@prenta/core/next/site';

const site = createNextSiteHelpers({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  revalidate: 300,
});

export const {
  getGlobal,
  resolveDocument,
  getNavigation,
  getPublicForm,
  getCachedPublishedDocument,
  getCachedPageMetadata,
} = site;
