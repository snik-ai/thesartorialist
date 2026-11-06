// Sprachen der Website. Deutsch ist Hauptsprache und läuft ohne Präfix (alle
// bisherigen URLs bleiben gleich); alle anderen Sprachen haben ein Präfix wie
// die alte WordPress/WPML-Seite (/en/, /fr/, /pt-pt/ …).
//
// FREISCHALTEN einer Sprache: Code in lib/i18n/aktive-sprachen.json eintragen.
// Das steuert Seiten (generateStaticParams), Sitemap, hreflang, Sprachumschalter
// und die Weiterleitungen in next.config.mjs (alte Sprach-URLs liefern dann 200).
// Diese Datei wird auch im Browser geladen: nur kleine Konstanten, keine Texte.
import AKTIV from './aktive-sprachen.json';

export const SPRACHEN = ['de', 'en', 'fr', 'it', 'es', 'pt-pt', 'ru', 'sr', 'sq'] as const;
export type Sprache = (typeof SPRACHEN)[number];
export type Fremdsprache = Exclude<Sprache, 'de'>;
export const FREMDSPRACHEN = SPRACHEN.filter((s): s is Fremdsprache => s !== 'de');

/** Freigeschaltete Fremdsprachen (zentrale Liste, siehe aktive-sprachen.json) */
export const AKTIVE_SPRACHEN: Fremdsprache[] = (AKTIV as string[]).filter((s): s is Fremdsprache =>
  (FREMDSPRACHEN as readonly string[]).includes(s),
);
/** Deutsch plus alle freigeschalteten Sprachen, in fester Reihenfolge */
export const SICHTBARE_SPRACHEN: Sprache[] = SPRACHEN.filter((s) => s === 'de' || AKTIVE_SPRACHEN.includes(s));

export const istSprache = (s: string): s is Sprache => (SPRACHEN as readonly string[]).includes(s);
export const istAktiv = (s: Sprache) => s === 'de' || AKTIVE_SPRACHEN.includes(s);

export type SprachInfo = {
  /** Kürzel im Umschalter */
  kuerzel: string;
  /** Name in der eigenen Sprache */
  name: string;
  /** <html lang> und JSON-LD inLanguage */
  html: string;
  /** hreflang-Code */
  hreflang: string;
  /** og:locale */
  og: string;
  /** Intl-Locale für Datum/Zahlen */
  intl: string;
  /** Sprachcode für Backend und Kundenmails (app/api/anfrage) */
  mail: 'de' | 'en' | 'fr' | 'it' | 'es' | 'pt' | 'ru' | 'sr' | 'sq';
};

export const SPRACH_INFO: Record<Sprache, SprachInfo> = {
  de: { kuerzel: 'DE', name: 'Deutsch', html: 'de-CH', hreflang: 'de', og: 'de_CH', intl: 'de-CH', mail: 'de' },
  en: { kuerzel: 'EN', name: 'English', html: 'en', hreflang: 'en', og: 'en_GB', intl: 'en-GB', mail: 'en' },
  fr: { kuerzel: 'FR', name: 'Français', html: 'fr', hreflang: 'fr', og: 'fr_CH', intl: 'fr-CH', mail: 'fr' },
  it: { kuerzel: 'IT', name: 'Italiano', html: 'it', hreflang: 'it', og: 'it_CH', intl: 'it-CH', mail: 'it' },
  es: { kuerzel: 'ES', name: 'Español', html: 'es', hreflang: 'es', og: 'es_ES', intl: 'es-ES', mail: 'es' },
  'pt-pt': { kuerzel: 'PT', name: 'Português', html: 'pt-PT', hreflang: 'pt-PT', og: 'pt_PT', intl: 'pt-PT', mail: 'pt' },
  ru: { kuerzel: 'RU', name: 'Русский', html: 'ru', hreflang: 'ru', og: 'ru_RU', intl: 'ru-RU', mail: 'ru' },
  sr: { kuerzel: 'SR', name: 'Српски', html: 'sr', hreflang: 'sr', og: 'sr_RS', intl: 'sr-RS', mail: 'sr' },
  sq: { kuerzel: 'SQ', name: 'Shqip', html: 'sq', hreflang: 'sq', og: 'sq_AL', intl: 'sq-AL', mail: 'sq' },
};
