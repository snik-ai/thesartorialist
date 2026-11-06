// Kontakt bearbeiten: Stammdaten, Einwilligung WhatsApp/SMS (mit Zeitstempel + Quelle), Abmeldung.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { telNorm } from '@/lib/crm/telefon';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, id)).limit(1);
  if (!k) return fehler('Kontakt nicht gefunden', 404);

  const set: Partial<typeof schema.kontakt.$inferInsert> = { aktualisiertAm: new Date() };
  const log: string[] = [];
  if ('name' in b) set.name = txt(b.name, 120);
  if ('email' in b) {
    const e = txt(b.email, 200).toLowerCase();
    if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return fehler('Ungültige E-Mail-Adresse');
    set.email = e || null;
  }
  if ('telefon' in b) {
    const t = txt(b.telefon, 40);
    if (t && !telNorm(t)) return fehler('Ungültige Telefonnummer');
    set.telefon = t || null;
    set.telefonNorm = telNorm(t);
  }
  if ('firma' in b) set.firma = txt(b.firma, 160) || null;
  if ('brandDomain' in b) {
    const d = txt(b.brandDomain, 120).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (d && !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) return fehler('Ungültige Domain');
    set.brandDomain = d || null;
  }
  if ('notiz' in b) set.notiz = txt(b.notiz, 4000) || null;

  const quelle = `Backend · ${a.s.user.email}${txt(b.einwilligungQuelle, 200) ? ` · ${txt(b.einwilligungQuelle, 200)}` : ''}`;
  if (typeof b.whatsapp === 'boolean' && b.whatsapp !== Boolean(k.einwilligungWhatsapp)) {
    set.einwilligungWhatsapp = b.whatsapp ? new Date() : null;
    set.einwilligungWhatsappQuelle = b.whatsapp ? quelle : null;
    log.push(b.whatsapp ? 'Einwilligung WhatsApp erfasst' : 'Einwilligung WhatsApp widerrufen');
  }
  if (typeof b.sms === 'boolean' && b.sms !== Boolean(k.einwilligungSms)) {
    set.einwilligungSms = b.sms ? new Date() : null;
    set.einwilligungSmsQuelle = b.sms ? quelle : null;
    log.push(b.sms ? 'Einwilligung SMS erfasst' : 'Einwilligung SMS widerrufen');
  }
  if (typeof b.abgemeldet === 'boolean' && b.abgemeldet !== Boolean(k.abgemeldet)) {
    set.abgemeldet = b.abgemeldet ? new Date() : null;
    log.push(b.abgemeldet ? 'Abgemeldet (keine Nachrichten mehr)' : 'Abmeldung aufgehoben');
  }

  await db().update(schema.kontakt).set(set).where(eq(schema.kontakt.id, id));
  for (const titel of log) await aktivitaetLoggen(db(), { kontaktId: id, kanal: 'system', titel, text: txt(b.einwilligungQuelle, 200) || null, adminUserId: a.s.user.id });
  return NextResponse.json({ ok: true });
}
