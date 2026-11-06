// Rechnung: Entwurf bearbeiten (PATCH), Aktionen (POST: festschreiben, senden, zahlung, zahlung-loeschen, stornieren), Entwurf löschen.
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { auftragAbschliessenWennBezahlt, rechnungNachrechnen } from '@/lib/crm/ablauf';
import { chf, positionenAus, summen } from '@/lib/crm/geld';
import { firma } from '@/lib/crm/firma';
import { RECHNUNG_ART, ZAHLUNG_ART } from '@/lib/crm/belege';
import { rechnungPdfFuer, tagAus } from '@/lib/admin/belege';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { mailRechnung } from '@/lib/mail-vorlagen';
import { TZ } from '@/lib/zeit';
import type { ZahlungArt } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

async function laden(id: string) {
  if (!UUID.test(id)) return null;
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, id)).limit(1);
  return r ?? null;
}

export async function PATCH(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const r = await laden((await params).id);
  if (!r) return fehler('Rechnung nicht gefunden', 404);
  if (r.status !== 'entwurf') return fehler('Versendete Rechnungen sind festgeschrieben — stornieren und neu erstellen.', 409);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const set: Partial<typeof schema.rechnung.$inferInsert> = { aktualisiertAm: new Date() };
  if ('titel' in b) set.titel = txt(b.titel, 160);
  if ('einleitung' in b) set.einleitung = txt(b.einleitung, 3000) || null;
  if ('schluss' in b) set.schluss = txt(b.schluss, 3000) || null;
  if ('positionen' in b) {
    const p = positionenAus(b.positionen);
    if (!p || !p.length) return fehler('Positionen ungültig');
    set.positionen = p;
  }
  if ('rabattProzent' in b) {
    const x = Number(b.rabattProzent);
    if (!Number.isFinite(x) || x < 0 || x > 100) return fehler('Rabatt ungültig');
    set.rabattProzent = x;
  }
  if ('rabattRp' in b) {
    const x = Number(b.rabattRp);
    if (!Number.isFinite(x) || x < 0) return fehler('Rabatt ungültig');
    set.rabattRp = Math.round(x);
  }
  for (const feld of ['rechnungsdatum', 'faelligAm'] as const) {
    if (!(feld in b)) continue;
    const d = tagAus(b[feld]);
    if (!d) return fehler('Datum ungültig');
    set[feld] = d;
  }
  const s = summen(set.positionen ?? r.positionen, { rabattProzent: set.rabattProzent ?? r.rabattProzent, rabattRp: set.rabattRp ?? r.rabattRp, mwstSatz: r.mwstSatz });
  set.totalRp = s.totalRp;
  set.mwstRp = s.mwstRp;
  set.betragRp = Math.max(0, s.totalRp - r.abzug.reduce((x, z) => x + z.betragRp, 0));
  await db().update(schema.rechnung).set(set).where(eq(schema.rechnung.id, r.id));
  return NextResponse.json({ ok: true, totalRp: s.totalRp, betragRp: set.betragRp });
}

export async function DELETE(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const r = await laden((await params).id);
  if (!r) return fehler('Rechnung nicht gefunden', 404);
  if (r.status !== 'entwurf') return fehler('Nur Entwürfe können gelöscht werden.', 409);
  await db().update(schema.aktivitaet).set({ rechnungId: null }).where(eq(schema.aktivitaet.rechnungId, r.id));
  await db().delete(schema.rechnung).where(eq(schema.rechnung.id, r.id));
  if (r.kontaktId) await aktivitaetLoggen(db(), { kontaktId: r.kontaktId, kanal: 'system', titel: `Rechnung ${r.nummer} (Entwurf) gelöscht`, auftragId: r.auftragId, adminUserId: a.s.user.id });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const r = await laden((await params).id);
  if (!r || !r.kontaktId) return fehler('Rechnung nicht gefunden', 404);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const wer = a.s.user.id;
  const log = (titel: string, text?: string, kanal: 'system' | 'mail' = 'system') => aktivitaetLoggen(db(), { kontaktId: r.kontaktId!, kanal, richtung: kanal === 'mail' ? 'aus' : 'intern', titel, text, rechnungId: r.id, auftragId: r.auftragId, adminUserId: wer });

  switch (b.aktion) {
    case 'festschreiben':
    case 'senden': {
      if (r.status === 'storniert') return fehler('Storniert', 409);
      if (r.status === 'entwurf') {
        if (!r.positionen.length || r.totalRp <= 0) return fehler('Die Rechnung hat keinen Betrag.');
        const f = await firma();
        if (!f.iban.trim() && !f.qrIban.trim()) return fehler('Bitte zuerst IBAN oder QR-IBAN unter Einstellungen › Firma erfassen (für den QR-Zahlteil).');
        await db().update(schema.rechnung).set({ status: 'offen', aktualisiertAm: new Date() }).where(eq(schema.rechnung.id, r.id));
        await rechnungNachrechnen(db(), r.id);
      }
      if (b.aktion === 'festschreiben') {
        await log(`${RECHNUNG_ART[r.art]} ${r.nummer} festgeschrieben (offen)`);
        return NextResponse.json({ ok: true, meldung: 'Festgeschrieben — als offen verbucht.' });
      }
      const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1);
      if (!k.email) return fehler('Keine E-Mail-Adresse — PDF herunterladen und selbst senden.');
      if (!mailBereit()) return fehler('E-Mail-Versand ist nicht konfiguriert — PDF herunterladen und selbst senden.', 503);
      const pdf = await rechnungPdfFuer(r.id);
      const m = mailRechnung({ name: k.name, anrede: k.anrede, nummer: r.nummer ?? '', art: r.art, titel: r.titel, betragRp: Math.max(0, r.betragRp - r.bezahltRp), faellig: r.faelligAm?.toLocaleDateString('de-CH', { timeZone: TZ }), nachricht: txt(b.nachricht, 1500) || undefined });
      try {
        await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger(), anhaenge: pdf ? [{ filename: pdf.datei, content: pdf.buf.toString('base64') }] : undefined });
      } catch (err) {
        console.error('[rechnung] Mail', (err as Error).message);
        return fehler('Die E-Mail konnte nicht gesendet werden.', 502);
      }
      await db().update(schema.rechnung).set({ gesendetAm: new Date() }).where(eq(schema.rechnung.id, r.id));
      await log(`${RECHNUNG_ART[r.art]} ${r.nummer} per E-Mail gesendet`, m.text, 'mail');
      return NextResponse.json({ ok: true, meldung: 'Rechnung mit QR-Zahlteil verschickt.' });
    }

    case 'zahlung': {
      if (!['offen', 'teilbezahlt', 'bezahlt'].includes(r.status)) return fehler('Zahlungen nur auf festgeschriebenen Rechnungen.', 409);
      const betrag = Math.round(Number(b.betragRp));
      if (!Number.isFinite(betrag) || betrag === 0 || Math.abs(betrag) > 100_000_000) return fehler('Betrag ungültig');
      const datum = tagAus(b.datum ?? null) ?? new Date();
      const art = (Object.keys(ZAHLUNG_ART) as ZahlungArt[]).includes(b.art as ZahlungArt) ? (b.art as ZahlungArt) : 'bank';
      await db().insert(schema.zahlung).values({ rechnungId: r.id, betragRp: betrag, datum, art, notiz: txt(b.notiz, 300) || null, adminUserId: wer });
      const neu = await rechnungNachrechnen(db(), r.id);
      await log(`Zahlung ${chf(betrag)} (${ZAHLUNG_ART[art]}) auf ${r.nummer}`, neu?.status === 'bezahlt' ? 'Rechnung vollständig bezahlt.' : undefined);
      let meldung = neu?.status === 'bezahlt' ? 'Zahlung erfasst — Rechnung bezahlt.' : 'Zahlung erfasst.';
      if (neu?.status === 'bezahlt' && r.auftragId && (await auftragAbschliessenWennBezahlt(r.auftragId, wer))) meldung += ' Auftrag abgeschlossen.';
      return NextResponse.json({ ok: true, meldung, status: neu?.status });
    }

    case 'zahlung-loeschen': {
      const zid = txt(b.zahlungId, 40);
      if (!UUID.test(zid)) return fehler('Ungültig');
      await db().delete(schema.zahlung).where(and(eq(schema.zahlung.id, zid), eq(schema.zahlung.rechnungId, r.id)));
      await rechnungNachrechnen(db(), r.id);
      await log(`Zahlung auf ${r.nummer} entfernt`);
      return NextResponse.json({ ok: true, meldung: 'Zahlung entfernt.' });
    }

    case 'stornieren': {
      if (r.status === 'storniert') return NextResponse.json({ ok: true });
      if (r.bezahltRp > 0) return fehler('Bitte zuerst die Zahlungen entfernen oder erstatten.', 409);
      await db().update(schema.rechnung).set({ status: 'storniert', storniertAm: new Date(), aktualisiertAm: new Date() }).where(eq(schema.rechnung.id, r.id));
      await log(`${RECHNUNG_ART[r.art]} ${r.nummer} storniert`, txt(b.grund, 300) || undefined);
      return NextResponse.json({ ok: true, meldung: 'Storniert.' });
    }

    default:
      return fehler('Unbekannte Aktion');
  }
}
