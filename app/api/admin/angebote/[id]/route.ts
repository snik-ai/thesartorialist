// Angebot bearbeiten (PATCH), Aktionen (POST: senden, link, annehmen, ablehnen, stornieren, oeffnen, duplizieren), Entwurf löschen.
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { apiAdmin, fehler, jsonBody, txt, UUID } from '@/lib/admin/zugang';
import { aktivitaetLoggen } from '@/lib/crm/kontakte';
import { AblaufFehler, angebotAnnehmen, angebotLinkNeu, leadPhaseSetzen, rechnungErstellen } from '@/lib/crm/ablauf';
import { versionSichern, versionWiederherstellen } from '@/lib/beleg/versionen';
import { belegSprache, datumText } from '@/lib/beleg/texte';
import { mailAngebotIn } from '@/lib/beleg/mails-beleg';
import { naechsteNummer } from '@/lib/crm/nummern';
import { positionenAus, summen } from '@/lib/crm/geld';
import { angebotLink, angebotPdfFuer, basisUrl, tagAus } from '@/lib/admin/belege';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';
import { mailAuftragBestaetigt } from '@/lib/mail-vorlagen';
import type { StilZeileDb } from '@/lib/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type P = { params: Promise<{ id: string }> };

async function laden(id: string) {
  if (!UUID.test(id)) return null;
  const [an] = await db().select().from(schema.angebot).where(eq(schema.angebot.id, id)).limit(1);
  return an ?? null;
}

const stilAus = (v: unknown): StilZeileDb[] | null =>
  Array.isArray(v) && v.length <= 80
    ? v
        .filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === 'object')
        .map((x) => ({ kategorie: txt(x.kategorie, 80), untergruppe: txt(x.untergruppe, 120), option: txt(x.option, 160) }))
        .filter((x) => x.kategorie && x.option)
    : null;

export async function PATCH(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const an = await laden((await params).id);
  if (!an) return fehler('Angebot nicht gefunden', 404);
  if (!['entwurf', 'gesendet'].includes(an.status)) return fehler('Angenommene, abgelehnte oder stornierte Angebote sind gesperrt.', 409);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const set: Partial<typeof schema.angebot.$inferInsert> = { aktualisiertAm: new Date() };
  if ('titel' in b) set.titel = txt(b.titel, 160);
  if ('einleitung' in b) set.einleitung = txt(b.einleitung, 3000) || null;
  if ('schluss' in b) set.schluss = txt(b.schluss, 3000) || null;
  if ('notiz' in b) set.notiz = txt(b.notiz, 3000) || null;
  if ('kontaktId' in b) {
    const kid = txt(b.kontaktId, 40);
    if (kid !== an.kontaktId) {
      if (an.status !== 'entwurf') return fehler('Der Empfänger lässt sich nur im Entwurf ändern.', 409);
      if (!UUID.test(kid)) return fehler('Kontakt ungültig');
      const [k] = await db().select({ id: schema.kontakt.id }).from(schema.kontakt).where(eq(schema.kontakt.id, kid)).limit(1);
      if (!k) return fehler('Kontakt nicht gefunden', 404);
      set.kontaktId = kid;
    }
  }
  if ('datum' in b) {
    const d = tagAus(b.datum);
    if (!d) return fehler('Datum ungültig');
    set.datum = d;
  }
  if ('sprache' in b) set.sprache = belegSprache(txt(b.sprache, 5));
  if ('stilAnhang' in b) set.stilAnhang = b.stilAnhang === true;
  if ('positionen' in b) {
    const p = positionenAus(b.positionen, an.mwstSatz);
    if (!p) return fehler('Positionen ungültig (Bezeichnung, Menge > 0, Preis).');
    set.positionen = p;
  }
  if ('stil' in b) {
    const s = stilAus(b.stil);
    if (!s) return fehler('Stil-Auswahl ungültig');
    set.stil = s;
  }
  if ('stoffe' in b) set.stoffe = Array.isArray(b.stoffe) ? b.stoffe.map((s) => txt(s, 30).toUpperCase()).filter(Boolean).slice(0, 10) : [];
  if ('rabattProzent' in b) {
    const r = Number(b.rabattProzent);
    if (!Number.isFinite(r) || r < 0 || r > 100) return fehler('Rabatt ungültig');
    set.rabattProzent = Math.round(r * 100) / 100;
  }
  if ('rabattRp' in b) {
    const r = Number(b.rabattRp);
    if (!Number.isFinite(r) || r < 0 || r > 100_000_000) return fehler('Rabatt ungültig');
    set.rabattRp = Math.round(r);
  }
  if ('gueltigBis' in b) {
    const d = tagAus(b.gueltigBis);
    if (d === undefined) return fehler('Datum ungültig');
    set.gueltigBis = d;
  }
  const s = summen(set.positionen ?? an.positionen, { rabattProzent: set.rabattProzent ?? an.rabattProzent, rabattRp: set.rabattRp ?? an.rabattRp, mwstSatz: an.mwstSatz });
  set.totalRp = s.totalRp;
  set.mwstRp = s.mwstRp;
  await db().update(schema.angebot).set(set).where(eq(schema.angebot.id, an.id));
  let kontakt: Record<string, unknown> | undefined;
  if (set.kontaktId) {
    const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, set.kontaktId)).limit(1);
    kontakt = { id: k.id, name: k.name, anrede: k.anrede, firma: k.firma, strasse: k.strasse, plz: k.plz, ort: k.ort, land: k.land, email: k.email, telefon: k.telefon, whatsappOk: Boolean(k.einwilligungWhatsapp) && !k.abgemeldet };
    await aktivitaetLoggen(db(), { kontaktId: k.id, kanal: 'system', titel: `Angebot ${an.nummer}: Empfänger gewechselt`, angebotId: an.id, adminUserId: a.s.user.id });
  }
  return NextResponse.json({ ok: true, totalRp: s.totalRp, mwstRp: s.mwstRp, kontakt });
}

export async function DELETE(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const an = await laden((await params).id);
  if (!an) return fehler('Angebot nicht gefunden', 404);
  if (an.status !== 'entwurf') return fehler('Nur Entwürfe können gelöscht werden — gesendete Angebote stornieren.', 409);
  await db().update(schema.aktivitaet).set({ angebotId: null }).where(eq(schema.aktivitaet.angebotId, an.id));
  await db().delete(schema.angebot).where(eq(schema.angebot.id, an.id));
  if (an.kontaktId) await aktivitaetLoggen(db(), { kontaktId: an.kontaktId, kanal: 'system', titel: `Angebot ${an.nummer} (Entwurf) gelöscht`, adminUserId: a.s.user.id });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request, { params }: P) {
  const a = await apiAdmin(req);
  if (!a.ok) return a.antwort;
  const an = await laden((await params).id);
  if (!an || !an.kontaktId) return fehler('Angebot nicht gefunden', 404);
  const b = await jsonBody(req);
  if (!b) return fehler('Ungültige Anfrage');
  const wer = a.s.user.id;
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, an.kontaktId)).limit(1);
  const log = (titel: string, text?: string, kanal: 'system' | 'mail' = 'system') => aktivitaetLoggen(db(), { kontaktId: k.id, kanal, richtung: kanal === 'mail' ? 'aus' : 'intern', titel, text, angebotId: an.id, adminUserId: wer });

  try {
    switch (b.aktion) {
      case 'senden':
      case 'link': {
        if (!['entwurf', 'gesendet'].includes(an.status)) return fehler('Dieses Angebot kann nicht mehr gesendet werden.', 409);
        if (!an.positionen.length) return fehler('Bitte zuerst Positionen erfassen.');
        if (an.totalRp <= 0) return fehler('Das Total ist 0 — bitte Preise eintragen.');
        const mitMail = b.aktion === 'senden' && b.mail !== false;
        if (mitMail && !k.email) return fehler('Keine E-Mail-Adresse beim Kontakt — Link kopieren und per WhatsApp/SMS senden.');
        if (mitMail && !mailBereit()) return fehler('E-Mail-Versand ist nicht konfiguriert — Link kopieren und selbst senden.', 503);
        const token = await angebotLinkNeu(db(), an.id);
        const link = angebotLink(basisUrl(req), token);
        const jetzt = new Date();
        await versionSichern(db(), 'angebot', an, 'gesendet', wer);
        await db().update(schema.angebot).set({ status: 'gesendet', gesendetAm: an.gesendetAm ?? jetzt, aktualisiertAm: jetzt }).where(eq(schema.angebot.id, an.id));
        await leadPhaseSetzen(db(), k.id, 'angebot');
        if (mitMail) {
          const pdf = await angebotPdfFuer(an.id, link);
          const m = mailAngebotIn(an.sprache, { name: k.name, anrede: k.anrede, nummer: an.nummer ?? '', titel: an.titel, totalRp: an.totalRp, gueltigBis: datumText(an.gueltigBis, an.sprache), link, nachricht: txt(b.nachricht, 1500) || undefined });
          try {
            await sendeMail({ to: k.email!, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger(), anhaenge: pdf ? [{ filename: pdf.datei, content: pdf.buf.toString('base64') }] : undefined });
          } catch (err) {
            console.error('[angebot] Mail', (err as Error).message);
            await log(`Angebot ${an.nummer}: Link erstellt, E-Mail fehlgeschlagen`);
            return NextResponse.json({ ok: true, link, mailFehler: true, meldung: 'Link erstellt, aber die E-Mail konnte nicht gesendet werden.' });
          }
          await log(`Angebot ${an.nummer} per E-Mail gesendet`, m.text, 'mail');
          return NextResponse.json({ ok: true, link, meldung: 'Angebot mit PDF und Annahme-Link verschickt.' });
        }
        await log(`Angebot ${an.nummer}: Annahme-Link erstellt`, 'Zum Teilen per WhatsApp, SMS oder eigener E-Mail. Frühere Links sind ungültig.');
        return NextResponse.json({ ok: true, link, meldung: 'Neuer Annahme-Link erstellt (frühere Links sind ungültig).' });
      }

      case 'annehmen': {
        const name = txt(b.name, 120) || k.name;
        const r = await angebotAnnehmen(an.id, { name, weg: 'atelier', adminId: wer });
        if (!r.schon && b.mail === true && k.email && mailBereit()) {
          const m = mailAuftragBestaetigt({ name: k.name, anrede: k.anrede, angebotNummer: an.nummer ?? '', auftragNummer: r.nummer ?? '', titel: an.titel, totalRp: an.totalRp });
          await sendeMail({ to: k.email, subject: m.subject, text: m.text, html: m.html, replyTo: empfaenger() }).then(
            () => aktivitaetLoggen(db(), { kontaktId: k.id, kanal: 'mail', richtung: 'aus', titel: `Auftragsbestätigung ${r.nummer} per E-Mail`, text: m.text, auftragId: r.auftragId, adminUserId: wer }),
            (err) => console.error('[angebot] Bestätigung', (err as Error).message),
          );
        }
        return NextResponse.json({ ok: true, auftragId: r.auftragId, meldung: `Angenommen — Auftrag ${r.nummer} eröffnet, Kontakt ist jetzt Kunde.` });
      }

      case 'ablehnen': {
        if (!['entwurf', 'gesendet'].includes(an.status)) return fehler('Nicht möglich', 409);
        const grund = txt(b.grund, 500) || null;
        await db().update(schema.angebot).set({ status: 'abgelehnt', abgelehntAm: new Date(), abgelehntGrund: grund, tokenHash: null, aktualisiertAm: new Date() }).where(eq(schema.angebot.id, an.id));
        await log(`Angebot ${an.nummer} abgelehnt`, grund ?? undefined);
        if (b.verloren === true && k.status === 'lead') await db().update(schema.kontakt).set({ leadPhase: 'verloren', verlorenGrund: grund, aktualisiertAm: new Date() }).where(eq(schema.kontakt.id, k.id));
        return NextResponse.json({ ok: true, meldung: 'Als abgelehnt markiert.' });
      }

      case 'stornieren': {
        if (an.status === 'angenommen') return fehler('Angenommene Angebote: den Auftrag stornieren.', 409);
        await db().update(schema.angebot).set({ status: 'storniert', tokenHash: null, aktualisiertAm: new Date() }).where(eq(schema.angebot.id, an.id));
        await log(`Angebot ${an.nummer} storniert`);
        return NextResponse.json({ ok: true, meldung: 'Storniert, der Annahme-Link ist ungültig.' });
      }

      case 'oeffnen': {
        if (!['abgelehnt', 'storniert'].includes(an.status)) return fehler('Nicht möglich', 409);
        await db().update(schema.angebot).set({ status: 'entwurf', abgelehntAm: null, abgelehntGrund: null, aktualisiertAm: new Date() }).where(eq(schema.angebot.id, an.id));
        await log(`Angebot ${an.nummer} wieder geöffnet`);
        return NextResponse.json({ ok: true, meldung: 'Wieder als Entwurf geöffnet.' });
      }

      case 'duplizieren': {
        const nummer = await naechsteNummer(db(), 'AN');
        const { id: _id, nummer: _n, tokenHash: _t, gesendetAm: _g, angesehenAm: _s, angenommenAm: _a, angenommenName: _an, angenommenWeg: _w, abgelehntAm: _ab, abgelehntGrund: _ag, erstelltAm: _e, aktualisiertAm: _u, ...rest } = an;
        void [_id, _n, _t, _g, _s, _a, _an, _w, _ab, _ag, _e, _u];
        const [neu] = await db()
          .insert(schema.angebot)
          .values({ ...rest, nummer, status: 'entwurf', version: 1, angesehenAnzahl: 0, datum: new Date(), gueltigBis: new Date(Date.now() + 30 * 86400_000), erstelltVon: wer })
          .returning({ id: schema.angebot.id });
        await log(`Angebot ${nummer} als Kopie von ${an.nummer} erstellt`);
        return NextResponse.json({ ok: true, id: neu.id, meldung: `Kopie ${nummer} erstellt.` });
      }

      case 'version': {
        const nr = await versionSichern(db(), 'angebot', an, 'manuell', wer);
        await log(`Angebot ${an.nummer}: Version ${nr} gesichert`);
        return NextResponse.json({ ok: true, meldung: `Version ${nr} gesichert.` });
      }

      case 'wiederherstellen': {
        if (!['entwurf', 'gesendet'].includes(an.status)) return fehler('Angenommene, abgelehnte oder stornierte Angebote sind gesperrt.', 409);
        const nr = await versionWiederherstellen('angebot', an, txt(b.versionId, 40), wer);
        if (nr === null) return fehler('Version nicht gefunden', 404);
        await log(`Angebot ${an.nummer}: Version ${nr} wiederhergestellt`);
        return NextResponse.json({ ok: true, meldung: `Version ${nr} geladen – der vorherige Stand ist als Version gesichert.` });
      }

      case 'rechnung': {
        // Angebot → Auftrag → Rechnung mit einem Klick
        let auftragId: string | null = null;
        if (an.status !== 'angenommen') {
          if (!an.positionen.length || an.totalRp <= 0) return fehler('Bitte zuerst Positionen mit Preis erfassen.');
          const r = await angebotAnnehmen(an.id, { name: k.name, weg: 'atelier', adminId: wer });
          auftragId = r.auftragId;
        } else {
          const [au] = await db().select({ id: schema.auftrag.id }).from(schema.auftrag).where(eq(schema.auftrag.angebotId, an.id)).limit(1);
          auftragId = au?.id ?? null;
        }
        if (!auftragId) return fehler('Kein Auftrag zum Angebot gefunden.', 404);
        const re = await rechnungErstellen({ auftragId, art: 'rechnung', adminId: wer });
        return NextResponse.json({ ok: true, auftragId, rechnungId: re.id, meldung: `Rechnung ${re.nummer} erstellt (Entwurf).` });
      }

      default:
        return fehler('Unbekannte Aktion');
    }
  } catch (err) {
    if (err instanceof AblaufFehler) return fehler(err.message, err.status);
    throw err;
  }
}
