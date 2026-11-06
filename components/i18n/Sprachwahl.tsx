'use client';
// Sprachumschalter (kein <select>): Kürzel als Pillen, die aktive Sprache gefüllt.
// Verlinkt auf dieselbe Seite in der Zielsprache; gibt es sie dort nicht, auf deren Startseite.
// Nur freigeschaltete Sprachen (lib/i18n/aktive-sprachen.json) erscheinen.
import { usePathname } from 'next/navigation';
import { sprachLinks } from '@/lib/i18n/routen';
import { SPRACH_INFO } from '@/lib/i18n/sprachen';
import { useSprache } from './SprachKontext';

export default function Sprachwahl({ variante = 'menue', tabIndex }: { variante?: 'menue' | 'footer' | 'leiste'; tabIndex?: number }) {
  const { lang, t } = useSprache();
  const pfad = usePathname() ?? '/';
  const links = sprachLinks(pfad);
  if (links.length < 2) return null;
  return (
    <nav className={`sprachwahl sprachwahl--${variante}`} aria-label={t.sprachwahl.aria}>
      {variante !== 'leiste' && <span className="sprachwahl-label">{t.sprachwahl.label}</span>}
      <ul>
        {links.map((l) => {
          const info = SPRACH_INFO[l.lang];
          const aktiv = l.lang === lang;
          return (
            <li key={l.lang}>
              <a
                href={l.href}
                hrefLang={info.hreflang}
                lang={info.html}
                title={info.name}
                aria-current={aktiv ? 'true' : undefined}
                className={aktiv ? 'is-on' : undefined}
                tabIndex={tabIndex}
              >
                {info.kuerzel}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
