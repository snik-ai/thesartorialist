// Telefon-Feld der Lead-Formulare: Schweizer Nummern beim Tippen gliedern («079 123 45 67»), beim Verlassen international
// schreiben («+41 79 123 45 67»). Akzeptiert 0…, 0041…, +41…, dazu +423 (FL), +49 (DE), +43 (AT) und andere Vorwahlen.
// Ohne Importe (Tests mit node --experimental-strip-types).

export interface Land { code: string; vorwahl: string; name: Record<"de" | "en" | "fr" | "it", string> }

/** Länder der Auswahl im Präfix (Reihenfolge = Anzeige). */
export const LAENDER: Land[] = [
  { code: "CH", vorwahl: "41", name: { de: "Schweiz", en: "Switzerland", fr: "Suisse", it: "Svizzera" } },
  { code: "LI", vorwahl: "423", name: { de: "Liechtenstein", en: "Liechtenstein", fr: "Liechtenstein", it: "Liechtenstein" } },
  { code: "DE", vorwahl: "49", name: { de: "Deutschland", en: "Germany", fr: "Allemagne", it: "Germania" } },
  { code: "AT", vorwahl: "43", name: { de: "Österreich", en: "Austria", fr: "Autriche", it: "Austria" } },
  { code: "FR", vorwahl: "33", name: { de: "Frankreich", en: "France", fr: "France", it: "Francia" } },
  { code: "IT", vorwahl: "39", name: { de: "Italien", en: "Italy", fr: "Italie", it: "Italia" } },
];

/** Gültige Länge der nationalen Nummer (ohne Vorwahl und ohne führende 0) je Land. */
const LAENGE: Record<string, [number, number]> = { "41": [9, 9], "423": [7, 9], "49": [6, 13], "43": [4, 13], "33": [9, 9], "39": [6, 11] };

/** Nur Ziffern und ein führendes «+»; «00» am Anfang wird zu «+». */
function roh(v: string): string {
  const t = v.trim();
  const plus = t.startsWith("+");
  const z = t.replace(/\D/g, "");
  if (!plus && z.startsWith("00")) return `+${z.slice(2)}`;
  return plus ? `+${z}` : z;
}

/** Vorwahl einer internationalen Nummer («+4179…» → «41»), längste bekannte zuerst; sonst 1–3 Ziffern. */
function vorwahlVon(ziffern: string): string {
  for (const l of [...LAENDER].sort((a, b) => b.vorwahl.length - a.vorwahl.length)) if (ziffern.startsWith(l.vorwahl)) return l.vorwahl;
  return ziffern.slice(0, ziffern.startsWith("1") || ziffern.startsWith("7") ? 1 : 2);
}

/** Land der Eingabe: «079…», «+41…», «0041…» → CH; «+49…» → DE; leer → null. */
export function telefonLand(v: string): Land | null {
  const r = roh(v);
  if (!r) return null;
  if (!r.startsWith("+")) return r.startsWith("0") ? LAENDER[0]! : null;
  const w = vorwahlVon(r.slice(1));
  return LAENDER.find((l) => l.vorwahl === w) ?? null;
}

/** Schweizer Teilnummer (bis 9 Ziffern, ohne 0) gliedern: 79 123 45 67 bzw. 44 668 18 00. */
function chGruppen(n: string): string {
  return [n.slice(0, 2), n.slice(2, 5), n.slice(5, 7), n.slice(7, 9)].filter(Boolean).join(" ") + (n.length > 9 ? ` ${n.slice(9)}` : "");
}

/**
 * Während des Tippens: Schweizer Nummern gliedern («0791234567» → «079 123 45 67», «+4179…» → «+41 79 123 …»).
 * Andere Länder: nur Vorwahl abtrennen, den Rest lassen, wie er getippt wurde. Unbekanntes bleibt unverändert.
 */
export function telefonLive(v: string): string {
  if (/[^\d\s+()./-]/.test(v)) return v;
  const r = roh(v);
  if (!r || r === "+") return v.trimStart();
  if (r.startsWith("+41")) return `+41${r.length > 3 ? ` ${chGruppen(r.slice(3).replace(/^0/, ""))}` : ""}`;
  if (r.startsWith("0") && !r.startsWith("00")) {
    const n = r.slice(1);
    return n ? `0${chGruppen(n)}` : "0";
  }
  return v;
}

/** Zum Speichern bzw. beim Verlassen des Felds: international («+41 79 123 45 67», «+49 30 1234567»). Unbekanntes bleibt. */
export function telefonFormatieren(v: string): string {
  const r = roh(v);
  if (!r) return "";
  if (r.startsWith("0") && r.length === 10) return `+41 ${chGruppen(r.slice(1))}`;
  if (!r.startsWith("+")) return v.trim();
  const ziffern = r.slice(1);
  const w = vorwahlVon(ziffern);
  const rest = ziffern.slice(w.length).replace(/^0/, ""); // «+41 (0)79 …» bzw. «+49 030 …»
  if (w === "41") return `+41 ${chGruppen(rest)}`;
  // Getippte Gliederung übernehmen (Ortsnetz bleibt erkennbar), nur Vorwahl, Klammern und doppelte Abstände bereinigen
  const getippt = v.trim().replace(/^(\+|00)\s*/, "").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  const ohneVorwahl = getippt.replace(new RegExp(`^${w}\\s*`), "").replace(/^0\s*/, "").trim();
  return `+${w} ${/^[\d ./-]+$/.test(ohneVorwahl) && ohneVorwahl.replace(/\D/g, "") === rest ? ohneVorwahl.replace(/[./-]/g, " ").replace(/\s+/g, " ") : rest}`;
}

/** Leer ist gültig (Feld optional). Sonst: Schweizer Nummer mit 10 Stellen bzw. international mit passender Länge. */
export function telefonGueltig(v: string): boolean {
  if (!v.trim()) return true;
  if (/[^\d\s+()./-]/.test(v)) return false;
  const r = roh(v);
  if (!r.startsWith("+")) return /^0[1-9]\d{8}$/.test(r);
  const ziffern = r.slice(1);
  const w = vorwahlVon(ziffern);
  const rest = ziffern.slice(w.length).replace(/^0/, "");
  const [min, max] = LAENGE[w] ?? [5, 13];
  return rest.length >= min && rest.length <= max && ziffern.length <= 15 && !/^0/.test(rest);
}

/** Vorwahl in einer Eingabe ersetzen (Wahl im Präfix): «079 123» + DE → «+49 79 123», leer + DE → «+49 ». */
export function telefonMitLand(v: string, land: Land): string {
  const r = roh(v);
  let national = "";
  if (r.startsWith("+")) { const z = r.slice(1); national = z.slice(vorwahlVon(z).length); }
  else national = r.replace(/^0/, "");
  const n = national.replace(/^0/, "");
  if (land.vorwahl === "41") return n ? `+41 ${chGruppen(n)}` : "+41 ";
  if (!n) return `+${land.vorwahl} `;
  // Getippte Gliederung behalten («079 123 45 67» → «+49 79 123 45 67»): Ziffern des Rests in der Eingabe von hinten suchen
  const getippt = v.trim().replace(/[()]/g, " ").replace(/\s+/g, " ");
  let rest = "";
  let gezaehlt = 0;
  for (let i = getippt.length - 1; i >= 0 && gezaehlt < n.length; i--) {
    const c = getippt[i]!;
    if (/\d/.test(c)) gezaehlt++;
    rest = c + rest;
  }
  return `+${land.vorwahl} ${rest.replace(/[./-]/g, " ").replace(/\s+/g, " ").trim()}`;
}
