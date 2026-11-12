import type { CustomSectionTypeInput } from '@prenta/core/page-sections';

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
];
