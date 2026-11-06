// Einfache Drosselung im Speicher (eine Instanz): gleitendes Fenster pro Schlüssel.
const eimer = new Map<string, number[]>();
let aufgeraeumt = Date.now();

/** true = zu viele Treffer im Fenster (Anfrage ablehnen). */
export function gedrosselt(bereich: string, schluessel: string, limit: number, fensterMs: number): boolean {
  const jetzt = Date.now();
  if (jetzt - aufgeraeumt > 10 * 60_000) {
    for (const [k, v] of eimer) if (!v.length || jetzt - v[v.length - 1] > 60 * 60_000) eimer.delete(k);
    aufgeraeumt = jetzt;
  }
  const k = `${bereich}:${schluessel}`;
  const liste = (eimer.get(k) ?? []).filter((t) => jetzt - t < fensterMs);
  liste.push(jetzt);
  eimer.set(k, liste);
  return liste.length > limit;
}
