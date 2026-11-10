// Firmeneinstellungen in der Datenbank (Tabelle firma_einstellung): Adresse, MWST, IBAN/QR-IBAN, Fristen,
// Standardtexte, Preisliste (Katalog), Termin-Erinnerung, Logo. Ohne Eintrag gelten die Standardwerte unten.
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { SITE } from '@/lib/site';
import type { BelegSprache } from '@/lib/db/schema';
import { STANDARD_TEXTE } from '@/lib/beleg/texte';

export type Firma = {
  name: string;
  rechtsname: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  telefon: string;
  email: string;
  web: string;
  mwstNr: string;
  mwstPflichtig: boolean;
  mwstSatz: number;
  iban: string;
  qrIban: string;
  bank: string;
  zahlungsfristTage: number;
  angebotGueltigTage: number;
  anzahlungProzent: number;
  /** Standard-Zahlungsplan neuer Angebote (lib/crm/zahlungsplan.ts PlanStandard: anzahlung, 50-50, 30-40-30, ganz, offen) */
  zahlungsplanStandard: string;
  /** Arbeitstage von Bestellung bis Eingang im Atelier (für Fälligkeiten der Tasks) */
  produktionTage: number;
  texte: {
    angebotEinleitung: string;
    angebotSchluss: string;
    rechnungEinleitung: string;
    rechnungSchluss: string;
    anzahlungEinleitung: string;
  };
  erinnerungAktiv: boolean;
  erinnerungStunden: number;
  /** Mahnwesen (lib/beleg/mahnwesen.ts): Gebühr 1. und 2. Mahnung in Rappen, Frist je Mahnung in Tagen */
  mahnGebuehr2Rp: number;
  mahnGebuehr3Rp: number;
  mahnFristTage: number;
  /** Mahnung automatisch vorschlagen (versendet wird nur auf Klick), ab Tagen nach Fälligkeit je Stufe */
  mahnVorschlagAktiv: boolean;
  mahnTage1: number;
  mahnTage2: number;
  mahnTage3: number;
};

export type KatalogEintrag = { id: string; kategorie: string; bezeichnung: string; beschreibung?: string; preisRp: number };


export const FIRMA_STANDARD: Firma = {
  name: SITE.name,
  rechtsname: SITE.legalName,
  strasse: SITE.address.street,
  plz: SITE.address.postalCode,
  ort: SITE.address.city,
  land: 'CH',
  telefon: SITE.phone,
  email: SITE.email,
  web: 'thesartorialist.ch',
  mwstNr: '',
  mwstPflichtig: true,
  mwstSatz: 8.1,
  iban: '',
  qrIban: '',
  bank: '',
  zahlungsfristTage: 30,
  angebotGueltigTage: 30,
  anzahlungProzent: 50,
  zahlungsplanStandard: 'anzahlung',
  produktionTage: 20,
  texte: {
    angebotEinleitung: 'Vielen Dank für Ihren Besuch im Atelier. Gerne unterbreiten wir Ihnen folgendes Angebot für Ihre Massanfertigung — gefertigt in Italien, Full-Canvas, nach Ihren persönlichen Massen.',
    angebotSchluss: 'Nach Ihrer Zusage bestellen wir den Stoff und vereinbaren die Anprobe. Bei Fragen sind wir jederzeit gerne für Sie da.',
    rechnungEinleitung: 'Herzlichen Dank für Ihren Auftrag. Wir erlauben uns, Ihnen folgende Leistungen in Rechnung zu stellen.',
    rechnungSchluss: 'Bitte begleichen Sie den Betrag mit dem QR-Zahlteil innert der Zahlungsfrist. Herzlichen Dank für Ihr Vertrauen.',
    anzahlungEinleitung: 'Für die Bestellung von Stoff und Material erlauben wir uns, eine Anzahlung in Rechnung zu stellen. Der Betrag wird mit der Schlussrechnung verrechnet.',
  },
  erinnerungAktiv: true,
  erinnerungStunden: 2,
  mahnGebuehr2Rp: 2000,
  mahnGebuehr3Rp: 4000,
  mahnFristTage: 10,
  mahnVorschlagAktiv: true,
  mahnTage1: 7,
  mahnTage2: 21,
  mahnTage3: 35,
};

/** Preisliste des Ateliers. Nur der Massanzug hat einen veröffentlichten Ab-Preis — die übrigen Preise trägt das Atelier ein. */
export const KATALOG_STANDARD: KatalogEintrag[] = [
  { id: 'massanzug-2', kategorie: 'massanzug', bezeichnung: 'Massanzug zweiteilig', beschreibung: 'Sakko und Hose, Full-Canvas, Made in Italy', preisRp: 169000 },
  { id: 'massanzug-3', kategorie: 'massanzug', bezeichnung: 'Massanzug dreiteilig', beschreibung: 'Sakko, Hose und Weste, Full-Canvas, Made in Italy', preisRp: 0 },
  { id: 'smoking', kategorie: 'smoking', bezeichnung: 'Smoking nach Mass', beschreibung: 'Mit Satin-Revers', preisRp: 0 },
  { id: 'sakko', kategorie: 'sakko', bezeichnung: 'Sakko nach Mass', preisRp: 0 },
  { id: 'hose', kategorie: 'hose', bezeichnung: 'Hose nach Mass', preisRp: 0 },
  { id: 'weste', kategorie: 'weste', bezeichnung: 'Weste nach Mass', preisRp: 0 },
  { id: 'hemd', kategorie: 'hemd', bezeichnung: 'Hemd nach Mass', preisRp: 0 },
  { id: 'mantel', kategorie: 'mantel', bezeichnung: 'Mantel nach Mass', preisRp: 0 },
  { id: 'stoffzuschlag', kategorie: 'stoffzuschlag', bezeichnung: 'Stoffzuschlag', beschreibung: 'Premium-Stoff', preisRp: 0 },
  { id: 'aenderung', kategorie: 'aenderung', bezeichnung: 'Änderungen', preisRp: 0 },
];

function zusammen<T extends object>(standard: T, wert: unknown): T {
  if (!wert || typeof wert !== 'object') return standard;
  const out: Record<string, unknown> = { ...(standard as Record<string, unknown>) };
  for (const [k, v] of Object.entries(wert as Record<string, unknown>)) {
    if (!(k in standard)) continue;
    const s = (standard as Record<string, unknown>)[k];
    if (s && typeof s === 'object' && !Array.isArray(s)) out[k] = zusammen(s as object, v);
    else if (typeof v === typeof s) out[k] = v;
  }
  return out as T;
}

async function lesen(schluessel: string): Promise<unknown> {
  const [r] = await db().select().from(schema.firmaEinstellung).where(eq(schema.firmaEinstellung.schluessel, schluessel)).limit(1);
  return r?.wert;
}

export async function speichern(schluessel: string, wert: unknown) {
  await db()
    .insert(schema.firmaEinstellung)
    .values({ schluessel, wert, aktualisiertAm: new Date() })
    .onConflictDoUpdate({ target: schema.firmaEinstellung.schluessel, set: { wert, aktualisiertAm: new Date() } });
}

export async function firma(): Promise<Firma> {
  return zusammen(FIRMA_STANDARD, await lesen('firma'));
}

export async function katalog(): Promise<KatalogEintrag[]> {
  const w = await lesen('katalog');
  return Array.isArray(w) ? (w as KatalogEintrag[]) : KATALOG_STANDARD;
}

/** Eigenes Logo (PNG/JPEG, base64) oder null → Standard-Wortmarke */
export async function logoDaten(): Promise<{ typ: string; base64: string } | null> {
  const w = (await lesen('logo')) as { typ?: string; base64?: string } | undefined;
  return w?.typ && w.base64 ? { typ: w.typ, base64: w.base64 } : null;
}

/** MWST-Satz für neue Belege (0, wenn nicht MWST-pflichtig) */
export const mwstSatzVon = (f: Firma) => (f.mwstPflichtig ? f.mwstSatz : 0);

/** «Kuttelgasse 7, 8001 Zürich» */
export const firmaAdresse = (f: Firma) => `${f.strasse}, ${f.plz} ${f.ort}`;

/** Standardtexte eines neuen Belegs in der Dokumentsprache (Deutsch aus den Firmeneinstellungen) */
export function belegTexte(f: Firma, sprache: BelegSprache) {
  return sprache === 'de' ? f.texte : STANDARD_TEXTE[sprache];
}
