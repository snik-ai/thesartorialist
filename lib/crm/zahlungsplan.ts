// Zahlungsplan eines Auftrags (rein, Browser + Server): «Ganz» = eine Rechnung über alles, «Teilzahlung» = Raten in Prozent
// oder CHF. Jede Rate wird eine eigene Rechnung (A4 mit QR-Zahlteil); die letzte ist die Schlussrechnung und zieht die
// bereits verrechneten Raten ab. Beträge auf 5 Rappen, die letzte Rate nimmt den Rest (Rundungsdifferenz).
import type { RechnungStatus, Zahlungsplan, ZahlungsplanRate } from '@/lib/db/schema';
import { chf as chfText } from './geld';

export const rund5 = (rp: number) => Math.round(rp / 5) * 5;
const zufallId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export const rate = (bezeichnung: string, wert: number, art: ZahlungsplanRate['art'] = 'prozent', anlass: string | null = null): ZahlungsplanRate => ({
  id: zufallId(),
  bezeichnung,
  art,
  wert,
  faelligAm: null,
  anlass,
  rechnungId: null,
});

export const PLAN_GANZ = (): Zahlungsplan => ({ modus: 'ganz', raten: [rate('Gesamtbetrag', 100, 'prozent', 'bei Abholung')] });

export type PlanVorlage = { key: string; label: string; plan: () => Zahlungsplan };
export function vorlagen(anzahlungProzent = 50): PlanVorlage[] {
  const p = Math.min(90, Math.max(10, Math.round(anzahlungProzent || 50)));
  return [
    { key: '50-50', label: '50 % bei Bestellung / 50 % bei Abholung', plan: () => ({ modus: 'teil', raten: [rate('Anzahlung', 50, 'prozent', 'bei Bestellung'), rate('Restzahlung', 50, 'prozent', 'bei Abholung')] }) },
    { key: '30-40-30', label: '30 / 40 / 30', plan: () => ({ modus: 'teil', raten: [rate('1. Rate', 30, 'prozent', 'bei Bestellung'), rate('2. Rate', 40, 'prozent', 'bei der Anprobe'), rate('Restzahlung', 30, 'prozent', 'bei Abholung')] }) },
    { key: 'anzahlung', label: `Anzahlung ${p} % + Rest`, plan: () => ({ modus: 'teil', raten: [rate(`Anzahlung ${p} %`, p, 'prozent', 'bei Bestellung'), rate('Restzahlung', 100 - p, 'prozent', 'bei Abholung')] }) },
  ];
}

/** Beträge je Rate (Rappen): Prozent vom Total auf 5 Rappen, die letzte Rate = Total − alle übrigen. */
export function ratenBetraege(plan: Zahlungsplan, totalRp: number): number[] {
  const n = plan.raten.length;
  const b = plan.raten.map((r) => (r.art === 'betrag' ? Math.round(r.wert) : rund5((totalRp * r.wert) / 100)));
  if (n) b[n - 1] = totalRp - b.slice(0, -1).reduce((s, x) => s + x, 0);
  return b;
}

/** Summenprüfung: Raten müssen zusammen 100 % bzw. das Total ergeben (Toleranz 5 Rappen Rundung). */
export function planPruefen(plan: Zahlungsplan, totalRp: number): { ok: boolean; fehler: string | null; summeRp: number; summeProzent: number; betraege: number[] } {
  const nominal = plan.raten.map((r) => (r.art === 'betrag' ? r.wert : (totalRp * r.wert) / 100));
  const summeRp = Math.round(nominal.reduce((s, x) => s + x, 0));
  const summeProzent = totalRp ? Math.round((summeRp / totalRp) * 1000) / 10 : 0;
  const betraege = ratenBetraege(plan, totalRp);
  let fehler: string | null = null;
  if (!plan.raten.length) fehler = 'Mindestens eine Rate erfassen.';
  else if (plan.raten.length > 6) fehler = 'Höchstens 6 Raten.';
  else if (plan.raten.some((r) => !(r.wert > 0))) fehler = 'Jede Rate braucht einen Betrag grösser als 0.';
  else if (Math.abs(summeRp - totalRp) > 5) fehler = summeRp < totalRp ? `Es fehlen noch ${chfText(totalRp - summeRp)} (${(100 - summeProzent).toFixed(1).replace('.0', '')} %).` : `Die Raten sind ${chfText(summeRp - totalRp)} zu hoch.`;
  else if (betraege.some((x) => x <= 0)) fehler = 'Die letzte Rate wäre 0 oder negativ.';
  return { ok: !fehler, fehler, summeRp, summeProzent, betraege };
}


export type RateStatus = 'geplant' | 'entwurf' | 'verschickt' | 'teilbezahlt' | 'bezahlt' | 'ueberfaellig';
export const RATE_STATUS: Record<RateStatus, string> = { geplant: 'Geplant', entwurf: 'Rechnung (Entwurf)', verschickt: 'Verschickt', teilbezahlt: 'Teilbezahlt', bezahlt: 'Bezahlt', ueberfaellig: 'Überfällig' };

export function rateStatus(r: { status: RechnungStatus; faelligAm: Date | string | null } | null | undefined, jetzt = new Date()): RateStatus {
  if (!r || r.status === 'storniert') return 'geplant';
  if (r.status === 'entwurf') return 'entwurf';
  if (r.status === 'bezahlt') return 'bezahlt';
  const f = r.faelligAm ? new Date(r.faelligAm) : null;
  if (f && f.getTime() < jetzt.getTime() - 86400_000) return 'ueberfaellig';
  return r.status === 'teilbezahlt' ? 'teilbezahlt' : 'verschickt';
}

/** Plan aus unsicherer Eingabe (API) */
export function planAus(v: unknown): Zahlungsplan | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const modus = o.modus === 'teil' ? 'teil' : o.modus === 'ganz' ? 'ganz' : null;
  if (!modus || !Array.isArray(o.raten) || o.raten.length < 1 || o.raten.length > 6) return null;
  const t = (w: unknown, max: number) => (typeof w === 'string' ? w.trim().slice(0, max) : '');
  const raten: ZahlungsplanRate[] = [];
  for (const x of o.raten) {
    if (!x || typeof x !== 'object') return null;
    const r = x as Record<string, unknown>;
    const art = r.art === 'betrag' ? 'betrag' : 'prozent';
    const wert = Number(r.wert);
    if (!Number.isFinite(wert) || wert <= 0 || (art === 'prozent' && wert > 100) || wert > 100_000_000) return null;
    const faellig = t(r.faelligAm, 10);
    if (faellig && !/^\d{4}-\d{2}-\d{2}$/.test(faellig)) return null;
    raten.push({
      id: t(r.id, 60) || zufallId(),
      bezeichnung: t(r.bezeichnung, 80) || `${raten.length + 1}. Rate`,
      art,
      wert: art === 'prozent' ? Math.round(wert * 100) / 100 : Math.round(wert),
      faelligAm: faellig || null,
      anlass: t(r.anlass, 80) || null,
      rechnungId: null,
    });
  }
  if (modus === 'ganz' && raten.length !== 1) return null;
  return { modus, raten };
}
