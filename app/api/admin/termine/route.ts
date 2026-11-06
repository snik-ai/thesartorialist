// Termin im Backend eintragen (bestätigt): Beratung, Massnehmen, Anprobe oder Abholung — optional mit Bestätigungsmail.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { leadPhaseSetzen } from '@/lib/crm/ablauf';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { icsDatei, mailTerminBestaetigt } from '@/lib/mail-vorlagen';
import { kundenTexte, terminTextFuer } from '@/lib/i18n/kundenmail';
import { terminLang, zuerichTeile } from '@/lib/zeit';
import type { TerminZweck } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ZWECK: Record<TerminZweck, string> = { beratung: 'Beratung', massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung' };

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const kontaktId = txt(b?.kontaktId, 40);
  const zweck = txt(b?.zweck, 20) as TerminZweck;
  if (!UUID.test(kontaktId) || !ZWECK[zweck]) return fehler('Ungültig');
  const start = typeof b?.start === 'string' ? new Date(b.start) : null;
  if (!start || Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 3600_000) return fehler('Bitte einen Termin in der Zukunft wählen.');
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
  if (!k) return fehler('Kontakt nicht gefunden', 404);
  const [t] = await db()
    .insert(schema.termin)
    .values({ kontaktId, art: 'termin', zweck, status: 'bestaetigt', bestaetigtStart: start, wunschStart: start, wunschText: ZWECK[zweck], quelle: 'atelier', sprache: k.sprache, dauerMin: zweck === 'abholung' ? 30 : zweck === 'beratung' ? 90 : 60, gelesenAm: new Date() })
    .returning({ id: schema.termin.id });
  await aktivitaetLoggen(db(), { kontaktId, terminId: t.id, kanal: 'system', titel: `${ZWECK[zweck]} eingetragen: ${terminLang(start)}`, adminUserId: a.s.user.id });
  if (zweck === 'beratung') await leadPhaseSetzen(db(), kontaktId, 'termin');
  let meldung = `${ZWECK[zweck]} eingetragen.`;
  if (b?.mail === true && k.email && mailBereit()) {
    const kunde = kundenTexte(k.sprache);
    const z = zuerichTeile(start);
    const d = { name: k.name, email: k.email, telefon: k.telefon ?? undefined, datum: z.datum, zeit: z.zeit, wunschText: terminTextFuer(k.sprache, start), stil: [], stoffe: [] };
    const m = mailTerminBestaetigt(d, kunde.t);
    const ics = icsDatei(d, 'kunde', 'CONFIRMED', kunde.t);
    try {
      await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger(), anhaenge: ics ? [{ filename: 'Termin.ics', content: ics }] : undefined });
      await aktivitaetLoggen(db(), { kontaktId, terminId: t.id, kanal: 'mail', richtung: 'aus', titel: `Terminbestätigung per E-Mail: ${terminLang(start)}`, text: m.text, adminUserId: a.s.user.id });
      meldung += ' Bestätigung per E-Mail verschickt.';
    } catch (err) {
      console.error('[termin] Mail', (err as Error).message);
      meldung += ' Die E-Mail konnte nicht gesendet werden.';
    }
  }
  return NextResponse.json({ ok: true, id: t.id, meldung });
}
