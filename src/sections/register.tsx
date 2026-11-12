import { registerSectionRenderers } from '@prenta/sections-react';
import type { AdminSectionRendererMap } from '@prenta/admin';
import { Pricing, type PricingPlan } from '../blocks/Pricing';
import {
  FenceBoxBand,
  FenceTypesBand,
  FinancingBand,
  FooterBand,
  InstallationsBand,
  LocationsBand,
  TrustBand,
} from '../homepage/bands';
import { QuoteHero } from '../homepage/quote-hero';
import { SiteHeader } from '../homepage/site-header';
import '../homepage/homepage.css';

/**
 * Renderers for this site's custom section types — ONE map, used for BOTH the
 * public site (via <Sections>) and the admin editor canvas
 * (<AdminRoot sectionRenderers={...}>). Both surfaces pass the same
 * `{ section }`, so a single component serves both.
 *
 * Typed as `AdminSectionRendererMap` (the stricter of the two shapes — it is
 * assignable to the public `SectionRendererMap` for the registration below).
 * Read section data from `section.content`. Every id here must match a
 * section-type id in ./types.ts (`npm run verify:sections` keeps them in sync).
 */
export const sectionRenderers: AdminSectionRendererMap = {
  pricing: ({ section }) => {
    const content = section.content ?? {};
    const heading = typeof content.heading === 'string' ? content.heading : '';
    const plans = Array.isArray(content.plans) ? (content.plans as PricingPlan[]) : [];
    return <Pricing heading={heading} plans={plans} />;
  },
  'site-header': ({ section }) => <SiteHeader content={section.content} />,
  'trust-band': ({ section }) => <TrustBand content={section.content} />,
  'quote-hero': ({ section }) => <QuoteHero content={section.content} />,
  'fence-types': ({ section }) => <FenceTypesBand content={section.content} />,
  'fence-box': ({ section }) => <FenceBoxBand content={section.content} />,
  'financing-offer': ({ section }) => <FinancingBand content={section.content} />,
  'store-locations': ({ section }) => <LocationsBand content={section.content} />,
  installations: ({ section }) => <InstallationsBand content={section.content} />,
  'site-footer': ({ section }) => <FooterBand content={section.content} />,
};

// Register for the public site. app/(site)/layout.tsx imports this module (the
// import runs the registration); the admin page imports `sectionRenderers` and
// passes it to <AdminRoot sectionRenderers={...}>.
registerSectionRenderers(sectionRenderers);
