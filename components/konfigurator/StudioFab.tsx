'use client';

// Schwebender Knopf «Anzug gestalten» auf allen Seiten: öffnet das Stil-Studio im
// Vollbild. Die Zahl zeigt, wie viele Details schon gewählt sind. Das Studio selbst
// wird erst beim ersten Öffnen geladen.
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OPEN_EVENT, oeffneStudio, useAuswahl } from '@/lib/konfigurator/useAuswahl';

const StilStudio = dynamic(() => import('./StilStudio'), { ssr: false });

export default function StudioFab() {
  const path = usePathname();
  const { auswahl } = useAuswahl();
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<{ kategorie?: string; untergruppe?: string }>({});
  const [seen, setSeen] = useState(false);
  const count = Object.values(auswahl).reduce((n, a) => n + a.length, 0);

  useEffect(() => {
    const on = (e: Event) => {
      setStart((e as CustomEvent).detail ?? {});
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, on);
    // Knopf erst nach kurzem Scrollen einblenden (Hero bleibt ruhig)
    const sc = () => setSeen(window.scrollY > 240);
    sc();
    window.addEventListener('scroll', sc, { passive: true });
    return () => {
      window.removeEventListener(OPEN_EVENT, on);
      window.removeEventListener('scroll', sc);
    };
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.classList.toggle('studio-open', open);
    return () => document.body.classList.remove('studio-open');
  }, [open]);

  const hideFab = path.startsWith('/massanzug-konfigurator') || path.startsWith('/termin');

  return (
    <>
      {!hideFab && (
        <button
          type="button"
          className={`studio-fab${seen || count ? ' is-in' : ''}${open ? ' is-hidden' : ''}`}
          onClick={() => oeffneStudio()}
          aria-haspopup="dialog"
          aria-label={count ? `Anzug gestalten, ${count} Details gewählt` : 'Anzug gestalten'}
        >
          <span className="studio-fab-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 4.5a1.8 1.8 0 1 1 1.8 1.8c-.9 0-1.8.6-1.8 1.6v1.2m0 0L3.2 15.6a1.2 1.2 0 0 0 .7 2.2h16.2a1.2 1.2 0 0 0 .7-2.2L12 9.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            {count > 0 && <span className="studio-fab-n num">{count}</span>}
          </span>
          <span className="studio-fab-label">Anzug gestalten</span>
        </button>
      )}
      {open && (
        <div className="studio-overlay" role="dialog" aria-modal="true" aria-label="Stil-Studio — Massanzug gestalten">
          <StilStudio mode="full" startKategorie={start.kategorie} startUntergruppe={start.untergruppe} onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
