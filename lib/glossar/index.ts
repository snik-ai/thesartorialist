// Glossar: alle Begriffe, sortiert, mit Hilfsfunktionen.
import type { GlossarBegriff, GlossarGruppe } from './typen';
import { TEIL_1 } from './teil-1';
import { TEIL_2 } from './teil-2';
import { TEIL_3 } from './teil-3';
import { TEIL_4 } from './teil-4';

export type { GlossarBegriff, GlossarGruppe };

export const GLOSSAR: GlossarBegriff[] = [...TEIL_1, ...TEIL_2, ...TEIL_3, ...TEIL_4].sort((a, b) =>
  a.begriff.localeCompare(b.begriff, 'de'),
);

export const GRUPPEN: GlossarGruppe[] = ['Grundlagen', 'Passform', 'Sakko', 'Hose', 'Weste & Anlass', 'Hochzeit', 'Stoffe', 'Muster', 'Hemd', 'Accessoires', 'Pflege'];

export const getBegriff = (slug: string) => GLOSSAR.find((b) => b.slug === slug);

/** Anfangsbuchstabe für das A–Z (Umlaute wie Grundbuchstabe) */
export const buchstabe = (b: GlossarBegriff) =>
  b.begriff.charAt(0).toUpperCase().replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U');

/** Wortzahl eines Eintrags (für Qualitätsprüfung) */
export const woerter = (b: GlossarBegriff) =>
  [b.kurz, ...b.abschnitte.map((a) => a.text), b.beispiel.text, ...b.faq.map((f) => f.antwort)].join(' ').split(/\s+/).length;
