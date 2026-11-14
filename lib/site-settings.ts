import { getGlobal } from './cms';

export interface SiteSettings {
  siteName?: string;
  description?: string;
  phone?: string;
  email?: string;
  [key: string]: unknown;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getGlobal<SiteSettings>('site-settings');
  } catch {
    return null;
  }
}
