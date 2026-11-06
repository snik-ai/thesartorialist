import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { pfad, ROUTEN, type SeitenKey } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';

// Kleine Auszeichnung für Wörterbuch-Texte (keine HTML-Strings im Wörterbuch):
//   **fett**            → <strong>
//   [Text](termin)      → interner Link auf einen Seiten-Schlüssel (lib/i18n/routen.json), in der Seitensprache
//   [Text](/pfad/)      → interner Link (fester Pfad)
//   [Text](https://…)   → externer Link (neues Fenster), auch mailto: und tel:
// Kein Client-JS, funktioniert in Server- und Client-Komponenten.

const MUSTER = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function ziel(lang: Sprache, z: string): { href: string; extern: boolean } {
  if (/^(https?:|mailto:|tel:)/.test(z)) return { href: z, extern: z.startsWith('http') };
  if (z.startsWith('/') || z.startsWith('#')) return { href: z, extern: false };
  // «key», «key/unterpfad/» oder «key#anker» (z. B. «shop/woolrich/», «konfigurator#jacket»)
  const [ohneAnker, anker] = z.split('#');
  const i = ohneAnker.indexOf('/');
  const key = i < 0 ? ohneAnker : ohneAnker.slice(0, i);
  const rest = i < 0 ? '' : ohneAnker.slice(i + 1);
  const href = key in ROUTEN ? pfad(lang, key as SeitenKey, rest) : `/${ohneAnker}`;
  return { href: anker ? `${href}#${anker}` : href, extern: false };
}

export function rich(lang: Sprache, text: string, linkKlasse?: string): ReactNode {
  const out: ReactNode[] = [];
  let pos = 0;
  let m: RegExpExecArray | null;
  MUSTER.lastIndex = 0;
  while ((m = MUSTER.exec(text))) {
    if (m.index > pos) out.push(text.slice(pos, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={m.index}>{m[1]}</strong>);
    } else {
      const z = ziel(lang, m[3]);
      out.push(
        z.extern || z.href.startsWith('mailto:') || z.href.startsWith('tel:') ? (
          <a key={m.index} href={z.href} className={linkKlasse} {...(z.extern ? { target: '_blank', rel: 'noopener' } : {})}>
            {m[2]}
          </a>
        ) : (
          <Link key={m.index} href={z.href} className={linkKlasse}>
            {m[2]}
          </Link>
        ),
      );
    }
    pos = m.index + m[0].length;
  }
  if (pos < text.length) out.push(text.slice(pos));
  return out.length === 1 && typeof out[0] === 'string' ? out[0] : <>{out.map((x, i) => <Fragment key={i}>{x}</Fragment>)}</>;
}

/** Text mit Auszeichnung als Element: <Rich lang={lang} text={t.absatz} /> */
export default function Rich({ lang, text, linkKlasse }: { lang: Sprache; text: string; linkKlasse?: string }) {
  return <>{rich(lang, text, linkKlasse)}</>;
}
