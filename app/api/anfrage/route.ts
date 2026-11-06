// Formular-Eingang: Terminanfrage und Rückrufbitte.
// Sendet die Anfrage über Resend an das Atelier (Antworten gehen direkt an den Kunden),
// schickt dem Kunden eine Bestätigung (falls E-Mail angegeben) und meldet den Lead
// an das DLM-Cockpit. Ohne Resend-Konfiguration antwortet die Route mit 503 —
// das Formular öffnet dann wie bisher das Mailprogramm.
import { NextResponse } from 'next/server';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { icsDatei, mailRueckruf, mailTerminAtelier, mailTerminKunde, type StilZeile } from '@/lib/mail-vorlagen';
import { reportDlmLead } from '@/lib/dlm-px';

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
  const stil: StilZeile[] = Array.isArray(b.stil)
    ? (b.stil as unknown[]).slice(0, 80).map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return { kategorie: text(o.kategorie, 60), untergruppe: text(o.untergruppe, 120), option: text(o.option, 160) };
      }).filter((x) => x.kategorie && x.option)
    : [];
  const stoffe = Array.isArray(b.stoffe) ? (b.stoffe as unknown[]).map((x) => text(x, 20)).filter((x) => /^[A-Z0-9-]{3,20}$/i.test(x)).slice(0, 12) : [];
  const sid = text(b._dlmsid, 80) || undefined;
  // Lead-Formular-Standard: Firma (vorgeschlagen aus der Firmenerkennung), erkannte Domain, Einwilligung WhatsApp/SMS
  const firma = text(b.firma, 120) || undefined;
  const brandDomain = /^(?=.{4,120}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(text(b.brandDomain, 120).toLowerCase()) ? text(b.brandDomain, 120).toLowerCase() : undefined;
  const einwilligung = b.einwilligung === true;
  // Wortlaut der Einwilligung (Nachweis), für die Speicherung in der Datenbank
  const einwilligungText = einwilligung ? text(b.einwilligungText, 300) || undefined : undefined;

  if (art === 'termin' && (!name || !emailOk(email) || !telOk(tel))) {
    return NextResponse.json({ ok: false, fehler: 'Bitte Name, E-Mail und Telefon angeben.' }, { status: 400 });
  }
  if (art === 'rueckruf' && !telOk(tel)) {
    return NextResponse.json({ ok: false, fehler: 'Bitte eine gültige Telefonnummer angeben.' }, { status: 400 });
  }
  if (!mailBereit()) return NextResponse.json({ ok: false, fehler: 'Versand nicht konfiguriert' }, { status: 503 });

  try {
    if (art === 'termin') {
      const d = { name, email: emailOk(email) ? email : undefined, telefon: tel || undefined, datum, zeit, wunschText: wunsch || 'nach Absprache', stil, stoffe, firma, brandDomain, einwilligung };
      const atelier = mailTerminAtelier(d);
      const icsA = icsDatei(d, 'atelier');
      await sendeMail({ to: empfaenger(), subject: atelier.subject, text: atelier.text, html: atelier.html, replyTo: d.email, anhaenge: icsA ? [{ filename: 'Termin.ics', content: icsA }] : undefined });
      if (d.email) {
        const kunde = mailTerminKunde(d);
        const icsK = icsDatei(d, 'kunde');
        // Bestätigung: Fehler hier blockieren die Anfrage nicht
        await sendeMail({ to: d.email, subject: kunde.subject, text: kunde.text, html: kunde.html, replyTo: empfaenger(), anhaenge: icsK ? [{ filename: 'Termin.ics', content: icsK }] : undefined }).catch((err) =>
          console.warn('[anfrage] Bestätigung fehlgeschlagen', err),
        );
      }
    } else {
      const m = mailRueckruf({ name, telefon: tel, wunsch, pfad: text(b.pfad, 120) || '/' });
      await sendeMail({ to: empfaenger(), subject: m.subject, text: m.text, html: m.html });
    }
  } catch (err) {
    console.error('[anfrage] Versand fehlgeschlagen', err);
    return NextResponse.json({ ok: false, fehler: 'Versand fehlgeschlagen' }, { status: 502 });
  }

  void reportDlmLead({ kind: art, path: art === 'termin' ? '/termin/' : text(b.pfad, 120) || '/', sid, label: art === 'termin' ? (stil.length || stoffe.length ? 'Termin mit Stil-Auswahl' : 'Termin') : 'Rückruf' });

  return NextResponse.json({ ok: true });
}
