// Produktkatalog (wie VoxCRM components/produkte/typen.ts): Kategorien, MWST-Sätze, Einheiten und die Prüfung der Eingaben.
// Rein (Browser + API), ohne Datenbank.
import type { ProduktKategorie, ProduktVariante } from '@/lib/db/schema';

export const KATEGORIEN: { key: ProduktKategorie; label: string; mehrzahl: string }[] = [
  { key: 'massanzug', label: 'Massanzug', mehrzahl: 'Massanzüge' },
  { key: 'sakko', label: 'Sakko', mehrzahl: 'Sakkos' },
  { key: 'hose', label: 'Hose', mehrzahl: 'Hosen' },
  { key: 'weste', label: 'Weste', mehrzahl: 'Westen' },
  { key: 'hemd', label: 'Hemd', mehrzahl: 'Hemden' },
  { key: 'smoking', label: 'Smoking', mehrzahl: 'Smokings' },
  { key: 'mantel', label: 'Mantel', mehrzahl: 'Mäntel' },
  { key: 'aenderung', label: 'Änderung', mehrzahl: 'Änderungen' },
  { key: 'stoffzuschlag', label: 'Stoffzuschlag', mehrzahl: 'Stoffzuschläge' },
  { key: 'accessoire', label: 'Accessoire', mehrzahl: 'Accessoires' },
  { key: 'dienstleistung', label: 'Dienstleistung', mehrzahl: 'Dienstleistungen' },
];
export const KATEGORIE_LABEL = Object.fromEntries(KATEGORIEN.map((k) => [k.key, k.label])) as Record<ProduktKategorie, string>;
export const istKategorie = (k: unknown): k is ProduktKategorie => typeof k === 'string' && KATEGORIEN.some((x) => x.key === k);

export const MWST_SAETZE: { satz: number; label: string }[] = [
  { satz: 8.1, label: 'Normal' },
  { satz: 2.6, label: 'Reduziert' },
  { satz: 3.8, label: 'Beherbergung' },
  { satz: 0, label: 'Befreit' },
];
export const EINHEITEN = ['Stk.', 'Paar', 'Set', 'Std.', 'Pauschal', 'm'];

export type ProduktDaten = {
  id: string;
  name: string;
  kategorie: ProduktKategorie;
  beschreibung: string | null;
  preisRp: number;
  mwstSatz: number;
  einheit: string;
  varianten: ProduktVariante[];
  aktiv: boolean;
  bild: string | null;
  sortierung: number;
};

/** Treffer der Positionssuche im A4-Editor (eine Zeile je aktive Variante, sonst je Produkt) */
export type Treffer = {
  produktId: string;
  varianteId: string | null;
  name: string;
  kategorie: string;
  einheit: string;
  mwstSatz: number;
  preisRp: number;
  beschreibung: string | null;
  bild: string | null;
};

/** Preisspanne: «CHF 1’690» oder «CHF 1’690 – 2’590» */
export function preisSpanne(p: Pick<ProduktDaten, 'preisRp' | 'varianten'>): { von: number; bis: number } {
  const v = p.varianten.filter((x) => x.aktiv);
  if (!v.length) return { von: p.preisRp, bis: p.preisRp };
  const preise = v.map((x) => x.preisRp);
  return { von: Math.min(...preise), bis: Math.max(...preise) };
}

const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const rp = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100_000_000 ? Math.round(n) : null;
};

/** Eingabe aus dem Editor prüfen. Liefert die Werte oder eine Fehlermeldung je Feld. */
export function produktAus(b: Record<string, unknown>, teil = false): { ok: true; werte: Partial<Omit<ProduktDaten, 'id' | 'bild'>> } | { ok: false; fehler: string } {
  const w: Partial<Omit<ProduktDaten, 'id' | 'bild'>> = {};
  if (!teil || 'name' in b) {
    const name = txt(b.name, 160);
    if (name.length < 2) return { ok: false, fehler: 'Bitte einen Namen mit mindestens 2 Zeichen eingeben.' };
    w.name = name;
  }
  if (!teil || 'kategorie' in b) {
    if (!istKategorie(b.kategorie)) return { ok: false, fehler: 'Kategorie ungültig.' };
    w.kategorie = b.kategorie;
  }
  if ('beschreibung' in b) w.beschreibung = txt(b.beschreibung, 2000) || null;
  if (!teil || 'preisRp' in b) {
    const p = rp(b.preisRp ?? 0);
    if (p === null) return { ok: false, fehler: 'Preis ungültig.' };
    w.preisRp = p;
  }
  if (!teil || 'mwstSatz' in b) {
    const s = Number(b.mwstSatz ?? 8.1);
    if (!MWST_SAETZE.some((x) => x.satz === s)) return { ok: false, fehler: 'MWST-Satz ungültig.' };
    w.mwstSatz = s;
  }
  if (!teil || 'einheit' in b) {
    const e = txt(b.einheit, 20) || 'Stk.';
    w.einheit = e;
  }
  if ('aktiv' in b) w.aktiv = b.aktiv !== false;
  if ('sortierung' in b) {
    const s = Number(b.sortierung);
    if (Number.isFinite(s)) w.sortierung = Math.round(Math.max(-100000, Math.min(100000, s)));
  }
  if (!teil || 'varianten' in b) {
    const roh = b.varianten ?? [];
    if (!Array.isArray(roh) || roh.length > 30) return { ok: false, fehler: 'Varianten ungültig.' };
    const v: ProduktVariante[] = [];
    const ids = new Set<string>();
    for (const x of roh) {
      if (!x || typeof x !== 'object') return { ok: false, fehler: 'Varianten ungültig.' };
      const o = x as Record<string, unknown>;
      const name = txt(o.name, 80);
      if (!name) return { ok: false, fehler: 'Jede Variante braucht einen Namen (z. B. «Super 150»).' };
      const preis = rp(o.preisRp);
      if (preis === null) return { ok: false, fehler: `Preis der Variante «${name}» ungültig.` };
      let id = txt(o.id, 60).replace(/[^a-z0-9-]/gi, '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'variante';
      while (ids.has(id)) id = `${id}-2`;
      ids.add(id);
      v.push({ id, name, preisRp: preis, aktiv: o.aktiv !== false });
    }
    w.varianten = v;
  }
  return { ok: true, werte: w };
}

/** Bildtyp aus den ersten Bytes (PNG, JPEG, WebP); sonst null */
export function bildTyp(b: Uint8Array): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}
export const BILD_MAX = 3 * 1024 * 1024;
