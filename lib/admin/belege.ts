// Serverseitige Helfer für Belege: PDFs erzeugen, Empfänger, Links, Eingaben (Tagesdaten).
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { firma, logoDaten } from '@/lib/crm/firma';
import { angebotPdf, massblattPdf, rechnungPdf, type Empfaenger } from '@/lib/pdf/dokument';
import { SITE } from '@/lib/site';
import { zuerich } from '@/lib/zeit';

type Kontakt = typeof schema.kontakt.$inferSelect;

export const empfaengerVon = (k: Kontakt): Empfaenger => ({ name: k.name || k.email || 'Kundin/Kunde', anrede: k.anrede, firma: k.firma, strasse: k.strasse, plz: k.plz, ort: k.ort, land: k.land, email: k.email });

export async function logoBuffer() {
  const l = await logoDaten();
  return l ? Buffer.from(l.base64, 'base64') : null;
}

/** Öffentliche Basis-URL für Links in Mails (APP_URL, in Produktion die Website, lokal der Aufruf-Ursprung) */
export function basisUrl(req: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return SITE.url;
  return new URL(req.url).origin;
}

export const angebotLink = (basis: string, token: string) => `${basis}/angebot/${token}/`;

export function pdfAntwort(buf: Buffer, datei: string, herunterladen = false) {
  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${herunterladen ? 'attachment' : 'inline'}; filename="${datei.replace(/[^\w.-]/g, '_')}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

/** «YYYY-MM-DD» → Mittag Zürcher Zeit (Tagesdaten ohne Zeitzonen-Verschiebung); leer → null; ungültig → undefined */
export function tagAus(v: unknown): Date | null | undefined {
  if (v === null || v === '') return null;
  if (typeof v !== 'string') return undefined;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? zuerich(v, '12:00') : null;
  if (!d) return undefined;
  const jahre = Math.abs(d.getTime() - Date.now()) / (365 * 86400_000);
  return jahre > 5 ? undefined : d;
}

export async function angebotPdfFuer(id: string, link?: string | null) {
  const [a] = await db().select().from(schema.angebot).where(eq(schema.angebot.id, id)).limit(1);
  if (!a || !a.kontaktId) return null;
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, a.kontaktId)).limit(1);
  const buf = await angebotPdf(
    {
      nummer: a.nummer ?? '',
      titel: a.titel,
      datum: a.gesendetAm ?? a.erstelltAm,
      gueltigBis: a.gueltigBis,
      einleitung: a.einleitung,
      schluss: a.schluss,
      positionen: a.positionen,
      rabattProzent: a.rabattProzent,
      rabattRp: a.rabattRp,
      mwstSatz: a.mwstSatz,
      stil: a.stil,
      stoffe: a.stoffe,
      link: link ?? null,
      angenommen: a.angenommenAm && a.angenommenName ? { name: a.angenommenName, am: a.angenommenAm } : null,
    },
    empfaengerVon(k),
    await firma(),
    await logoBuffer(),
  );
  return { buf, datei: `Angebot-${a.nummer}.pdf`, a, k };
}

export async function rechnungPdfFuer(id: string) {
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, id)).limit(1);
  if (!r || !r.kontaktId) return null;
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1);
  const [au] = r.auftragId ? await db().select({ nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.id, r.auftragId)).limit(1) : [];
  const buf = await rechnungPdf(
    {
      nummer: r.nummer ?? '',
      art: r.art,
      titel: r.titel,
      datum: r.rechnungsdatum ?? r.erstelltAm,
      faelligAm: r.faelligAm,
      einleitung: r.einleitung,
      schluss: r.schluss,
      positionen: r.positionen,
      rabattProzent: r.rabattProzent,
      rabattRp: r.rabattRp,
      mwstSatz: r.mwstSatz,
      abzug: r.abzug,
      betragRp: r.betragRp,
      bezahltRp: r.bezahltRp,
      referenz: r.referenz,
      auftragNummer: au?.nummer ?? null,
    },
    empfaengerVon(k),
    await firma(),
    await logoBuffer(),
  );
  return { buf, datei: `Rechnung-${r.nummer}.pdf`, r, k };
}

export async function massblattPdfFuer(id: string) {
  const [m] = await db().select().from(schema.massblatt).where(eq(schema.massblatt.id, id)).limit(1);
  if (!m) return null;
  const [k] = await db().select().from(schema.kontakt).where(eq(schema.kontakt.id, m.kontaktId)).limit(1);
  const versionen = await db().select().from(schema.massblatt).where(eq(schema.massblatt.kontaktId, m.kontaktId));
  const vorher = versionen.filter((v) => v.version < m.version).sort((a, b) => b.version - a.version)[0];
  const [wer] = m.gemessenVon ? await db().select({ name: schema.adminUser.name, email: schema.adminUser.email }).from(schema.adminUser).where(eq(schema.adminUser.id, m.gemessenVon)).limit(1) : [];
  const [au] = m.auftragId ? await db().select({ nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.id, m.auftragId)).limit(1) : [];
  const buf = await massblattPdf(
    { version: m.version, gemessenAm: m.gemessenAm, gemessenVon: wer ? wer.name || wer.email : null, masse: m.masse, vorher: vorher ? { version: vorher.version, gemessenAm: vorher.gemessenAm, masse: vorher.masse } : null, koerper: m.koerper, notiz: m.notiz, auftragNummer: au?.nummer ?? null },
    { ...empfaengerVon(k), telefon: k.telefon },
    await firma(),
    await logoBuffer(),
  );
  return { buf, datei: `Massblatt-${(k.name || 'Kunde').replace(/\s+/g, '-')}-V${m.version}.pdf` };
}
