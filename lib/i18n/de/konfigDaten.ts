// Übersetzungen der Konfigurator-Daten als Überlagerung von lib/konfigurator/daten.ts
// (Quelle = Deutsch, IDs unverändert). Deutsch bleibt leer; andere Sprachen tragen je ID
// die übersetzten Texte ein. Fehlende Einträge fallen auf Deutsch zurück.
export type KonfigUebersetzung = {
  /** Kategorie-ID → Texte (z. B. «jacket») */
  kategorien: Record<string, { title?: string; subtitle?: string; description?: string }>;
  /** Untergruppen-ID → Texte (z. B. «jacket-front-sb») */
  untergruppen: Record<string, { title?: string; subtitle?: string; note?: string }>;
  /** Options-ID → Texte (z. B. «jacket-sb-2b») */
  optionen: Record<
    string,
    { label?: string; subLabel?: string; description?: string; /** Taschen-Kombination (Brust/Seite) */ pocketSpec?: { chest: string; side: string } }
  >;
};

export const konfigDaten: KonfigUebersetzung = { kategorien: {}, untergruppen: {}, optionen: {} };
