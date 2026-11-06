// Kleine Konstanten ohne Katalogdaten (damit der schwebende Knopf schlank bleibt).
export const STORAGE_KEY = 'ts_konfigurator_v1';
export const CHANGE_EVENT = 'ts-konfigurator-change';
/** Stoffnummern (Holland & Sherry), vom Kunden notiert */
export const STOFF_KEY = 'ts_stoffe_v1';
export const STOFF_LINK = 'https://apparel.hollandandsherry.com/en/fabric';
/** Untergruppe → gewählte Option-IDs */
export type Auswahl = Record<string, string[]>;
