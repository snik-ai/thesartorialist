// Deutsche Bezeichnungen für Konfigurator-IDs (Backend: Webseitenanalyse, Konfigurator-Analyse).
// Tracking-Ziele sind «untergruppeId:optionId» bzw. Kategorie-/Schritt-IDs — hier werden sie lesbar.
import { KONFIG_KATEGORIEN } from './daten';
import { zeigeCode } from './auswahl';

export type OptionInfo = { kategorieId: string; kategorie: string; untergruppeId: string; untergruppe: string; label: string };
export const OPTIONEN = new Map<string, OptionInfo>();
export const UNTERGRUPPE_KAT = new Map<string, string>();
export const UNTERGRUPPE_TITEL = new Map<string, string>();
for (const k of KONFIG_KATEGORIEN)
  for (const u of k.subCategories) {
    UNTERGRUPPE_KAT.set(u.id, k.id);
    UNTERGRUPPE_TITEL.set(u.id, u.title);
    for (const o of u.options) {
      const label = o.pocketSpec ? o.label : `${o.label}${zeigeCode(o.code, o.label) ? ` (${o.code})` : ''}`;
      OPTIONEN.set(`${u.id}:${o.id}`, { kategorieId: k.id, kategorie: k.title, untergruppeId: u.id, untergruppe: u.title, label });
    }
  }

export const SCHRITT_LABEL: Record<string, string> = {
  ...Object.fromEntries(KONFIG_KATEGORIEN.map((k) => [k.id, k.title])),
  stoff: 'Stoff',
  uebersicht: 'Übersicht',
};

/** Ziel eines Konfigurator-Ereignisses lesbar machen (Echtzeit-Liste): IDs → deutsche Bezeichnungen. */
export function konfigZielText(typ: string, ziel: string | null): string | null {
  if (!ziel) return ziel;
  if (typ === 'konfig_wahl' || typ === 'konfig_abwahl' || typ === 'konfig_detail') {
    const o = OPTIONEN.get(ziel);
    return o ? `${o.untergruppe}: ${o.label}` : ziel;
  }
  if (typ === 'konfig_kategorie' || typ === 'konfig_fertig') return SCHRITT_LABEL[ziel] ?? ziel;
  return ziel;
}
