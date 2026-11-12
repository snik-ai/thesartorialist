// Termin im Backend eintragen (bestätigt): Beratung, Massnehmen, Anprobe, Abholung oder Telefontermin — für einen
// bestehenden Kontakt (kontaktId) oder einen neuen Lead (neu: Vorname, Name, E-Mail, Telefon → Golden Record über
// kontaktAufnehmen). Optional mit Bestätigungsmail (nur Atelier-Termine), Notiz und Dauer. Private Blocker sperren die Zeit.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen, kontaktAufnehmen } from '@/lib/crm/kontakte';
import { leadPhaseSetzen } from '@/lib/crm/ablauf';
import { privatKollision } from '@/lib/crm/kalender';
import { telNorm } from '@/lib/crm/telefon';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { icsDatei, mailTerminBestaetigt } from '@/lib/mail-vorlagen';
import { kundenTexte, terminTextFuer } from '@/lib/i18n/kundenmail';
import { terminLang, zuerichTeile } from '@/lib/zeit';
import type { TerminZweck } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ZWECK: Record<TerminZweck, string> = { beratung: 'Beratung', massnehmen: 'Massnehmen', anprobe: 'Anprobe', abholung: 'Abholung', telefon: 'Telefontermin' };
const STANDARD_DAUER: Record<TerminZweck, number> = { beratung: 90, massnehmen: 60, anprobe: 60, abholung: 30, telefon: 30 };

export async function POST(req: Request) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const b = await jsonBody(req);
  const zweck = txt(b?.zweck, 20) as TerminZweck;
  if (!ZWECK[zweck]) return fehler('Ungültig');
  const start = typeof b?.start === 'string' ? new Date(b.start) : null;
  if (!start || Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 3600_000) return fehler('Bitte einen Termin in der Zukunft wählen.');
  const dauerRoh = Number(b?.dauerMin);
  const dauerMin = Number.isInteger(dauerRoh) && dauerRoh >= 5 && dauerRoh <= 600 ? dauerRoh : STANDARD_DAUER[zweck];
  const blocker = await privatKollision(start, new Date(start.getTime() + dauerMin * 60_000));
  if (blocker) return fehler(`Diese Zeit ist privat blockiert: ${blocker}.`);

  // Kontakt: bestehend oder neuer Lead (Golden Record über E-Mail/Telefon)
  let kontaktId = txt(b?.kontaktId, 40);
  let neuAngelegt = false;
  const neu = b?.neu && typeof b.neu === 'object' ? (b.neu as Record<string, unknown>) : null;
  if (!kontaktId && neu) {
    const name = [txt(neu.vorname, 60), txt(neu.name, 80)].filter(Boolean).join(' ');
    const email = txt(neu.email, 200).toLowerCase();
    const telefon = txt(neu.telefon, 40);
    if (!name) return fehler('Bitte Vor- oder Nachnamen eingeben.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fehler('Ungültige E-Mail-Adresse');
    if (telefon && !telNorm(telefon)) return fehler('Ungültige Telefonnummer');
    if (zweck === 'telefon' && !telefon) return fehler('Für einen Telefontermin braucht es eine Telefonnummer.');
    const r = await kontaktAufnehmen(db(), { name, email: email || undefined, telefon: telefon || undefined, quelle: zweck === 'telefon' ? 'atelier:telefon' : 'atelier' });
    kontaktId = r.id;
    neuAngelegt = r.neu;
    await aktivitaetLoggen(db(), {
      kontaktId,
      kanal: 'system',
      titel: r.neu ? `Als Lead angelegt (${ZWECK[zweck]} im Backend)` : 'Erneut erfasst — bestehender Kontakt ergänzt',
      text: r.abweichend.length ? `Abweichende Angaben: ${r.abweichend.join(', ')}` : null,
      adminUserId: a.s.user.id,
    });
  }
  if (!UUID.test(kontaktId)) return fehler('Bitte einen Kontakt wählen oder neu erfassen.');
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, kontaktId)).limit(1);
  if (!k) return fehler('Kontakt nicht gefunden', 404);
  const [t] = await db()
    .insert(schema.termin)
    .values({ kontaktId, art: 'termin', zweck, status: 'bestaetigt', bestaetigtStart: start, wunschStart: start, wunschText: ZWECK[zweck], quelle: zweck === 'telefon' ? 'atelier:telefon' : 'atelier', sprache: k.sprache, dauerMin, gelesenAm: new Date() })
    .returning({ id: schema.termin.id });
  await aktivitaetLoggen(db(), { kontaktId, terminId: t.id, kanal: 'system', titel: `${ZWECK[zweck]} eingetragen: ${terminLang(start)}`, adminUserId: a.s.user.id });
  const notiz = txt(b?.notiz, 3000);
  if (notiz) await aktivitaetLoggen(db(), { kontaktId, terminId: t.id, kanal: 'notiz', titel: `Notiz zum ${ZWECK[zweck]}`, text: notiz, adminUserId: a.s.user.id });
  // Lead hat jetzt einen Termin (Pipeline nur vorwärts, Kunden bleiben Kunden)
  await leadPhaseSetzen(db(), kontaktId, 'termin');
  let meldung = `${ZWECK[zweck]} eingetragen${neuAngelegt ? ', Lead angelegt' : ''}.`;
  // Bestätigungsmail nur für Termine im Atelier (die Vorlage nennt Adresse und Anfahrt)
  if (b?.mail === true && zweck !== 'telefon' && k.email && mailBereit()) {
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
  return NextResponse.json({ ok: true, id: t.id, kontaktId, meldung });
}
