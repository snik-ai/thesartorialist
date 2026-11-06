// Kundenmails in der Sprache des Kunden: Texte, Terminangabe und Stil-Auswahl übersetzen.
// Sprachcode aus Backend/Formular ('de', 'en', 'pt' …) → Website-Sprache.
import type { StilZeile } from '@/lib/mail-vorlagen';
import { terminLangIn } from '@/lib/zeit';
import { optionText } from '@/lib/konfigurator/auswahl';
import { woerterbuch } from './index';
import { konfigKategorienFuer } from './inhalte';
import { SPRACHEN, istAktiv, type Sprache } from './sprachen';

/** 'pt' → 'pt-pt'; unbekannt oder noch nicht freigeschaltet → Deutsch */
export function spracheAusCode(code?: string | null): Sprache {
  const c = code === 'pt' ? 'pt-pt' : code ?? 'de';
  return (SPRACHEN as readonly string[]).includes(c) && istAktiv(c as Sprache) ? (c as Sprache) : 'de';
}

export function kundenTexte(code?: string | null) {
  const lang = spracheAusCode(code);
  return { lang, t: woerterbuch(lang).mail };
}

/** Termin lesbar in der Kundensprache (ohne Datum: «nach Absprache» übersetzt) */
export function terminTextFuer(code: string | null | undefined, start: Date | null, fallback?: string) {
  const { t } = kundenTexte(code);
  if (start) return terminLangIn(start, t.locale, t.uhr);
  return fallback && spracheAusCode(code) === 'de' ? fallback : t.nachAbsprache;
}

/** Stil-Auswahl der Anfrage (mit IDs) in die Kundensprache übertragen; ohne IDs bleibt sie wie gesendet. */
export function stilFuer(code: string | null | undefined, stil: (StilZeile & { kategorieId?: string; untergruppeId?: string; optionId?: string })[]): StilZeile[] {
  const lang = spracheAusCode(code);
  if (lang === 'de') return stil.map(({ kategorie, untergruppe, option }) => ({ kategorie, untergruppe, option }));
  const kats = konfigKategorienFuer(lang);
  const ta = woerterbuch(lang).konfigurator.ui.auswahl;
  return stil.map((s) => {
    const k = kats.find((x) => x.id === s.kategorieId);
    const u = k?.subCategories.find((x) => x.id === s.untergruppeId);
    const o = u?.options.find((x) => x.id === s.optionId);
    if (!k || !u || !o) return { kategorie: s.kategorie, untergruppe: s.untergruppe, option: s.option };
    return { kategorie: k.title, untergruppe: u.title, option: optionText({ kategorieId: k.id, kategorie: k.title, untergruppeId: u.id, untergruppe: u.title, option: o }, ta) };
  });
}
