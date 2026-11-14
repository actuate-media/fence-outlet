'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { boxes as defaultBoxes, materials as defaultMaterials, nearestStoreName, storeSlug, stores as defaultStores, type BoxKit, type Material } from './data';
import { refreshCtmPhones, rememberStore, storeSourceText, type InitialStore, type StoreSource } from './store-choice';

export interface PageStore {
  name: string;
  fullName: string;
  address: string;
  phone: string;
  tel: string;
  url: string;
  slug: string;
}

type Path = 'install' | 'diy' | null;
type ShopMode = 'install' | 'diy';
type StoreInput = Omit<PageStore, 'slug'> & { slug?: string };

export interface PageStateInput {
  stores?: StoreInput[];
  materials?: Material[];
  boxes?: BoxKit[];
  initialStore?: InitialStore;
  headline?: string;
}

export interface PageState {
  zip: string;
  setZip: (value: string) => void;
  zipReady: boolean;
  storeSource: StoreSource;
  storeSourceText: string;
  storeMarked: boolean;
  storeLive: string;
  pickStore: (name: string) => void;
  nearestName: string;
  nearest: PageStore;
  nearestLabel: string;
  path: Path;
  choosePath: (next: Exclude<Path, null>, scroll: boolean) => void;
  shopMode: ShopMode;
  setShopMode: (mode: ShopMode) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  formFocus: boolean;
  setFormFocus: (focused: boolean) => void;
  headline: string;
  stores: PageStore[];
  materials: Material[];
  boxes: BoxKit[];
}

const StateContext = createContext<PageState | null>(null);
const FrameContext = createContext(false);

const blankStore: PageStore = {
  name: 'Orlando',
  fullName: 'Orlando',
  address: '',
  phone: '',
  tel: '',
  url: '',
  slug: 'orlando',
};

function withSlug(store: StoreInput): PageStore {
  return { ...store, slug: store.slug || storeSlug(store) };
}

function choiceFrom(stores: PageStore[], zip: string, picked: string | null, ipName: string | null): { source: StoreSource; store: PageStore } {
  const list = stores.length > 0 ? stores : [blankStore];
  const byName = (name: string) => list.find((store) => store.name === name) ?? list.find((store) => store.name === 'Orlando') ?? list[0] ?? blankStore;
  if (picked) return { source: 'picked', store: byName(picked) };
  if (zip.length === 5) return { source: 'zip', store: byName(nearestStoreName(zip)) };
  if (ipName) return { source: 'ip', store: byName(ipName) };
  return { source: 'default', store: byName('Orlando') };
}

function useLocalState(input: PageStateInput): PageState {
  const initial = input.initialStore;
  const [zip, setZipValue] = useState(initial?.source === 'zip' ? initial.zip : '');
  const [picked, setPicked] = useState<string | null>(initial?.source === 'picked' ? initial.storeName : null);
  const [ipName] = useState<string | null>(initial?.source === 'ip' ? initial.storeName : null);
  const [storeLive, setStoreLive] = useState('');
  const [path, setPath] = useState<Path>(null);
  const [shop, setShop] = useState<ShopMode | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formFocus, setFormFocus] = useState(false);
  const stores = (input.stores && input.stores.length > 0 ? input.stores : defaultStores).map(withSlug);
  const materials = input.materials && input.materials.length > 0 ? input.materials : defaultMaterials;
  const kits = input.boxes && input.boxes.length > 0 ? input.boxes : defaultBoxes;
  const choice = choiceFrom(stores, zip, picked, ipName);
  const seenStore = useRef(false);

  useEffect(() => {
    if (!seenStore.current) {
      seenStore.current = true;
      return;
    }
    refreshCtmPhones();
  }, [choice.store.slug, choice.source]);

  return useMemo(
    () => ({
      zip,
      setZip: (value: string) => {
        const next = value.replace(/\D/g, '').slice(0, 5);
        setZipValue(next);
        if (next.length !== 5) return;
        const name = nearestStoreName(next);
        setPicked(null);
        setStoreLive(`Your store is now ${name}`);
        const store = stores.find((item) => item.name === name);
        rememberStore(store?.slug ?? 'orlando', 'zip', next);
      },
      zipReady: zip.length === 5,
      storeSource: choice.source,
      storeSourceText: storeSourceText(choice.source, zip),
      storeMarked: choice.source !== 'default',
      storeLive,
      pickStore: (name: string) => {
        setPicked(name);
        setStoreLive(`Your store is now ${name}`);
        const store = stores.find((item) => item.name === name);
        rememberStore(store?.slug ?? 'orlando', 'picked', '');
      },
      nearestName: choice.store.name,
      nearest: choice.store,
      nearestLabel: choice.source === 'default' ? 'Enter your ZIP' : `${choice.store.name} · ${choice.store.phone}`,
      path,
      choosePath: (next, scroll) => {
        setPath(next);
        if (scroll) document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      shopMode: shop ?? (path === 'diy' ? 'diy' : 'install'),
      setShopMode: setShop,
      menuOpen,
      setMenuOpen,
      drawerOpen,
      setDrawerOpen,
      formFocus,
      setFormFocus,
      headline: input.headline || 'Fence Materials & Professional Installation',
      stores,
      materials,
      boxes: kits,
    }),
    [zip, picked, storeLive, path, shop, menuOpen, drawerOpen, formFocus, input.headline, stores, materials, kits, choice.source, choice.store],
  );
}

export function PageStateProvider({ initialStore, stores, materials, boxes, headline, children }: PageStateInput & { children: ReactNode }) {
  const state = useLocalState({ initialStore, stores, materials, boxes, headline });
  return <StateContext.Provider value={state}>{children}</StateContext.Provider>;
}

export function usePageState(): PageState {
  const shared = useContext(StateContext);
  const local = useLocalState({});
  return shared ?? local;
}

export function SectionRoot({ className, children }: { className?: string; children: ReactNode }) {
  const inside = useContext(FrameContext);
  if (inside) return children;
  return <div className={className ? `fo-page ${className}` : 'fo-page'}>{children}</div>;
}

function CallBar() {
  const { drawerOpen, formFocus, nearest } = usePageState();
  if (drawerOpen || formFocus) return null;
  return (
    <div className="pk-callbar">
      <a className="pk-btn pk-btn-navy ctm-phone" data-current="" data-store={nearest.slug} href={nearest.tel} aria-label={`Call Fence Outlet ${nearest.name} at ${nearest.phone}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        Call {nearest.name}
      </a>
      <a className="pk-btn pk-btn-orange" href="#quote">Free quote</a>
    </div>
  );
}

export function PageFrame({
  className,
  initialStore,
  stores,
  materials,
  boxes,
  headline,
  children,
}: PageStateInput & { className: string; children: ReactNode }) {
  return (
    <FrameContext.Provider value={true}>
      <div className={`fo-page ${className}`}>
        <a className="fo-skip" href="#quote">Skip to the quote form</a>
        <PageStateProvider initialStore={initialStore} stores={stores} materials={materials} boxes={boxes} headline={headline}>
          {children}
          <CallBar />
        </PageStateProvider>
      </div>
    </FrameContext.Provider>
  );
}
