'use client';

// Letzte Auffangseite für Fehler im Browser. Häufigster Fall nach einem Deploy: Ein offener Tab
// lädt Programmteile der alten Version, die es nicht mehr gibt (ChunkLoadError) — dann einmal
// automatisch neu laden statt «Application error» zu zeigen. Sonst eine ruhige Seite mit Neu laden.
import { useEffect } from 'react';

const SCHLUESSEL = 'ts_neu_geladen';

function istVersionsFehler(e: Error) {
  const t = `${e?.name ?? ''} ${e?.message ?? ''}`;
  return /ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Importing a module script failed|failed to fetch/i.test(t);
}

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[seite] Fehler im Browser:', error);
    let schonNeu = false;
    try {
      schonNeu = sessionStorage.getItem(SCHLUESSEL) === '1';
    } catch {}
    if (istVersionsFehler(error) && !schonNeu) {
      try {
        sessionStorage.setItem(SCHLUESSEL, '1');
      } catch {}
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'Inter, -apple-system, Helvetica, Arial, sans-serif', background: '#fff', color: '#111' }}>
        <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 440 }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, letterSpacing: '0.04em', margin: '0 0 0.25rem' }}>THE SARTORIALIST</p>
            <p style={{ fontSize: 11, letterSpacing: '0.3em', margin: '0 0 2rem', color: '#777' }}>ZÜRICH</p>
            <p style={{ fontSize: 17, lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              Die Seite wurde soeben aktualisiert. Bitte einmal neu laden.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(SCHLUESSEL);
                  } catch {}
                  window.location.reload();
                }}
                style={{ padding: '14px 26px', border: 0, background: '#111', color: '#fff', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Neu laden
              </button>
              <button
                type="button"
                onClick={() => reset()}
                style={{ padding: '14px 26px', border: '1px solid #111', background: '#fff', color: '#111', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Erneut versuchen
              </button>
            </div>
            <p style={{ marginTop: '2rem', fontSize: 13, color: '#777' }}>
              Oder direkt: <a href="tel:+41432430277" style={{ color: '#111' }}>+41 43 243 02 77</a> ·{' '}
              <a href="https://wa.me/41764880630" style={{ color: '#111' }}>WhatsApp</a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
