'use client';

import { useEffect, useState } from 'react';
import {
  fenceBoxContent,
  fenceTypesContent,
  financingContent,
  footerContent,
  installationsContent,
  locationsContent,
} from './content';
import { bestFor, kitChips, mapPins, mapsUrl, reviewCards, storeHoursStatus } from './data';
import { SectionRoot, usePageState } from './page-state';

const floridaPath = 'M11.7 50.4 L7.6 8.7 L140.1 8.7 L137.6 17.4 L147.3 25.5 L191.1 27.8 L242.0 30.7 L281.8 33.6 L291.0 23.2 L305.7 23.2 L321.0 25.5 L322.0 37.7 L324.6 52.2 L329.7 72.5 L333.8 89.9 L341.4 107.3 L349.0 124.7 L356.7 139.2 L364.3 147.9 L366.9 156.6 L364.3 165.2 L365.9 178.0 L375.5 205.8 L384.7 229.0 L392.9 258.0 L390.8 292.8 L388.3 311.9 L379.6 333.4 L372.0 345.0 L354.1 347.9 L338.9 349.6 L333.8 333.4 L326.1 310.2 L305.7 298.6 L302.2 281.2 L293.0 269.6 L282.8 252.2 L270.1 234.8 L262.4 220.3 L254.8 205.8 L250.7 184.4 L252.2 171.0 L254.8 156.6 L257.3 142.1 L249.7 124.7 L239.5 116.0 L221.7 89.9 L206.4 69.6 L180.9 63.8 L173.2 71.3 L155.4 79.4 L141.1 82.9 L122.3 85.2 L119.7 75.4 L104.5 60.9 L73.9 45.2 L63.7 44.1 L38.2 45.8 L28.0 47.5 Z';

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Stars({ label }: { label: string }) {
  return (
    <span className="pk-stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} width="18" height="18" viewBox="0 0 24 24" fill="var(--fo-star)" aria-hidden="true"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" /></svg>
      ))}
    </span>
  );
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
  );
}

export function TrustBand({ content }: { content?: unknown }) {
  void content;
  return null;
}

export function FenceTypesBand({ content }: { content?: unknown }) {
  const copy = fenceTypesContent(content);
  const { shopMode, setShopMode, nearest } = usePageState();
  const materialsMode = shopMode === 'diy';
  return (
    <SectionRoot>
      <section className="pk-band pk-band-alt" aria-labelledby="pick-title">
        <div className="pk-wrap pk-reveal">
          <div className="pk-band-head">
            <div>
              <span className="pk-eyebrow">Shop by style</span>
              <h2 id="pick-title">{copy.heading}</h2>
              <p className="pk-lead">{copy.intro}</p>
            </div>
            <div role="group" aria-label="How do you want your fence?" className="pk-shop">
              <button type="button" aria-pressed={!materialsMode} className={materialsMode ? undefined : 'is-on'} onClick={() => setShopMode('install')}>Installed for me</button>
              <button type="button" aria-pressed={materialsMode} className={materialsMode ? 'is-on' : undefined} onClick={() => setShopMode('diy')}>Materials only</button>
            </div>
          </div>
          <div className="pk-grid pk-grid-fence">
            {copy.materials.map((item) => (
              <article className="pk-picket-card pk-zoom" key={item.name}>
                <div className="pk-picket-card-in">
                  <div className="pk-fence-photo">
                    <img className="pk-zoom-img" src={item.image} alt={item.alt} loading="lazy" />
                    <h3>{item.name}</h3>
                  </div>
                  <div className="pk-fence-body">
                    <ul aria-label="Best for">
                      {(bestFor[item.name] ?? []).map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                    <p>{item.desc}</p>
                    {materialsMode ? (
                      <nav aria-label={`Shop ${item.name} parts`}>
                        {item.links.map((link) => <a key={link.label} href={link.url}>{link.label}</a>)}
                      </nav>
                    ) : null}
                    <div className="pk-fence-actions">
                      {materialsMode ? (
                        <>
                          <a className="pk-btn pk-btn-navy" href={item.buyUrl}>Shop materials<Arrow /></a>
                          <a className="pk-textlink" href={item.installUrl}>Or get it installed</a>
                        </>
                      ) : (
                        <>
                          <a className="pk-btn pk-btn-navy" href={item.installUrl}>Get a free estimate<Arrow /></a>
                          <a className="pk-textlink" href={item.buyUrl}>Or buy materials</a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="pk-help">
            <div>
              <span aria-hidden="true">?</span>
              <div>
                <strong>Not sure which fence is right?</strong>
                <span>Our {nearest.name} team can help you compare styles, budgets and HOA rules.</span>
              </div>
            </div>
            <div>
              <a className="pk-btn pk-btn-orange ctm-phone" data-current="" data-store={nearest.slug} href={nearest.tel} aria-label={`Call Fence Outlet ${nearest.name} at ${nearest.phone}`}>Call {nearest.phone}</a>
              <a className="pk-btn pk-btn-ghost" href="https://www.fenceoutlet.com/fence/">Compare all fence types</a>
            </div>
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
      <section className="pk-band">
        <div className="pk-wrap pk-reveal">
          <div className="pk-band-head">
            <div>
              <span className="pk-eyebrow">Do it yourself</span>
              <h2>{copy.heading}</h2>
              <p className="pk-lead">{copy.intro}</p>
            </div>
            <a className="pk-textlink" href="https://www.fenceoutlet.com/fence/fence-in-a-box/">Compare all boxes<Arrow /></a>
          </div>
          <div className="pk-grid pk-grid-box">
            {copy.kits.map((box) => (
              <article className="pk-picket-card" key={box.name}>
                <div className="pk-picket-card-in">
                  <div className="pk-box-photo"><img src={box.image} alt={box.alt} loading="lazy" /></div>
                  <div className="pk-box-body">
                    <div className="pk-box-title">
                      <h3>{box.name}</h3>
                      <div><span>Kit price</span><strong>{box.price}</strong></div>
                    </div>
                    <ul aria-label="In the box">
                      {(kitChips[box.name] ?? box.spec.split(', ')).map((chip) => <li key={chip}>{chip}</li>)}
                    </ul>
                    <p className="pk-stock"><i aria-hidden="true" />In stock at all 8 showrooms · Delivery available</p>
                    <a className="pk-btn pk-btn-orange" href={box.url}>{box.cta === 'Learn More' ? `View the ${box.name} kit` : box.cta}</a>
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

export function FinancingBand({ content }: { content?: unknown }) {
  const copy = financingContent(content);
  const [cost, setCost] = useState(4500);
  const money = (value: number) => `$${value.toLocaleString('en-US')}`;
  return (
    <SectionRoot>
      <section id="financing" className="pk-band pk-band-alt">
        <div className="pk-wrap pk-reveal pk-split">
          <div className="pk-split-navy">
            <span className="pk-eyebrow">Financing</span>
            <h2>{copy.heading}</h2>
            <p className="pk-lead">{copy.body}</p>
            <a className="pk-btn pk-btn-orange" href={copy.ctaUrl}>{copy.ctaLabel}</a>
            <p className="pk-disclaimer">{copy.disclaimer}</p>
          </div>
          <div className="pk-split-white">
            <h3>Estimate your monthly payment</h3>
            <div className="pk-pay" aria-live="polite"><span>{money(Math.round(cost / 36))}<small>/mo</small></span><span>over 36 months</span></div>
            <label htmlFor="calc">Fence project cost <strong>{money(cost)}</strong></label>
            <input id="calc" type="range" min={1500} max={15000} step={250} value={cost} aria-valuetext={money(cost)} onChange={(event) => setCost(Number(event.target.value))} />
            <div className="pk-range-ends" aria-hidden="true"><span>$1,500</span><span>$15,000</span></div>
            <p className="pk-altbox">Or pay <strong>{money(Math.round(cost / 12))}/mo</strong> and finish in 12 months at <strong>0% interest</strong>.</p>
            <p className="pk-fine">For planning only: the project cost divided over the term, before any interest. Your actual payment depends on credit approval.</p>
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

export function LocationsBand({ content }: { content?: unknown }) {
  const copy = locationsContent(content);
  const { nearest, pickStore, stores } = usePageState();
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    setStatus(storeHoursStatus());
  }, []);
  const others = stores.filter((store) => store.name !== nearest.name);
  return (
    <SectionRoot>
      <section id="locations" className="pk-band">
        <div className="pk-wrap pk-reveal">
          <div className="pk-band-intro">
            <span className="pk-eyebrow">8 Florida showrooms</span>
            <h2>{copy.heading}</h2>
            <p className="pk-lead">Every style on display and millions in inventory in stock. No appointment needed.</p>
          </div>
          <div className="pk-loc">
            <div className="pk-map">
              <div className="pk-map-canvas" role="img" aria-label={`Map of Florida with the 8 Fence Outlet stores. Your store, ${nearest.fullName}, is highlighted.`}>
                <svg viewBox="0 0 400 359" aria-hidden="true"><path d={floridaPath} /></svg>
                {stores.map((store) => {
                  const pin = mapPins[store.name] ?? [50, 50, 'l'];
                  const current = store.name === nearest.name;
                  const side = pin[2];
                  const label = side === 'ul' ? { right: 6, top: -22 } : side === 'dl' ? { right: 6, top: 8 } : side === 'r' ? { left: 14, top: -7 } : { right: 14, top: -7 };
                  return (
                    <span key={store.name} className={current ? 'pk-pin is-current' : 'pk-pin'} style={{ left: `${pin[0]}%`, top: `${pin[1]}%` }} aria-hidden="true">
                      <i />
                      <b style={{ top: label.top, left: 'left' in label ? label.left : undefined, right: 'right' in label ? label.right : undefined }}>{store.name}</b>
                    </span>
                  );
                })}
              </div>
              <p><i className="is-yours" />Your store<i className="is-other" />Other showrooms</p>
            </div>
            <div className="pk-loc-col">
              <div className="pk-your-store">
                <div>
                  <span className="pk-eyebrow">Your store</span>
                  {status ? <span className={status.open ? 'pk-status is-open' : 'pk-status'}><i />{status.text}</span> : null}
                </div>
                <h3><a href={nearest.url}>{nearest.fullName}</a></h3>
                <span>{nearest.address}</span>
                <div>
                  <a className="pk-btn pk-btn-navy ctm-phone" data-current="" data-store={nearest.slug} href={nearest.tel}><PhoneIcon />{nearest.phone}</a>
                  <a className="pk-btn pk-btn-line" href={mapsUrl(nearest.address)}>Get directions</a>
                  <span>Mon–Fri 8–5 · Sat 8–4 · Sun closed</span>
                </div>
              </div>
              <div>
                <h3 className="pk-others-title">Other showrooms</h3>
                <ul className="pk-others">
                  {others.map((store) => (
                    <li key={store.name}>
                      <span>
                        <a href={store.url}>{store.fullName}</a>
                        <a className="ctm-phone" data-store={store.slug} href={store.tel}>{store.phone}</a>
                      </span>
                      <button type="button" aria-label={`Make ${store.fullName} my store`} onClick={() => pickStore(store.name)}>Select</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

export function InstallationsBand({ content }: { content?: unknown }) {
  const copy = installationsContent(content);
  const [position, setPosition] = useState(50);
  const showing = 100 - position;
  return (
    <SectionRoot>
      <section className="pk-band pk-band-alt">
        <div className="pk-wrap pk-reveal pk-work">
          <div className="pk-band-intro">
            <span className="pk-eyebrow">Our work</span>
            <h2>{copy.heading}</h2>
            <p className="pk-lead">Drag the slider to see a tired wood fence replaced with low-maintenance white vinyl.</p>
          </div>
          <div className="pk-ba">
            <img src={copy.beforeImage} alt={copy.beforeAlt} />
            <img src={copy.afterImage} alt={copy.afterAlt} style={{ clipPath: `inset(0 0 0 ${position}%)` }} />
            <span className="pk-ba-pill pk-ba-before">Before</span>
            <span className="pk-ba-pill pk-ba-after">After</span>
            <input className="pk-ba-input" type="range" min={0} max={100} value={position} aria-label="Before and after comparison. Move to reveal more of the before or after photo." aria-valuetext={`${showing}% of the after photo showing`} onChange={(event) => setPosition(Number(event.target.value))} />
            <span className="pk-ba-handle" aria-hidden="true" style={{ left: `${position}%` }}>
              <span className="pk-ba-knob">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 7-5 5 5 5M15 7l5 5-5 5" /></svg>
              </span>
            </span>
          </div>
          <div className="pk-reviews">
            <div className="pk-reviews-head">
              <div>
                <h3>What Florida homeowners say</h3>
                <p><Stars label="Rated [4.8] out of 5" /><strong>[4.8]</strong> on Google · <strong>[1,200+]</strong> reviews</p>
              </div>
              <a className="pk-textlink" href="https://www.fenceoutlet.com/testimonials/">Read all reviews on Google<Arrow /></a>
            </div>
            <ul>
              {reviewCards.map((review) => (
                <li key={review.tag}>
                  <div><Stars label="5 out of 5 stars" /><span>{review.tag}</span></div>
                  <blockquote>&ldquo;{review.quote}&rdquo;</blockquote>
                  <div>
                    <i aria-hidden="true">{review.initial}</i>
                    <span><strong>{review.name}</strong><span>{review.where}</span></span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="pk-fine">Design placeholder: bracketed text is filled from Fence Outlet&apos;s real Google reviews.</p>
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

function FacebookIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
}

function YouTubeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>;
}

export function FooterBand({ content }: { content?: unknown }) {
  const copy = footerContent(content);
  const { stores } = usePageState();
  const year = new Date().getFullYear();
  return (
    <SectionRoot>
      <div className="pk-edge" aria-hidden="true" />
      <footer className="pk-footer">
        <div className="pk-wrap">
          <div className="pk-footer-top">
            <div className="pk-footer-brand">
              <a href="https://www.fenceoutlet.com/"><img src={copy.logoSrc} alt={copy.logoAlt} /></a>
              <p>{copy.blurb}</p>
              <a className="pk-btn pk-btn-orange" href="#quote">{copy.quoteLabel}</a>
            </div>
            <div className="pk-footer-cols">
              {copy.columns.map((column) => (
                <nav key={column.label} aria-label={column.label}>
                  <div>{column.label}</div>
                  {column.links.map((link) => <a key={link.label} href={link.url}>{link.label}</a>)}
                </nav>
              ))}
            </div>
          </div>
          <div className="pk-footer-locs">
            <div>
              <div>{copy.locationsHeading}</div>
              <span>{copy.hours}</span>
            </div>
            <div>
              {stores.map((store) => (
                <div key={store.name}>
                  <a href={store.url}>{store.name}</a>
                  <a className="ctm-phone" data-store={store.slug} href={store.tel}>{store.phone}</a>
                </div>
              ))}
            </div>
          </div>
          <div className="pk-footer-base">
            <div>
              <a href={copy.bbbUrl}><img src={copy.bbbImage} alt={copy.bbbAlt} /></a>
              <span>{copy.license}</span>
            </div>
            <div>
              <span>© {year} {copy.copyright}</span>
              <a href={copy.privacyUrl}>{copy.privacyLabel}</a>
              <span>
                {copy.socials.map((social) => (
                  <a key={social.label} href={social.url} aria-label={social.label}>
                    {social.label.toLowerCase().includes('youtube') ? <YouTubeIcon /> : <FacebookIcon />}
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
