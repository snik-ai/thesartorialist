// Auswahl des Stil-Konfigurators: liegt im Browser (localStorage), damit sie beim
// Termin, im PDF und beim nächsten Besuch wieder da ist. Kein Server, kein Konto.
import { KONFIG_KATEGORIEN, type KonfigKategorie, type KonfigOption } from './daten';
import { fmt } from '@/lib/i18n/fmt';
import { AUSWAHL_TEXTE_DE, type AuswahlTexte } from './texte';

import { CHANGE_EVENT, STOFF_KEY, STORAGE_KEY, type Auswahl } from './konst';
export { CHANGE_EVENT, STORAGE_KEY, type Auswahl };

/** Notierte Stoffnummern (Holland & Sherry) aus dem Browser lesen. */
export function ladeStoffe(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const v = JSON.parse(localStorage.getItem(STOFF_KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export type Gewaehlt = {
  kategorieId: string;
  kategorie: string;
  untergruppeId: string;
  untergruppe: string;
  option: KonfigOption;
};

export function ladeAuswahl(): Auswahl {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function speichereAuswahl(a: Auswahl) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {}
}

/** IDs → vollständige Einträge, in der Reihenfolge des Katalogs (unbekannte IDs fallen weg).
 * Mit übersetztem Katalog (uebersetzeKatalog) kommen Bezeichnungen in der Seitensprache. */
export function aufloesen(a: Auswahl, kategorien: KonfigKategorie[] = KONFIG_KATEGORIEN): Gewaehlt[] {
  const out: Gewaehlt[] = [];
  for (const k of kategorien) {
    for (const u of k.subCategories) {
      const ids = a[u.id] ?? [];
      for (const o of u.options) {
        if (ids.includes(o.id)) out.push({ kategorieId: k.id, kategorie: k.title, untergruppeId: u.id, untergruppe: u.title, option: o });
      }
    }
  }
  return out;
}

/** Codes nur zeigen, wenn sie etwas aussagen (z. B. «2 B», «6 X 2», «PCC»), nicht reine Positionsnummern
 * («1», «2») oder Breitenkürzel, die schon in der Bezeichnung stehen («S», «R», «L»). */
export const zeigeCode = (code?: string, label?: string) => {
  if (!code) return false;
  const c = code.trim();
  if (/^\d+$/.test(c) || /^[SRL]$/.test(c)) return false;
  const norm = (x: string) => x.toLowerCase().replace(/[\s()]/g, '');
  return !(label && norm(label).includes(norm(c)));
};

const optionText = (g: Gewaehlt, t: AuswahlTexte = AUSWAHL_TEXTE_DE) =>
  g.option.pocketSpec
    ? fmt(t.taschen, { brust: g.option.pocketSpec.chest, seite: g.option.pocketSpec.side })
    : // Code nur anhängen, wenn er nicht schon in der Bezeichnung steckt (S/R/L bei Revers-Breiten)
      `${g.option.label}${zeigeCode(g.option.code, g.option.label) ? ` (${g.option.code})` : ''}`;

/** Lesbare Zusammenfassung für E-Mail und Terminanfrage. */
export function alsText(items: Gewaehlt[], stoffe: string[] = [], t: AuswahlTexte = AUSWAHL_TEXTE_DE): string {
  const lines: string[] = [];
  if (stoffe.length) lines.push(t.stoffKopf, `– ${stoffe.length > 1 ? t.stoffnummern : t.stoffnummer}: ${stoffe.join(', ')}`, '');
  let kat = '';
  for (const g of items) {
    if (g.kategorie !== kat) {
      if (kat) lines.push('');
      kat = g.kategorie;
      lines.push(kat.toUpperCase());
    }
    lines.push(`– ${g.untergruppe}: ${optionText(g, t)}`);
  }
  return lines.join('\n');
}

export { optionText, AUSWAHL_TEXTE_DE, type AuswahlTexte };
