// Wochenplanung: gemeinsame Typen und reine Hilfsfunktionen (Browser und Server).
// Zeiten immer Europe/Zurich über lib/zeit.ts; wöchentliche Serien bleiben über die Zeitumstellung auf der gleichen Uhrzeit.
import { zuerich, zuerichTeile } from './zeit';
import type { TerminStatus } from './db/schema';

export type KalTyp = 'beratung' | 'massnehmen' | 'anprobe' | 'abholung' | 'telefon' | 'privat';

export const TYP_LABEL: Record<KalTyp, string> = {
  beratung: 'Beratung',
  massnehmen: 'Massnehmen',
  anprobe: 'Anprobe',
  abholung: 'Abholung',
  telefon: 'Telefontermin',
  privat: 'Privat',
};

export type KalKontakt = { id: string; name: string; telefon: string | null; email: string | null; whatsappOk: boolean; smsOk: boolean; abgemeldet: boolean; sprache: string };

export type KalItem = {
  /** eindeutig je Vorkommen (Serien: id@datum) */
  key: string;
  id: string;
  quelle: 'termin' | 'privat';
  typ: KalTyp;
  titel: string;
  start: string;
  ende: string;
  ganztaegig: boolean;
  status?: TerminStatus;
  /** angefragt / vorgeschlagen: gestrichelt, nicht verschiebbar */
  offen: boolean;
  erledigt: boolean;
  beweglich: boolean;
  notiz?: string | null;
  wiederholung?: 'woche' | null;
  /** Serie: Start/Ende des ersten Vorkommens (Verschieben verschiebt die ganze Serie) */
  basisStart?: string;
  basisEnde?: string;
  kontakt?: KalKontakt;
};

/** Belegte Zeit (für Slot-Picker und Kollisionen). titel nur im Backend. */
export type Bereich = { start: string; ende: string; art: 'termin' | 'privat'; titel?: string };

export const ZEIT_VON = 7;
export const ZEIT_BIS = 21;
export const WOCHE_MS = 7 * 86400_000;

export const plusTage = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Montag (YYYY-MM-DD) der Woche, in der `datum` liegt */
export function montagVon(datum: string) {
  const wt = (new Date(`${datum}T12:00:00Z`).getUTCDay() + 6) % 7;
  return plusTage(datum, -wt);
}

/** ISO-Kalenderwoche */
export function kalenderwoche(datum: string) {
  const d = new Date(`${datum}T12:00:00Z`);
  const wt = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - wt + 3);
  const erster = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - erster.getTime()) / 86400_000 - 3 + ((erster.getUTCDay() + 6) % 7)) / 7);
}

export const ueberlappt = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

/** Vorkommen eines (ggf. wöchentlichen) Eintrags im Bereich [von, bis) */
export function vorkommen(e: { start: Date; ende: Date; wiederholung: string | null }, von: Date, bis: Date): { start: Date; ende: Date }[] {
  const dauer = e.ende.getTime() - e.start.getTime();
  if (e.wiederholung !== 'woche') return ueberlappt(e.start.getTime(), e.ende.getTime(), von.getTime(), bis.getTime()) ? [{ start: e.start, ende: e.ende }] : [];
  const z = zuerichTeile(e.start);
  const out: { start: Date; ende: Date }[] = [];
  let k = Math.max(0, Math.floor((von.getTime() - e.start.getTime() - dauer) / WOCHE_MS) - 1);
  for (let i = 0; i < 400; i++, k++) {
    const s = zuerich(plusTage(z.datum, k * 7), z.zeit)!;
    if (s.getTime() >= bis.getTime()) break;
    const en = new Date(s.getTime() + dauer);
    if (en.getTime() > von.getTime()) out.push({ start: s, ende: en });
  }
  return out;
}

/** Minuten seit Mitternacht (Zürich) */
export const minutenVon = (d: Date) => {
  const z = zuerichTeile(d).zeit.split(':').map(Number);
  return z[0] * 60 + z[1];
};
export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** «1 Std. 30» / «45 Min.» */
export function dauerText(min: number) {
  if (min < 60) return `${min} Min.`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} Std. ${m}` : `${h} Std.`;
}
