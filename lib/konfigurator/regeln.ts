// Abhängigkeiten zwischen Untergruppen: Was sich gegenseitig ausschliesst und
// welche Schritte nach einer Wahl nicht mehr passen (Einreiher ↔ Zweireiher).
import type { Auswahl } from './konst';

/** Gruppen, von denen nur eine eine Auswahl haben darf. */
export const EXKLUSIV: string[][] = [
  ['jacket-front-sb', 'jacket-front-db'],
  ['jacket-lapel-notch', 'jacket-lapel-peak', 'jacket-lapel-shawl', 'jacket-lapel-db-peak'],
  ['waistcoat-front-sb', 'waistcoat-front-db'],
];

const SB_REVERS = ['jacket-lapel-notch', 'jacket-lapel-peak', 'jacket-lapel-shawl'];

/** Untergruppen, die nach der bisherigen Wahl nicht passen (im Stil-Studio übersprungen). */
export function ausgeblendet(a: Auswahl): Set<string> {
  const h = new Set<string>();
  const has = (id: string) => (a[id] ?? []).length > 0;
  if (has('jacket-front-sb')) ['jacket-front-db', 'jacket-lapel-db-peak'].forEach((x) => h.add(x));
  if (has('jacket-front-db')) ['jacket-front-sb', ...SB_REVERS].forEach((x) => h.add(x));
  if (has('waistcoat-front-sb')) h.add('waistcoat-front-db');
  if (has('waistcoat-front-db')) h.add('waistcoat-front-sb');
  return h;
}

/** Beim Wählen in einer Gruppe die anderen Gruppen desselben Sets leeren. */
export function mitRegeln(a: Auswahl, gruppe: string): Auswahl {
  const set = EXKLUSIV.find((s) => s.includes(gruppe));
  if (!set) return a;
  const copy = { ...a };
  for (const g of set) if (g !== gruppe) delete copy[g];
  // Wechsel Einreiher ↔ Zweireiher: unpassendes Revers entfernen
  if (gruppe === 'jacket-front-sb') delete copy['jacket-lapel-db-peak'];
  if (gruppe === 'jacket-front-db') SB_REVERS.forEach((g) => delete copy[g]);
  return copy;
}
