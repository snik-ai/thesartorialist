import type { TerminStatus } from '@/lib/db/schema';

export const STATUS_LABEL: Record<TerminStatus, string> = {
  angefragt: 'Neu',
  vorgeschlagen: 'Vorgeschlagen',
  bestaetigt: 'Bestätigt',
  abgesagt: 'Abgesagt',
  erledigt: 'Erledigt',
};

/** Reihenfolge der Kategorien aus dem Konfigurator (Rest danach alphabetisch). */
export const STIL_REIHENFOLGE = ['Sakko', 'Hose', 'Weste', 'Smoking'];

export function stilGruppen<T extends { kategorie: string }>(stil: T[]): { kategorie: string; zeilen: T[] }[] {
  const namen = [...new Set(stil.map((s) => s.kategorie))].sort((a, b) => {
    const ia = STIL_REIHENFOLGE.findIndex((x) => a.toLowerCase().startsWith(x.toLowerCase()));
    const ib = STIL_REIHENFOLGE.findIndex((x) => b.toLowerCase().startsWith(x.toLowerCase()));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b, 'de');
  });
  return namen.map((kategorie) => ({ kategorie, zeilen: stil.filter((s) => s.kategorie === kategorie) }));
}
