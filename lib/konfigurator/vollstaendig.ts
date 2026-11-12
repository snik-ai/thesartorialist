// Wann ist eine Kategorie des Konfigurators «vollständig»? Für die Messung (konfig_fertig) im Browser und
// für die Auswertung im Backend — beide lesen dieselbe Definition.
//
// Eine Kategorie besteht aus Entscheidungen. Gruppen, die sich gegenseitig ausschliessen (EXKLUSIV, z. B.
// Einreiher ↔ Zweireiher, die vier Revers-Arten), sind eine einzige Entscheidung. Reine Extras
// (Ticket-Tasche, Monogramm) zählen nicht mit. Vollständig = jede Entscheidung hat eine Auswahl.
import type { KonfigKategorie } from './daten';
import type { Auswahl } from './konst';
import { EXKLUSIV } from './regeln';

/** Untergruppen, die frei bleiben dürfen (Extras). */
export const OPTIONAL = new Set(['jacket-ticket-pocket', 'jacket-monogram']);

/** Entscheidungen einer Kategorie: je eine Liste von Untergruppen-IDs. */
export function entscheidungen(k: KonfigKategorie): string[][] {
  const out: string[][] = [];
  const gesehen = new Set<string>();
  for (const u of k.subCategories) {
    if (OPTIONAL.has(u.id) || gesehen.has(u.id)) continue;
    const set = EXKLUSIV.find((s) => s.includes(u.id));
    const gruppe = set ? set.filter((id) => k.subCategories.some((x) => x.id === id)) : [u.id];
    gruppe.forEach((id) => gesehen.add(id));
    out.push(gruppe);
  }
  return out;
}

export const vollstaendig = (k: KonfigKategorie, a: Auswahl) => entscheidungen(k).every((g) => g.some((id) => (a[id] ?? []).length > 0));
