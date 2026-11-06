import type { Metadata } from 'next';
import Link from 'next/link';
import SprachRahmen from '@/components/rahmen/SprachRahmen';
import NichtGefunden from '@/components/seiten/NichtGefunden';
import { AKTIVE_SPRACHEN } from '@/lib/i18n/sprachen';

// Globale 404 für unbekannte URLs (experimental.globalNotFound): Seit jede Sprache ein eigenes
// Root-Layout hat, liegt über dieser Datei kein Layout — sie rendert den Rahmen samt <html> selbst.
// Deutsch, mit Hinweis auf die englische Fassung.
export const metadata: Metadata = {
  title: 'Seite nicht gefunden — The Sartorialist Zürich',
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <SprachRahmen lang="de">
      <NichtGefunden lang="de" />
      {AKTIVE_SPRACHEN.includes('en') && (
        <p lang="en" className="muted" style={{ textAlign: 'center', margin: '-2rem auto 4rem', padding: '0 1.25rem' }}>
          Page not found. <Link href="/en/" className="text-link">Continue in English</Link>
        </p>
      )}
    </SprachRahmen>
  );
}
