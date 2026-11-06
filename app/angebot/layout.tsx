import type { Metadata, Viewport } from 'next';
import { schriftKlassen } from '@/lib/fonts';
import { SITE } from '@/lib/site';
import '@/app/globals.css';
import './angebot.css';

// Eigenes Root-Layout für die Angebotsseite (Annahme-Link): ohne Header/Footer/Tracking, nie indexiert.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'Ihr Angebot', template: '%s — The Sartorialist Zürich' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
  openGraph: null,
  referrer: 'no-referrer',
};

export const viewport: Viewport = { themeColor: '#101010', width: 'device-width', initialScale: 1 };

export default function AngebotLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={schriftKlassen}>
      <body>
        <div className="ao">{children}</div>
      </body>
    </html>
  );
}
