// Platzhalter in Wörterbuch-Texten ersetzen: fmt('Danke, {name}.', { name: 'Anna' }).
// Bewusst ohne Funktionen im Wörterbuch, damit Texte auch an Client-Komponenten gehen können.
export function fmt(text: string, werte: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in werte ? String(werte[k]) : m));
}

/** Einzahl/Mehrzahl: mz(n, '{n} Detail', '{n} Details') */
export const mz = (n: number, eins: string, mehr: string) => fmt(n === 1 ? eins : mehr, { n });
