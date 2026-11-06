// Rechenregeln für Angebote, Aufträge und Rechnungen (rein, ohne Datenbank — gleich im Browser und auf dem Server).
// Preise verstehen sich inklusive MWST (Endkundenpreise des Ateliers); die MWST wird herausgerechnet und ausgewiesen.
// Rundung auf 5 Rappen (Schweizer Barzahlung/QR-Rechnung üblich).
import type { Position } from '@/lib/db/schema';

export const rund5 = (rp: number) => Math.round(rp / 5) * 5;

export const positionBetrag = (p: Pick<Position, 'menge' | 'einzelpreisRp' | 'rabattProzent'>) =>
  Math.round((Number(p.menge) || 0) * (Number(p.einzelpreisRp) || 0) * (1 - (Number(p.rabattProzent) || 0) / 100));

export type Summen = {
  zwischenRp: number;
  rabattRp: number;
  totalRp: number;
  /** darin enthaltene MWST */
  mwstRp: number;
  nettoRp: number;
  mwstSatz: number;
};

/** Total inkl. MWST: Zwischentotal − Rabatt (Prozent oder Betrag), auf 5 Rappen; MWST = Total × Satz / (100 + Satz). */
export function summen(pos: Position[], o: { rabattProzent?: number; rabattRp?: number; mwstSatz: number }): Summen {
  const zwischenRp = pos.reduce((s, p) => s + positionBetrag(p), 0);
  const rabattRp = Math.min(zwischenRp, Math.max(0, Math.round(o.rabattRp || 0) + Math.round((zwischenRp * (o.rabattProzent || 0)) / 100)));
  const totalRp = rund5(zwischenRp - rabattRp);
  const mwstRp = o.mwstSatz > 0 ? Math.round((totalRp * o.mwstSatz) / (100 + o.mwstSatz)) : 0;
  return { zwischenRp, rabattRp, totalRp, mwstRp, nettoRp: totalRp - mwstRp, mwstSatz: o.mwstSatz };
}

/** «2’190.00» bzw. mit Währung «CHF 2’190.00» (Schweizer Schreibweise, Apostroph als Tausendertrenner) */
export function chf(rp: number, mitWaehrung = true) {
  const neg = rp < 0;
  const a = Math.abs(Math.round(rp));
  const fr = Math.floor(a / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  const s = `${neg ? '−' : ''}${fr}.${String(a % 100).padStart(2, '0')}`;
  return mitWaehrung ? `CHF ${s}` : s;
}

/** Kurz ohne Rappen bei runden Beträgen: «CHF 2’190», sonst wie chf() */
export function chfKurz(rp: number) {
  return rp % 100 === 0 ? chf(rp).replace(/\.00$/, '') : chf(rp);
}

/** «1’690.50», «1690,5», «1'690» → Rappen; ungültig → null */
export function rpAusText(t: string): number | null {
  const s = t.replace(/[’'\s]/g, '').replace(/^CHF/i, '').replace(',', '.').trim();
  if (!s) return 0;
  if (!/^-?\d+(\.\d{0,2})?$/.test(s)) return null;
  return Math.round(parseFloat(s) * 100);
}

/** Rappen → Eingabetext «1690.50» bzw. «1690» */
export const rpZuText = (rp: number) => (rp % 100 === 0 ? String(rp / 100) : (rp / 100).toFixed(2));

export const neueId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

/** Positionen aus unsicherer Eingabe (API) bereinigen. */
export function positionenAus(v: unknown): Position[] | null {
  if (!Array.isArray(v) || v.length > 60) return null;
  const out: Position[] = [];
  for (const x of v) {
    if (!x || typeof x !== 'object') return null;
    const o = x as Record<string, unknown>;
    const t = (w: unknown, max: number) => (typeof w === 'string' ? w.trim().slice(0, max) : '');
    const menge = Number(o.menge);
    const preis = Number(o.einzelpreisRp);
    const rabatt = Number(o.rabattProzent ?? 0);
    if (!Number.isFinite(menge) || menge <= 0 || menge > 999) return null;
    if (!Number.isFinite(preis) || Math.abs(preis) > 100_000_000) return null;
    if (!Number.isFinite(rabatt) || rabatt < 0 || rabatt > 100) return null;
    const bezeichnung = t(o.bezeichnung, 160);
    if (!bezeichnung) return null;
    out.push({
      id: t(o.id, 60) || neueId(),
      kategorie: t(o.kategorie, 40) || 'sonstiges',
      bezeichnung,
      beschreibung: t(o.beschreibung, 2000) || undefined,
      stoffnummer: t(o.stoffnummer, 40).toUpperCase() || undefined,
      menge: Math.round(menge * 100) / 100,
      einzelpreisRp: Math.round(preis),
      rabattProzent: Math.round(rabatt * 100) / 100 || undefined,
    });
  }
  return out;
}
