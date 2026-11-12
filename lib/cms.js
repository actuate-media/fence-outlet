import { createNextSiteHelpers } from '@prenta/core/next/site';

const cms = createNextSiteHelpers({
  baseUrl: process.env.PRENTA_CMS_URL,
  apiKey: process.env.PRENTA_CMS_API_KEY,
});

export function getHomePage() {
  if (!process.env.PRENTA_CMS_URL) {
    return null;
  }

  return cms.getCachedPublishedDocument('/');
}
