export type StoreName =
  | 'Orlando'
  | 'Oviedo'
  | 'Daytona'
  | 'Melbourne'
  | 'Tampa'
  | 'North Port'
  | 'Port Richey'
  | 'Jacksonville';

export interface Store {
  name: StoreName;
  fullName: string;
  address: string;
  phone: string;
  tel: string;
  url: string;
}

export interface MaterialLink {
  label: string;
  url: string;
}

export interface Material {
  name: string;
  desc: string;
  image: string;
  alt: string;
  install: string;
  buy: string;
  links: MaterialLink[];
}

export interface BoxKit {
  name: string;
  price: string;
  spec: string;
  image: string;
  alt: string;
  url: string;
}

const site = 'https://www.fenceoutlet.com';

export const stores: Store[] = [
  {
    name: 'Orlando',
    fullName: 'Orlando',
    address: '9671 S Orange Blossom Trail, Orlando, FL 32837',
    phone: '407.851.6660',
    tel: 'tel:+14078516660',
    url: `${site}/fence-company-orlando/`,
  },
  {
    name: 'Oviedo',
    fullName: 'Oviedo',
    address: '1724 W Broadway St, Oviedo, FL 32765',
    phone: '407.359.9092',
    tel: 'tel:+14073599092',
    url: `${site}/fence-company-oviedo/`,
  },
  {
    name: 'Daytona',
    fullName: 'Daytona',
    address: '1725 S Nova Rd, South Daytona, FL 32119',
    phone: '386.267.6760',
    tel: 'tel:+13862676760',
    url: `${site}/fence-company-daytona/`,
  },
  {
    name: 'Melbourne',
    fullName: 'Melbourne',
    address: '25 South Wickham Road, Melbourne, FL 32904',
    phone: '321.802.6480',
    tel: 'tel:+13218026480',
    url: `${site}/fence-company-melbourne/`,
  },
  {
    name: 'Tampa',
    fullName: 'Tampa',
    address: '201 S Falkenburg Rd, Tampa, FL 33619',
    phone: '813.651.3623',
    tel: 'tel:+18136513623',
    url: `${site}/fence-company-tampa/`,
  },
  {
    name: 'North Port',
    fullName: 'North Port / Ft. Myers',
    address: '12984 S Tamiami Trail, North Port, FL 34287',
    phone: '941.346.6800',
    tel: 'tel:+19413466800',
    url: `${site}/fence-company-north-port-ft-myers/`,
  },
  {
    name: 'Port Richey',
    fullName: 'Port Richey',
    address: '11507 US-19, Port Richey, FL 34668',
    phone: '727.857.7590',
    tel: 'tel:+17278577590',
    url: `${site}/fence-company-port-richey/`,
  },
  {
    name: 'Jacksonville',
    fullName: 'Jacksonville',
    address: '250 Lane Ave N. Jacksonville, FL 32254',
    phone: '904.539.5605',
    tel: 'tel:+19045395605',
    url: `${site}/fence-company-jacksonville/`,
  },
];

const zipMap: Record<string, StoreName> = {
  '320': 'Jacksonville',
  '322': 'Jacksonville',
  '321': 'Daytona',
  '327': 'Oviedo',
  '328': 'Orlando',
  '347': 'Orlando',
  '329': 'Melbourne',
  '335': 'Tampa',
  '336': 'Tampa',
  '346': 'Port Richey',
  '342': 'North Port',
  '339': 'North Port',
};

export function nearestStoreName(zip: string): StoreName {
  return zipMap[zip.slice(0, 3)] ?? 'Orlando';
}

const storePoints: Record<StoreName, { lat: number; lng: number }> = {
  Orlando: { lat: 28.4158, lng: -81.4037 },
  Oviedo: { lat: 28.6698, lng: -81.2084 },
  Daytona: { lat: 29.1654, lng: -81.0003 },
  Melbourne: { lat: 28.0784, lng: -80.6081 },
  Tampa: { lat: 27.9472, lng: -82.3265 },
  'North Port': { lat: 27.0155, lng: -82.2286 },
  'Port Richey': { lat: 28.2867, lng: -82.7201 },
  Jacksonville: { lat: 30.3398, lng: -81.7326 },
};

function distanceMiles(lat: number, lng: number, point: { lat: number; lng: number }): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(point.lat - lat);
  const dLng = toRad(point.lng - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(point.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestStoreByPoint(lat: number, lng: number): StoreName {
  let closest: StoreName = 'Orlando';
  let best = Number.POSITIVE_INFINITY;
  for (const store of stores) {
    const miles = distanceMiles(lat, lng, storePoints[store.name]);
    if (miles < best) {
      best = miles;
      closest = store.name;
    }
  }
  return closest;
}

export function storeSlug(store: { name: string; url?: string }): string {
  const fromUrl = store.url?.match(/fence-company-([^/]+)\/?$/)?.[1];
  if (fromUrl) return fromUrl;
  const known = stores.find((item) => item.name === store.name);
  return known?.url.match(/fence-company-([^/]+)\/?$/)?.[1] ?? 'orlando';
}

export function storeNameFromSlug(slug: string): StoreName | null {
  const store = stores.find((item) => storeSlug(item) === slug);
  return store?.name ?? null;
}

export function storeByName(name: StoreName): Store {
  const store = stores.find((item) => item.name === name);
  if (!store) {
    throw new Error(`Unknown store ${name}`);
  }
  return store;
}

export const materials: Material[] = [
  {
    name: 'Vinyl',
    desc: 'Privacy and a clean, lasting look with low-maintenance vinyl.',
    image: '/homepage/fence-vinyl.jpg',
    alt: 'Close-up of white vinyl fence panels',
    install: `${site}/vinyl-fencing/`,
    buy: `${site}/fence/vinyl/vinyl-sections/`,
    links: [
      { label: 'Sections', url: `${site}/fence/vinyl/vinyl-sections/` },
      { label: 'Posts', url: `${site}/fence/vinyl/vinyl-posts/` },
      { label: 'Gates', url: `${site}/fence/vinyl/vinyl-gates/` },
      { label: 'Caps', url: `${site}/fence/vinyl/vinyl-caps/` },
      { label: 'Parts', url: `${site}/fence/vinyl/vinyl-parts/` },
      { label: 'Accessories', url: `${site}/fence/vinyl/vinyl-accessories/` },
    ],
  },
  {
    name: 'Wood',
    desc: 'Privacy and natural character for your property.',
    image: '/homepage/fence-wood.jpg',
    alt: 'Close-up of wood privacy fence boards',
    install: `${site}/wood-fencing/`,
    buy: `${site}/fence/wood/wood-sections/`,
    links: [
      { label: 'Sections', url: `${site}/fence/wood/wood-sections/` },
      { label: 'Posts', url: `${site}/fence/wood/wood-posts/` },
      { label: 'Gates', url: `${site}/fence/wood/wood-gates/` },
      { label: 'Accessories', url: `${site}/fence/wood/wood-accessories/` },
    ],
  },
  {
    name: 'Aluminum',
    desc: 'Durable, stylish fencing for residential and commercial properties.',
    image: '/homepage/fence-aluminum.jpg',
    alt: 'Close-up of black ornamental aluminum fence',
    install: `${site}/aluminum-fencing/`,
    buy: `${site}/fence/aluminum/aluminum-sections/`,
    links: [
      { label: 'Sections', url: `${site}/fence/aluminum/aluminum-sections/` },
      { label: 'Posts', url: `${site}/fence/aluminum/aluminum-posts/` },
      { label: 'Gates', url: `${site}/fence/aluminum/aluminum-gates/` },
      { label: 'Accessories', url: `${site}/fence/aluminum/aluminum-accessories/` },
    ],
  },
  {
    name: 'Chain Link',
    desc: 'Landscape detail and security at low prices.',
    image: '/homepage/fence-chain-link.jpg',
    alt: 'Close-up of galvanized chain link fence',
    install: `${site}/chain-link-fencing/`,
    buy: `${site}/fence/chain-link/chain-link-wire/`,
    links: [
      { label: 'Gates', url: `${site}/fence/chain-link/chain-link-gates/` },
      { label: 'Wire', url: `${site}/fence/chain-link/chain-link-wire/` },
      { label: 'Framework', url: `${site}/fence/chain-link/chain-link-framework/` },
      { label: 'Fittings', url: `${site}/fence/chain-link/chain-link-fittings/` },
      { label: 'Accessories', url: `${site}/fence/chain-link/chain-link-accessories/` },
    ],
  },
];

export const boxes: BoxKit[] = [
  {
    name: 'Wood',
    price: '$1,392',
    spec: '15 sections, 18 posts, walk gate and hardware',
    image: '/homepage/box-wood.jpg',
    alt: 'Wood Fence in a Box: 15 sections, 18 posts, gate and hardware',
    url: `${site}/product/wood-fence-in-a-box/`,
  },
  {
    name: 'Vinyl',
    price: '$2,128',
    spec: '20 sections, 22 posts and caps, walk gate, 22 bags cement mix',
    image: '/homepage/box-vinyl.jpg',
    alt: 'Vinyl Fence in a Box: 20 sections, 22 posts and flat caps, 22 bags cement mix, gate and hardware',
    url: `${site}/product/vinyl-fence-in-a-box/`,
  },
  {
    name: 'Aluminum',
    price: '$2,336',
    spec: '20 sections, 22 posts, walk gate and hardware',
    image: '/homepage/box-aluminum.jpg',
    alt: 'Aluminum Fence in a Box: 20 sections, 22 posts, gate and hardware',
    url: `${site}/product/aluminum-fence-in-a-box/`,
  },
];

export const financingDisclaimer =
  'Financing available to qualified buyers with approved credit. Promotional financing offers, including 0% interest, are subject to lender approval. Actual APR, loan amount, repayment term, and monthly payment vary based on creditworthiness and other qualifying factors. Restrictions may apply. Contact us for complete details.';

export const smsConsent =
  'By checking this box, I consent to receive text messages related to Scheduling, Updates, Reminders Appointments from Fence Outlet. You can reply STOP to opt-out at any time. Messages and data rates may apply. Message frequency will vary. Reply HELP to 407-851-6660 for assistance.';
