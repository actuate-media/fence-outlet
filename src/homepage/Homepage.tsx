'use client';

import { FenceBoxBand, FenceTypesBand, FinancingBand, FooterBand, InstallationsBand, LocationsBand, TrustBand } from './bands';
import { pageStateFromSections, type CmsSection } from './content';
import { PageFrame } from './page-state';
import { QuoteHero } from './quote-hero';
import { SiteHeader } from './site-header';
import './homepage.css';

export function Homepage({ fontClassName, sections }: { fontClassName: string; sections?: CmsSection[] }) {
  const state = pageStateFromSections(sections ?? []);
  const contentFor = (type: string) => sections?.find((section) => section.sectionType === type)?.content;
  return (
    <PageFrame className={fontClassName} {...state}>
      <SiteHeader content={contentFor('site-header')} />
      <main id="main">
        <TrustBand content={contentFor('trust-band')} />
        <QuoteHero content={contentFor('quote-hero')} />
        <FenceTypesBand content={contentFor('fence-types')} />
        <FenceBoxBand content={contentFor('fence-box')} />
        <FinancingBand content={contentFor('financing-offer')} />
        <LocationsBand content={contentFor('store-locations')} />
        <InstallationsBand content={contentFor('installations')} />
      </main>
      <FooterBand content={contentFor('site-footer')} />
    </PageFrame>
  );
}
