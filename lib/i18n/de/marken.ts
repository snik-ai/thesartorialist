// Übersetzungen der Brand-Seiten als Überlagerung von lib/brands.ts (Quelle = Deutsch).
// Deutsch bleibt leer; andere Sprachen tragen je Slug die übersetzten Felder ein.
// «sections» muss gleich viele Einträge in gleicher Reihenfolge haben wie in lib/brands.ts.
import type { Brand } from '@/lib/brands';

export type MarkenText = Partial<Pick<Brand, 'claim' | 'metaDescription' | 'origin' | 'sections'>>;

export const marken: Record<string, MarkenText> = {};
