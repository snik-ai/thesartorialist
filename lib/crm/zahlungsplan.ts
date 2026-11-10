// Zahlungsplan eines Auftrags (rein, Browser + Server): «Ganz» = eine Rechnung über alles, «Teilzahlung» = Raten in Prozent
// oder CHF. Jede Rate wird eine eigene Rechnung (A4 mit QR-Zahlteil); die letzte ist die Schlussrechnung und zieht die
// bereits verrechneten Raten ab. Beträge auf 5 Rappen, die letzte Rate nimmt den Rest (Rundungsdifferenz).
import type { BelegSprache, RechnungStatus, Zahlungsplan, ZahlungsplanRate } from '@/lib/db/schema';
import { DOK, fuell } from '@/lib/beleg/texte';
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

/* ---------- Standard-Zahlungsplan (Einstellungen), Angebot und Anpassungen nach Teilverrechnung ---------- */

/** Schlüssel des Standard-Zahlungsplans in den Firmeneinstellungen («offen» = im Angebot nicht festlegen, beim Auftrag fragen) */
export type PlanStandard = 'ganz' | '50-50' | '30-40-30' | 'anzahlung' | 'offen';
export const PLAN_STANDARDS: PlanStandard[] = ['anzahlung', '50-50', '30-40-30', 'ganz', 'offen'];
export const planStandardAus = (v: unknown): PlanStandard => (PLAN_STANDARDS.includes(v as PlanStandard) ? (v as PlanStandard) : 'anzahlung');

/** Wahlmöglichkeiten (Angebot, Annahme-Dialog, Einstellungen): Ganz + Vorlagen + «offen» */
export function planWahl(anzahlungProzent = 50): { key: PlanStandard; label: string; kurz: string; plan: () => Zahlungsplan | null }[] {
  const v = vorlagen(anzahlungProzent);
  const p = Math.min(90, Math.max(10, Math.round(anzahlungProzent || 50)));
  return [
    { key: 'ganz', label: 'Ganz – eine Rechnung über alles', kurz: 'Ganz', plan: PLAN_GANZ },
    { key: 'anzahlung', label: `Anzahlung ${p} % bei Bestellung, Rest bei Abholung`, kurz: `${p} % + Rest`, plan: v[2].plan },
    { key: '50-50', label: v[0].label, kurz: '50 / 50', plan: v[0].plan },
    { key: '30-40-30', label: '30 % Bestellung / 40 % Anprobe / 30 % Abholung', kurz: '30 / 40 / 30', plan: v[1].plan },
    { key: 'offen', label: 'Noch offen – beim Auftrag festlegen', kurz: 'Offen', plan: () => null },
  ];
}
export const planAusVorlage = (key: PlanStandard, anzahlungProzent = 50): Zahlungsplan | null => planWahl(anzahlungProzent).find((w) => w.key === key)?.plan() ?? null;

/** Welche Vorlage entspricht einem Plan (für die Chips)? null = freier Plan */
export function planVorlageVon(plan: Zahlungsplan | null, anzahlungProzent = 50): PlanStandard | null {
  if (!plan) return 'offen';
  const sig = (x: Zahlungsplan) => `${x.modus}:${x.raten.map((r) => `${r.art}${r.wert}`).join('/')}`;
  const s = sig(plan);
  return (
    planWahl(anzahlungProzent).find((w) => {
      const p = w.plan();
      return p && sig(p) === s;
    })?.key ?? null
  );
}

/** Rate in zwei Hälften teilen (z. B. 40 % Anprobe → 20 % + 20 %). Nur für noch nicht verschickte Raten. */
export function rateTeilen(plan: Zahlungsplan, rateId: string): Zahlungsplan {
  if (plan.raten.length >= 6) return plan;
  const i = plan.raten.findIndex((r) => r.id === rateId);
  if (i < 0) return plan;
  const r = plan.raten[i];
  const a = r.art === 'prozent' ? Math.round((r.wert / 2) * 100) / 100 : rund5(r.wert / 2);
  const b = r.art === 'prozent' ? Math.round((r.wert - a) * 100) / 100 : r.wert - a;
  if (!(a > 0) || !(b > 0)) return plan;
  const name = r.bezeichnung.replace(/\s*\(\d\/2\)$/, '');
  const erste: ZahlungsplanRate = { ...r, bezeichnung: `${name} (1/2)`, wert: a, rechnungId: null };
  const zweite: ZahlungsplanRate = rate(`${name} (2/2)`, b, r.art, r.anlass);
  return { modus: 'teil', raten: [...plan.raten.slice(0, i), erste, zweite, ...plan.raten.slice(i + 1)] };
}

/**
 * Rest neu verteilen: Gesperrte (verschickte) Raten bleiben, der Rest des Totals wird im bisherigen Verhältnis auf die
 * offenen Raten verteilt – als feste CHF-Beträge auf 5 Rappen, die letzte nimmt die Rundungsdifferenz.
 * `fest` = tatsächliche Rechnungsbeträge gesperrter Raten, falls sie vom Plan abweichen.
 */
export function restVerteilen(plan: Zahlungsplan, totalRp: number, gesperrt: Set<string>, fest: Record<string, number> = {}): Zahlungsplan {
  const betraege = ratenBetraege(plan, totalRp);
  const offenIdx = plan.raten.map((r, i) => (gesperrt.has(r.id) ? -1 : i)).filter((i) => i >= 0);
  if (!offenIdx.length) return plan;
  const gesperrtSumme = plan.raten.reduce((s, r, i) => (gesperrt.has(r.id) ? s + (fest[r.id] ?? betraege[i]) : s), 0);
  const rest = Math.max(0, totalRp - gesperrtSumme);
  const basis = offenIdx.map((i) => Math.max(0, plan.raten[i].art === 'betrag' ? plan.raten[i].wert : (totalRp * plan.raten[i].wert) / 100));
  const summe = basis.reduce((s, x) => s + x, 0);
  const neu = offenIdx.map((_, k) => rund5(summe > 0 ? (rest * basis[k]) / summe : rest / offenIdx.length));
  neu[neu.length - 1] = rest - neu.slice(0, -1).reduce((s, x) => s + x, 0);
  const raten = plan.raten.map((r, i) => {
    const k = offenIdx.indexOf(i);
    if (k < 0) return fest[r.id] !== undefined ? { ...r, art: 'betrag' as const, wert: fest[r.id] } : r;
    return { ...r, art: 'betrag' as const, wert: Math.max(0, neu[k]) };
  });
  return { ...plan, raten };
}

/* ---------- Zahlungsbedingungen im Angebot (PDF, Kundenseite, Editor) ---------- */

const UEBERSETZUNG: Record<Exclude<BelegSprache, 'de'>, Record<string, string>> = {
  en: { Gesamtbetrag: 'Total amount', Anzahlung: 'Deposit', Restzahlung: 'Balance', Rate: 'Instalment', 'bei Bestellung': 'on order', 'bei der Anprobe': 'at the fitting', 'bei Abholung': 'on collection' },
  fr: { Gesamtbetrag: 'Montant total', Anzahlung: 'Acompte', Restzahlung: 'Solde', Rate: 'Versement', 'bei Bestellung': 'à la commande', 'bei der Anprobe': "à l'essayage", 'bei Abholung': 'au retrait' },
  it: { Gesamtbetrag: 'Importo totale', Anzahlung: 'Acconto', Restzahlung: 'Saldo', Rate: 'Rata', 'bei Bestellung': "all'ordine", 'bei der Anprobe': 'alla prova', 'bei Abholung': 'al ritiro' },
};
/** Bekannte Vorlagen-Texte übersetzen, eigene Texte bleiben wie erfasst */
function planWort(t: string, s: BelegSprache): string {
  if (s === 'de') return t;
  const u = UEBERSETZUNG[s];
  if (u[t]) return u[t];
  const teil = /^(.*) \((\d)\/2\)$/.exec(t);
  if (teil) return `${planWort(teil[1], s)} (${teil[2]}/2)`;
  const nr = /^(\d+)\. Rate$/.exec(t);
  if (nr) return `${u.Rate} ${nr[1]}`;
  const anz = /^Anzahlung (\d+(?:[.,]\d+)?) %$/.exec(t);
  if (anz) return `${u.Anzahlung} ${anz[1]} %`;
  return t;
}

/** Zahlungsbedingungen als Text (eine Zeile je Rate) für Angebot, PDF und Annahmeseite */
export function planBedingung(plan: Zahlungsplan | null, totalRp: number, sprache: BelegSprache, fristTage: number): string {
  const T = DOK[sprache];
  const frist = fuell(T.planFrist, { frist: fristTage });
  if (!plan) return frist;
  if (plan.modus === 'ganz' || plan.raten.length === 1) return `${T.planGanz} ${frist}`;
  const b = ratenBetraege(plan, totalRp);
  const zeilen = plan.raten.map((r, i) => {
    const name = planWort(r.bezeichnung, sprache);
    const prozent = r.art === 'prozent' && !/%/.test(name) ? ` ${String(r.wert).replace('.', sprache === 'en' ? '.' : ',')} %` : '';
    const datum = r.faelligAm ? r.faelligAm.split('-').reverse().join('.') : '';
    const wann = [r.anlass ? planWort(r.anlass, sprache) : '', datum].filter(Boolean).join(', ');
    // «1. Rate» trägt die Nummer schon im Namen
    return `${/^\d/.test(name) || /^\D+ \d+$/.test(name) ? '' : `${i + 1}. `}${name}${prozent}: ${chfText(b[i])}${wann ? ` – ${wann}` : ''}`;
  });
  return [fuell(T.planEinleitung, { n: plan.raten.length }), ...zeilen, `${T.planLetzte} ${frist}`].join('\n');
}
