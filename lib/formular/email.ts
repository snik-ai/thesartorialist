// E-Mail-Feld der Lead-Formulare: Eingabe bereinigen, prüfen und Tippfehler in häufigen Domains erkennen
// («anna@gmial.com» → «Meinten Sie anna@gmail.com?»). Ohne Importe (Tests mit node --experimental-strip-types).

/** Leerzeichen (auch aus Autovervollständigung oder Kopieren) und unsichtbare Zeichen entfernen. */
export const emailBereinigen = (v: string) => v.replace(/[\s​-‍﻿]+/g, "");

/** Pragmatische Prüfung: genau ein @, Teil davor, Domain mit Punkt und Endung ab 2 Buchstaben. */
export function emailGueltig(v: string): boolean {
  const e = emailBereinigen(v);
  if (e.length > 160) return false;
  return /^[^\s@]+@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i.test(e) && !/\.\.|^\.|\.@/.test(e);
}

/** Häufige Postfach-Domains in der Schweiz, Deutschland, Österreich, Frankreich und Italien. */
const BEKANNT = [
  "gmail.com", "bluewin.ch", "hotmail.com", "outlook.com", "icloud.com", "gmx.ch", "gmx.net", "gmx.de", "gmx.at", "yahoo.com",
  "hispeed.ch", "sunrise.ch", "swissonline.ch", "protonmail.com", "proton.me", "web.de", "t-online.de", "hotmail.ch", "live.com",
  "outlook.de", "yahoo.de", "yahoo.fr", "orange.fr", "libero.it", "bluemail.ch", "quickline.ch", "googlemail.com",
];

/** Endungen, die fast immer vertippt sind (bei Firmen-Domains wird nur die Endung ersetzt). */
const ENDUNG: Record<string, string> = { con: "com", cm: "com", cpm: "com", cim: "com", comm: "com", ocm: "com", vom: "com", xom: "com", cmo: "com", om: "com", chh: "ch", hc: "ch", cj: "ch" };

/** Optimal-String-Alignment-Distanz (Levenshtein plus Vertauschen zweier Nachbarn = 1). */
function distanz(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const k = a[i - 1] === b[j - 1] ? 0 : 1;
      let w = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + k);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) w = Math.min(w, d[i - 2]![j - 2]! + 1);
      d[i]![j] = w;
    }
  }
  return d[a.length]![b.length]!;
}

/**
 * Vorschlag für eine vermutlich vertippte Adresse oder null. Nur die Domain wird korrigiert, der Teil vor dem @ bleibt.
 * Beispiele: gmial.com, gmal.com, gmail.con, bluwin.ch, hotmial.com, outlok.com, gmx.cm, firma.con.
 */
export function emailVorschlag(v: string): string | null {
  const e = emailBereinigen(v).toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1 || at !== e.indexOf("@")) return null;
  const lokal = e.slice(0, at);
  const domain = e.slice(at + 1);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) || BEKANNT.includes(domain)) return null;
  const punkt = domain.lastIndexOf(".");
  const stamm = domain.slice(0, punkt);
  const endung = domain.slice(punkt + 1);
  // 1) Bekannter Anbieter mit leicht vertippter Domain (gmial.com, bluwin.ch, gmail.cm, hotmail.co)
  let bester: string | null = null;
  let bestWert = 3;
  for (const b of BEKANNT) {
    // Kurze Domains (gmx.ch, web.de) nie per Ähnlichkeit: zu viele echte Firmen-Domains liegen einen Buchstaben daneben
    const grenze = b.length >= 12 ? 2 : b.length >= 8 ? 1 : 0;
    const w = distanz(domain, b);
    if (w <= grenze && w < bestWert) { bester = b; bestWert = w; }
  }
  // Nur den Stamm vergleichen, wenn die Endung offensichtlich falsch ist (gmial.con → gmail.com)
  if (!bester && ENDUNG[endung]) {
    const neu = `${stamm}.${ENDUNG[endung]}`;
    for (const b of BEKANNT) if (distanz(neu, b) <= 1) { bester = b; break; }
    bester ??= neu;
  }
  return bester && bester !== domain ? `${lokal}@${bester}` : null;
}
