import { cookies, headers } from 'next/headers';
import { nearestStoreByPoint, nearestStoreName, storeNameFromSlug } from './data';
import type { InitialStore } from './store-choice';

export type { InitialStore } from './store-choice';

export async function resolveInitialStore(): Promise<InitialStore> {
  const jar = await cookies();
  const savedName = storeNameFromSlug(jar.get('fo_store')?.value ?? '');
  const savedSource = jar.get('fo_store_src')?.value;
  const savedZip = jar.get('fo_zip')?.value ?? '';
  if (savedName) {
    if (savedSource === 'zip' && /^\d{5}$/.test(savedZip)) {
      return { source: 'zip', storeName: nearestStoreName(savedZip), zip: savedZip };
    }
    if (savedSource === 'ip') return { source: 'ip', storeName: savedName, zip: '' };
    return { source: 'picked', storeName: savedName, zip: '' };
  }

  const requestHeaders = await headers();
  const lat = Number(requestHeaders.get('x-vercel-ip-latitude'));
  const lng = Number(requestHeaders.get('x-vercel-ip-longitude'));
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) {
    return { source: 'ip', storeName: nearestStoreByPoint(lat, lng), zip: '' };
  }
  return { source: 'default', storeName: 'Orlando', zip: '' };
}
