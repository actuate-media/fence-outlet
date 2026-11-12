import { readFileSync, writeFileSync } from 'node:fs';

const content = await import(new URL('../src/homepage/content.ts', import.meta.url).href);
const {
  fenceBoxContent,
  fenceTypesContent,
  financingContent,
  footerContent,
  headerContent,
  heroContent,
  installationsContent,
  locationsContent,
  trustContent,
} = content;

const header = headerContent(undefined);
header.installChecks = header.installChecks.map((text) => ({ text }));

const hero = heroContent(undefined);
hero.tabs = ['install', 'diy', 'showrooms', 'financing'].map((variant) => ({
  variant,
  ...hero.tabs[variant],
}));

const sections = [
  ['sec-header', 'site-header', 'Site Header', header],
  ['sec-trust', 'trust-band', 'Trust Band', trustContent(undefined)],
  ['sec-hero', 'quote-hero', 'Quote Hero', hero],
  ['sec-fence-types', 'fence-types', 'Fence Types', fenceTypesContent(undefined)],
  ['sec-fence-box', 'fence-box', 'Fence in a Box', fenceBoxContent(undefined)],
  ['sec-financing', 'financing-offer', 'Financing Offer', financingContent(undefined)],
  ['sec-locations', 'store-locations', 'Store Locations', locationsContent(undefined)],
  ['sec-installations', 'installations', 'Installations', installationsContent(undefined)],
  ['sec-footer', 'site-footer', 'Site Footer', footerContent(undefined)],
].map(([id, sectionType, name, body]) => ({
  id,
  sectionType,
  name,
  visible: true,
  content: body,
  settings: { backgroundType: 'none' },
}));

const home = {
  status: 'PUBLISHED',
  data: {
    title: 'Home',
    slug: 'home',
    path: '/',
    metaTitle: 'Fence Materials & Professional Installation | Fence Outlet',
    metaDescription:
      'Fence materials and professional installation from Fence Outlet. 30+ years, 8 Florida locations, licensed and insured.',
    sections,
  },
};

const seedPath = new URL('../prenta.seed.json', import.meta.url);
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
const pages = seed.collections.pages;
const index = pages.findIndex((page) => page.data?.slug === 'home');
if (index < 0) {
  console.error('home page missing from prenta.seed.json');
  process.exit(1);
}
pages[index] = home;
writeFileSync(seedPath, `${JSON.stringify(seed, null, 2)}\n`);
console.log('home seed written', sections.length);
