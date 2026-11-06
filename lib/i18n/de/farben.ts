// Übersetzungen der Anzug-Farbseiten als Überlagerung von lib/suitColors.ts (Quelle = Deutsch).
// Deutsch bleibt leer; andere Sprachen tragen je Slug die übersetzten Felder ein.
// «sections» muss gleich viele Einträge in gleicher Reihenfolge haben wie in lib/suitColors.ts.
import type { SuitColor } from '@/lib/suitColors';

export type FarbText = Partial<Pick<SuitColor, 'name' | 'title' | 'claim' | 'metaDescription' | 'sections'>>;

export const farben: Record<string, FarbText> = {};
