export type StoreSource = 'picked' | 'zip' | 'ip' | 'default';

export interface InitialStore {
  source: StoreSource;
  storeName: string;
  zip: string;
}

export function storeSourceText(source: StoreSource, zip: string): string {
  switch (source) {
    case 'picked':
      return 'You chose this store.';
    case 'zip':
      return `Nearest store to ZIP ${zip}.`;
    case 'ip':
      return 'Based on your approximate location.';
    case 'default':
      return 'Showing our Orlando store. Enter your ZIP or pick the store nearest you.';
    default: {
      const unreachable: never = source;
      return unreachable;
    }
  }
}

const cookieBase = ';path=/;max-age=7776000;SameSite=Lax';

export function rememberStore(slug: string, source: Exclude<StoreSource, 'default'>, zip: string) {
  document.cookie = `fo_store=${slug}${cookieBase}`;
  document.cookie = `fo_store_src=${source}${cookieBase}`;
  document.cookie = source === 'zip' && zip.length === 5
    ? `fo_zip=${zip}${cookieBase}`
    : 'fo_zip=;path=/;max-age=0';
}

type CtmWindow = Window & {
  __ctm?: { main?: { runNow?: (el: Element) => void } };
};

export function refreshCtmPhones() {
  const runNow = (window as CtmWindow).__ctm?.main?.runNow;
  if (!runNow) return;
  document.querySelectorAll('.ctm-phone').forEach((el) => {
    runNow(el);
  });
}
