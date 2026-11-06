// Konfigurator-Katalog in eine andere Sprache bringen: deutsche Struktur (Bilder, Codes, IDs)
// bleibt, Texte kommen aus der Überlagerung (lib/i18n/<sprache>/konfigDaten.ts).
// Ohne Datenimport, damit es auch im Browser genutzt werden kann.
import type { KonfigKategorie } from './daten';
import type { KonfigUebersetzung } from '@/lib/i18n/de/konfigDaten';

export function uebersetzeKatalog(kats: KonfigKategorie[], u?: KonfigUebersetzung | null): KonfigKategorie[] {
  if (!u) return kats;
  const leer = (o: object) => Object.keys(o).length === 0;
  if (leer(u.kategorien) && leer(u.untergruppen) && leer(u.optionen)) return kats;
  return kats.map((k) => ({
    ...k,
    ...u.kategorien[k.id],
    subCategories: k.subCategories.map((g) => ({
      ...g,
      ...u.untergruppen[g.id],
      options: g.options.map((o) => ({ ...o, ...u.optionen[o.id] })),
    })),
  }));
}
