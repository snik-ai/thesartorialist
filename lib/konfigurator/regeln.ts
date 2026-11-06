// Abhängigkeiten zwischen Untergruppen: Was sich gegenseitig ausschliesst
// (Einreiher ↔ Zweireiher, nur eine Revers-Art).
import type { Auswahl } from './konst';

/** Gruppen, von denen nur eine eine Auswahl haben darf. */
export const EXKLUSIV: string[][] = [
  ['jacket-front-sb', 'jacket-front-db'],
  ['jacket-lapel-notch', 'jacket-lapel-peak', 'jacket-lapel-shawl', 'jacket-lapel-db-peak'],
  ['waistcoat-front-sb', 'waistcoat-front-db'],
];

const SB_REVERS = ['jacket-lapel-notch', 'jacket-lapel-peak', 'jacket-lapel-shawl'];

/** Beim Wählen in einer Gruppe die anderen Gruppen desselben Sets leeren. */
export function mitRegeln(a: Auswahl, gruppe: string): Auswahl {
  const set = EXKLUSIV.find((s) => s.includes(gruppe));
  if (!set) return a;
  const copy = { ...a };
  for (const g of set) if (g !== gruppe) delete copy[g];
  // Wechsel Einreiher ↔ Zweireiher: unpassendes Revers entfernen
  if (gruppe === 'jacket-front-sb') delete copy['jacket-lapel-db-peak'];
  if (gruppe === 'jacket-front-db') SB_REVERS.forEach((g) => delete copy[g]);
  // Revers bestimmt die Knopfung: Einreiher-Revers ↔ Zweireiher-Vorderteil schliessen sich aus
  if (SB_REVERS.includes(gruppe)) delete copy['jacket-front-db'];
  if (gruppe === 'jacket-lapel-db-peak') delete copy['jacket-front-sb'];
  return copy;
}
