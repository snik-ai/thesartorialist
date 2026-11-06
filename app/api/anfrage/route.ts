// Formular-Eingang: Terminanfrage und Rückrufbitte.
// 1. Speichert Kontakt (Golden Record über E-Mail/Telefon) und Termin bzw. Rückruf in der DB (Backend /admin).
// 2. Sendet die Anfrage über Resend an das Atelier (Antworten gehen direkt an den Kunden) und
//    schickt dem Kunden eine Bestätigung (falls E-Mail angegeben).
// 3. Meldet den Lead an das DLM-Cockpit.
// 4. Web-Push an alle aktiven Admins (nach der Antwort, blockiert nie; lib/admin/push.ts).
// Gespeichert, aber Resend fehlt/scheitert → trotzdem 200 (Mail wird aus dem Admin nachgeholt).
// Weder DB noch Resend → 503, das Formular öffnet dann wie bisher das Mailprogramm.
import { after, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { pushNeueAnfrage } from '@/lib/admin/push';
import { db, dbBereit, schema } from '@/lib/db';
import { aktivitaetLoggen, kontaktAufnehmen } from '@/lib/crm/kontakte';
import { zuerich } from '@/lib/zeit';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { icsDatei, mailRueckruf, mailTerminAtelier, mailTerminKunde, type StilZeile } from '@/lib/mail-vorlagen';
import { reportDlmLead } from '@/lib/dlm-px';
import { kundenTexte, stilFuer, terminTextFuer } from '@/lib/i18n/kundenmail';

export const runtime = 'nodejs';

// Einfache Drosselung pro IP (im Speicher): max. 5 Anfragen in 10 Minuten
const treffer = new Map<string, number[]>();
function gedrosselt(ip: string) {
  const jetzt = Date.now();
  const liste = (treffer.get(ip) ?? []).filter((t) => jetzt - t < 10 * 60_000);
  liste.push(jetzt);
  treffer.set(ip, liste);
  return liste.length > 5;
}

const text = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const telOk = (t: string) => t.replace(/\D/g, '').length >= 9;

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false, fehler: 'Ungültige Anfrage' }, { status: 400 });
  }
  // Honeypot: von Menschen unsichtbar, Bots füllen es aus → still «erfolgreich»
  if (text(b.website)) return NextResponse.json({ ok: true });

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unbekannt';
  if (gedrosselt(ip)) return NextResponse.json({ ok: false, fehler: 'Zu viele Anfragen, bitte später nochmals.' }, { status: 429 });

  const art = b.art === 'rueckruf' ? 'rueckruf' : b.art === 'termin' ? 'termin' : null;
  if (!art) return NextResponse.json({ ok: false, fehler: 'Unbekannte Anfrage' }, { status: 400 });

  const name = text(b.name, 120);
  const email = text(b.email, 200);
  const tel = text(b.telefon, 40);
  const wunsch = text(b.wunsch, 200); // lesbarer Wunschtermin bzw. Zeitfenster
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(text(b.datum, 10)) ? text(b.datum, 10) : undefined;
  const zeit = /^\d{1,2}:\d{2}$/.test(text(b.zeit, 5)) ? text(b.zeit, 5).padStart(5, '0') : undefined;
  // Stil-Auswahl: deutsche Bezeichnungen (Atelier, Backend) plus IDs (Kundenmail in Kundensprache)
  const id = (v: unknown) => (/^[a-z0-9-]{1,80}$/.test(text(v, 80)) ? text(v, 80) : undefined);
  const stilRoh = Array.isArray(b.stil)
    ? (b.stil as unknown[]).slice(0, 80).map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return { kategorie: text(o.kategorie, 60), untergruppe: text(o.untergruppe, 120), option: text(o.option, 160), kategorieId: id(o.kategorieId), untergruppeId: id(o.untergruppeId), optionId: id(o.optionId) };
      }).filter((x) => x.kategorie && x.option)
    : [];
  const stil: StilZeile[] = stilRoh.map(({ kategorie, untergruppe, option }) => ({ kategorie, untergruppe, option }));
  const stoffe = Array.isArray(b.stoffe) ? (b.stoffe as unknown[]).map((x) => text(x, 20)).filter((x) => /^[A-Z0-9-]{3,20}$/i.test(x)).slice(0, 12) : [];
  const sid = text(b._dlmsid, 80) || undefined;
  if (art === 'termin' && (!name || !emailOk(email) || !telOk(tel))) {
    return NextResponse.json({ ok: false, fehler: 'Bitte Name, E-Mail und Telefon angeben.' }, { status: 400 });
  }
  if (art === 'rueckruf' && !telOk(tel)) {
    return NextResponse.json({ ok: false, fehler: 'Bitte eine gültige Telefonnummer angeben.' }, { status: 400 });
  }
  // Zusatzfelder (falls das Formular sie mitsendet): Firma, erkannte Marken-Domain, Einwilligung WhatsApp/SMS
  const firma = text(b.firma, 160);
  const brandRoh = text(b.brandDomain, 120).toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const brandDomain = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(brandRoh) ? brandRoh : '';
  const einwText = typeof b.einwilligung === 'string' ? text(b.einwilligung, 400) : text(b.einwilligungText, 400);
  const einwilligung = b.einwilligung === true || (typeof b.einwilligung === 'string' && einwText) ? { text: einwText || 'Einwilligung WhatsApp/SMS', pfad: text(b.pfad, 120) || (art === 'termin' ? '/termin/' : '/') } : null;
  const sprache = /^(de|en|fr|it|es|pt|ru|sr|sq)$/.test(text(b.sprache, 2)) ? text(b.sprache, 2) : 'de';

  // 1. Speichern (Backend). Fehler hier blockieren den Mailversand nicht.
  let terminId: string | null = null;
  if (dbBereit()) {
    try {
      terminId = await db().transaction(async (tx) => {
        const k = await kontaktAufnehmen(tx, {
          name,
          email: emailOk(email) ? email : undefined,
          telefon: tel || undefined,
          firma: firma || undefined,
          brandDomain: brandDomain || undefined,
          sprache,
          quelle: art === 'termin' ? 'formular:termin' : 'formular:rueckruf',
          einwilligung,
        });
        const [t] = await tx
          .insert(schema.termin)
          .values({
            kontaktId: k.id,
            art,
            wunschStart: art === 'termin' && datum && zeit ? zuerich(datum, zeit) : null,
            wunschText: wunsch || (art === 'termin' ? 'nach Absprache' : 'egal'),
            stil,
            stoffe,
            quelle: text(b.pfad, 120) || (art === 'termin' ? '/termin/' : '/'),
            sprache,
          })
          .returning({ id: schema.termin.id });
        await aktivitaetLoggen(tx, {
          kontaktId: k.id,
          terminId: t.id,
          kanal: 'formular',
          richtung: 'ein',
          titel: art === 'termin' ? `Terminanfrage: ${wunsch || 'nach Absprache'}` : `Rückrufbitte${wunsch ? ` (${wunsch})` : ''}`,
          text: [stil.length ? `Stil-Auswahl: ${stil.length} Details` : '', stoffe.length ? `Stoff: ${stoffe.join(', ')}` : '', einwilligung ? `Einwilligung WhatsApp/SMS: ${einwilligung.text}` : '', k.abweichend.length ? `Abweichende Angaben (nicht übernommen): ${k.abweichend.join(', ')}` : '']
            .filter(Boolean)
            .join('\n') || null,
          daten: { neuerKontakt: k.neu },
        });
        return t.id;
      });
    } catch (err) {
      console.error('[anfrage] Speichern fehlgeschlagen', (err as Error).message);
    }
  }
  const gespeichert = Boolean(terminId);
  // Push an alle aktiven Admins — nach der Antwort (after), mit Timeout, Fehler nur im Log
  if (terminId) {
    const id = terminId;
    after(() => pushNeueAnfrage({ terminId: id, art, name, wunsch, mitStil: stil.length > 0 || stoffe.length > 0 }));
  }
  const markiere = async (feld: 'atelierMailAm' | 'eingangMailAm') => {
    if (terminId) await db().update(schema.termin).set({ [feld]: new Date() }).where(eq(schema.termin.id, terminId)).catch(() => {});
  };

  if (!mailBereit()) {
    if (!gespeichert) return NextResponse.json({ ok: false, fehler: 'Versand nicht konfiguriert' }, { status: 503 });
    void reportDlmLead({ kind: art, path: art === 'termin' ? '/termin/' : text(b.pfad, 120) || '/', sid, label: art === 'termin' ? 'Termin' : 'Rückruf' });
    return NextResponse.json({ ok: true });
  }

  try {
    if (art === 'termin') {
      const d = { name, email: emailOk(email) ? email : undefined, telefon: tel || undefined, datum, zeit, wunschText: wunsch || 'nach Absprache', stil, stoffe, firma: firma || undefined, brandDomain: brandDomain || undefined, einwilligung: !!einwilligung };
      const atelier = mailTerminAtelier(d);
      const icsA = icsDatei(d, 'atelier');
      await sendeMail({ to: empfaenger(), subject: atelier.subject, text: atelier.text, html: atelier.html, replyTo: d.email, anhaenge: icsA ? [{ filename: 'Termin.ics', content: icsA }] : undefined });
      await markiere('atelierMailAm');
      if (d.email) {
        // Bestätigung in der Sprache des Kunden (Website-Sprache des Formulars)
        const k = kundenTexte(sprache);
        const dk = { ...d, wunschText: terminTextFuer(sprache, datum && zeit ? zuerich(datum, zeit) : null, d.wunschText), stil: stilFuer(sprache, stilRoh) };
        const kunde = mailTerminKunde(dk, k.t);
        const icsK = icsDatei(dk, 'kunde', 'TENTATIVE', k.t);
        // Bestätigung: Fehler hier blockieren die Anfrage nicht
        await sendeMail({ to: d.email, subject: kunde.subject, text: kunde.text, html: kunde.html, replyTo: empfaenger(), anhaenge: icsK ? [{ filename: 'Termin.ics', content: icsK }] : undefined })
          .then(() => markiere('eingangMailAm'))
          .catch((err) => console.warn('[anfrage] Bestätigung fehlgeschlagen', err));
      }
    } else {
      const m = mailRueckruf({ name, telefon: tel, wunsch, pfad: text(b.pfad, 120) || '/' });
      await sendeMail({ to: empfaenger(), subject: m.subject, text: m.text, html: m.html });
      await markiere('atelierMailAm');
    }
  } catch (err) {
    console.error('[anfrage] Versand fehlgeschlagen', err);
    // Gespeichert ist die Anfrage trotzdem — im Backend sichtbar, Mail lässt sich dort nachholen
    if (!gespeichert) return NextResponse.json({ ok: false, fehler: 'Versand fehlgeschlagen' }, { status: 502 });
  }

  void reportDlmLead({ kind: art, path: art === 'termin' ? '/termin/' : text(b.pfad, 120) || '/', sid, label: art === 'termin' ? (stil.length || stoffe.length ? 'Termin mit Stil-Auswahl' : 'Termin') : 'Rückruf' });

  return NextResponse.json({ ok: true });
}
