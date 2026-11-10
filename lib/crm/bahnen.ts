// Kontaktarten der Webseitenanalyse mit festen Farben (gemeinsam für Server-Seite und Client-Charts).
// Eine Kontaktart hat überall dieselbe Farbe: im Verlauf, im Fluss, in der Bilanz und im Wochenraster.
export type KontaktKey = 'tel' | 'termin' | 'konfig' | 'rueckruf' | 'ratgeber' | 'mail' | 'wa';

export const KONTAKTARTEN: { key: KontaktKey; label: string; einzahl: string; kurz: string; farbe: string; quelle: 'tracking' | 'backend' }[] = [
  { key: 'tel', label: 'Anrufe', einzahl: 'Anruf', kurz: 'Anrufe', farbe: '#101010', quelle: 'tracking' },
  { key: 'termin', label: 'Terminanfragen', einzahl: 'Terminanfrage', kurz: 'Termine', farbe: '#b08d57', quelle: 'backend' },
  { key: 'konfig', label: 'Konfigurator', einzahl: 'Konfigurator-Anfrage', kurz: 'Konfig.', farbe: '#6d5a8c', quelle: 'backend' },
  { key: 'rueckruf', label: 'Rückrufe', einzahl: 'Rückruf', kurz: 'Rückrufe', farbe: '#8a5a44', quelle: 'backend' },
  { key: 'ratgeber', label: 'Ratgeber', einzahl: 'Ratgeber-Download', kurz: 'Ratgeber', farbe: '#c0703f', quelle: 'backend' },
  { key: 'mail', label: 'E-Mail', einzahl: 'E-Mail', kurz: 'E-Mail', farbe: '#3b5b8c', quelle: 'tracking' },
  { key: 'wa', label: 'WhatsApp', einzahl: 'WhatsApp', kurz: 'WhatsApp', farbe: '#1f8a5a', quelle: 'tracking' },
];

/** Alter Name (Bahnen im Verlauf) */
export const BAHNEN = KONTAKTARTEN;

/** Farben der Besuche (Marke: Gold für die Fläche, Tinte für die Linie) */
export const BESUCH_FARBE = '#b08d57';
export const LINIE_FARBE = '#101010';
export const VORPERIODE_FARBE = '#a9a49a';
