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
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: sprachAlternativen(key, m.rest) },
    openGraph: {
      type: 'website',
      locale: SPRACH_INFO[lang].og,
      siteName: SITE.name,
      url,
      title: m.ogTitle ?? titel,
      description: m.ogDescription ?? m.description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: m.ogTitle ?? titel,
      description: m.ogDescription ?? m.description,
      images,
    },
    ...(m.robots ? { robots: m.robots } : {}),
  };
}
