// Produktbild: ausliefern (GET), hochladen (PUT, Rohdaten PNG/JPEG/WebP bis 3 MB, Typ aus den Bytes), entfernen (DELETE).
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, UUID } from '@/lib/admin/zugang';
import { BILD_MAX, bildTyp } from '@/components/produkte/typen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return new Response('Nicht gefunden', { status: 404 });
  const [p] = await db().select({ bild: schema.produkt.bild, typ: schema.produkt.bildTyp }).from(schema.produkt).where(eq(schema.produkt.id, id)).limit(1);
  if (!p?.bild || !p.typ) return new Response('Nicht gefunden', { status: 404 });
  return new Response(new Uint8Array(p.bild), {
    headers: { 'Content-Type': p.typ, 'Cache-Control': 'private, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" },
  });
}

export async function PUT(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Produkt nicht gefunden', 404);
  const laenge = Number(req.headers.get('content-length') ?? 0);
  if (laenge > BILD_MAX) return fehler('Das Bild ist grösser als 3 MB.', 413);
  const buf = new Uint8Array(await req.arrayBuffer());
  if (!buf.length) return fehler('Kein Bild empfangen.');
  if (buf.length > BILD_MAX) return fehler('Das Bild ist grösser als 3 MB.', 413);
  const typ = bildTyp(buf);
  if (!typ) return fehler('Bitte ein PNG-, JPEG- oder WebP-Bild hochladen.', 415);
  const r = await db().update(schema.produkt).set({ bild: Buffer.from(buf), bildTyp: typ, aktualisiertAm: new Date() }).where(eq(schema.produkt.id, id)).returning({ id: schema.produkt.id, am: schema.produkt.aktualisiertAm });
  if (!r.length) return fehler('Produkt nicht gefunden', 404);
  return NextResponse.json({ ok: true, meldung: 'Bild gespeichert.', bild: `/api/admin/produkte/${id}/bild/?v=${r[0].am.getTime().toString(36)}` });
}

export async function DELETE(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Produkt nicht gefunden', 404);
  await db().update(schema.produkt).set({ bild: null, bildTyp: null, bildPfad: null, aktualisiertAm: new Date() }).where(eq(schema.produkt.id, id));
  return NextResponse.json({ ok: true, meldung: 'Bild entfernt.' });
}
