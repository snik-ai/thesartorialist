'use client';

// Schwebender Knopf «Anzug gestalten» auf allen Seiten: führt zu «Styles & Options»
// (Massanzug-Konfigurator). Die Zahl zeigt, wie viele Details schon gewählt sind.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuswahl } from '@/lib/konfigurator/useAuswahl';
import { pfad } from '@/lib/i18n/routen';
import { fmt } from '@/lib/i18n/fmt';
import { useSprache } from '@/components/i18n/SprachKontext';

export default function StudioFab() {
  const { lang, t } = useSprache();
  const path = usePathname();
  const konfig = pfad(lang, 'konfigurator');
  const { auswahl } = useAuswahl();
  const [seen, setSeen] = useState(false);
  const count = Object.values(auswahl).reduce((n, a) => n + a.length, 0);

  useEffect(() => {
    // Knopf erst nach kurzem Scrollen einblenden (Hero bleibt ruhig)
    const sc = () => setSeen(window.scrollY > 240);
    sc();
    window.addEventListener('scroll', sc, { passive: true });
    return () => window.removeEventListener('scroll', sc);
  }, []);

  if (path.startsWith(konfig) || path.startsWith(pfad(lang, 'termin'))) return null;

  const termin = pfad(lang, 'termin');
  return (
    <div className={`fab-leiste${seen || count ? ' is-in' : ''}`}>
      <Link href={termin} className="fab-termin">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span>{t.ankuendigung.link}</span>
      </Link>
      <Link href={konfig} className="studio-fab is-in" aria-label={count ? fmt(t.studioFab.aria, { n: count }) : t.studioFab.label}>
        <span className="studio-fab-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 4.5a1.8 1.8 0 1 1 1.8 1.8c-.9 0-1.8.6-1.8 1.6v1.2m0 0L3.2 15.6a1.2 1.2 0 0 0 .7 2.2h16.2a1.2 1.2 0 0 0 .7-2.2L12 9.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          {count > 0 && <span className="studio-fab-n num">{count}</span>}
        </span>
        <span className="studio-fab-label">{t.studioFab.label}</span>
      </Link>
    </div>
  );
}
