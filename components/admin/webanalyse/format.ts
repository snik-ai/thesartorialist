// Formatierung der Webseitenanalyse (Server und Browser). Zahlen in Inter mit tabular-nums, nie Mono.
export const zahl = (n: number) => n.toLocaleString('de-CH');
export const quote = (q: number | null | undefined, stellen = 1) => (q === null || q === undefined ? '–' : `${(q * 100).toFixed(stellen)} %`);
export function dauer(s: number | null | undefined) {
  if (s === null || s === undefined) return '–';
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')} Min.`;
}
/** Veränderung in Prozent, null ohne Vergleichsbasis */
export const veraenderung = (jetzt: number | null | undefined, vorher: number | null | undefined) =>
  jetzt === null || jetzt === undefined || vorher === null || vorher === undefined || vorher === 0 ? null : ((jetzt - vorher) / Math.abs(vorher)) * 100;

const MONATE = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
/** «2026-11-10» → «10. Nov. 2026» */
export function tagKurz(iso: string, jahr = true) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${d.getUTCDate()}. ${MONATE[d.getUTCMonth()]}${jahr ? ` ${d.getUTCFullYear()}` : ''}`;
}
export function bereichText(von: string, bis: string) {
  if (von === bis) return tagKurz(von);
  const gleichesJahr = von.slice(0, 4) === bis.slice(0, 4);
  return `${tagKurz(von, !gleichesJahr)} – ${tagKurz(bis)}`;
}
/** Achsen-/Tooltip-Text eines Eimers (Tag «2026-11-10» oder Stunde «2026-11-10T14») */
export function eimerText(k: string, lang = false) {
  if (k.includes('T')) return `${k.slice(11, 13)}:00${lang ? ` – ${k.slice(11, 13)}:59 Uhr` : ''}`;
  const d = new Date(`${k}T12:00:00Z`);
  return lang
    ? d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : `${WT[d.getUTCDay()]} ${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;
}
