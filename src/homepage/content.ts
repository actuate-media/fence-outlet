import { boxes, financingDisclaimer, materials, smsConsent, stores } from './data';

export interface LinkItem {
  label: string;
  url: string;
}

export interface HeaderContent {
  logoSrc: string;
  logoAlt: string;
  financingUrl: string;
  installTitle: string;
  installBody: string;
  installChecks: string[];
  installAboutLabel: string;
  installAboutUrl: string;
  installOfferImage: string;
  installOfferAlt: string;
  installOfferTitle: string;
  installOfferNote: string;
  installOfferLinkLabel: string;
  installOfferLinkUrl: string;
  installCta: string;
  materialsOfferTitle: string;
  materialsOfferBody: string;
  materialsCta: string;
  boxTitle: string;
  boxBody: string;
  boxCompareLabel: string;
  boxCompareUrl: string;
  hoursTitle: string;
  hoursBody: string;
  hoursLinkLabel: string;
  hoursLinkUrl: string;
  hoursImage: string;
  hoursAlt: string;
  drawerFinancingUrl: string;
  drawerQuoteLabel: string;
  drawerHours: string;
}

export interface TrustContent {
  heading: string;
  line: string;
}

export interface HeroTabContent {
  image: string;
  alt: string;
  label: string;
  buttonLabel: string;
  eyebrow: string;
  heading: string;
  lead: string;
  detail: string;
  emphasis: string;
  linkLabel: string;
  linkUrl: string;
}

export interface HeroContent {
  installLabel: string;
  installNote: string;
  diyLabel: string;
  diyNote: string;
  smsLabel: string;
  privacyUrl: string;
  privacyLabel: string;
  tabs: Record<'install' | 'diy' | 'showrooms' | 'financing', HeroTabContent>;
}

export interface MaterialContent {
  name: string;
  desc: string;
  image: string;
  alt: string;
  installUrl: string;
  installLabel: string;
  buyUrl: string;
  buyLabel: string;
  links: LinkItem[];
}

export interface FenceTypesContent {
  heading: string;
  intro: string;
  materials: MaterialContent[];
}

export interface KitContent {
  name: string;
  price: string;
  spec: string;
  image: string;
  alt: string;
  url: string;
  cta: string;
}

export interface FenceBoxContent {
  heading: string;
  intro: string;
  kits: KitContent[];
}

export interface FinancingContent {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  disclaimer: string;
}

export interface StoreContent {
  name: string;
  fullName: string;
  address: string;
  phone: string;
  tel: string;
  url: string;
}

export interface LocationsContent {
  heading: string;
  stores: StoreContent[];
}

export interface InstallationsContent {
  heading: string;
  beforeImage: string;
  beforeAlt: string;
  beforeCaption: string;
  afterImage: string;
  afterAlt: string;
  afterCaption: string;
  reviewsNote: string;
}

export interface FooterColumn {
  label: string;
  links: LinkItem[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface FooterContent {
  logoSrc: string;
  logoAlt: string;
  blurb: string;
  quoteLabel: string;
  columns: FooterColumn[];
  locationsHeading: string;
  hours: string;
  bbbUrl: string;
  bbbImage: string;
  bbbAlt: string;
  license: string;
  copyright: string;
  privacyLabel: string;
  privacyUrl: string;
  socials: SocialLink[];
}

const site = 'https://www.fenceoutlet.com';

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function media(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value;
  const row = record(value);
  const url = text(row.url, '') || text(row.src, '');
  return url || fallback;
}

function links(value: unknown, fallback: LinkItem[]): LinkItem[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    const row = record(item);
    const label = text(row.label, '');
    const url = text(row.url, '');
    return label || url ? [{ label, url }] : [];
  });
}

function lines(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.flatMap((item) => {
    if (typeof item === 'string') return [item];
    const row = record(item);
    const line = text(row.text, '');
    return line ? [line] : [];
  });
}

export function headerContent(value: unknown): HeaderContent {
  const c = record(value);
  const fallback: HeaderContent = {
    logoSrc: '/homepage/logo-fence-outlet.png',
    logoAlt: 'Fence Outlet home',
    financingUrl: `${site}/professional-fence-financing/`,
    installTitle: 'A Complete Turnkey Project',
    installBody: 'We measure your project, take care of the formalities and install your fence, so you can sit back and enjoy it.',
    installChecks: [
      'Free estimate at your home',
      'Permits and HOA paperwork handled',
      'Lifetime materials warranty on most products',
      'One-year workmanship warranty',
    ],
    installAboutLabel: 'About Professional Installation',
    installAboutUrl: `${site}/professional-installation/`,
    installOfferImage: '/homepage/hero-tab-install.jpg',
    installOfferAlt: 'Cream vinyl privacy fence installed along a landscaped Florida yard',
    installOfferTitle: 'Installed from $125/mo',
    installOfferNote: 'On approved credit.',
    installOfferLinkLabel: 'See details',
    installOfferLinkUrl: '#financing',
    installCta: 'Book a Free Estimate',
    materialsOfferTitle: 'Millions in Inventory In Stock',
    materialsOfferBody: 'See and feel every style at our 8 showrooms. Store pickup or next business day delivery.',
    materialsCta: 'Get a Materials Quote',
    boxTitle: 'Everything for 120 Feet of Fence',
    boxBody: "Three of our most common styles, built for an average backyard, with a standard 4' walk gate and hardware included.",
    boxCompareLabel: 'Compare All Boxes',
    boxCompareUrl: `${site}/fence/fence-in-a-box/`,
    hoursTitle: 'Store Hours',
    hoursBody: 'Monday–Friday 8AM–5PM\nSaturday 8AM–4PM\nSunday Closed',
    hoursLinkLabel: 'Contact Us',
    hoursLinkUrl: `${site}/contact-us/`,
    hoursImage: '/homepage/hero-tab-showrooms.jpg',
    hoursAlt: 'Fence Outlet store front with orange awnings',
    drawerFinancingUrl: `${site}/professional-fence-financing/`,
    drawerQuoteLabel: 'Get a Free Quote',
    drawerHours: 'Mon–Fri 8AM–5PM · Sat 8AM–4PM · Sun Closed',
  };
  return {
    ...fallback,
    logoSrc: media(c.logoSrc, fallback.logoSrc),
    logoAlt: text(c.logoAlt, fallback.logoAlt),
    financingUrl: text(c.financingUrl, fallback.financingUrl),
    installTitle: text(c.installTitle, fallback.installTitle),
    installBody: text(c.installBody, fallback.installBody),
    installChecks: lines(c.installChecks, fallback.installChecks),
    installAboutLabel: text(c.installAboutLabel, fallback.installAboutLabel),
    installAboutUrl: text(c.installAboutUrl, fallback.installAboutUrl),
    installOfferImage: media(c.installOfferImage, fallback.installOfferImage),
    installOfferAlt: text(c.installOfferAlt, fallback.installOfferAlt),
    installOfferTitle: text(c.installOfferTitle, fallback.installOfferTitle),
    installOfferNote: text(c.installOfferNote, fallback.installOfferNote),
    installOfferLinkLabel: text(c.installOfferLinkLabel, fallback.installOfferLinkLabel),
    installOfferLinkUrl: text(c.installOfferLinkUrl, fallback.installOfferLinkUrl),
    installCta: text(c.installCta, fallback.installCta),
    materialsOfferTitle: text(c.materialsOfferTitle, fallback.materialsOfferTitle),
    materialsOfferBody: text(c.materialsOfferBody, fallback.materialsOfferBody),
    materialsCta: text(c.materialsCta, fallback.materialsCta),
    boxTitle: text(c.boxTitle, fallback.boxTitle),
    boxBody: text(c.boxBody, fallback.boxBody),
    boxCompareLabel: text(c.boxCompareLabel, fallback.boxCompareLabel),
    boxCompareUrl: text(c.boxCompareUrl, fallback.boxCompareUrl),
    hoursTitle: text(c.hoursTitle, fallback.hoursTitle),
    hoursBody: text(c.hoursBody, fallback.hoursBody),
    hoursLinkLabel: text(c.hoursLinkLabel, fallback.hoursLinkLabel),
    hoursLinkUrl: text(c.hoursLinkUrl, fallback.hoursLinkUrl),
    hoursImage: media(c.hoursImage, fallback.hoursImage),
    hoursAlt: text(c.hoursAlt, fallback.hoursAlt),
    drawerFinancingUrl: text(c.drawerFinancingUrl, fallback.drawerFinancingUrl),
    drawerQuoteLabel: text(c.drawerQuoteLabel, fallback.drawerQuoteLabel),
    drawerHours: text(c.drawerHours, fallback.drawerHours),
  };
}

const heroTabs: HeroContent['tabs'] = {
  install: {
    image: '/homepage/hero-tab-install.jpg',
    alt: 'Cream vinyl privacy fence installed along a landscaped Florida yard',
    label: 'We Install It',
    buttonLabel: 'We Install It: professional installation',
    eyebrow: 'We Install It',
    heading: 'Professional Fence Installation',
    lead: 'Free estimate at your home. Permits and HOA paperwork handled.',
    detail: 'Installed from $125/mo on approved credit',
    emphasis: '$125/mo',
    linkLabel: '',
    linkUrl: '',
  },
  diy: {
    image: '/homepage/hero-tab-diy.jpg',
    alt: 'Fence Outlet associate walking customers through a showroom of white vinyl fence styles',
    label: 'You Build It',
    buttonLabel: 'You Build It: fence materials and DIY supply',
    eyebrow: 'You Build It',
    heading: 'Fence Materials & DIY Supply',
    lead: 'IN STOCK at 8 showrooms with NO wait. Store pickup or delivery.',
    detail: 'Fence in a Box from $1,392',
    emphasis: '$1,392',
    linkLabel: 'Shop Now',
    linkUrl: `${site}/fence/fence-in-a-box/`,
  },
  showrooms: {
    image: '/homepage/hero-tab-showrooms.jpg',
    alt: 'Fence Outlet store front with orange awnings',
    label: '8 Showrooms',
    buttonLabel: '8 Florida showrooms',
    eyebrow: '',
    heading: '8 Florida Showrooms',
    lead: 'See and feel every style. Mon–Fri 8–5 · Sat 8–4.',
    detail: '',
    emphasis: '',
    linkLabel: '',
    linkUrl: '',
  },
  financing: {
    image: '/homepage/hero-tab-financing.jpg',
    alt: 'White vinyl picket fence along a green lawn',
    label: '0% Financing',
    buttonLabel: 'Financing offers',
    eyebrow: '',
    heading: '12 Months 0% Interest',
    lead: 'On all of our fences. Starting at $125/month for 36 months for White Vinyl and Aluminum Fencing installed.',
    detail: '',
    emphasis: '',
    linkLabel: 'See financing details',
    linkUrl: '#financing',
  },
};

export function heroContent(value: unknown): HeroContent {
  const c = record(value);
  const fallback: HeroContent = {
    installLabel: 'Install It For Me',
    installNote: 'Free home estimate',
    diyLabel: "I'll Build It Myself",
    diyNote: 'Materials at 8 stores',
    smsLabel: 'Text me scheduling updates and reminders',
    privacyUrl: `${site}/privacy-policy/`,
    privacyLabel: 'privacy policy',
    tabs: heroTabs,
  };
  const tabs = { ...fallback.tabs };
  if (Array.isArray(c.tabs)) {
    for (const item of c.tabs) {
      const row = record(item);
      const variant = row.variant;
      if (variant !== 'install' && variant !== 'diy' && variant !== 'showrooms' && variant !== 'financing') continue;
      const current = tabs[variant];
      tabs[variant] = {
        image: media(row.image, current.image),
        alt: text(row.alt, current.alt),
        label: text(row.label, current.label),
        buttonLabel: text(row.buttonLabel, current.buttonLabel),
        eyebrow: text(row.eyebrow, current.eyebrow),
        heading: text(row.heading, current.heading),
        lead: text(row.lead, current.lead),
        detail: text(row.detail, current.detail),
        emphasis: text(row.emphasis, current.emphasis),
        linkLabel: text(row.linkLabel, current.linkLabel),
        linkUrl: text(row.linkUrl, current.linkUrl),
      };
    }
  }
  return {
    installLabel: text(c.installLabel, fallback.installLabel),
    installNote: text(c.installNote, fallback.installNote),
    diyLabel: text(c.diyLabel, fallback.diyLabel),
    diyNote: text(c.diyNote, fallback.diyNote),
    smsLabel: text(c.smsLabel, fallback.smsLabel),
    privacyUrl: text(c.privacyUrl, fallback.privacyUrl),
    privacyLabel: text(c.privacyLabel, fallback.privacyLabel),
    tabs,
  };
}

export function trustContent(value: unknown): TrustContent {
  const c = record(value);
  return {
    heading: text(c.heading, 'Fence Materials & Professional Installation'),
    line: text(c.line, '30+ Years · 8 Florida Locations · Licensed & Insured'),
  };
}

export function fenceTypesContent(value: unknown): FenceTypesContent {
  const c = record(value);
  const fallback = materials.map((item) => ({
    name: item.name,
    desc: item.desc,
    image: item.image,
    alt: item.alt,
    installUrl: item.install,
    installLabel: 'Get Installed',
    buyUrl: item.buy,
    buyLabel: 'Buy Materials',
    links: item.links,
  }));
  const rows = Array.isArray(c.materials)
    ? c.materials.flatMap((item) => {
        const row = record(item);
        const name = text(row.name, '');
        if (!name) return [];
        const match = fallback.find((entry) => entry.name === name);
        return [{
          name,
          desc: text(row.desc, match?.desc ?? ''),
          image: media(row.image, match?.image ?? ''),
          alt: text(row.alt, match?.alt ?? ''),
          installUrl: text(row.installUrl, match?.installUrl ?? ''),
          installLabel: text(row.installLabel, 'Get Installed'),
          buyUrl: text(row.buyUrl, match?.buyUrl ?? ''),
          buyLabel: text(row.buyLabel, 'Buy Materials'),
          links: links(row.links, match?.links ?? []),
        }];
      })
    : fallback;
  return {
    heading: text(c.heading, 'Pick Your Fence'),
    intro: text(c.intro, 'Every style, installed by us or ready for you to build.'),
    materials: rows,
  };
}

export function fenceBoxContent(value: unknown): FenceBoxContent {
  const c = record(value);
  const fallback = boxes.map((box) => ({ ...box, url: box.url, cta: 'Learn More' }));
  const kits = Array.isArray(c.kits)
    ? c.kits.flatMap((item) => {
        const row = record(item);
        const name = text(row.name, '');
        if (!name) return [];
        const match = fallback.find((entry) => entry.name === name);
        return [{
          name,
          price: text(row.price, match?.price ?? ''),
          spec: text(row.spec, match?.spec ?? ''),
          image: media(row.image, match?.image ?? ''),
          alt: text(row.alt, match?.alt ?? ''),
          url: text(row.url, match?.url ?? ''),
          cta: text(row.cta, 'Learn More'),
        }];
      })
    : fallback;
  return {
    heading: text(c.heading, 'Fence in a Box'),
    intro: text(c.intro, "Everything you need for an average 120' backyard, including a standard 4' walk gate with hardware."),
    kits,
  };
}

export function financingContent(value: unknown): FinancingContent {
  const c = record(value);
  return {
    heading: text(c.heading, '12 Months 0% Interest'),
    body: text(c.body, 'On all of our fences. Starting at $125/month for 36 months for White Vinyl and Aluminum Fencing installed.'),
    ctaLabel: text(c.ctaLabel, 'Get Your Financing Offer'),
    ctaUrl: text(c.ctaUrl, `${site}/professional-fence-financing/`),
    disclaimer: text(c.disclaimer, financingDisclaimer),
  };
}

export function locationsContent(value: unknown): LocationsContent {
  const c = record(value);
  const fallback = stores.map((store) => ({ ...store }));
  const rows = Array.isArray(c.stores)
    ? c.stores.flatMap((item) => {
        const row = record(item);
        const name = text(row.name, '');
        if (!name) return [];
        const match = fallback.find((entry) => entry.name === name);
        return [{
          name,
          fullName: text(row.fullName, match?.fullName ?? name),
          address: text(row.address, match?.address ?? ''),
          phone: text(row.phone, match?.phone ?? ''),
          tel: text(row.tel, match?.tel ?? ''),
          url: text(row.url, match?.url ?? ''),
        }];
      })
    : fallback;
  return { heading: text(c.heading, 'Come See It In Person'), stores: rows };
}

export function installationsContent(value: unknown): InstallationsContent {
  const c = record(value);
  return {
    heading: text(c.heading, 'Thousands of Installations Across Florida'),
    beforeImage: media(c.beforeImage, '/homepage/project-before.jpg'),
    beforeAlt: text(c.beforeAlt, 'Worn wood fence before replacement'),
    beforeCaption: text(c.beforeCaption, 'Before'),
    afterImage: media(c.afterImage, '/homepage/project-after.jpg'),
    afterAlt: text(c.afterAlt, 'New white vinyl privacy fence after installation'),
    afterCaption: text(c.afterCaption, 'After'),
    reviewsNote: text(c.reviewsNote, "[Fence Outlet's existing Customer Reviews widget stays here]"),
  };
}

export function footerContent(value: unknown): FooterContent {
  const c = record(value);
  const columns: FooterColumn[] = [
    { label: 'Fence Types', links: [
      { label: 'Vinyl', url: `${site}/vinyl-fencing/` },
      { label: 'Wood', url: `${site}/wood-fencing/` },
      { label: 'Aluminum', url: `${site}/aluminum-fencing/` },
      { label: 'Chain Link', url: `${site}/chain-link-fencing/` },
      { label: 'Fence in a Box', url: `${site}/fence/fence-in-a-box/` },
    ] },
    { label: 'Services', links: [
      { label: 'Professional Installation', url: `${site}/professional-installation/` },
      { label: 'Financing', url: `${site}/professional-fence-financing/` },
      { label: 'Get a Quote', url: '#quote' },
      { label: 'Customer Service', url: `${site}/customer-service/` },
      { label: 'Contact Us', url: `${site}/contact-us/` },
    ] },
    { label: 'Galleries', links: [
      { label: 'Before & After', url: `${site}/before-after/` },
      { label: 'Vinyl Fencing', url: `${site}/vinyl-fencing-gallery/` },
      { label: 'Wood Fencing', url: `${site}/wood-fencing-gallery/` },
      { label: 'Aluminum Fencing', url: `${site}/aluminum-fencing-gallery/` },
      { label: 'Chain Link Fencing', url: `${site}/chain-link-fencing-gallery/` },
      { label: 'Steel Fencing', url: `${site}/steel-fencing-gallery/` },
    ] },
    { label: 'Company', links: [
      { label: 'About Us', url: `${site}/about-us/` },
      { label: 'Testimonials', url: `${site}/testimonials/` },
      { label: 'FAQ', url: `${site}/faq/` },
      { label: 'Blog', url: `${site}/blog/` },
      { label: 'Careers', url: `${site}/careers/` },
    ] },
  ];
  const parsedColumns = Array.isArray(c.columns)
    ? c.columns.flatMap((item) => {
        const row = record(item);
        const label = text(row.label, '');
        if (!label) return [];
        return [{ label, links: links(row.links, []) }];
      })
    : columns;
  return {
    logoSrc: media(c.logoSrc, '/homepage/logo-fence-outlet.png'),
    logoAlt: text(c.logoAlt, 'Fence Outlet home'),
    blurb: text(c.blurb, "Central Florida's fencing expert for over 30 years. Locally owned and operated."),
    quoteLabel: text(c.quoteLabel, 'Get a Free Quote'),
    columns: parsedColumns,
    locationsHeading: text(c.locationsHeading, '8 Florida Locations'),
    hours: text(c.hours, 'Monday–Friday 8AM–5PM · Saturday 8AM–4PM · Sunday Closed'),
    bbbUrl: text(c.bbbUrl, 'https://www.bbb.org/central-florida/business-reviews/fencecontractors/fence-outlet-of-oviedo-in-oviedo-fl-90404640#sealclick'),
    bbbImage: media(c.bbbImage, '/homepage/bbb-seal.png'),
    bbbAlt: text(c.bbbAlt, 'Fence Outlet of Oviedo Better Business Bureau profile'),
    license: text(c.license, 'Certified Licensed Contractor, fully insured.\nLicense # C-10252 & C-10803'),
    copyright: text(c.copyright, 'Fence Outlet. All rights reserved.'),
    privacyLabel: text(c.privacyLabel, 'Privacy Policy'),
    privacyUrl: text(c.privacyUrl, `${site}/privacy-policy/`),
    socials: Array.isArray(c.socials)
      ? c.socials.flatMap((item) => {
          const row = record(item);
          const label = text(row.label, '');
          const url = text(row.url, '');
          return label && url ? [{ label, url }] : [];
        })
      : [
          { label: 'Fence Outlet on Facebook', url: 'https://www.facebook.com/FenceOutletInc' },
          { label: 'Fence Outlet on YouTube', url: 'https://www.youtube.com/channel/UCsgsYc4gbODA7MgYvTtWGUw/' },
        ],
  };
}

export function smsCopy(): string {
  return smsConsent;
}

export interface CmsSection {
  sectionType?: string;
  content?: unknown;
  visible?: boolean;
}

export const fenceSectionTypes = [
  'site-header',
  'trust-band',
  'quote-hero',
  'fence-types',
  'fence-box',
  'financing-offer',
  'store-locations',
  'installations',
  'site-footer',
] as const;

export function isFencePage(sections: CmsSection[]): boolean {
  return sections.some((section) => fenceSectionTypes.some((type) => type === section.sectionType));
}

export function pageStateFromSections(sections: CmsSection[]) {
  const body = (type: string) => sections.find((section) => section.sectionType === type)?.content;
  return {
    stores: locationsContent(body('store-locations')).stores,
    materials: fenceTypesContent(body('fence-types')).materials.map((item) => ({
      name: item.name,
      desc: item.desc,
      image: item.image,
      alt: item.alt,
      install: item.installUrl,
      buy: item.buyUrl,
      links: item.links,
    })),
    boxes: fenceBoxContent(body('fence-box')).kits.map((kit) => ({
      name: kit.name,
      price: kit.price,
      spec: kit.spec,
      image: kit.image,
      alt: kit.alt,
      url: kit.url,
    })),
  };
}
