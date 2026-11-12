import type { Metadata } from 'next';
import './admin.css';

// Resolve the browser-tab favicon from CMS Brand Settings (Settings →
// Appearance). Wrapped in try/catch so builds without a DB connection still
// emit valid metadata. The admin SPA also keeps the favicon live on save (no
// reload needed). Importing the light `appearance` subpath avoids dragging DB
// codegen into the layout module graph.
export async function generateMetadata(): Promise<Metadata> {
  const base: Metadata = { robots: 'noindex, nofollow' };
  try {
    const [{ resolveBrand }, { getPrisma }] = await Promise.all([
      import('@prenta/core/appearance'),
      import('@/lib/prisma'),
    ]);
    const { favicon } = await resolveBrand(getPrisma(), null);
    if (favicon.icon) {
      base.icons = {
        icon: [{ url: favicon.icon, type: favicon.type ?? undefined }],
        shortcut: [{ url: favicon.icon }],
        apple: favicon.apple ? [{ url: favicon.apple }] : undefined,
      };
    }
  } catch {
    // Database unavailable — fall back to base metadata.
  }
  return base;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="prenta-admin">
          {children}
        </div>
      </body>
    </html>
  );
}
