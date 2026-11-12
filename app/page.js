import { Sections } from '@prenta/sections-react';
import { getHomePage } from '../lib/cms.js';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const page = await getHomePage();

  if (!page) {
    return (
      <main className="site">
        <header className="site-header">
          <a href="/">Fence Outlet</a>
        </header>
        <section className="site-placeholder">
          <h1>Fence Outlet</h1>
          <p>Connect a Prenta CMS site to publish homepage content.</p>
        </section>
      </main>
    );
  }

  const content = page.data?.data ?? {};
  const sections = Array.isArray(content.sections) ? content.sections : [];

  return (
    <main className="site">
      <header className="site-header">
        <a href="/">Fence Outlet</a>
      </header>
      <h1>{typeof content.title === 'string' ? content.title : 'Fence Outlet'}</h1>
      <Sections sections={sections} />
    </main>
  );
}
