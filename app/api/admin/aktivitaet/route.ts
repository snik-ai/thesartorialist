// Verlaufseintrag (Anruf, WhatsApp/SMS geöffnet, E-Mail, Notiz) zu einem Kontakt.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import type { Kanal } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KANAELE: Kanal[] = ['mail', 'whatsapp', 'sms', 'anruf', 'notiz'];

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const kontaktId = txt(b?.kontaktId, 40);
  const terminId = txt(b?.terminId, 40);
  const kanal = b?.kanal as Kanal;
  if (!UUID.test(kontaktId) || !KANAELE.includes(kanal) || (terminId && !UUID.test(terminId))) return fehler('Ungültig');
  const [k] = await db().select({ id: schema.kontakt.id, abgemeldet: schema.kontakt.abgemeldet, wa: schema.kontakt.einwilligungWhatsapp, sms: schema.kontakt.einwilligungSms }).from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
  if (!k) return fehler('Kontakt nicht gefunden', 404);
  // Serverseitig nochmals: WhatsApp/SMS nur mit Einwilligung
  if ((kanal === 'whatsapp' && !k.wa) || (kanal === 'sms' && !k.sms) || ((kanal === 'whatsapp' || kanal === 'sms') && k.abgemeldet)) return fehler('Keine Einwilligung für diesen Kanal', 403);
  await aktivitaetLoggen(db(), {
    kontaktId,
    terminId: terminId || null,
    kanal,
    richtung: kanal === 'notiz' ? 'intern' : b?.richtung === 'ein' ? 'ein' : 'aus',
    titel: txt(b?.titel, 160) || 'Eintrag',
    text: txt(b?.text, 4000) || null,
    adminUserId: a.s.user.id,
  });
  return NextResponse.json({ ok: true });
}
