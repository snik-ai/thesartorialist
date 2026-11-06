// Mahnwesen serverseitig: Mahnung zu einer Rechnung erstellen (Zahlungserinnerung, 1. und 2. Mahnung), per Mail in der
// Sprache der Rechnung senden, Liste «Zu mahnen». Regeln (Stufen, Fristen, Gebühren) in lib/beleg/mahnwesen.ts.
import { and, asc, eq, inArray, isNotNull, lt } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { firma } from './firma';
import { naechsteNummer } from './nummern';
import { aktivitaetLoggen } from './kontakte';
import { AblaufFehler } from './ablauf';
import { chf } from './geld';
import { mahngebuehr, mahnvorschlag, stufeName, tagePlus, type Mahnstufe, type Mahnvorschlag } from '@/lib/beleg/mahnwesen';
import { datumText } from '@/lib/beleg/texte';
import { mailMahnung } from '@/lib/beleg/mails';
import { mahnungPdfFuer } from '@/lib/admin/belege';
import { empfaenger, mailBereit, sendeMail } from '@/lib/mail';

type Rechnung = typeof schema.rechnung.$inferSelect;

/** Offener Betrag inkl. Mahngebühren */
export const offenMitGebuehren = (r: Pick<Rechnung, 'betragRp' | 'bezahltRp' | 'mahngebuehrenRp'>) => Math.max(0, r.betragRp + r.mahngebuehrenRp - r.bezahltRp);

export async function vorschlagFuer(r: Rechnung, jetzt = new Date()): Promise<Mahnvorschlag | null> {
  const f = await firma();
  return mahnvorschlag({ status: r.status, faelligAm: r.faelligAm, mahnstufe: r.mahnstufe, mahnfristBis: r.mahnfristBis, offenRp: r.betragRp - r.bezahltRp }, jetzt, f);
}

/** Neue Mahnung (nächste Stufe bzw. `stufe`, nur die nächste Stufe ist erlaubt). Frist = heute + Mahnfrist der Firma. */
export async function mahnungErstellen(rechnungId: string, o: { stufe?: number; adminId: string | null }) {
  const f = await firma();
  return db().transaction(async (tx) => {
    const [r] = await tx.select().from(schema.rechnung).where(eq(schema.rechnung.id, rechnungId)).for('update');
    if (!r || !r.kontaktId) throw new AblaufFehler('Rechnung nicht gefunden', 404);
    if (!['offen', 'teilbezahlt'].includes(r.status)) throw new AblaufFehler('Gemahnt werden nur offene, festgeschriebene Rechnungen.', 409);
    if (r.betragRp - r.bezahltRp <= 0) throw new AblaufFehler('Die Rechnung ist bereits beglichen.', 409);
    const naechste = r.mahnstufe + 1;
    const stufe = (o.stufe ?? naechste) as Mahnstufe;
    if (naechste > 3) throw new AblaufFehler('Die 2. Mahnung ist bereits verschickt – als Nächstes folgt die Betreibung (ausserhalb des Backends).', 409);
    if (stufe !== naechste) throw new AblaufFehler(`Als Nächstes ist die ${stufeName(naechste)} an der Reihe.`, 409);
    const jetzt = new Date();
    const gebuehrRp = mahngebuehr(stufe, f);
    const gebuehrenNeu = r.mahngebuehrenRp + gebuehrRp;
    const offenRp = Math.max(0, r.betragRp - r.bezahltRp + gebuehrenNeu);
    const fristBis = tagePlus(jetzt, f.mahnFristTage);
    const nummer = await naechsteNummer(tx, 'MA', jetzt);
    const [m] = await tx
      .insert(schema.mahnung)
      .values({ rechnungId: r.id, stufe, nummer, datum: jetzt, fristBis, gebuehrRp, offenRp, sprache: r.sprache, erstelltVon: o.adminId })
      .returning({ id: schema.mahnung.id });
    await tx.update(schema.rechnung).set({ mahnstufe: stufe, mahnfristBis: fristBis, mahngebuehrenRp: gebuehrenNeu, aktualisiertAm: jetzt }).where(eq(schema.rechnung.id, r.id));
    await aktivitaetLoggen(tx, {
      kontaktId: r.kontaktId,
      kanal: 'system',
      titel: `${stufeName(stufe)} ${nummer} zu Rechnung ${r.nummer}`,
      text: `Offen ${chf(offenRp)}${gebuehrRp ? ` inkl. Mahngebühr ${chf(gebuehrRp)}` : ''} · Frist ${datumText(fristBis)}`,
      rechnungId: r.id,
      auftragId: r.auftragId,
      adminUserId: o.adminId,
    });
    return { id: m.id, nummer, stufe, offenRp, gebuehrRp, fristBis };
  });
}

/** Mahnung per E-Mail (Kundensprache, PDF mit QR-Zahlteil im Anhang). Wirft AblaufFehler, wenn es nicht geht. */
export async function mahnungSenden(mahnungId: string, o: { adminId: string | null; nachricht?: string }) {
  const [m] = await db().select().from(schema.mahnung).where(eq(schema.mahnung.id, mahnungId)).limit(1);
  if (!m) throw new AblaufFehler('Mahnung nicht gefunden', 404);
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, m.rechnungId)).limit(1);
  const [k] = r?.kontaktId ? await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1) : [];
  if (!r || !k) throw new AblaufFehler('Rechnung nicht gefunden', 404);
  if (!k.email) throw new AblaufFehler('Keine E-Mail-Adresse beim Kunden — PDF herunterladen und per Post senden.');
  if (!mailBereit()) throw new AblaufFehler('E-Mail-Versand ist nicht konfiguriert — PDF herunterladen und selbst senden.', 503);
  const pdf = await mahnungPdfFuer(m.id);
  const mail = mailMahnung({ sprache: m.sprache, name: k.name, stufe: m.stufe as Mahnstufe, nummer: m.nummer, rechnungNummer: r.nummer ?? '', offenRp: m.offenRp, frist: datumText(m.fristBis, m.sprache), nachricht: o.nachricht });
  try {
    await sendeMail({ to: k.email, subject: mail.subject, text: mail.text, html: mail.html, replyTo: empfaenger(), anhaenge: pdf ? [{ filename: pdf.datei, content: pdf.buf.toString('base64') }] : undefined });
  } catch (err) {
    console.error('[mahnung] Mail', (err as Error).message);
    throw new AblaufFehler('Die E-Mail konnte nicht gesendet werden.', 502);
  }
  await db().update(schema.mahnung).set({ versendetAm: new Date(), versendetAn: k.email }).where(eq(schema.mahnung.id, m.id));
  await aktivitaetLoggen(db(), { kontaktId: k.id, kanal: 'mail', richtung: 'aus', titel: `${stufeName(m.stufe)} ${m.nummer} per E-Mail gesendet`, text: mail.text, rechnungId: r.id, auftragId: r.auftragId, adminUserId: o.adminId });
  return { an: k.email };
}

export type MahnungZeile = { id: string; nummer: string; stufe: number; bezeichnung: string; datum: string; fristBis: string; gebuehrRp: number; offenRp: number; versendetAm: string | null; versendetAn: string | null };

export async function mahnungenVon(rechnungIds: string[]): Promise<(MahnungZeile & { rechnungId: string })[]> {
  if (!rechnungIds.length) return [];
  const l = await db().select().from(schema.mahnung).where(inArray(schema.mahnung.rechnungId, rechnungIds)).orderBy(asc(schema.mahnung.datum), asc(schema.mahnung.stufe));
  return l.map((m) => ({
    id: m.id,
    rechnungId: m.rechnungId,
    nummer: m.nummer,
    stufe: m.stufe,
    bezeichnung: stufeName(m.stufe),
    datum: m.datum.toISOString(),
    fristBis: m.fristBis.toISOString(),
    gebuehrRp: m.gebuehrRp,
    offenRp: m.offenRp,
    versendetAm: m.versendetAm?.toISOString() ?? null,
    versendetAn: m.versendetAn,
  }));
}

/** Liste «Zu mahnen»: offene, überfällige Rechnungen mit nächster Stufe (fällig nach Einstellung oder schon möglich). */
export async function zuMahnen(jetzt = new Date()) {
  const f = await firma();
  const R = schema.rechnung;
  const K = schema.kontakt;
  const reihen = await db()
    .select({ r: R, name: K.name, email: K.email, brandDomain: K.brandDomain })
    .from(R)
    .innerJoin(K, eq(K.id, R.kontaktId))
    .where(and(inArray(R.status, ['offen', 'teilbezahlt']), isNotNull(R.faelligAm), lt(R.faelligAm, new Date(jetzt.getTime() - 86400_000))))
    .orderBy(asc(R.faelligAm))
    .limit(300);
  return reihen
    .map((x) => ({ ...x, vorschlag: mahnvorschlag({ status: x.r.status, faelligAm: x.r.faelligAm, mahnstufe: x.r.mahnstufe, mahnfristBis: x.r.mahnfristBis, offenRp: x.r.betragRp - x.r.bezahltRp }, jetzt, f) }))
    .map((x) => ({ ...x, faellig: Boolean(x.vorschlag && (!f.mahnVorschlagAktiv || x.vorschlag.faellig)) }));
}
