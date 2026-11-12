'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { heroContent, smsCopy, type HeroTabContent } from './content';
import { SectionRoot, usePageState } from './page-state';

type Path = 'install' | 'diy' | null;

function fieldError(name: string, message?: string) {
  if (!message) return {};
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
    className: 'is-invalid',
  };
}

function FieldMessage({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return <span id={`${name}-error`} className="fo-error">{message}</span>;
}

function Detail({ tab }: { tab: HeroTabContent }) {
  if (!tab.detail && !tab.linkLabel) return null;
  const index = tab.emphasis && tab.detail.includes(tab.emphasis) ? tab.detail.indexOf(tab.emphasis) : -1;
  const body = index >= 0 ? (
    <>
      {tab.detail.slice(0, index)}
      <strong>{tab.emphasis}</strong>
      {tab.detail.slice(index + tab.emphasis.length)}
    </>
  ) : tab.detail;
  return (
    <p>
      {body}
      {body && tab.linkLabel ? ' ' : null}
      {tab.linkLabel ? <a href={tab.linkUrl}>{tab.linkLabel}</a> : null}
    </p>
  );
}

function HeroTab({
  className,
  open,
  picked,
  image,
  imageAlt,
  label,
  buttonLabel,
  priority,
  onOpen,
  children,
}: {
  className: string;
  open: boolean;
  picked: boolean;
  image: string;
  imageAlt: string;
  label: string;
  buttonLabel: string;
  priority: 'high' | 'low';
  onOpen: () => void;
  children: ReactNode;
}) {
  const classes = ['fo-tab', className, open ? 'is-open' : '', picked ? 'is-picked' : ''].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      <img src={image} alt={imageAlt} fetchPriority={priority} loading={priority === 'high' ? 'eager' : 'lazy'} />
      <div className="fo-tab-shade" aria-hidden="true"><span>{label}</span></div>
      <button type="button" className="fo-tab-hit" aria-expanded={open} aria-label={buttonLabel} onClick={onOpen} />
      <div className="fo-tab-panel"><div className="fo-tab-copy">{children}</div></div>
    </div>
  );
}

export function QuoteHero({ content }: { content?: unknown }) {
  const copy = heroContent(content);
  const smsConsent = smsCopy();
  const { stores, zip, setZip, nearest, nearestName, nearestLabel, path, choosePath, menuOpen } = usePageState();
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [pickup, setPickup] = useState(nearestName);
  const [sms, setSms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState<{ name: string; phone: string; tel: string; slug: string } | null>(null);
  const [live, setLive] = useState('');
  const attempted = useRef(false);
  const lastPath = useRef<Path>(path);
  const snapshot = useRef({ playing, menuOpen, active, desktop: false });
  snapshot.current = { playing, menuOpen, active, desktop: snapshot.current.desktop };

  useEffect(() => {
    if (path === lastPath.current) return;
    lastPath.current = path;
    if (path !== 'install' && path !== 'diy') return;
    setActive(path === 'install' ? 0 : 1);
    setPlaying(false);
    setLive(path === 'install' ? 'Professional installation selected' : 'Materials and DIY selected');
    setErrors((current) => {
      if (!current.path) return current;
      const rest = { ...current };
      delete rest.path;
      return rest;
    });
  }, [path]);

  useEffect(() => {
    setPickup(nearestName);
  }, [nearestName]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1080px)');
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      snapshot.current.desktop = desktopQuery.matches;
    };
    if (reducedQuery.matches) setPlaying(false);
    sync();
    desktopQuery.addEventListener('change', sync);
    return () => desktopQuery.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const current = snapshot.current;
      if (!current.playing || !current.desktop || current.menuOpen) return;
      setActive(current.active === null ? 0 : (current.active + 1) % 4);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);

  function openTab(index: number) {
    setActive(index);
    setPlaying(false);
    if (index === 0) choosePath('install', false);
    else if (index === 1) choosePath('diy', false);
    else setLive('');
  }

  function onZip(value: string) {
    setZip(value.replace(/\D/g, '').slice(0, 5));
  }

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const next: Record<string, string> = {};
    if (!path) next.path = 'Choose Install It For Me or I’ll Build It Myself.';
    if (!/^\d{5}$/.test(zip)) next.zip = 'Enter a 5-digit ZIP code.';
    if (path === 'diy' && !data.get('pickup')) next.pickup = 'Choose a pickup location.';
    for (const field of ['first', 'last', 'email', 'phone'] as const) {
      if (!String(data.get(field) ?? '').trim()) next[field] = 'This field is required.';
    }
    const email = String(data.get('email') ?? '');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.';
    return next;
  }

  function firstInvalid(next: Record<string, string>) {
    const order = ['path', 'zip', 'pickup', 'first', 'last', 'email', 'phone'];
    return order.find((key) => next[key]);
  }

  function focusFirstInvalid(form: HTMLFormElement, next: Record<string, string>) {
    const key = firstInvalid(next);
    if (!key) return;
    const target = key === 'path'
      ? form.querySelector<HTMLElement>('.fo-path')
      : form.querySelector<HTMLElement>(`[name="${key}"]`);
    target?.focus();
  }

  function onFormInput(event: FormEvent<HTMLFormElement>) {
    if (!attempted.current) return;
    const next = validate(event.currentTarget);
    setErrors(next);
    const key = firstInvalid(next);
    setAlertMessage(key ? next[key] ?? '' : '');
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    attempted.current = true;
    const form = event.currentTarget;
    const next = validate(form);
    setErrors(next);
    const key = firstInvalid(next);
    if (key) {
      setAlertMessage(next[key] ?? 'Check the quote form and try again.');
      focusFirstInvalid(form, next);
      return;
    }
    setAlertMessage('');
    setSending(true);
    const store = path === 'diy' ? stores.find((item) => item.name === pickup) ?? nearest : nearest;
    window.setTimeout(() => {
      setSending(false);
      setSubmitted({ name: store.fullName, phone: store.phone, tel: store.tel, slug: store.slug });
      setLive(`Thanks! The Fence Outlet ${store.fullName} team will contact you shortly.`);
    }, 400);
  }

  const formTitle = path === 'install' ? 'Book a Free Estimate' : path === 'diy' ? 'Get a Materials Quote' : 'Get a Free Quote';
  const submitLabel = path === 'install' ? 'Book My Free Estimate' : path === 'diy' ? 'Get My Materials Quote' : 'Get Your Free Quote';
  const tabOpen = (index: number) => (active === null ? index < 2 : active === index);
  const tabs = [copy.tabs.install, copy.tabs.diy, copy.tabs.showrooms, copy.tabs.financing];

  return (
    <SectionRoot>
      <section className="fo-hero" aria-label="Get your fence">
        <form id="quote" className="fo-form" tabIndex={-1} aria-labelledby="quote-title" onFocus={() => setPlaying(false)} onInput={onFormInput} onSubmit={onSubmit} noValidate>
          <h2 id="quote-title">{formTitle}</h2>
          <p className="fo-sr" aria-live="polite">{live}</p>
          {alertMessage ? <div className="fo-sr" role="alert">{alertMessage}</div> : null}
          {submitted ? (
            <>
              <p className="fo-success" role="status">Thanks! The Fence Outlet {submitted.name} team will contact you shortly.</p>
              <a className="fo-tel ctm-phone" data-store={submitted.slug} href={submitted.tel}>{submitted.phone}</a>
            </>
          ) : (
            <>
              <div role="group" aria-label="Type of service" aria-describedby={errors.path ? 'path-error' : undefined} className="fo-paths">
                <button type="button" className={path === 'install' ? 'fo-path is-on' : 'fo-path'} aria-pressed={path === 'install'} onClick={() => choosePath('install', false)}>
                  <img src={copy.tabs.install.image} alt="" style={{ objectPosition: 'center 55%' }} />
                  <span><strong>{copy.installLabel}</strong><em className="fo-path-note">{copy.installNote}</em></span>
                </button>
                <button type="button" className={path === 'diy' ? 'fo-path is-on' : 'fo-path'} aria-pressed={path === 'diy'} onClick={() => choosePath('diy', false)}>
                  <img src={copy.tabs.diy.image} alt="" style={{ objectPosition: '30% 10%' }} />
                  <span><strong>{copy.diyLabel}</strong><em className="fo-path-note">{copy.diyNote}</em></span>
                </button>
              </div>
              {errors.path && <p id="path-error" className="fo-error">{errors.path}</p>}
              <div className="fo-fields">
                <label>
                  Zip code
                  <input name="zip" type="text" inputMode="numeric" maxLength={5} autoComplete="postal-code" required value={zip} {...fieldError('zip', errors.zip)} onChange={(event) => onZip(event.target.value)} />
                  <FieldMessage name="zip" message={errors.zip} />
                </label>
                {path === 'diy' ? (
                  <label>
                    Pickup location
                    <select name="pickup" value={pickup} {...fieldError('pickup', errors.pickup)} onChange={(event) => setPickup(event.target.value)}>
                      {stores.map((store) => (
                        <option key={store.name} value={store.name}>{store.name}</option>
                      ))}
                    </select>
                    <FieldMessage name="pickup" message={errors.pickup} />
                  </label>
                ) : (
                  <div className="fo-readonly">
                    Your store
                    <span>{nearestLabel}</span>
                    <input type="hidden" name="pickup" value={nearest.name} />
                  </div>
                )}
                <label>
                  First name
                  <input name="first" type="text" autoComplete="given-name" required {...fieldError('first', errors.first)} />
                  <FieldMessage name="first" message={errors.first} />
                </label>
                <label>
                  Last name
                  <input name="last" type="text" autoComplete="family-name" required {...fieldError('last', errors.last)} />
                  <FieldMessage name="last" message={errors.last} />
                </label>
                <label>
                  Email
                  <input name="email" type="email" autoComplete="email" required {...fieldError('email', errors.email)} />
                  <FieldMessage name="email" message={errors.email} />
                </label>
                <label>
                  Phone
                  <input name="phone" type="tel" autoComplete="tel" required {...fieldError('phone', errors.phone)} />
                  <FieldMessage name="phone" message={errors.phone} />
                </label>
              </div>
              <label className="fo-sms">
                <input type="checkbox" name="sms" checked={sms} onChange={(event) => setSms(event.target.checked)} />
                {copy.smsLabel}
              </label>
              <button type="submit" className="fo-btn fo-submit" disabled={sending}>{sending ? 'Sending…' : submitLabel}</button>
              <p className="fo-legal">
                {smsConsent} See our <a href={copy.privacyUrl}>{copy.privacyLabel}</a> and SMS Terms and Conditions.
              </p>
            </>
          )}
        </form>

        <div className="fo-stage-wrap fo-onnavy">
          <button type="button" className="fo-pause" aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setPlaying((value) => !value)}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <div className={active === null ? 'fo-stage is-default' : 'fo-stage'}>
            {tabs.map((tab, index) => (
              <HeroTab
                key={tab.buttonLabel}
                className={index === 0 ? 'fo-tab-install' : index === 1 ? 'fo-tab-diy' : index === 2 ? 'fo-tab-showrooms is-showrooms' : 'is-financing'}
                open={tabOpen(index)}
                picked={index === 0 ? path === 'install' : index === 1 ? path === 'diy' : false}
                image={tab.image}
                imageAlt={tab.alt}
                label={tab.label}
                buttonLabel={tab.buttonLabel}
                priority={index < 2 ? 'high' : 'low'}
                onOpen={() => openTab(index)}
              >
                {tab.eyebrow ? <span className="fo-eyebrow">{tab.eyebrow}</span> : null}
                <h2>{tab.heading}</h2>
                <p className="fo-lead">{tab.lead}</p>
                {index === 2 ? (
                  <div className="fo-phones">
                    {stores.map((store) => (
                      <a key={store.name} className="ctm-phone" data-store={store.slug} href={store.tel}><span>{store.name}</span><span>{store.phone}</span></a>
                    ))}
                  </div>
                ) : (
                  <Detail tab={tab} />
                )}
              </HeroTab>
            ))}
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}
