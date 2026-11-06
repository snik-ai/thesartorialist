// Neues Angebot (Entwurf) für einen Kontakt — optional mit Stil-Auswahl aus einer Anfrage.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { angebotErstellen } from '@/lib/crm/ablauf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const kontaktId = txt(b?.kontaktId, 40);
  const terminId = txt(b?.terminId, 40);
  if (!UUID.test(kontaktId) || (terminId && !UUID.test(terminId))) return fehler('Ungültig');
  const [k] = await db().select({ id: schema.kontakt.id }).from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
  if (!k) return fehler('Kontakt nicht gefunden', 404);
  const r = await angebotErstellen({ kontaktId, terminId: terminId || null, adminId: a.s.user.id, titel: txt(b?.titel, 160) || undefined });
  return NextResponse.json({ ok: true, ...r });
}
