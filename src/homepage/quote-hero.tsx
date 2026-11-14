'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { heroContent, type HeroTabContent } from './content';
import { inServiceArea } from './data';
import { SectionRoot, usePageState } from './page-state';
import { dateFromKey, slotGroups, soonestOpening, tomorrow, weekDays, weekRange, type TimeSlot } from './schedule';

const trustItems = ['30+ years', '8 Florida showrooms', 'Licensed & insured'];

function Check({ size, stroke }: { size: number; stroke: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function House() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function Hammer() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 12 8.5 18.5a2.1 2.1 0 0 1-3-3L12 9" />
      <path d="M17.6 6.4 22 11l-3 3-4.4-4.6" />
      <path d="m14 4 3 3" />
    </svg>
  );
}

function Pin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function Bolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function Clock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 2h6" />
    </svg>
  );
}

function Chat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}

type QuoteMode = 'book' | 'ask';
type ContactWay = '' | 'Call' | 'Text' | 'Email';

type QuoteDetails = {
  first: string;
  last: string;
  email: string;
  phone: string;
  sms: boolean;
  address: string;
  city: string;
  feet: string;
  height: string;
  gates: string;
  notes: string;
  ship: 'pickup' | 'delivery';
  dzip: string;
  day: string;
  slot: TimeSlot | null;
  questions: string;
  contact: ContactWay;
  ftype: string;
};

const emptyDetails: QuoteDetails = {
  first: '',
  last: '',
  email: '',
  phone: '',
  sms: false,
  address: '',
  city: '',
  feet: '',
  height: 'Not sure',
  gates: 'None',
  notes: '',
  ship: 'pickup',
  dzip: '',
  day: '',
  slot: null,
  questions: '',
  contact: '',
  ftype: '',
};

const fenceTypes = ['Vinyl', 'Wood', 'Aluminum', 'Chain link', 'Not sure'];
const fenceHeights = ['Not sure', '4 ft', '5 ft', '6 ft', '8 ft'];
const fenceGates = ['None', '1 walk gate', '2 gates', 'Drive gate', 'Not sure'];

function phoneDigits(value: string) {
  return value.replace(/\D/g, '');
}

function phoneOk(value: string) {
  const digits = phoneDigits(value);
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

function focusId(id: string) {
  window.setTimeout(() => document.getElementById(id)?.focus(), 80);
}

function Field({ label, id, type = 'text', autoComplete, value, error, onChange }: { label: ReactNode; id: string; type?: string; autoComplete: string; value: string; error?: string; onChange: (value: string) => void }) {
  const errorId = `e-${id.slice(2)}`;
  return (
    <label htmlFor={id}>
      <span>{label}</span>
      <input id={id} name={id} type={type} autoComplete={autoComplete} required={id !== 'q-phone'} aria-invalid={Boolean(error)} aria-describedby={errorId} value={value} onChange={(event) => onChange(event.target.value)} />
      <p id={errorId} className="pk-field-error">{error ?? ''}</p>
    </label>
  );
}

function SmsFields({ details, error, privacyUrl, showMobile, onSms, onMobile }: { details: QuoteDetails; error?: string; privacyUrl: string; showMobile: boolean; onSms: (checked: boolean) => void; onMobile: (value: string) => void }) {
  return (
    <div className="pk-sms">
      <label>
        <input id="q-sms" type="checkbox" name="sms_consent" checked={details.sms} aria-describedby="sms-terms" onChange={(event) => onSms(event.target.checked)} />
        Text me scheduling updates and reminders
      </label>
      <p id="sms-terms">By checking this box, I consent to receive text messages related to Scheduling, Updates, Reminders Appointments from Fence Outlet. You can reply STOP to opt-out at any time. Messages and data rates may apply. Message frequency will vary. Reply HELP to 407-851-6660 for assistance. See our <a href={privacyUrl}>privacy policy</a> and SMS Terms and Conditions.</p>
      {showMobile ? (
        <div className="pk-mobile">
          <label htmlFor="q-mobile">Mobile number for texts</label>
          <input id="q-mobile" type="tel" autoComplete="tel" aria-invalid={Boolean(error)} aria-describedby="e-mobile" value={details.phone} onChange={(event) => onMobile(event.target.value)} />
          <p id="e-mobile" className="pk-field-error">{error ?? ''}</p>
        </div>
      ) : null}
    </div>
  );
}

function Picket({
  open,
  showrooms,
  image,
  imageAlt,
  label,
  buttonLabel,
  priority,
  progress,
  position,
  onOpen,
  children,
}: {
  open: boolean;
  showrooms?: boolean;
  image: string;
  imageAlt: string;
  label: string;
  buttonLabel: string;
  priority: 'high' | 'low';
  progress: boolean;
  position: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  const classes = ['pk-picket', open ? 'is-open' : '', showrooms ? 'is-showrooms' : ''].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {progress ? <span className="pk-progress" aria-hidden="true" /> : null}
      <img src={image} alt={imageAlt} style={{ objectPosition: position }} fetchPriority={priority} loading={priority === 'high' ? 'eager' : 'lazy'} />
      <div className="pk-picket-label" aria-hidden="true"><span>{label}</span></div>
      <button type="button" className="pk-picket-hit" aria-expanded={open} aria-label={buttonLabel} onClick={onOpen} />
      <div className="pk-picket-panel"><div className="pk-picket-copy">{children}</div></div>
    </div>
  );
}

export function QuoteHero({ content }: { content?: unknown }) {
  const copy = heroContent(content);
  const { stores, zip, setZip, nearest, nearestName, pickStore, path, choosePath, menuOpen, headline, setFormFocus } = usePageState();
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [details, setDetails] = useState<QuoteDetails>(emptyDetails);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState('');
  const [mode, setMode] = useState<QuoteMode | null>(null);
  const [done, setDone] = useState(false);
  const [weekOff, setWeekOff] = useState(0);
  const [holdUntil, setHoldUntil] = useState<number | null>(null);
  const [savedPhone, setSavedPhone] = useState('');
  const [tick, setTick] = useState(0);
  const snapshot = useRef({ playing, menuOpen, active, desktop: false });
  snapshot.current = { playing, menuOpen, active, desktop: snapshot.current.desktop };
  const service = path ?? 'install';
  const install = service === 'install';

  const lastPath = useRef(path);
  useEffect(() => {
    if (path === lastPath.current) return;
    lastPath.current = path;
    if (path !== 'install' && path !== 'diy') return;
    setActive(path === 'install' ? 0 : 1);
    setPlaying(false);
    setLive(path === 'install' ? 'Professional installation selected' : 'Materials and DIY selected');
    setError('');
  }, [path]);

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

  useEffect(() => {
    if (!(step === 4 && mode === 'book' && !done && holdUntil)) return;
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [step, mode, done, holdUntil]);

  const holdNote = useRef({ until: 0, two: false, end: false });
  useEffect(() => {
    if (!holdUntil || mode !== 'book') return;
    if (holdNote.current.until !== holdUntil) holdNote.current = { until: holdUntil, two: false, end: false };
    const remaining = holdUntil - Date.now();
    if (remaining <= 0 && !holdNote.current.end) {
      holdNote.current.end = true;
      setLive('Your hold expired. Pick a time again.');
    } else if (remaining <= 120000 && remaining > 0 && !holdNote.current.two) {
      holdNote.current.two = true;
      setLive('2 minutes left on your hold.');
    }
  }, [tick, holdUntil, mode]);

  function openTab(index: number) {
    setActive(index);
    setPlaying(false);
    if (index === 0) choosePath('install', false);
    else if (index === 1) choosePath('diy', false);
  }

  function clearError(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function changeDetails(partial: Partial<QuoteDetails>, clear?: string) {
    setDetails((current) => ({ ...current, ...partial }));
    if (clear) clearError(clear);
  }

  function reportErrors(next: Record<string, string>, focus: string) {
    const count = Object.keys(next).length;
    setFieldErrors(next);
    setLive(count === 1 ? '1 field needs attention' : `${count} fields need attention`);
    focusId(focus);
  }

  function go(next: 1 | 2 | 3 | 4, message: string, id: string) {
    setStep(next);
    setError('');
    setFieldErrors({});
    setLive(message);
    setPlaying(false);
    focusId(id);
  }

  function continueArea() {
    if (install && !/^\d{5}$/.test(zip)) {
      setFieldErrors({ zip: 'Enter your 5-digit ZIP code.' });
      setError('');
      focusId('q-zip');
      return;
    }
    if (install && !inServiceArea(zip)) {
      setFieldErrors({ zip: 'This ZIP is outside our installation area.' });
      setError('');
      focusId('q-zip');
      return;
    }
    go(2, `Step 2 of ${install ? 4 : 3}: your contact info`, 'q-first');
  }

  function continueInfo() {
    const next: Record<string, string> = {};
    if (!details.first.trim()) next.first = 'Enter your first name.';
    if (!details.last.trim()) next.last = 'Enter your last name.';
    const email = details.email.trim();
    if (!email) next.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = 'Enter an email like name@example.com.';
    if (details.phone.trim() && !phoneOk(details.phone)) next.phone = 'Enter a 10-digit phone number.';
    const keys = Object.keys(next);
    if (keys[0]) {
      reportErrors(next, `q-${keys[0]}`);
      return;
    }
    setSavedPhone(phoneDigits(details.phone));
    go(3, install ? 'Step 3 of 4: pick a time' : 'Step 3 of 3: project details', install ? 'q-slot0' : 'q-type0');
  }

  function placeHold(slot: TimeSlot, week?: number) {
    changeDetails({ day: slot.dayKey, slot }, 'slot');
    if (week != null) setWeekOff(week);
    setHoldUntil(Date.now() + 600000);
  }

  function pickSlot(slot: TimeSlot) {
    placeHold(slot);
    setLive(`${slot.short} at ${slot.time} selected`);
  }

  function takeSoonest(slot: TimeSlot, week: number) {
    placeHold(slot, week);
    setMode('book');
    go(4, `Held for you: ${slot.short} at ${slot.time}`, 'q-address');
  }

  function continueTime() {
    if (!details.slot) {
      reportErrors({ slot: 'Choose a time, or skip below.' }, 'q-slot0');
      return;
    }
    setMode('book');
    setHoldUntil((current) => current ?? Date.now() + 600000);
    go(4, 'Step 4 of 4: confirm your appointment', 'q-address');
  }

  function skipToQuestions() {
    const contact = details.contact || (phoneDigits(details.phone) ? 'Call' : 'Email');
    changeDetails({ contact });
    setMode('ask');
    setHoldUntil(null);
    go(4, 'Step 4 of 4: your questions', 'q-questions');
  }

  function submitQuote() {
    const ask = mode === 'ask';
    const remaining = holdUntil ? holdUntil - Date.now() : 0;
    const expired = Boolean(holdUntil) && remaining <= 0;
    const next: Record<string, string> = {};
    if (install && !ask) {
      if (expired) {
        setLive('Your hold expired. Pick a time again.');
        return;
      }
      if (!details.address.trim()) next.address = 'Enter the street address.';
      if (!details.city.trim()) next.city = 'Enter the city.';
      if (!phoneOk(details.phone)) next.mobile = phoneDigits(details.phone) ? 'Enter a 10-digit mobile number.' : 'Enter a mobile number so your estimator can reach you.';
    } else if (install && ask) {
      if ((details.sms || details.contact !== 'Email') && !phoneOk(details.phone)) {
        next.mobile = phoneDigits(details.phone) ? 'Enter a 10-digit mobile number.' : details.sms ? 'Enter a mobile number to get text updates.' : 'Enter a phone number so we can reach you.';
      }
    } else {
      if (details.sms && !phoneOk(details.phone)) next.mobile = phoneDigits(details.phone) ? 'Enter a 10-digit mobile number.' : 'Enter a mobile number to get text updates.';
      if (!details.ftype) next.ftype = 'Choose a fence type, or Not sure.';
      if (details.ship === 'delivery' && details.dzip.length !== 5) next.dzip = 'Enter the 5-digit delivery ZIP code.';
    }
    const key = Object.keys(next)[0];
    if (key) {
      const focus = key === 'slot' ? 'q-slot0' : key === 'ftype' ? 'q-type0' : `q-${key}`;
      reportErrors(next, focus);
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setDone(true);
      setError('');
      setFieldErrors({});
      setLive(install ? (ask ? 'Your questions were sent.' : 'Your estimate is booked.') : 'Your quote request was sent.');
      focusId('quote-title');
    }, 400);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || done) return;
    if (step === 1) continueArea();
    else if (step === 2) continueInfo();
    else if (step === 3 && install) continueTime();
    else submitQuote();
  }

  function back() {
    const next = (step === 4 ? 3 : step === 3 ? 2 : 1) as 1 | 2 | 3 | 4;
    if (next < 4) setMode(null);
    setStep(next);
    setError('');
    setFieldErrors({});
    focusId(next === 1 ? (install ? 'q-zip' : 'q-store') : next === 2 ? 'q-first' : 'q-slot0');
  }

  function onSms(checked: boolean) {
    changeDetails({ sms: checked }, 'mobile');
  }

  const tabs = [copy.tabs.install, copy.tabs.diy, copy.tabs.showrooms, copy.tabs.financing];
  const positions = ['center 40%', '30% 0', 'center 20%', 'center'];
  const open = (index: number) => (active === null ? index < 2 : active === index);
  const total = install ? 4 : 3;
  const ask = mode === 'ask';
  const booking = install && step === 4 && mode === 'book' && !done;
  const asking = install && step === 4 && ask && !done;
  const labels = install ? ['Service area', 'Your info', 'Pick a time', ask ? 'Your questions' : 'Confirm'] : ['Your store', 'Your info', 'Details'];
  const stepText = done ? 'Done' : `Step ${step} of ${total} · ${labels[step - 1]}`;
  const formTitle = done
    ? (install ? (ask ? 'Questions sent!' : "You're booked!") : 'Request sent!')
    : asking ? 'Ask us first'
      : booking ? 'Confirm your estimate'
        : install ? 'Book a free estimate' : 'Get a materials quote';
  const hint = install ? 'We measure, handle permits and HOA, and install. Start with your ZIP.' : 'Choose the showroom you’ll buy from. Delivery is available too.';
  const zipReady = /^\d{5}$/.test(zip);
  const covered = install && zipReady && inServiceArea(zip);
  const outside = install && zipReady && !inServiceArea(zip);
  const calendarStart = tomorrow();
  const soon = install ? soonestOpening(calendarStart) : null;
  const week = weekRange(weekOff, calendarStart);
  const days = weekDays(weekOff, calendarStart);
  const viewKey = details.day || soon?.slot.dayKey || '';
  const groups = slotGroups(viewKey, calendarStart);
  const viewLong = viewKey ? dateFromKey(viewKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
  const now = tick || Date.now();
  const remaining = holdUntil ? holdUntil - now : 0;
  const expired = Boolean(holdUntil) && remaining <= 0;
  const holdMinutes = Math.max(0, Math.floor(remaining / 60000));
  const holdSeconds = Math.max(0, Math.floor((remaining % 60000) / 1000));
  const holdText = expired ? 'This hold expired. Tap Change to pick a time again.' : `Held for you · ${holdMinutes}:${String(holdSeconds).padStart(2, '0')}`;
  const showTextMobile = !booking && (Boolean(fieldErrors.mobile) || (!savedPhone && (details.sms || (asking && details.contact !== 'Email'))));
  const showBookPhone = booking && (!savedPhone || Boolean(fieldErrors.mobile));
  const reach = details.contact || 'Email';
  const reachVerb = reach === 'Call' ? 'call' : reach === 'Text' ? 'text' : 'email';

  return (
    <SectionRoot>
      <section className={menuOpen ? 'pk-hero is-holding' : 'pk-hero'} aria-label="Get your fence">
        <form
          id="quote"
          className="pk-form"
          tabIndex={-1}
          aria-labelledby="quote-title"
          noValidate
          onSubmit={onSubmit}
          onFocus={() => { setFormFocus(true); setPlaying(false); }}
          onBlur={(event) => {
            const form = event.currentTarget;
            const next = event.relatedTarget;
            if (next instanceof Node && form.contains(next)) return;
            window.setTimeout(() => {
              if (!form.contains(document.activeElement)) setFormFocus(false);
            }, 120);
          }}
        >
          <div className="pk-form-head">
            <span>{stepText}</span>
            <h2 id="quote-title" tabIndex={-1}>{formTitle}</h2>
          </div>
          <div className={install ? 'pk-steps is-4' : 'pk-steps'} aria-hidden="true">
            {Array.from({ length: total }, (_, index) => <span key={index} className={done || index < step ? 'is-on' : ''} />)}
          </div>
          <p className="fo-sr" aria-live="polite">{live}</p>
          {step === 1 ? (
            <>
              <div className="pk-svc" role="radiogroup" aria-label="Type of service">
                <span className={install ? 'pk-svc-thumb' : 'pk-svc-thumb is-diy'} aria-hidden="true" />
                <label className={install ? 'is-on' : ''}>
                  <input id="q-install" type="radio" name="service" value="install" checked={install} onChange={() => choosePath('install', false)} />
                  <House />Install It For Me
                </label>
                <label className={install ? '' : 'is-on'}>
                  <input id="q-diy" type="radio" name="service" value="diy" checked={!install} onChange={() => choosePath('diy', false)} />
                  <Hammer />I&apos;ll Build It Myself
                </label>
              </div>
              <p className="pk-hint">{hint}</p>
              {install ? (
                <>
                  <label className="pk-span">
                    Project ZIP code
                    <input id="q-zip" name="zip" type="text" inputMode="numeric" maxLength={5} autoComplete="postal-code" required aria-invalid={Boolean(fieldErrors.zip)} aria-describedby="e-zip q-area" value={zip} onChange={(event) => { setZip(event.target.value); clearError('zip'); }} />
                  </label>
                  <p id="e-zip" className="pk-field-error">{fieldErrors.zip ?? ''}</p>
                  <div id="q-area" aria-live="polite">
                    {covered ? <p className="pk-area-in"><Check size={20} stroke={2.6} /><span><strong>We install in {zip}.</strong> Your free estimate comes from our {nearest.name} team.</span></p> : null}
                    {outside ? (
                      <div className="pk-area-out">
                        <span><strong>We don&apos;t install in {zip} yet.</strong> You can still get materials from any of our 8 Florida showrooms, with pickup or delivery.</span>
                        <span className="pk-area-actions">
                          <button type="button" className="pk-switch" onClick={() => choosePath('diy', false)}>Switch to I&apos;ll Build It Myself</button>
                          <a className="ctm-phone" data-store={nearest.slug} href={nearest.tel}>Or call {nearest.phone}</a>
                        </span>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor="q-store">Your store
                    <select id="q-store" value={nearestName} aria-describedby="q-store-info" onChange={(event) => pickStore(event.target.value)}>
                      {stores.map((store) => <option key={store.name} value={store.name}>{store.fullName}</option>)}
                    </select>
                  </label>
                  <p id="q-store-info" className="pk-store-info"><Pin /><span>{nearest.address} · {nearest.phone}<br />Mon–Fri 8–5 · Sat 8–4 · Sun closed</span></p>
                </>
              )}
              <p id="q-err" role="alert" className="pk-alert">{error}</p>
              <button type="button" className="pk-btn pk-btn-orange pk-continue" onClick={continueArea}>Continue<Arrow /></button>
            </>
          ) : null}
          {(step === 2 || step === 3 || asking) && !done ? (
            <div className="pk-summary">
              <span><strong>{install ? 'Installation' : 'Materials'}</strong> · {install ? `ZIP ${zip} · ${nearest.name} team` : `${nearest.name} store`}</span>
              <button type="button" onClick={back}><BackArrow />Back</button>
            </div>
          ) : null}
          {step === 2 ? (
            <>
              <div className="pk-fields">
                <Field label="First name" id="q-first" autoComplete="given-name" value={details.first} error={fieldErrors.first} onChange={(value) => changeDetails({ first: value }, 'first')} />
                <Field label="Last name" id="q-last" autoComplete="family-name" value={details.last} error={fieldErrors.last} onChange={(value) => changeDetails({ last: value }, 'last')} />
                <Field label="Email" id="q-email" type="email" autoComplete="email" value={details.email} error={fieldErrors.email} onChange={(value) => changeDetails({ email: value }, 'email')} />
                <Field label={<>Phone <span className="pk-optional">(optional)</span></>} id="q-phone" type="tel" autoComplete="tel" value={details.phone} error={fieldErrors.phone} onChange={(value) => changeDetails({ phone: value }, 'phone')} />
              </div>
              <button type="button" className="pk-btn pk-btn-orange pk-continue" onClick={continueInfo}>{install ? 'Next: pick a time' : 'Next: project details'}<Arrow /></button>
            </>
          ) : null}
          {step === 3 && install && !done ? (
            <>
              {soon ? (
                <div className="pk-soonest">
                  <Bolt />
                  <span><strong>Soonest:</strong> {soon.slot.short} · {soon.slot.time} with {soon.slot.est}</span>
                  <button type="button" className="pk-take" onClick={() => takeSoonest(soon.slot, soon.weekOff)}>Take it</button>
                </div>
              ) : null}
              <div className="pk-week">
                <div className="pk-week-nav">
                  <button type="button" aria-label="Previous week" disabled={weekOff <= 0} onClick={() => setWeekOff((value) => Math.max(0, value - 1))}><Chevron direction="left" /></button>
                  <span aria-live="polite">{week.label}</span>
                  <button type="button" aria-label="Next week" disabled={weekOff >= 5} onClick={() => setWeekOff((value) => Math.min(5, value + 1))}><Chevron direction="right" /></button>
                </div>
                <div className="pk-days" role="group" aria-label="Choose a day">
                  {days.map((day) => (
                    <button key={day.key} id={day.id} type="button" className={day.key === viewKey ? 'pk-day is-on' : 'pk-day'} disabled={day.off} aria-pressed={day.key === viewKey} aria-label={day.aria} onClick={() => { if (day.off) return; changeDetails({ day: day.key }); setLive(`${day.long}: ${day.count} times open`); }}>
                      <span>{day.dow}</span><strong>{day.num}</strong><i aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
              <fieldset aria-describedby="e-slot">
                <legend>{viewLong ? `Open times · ${viewLong}` : 'Open times'}</legend>
                {groups.map((group) => (
                  <div key={group.name} className="pk-slot-group">
                    <span className="pk-slot-label">{group.name}</span>
                    <div className="pk-slots">
                      {group.slots.map((slot) => (
                        <button key={slot.key} id={slot.id} type="button" className={details.slot?.key === slot.key ? 'pk-slot is-on' : 'pk-slot'} aria-pressed={details.slot?.key === slot.key} aria-label={`${slot.time} to ${slot.end} with ${slot.est}`} onClick={() => pickSlot(slot)}>
                          <strong>{slot.time}</strong><span>with {slot.est}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {viewKey && groups.length === 0 ? <p className="pk-empty">No openings this day. Try another day, or take the soonest opening.</p> : null}
                <p id="e-slot" className="pk-field-error">{fieldErrors.slot ?? ''}</p>
              </fieldset>
              <p className="pk-aside">One-hour visit at your property. We book at least a day ahead.</p>
              <button type="button" className="pk-btn pk-btn-orange pk-continue" onClick={continueTime}>Next: confirm<Arrow /></button>
              <button type="button" className="pk-skip" onClick={skipToQuestions}><Chat />Skip, I have questions before I book</button>
            </>
          ) : null}
          {step === 3 && !install && !done ? (
            <>
              <fieldset aria-describedby="e-ftype">
                <legend>Fence type</legend>
                <div className="pk-pills">
                  {fenceTypes.map((label, index) => (
                    <button key={label} id={`q-type${index}`} type="button" className={details.ftype === label ? 'pk-pill is-on' : 'pk-pill'} aria-pressed={details.ftype === label} onClick={() => changeDetails({ ftype: label }, 'ftype')}>{label}</button>
                  ))}
                </div>
                <p id="e-ftype" className="pk-field-error">{fieldErrors.ftype ?? ''}</p>
              </fieldset>
              <div className="pk-details">
                <label>Length (feet)
                  <input type="text" inputMode="numeric" placeholder="e.g. 120" value={details.feet} onChange={(event) => changeDetails({ feet: event.target.value })} />
                </label>
                <label>Height
                  <select value={details.height} onChange={(event) => changeDetails({ height: event.target.value })}>
                    {fenceHeights.map((height) => <option key={height}>{height}</option>)}
                  </select>
                </label>
                <label>Gates
                  <select value={details.gates} onChange={(event) => changeDetails({ gates: event.target.value })}>
                    {fenceGates.map((gate) => <option key={gate}>{gate}</option>)}
                  </select>
                </label>
              </div>
              <fieldset>
                <legend>Pickup or delivery</legend>
                <div className="pk-toggle">
                  <button type="button" aria-pressed={details.ship !== 'delivery'} className={details.ship !== 'delivery' ? 'is-on' : ''} onClick={() => changeDetails({ ship: 'pickup' })}>Pickup at {nearest.name}</button>
                  <button type="button" aria-pressed={details.ship === 'delivery'} className={details.ship === 'delivery' ? 'is-on' : ''} onClick={() => changeDetails({ ship: 'delivery' })}>Delivery</button>
                </div>
              </fieldset>
              {details.ship === 'delivery' ? (
                <label htmlFor="q-dzip">Delivery ZIP code
                  <input id="q-dzip" className="pk-zip" type="text" inputMode="numeric" maxLength={5} autoComplete="postal-code" aria-invalid={Boolean(fieldErrors.dzip)} aria-describedby="e-dzip" value={details.dzip} onChange={(event) => changeDetails({ dzip: event.target.value.replace(/\D/g, '').slice(0, 5) }, 'dzip')} />
                </label>
              ) : null}
              <p id="e-dzip" className="pk-field-error">{fieldErrors.dzip ?? ''}</p>
              <label>Anything else? <span className="pk-optional">Optional: style, color, HOA rules, timeline</span>
                <textarea rows={2} value={details.notes} onChange={(event) => changeDetails({ notes: event.target.value })} />
              </label>
              <SmsFields details={details} error={fieldErrors.mobile} privacyUrl={copy.privacyUrl} showMobile={showTextMobile} onSms={onSms} onMobile={(value) => changeDetails({ phone: value }, 'mobile')} />
              <button type="submit" className="pk-btn pk-btn-orange pk-continue" disabled={sending}>{sending ? 'Sending…' : 'Get my materials quote'}</button>
            </>
          ) : null}
          {booking ? (
            <>
              <div className="pk-appt">
                <div className="pk-appt-main">
                  <div>
                    <span className="pk-appt-kicker">Your appointment</span>
                    <strong className="pk-appt-when">{details.slot ? `${details.slot.long} · ${details.slot.time}–${details.slot.end}` : ''}</strong>
                    <span className="pk-appt-est">{details.slot ? `${details.slot.est}, your estimator · ${nearest.name} team` : ''}</span>
                  </div>
                  <button type="button" className="pk-change" onClick={back}>Change</button>
                </div>
                <div className={expired ? 'pk-hold is-expired' : 'pk-hold'} role="timer" aria-live="off"><Clock />{holdText}</div>
              </div>
              <div className="pk-addr">
                <div className="pk-span">
                  <label htmlFor="q-address">Street address</label>
                  <input id="q-address" name="address" type="text" autoComplete="address-line1" required aria-invalid={Boolean(fieldErrors.address)} aria-describedby="e-address h-address" value={details.address} onChange={(event) => changeDetails({ address: event.target.value }, 'address')} />
                  <p id="h-address" className="pk-field-hint">The property we&apos;ll be measuring.</p>
                  <p id="e-address" className="pk-field-error">{fieldErrors.address ?? ''}</p>
                </div>
                <div>
                  <label htmlFor="q-city">City</label>
                  <input id="q-city" name="city" type="text" autoComplete="address-level2" required aria-invalid={Boolean(fieldErrors.city)} aria-describedby="e-city" value={details.city} onChange={(event) => changeDetails({ city: event.target.value }, 'city')} />
                  <p id="e-city" className="pk-field-error">{fieldErrors.city ?? ''}</p>
                </div>
                <div>
                  <span>State · ZIP</span>
                  <span className="pk-zipbox">FL {zip}</span>
                </div>
                {showBookPhone ? (
                  <div className="pk-span">
                    <label htmlFor="q-mobile">Mobile phone</label>
                    <input id="q-mobile" name="mobile" type="tel" autoComplete="tel" required aria-invalid={Boolean(fieldErrors.mobile)} aria-describedby="e-mobile h-mobile" value={details.phone} onChange={(event) => changeDetails({ phone: event.target.value }, 'mobile')} />
                    <p id="h-mobile" className="pk-field-hint">Your estimator calls if they&apos;re running late.</p>
                    <p id="e-mobile" className="pk-field-error">{fieldErrors.mobile ?? ''}</p>
                  </div>
                ) : null}
              </div>
              <details className="pk-prep">
                <summary>Help your estimator prepare <span className="pk-optional">(optional)</span></summary>
                <div className="pk-prep-body">
                  <div role="group" aria-label="Fence type" className="pk-pills">
                    {fenceTypes.map((label) => (
                      <button key={label} type="button" className={details.ftype === label ? 'pk-pill is-on' : 'pk-pill'} aria-pressed={details.ftype === label} onClick={() => changeDetails({ ftype: label })}>{label}</button>
                    ))}
                  </div>
                  <label>Anything we should know? <span className="pk-optional">Gate code, pets, HOA rules, old fence to remove</span>
                    <textarea rows={2} value={details.notes} onChange={(event) => changeDetails({ notes: event.target.value })} />
                  </label>
                </div>
              </details>
              <SmsFields details={details} error={fieldErrors.mobile} privacyUrl={copy.privacyUrl} showMobile={false} onSms={onSms} onMobile={(value) => changeDetails({ phone: value }, 'mobile')} />
              <p id="q-err" role="alert" className="pk-alert">{error}</p>
              <button type="submit" className="pk-btn pk-btn-orange pk-continue" disabled={sending}>{sending ? 'Booking…' : 'Book my free estimate'}</button>
              <p className="pk-note">No payment, no obligation. Reschedule or cancel any time from your confirmation.</p>
            </>
          ) : null}
          {asking ? (
            <>
              <p className="pk-ask">No problem. Tell us what&apos;s on your mind and our {nearest.name} team will call or email to answer it, then help you pick a time.</p>
              <label htmlFor="q-questions">Your questions <span className="pk-optional">Optional: pricing, materials, permits, timing</span>
                <textarea id="q-questions" rows={3} value={details.questions} onChange={(event) => changeDetails({ questions: event.target.value })} />
              </label>
              <fieldset>
                <legend>Best way to reach you</legend>
                <div className="pk-toggle is-3">
                  {(['Call', 'Text', 'Email'] as const).map((way) => (
                    <button key={way} type="button" aria-pressed={details.contact === way} className={details.contact === way ? 'is-on' : ''} onClick={() => changeDetails({ contact: way }, 'mobile')}>{way}</button>
                  ))}
                </div>
              </fieldset>
              <SmsFields details={details} error={fieldErrors.mobile} privacyUrl={copy.privacyUrl} showMobile={showTextMobile} onSms={onSms} onMobile={(value) => changeDetails({ phone: value }, 'mobile')} />
              <p id="q-err" role="alert" className="pk-alert">{error}</p>
              <button type="submit" className="pk-btn pk-btn-orange pk-continue" disabled={sending}>{sending ? 'Sending…' : 'Send my questions'}</button>
              <button type="button" className="pk-textbtn" onClick={back}>Back to the calendar</button>
            </>
          ) : null}
          {done ? (
            <div className="pk-done" role="status">
              <div className="pk-done-lead">
                <span className="pk-done-check" aria-hidden="true"><Check size={24} stroke={3} /></span>
                <p>{install
                  ? (ask
                    ? `Thanks, ${details.first || 'there'}! Our ${nearest.name} team will ${reachVerb} you to answer your questions and help you pick a time.`
                    : `Thanks, ${details.first || 'there'}! Your free in-home estimate is booked. We sent the confirmation and a calendar invite to ${details.email || 'your email'}.`)
                  : `Thanks, ${details.first || 'there'}! Our ${nearest.name} team will email your materials quote to ${details.email || 'you'}.`}</p>
              </div>
              <ul>
                {install && ask ? (
                  <>
                    <li><span>Questions</span><strong>{details.questions ? details.questions.slice(0, 80) : 'We’ll walk you through it'}</strong></li>
                    <li><span>Reach you by</span><strong>{reach === 'Email' ? `${reach} · ${details.email}` : `${reach} · ${details.phone}`}</strong></li>
                    <li><span>Store</span><strong>{nearest.fullName} · {nearest.phone}</strong></li>
                  </>
                ) : install ? (
                  <>
                    <li><span>When</span><strong>{details.slot ? `${details.slot.short} · ${details.slot.time}–${details.slot.end}` : ''}</strong></li>
                    <li><span>Where</span><strong>{details.address}, {details.city}, FL {zip}</strong></li>
                    <li><span>Estimator</span><strong>{details.slot ? `${details.slot.est} · ${nearest.name} team` : ''}</strong></li>
                  </>
                ) : (
                  <>
                    <li><span>Fence</span><strong>{[details.ftype, details.feet ? `${details.feet} ft` : '', details.height !== 'Not sure' ? details.height : '', details.gates !== 'None' ? details.gates : ''].filter(Boolean).join(' · ') || 'Not sure yet'}</strong></li>
                    <li><span>{details.ship === 'delivery' ? 'Delivery' : 'Pickup'}</span><strong>{details.ship === 'delivery' ? `To ZIP ${details.dzip}, priced in your quote` : `${nearest.fullName} showroom`}</strong></li>
                    <li><span>Store</span><strong>{nearest.phone}</strong></li>
                  </>
                )}
                {details.sms ? <li><span>Text updates</span><strong>On · {details.phone}</strong></li> : null}
              </ul>
              <p>Questions? Call our {nearest.name} team at <a className="ctm-phone" data-current="" data-store={nearest.slug} href={nearest.tel}>{nearest.phone}</a>.</p>
            </div>
          ) : null}
          <div className="pk-form-foot"><span>Free · No obligation</span></div>
        </form>

        <div className="pk-stage">
          <div className="pk-intro">
            <h1>{headline}</h1>
            <div className="pk-trustrow">
              <ul aria-label="Why Fence Outlet">
                {trustItems.map((item) => (
                  <li key={item}><Check size={16} stroke={3} />{item}</li>
                ))}
              </ul>
              <button type="button" className="pk-pause" aria-label={playing ? 'Pause slideshow' : 'Play slideshow'} onClick={() => setPlaying((value) => !value)}>
                {playing ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
          <div className={active === null ? 'pk-pickets is-default' : 'pk-pickets'}>
            {tabs.map((tab, index) => (
              <Picket
                key={tab.buttonLabel}
                open={open(index)}
                showrooms={index === 2}
                image={tab.image}
                imageAlt={tab.alt}
                label={tab.label}
                buttonLabel={tab.buttonLabel}
                priority={index < 2 ? 'high' : 'low'}
                progress={playing && active === index}
                position={positions[index] ?? 'center'}
                onOpen={() => openTab(index)}
              >
                <PicketCopy tab={tab} index={index} stores={stores} />
              </Picket>
            ))}
          </div>
        </div>
      </section>
    </SectionRoot>
  );
}

function PicketCopy({ tab, index, stores }: { tab: HeroTabContent; index: number; stores: { name: string; phone: string; tel: string; slug: string }[] }) {
  if (index === 2) {
    return (
      <>
        <h2>{tab.heading}</h2>
        <p>{tab.lead}</p>
        <div className="pk-showrooms">
          {stores.map((store) => (
            <a key={store.name} className="ctm-phone" data-store={store.slug} href={store.tel}><span>{store.name}</span><span>{store.phone}</span></a>
          ))}
        </div>
      </>
    );
  }
  const emphasisAt = tab.emphasis && tab.detail.includes(tab.emphasis) ? tab.detail.indexOf(tab.emphasis) : -1;
  return (
    <>
      {tab.eyebrow ? <span className="pk-kicker">{tab.eyebrow}</span> : null}
      <h2>{tab.heading}</h2>
      <p>{tab.lead}</p>
      {tab.detail ? (
        <p>
          {emphasisAt >= 0 ? <>{tab.detail.slice(0, emphasisAt)}<strong>{tab.emphasis}</strong>{tab.detail.slice(emphasisAt + tab.emphasis.length)}</> : tab.detail}
          {tab.linkLabel ? <> <a href={tab.linkUrl}>{tab.linkLabel}</a></> : null}
        </p>
      ) : tab.linkLabel ? <p><a href={tab.linkUrl}>{tab.linkLabel}</a></p> : null}
    </>
  );
}
