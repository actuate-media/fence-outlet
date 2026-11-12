'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { boxes as defaultBoxes, materials as defaultMaterials, nearestStoreName, stores as defaultStores, type BoxKit, type Material } from './data';

export interface PageStore {
  name: string;
  fullName: string;
  address: string;
  phone: string;
  tel: string;
  url: string;
}

type Path = 'install' | 'diy' | null;

export interface PageStateInput {
  stores?: PageStore[];
  materials?: Material[];
  boxes?: BoxKit[];
}

export interface PageState {
  zip: string;
  setZip: (value: string) => void;
  zipReady: boolean;
  nearestName: string;
  nearest: PageStore;
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
};

function nearestFrom(stores: PageStore[], zip: string): { name: string; store: PageStore } {
  const list = stores.length > 0 ? stores : [blankStore];
  const fallback = list.find((store) => store.name === 'Orlando') ?? list[0] ?? blankStore;
  if (zip.length !== 5) return { name: fallback.name, store: fallback };
  const name = nearestStoreName(zip);
  return { name, store: list.find((store) => store.name === name) ?? fallback };
}

function useLocalState(input: PageStateInput): PageState {
  const [zip, setZip] = useState('');
  const [path, setPath] = useState<Path>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const stores = input.stores && input.stores.length > 0 ? input.stores : defaultStores;
  const materials = input.materials && input.materials.length > 0 ? input.materials : defaultMaterials;
  const kits = input.boxes && input.boxes.length > 0 ? input.boxes : defaultBoxes;
  const nearest = nearestFrom(stores, zip);
  return useMemo(
    () => ({
      zip,
      setZip,
      zipReady: zip.length === 5,
      nearestName: nearest.name,
      nearest: nearest.store,
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
    [zip, path, menuOpen, stores, materials, kits, nearest.name, nearest.store],
  );
}

export function PageStateProvider({ stores, materials, boxes, children }: PageStateInput & { children: ReactNode }) {
  const state = useLocalState({ stores, materials, boxes });
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
  stores,
  materials,
  boxes,
  children,
}: PageStateInput & { className: string; children: ReactNode }) {
  return (
    <FrameContext.Provider value={true}>
      <div className={`fo-page ${className}`}>
        <a className="fo-skip" href="#quote">Skip to the quote form</a>
        <PageStateProvider stores={stores} materials={materials} boxes={boxes}>
          {children}
        </PageStateProvider>
      </div>
    </FrameContext.Provider>
  );
}
