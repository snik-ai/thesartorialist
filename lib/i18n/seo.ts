// Metadaten je Seite und Sprache: Canonical auf die eigene Sprachfassung, hreflang für
// alle Sprachfassungen (plus x-default = Deutsch), og:locale und vollständige Teilen-Angaben.
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { pfad, sprachenFuer, type SeitenKey } from './routen';
import { SPRACH_INFO, type Sprache } from './sprachen';

export const STANDARD_BILD = { url: '/images/the-sartorialist-zuerich.webp', width: 1500, height: 1000 };

/** hreflang-Tabelle einer Seite (relativ, metadataBase macht sie absolut). */
export function sprachAlternativen(key: SeitenKey, rest = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of sprachenFuer(key)) out[SPRACH_INFO[l].hreflang] = pfad(l, key, rest);
  if (out.de) out['x-default'] = out.de;
  return out;
}

const STADT: Record<Sprache, string> = { de: 'Zürich', en: 'Zurich', fr: 'Zurich', it: 'Zurigo', es: 'Zúrich', 'pt-pt': 'Zurique', ru: 'Цюрих', sr: 'Цирих', sq: 'Cyrih' };
const MAX_TITEL = 60;
const MAX_DESC = 158;

/** Kürzt an der letzten Wortgrenze und hängt «…» an. */
export function kuerzen(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const schnitt = t.slice(0, max - 1);
  const ende = schnitt.lastIndexOf(' ');
  return `${(ende > max * 0.6 ? schnitt.slice(0, ende) : schnitt).replace(/[\s,;:—–-]+$/, '')}…`;
}

/** Suchmaschinen-Titel ≤ 60 Zeichen: zuerst «— The Sartorialist Stadt», dann «| The Sartorialist», sonst nur der Seitentitel. */
export function suchTitel(lang: Sprache, titel: string | { absolute: string }): string {
  if (typeof titel !== 'string') return kuerzen(titel.absolute, MAX_TITEL);
  for (const z of [`${titel} — The Sartorialist ${STADT[lang]}`, `${titel} | The Sartorialist`]) if (z.length <= MAX_TITEL) return z;
  return kuerzen(titel, MAX_TITEL);
}
export const suchBeschreibung = (d: string) => kuerzen(d, MAX_DESC);

type Bild = string | { url: string; width?: number; height?: number; alt?: string };

export function seitenMeta(
  lang: Sprache,
  key: SeitenKey,
  m: {
    title: string | { absolute: string };
    description: string;
    ogTitle?: string;
    ogDescription?: string;
    bild?: Bild;
    /** Unterpfad bei Bereichen wie dem Shop (z. B. «woolrich/») */
    rest?: string;
    robots?: Metadata['robots'];
  },
): Metadata {
  const url = pfad(lang, key, m.rest);
  const titel = typeof m.title === 'string' ? m.title : m.title.absolute;
  const bild: Exclude<Bild, string> = typeof m.bild === 'string' ? { url: m.bild } : (m.bild ?? STANDARD_BILD);
  const images = [{ ...bild, alt: bild.alt ?? m.ogTitle ?? titel }];
  const beschreibung = suchBeschreibung(m.description);
  return {
    title: { absolute: suchTitel(lang, m.title) },
    description: beschreibung,
    alternates: { canonical: url, languages: sprachAlternativen(key, m.rest) },
    openGraph: {
      type: 'website',
      locale: SPRACH_INFO[lang].og,
      siteName: SITE.name,
      url,
      title: m.ogTitle ?? titel,
      description: suchBeschreibung(m.ogDescription ?? m.description),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: m.ogTitle ?? titel,
      description: suchBeschreibung(m.ogDescription ?? m.description),
      images,
    },
    ...(m.robots ? { robots: m.robots } : {}),
  };
}
