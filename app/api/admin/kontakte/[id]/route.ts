// Kontakt bearbeiten: Stammdaten, Einwilligung WhatsApp/SMS (mit Zeitstempel + Quelle), Abmeldung.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { telNorm } from '@/lib/crm/telefon';
import { LEAD_LABEL, LEAD_PHASEN } from '@/lib/crm/belege';
import type { KontaktStatus, LeadPhase } from '@/lib/db/schema';

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
  if ('anrede' in b) set.anrede = ['Herr', 'Frau'].includes(txt(b.anrede, 10)) ? txt(b.anrede, 10) : null;
  if ('strasse' in b) set.strasse = txt(b.strasse, 120) || null;
  if ('plz' in b) set.plz = txt(b.plz, 10) || null;
  if ('ort' in b) set.ort = txt(b.ort, 80) || null;
  if ('land' in b) set.land = (txt(b.land, 2) || 'CH').toUpperCase();
  if ('potenzialRp' in b) {
    const p = b.potenzialRp === null || b.potenzialRp === '' ? null : Math.round(Number(b.potenzialRp));
    if (p !== null && (!Number.isFinite(p) || p < 0 || p > 100_000_000)) return fehler('Potenzial ungültig');
    set.potenzialRp = p;
  }
  if ('status' in b) {
    const s = txt(b.status, 10) as KontaktStatus;
    if (!['lead', 'kunde', 'inaktiv'].includes(s)) return fehler('Status ungültig');
    if (s !== k.status) {
      set.status = s;
      if (s === 'kunde' && !k.kundeSeit) set.kundeSeit = new Date();
      log.push(`Status: ${s === 'lead' ? 'Lead' : s === 'kunde' ? 'Kunde' : 'Inaktiv'}`);
    }
  }
  if ('leadPhase' in b) {
    const p = txt(b.leadPhase, 12) as LeadPhase;
    if (!LEAD_PHASEN.some((x) => x.key === p)) return fehler('Phase ungültig');
    if (p !== k.leadPhase) {
      set.leadPhase = p;
      set.verlorenGrund = p === 'verloren' ? txt(b.verlorenGrund, 300) || null : null;
      log.push(`Pipeline: ${LEAD_LABEL[p]}${p === 'verloren' && set.verlorenGrund ? ` (${set.verlorenGrund})` : ''}`);
    }
  }

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
