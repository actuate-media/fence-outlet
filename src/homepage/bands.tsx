'use client';

import {
  fenceBoxContent,
  fenceTypesContent,
  financingContent,
  footerContent,
  installationsContent,
  locationsContent,
  trustContent,
} from './content';
import { SectionRoot, usePageState } from './page-state';

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
  );
}

export function TrustBand({ content }: { content?: unknown }) {
  const copy = trustContent(content);
  return (
    <SectionRoot>
      <div className="fo-band">
        <h1>{copy.heading}</h1>
        <p>{copy.line}</p>
      </div>
    </SectionRoot>
  );
}

export function FenceTypesBand({ content }: { content?: unknown }) {
  const copy = fenceTypesContent(content);
  return (
    <SectionRoot>
      <section className="fo-section fo-section-alt">
        <div className="fo-wrap">
          <h2>{copy.heading}</h2>
          <p className="fo-intro">{copy.intro}</p>
          <div className="fo-cards">
            {copy.materials.map((item) => (
              <article className="fo-card" key={item.name}>
                <div className="fo-card-photo">
                  <i aria-hidden="true" />
                  <img src={item.image} alt={item.alt} loading="lazy" />
                </div>
                <div className="fo-card-body">
                  <h3>{item.name}</h3>
                  <p>{item.desc}</p>
                  <div className="fo-card-actions">
                    <a href={item.installUrl}>{item.installLabel}</a>
                    <a href={item.buyUrl}>{item.buyLabel}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

export function FenceBoxBand({ content }: { content?: unknown }) {
  const copy = fenceBoxContent(content);
  return (
    <SectionRoot>
      <section className="fo-section">
        <div className="fo-wrap">
          <h2>{copy.heading}</h2>
          <p className="fo-intro">{copy.intro}</p>
          <div className="fo-boxes">
            {copy.kits.map((box) => (
              <article className="fo-box" key={box.name}>
                <img src={box.image} alt={box.alt} loading="lazy" />
                <div className="fo-box-body">
                  <div>
                    <h3>{box.name}</h3>
                    <span>{box.price}</span>
                  </div>
                  <a className="fo-btn" href={box.url}>{box.cta}</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

export function FinancingBand({ content }: { content?: unknown }) {
  const copy = financingContent(content);
  return (
    <SectionRoot>
      <section id="financing" className="fo-financing fo-onnavy">
        <div className="fo-financing-row">
          <div style={{ flex: '1 1 500px', minWidth: 0 }}>
            <h2>{copy.heading}</h2>
            <p>{copy.body}</p>
          </div>
          <a className="fo-btn" href={copy.ctaUrl}>{copy.ctaLabel}</a>
          <p className="fo-disclaimer">{copy.disclaimer}</p>
        </div>
      </section>
    </SectionRoot>
  );
}

export function LocationsBand({ content }: { content?: unknown }) {
  const copy = locationsContent(content);
  const { zipReady, nearestName } = usePageState();
  return (
    <SectionRoot>
      <section id="locations" className="fo-section">
        <div className="fo-wrap">
          <h2>{copy.heading}</h2>
          <div className="fo-locations">
            {copy.stores.map((store) => (
              <div className={zipReady && store.name === nearestName ? 'fo-location is-nearest' : 'fo-location'} key={store.name}>
                <a href={store.url}><h3>{store.fullName}</h3></a>
                <span>{store.address}</span>
                <a className="fo-tel" href={store.tel}>{store.phone}</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

export function InstallationsBand({ content }: { content?: unknown }) {
  const copy = installationsContent(content);
  return (
    <SectionRoot>
      <section className="fo-section fo-section-alt">
        <div className="fo-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2>{copy.heading}</h2>
          <div className="fo-shots">
            <figure className="fo-shot">
              <img src={copy.beforeImage} alt={copy.beforeAlt} loading="lazy" />
              <figcaption className="is-before">{copy.beforeCaption}</figcaption>
            </figure>
            <figure className="fo-shot">
              <img src={copy.afterImage} alt={copy.afterAlt} loading="lazy" />
              <figcaption className="is-after">{copy.afterCaption}</figcaption>
            </figure>
          </div>
          <div className="fo-reviews">{copy.reviewsNote}</div>
        </div>
      </section>
    </SectionRoot>
  );
}

export function FooterBand({ content }: { content?: unknown }) {
  const copy = footerContent(content);
  const { stores } = usePageState();
  return (
    <SectionRoot>
      <div className="fo-edge" aria-hidden="true"><i /><b /></div>
      <footer className="fo-footer fo-onnavy">
        <div className="fo-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="fo-footer-top">
            <div className="fo-footer-brand">
              <a href="/"><img src={copy.logoSrc} alt={copy.logoAlt} /></a>
              <p>{copy.blurb}</p>
              <a className="fo-btn" href="#quote">{copy.quoteLabel}</a>
            </div>
            <div className="fo-footer-cols">
              {copy.columns.map((column) => (
                <nav aria-label={column.label} key={column.label}>
                  <div>{column.label}</div>
                  {column.links.map((link) => (
                    <a key={`${column.label}-${link.label}`} href={link.url}>{link.label}</a>
                  ))}
                </nav>
              ))}
            </div>
          </div>
          <div className="fo-footer-locs">
            <div className="fo-footer-locs-head">
              <strong>{copy.locationsHeading}</strong>
              <span>{copy.hours}</span>
            </div>
            <div className="fo-footer-locs-grid">
              {stores.map((store) => (
                <div key={store.name}>
                  <a href={store.url} style={{ fontWeight: 700 }}>{store.name}</a>
                  <a className="fo-tel" href={store.tel}>{store.phone}</a>
                </div>
              ))}
            </div>
          </div>
          <div className="fo-footer-base">
            <div className="fo-footer-meta">
              <a href={copy.bbbUrl}>
                <img src={copy.bbbImage} alt={copy.bbbAlt} />
              </a>
              <span>{copy.license.split('\n').map((line, index) => (
                <span key={line}>{index > 0 ? <br /> : null}{line}</span>
              ))}</span>
            </div>
            <div className="fo-footer-meta">
              <span>© {new Date().getFullYear()} {copy.copyright}</span>
              <a href={copy.privacyUrl} style={{ textDecoration: 'underline' }}>{copy.privacyLabel}</a>
              <span className="fo-social">
                {copy.socials.map((item) => (
                  <a key={item.url} href={item.url} aria-label={item.label}>
                    {item.label.includes('YouTube') ? <YouTubeIcon /> : <FacebookIcon />}
                  </a>
                ))}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </SectionRoot>
  );
}
