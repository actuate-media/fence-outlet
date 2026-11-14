import { Barlow, Barlow_Condensed } from 'next/font/google';
import { Homepage } from './Homepage';
import type { InitialStore } from './store-choice';

const bodyFont = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-barlow',
  display: 'swap',
});

const displayFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const homeFontClassName = `${bodyFont.variable} ${displayFont.variable}`;

export function HomePage({ initialStore }: { initialStore?: InitialStore }) {
  return <Homepage fontClassName={homeFontClassName} initialStore={initialStore} />;
}
