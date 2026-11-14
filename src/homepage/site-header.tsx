'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { headerContent } from './content';
import { SectionRoot, usePageState } from './page-state';

type MenuKey = 'install' | 'materials' | 'box' | 'stores';

const site = 'https://www.fenceoutlet.com';
const menuCloseDelay = 180;

const galleries = [
  { label: 'Before & After', url: `${site}/before-after/` },
  { label: 'Vinyl Gallery', url: `${site}/vinyl-fencing-gallery/` },
  { label: 'Wood Gallery', url: `${site}/wood-fencing-gallery/` },
  { label: 'Aluminum Gallery', url: `${site}/aluminum-fencing-gallery/` },
  { label: 'Chain Link Gallery', url: `${site}/chain-link-fencing-gallery/` },
  { label: 'Steel Gallery', url: `${site}/steel-fencing-gallery/` },
];

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--fo-orange-600)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: 1 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function SiteHeader({ content }: { content?: unknown }) {
  const copy = headerContent(content);
  const { stores, materials, boxes, storeMarked, storeSourceText, storeLive, nearest, nearestName, pickStore, setZip, zip, choosePath, setMenuOpen, setDrawerOpen } = usePageState();
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [picker, setPicker] = useState(false);
  const [section, setSection] = useState<MenuKey | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const triggers = useRef<Partial<Record<MenuKey, HTMLButtonElement | null>>>({});

  useEffect(() => {
    setMenuOpen(menu !== null);
  }, [menu, setMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1080px)');
    const sync = () => {
      if (desktopQuery.matches) {
        setDrawer(false);
      } else {
        setMenu(null);
        setPicker(false);
      }
    };
    sync();
    desktopQuery.addEventListener('change', sync);
    return () => desktopQuery.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setDrawerOpen(drawer);
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer, setDrawerOpen]);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((current) => (current === next ? current : next));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!picker) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && pickerRef.current?.contains(target)) return;
      setPicker(false);
      pickerButtonRef.current?.focus();
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [picker]);

  function cancelClose() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setMenu(null), menuCloseDelay);
  }

  function openMenu(key: MenuKey, trigger?: HTMLButtonElement | null) {
    cancelClose();
    setPicker(false);
    if (trigger) triggers.current[key] = trigger;
    if (window.innerWidth >= 1080) setMenu(key);
  }

  function toggleMenu(key: MenuKey, event: MouseEvent<HTMLButtonElement>) {
    const keyboard = event.detail === 0;
    triggers.current[key] = event.currentTarget;
    setPicker(false);
    if (window.innerWidth < 1080 || keyboard) {
      setMenu((current) => (current === key ? null : key));
      return;
    }
    setMenu(key);
  }

  function chooseStore(name: string) {
    const wasOpen = picker;
    pickStore(name);
    setPicker(false);
    if (wasOpen) pickerButtonRef.current?.focus();
  }

  function choose(next: 'install' | 'diy') {
    choosePath(next, true);
    setMenu(null);
    setDrawer(false);
  }

  function trapDrawer(event: KeyboardEvent<HTMLDivElement>) {
    if (!drawer || event.key !== 'Tab' || !drawerRef.current) return;
    const items = [...drawerRef.current.querySelectorAll<HTMLElement>('a, button, select')].filter(
      (item) => !item.closest('[hidden]'),
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  const hours = copy.hoursBody.split('\n');
  const drawerSections: { key: MenuKey; label: string; links: { label: string; url: string }[] }[] = [
    {
      key: 'install',
      label: 'Installation',
      links: [
        { label: 'Professional Installation', url: copy.installAboutUrl },
        ...materials.map((item) => ({ label: `${item.name} Fence`, url: item.install })),
        { label: 'Before & After', url: `${site}/before-after/` },
      ],
    },
    {
      key: 'materials',
      label: 'Materials',
      links: materials.map((item) => ({ label: `${item.name} Materials`, url: item.buy })),
    },
    {
      key: 'box',
      label: 'Fence in a Box',
      links: [
        ...boxes.map((box) => ({ label: `${box.name} · ${box.price}`, url: box.url })),
        { label: copy.boxCompareLabel, url: copy.boxCompareUrl },
      ],
    },
    {
      key: 'stores',
      label: 'Locations',
      links: [
        ...stores.map((store) => ({ label: `${store.fullName} · ${store.phone}`, url: store.url })),
        { label: copy.hoursLinkLabel, url: copy.hoursLinkUrl },
      ],
    },
  ];

  return (
    <SectionRoot>
      <header
        ref={headerRef}
        className={scrolled ? 'fo-header is-scrolled' : 'fo-header'}
        onMouseLeave={scheduleClose}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && headerRef.current?.contains(next)) return;
          setMenu(null);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          if (picker) {
            event.preventDefault();
            setPicker(false);
            pickerButtonRef.current?.focus();
            return;
          }
          if (drawer) {
            event.preventDefault();
            setDrawer(false);
            menuButtonRef.current?.focus();
            return;
          }
          if (!menu) return;
          event.preventDefault();
          const current = menu;
          setMenu(null);
          triggers.current[current]?.focus();
        }}
      >
        <a className="fo-logo" href="/" onMouseEnter={() => setMenu(null)}>
          <img src={copy.logoSrc} alt={copy.logoAlt} />
        </a>
        <nav className="fo-nav" aria-label="Main" onMouseEnter={cancelClose}>
          <button type="button" className={menu === 'install' ? 'fo-nav-btn is-open' : 'fo-nav-btn'} aria-expanded={menu === 'install'} aria-controls={menu === 'install' ? 'menu-install' : undefined} onMouseEnter={(event) => openMenu('install', event.currentTarget)} onClick={(event) => toggleMenu('install', event)}>
            Installation <Chevron />
          </button>
          <button type="button" className={menu === 'materials' ? 'fo-nav-btn is-open' : 'fo-nav-btn'} aria-expanded={menu === 'materials'} aria-controls={menu === 'materials' ? 'menu-materials' : undefined} onMouseEnter={(event) => openMenu('materials', event.currentTarget)} onClick={(event) => toggleMenu('materials', event)}>
            Materials <Chevron />
          </button>
          <button type="button" className={menu === 'box' ? 'fo-nav-btn is-open' : 'fo-nav-btn'} aria-expanded={menu === 'box'} aria-controls={menu === 'box' ? 'menu-box' : undefined} onMouseEnter={(event) => openMenu('box', event.currentTarget)} onClick={(event) => toggleMenu('box', event)}>
            Fence in a Box <Chevron />
          </button>
          <a className="fo-nav-link" href={copy.financingUrl} onMouseEnter={() => setMenu(null)}>Financing</a>
          <button type="button" className={menu === 'stores' ? 'fo-nav-btn is-open' : 'fo-nav-btn'} aria-expanded={menu === 'stores'} aria-controls={menu === 'stores' ? 'menu-stores' : undefined} onMouseEnter={(event) => openMenu('stores', event.currentTarget)} onClick={(event) => toggleMenu('stores', event)}>
            Locations <Chevron />
          </button>
        </nav>
        {menu === 'install' && (
          <div id="menu-install" className="fo-menu" onMouseEnter={cancelClose}>
            <div className="fo-menu-inner">
              <div style={{ flex: '1.5 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="fo-menu-title">{copy.installTitle}</div>
                <p style={{ margin: 0, fontSize: 16 }}>{copy.installBody}</p>
                <ul className="fo-checks">
                  {copy.installChecks.map((line) => (
                    <li key={line}><Check />{line}</li>
                  ))}
                </ul>
                <a className="fo-underline" href={copy.installAboutUrl}>{copy.installAboutLabel}</a>
              </div>
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <div className="fo-menu-kicker">What We Install</div>
                {materials.map((item) => (
                  <a className="fo-list-link" key={item.name} href={item.install}>{item.name} Fence</a>
                ))}
              </div>
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <div className="fo-menu-kicker">See Our Work</div>
                {galleries.map((item) => (
                  <a className="fo-list-link" key={item.url} href={item.url}>{item.label}</a>
                ))}
              </div>
              <div className="fo-offer">
                <img src={copy.installOfferImage} alt={copy.installOfferAlt} style={{ height: 130, objectPosition: 'center 62%' }} />
                <div className="fo-offer-body">
                  <div className="fo-menu-title" style={{ color: 'var(--fo-white)', fontSize: 24 }}>{copy.installOfferTitle}</div>
                  <div style={{ fontSize: 14 }}>{copy.installOfferNote} <a href={copy.installOfferLinkUrl} onClick={() => setMenu(null)}>{copy.installOfferLinkLabel}</a></div>
                  <button type="button" className="fo-btn" onClick={() => choose('install')}>{copy.installCta}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {menu === 'materials' && (
          <div id="menu-materials" className="fo-menu" onMouseEnter={cancelClose}>
            <div className="fo-menu-inner">
              <div className="fo-materials-grid">
                {materials.map((item) => (
                  <div key={item.name}>
                    <a href={item.install}>
                      <img src={item.image} alt={item.alt} style={{ aspectRatio: '2 / 1', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }} />
                      <span className="fo-mat-name">{item.name}</span>
                    </a>
                    {item.links.map((link) => (
                      <a className="fo-mat-link" key={link.url} href={link.url}>{link.label}</a>
                    ))}
                  </div>
                ))}
              </div>
              <div className="fo-offer" style={{ flexBasis: 300, padding: 22, borderRadius: 'var(--radius-panel)' }}>
                <div className="fo-menu-title" style={{ color: 'var(--fo-white)', fontSize: 26 }}>{copy.materialsOfferTitle}</div>
                <p style={{ margin: 0 }}>{copy.materialsOfferBody}</p>
                <button type="button" className="fo-btn" onClick={() => choose('diy')}>{copy.materialsCta}</button>
              </div>
            </div>
          </div>
        )}
        {menu === 'box' && (
          <div id="menu-box" className="fo-menu" onMouseEnter={cancelClose}>
            <div className="fo-menu-inner">
              <div style={{ flex: '1 1 250px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
                <div className="fo-menu-title">{copy.boxTitle}</div>
                <p style={{ margin: 0, fontSize: 16 }}>{copy.boxBody}</p>
                <a className="fo-underline" href={copy.boxCompareUrl}>{copy.boxCompareLabel}</a>
              </div>
              <div className="fo-box-grid" style={{ flex: '3 1 640px', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))' }}>
                {boxes.map((box) => (
                  <a key={box.name} href={box.url} style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', color: 'var(--text-body)' }}>
                    <img src={box.image} alt={box.alt} style={{ aspectRatio: '16 / 9' }} />
                    <span style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                        <span className="fo-mat-name" style={{ margin: 0 }}>{box.name}</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--fo-gray-800)' }}>{box.price}</span>
                      </span>
                      <span style={{ fontSize: 14 }}>{box.spec}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
        {menu === 'stores' && (
          <div id="menu-stores" className="fo-menu" onMouseEnter={cancelClose}>
            <div className="fo-menu-inner">
              <div className="fo-store-grid" style={{ flex: '3 1 640px', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(min(215px, 100%), 1fr))' }}>
                {stores.map((store) => (
                  <div key={store.name} className="fo-menu-store" style={{ borderColor: storeMarked && store.name === nearestName ? 'var(--fo-orange-500)' : 'var(--border-default)' }}>
                    <a href={store.url} className="fo-mat-name" style={{ margin: 0, fontSize: 22, lineHeight: 1.15 }}>{store.fullName}</a>
                    <span style={{ fontSize: 14 }}>{store.address}</span>
                    <a className="fo-tel ctm-phone" data-store={store.slug} href={store.tel}>{store.phone}</a>
                  </div>
                ))}
              </div>
              <div className="fo-offer">
                <img src={copy.hoursImage} alt={copy.hoursAlt} style={{ height: 130 }} />
                <div className="fo-offer-body">
                  <div className="fo-menu-title" style={{ color: 'var(--fo-white)', fontSize: 24 }}>{copy.hoursTitle}</div>
                  <div>{hours.map((line, index) => <span key={line}>{index > 0 ? <br /> : null}{line}</span>)}</div>
                  <a className="fo-underline" href={copy.hoursLinkUrl}>{copy.hoursLinkLabel}</a>
                </div>
              </div>
            </div>
          </div>
        )}
        {menu && <div className="fo-scrim" aria-hidden="true" />}
        <div ref={pickerRef} className="fo-store" onMouseEnter={() => setMenu(null)}>
          <button
            ref={pickerButtonRef}
            type="button"
            className={picker ? 'fo-store-trigger is-open' : 'fo-store-trigger'}
            aria-expanded={picker}
            aria-controls="store-picker"
            onClick={() => {
              setPicker((open) => !open);
              setMenu(null);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Your store: <span>{nearest.name}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <a className="fo-store-phone ctm-phone" data-current="" data-store={nearest.slug} href={nearest.tel}>{nearest.phone}</a>
          {picker ? (
            <div id="store-picker" role="dialog" aria-label="Choose your store" className="fo-store-panel">
              <div className="fo-store-title">Choose Your Store</div>
              <p className="fo-store-help">{storeSourceText}</p>
              <label className="fo-store-zip">
                Find by ZIP code
                <input type="text" inputMode="numeric" maxLength={5} autoComplete="postal-code" value={zip} onChange={(event) => setZip(event.target.value)} />
              </label>
              <ul aria-label="Stores">
                {stores.map((store) => (
                  <li key={store.name}>
                    <button type="button" aria-pressed={store.name === nearestName} className={store.name === nearestName ? 'is-current' : undefined} onClick={() => chooseStore(store.name)}>
                      <span>
                        <strong>{store.fullName}</strong>
                        <em>{store.address}</em>
                      </span>
                      <b>{store.phone}</b>
                      <i aria-hidden="true">
                        {store.name === nearestName ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : null}
                      </i>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="fo-store-note">All stores: Mon–Fri 8AM–5PM · Sat 8AM–4PM · Sun Closed. We'll remember your store on this device.</p>
            </div>
          ) : null}
        </div>
        <p className="fo-sr" aria-live="polite">{storeLive}</p>
        <div className="fo-mobile-tools">
          <a className="fo-call ctm-phone" data-current="" data-store={nearest.slug} href={nearest.tel} aria-label={`Call Fence Outlet ${nearest.name} at ${nearest.phone}`}>
            <PhoneIcon />
            Call <span className="fo-call-long">{nearest.phone}</span><span className="fo-call-short">{nearest.name}</span>
          </a>
          <div ref={drawerRef} onKeyDown={trapDrawer}>
            <button ref={menuButtonRef} type="button" className="fo-menu-toggle" aria-expanded={drawer} aria-controls="mobile-menu" onClick={() => setDrawer((open) => !open)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {drawer ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
              {drawer ? 'Close' : 'Menu'}
            </button>
            <nav id="mobile-menu" className="fo-drawer" aria-label="Main" hidden={!drawer}>
              <label className="fo-drawer-store">
                Your store
                <select value={nearestName} onChange={(event) => pickStore(event.target.value)}>
                  {stores.map((store) => (
                    <option key={store.name} value={store.name}>{store.fullName} · {store.phone}</option>
                  ))}
                </select>
                <span>{storeSourceText}</span>
              </label>
              {drawerSections.map((item) => (
                <div className="fo-acc" key={item.key}>
                  <button type="button" className={section === item.key ? 'fo-acc-btn is-open' : 'fo-acc-btn'} aria-expanded={section === item.key} aria-controls={`drawer-${item.key}`} onClick={() => setSection((current) => (current === item.key ? null : item.key))}>
                    {item.label} <Chevron />
                  </button>
                  <ul id={`drawer-${item.key}`} className="fo-acc-list" hidden={section !== item.key}>
                    {item.links.map((link) => (
                      <li key={link.url}><a href={link.url}>{link.label}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
              <a className="fo-drawer-link" href={copy.drawerFinancingUrl}>Financing</a>
              <a className="fo-drawer-quote" href="#quote" onClick={() => setDrawer(false)}>{copy.drawerQuoteLabel}</a>
              <p style={{ margin: '14px 0 0', fontSize: 14, color: 'var(--fo-gray-700)', textAlign: 'center' }}>{copy.drawerHours}</p>
            </nav>
          </div>
        </div>
      </header>
    </SectionRoot>
  );
}
