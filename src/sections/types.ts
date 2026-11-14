import type { CustomSectionTypeInput } from '@prenta/core/page-sections';
import {
  fenceBoxContent,
  fenceTypesContent,
  financingContent,
  footerContent,
  headerContent,
  heroContent,
  installationsContent,
  locationsContent,
  trustContent,
} from '../homepage/content';

function asContent(value: object): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}

const headerDefault = (() => {
  const content = headerContent(undefined);
  return { ...content, installChecks: content.installChecks.map((line) => ({ text: line })) };
})();

const heroDefault = (() => {
  const content = heroContent(undefined);
  const order = ['install', 'diy', 'showrooms', 'financing'] as const;
  return {
    ...content,
    tabs: order.map((variant) => ({ variant, ...content.tabs[variant] })),
  };
})();

/**
 * Custom section types for this site. Each entry teaches the admin editor how
 * to author the section (Add Section gallery + field-driven inspector). The
 * matching public renderer lives in ./register.tsx — keep the two in sync
 * (`npm run verify:sections` checks this).
 *
 * Wired into prenta.config.ts as `sections: { types: marketingSectionTypes }`.
 */
export const marketingSectionTypes: CustomSectionTypeInput[] = [
  {
    id: 'pricing',
    name: 'Pricing Table',
    scope: ['page'],
    icon: 'badge-dollar-sign',
    description: 'A grid of pricing plans.',
    category: 'conversion',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      {
        key: 'plans',
        label: 'Plans',
        type: 'repeater',
        rowLabel: 'Plan',
        fields: [
          { key: 'name', label: 'Plan name', type: 'text', required: true },
          { key: 'price', label: 'Price', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
    ],
    defaultContent: { heading: 'Pricing', plans: [] },
  },
  {
    id: 'site-header',
    name: 'Site Header',
    scope: ['page'],
    icon: 'menu',
    description: 'Logo, menus, phone, and mobile drawer. Store cards and fence links come from the locations and fence-type sections.',
    category: 'layout',
    fields: [
      { key: 'logoSrc', label: 'Logo', type: 'media' },
      { key: 'logoAlt', label: 'Logo description', type: 'text' },
      { key: 'financingUrl', label: 'Financing link', type: 'url' },
      { key: 'installTitle', label: 'Installation title', type: 'text' },
      { key: 'installBody', label: 'Installation body', type: 'textarea' },
      {
        key: 'installChecks',
        label: 'Installation checks',
        type: 'repeater',
        rowLabel: 'Check',
        fields: [{ key: 'text', label: 'Line', type: 'text', required: true }],
      },
      { key: 'installAboutLabel', label: 'About label', type: 'text' },
      { key: 'installAboutUrl', label: 'About link', type: 'url' },
      { key: 'installOfferImage', label: 'Installation offer image', type: 'media' },
      { key: 'installOfferAlt', label: 'Installation offer description', type: 'text' },
      { key: 'installOfferTitle', label: 'Installation offer title', type: 'text' },
      { key: 'installOfferNote', label: 'Installation offer note', type: 'text' },
      { key: 'installOfferLinkLabel', label: 'Installation offer link label', type: 'text' },
      { key: 'installOfferLinkUrl', label: 'Installation offer link', type: 'url' },
      { key: 'installCta', label: 'Installation button', type: 'text' },
      { key: 'materialsOfferTitle', label: 'Materials offer title', type: 'text' },
      { key: 'materialsOfferBody', label: 'Materials offer body', type: 'textarea' },
      { key: 'materialsCta', label: 'Materials button', type: 'text' },
      { key: 'boxTitle', label: 'Fence in a Box title', type: 'text' },
      { key: 'boxBody', label: 'Fence in a Box body', type: 'textarea' },
      { key: 'boxCompareLabel', label: 'Compare label', type: 'text' },
      { key: 'boxCompareUrl', label: 'Compare link', type: 'url' },
      { key: 'hoursTitle', label: 'Hours title', type: 'text' },
      { key: 'hoursBody', label: 'Hours', type: 'textarea' },
      { key: 'hoursLinkLabel', label: 'Hours link label', type: 'text' },
      { key: 'hoursLinkUrl', label: 'Hours link', type: 'url' },
      { key: 'hoursImage', label: 'Hours image', type: 'media' },
      { key: 'hoursAlt', label: 'Hours image description', type: 'text' },
      { key: 'drawerFinancingUrl', label: 'Drawer financing link', type: 'url' },
      { key: 'drawerQuoteLabel', label: 'Drawer quote button', type: 'text' },
      { key: 'drawerHours', label: 'Drawer hours', type: 'text' },
    ],
    defaultContent: asContent(headerDefault),
  },
  {
    id: 'trust-band',
    name: 'Trust Band',
    scope: ['page'],
    icon: 'megaphone',
    description: 'Homepage headline. It is drawn over the hero pickets.',
    category: 'content',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      { key: 'line', label: 'Trust line', type: 'text', required: true },
    ],
    defaultContent: asContent(trustContent(undefined)),
  },
  {
    id: 'quote-hero',
    name: 'Quote Hero',
    scope: ['page'],
    icon: 'home',
    description: 'The quote form and the installation, materials, showroom, and financing panels.',
    category: 'conversion',
    fields: [
      { key: 'installLabel', label: 'Install choice', type: 'text' },
      { key: 'installNote', label: 'Install note', type: 'text' },
      { key: 'diyLabel', label: 'DIY choice', type: 'text' },
      { key: 'diyNote', label: 'DIY note', type: 'text' },
      { key: 'smsLabel', label: 'Text-message label', type: 'text' },
      { key: 'privacyLabel', label: 'Privacy label', type: 'text' },
      { key: 'privacyUrl', label: 'Privacy link', type: 'url' },
      {
        key: 'tabs',
        label: 'Panels',
        type: 'repeater',
        rowLabel: 'Panel',
        fields: [
          {
            key: 'variant',
            label: 'Panel',
            type: 'select',
            options: [
              { label: 'We Install It', value: 'install' },
              { label: 'You Build It', value: 'diy' },
              { label: 'Showrooms', value: 'showrooms' },
              { label: 'Financing', value: 'financing' },
            ],
          },
          { key: 'image', label: 'Image', type: 'media' },
          { key: 'alt', label: 'Image description', type: 'text' },
          { key: 'label', label: 'Tab label', type: 'text' },
          { key: 'buttonLabel', label: 'Button description', type: 'text' },
          { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'lead', label: 'Lead', type: 'textarea' },
          { key: 'detail', label: 'Detail', type: 'text' },
          { key: 'emphasis', label: 'Bold phrase', type: 'text' },
          { key: 'linkLabel', label: 'Link label', type: 'text' },
          { key: 'linkUrl', label: 'Link', type: 'url' },
        ],
      },
    ],
    defaultContent: asContent(heroDefault),
  },
  {
    id: 'fence-types',
    name: 'Fence Types',
    scope: ['page'],
    icon: 'columns-3',
    description: 'Pick-your-fence cards.',
    category: 'content',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      { key: 'intro', label: 'Intro', type: 'textarea' },
      {
        key: 'materials',
        label: 'Materials',
        type: 'repeater',
        rowLabel: 'Material',
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'desc', label: 'Description', type: 'textarea' },
          { key: 'image', label: 'Image', type: 'media' },
          { key: 'alt', label: 'Image description', type: 'text' },
          { key: 'installLabel', label: 'Install button', type: 'text' },
          { key: 'installUrl', label: 'Install link', type: 'url' },
          { key: 'buyLabel', label: 'Buy button', type: 'text' },
          { key: 'buyUrl', label: 'Buy link', type: 'url' },
          {
            key: 'links',
            label: 'Menu links',
            type: 'repeater',
            rowLabel: 'Link',
            fields: [
              { key: 'label', label: 'Label', type: 'text', required: true },
              { key: 'url', label: 'URL', type: 'url', required: true },
            ],
          },
        ],
      },
    ],
    defaultContent: asContent(fenceTypesContent(undefined)),
  },
  {
    id: 'fence-box',
    name: 'Fence in a Box',
    scope: ['page'],
    icon: 'package',
    description: 'The kit cards and prices.',
    category: 'conversion',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      { key: 'intro', label: 'Intro', type: 'textarea' },
      {
        key: 'kits',
        label: 'Kits',
        type: 'repeater',
        rowLabel: 'Kit',
        fields: [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'price', label: 'Price', type: 'text', required: true },
          { key: 'spec', label: 'What is included', type: 'textarea' },
          { key: 'image', label: 'Image', type: 'media' },
          { key: 'alt', label: 'Image description', type: 'text' },
          { key: 'url', label: 'Link', type: 'url' },
          { key: 'cta', label: 'Button', type: 'text' },
        ],
      },
    ],
    defaultContent: asContent(fenceBoxContent(undefined)),
  },
  {
    id: 'financing-offer',
    name: 'Financing Offer',
    scope: ['page'],
    icon: 'badge-percent',
    description: 'The navy financing band.',
    category: 'conversion',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'ctaLabel', label: 'Button label', type: 'text' },
      { key: 'ctaUrl', label: 'Button link', type: 'url' },
      { key: 'disclaimer', label: 'Disclaimer', type: 'textarea' },
    ],
    defaultContent: asContent(financingContent(undefined)),
  },
  {
    id: 'store-locations',
    name: 'Store Locations',
    scope: ['page'],
    icon: 'map-pin',
    description: 'The eight showrooms. The header phone and footer list use this same directory.',
    category: 'content',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      {
        key: 'stores',
        label: 'Stores',
        type: 'repeater',
        rowLabel: 'Store',
        fields: [
          { key: 'name', label: 'Short name', type: 'text', required: true },
          { key: 'fullName', label: 'Full name', type: 'text' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'tel', label: 'Tel link', type: 'text' },
          { key: 'url', label: 'Location page', type: 'url' },
        ],
      },
    ],
    defaultContent: asContent(locationsContent(undefined)),
  },
  {
    id: 'installations',
    name: 'Installations',
    scope: ['page'],
    icon: 'images',
    description: 'Before and after photos and the reviews slot.',
    category: 'media',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', required: true },
      { key: 'beforeImage', label: 'Before image', type: 'media' },
      { key: 'beforeAlt', label: 'Before description', type: 'text' },
      { key: 'beforeCaption', label: 'Before caption', type: 'text' },
      { key: 'afterImage', label: 'After image', type: 'media' },
      { key: 'afterAlt', label: 'After description', type: 'text' },
      { key: 'afterCaption', label: 'After caption', type: 'text' },
      { key: 'reviewsNote', label: 'Reviews note', type: 'textarea' },
    ],
    defaultContent: asContent(installationsContent(undefined)),
  },
  {
    id: 'site-footer',
    name: 'Site Footer',
    scope: ['page'],
    icon: 'panel-bottom',
    description: 'Footer brand, link columns, hours, and legal line. Store phones come from Store Locations.',
    category: 'content',
    fields: [
      { key: 'logoSrc', label: 'Logo', type: 'media' },
      { key: 'logoAlt', label: 'Logo description', type: 'text' },
      { key: 'blurb', label: 'Blurb', type: 'textarea' },
      { key: 'quoteLabel', label: 'Quote button', type: 'text' },
      { key: 'locationsHeading', label: 'Locations heading', type: 'text' },
      { key: 'hours', label: 'Hours', type: 'text' },
      { key: 'license', label: 'License line', type: 'textarea' },
      { key: 'copyright', label: 'Copyright', type: 'text' },
      { key: 'privacyLabel', label: 'Privacy label', type: 'text' },
      { key: 'privacyUrl', label: 'Privacy link', type: 'url' },
      {
        key: 'columns',
        label: 'Link columns',
        type: 'repeater',
        rowLabel: 'Column',
        fields: [
          { key: 'label', label: 'Heading', type: 'text', required: true },
          {
            key: 'links',
            label: 'Links',
            type: 'repeater',
            rowLabel: 'Link',
            fields: [
              { key: 'label', label: 'Label', type: 'text', required: true },
              { key: 'url', label: 'URL', type: 'url', required: true },
            ],
          },
        ],
      },
      {
        key: 'socials',
        label: 'Social links',
        type: 'repeater',
        rowLabel: 'Social link',
        fields: [
          { key: 'label', label: 'Label', type: 'text', required: true },
          { key: 'url', label: 'URL', type: 'url', required: true },
        ],
      },
    ],
    defaultContent: asContent(footerContent(undefined)),
  },
];
