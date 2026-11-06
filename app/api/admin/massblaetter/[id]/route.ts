// Massblatt-Version korrigieren (gleiche Version, z. B. Tippfehler direkt nach dem Messen) oder löschen.
import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { koerperAus, masseAus } from '@/lib/crm/massblatt';
import { tagAus } from '@/lib/admin/belege';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const [m] = await db().select().from(schema.massblatt).where(eq(schema.massblatt.id, id)).limit(1);
  if (!m) return fehler('Massblatt nicht gefunden', 404);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const set: Partial<typeof schema.massblatt.$inferInsert> = { aktualisiertAm: new Date() };
  if ('masse' in b) set.masse = masseAus(b.masse);
  if ('koerper' in b) set.koerper = koerperAus(b.koerper);
  if ('notiz' in b) set.notiz = txt(b.notiz, 4000) || null;
  if ('gemessenAm' in b) {
    const d = tagAus(b.gemessenAm);
    if (!d) return fehler('Datum ungültig');
    set.gemessenAm = d;
  }
  await db().update(schema.massblatt).set(set).where(eq(schema.massblatt.id, id));
  await aktivitaetLoggen(db(), { kontaktId: m.kontaktId, kanal: 'system', titel: `Massblatt V${m.version} korrigiert`, adminUserId: a.s.user.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const [m] = await db().select().from(schema.massblatt).where(eq(schema.massblatt.id, id)).limit(1);
  if (!m) return fehler('Massblatt nicht gefunden', 404);
  await db().transaction(async (tx) => {
    await tx.update(schema.auftrag).set({ massblattId: null }).where(eq(schema.auftrag.massblattId, id));
    await tx.delete(schema.massblatt).where(eq(schema.massblatt.id, id));
    if (m.aktiv) {
      const [vorher] = await tx.select({ id: schema.massblatt.id }).from(schema.massblatt).where(eq(schema.massblatt.kontaktId, m.kontaktId)).orderBy(desc(schema.massblatt.version)).limit(1);
      if (vorher) await tx.update(schema.massblatt).set({ aktiv: true }).where(and(eq(schema.massblatt.id, vorher.id)));
    }
    await aktivitaetLoggen(tx, { kontaktId: m.kontaktId, kanal: 'system', titel: `Massblatt V${m.version} gelöscht`, adminUserId: a.s.user.id });
  });
  return NextResponse.json({ ok: true });
}
