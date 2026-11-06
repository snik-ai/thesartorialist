// Schnellablauf «Neues Angebot» / «Neue Rechnung» ohne Anfrage (Laufkundschaft im Store, E-Mail, Telefon …):
// bestehender Kontakt (kontaktId) oder neuer Kunde (Name + E-Mail oder Telefon, Golden Record über kontaktAufnehmen).
// Antwort: { ok, id, nummer, kontaktId, neu, url } → das leere A4-Blatt öffnet sich.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen, kontaktAufnehmen } from '@/lib/crm/kontakte';
import { telNorm } from '@/lib/crm/telefon';
import { AblaufFehler, angebotErstellen, leadPhaseSetzen, rechnungErstellen } from '@/lib/crm/ablauf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HERKUNFT: Record<string, string> = { store: 'Laufkundschaft im Store', email: 'E-Mail', telefon: 'Telefon', empfehlung: 'Empfehlung', anderes: 'Anderes' };

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const art = b.art === 'rechnung' ? 'rechnung' : b.art === 'angebot' ? 'angebot' : null;
  if (!art) return fehler('Art ungültig');
  const herkunft = typeof b.herkunft === 'string' && b.herkunft in HERKUNFT ? b.herkunft : null;
  const wer = a.s.user.id;

  let kontaktId = txt(b.kontaktId, 40);
  let neu = false;
  if (kontaktId) {
    if (!UUID.test(kontaktId)) return fehler('Kontakt ungültig');
    const [k] = await db().select({ id: schema.kontakt.id }).from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
    if (!k) return fehler('Kontakt nicht gefunden', 404);
  } else {
    const n = (b.neu && typeof b.neu === 'object' ? b.neu : {}) as Record<string, unknown>;
    const name = txt(n.name, 120);
    const email = txt(n.email, 200).toLowerCase();
    const telefon = txt(n.telefon, 40);
    if (!name) return fehler('Bitte einen Namen eingeben.');
    if (!email && !telefon) return fehler('Bitte E-Mail oder Telefon angeben.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fehler('Ungültige E-Mail-Adresse');
    if (telefon && !telNorm(telefon)) return fehler('Ungültige Telefonnummer');
    const r = await kontaktAufnehmen(db(), { name, email: email || undefined, telefon: telefon || undefined, firma: txt(n.firma, 160) || undefined, quelle: herkunft ?? 'atelier' });
    kontaktId = r.id;
    neu = r.neu;
    await aktivitaetLoggen(db(), {
      kontaktId,
      kanal: 'system',
      titel: r.neu ? `Neuer Kontakt im Backend (${herkunft ? HERKUNFT[herkunft] : 'Atelier'})` : 'Bestehender Kontakt erkannt (gleiche E-Mail oder Telefon)',
      text: r.abweichend.length ? `Abweichend erfasst: ${r.abweichend.join(', ')}` : undefined,
      adminUserId: wer,
    });
  }

  try {
    if (art === 'angebot') {
      const an = await angebotErstellen({ kontaktId, adminId: wer, titel: txt(b.titel, 160) || undefined });
      await leadPhaseSetzen(db(), kontaktId, 'angebot');
      if (herkunft) await aktivitaetLoggen(db(), { kontaktId, kanal: 'system', titel: `Neues Angebot ${an.nummer} – ${HERKUNFT[herkunft]}`, angebotId: an.id, adminUserId: wer });
      return NextResponse.json({ ok: true, id: an.id, nummer: an.nummer, kontaktId, neu, url: `/admin/angebote/${an.id}/` });
    }
    const re = await rechnungErstellen({ kontaktId, art: 'rechnung', adminId: wer });
    await db().update(schema.rechnung).set({ titel: txt(b.titel, 160) || 'Direktverkauf' }).where(eq(schema.rechnung.id, re.id));
    if (herkunft) await aktivitaetLoggen(db(), { kontaktId, kanal: 'system', titel: `Neue Rechnung ${re.nummer} – ${HERKUNFT[herkunft]}`, rechnungId: re.id, adminUserId: wer });
    return NextResponse.json({ ok: true, id: re.id, nummer: re.nummer, kontaktId, neu, url: `/admin/rechnungen/${re.id}/` });
  } catch (err) {
    if (err instanceof AblaufFehler) return fehler(err.message, err.status);
    throw err;
  }
}
