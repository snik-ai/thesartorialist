// Serverseitig: Produkte lesen (Liste, Detail, Positionssuche). Bild: hochgeladen → /api/admin/produkte/<id>/bild/, sonst Pfad aus /public.
import { and, asc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { ProduktKategorie } from '@/lib/db/schema';
import { KATEGORIE_LABEL, type ProduktDaten, type Treffer } from './typen';

type Zeile = Omit<typeof schema.produkt.$inferSelect, 'bild'> & { hatBild: boolean };

const SPALTEN = {
  id: schema.produkt.id,
  name: schema.produkt.name,
  kategorie: schema.produkt.kategorie,
  beschreibung: schema.produkt.beschreibung,
  preisRp: schema.produkt.preisRp,
  mwstSatz: schema.produkt.mwstSatz,
  einheit: schema.produkt.einheit,
  varianten: schema.produkt.varianten,
  aktiv: schema.produkt.aktiv,
  bildTyp: schema.produkt.bildTyp,
  bildPfad: schema.produkt.bildPfad,
  sortierung: schema.produkt.sortierung,
  katalogId: schema.produkt.katalogId,
  erstelltAm: schema.produkt.erstelltAm,
  aktualisiertAm: schema.produkt.aktualisiertAm,
  hatBild: sql<boolean>`${schema.produkt.bild} is not null`,
};

export const bildUrl = (z: Pick<Zeile, 'id' | 'hatBild' | 'bildPfad' | 'aktualisiertAm'>) =>
  z.hatBild ? `/api/admin/produkte/${z.id}/bild/?v=${z.aktualisiertAm.getTime().toString(36)}` : z.bildPfad || null;

export const alsDaten = (z: Zeile): ProduktDaten => ({
  id: z.id,
  name: z.name,
  kategorie: z.kategorie,
  beschreibung: z.beschreibung,
  preisRp: z.preisRp,
  mwstSatz: Number(z.mwstSatz),
  einheit: z.einheit,
  varianten: z.varianten ?? [],
  aktiv: z.aktiv,
  bild: bildUrl(z),
  sortierung: z.sortierung,
});

const likeEsc = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function produktListe(o: { q?: string; kategorie?: ProduktKategorie | null; aktiv?: boolean | null } = {}) {
  const bed: SQL[] = [];
  const q = (o.q ?? '').trim().slice(0, 80);
  if (q) {
    const m = `%${likeEsc(q)}%`;
    bed.push(or(ilike(schema.produkt.name, m), ilike(schema.produkt.beschreibung, m), sql`${schema.produkt.varianten}::text ilike ${m}`)!);
  }
  if (o.kategorie) bed.push(eq(schema.produkt.kategorie, o.kategorie));
  if (o.aktiv !== null && o.aktiv !== undefined) bed.push(eq(schema.produkt.aktiv, o.aktiv));
  const rows = await db()
    .select(SPALTEN)
    .from(schema.produkt)
    .where(bed.length ? and(...bed) : undefined)
    .orderBy(asc(schema.produkt.sortierung), asc(schema.produkt.name))
    .limit(500);
  return rows.map(alsDaten);
}

export async function produktLaden(id: string) {
  const [z] = await db().select(SPALTEN).from(schema.produkt).where(eq(schema.produkt.id, id)).limit(1);
  return z ? alsDaten(z) : null;
}

/** Zähler je Kategorie und aktiv/inaktiv (für die Chips) */
export async function produktZaehler() {
  const rows = await db()
    .select({ kategorie: schema.produkt.kategorie, aktiv: schema.produkt.aktiv, n: sql<number>`count(*)::int` })
    .from(schema.produkt)
    .groupBy(schema.produkt.kategorie, schema.produkt.aktiv);
  return rows;
}

/** In wie vielen Belegen (Angebot, Auftrag, Rechnung) kommt das Produkt vor? */
export async function produktVerwendet(id: string) {
  const muster = JSON.stringify([{ produktId: id }]);
  const [r] = await db().execute<{ n: number }>(sql`
    select ((select count(*) from angebot where positionen @> ${muster}::jsonb)
          + (select count(*) from auftrag where positionen @> ${muster}::jsonb)
          + (select count(*) from rechnung where positionen @> ${muster}::jsonb))::int as n`);
  return r?.n ?? 0;
}

/** Positionssuche im A4-Editor: aktive Produkte, je aktive Variante ein Treffer. */
export async function produktSuche(q: string): Promise<Treffer[]> {
  const t = q.trim().toLowerCase().slice(0, 80);
  const alle = await produktListe({ aktiv: true });
  const treffer: (Treffer & { rang: number })[] = [];
  for (const p of alle) {
    const basis = { produktId: p.id, kategorie: p.kategorie, einheit: p.einheit, mwstSatz: p.mwstSatz, beschreibung: p.beschreibung, bild: p.bild };
    const kat = KATEGORIE_LABEL[p.kategorie]?.toLowerCase() ?? p.kategorie;
    const text = `${p.name} ${p.beschreibung ?? ''} ${kat}`.toLowerCase();
    const rang = (s: string) => (!t ? 1 : s.startsWith(t) ? 3 : s.includes(t) ? 2 : 0);
    const varianten = p.varianten.filter((v) => v.aktiv);
    if (!varianten.length) {
      const r = rang(p.name.toLowerCase()) || (text.includes(t) ? 1 : 0);
      if (r) treffer.push({ ...basis, varianteId: null, name: p.name, preisRp: p.preisRp, rang: r });
      continue;
    }
    for (const v of varianten) {
      const name = `${p.name} · ${v.name}`;
      const r = Math.max(rang(p.name.toLowerCase()), rang(v.name.toLowerCase()), rang(name.toLowerCase())) || (text.includes(t) ? 1 : 0);
      if (r) treffer.push({ ...basis, varianteId: v.id, name, preisRp: v.preisRp, rang: r });
    }
  }
  const sortiert = t ? treffer.sort((a, b) => b.rang - a.rang) : treffer;
  return sortiert.slice(0, t ? 12 : 8).map(({ rang: _r, ...x }) => (void _r, x));
}
