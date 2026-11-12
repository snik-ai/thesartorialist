// Datenquellen in der Seitensprache: Deutsch aus lib/brands.ts, lib/suitColors.ts und
// lib/konfigurator/daten.ts, darüber die Übersetzungen aus dem Wörterbuch (Überlagerung je Slug/ID).
// Nur auf dem Server verwenden.
import { BRANDS, type Brand } from '@/lib/brands';
import { SUIT_COLORS, type SuitColor } from '@/lib/suitColors';
import { KONFIG_KATEGORIEN, type KonfigKategorie } from '@/lib/konfigurator/daten';
import { uebersetzeKatalog } from '@/lib/konfigurator/uebersetzen';
import { woerterbuch } from './index';
import { pfad, type SeitenKey } from './routen';
import type { Sprache } from './sprachen';

export function markenFuer(lang: Sprache): Brand[] {
  const ueb = woerterbuch(lang).marken;
  return BRANDS.map((b) => ({ ...b, ...(lang === 'de' ? {} : ueb[b.slug] ?? {}) }));
}

export function markeFuer(lang: Sprache, slug: string): Brand | undefined {
  return markenFuer(lang).find((b) => b.slug === slug);
}

export function farbenFuer(lang: Sprache): SuitColor[] {
  const ueb = woerterbuch(lang).farben;
  return SUIT_COLORS.map((f) => {
    if (lang === 'de' || !ueb[f.slug]) return f;
    const { varianten: vt, ...text } = ueb[f.slug];
    const varianten = f.varianten?.map((v, i) => {
      const t = vt?.[i];
      if (!t) return v;
      return { ...v, titel: t.titel, teile: v.teile.map((teil, j) => ({ ...teil, ...(t.teile[j] ?? {}) })) };
    });
    return { ...f, ...text, varianten };
  });
}

export function farbeFuer(lang: Sprache, slug: string): SuitColor | undefined {
  return farbenFuer(lang).find((f) => f.slug === slug);
}

/** Konfigurator-Katalog in der Sprache (Deutsch = Original) */
export function konfigKategorienFuer(lang: Sprache): KonfigKategorie[] {
  return lang === 'de' ? KONFIG_KATEGORIEN : uebersetzeKatalog(KONFIG_KATEGORIEN, woerterbuch(lang).konfigDaten);
}

/** URL einer Brand-Seite in der Sprache */
export const markenPfad = (lang: Sprache, slug: string) => pfad(lang, `marke:${slug}` as SeitenKey);
/** URL einer Anzug-Farbseite in der Sprache */
export const farbPfad = (lang: Sprache, slug: string) => pfad(lang, `farbe:${slug}` as SeitenKey);
