// Aktionen auf einer Anfrage: bestätigen, vorschlagen, Status, Eingangsbestätigung, Notiz. Alles landet im Verlauf.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { leadPhaseSetzen } from '@/lib/crm/ablauf';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { icsDatei, mailTerminBestaetigt, mailTerminKunde, mailTerminVorschlag, type TerminDaten } from '@/lib/mail-vorlagen';
import { kundenTexte, terminTextFuer } from '@/lib/i18n/kundenmail';
import { textBestaetigung, textVorschlag } from '@/lib/crm/nachrichten';
import { terminLang, zuerichTeile } from '@/lib/zeit';
import type { TerminStatus } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const datumOk = (v: unknown) => {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) || d.getTime() < Date.now() - 86400_000 * 365 || d.getTime() > Date.now() + 86400_000 * 400 ? null : d;
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const { id } = await params;
  if (!UUID.test(id)) return fehler('Ungültig');
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');

  const [t] = await db().select().from(schema.termin).where(eq(schema.termin.id, id)).limit(1);
  if (!t) return fehler('Anfrage nicht gefunden', 404);
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, t.kontaktId)).limit(1);
  const wer = a.s.user.id;
  // Kundenmails in der Sprache der Anfrage (Website-Sprache beim Absenden)
  const kunde = kundenTexte(t.sprache);
  const basis = (start: Date | null): TerminDaten => {
    const z = start ? zuerichTeile(start) : null;
    return { name: k.name || (kunde.lang === 'de' ? 'Kundin/Kunde' : ''), email: k.email ?? undefined, telefon: k.telefon ?? undefined, datum: z?.datum, zeit: z?.zeit, wunschText: terminTextFuer(t.sprache, start, t.wunschText ?? 'nach Absprache'), stil: t.stil, stoffe: t.stoffe };
  };
  const setzeStatus = (status: TerminStatus, extra: Partial<typeof schema.termin.$inferInsert> = {}) =>
    db().update(schema.termin).set({ status, aktualisiertAm: new Date(), ...extra }).where(eq(schema.termin.id, id));

  switch (b.aktion) {
    case 'bestaetigen': {
      const start = datumOk(b.start);
      if (!start) return fehler('Bitte einen Termin wählen.');
      // Neue Zeit → Erinnerung neu fällig
      await setzeStatus('bestaetigt', { bestaetigtStart: start, erinnerungGesendetAm: t.bestaetigtStart?.getTime() === start.getTime() ? t.erinnerungGesendetAm : null });
      await leadPhaseSetzen(db(), k.id, 'termin');
      const lang = terminLang(start);
      let mailMeldung = '';
      let mailFehler = false;
      if (b.mail === true && k.email) {
        if (!mailBereit()) {
          mailFehler = true;
          mailMeldung = ' E-Mail-Versand ist nicht konfiguriert.';
        } else {
          try {
            const d = basis(start);
            const m = mailTerminBestaetigt(d, kunde.t);
            const ics = icsDatei(d, 'kunde', 'CONFIRMED', kunde.t);
            await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger(), anhaenge: ics ? [{ filename: 'Termin.ics', content: ics }] : undefined });
            await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'mail', richtung: 'aus', titel: `Bestätigung per E-Mail: ${lang}`, text: m.text, adminUserId: wer });
            mailMeldung = ' Bestätigung mit Kalendereintrag per E-Mail verschickt.';
          } catch (err) {
            console.error('[admin] Bestätigung-Mail', (err as Error).message);
            mailFehler = true;
            mailMeldung = ' Die E-Mail konnte nicht gesendet werden.';
          }
        }
      }
      await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'system', titel: `Termin bestätigt: ${lang}`, adminUserId: wer });
      // Bestätigung über eine App des Ateliers (WhatsApp, SMS, eigenes Mailprogramm): der Knopf öffnet die App,
      // diese Anfrage hält den Status und den Verlauf im System nach.
      const appKanal = b.kanal === 'whatsapp' || b.kanal === 'sms' || b.kanal === 'mail' ? b.kanal : null;
      if (appKanal) {
        const name = { whatsapp: 'WhatsApp', sms: 'SMS', mail: 'E-Mail (Mailprogramm)' }[appKanal];
        await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: appKanal, richtung: 'aus', titel: `Bestätigung per ${name} geöffnet: ${lang}`, text: txt(b.text, 3000) || null, adminUserId: wer });
        mailMeldung = ` ${name} mit vorbereiteter Nachricht geöffnet.`;
      }
      return NextResponse.json({ ok: true, mailFehler, meldung: `Termin bestätigt.${mailMeldung}`, text: textBestaetigung(k.name, lang), betreff: 'Ihr Termin bei The Sartorialist Zürich', anlass: 'Bestätigung' });
    }

    case 'vorschlagen': {
      const slots = (Array.isArray(b.slots) ? b.slots : []).map(datumOk).filter((d): d is Date => Boolean(d)).slice(0, 3);
      if (!slots.length) return fehler('Bitte 1–3 Termine wählen.');
      const lang = slots.map(terminLang);
      const nachricht = txt(b.nachricht, 600);
      await setzeStatus('vorgeschlagen', { vorschlaege: slots.map((s) => s.toISOString()) });
      let mailMeldung = '';
      let mailFehler = false;
      if (b.mail === true && k.email) {
        if (!mailBereit()) {
          mailFehler = true;
          mailMeldung = ' E-Mail-Versand ist nicht konfiguriert.';
        } else {
          try {
            const m = mailTerminVorschlag({ name: k.name, vorschlaege: slots.map((s) => terminTextFuer(t.sprache, s)), nachricht: nachricht || undefined }, kunde.t);
            await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger() });
            await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'mail', richtung: 'aus', titel: 'Terminvorschläge per E-Mail', text: m.text, adminUserId: wer });
            mailMeldung = ' Vorschläge per E-Mail verschickt.';
          } catch (err) {
            console.error('[admin] Vorschlag-Mail', (err as Error).message);
            mailFehler = true;
            mailMeldung = ' Die E-Mail konnte nicht gesendet werden.';
          }
        }
      }
      await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'system', titel: `${slots.length} Terminvorschl${slots.length === 1 ? 'ag' : 'äge'}`, text: lang.join('\n'), adminUserId: wer });
      return NextResponse.json({ ok: true, mailFehler, meldung: `Vorschläge gespeichert.${mailMeldung}`, text: textVorschlag(k.name, lang), betreff: 'Terminvorschläge — The Sartorialist Zürich', anlass: 'Vorschlag' });
    }

    case 'erledigt':
    case 'abgesagt': {
      await setzeStatus(b.aktion);
      if (b.aktion === 'erledigt' && t.art === 'termin') await leadPhaseSetzen(db(), k.id, 'termin');
      await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'system', titel: b.aktion === 'erledigt' ? 'Als erledigt markiert' : 'Abgesagt', adminUserId: wer });
      return NextResponse.json({ ok: true, meldung: b.aktion === 'erledigt' ? 'Als erledigt markiert.' : 'Abgesagt.' });
    }

    case 'oeffnen': {
      await setzeStatus(t.bestaetigtStart ? 'bestaetigt' : 'angefragt');
      await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'system', titel: 'Wieder geöffnet', adminUserId: wer });
      return NextResponse.json({ ok: true, meldung: 'Wieder geöffnet.' });
    }

    case 'eingangsmail': {
      if (!k.email) return fehler('Keine E-Mail-Adresse.');
      if (!mailBereit()) return fehler('E-Mail-Versand ist nicht konfiguriert.', 503);
      const d = basis(t.wunschStart);
      const m = mailTerminKunde(d, kunde.t);
      const ics = icsDatei(d, 'kunde', 'TENTATIVE', kunde.t);
      try {
        await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger(), anhaenge: ics ? [{ filename: 'Termin.ics', content: ics }] : undefined });
      } catch (err) {
        console.error('[admin] Eingangsmail', (err as Error).message);
        return fehler('Die E-Mail konnte nicht gesendet werden.', 502);
      }
      await db().update(schema.termin).set({ eingangMailAm: new Date() }).where(eq(schema.termin.id, id));
      await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'mail', richtung: 'aus', titel: 'Eingangsbestätigung per E-Mail', text: m.text, adminUserId: wer });
      return NextResponse.json({ ok: true, meldung: 'Eingangsbestätigung verschickt.' });
    }

    case 'notiz': {
      const text = txt(b.text, 4000);
      if (!text) return fehler('Notiz ist leer.');
      await aktivitaetLoggen(db(), { kontaktId: k.id, terminId: id, kanal: 'notiz', titel: 'Notiz', text, adminUserId: wer });
      return NextResponse.json({ ok: true, meldung: 'Notiz gespeichert.' });
    }

    default:
      return fehler('Unbekannte Aktion');
  }
}
