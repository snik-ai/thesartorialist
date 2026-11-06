// Massblatt: neue Version speichern (die bisher aktive wird archiviert, Vergleich bleibt möglich).
import { NextResponse } from 'next/server';
import { and, eq, max } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { koerperAus, masseAus } from '@/lib/crm/massblatt';
import { tagAus } from '@/lib/admin/belege';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const kontaktId = txt(b?.kontaktId, 40);
  if (!UUID.test(kontaktId)) return fehler('Ungültig');
  const [k] = await db().select({ id: schema.kontakt.id }).from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
  if (!k) return fehler('Kontakt nicht gefunden', 404);
  const auftragId = txt(b?.auftragId, 40);
  if (auftragId) {
    const [au] = UUID.test(auftragId) ? await db().select({ id: schema.auftrag.id }).from(schema.auftrag).where(and(eq(schema.auftrag.id, auftragId), eq(schema.auftrag.kontaktId, kontaktId))).limit(1) : [];
    if (!au) return fehler('Auftrag gehört nicht zu diesem Kunden');
  }
  const gemessenAm = tagAus(b?.gemessenAm ?? null) ?? new Date();
  const id = await db().transaction(async (tx) => {
    const M = schema.massblatt;
    const [{ v }] = await tx.select({ v: max(M.version) }).from(M).where(eq(M.kontaktId, kontaktId));
    await tx.update(M).set({ aktiv: false, aktualisiertAm: new Date() }).where(and(eq(M.kontaktId, kontaktId), eq(M.aktiv, true)));
    const [neu] = await tx
      .insert(M)
      .values({ kontaktId, auftragId: auftragId || null, version: (v ?? 0) + 1, masse: masseAus(b?.masse), koerper: koerperAus(b?.koerper), notiz: txt(b?.notiz, 4000) || null, gemessenAm, gemessenVon: a.s.user.id, aktiv: true })
      .returning({ id: M.id, version: M.version });
    if (auftragId) await tx.update(schema.auftrag).set({ massblattId: neu.id, aktualisiertAm: new Date() }).where(eq(schema.auftrag.id, auftragId));
    await aktivitaetLoggen(tx, { kontaktId, kanal: 'system', titel: `Massblatt V${neu.version} erfasst`, auftragId: auftragId || null, adminUserId: a.s.user.id });
    return neu.id;
  });
  return NextResponse.json({ ok: true, id });
}
