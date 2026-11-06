// Seiten-Schlüssel ↔ URL je Sprache (Quelle: routen.json, auch von next.config.mjs gelesen).
// Klein genug für den Browser: der Sprachumschalter findet damit die Seite in der Zielsprache.
import ROUTEN_JSON from './routen.json';
import { AKTIVE_SPRACHEN, SICHTBARE_SPRACHEN, istAktiv, type Sprache } from './sprachen';

const { _hinweis, ...ROH } = ROUTEN_JSON as Record<string, unknown> & { _hinweis: string };
void _hinweis;

export type SeitenKey = Exclude<keyof typeof ROUTEN_JSON, '_hinweis'>;
export const ROUTEN = ROH as Record<SeitenKey, Partial<Record<Sprache, string>>>;
export const SEITEN_KEYS = Object.keys(ROUTEN) as SeitenKey[];

/** Bereiche mit Unterseiten, die in allen Sprachen gleich heissen (Shop-Produkte, Shop-Kategorien). */
const PRAEFIX_KEYS: SeitenKey[] = ['shop'];

/** Pfad einer Seite in einer Sprache. Gibt es die Seite dort nicht (oder ist die Sprache
 * noch nicht freigeschaltet), fällt der Link auf die deutsche Seite zurück. */
export function pfad(lang: Sprache, key: SeitenKey, rest = ''): string {
  const r = ROUTEN[key];
  const p = (istAktiv(lang) && r[lang]) || r.de || '/';
  return rest ? `${p}${rest.replace(/^\//, '')}` : p;
}

/** Gibt es die Seite in dieser Sprache (und ist die Sprache freigeschaltet)? */
export const gibtEs = (lang: Sprache, key: SeitenKey) => istAktiv(lang) && !!ROUTEN[key]?.[lang];

/** Sprachen, in denen eine Seite existiert (für hreflang und Sitemap). */
export const sprachenFuer = (key: SeitenKey): Sprache[] => SICHTBARE_SPRACHEN.filter((l) => !!ROUTEN[key]?.[l]);

const normal = (p: string) => {
  let s = p;
  try {
    s = decodeURI(p);
  } catch {
    /* schon dekodiert */
  }
  return s.endsWith('/') ? s : `${s}/`;
};

/** URL → Seite und Sprache (für den Sprachumschalter). */
export function findeSeite(url: string): { key: SeitenKey; lang: Sprache; rest: string } | null {
  const p = normal(url);
  for (const key of SEITEN_KEYS) {
    for (const [lang, ziel] of Object.entries(ROUTEN[key]) as [Sprache, string][]) {
      if (ziel === p) return { key, lang, rest: '' };
    }
  }
  for (const key of PRAEFIX_KEYS) {
    for (const [lang, ziel] of Object.entries(ROUTEN[key]) as [Sprache, string][]) {
      if (p.startsWith(ziel)) return { key, lang, rest: p.slice(ziel.length) };
    }
  }
  return null;
}

/** Sprache aus einer URL (Präfix), ohne Seitenkenntnis. */
export function spracheAusPfad(url: string): Sprache {
  const erstes = normal(url).split('/')[1] ?? '';
  return (AKTIVE_SPRACHEN as string[]).includes(erstes) ? (erstes as Sprache) : 'de';
}

/** Ziel-Links des Sprachumschalters für die aktuelle URL. */
export function sprachLinks(url: string): { lang: Sprache; href: string }[] {
  const s = findeSeite(url);
  return SICHTBARE_SPRACHEN.map((lang) => ({
    lang,
    href: s && ROUTEN[s.key][lang] ? pfad(lang, s.key, s.rest) : pfad(lang, 'start'),
  }));
}
