import type { Metadata, Viewport } from 'next';
import { schriftKlassen } from '@/lib/fonts';
import { SITE } from '@/lib/site';
import '@/app/globals.css';
import './admin.css';
import './atelier.css';
import './mac-app.css';

// Eigenes Root-Layout fürs Backend (seit die Website je Sprache ein Root-Layout hat):
// ohne Header, Footer, Pixel und Tracking der öffentlichen Seite.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Backend', template: '%s — Backend The Sartorialist' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Sartorialist', statusBarStyle: 'black-translucent' },
  alternates: { canonical: null },
  openGraph: null,
};

export const viewport: Viewport = {
  themeColor: '#101010',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={schriftKlassen}>
      <body>
        <div className="adm">{children}</div>
      </body>
    </html>
  );
}
