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
type StoreInput = Omit<PageStore, 'slug'> & { slug?: string };

export interface PageStateInput {
  stores?: StoreInput[];
  materials?: Material[];
  boxes?: BoxKit[];
  initialStore?: InitialStore;
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
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
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
  const [menuOpen, setMenuOpen] = useState(false);
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
      menuOpen,
      setMenuOpen,
      stores,
      materials,
      boxes: kits,
    }),
    [zip, picked, storeLive, path, menuOpen, stores, materials, kits, choice.source, choice.store],
  );
}

export function PageStateProvider({ initialStore, stores, materials, boxes, children }: PageStateInput & { children: ReactNode }) {
  const state = useLocalState({ initialStore, stores, materials, boxes });
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

export function PageFrame({
  className,
  initialStore,
  stores,
  materials,
  boxes,
  children,
}: PageStateInput & { className: string; children: ReactNode }) {
  return (
    <FrameContext.Provider value={true}>
      <div className={`fo-page ${className}`}>
        <a className="fo-skip" href="#quote">Skip to the quote form</a>
        <PageStateProvider initialStore={initialStore} stores={stores} materials={materials} boxes={boxes}>
          {children}
        </PageStateProvider>
      </div>
    </FrameContext.Provider>
  );
}
