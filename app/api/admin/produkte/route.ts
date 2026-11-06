// Produktkatalog: Liste (GET ?q=&kategorie=&aktiv=1|0) und neues Produkt (POST).
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody } from '@/lib/admin/zugang';
import { istKategorie, produktAus } from '@/components/produkte/typen';
import { produktLaden, produktListe } from '@/components/produkte/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const sp = new URL(req.url).searchParams;
  const k = sp.get('kategorie');
  const aktiv = sp.get('aktiv');
  const liste = await produktListe({ q: sp.get('q') ?? '', kategorie: istKategorie(k) ? k : null, aktiv: aktiv === '1' ? true : aktiv === '0' ? false : null });
  return NextResponse.json(liste, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const r = produktAus(b);
  if (!r.ok) return fehler(r.fehler);
  const [{ max }] = await db().select({ max: sql<number>`coalesce(max(${schema.produkt.sortierung}), 0)::int` }).from(schema.produkt);
  const w = r.werte;
  const [neu] = await db()
    .insert(schema.produkt)
    .values({
      name: w.name!,
      kategorie: w.kategorie!,
      beschreibung: w.beschreibung ?? null,
      preisRp: w.preisRp ?? 0,
      mwstSatz: w.mwstSatz ?? 8.1,
      einheit: w.einheit ?? 'Stk.',
      varianten: w.varianten ?? [],
      aktiv: w.aktiv ?? true,
      sortierung: w.sortierung ?? max + 10,
    })
    .returning({ id: schema.produkt.id });
  return NextResponse.json({ ok: true, meldung: 'Produkt angelegt.', produkt: await produktLaden(neu.id) });
}
