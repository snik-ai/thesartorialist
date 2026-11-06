// Ein Produkt: lesen (GET), ändern (PATCH), löschen (DELETE – in Belegen verwendete Produkte werden nur deaktiviert).
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, UUID } from '@/lib/admin/zugang';
import { produktAus } from '@/components/produkte/typen';
import { produktLaden, produktVerwendet } from '@/components/produkte/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  const p = UUID.test(id) ? await produktLaden(id) : null;
  if (!p) return fehler('Produkt nicht gefunden', 404);
  return NextResponse.json({ ...p, verwendet: await produktVerwendet(id) });
}

export async function PATCH(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id) || !(await produktLaden(id))) return fehler('Produkt nicht gefunden', 404);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const r = produktAus(b, true);
  if (!r.ok) return fehler(r.fehler);
  await db()
    .update(schema.produkt)
    .set({ ...r.werte, aktualisiertAm: new Date() })
    .where(eq(schema.produkt.id, id));
  const p = await produktLaden(id);
  return NextResponse.json({ ok: true, meldung: 'aktiv' in b && Object.keys(b).length === 1 ? (p?.aktiv ? 'Produkt ist aktiv.' : 'Produkt ist inaktiv.') : 'Gespeichert.', produkt: p });
}

export async function DELETE(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id) || !(await produktLaden(id))) return fehler('Produkt nicht gefunden', 404);
  const n = await produktVerwendet(id);
  if (n > 0) {
    await db().update(schema.produkt).set({ aktiv: false, aktualisiertAm: new Date() }).where(eq(schema.produkt.id, id));
    return NextResponse.json({ ok: true, geloescht: false, meldung: `In ${n} Beleg${n === 1 ? '' : 'en'} verwendet — das Produkt wurde deaktiviert statt gelöscht.` });
  }
  await db().delete(schema.produkt).where(eq(schema.produkt.id, id));
  return NextResponse.json({ ok: true, geloescht: true, meldung: 'Produkt gelöscht.' });
}
