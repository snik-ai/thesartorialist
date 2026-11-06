// Öffentlich: Angebot online annehmen (Name + Bestätigung) oder Rückfrage/Ablehnung. Gedrosselt, nur mit gültigem Token.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, dbBereit, schema } from '@/lib/db';
import { clientIp } from '@/lib/admin/sicherheit';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { AblaufFehler, angebotAnnehmen } from '@/lib/crm/ablauf';
import { angebotGedrosselt, angebotPerToken } from '@/lib/crm/angebot-oeffentlich';
import { basisUrl } from '@/lib/admin/belege';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { mailAngebotAngenommenAtelier, mailAuftragBestaetigt } from '@/lib/mail-vorlagen';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const kopf = { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' };
const antwort = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: kopf });

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!dbBereit()) return antwort({ fehler: 'Derzeit nicht verfügbar' }, 503);
  if (angebotGedrosselt(clientIp(req))) return antwort({ fehler: 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.' }, 429);
  // Nur von der eigenen Seite (CSRF)
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (origin && new URL(origin).host !== host) return antwort({ fehler: 'Ungültige Herkunft' }, 403);

  const { token } = await params;
  const t = await angebotPerToken(token);
  if (!t) return antwort({ fehler: 'Dieser Link ist ungültig oder nicht mehr aktiv.' }, 404);
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof b?.name === 'string' ? b.name.trim().slice(0, 120) : '';

  if (b?.aktion === 'annehmen') {
    if (name.length < 3) return antwort({ fehler: 'Bitte geben Sie Ihren vollständigen Namen ein.' }, 400);
    if (b.bestaetigt !== true) return antwort({ fehler: 'Bitte bestätigen Sie die verbindliche Annahme.' }, 400);
    try {
      const r = await angebotAnnehmen(t.a.id, { name, weg: 'online' });
      if (!r.schon && mailBereit()) {
        const basis = basisUrl(req);
        const mails = [];
        if (t.k.email) {
          const m = mailAuftragBestaetigt({ name: t.k.name, anrede: t.k.anrede, angebotNummer: t.a.nummer ?? '', auftragNummer: r.nummer ?? '', titel: t.a.titel, totalRp: t.a.totalRp });
          mails.push(
            sendeMail({ to: t.k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger() }).then(() =>
              aktivitaetLoggen(db(), { kontaktId: t.k.id, kanal: 'mail', richtung: 'aus', titel: `Auftragsbestätigung ${r.nummer} per E-Mail`, text: m.text, auftragId: r.auftragId }),
            ),
          );
        }
        const at = mailAngebotAngenommenAtelier({ name: t.k.name, angebotNummer: t.a.nummer ?? '', auftragNummer: r.nummer ?? '', titel: t.a.titel, totalRp: t.a.totalRp, link: `${basis}/admin/auftraege/${r.auftragId}/` });
        mails.push(sendeMail({ to: empfaenger(), subject: at.subject, text: at.text, html: at.html }));
        await Promise.allSettled(mails).then((e) => e.forEach((x) => x.status === 'rejected' && console.error('[angebot] Annahme-Mail', String(x.reason))));
      }
      return antwort({ ok: true });
    } catch (err) {
      if (err instanceof AblaufFehler) return antwort({ fehler: err.message }, err.status);
      throw err;
    }
  }

  if (b?.aktion === 'frage') {
    const text = typeof b.text === 'string' ? b.text.trim().slice(0, 2000) : '';
    if (!text) return antwort({ fehler: 'Bitte schreiben Sie Ihre Frage.' }, 400);
    await aktivitaetLoggen(db(), { kontaktId: t.k.id, kanal: 'formular', richtung: 'ein', titel: `Rückfrage zum Angebot ${t.a.nummer}`, text, angebotId: t.a.id });
    if (mailBereit())
      await sendeMail({ to: empfaenger(), subject: `Rückfrage zum Angebot ${t.a.nummer} — ${t.k.name}`, text: `${t.k.name} (${t.k.email ?? t.k.telefon ?? ''}) schreibt zum Angebot ${t.a.nummer}:\n\n${text}`, html: `<p>${t.k.name} schreibt zum Angebot ${t.a.nummer}:</p><p style="white-space:pre-line">${text.replace(/</g, '&lt;')}</p>`, replyTo: t.k.email ?? undefined }).catch((e) => console.error('[angebot] Frage-Mail', (e as Error).message));
    return antwort({ ok: true });
  }

  if (b?.aktion === 'ablehnen') {
    if (t.a.status !== 'gesendet') return antwort({ fehler: 'Nicht möglich.' }, 409);
    const grund = typeof b.grund === 'string' ? b.grund.trim().slice(0, 500) : '';
    await db().update(schema.angebot).set({ status: 'abgelehnt', abgelehntAm: new Date(), abgelehntGrund: grund ? `Online: ${grund}` : 'Online abgelehnt', aktualisiertAm: new Date() }).where(eq(schema.angebot.id, t.a.id));
    await aktivitaetLoggen(db(), { kontaktId: t.k.id, kanal: 'formular', richtung: 'ein', titel: `Angebot ${t.a.nummer} online abgelehnt`, text: grund || null, angebotId: t.a.id });
    return antwort({ ok: true });
  }

  return antwort({ fehler: 'Unbekannte Aktion' }, 400);
}
