// Rechenregeln für Angebote, Aufträge und Rechnungen (rein, ohne Datenbank — gleich im Browser und auf dem Server).
// Preise verstehen sich inklusive MWST (Endkundenpreise des Ateliers); die MWST wird herausgerechnet und ausgewiesen.
// Rundung auf 5 Rappen (Schweizer Barzahlung/QR-Rechnung üblich).
import type { Position } from '@/lib/db/schema';

export const rund5 = (rp: number) => Math.round(rp / 5) * 5;

/** Zählt die Zeile im Total? Zwischentitel und Textblöcke nicht (ohne `art` = Position aus Phase 2). */
export const istPosition = (p: Pick<Position, 'art'>) => !p.art || p.art === 'position';

export const positionBetrag = (p: Pick<Position, 'menge' | 'einzelpreisRp' | 'rabattProzent'> & { art?: Position['art'] }) =>
  istPosition(p) ? Math.round((Number(p.menge) || 0) * (Number(p.einzelpreisRp) || 0) * (1 - (Number(p.rabattProzent) || 0) / 100)) : 0;

export type MwstZeile = { satz: number; /** Bruttobetrag zu diesem Satz (nach Rabatt und Rundung) */ basisRp: number; betragRp: number };

export type Summen = {
  zwischenRp: number;
  rabattRp: number;
  /** Rundung auf 5 Rappen (positiv oder negativ) */
  rundungRp: number;
  totalRp: number;
  /** darin enthaltene MWST (Summe aller Sätze) */
  mwstRp: number;
  /** MWST je Satz (ein Eintrag bei einheitlichem Satz) */
  mwst: MwstZeile[];
  nettoRp: number;
  mwstSatz: number;
};

/**
 * Total inkl. MWST: Zwischentotal − Rabatt (Prozent oder Betrag), auf 5 Rappen gerundet.
 * MWST je Satz (Position, sonst Beleg): Total anteilig nach Bruttobetrag verteilt, MWST = Basis × Satz / (100 + Satz).
 * Beleg-Satz 0 = nicht MWST-pflichtig (keine MWST, auch nicht bei Positionen mit eigenem Satz).
 */
export function summen(pos: Position[], o: { rabattProzent?: number; rabattRp?: number; mwstSatz: number }): Summen {
  const zeilen = pos.filter(istPosition);
  const zwischenRp = zeilen.reduce((s, p) => s + positionBetrag(p), 0);
  const rabattRp = Math.min(Math.max(zwischenRp, 0), Math.max(0, Math.round(o.rabattRp || 0) + Math.round((zwischenRp * (o.rabattProzent || 0)) / 100)));
  const roh = zwischenRp - rabattRp;
  const totalRp = rund5(roh);
  const mwst: MwstZeile[] = [];
  if (o.mwstSatz > 0 && zwischenRp !== 0) {
    const gruppen = new Map<number, number>();
    for (const p of zeilen) {
      const satz = p.mwstSatz === undefined || p.mwstSatz === null || !Number.isFinite(Number(p.mwstSatz)) ? o.mwstSatz : Number(p.mwstSatz);
      gruppen.set(satz, (gruppen.get(satz) ?? 0) + positionBetrag(p));
    }
    const saetze = [...gruppen.entries()].filter(([, b]) => b !== 0).sort((a, b) => b[0] - a[0]);
    let rest = totalRp;
    saetze.forEach(([satz, brutto], i) => {
      const basisRp = i === saetze.length - 1 ? rest : Math.round((totalRp * brutto) / zwischenRp);
      rest -= basisRp;
      mwst.push({ satz, basisRp, betragRp: satz > 0 ? Math.round((basisRp * satz) / (100 + satz)) : 0 });
    });
  }
  const mwstRp = mwst.reduce((s, m) => s + m.betragRp, 0);
  return { zwischenRp, rabattRp, rundungRp: totalRp - roh, totalRp, mwstRp, mwst, nettoRp: totalRp - mwstRp, mwstSatz: o.mwstSatz };
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

/** Positionen aus unsicherer Eingabe (API) bereinigen: Positionen, Zwischentitel und Textblöcke. */
export function positionenAus(v: unknown, standardSatz = 8.1): Position[] | null {
  if (!Array.isArray(v) || v.length > 120) return null;
  const out: Position[] = [];
  for (const x of v) {
    if (!x || typeof x !== 'object') return null;
    const o = x as Record<string, unknown>;
    const t = (w: unknown, max: number) => (typeof w === 'string' ? w.trim().slice(0, max) : '');
    const art = o.art === 'titel' || o.art === 'text' ? o.art : 'position';
    const bezeichnung = t(o.bezeichnung ?? o.text, 300);
    const beschreibung = t(o.beschreibung, 4000) || undefined;
    if (art !== 'position') {
      if (!bezeichnung && !beschreibung) return null;
      out.push({ id: t(o.id, 60) || neueId(), art, kategorie: 'sonstiges', bezeichnung, beschreibung, menge: 0, einzelpreisRp: 0 });
      continue;
    }
    const menge = Number(o.menge);
    const preis = Number(o.einzelpreisRp);
    const rabatt = Number(o.rabattProzent ?? 0);
    const satz = o.mwstSatz === undefined || o.mwstSatz === null ? standardSatz : Number(o.mwstSatz);
    if (!Number.isFinite(menge) || menge <= 0 || menge > 9999) return null;
    if (!Number.isFinite(preis) || Math.abs(preis) > 100_000_000) return null;
    if (!Number.isFinite(rabatt) || rabatt < 0 || rabatt > 100) return null;
    if (!Number.isFinite(satz) || satz < 0 || satz > 30) return null;
    if (!bezeichnung) return null;
    const uuid = (w: unknown) => (typeof w === 'string' && /^[0-9a-f-]{36}$/i.test(w) ? w : null);
    out.push({
      id: t(o.id, 60) || neueId(),
      art: 'position',
      kategorie: t(o.kategorie, 40) || 'sonstiges',
      bezeichnung,
      beschreibung,
      stoffnummer: t(o.stoffnummer, 40).toUpperCase() || undefined,
      menge: Math.round(menge * 1000) / 1000,
      einheit: t(o.einheit, 20) || 'Stk.',
      einzelpreisRp: Math.round(preis),
      rabattProzent: Math.round(rabatt * 100) / 100 || undefined,
      mwstSatz: Math.round(satz * 100) / 100,
      produktId: uuid(o.produktId),
      varianteId: t(o.varianteId, 60) || null,
    });
  }
  return out;
}
