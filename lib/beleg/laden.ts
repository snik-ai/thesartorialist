// Serverseitig: Belege aus der Datenbank als BelegDokument laden und als PDF (Chrome, pixelgleich zum Papier im Editor)
// bzw. HTML-Vorschau ausgeben. Ohne Chrome auf dem Server fällt das PDF auf die bisherige PDFKit-Fassung zurück.
import { and, asc, eq, lt } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { firma, logoDaten } from '@/lib/crm/firma';
import { angebotDokument, mahnungDokument, rechnungDokument } from './dokument';
import { dokumentHtml, fussVorlage, type BelegDokument } from './vorlage';
import { htmlZuPdf, KeinChrome, schriftenEingebettet, standardLogoEingebettet, STANDARD_LOGO } from './pdf';
import { stufenText, type Mahnstufe } from './mahnwesen';
import { datumText } from './texte';

/** Logo fürs Papier: eigenes Logo (Einstellungen) als data:-URI, sonst die Wortmarke (web: Pfad, pdf: eingebettet). */
export async function logoFuer(ziel: 'web' | 'pdf'): Promise<string | null> {
  const l = await logoDaten();
  if (l) return `data:${l.typ};base64,${l.base64}`;
  return ziel === 'web' ? STANDARD_LOGO : standardLogoEingebettet();
}

export async function angebotDok(id: string, ziel: 'web' | 'pdf' = 'pdf') {
  const [a] = await db().select().from(schema.angebot).where(eq(schema.angebot.id, id)).limit(1);
  if (!a || !a.kontaktId) return null;
  const [[k], f, logo] = await Promise.all([db().select().from(schema.kontakt).where(eq(schema.kontakt.id, a.kontaktId)).limit(1), firma(), logoFuer(ziel)]);
  return { a, k, dok: angebotDokument(a, k, f, logo) };
}

export async function rechnungDok(id: string, ziel: 'web' | 'pdf' = 'pdf') {
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, id)).limit(1);
  if (!r || !r.kontaktId) return null;
  const [[k], f, logo, [au]] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1),
    firma(),
    logoFuer(ziel),
    r.auftragId ? db().select({ nummer: schema.auftrag.nummer }).from(schema.auftrag).where(eq(schema.auftrag.id, r.auftragId)).limit(1) : Promise.resolve([] as { nummer: string | null }[]),
  ]);
  return { r, k, dok: rechnungDokument({ ...r, auftragNummer: au?.nummer ?? null }, k, f, logo) };
}

export async function mahnungDok(id: string, ziel: 'web' | 'pdf' = 'pdf') {
  const [m] = await db().select().from(schema.mahnung).where(eq(schema.mahnung.id, id)).limit(1);
  if (!m) return null;
  const [r] = await db().select().from(schema.rechnung).where(eq(schema.rechnung.id, m.rechnungId)).limit(1);
  if (!r?.kontaktId) return null;
  const [[k], f, logo, vorher] = await Promise.all([
    db().select().from(schema.kontakt).where(eq(schema.kontakt.id, r.kontaktId)).limit(1),
    firma(),
    logoFuer(ziel),
    db().select({ g: schema.mahnung.gebuehrRp }).from(schema.mahnung).where(and(eq(schema.mahnung.rechnungId, r.id), lt(schema.mahnung.stufe, m.stufe))).orderBy(asc(schema.mahnung.stufe)),
  ]);
  const t = stufenText(m.stufe as Mahnstufe, m.sprache, { name: k.name, anrede: k.anrede, frist: datumText(m.fristBis, m.sprache) });
  const dok = mahnungDokument(
    { nummer: m.nummer, stufe: m.stufe as Mahnstufe, datum: m.datum, fristBis: m.fristBis, gebuehrRp: m.gebuehrRp, offenRp: m.offenRp, sprache: m.sprache, einleitung: t.einleitung, schluss: t.schluss },
    { nummer: r.nummer ?? '', rechnungsdatum: r.rechnungsdatum, faelligAm: r.faelligAm, betragRp: r.betragRp, bezahltRp: r.bezahltRp, referenz: r.referenz, gebuehrenVorherRp: vorher.reduce((s, x) => s + x.g, 0) },
    k,
    f,
    logo,
  );
  return { m, r, k, dok };
}

/** PDF aus einem Dokument (Chrome). null = kein Chrome auf dem Server → Aufrufer nimmt die PDFKit-Fassung. */
export async function dokPdf(dok: BelegDokument): Promise<Buffer | null> {
  try {
    return await htmlZuPdf(dokumentHtml(dok, { schriften: schriftenEingebettet() }), fussVorlage(dok));
  } catch (err) {
    if (err instanceof KeinChrome) return null;
    console.error('[beleg] PDF', (err as Error).message);
    return null;
  }
}

/** HTML-Vorschau (PDF-Modus im Editor): gleiche Vorlage, Schriften aus /fonts/pdf */
export const vorschauHtml = (dok: BelegDokument) => dokumentHtml(dok);

export const htmlAntwort = (html: string) =>
  new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'Content-Security-Policy': "default-src 'none'; img-src data: 'self'; font-src 'self' data:; style-src 'unsafe-inline'" } });
