// Swiss QR-Zahlteil (wie VoxCRM verkauf/qr.ts): Daten aus Firma, Rechnung und Empfänger, QR-Code als SVG (swissqrbill/svg).
// Der Zahlteil selbst wird als HTML nach dem Style Guide von SIX gesetzt (lib/beleg/vorlage.ts zahlteilHtml), damit Papier
// im Editor und PDF gleich aussehen. Läuft im Browser (Live-Vorschau) und auf dem Server.
import { SwissQRCode } from 'swissqrbill/svg';
import type { Data as QrData } from 'swissqrbill/types';
import { formatIBAN, formatReference } from 'swissqrbill/utils';
import { glaeubigerFehler, ibanGruppen, ibanPruefen, ibanRoh, istQrReferenz, istRfReferenz, referenzAus } from './bank';
import type { Firma } from '@/lib/crm/firma';
import type { BelegSprache } from '@/lib/db/schema';

export type QrTeil = {
  svg: string | null;
  konto: string;
  glaeubiger: string[];
  referenz: string | null;
  mitteilung: string;
  schuldner: string[] | null;
  betragRp: number | null;
  fehler: string[];
};

export type QrEmpfaenger = { name: string; firma?: string | null; strasse?: string | null; plz?: string | null; ort?: string | null; land?: string | null };

const FEHLER: Record<BelegSprache, { iban: string; ungueltig: string }> = {
  de: { iban: 'In den Einstellungen ist keine IBAN hinterlegt.', ungueltig: 'Die Zahlungsangaben sind unvollständig' },
  en: { iban: 'No IBAN is set in the settings.', ungueltig: 'The payment details are incomplete' },
  fr: { iban: "Aucun IBAN n'est enregistré dans les réglages.", ungueltig: 'Les données de paiement sont incomplètes' },
  it: { iban: 'Nelle impostazioni non è registrato alcun IBAN.', ungueltig: 'I dati di pagamento sono incompleti' },
};

/**
 * Konto und Referenz für den Zahlteil: QR-Referenz → QR-IBAN, RF → IBAN; ohne passende Referenz (Entwurf von vor dem
 * Eintrag der Bankdaten, Wechsel der Kontoart) wird sie aus der Belegnummer gebildet. null = kein gültiges Konto.
 * Gemeinsam für die A4-Vorlage (Chrome) und die PDFKit-Fassung (lib/pdf/dokument.ts).
 */
export function qrKonto(f: Pick<Firma, 'qrIban' | 'iban'>, referenz: string | null, nummer: string): { konto: string; ref: string | undefined } | null {
  const qrK = ibanPruefen(f.qrIban, 'qr');
  const ibK = ibanPruefen(f.iban, 'iban');
  if (!qrK.ok && !ibK.ok) return null;
  const mitQr = qrK.ok && (istQrReferenz(referenz) || !ibK.ok || !istRfReferenz(referenz));
  const konto = ibanRoh(mitQr ? f.qrIban : f.iban);
  const ref = mitQr ? (istQrReferenz(referenz) ? referenz! : referenzAus('QRR', nummer)) : istRfReferenz(referenz) ? referenz! : nummer ? referenzAus('SCOR', nummer) : undefined;
  return { konto, ref };
}

const land = (l: string | null | undefined) => (/^[A-Za-z]{2}$/.test((l ?? '').trim()) ? l!.trim().toUpperCase() : 'CH');

export function qrTeil(f: Pick<Firma, 'qrIban' | 'iban' | 'name' | 'rechtsname' | 'strasse' | 'plz' | 'ort' | 'land'>, e: QrEmpfaenger, r: { nummer: string; referenz: string | null; offenRp: number; mitteilung?: string }, sprache: BelegSprache = 'de'): QrTeil {
  const mitteilung = (r.mitteilung ?? `${sprache === 'de' ? 'Rechnung' : sprache === 'fr' ? 'Facture' : sprache === 'it' ? 'Fattura' : 'Invoice'} ${r.nummer}`).slice(0, 140);
  const glaeubigerName = (f.rechtsname || f.name).slice(0, 70);
  const glaeubiger = [glaeubigerName, f.strasse, `${f.plz} ${f.ort}`.trim()].filter(Boolean);
  const schuldnerDa = Boolean(e.strasse && e.plz && e.ort);
  const schuldnerName = [e.name, e.firma ? `(${e.firma})` : ''].filter(Boolean).join(' ').slice(0, 70);
  const schuldner = schuldnerDa ? [schuldnerName, e.strasse!, `${e.plz} ${e.ort}`] : null;
  const betragRp = r.offenRp > 0 ? r.offenRp : null;
  // Konto passend zur gespeicherten Referenz: QR-Referenz → QR-IBAN, RF → IBAN. Ohne (passende) Referenz – z. B. ein
  // Entwurf von vor dem Eintrag der Bankdaten – wird sie aus der Rechnungsnummer gebildet (wie beim Festschreiben).
  const qrK = ibanPruefen(f.qrIban, 'qr');
  const ibK = ibanPruefen(f.iban, 'iban');
  if (!qrK.ok && !ibK.ok) {
    const leer = qrK.leer && ibK.leer;
    return { svg: null, konto: '', glaeubiger, referenz: null, mitteilung, schuldner, betragRp, fehler: [leer ? FEHLER[sprache].iban : `${FEHLER[sprache].ungueltig}: ${qrK.fehler ?? ibK.fehler}`] };
  }
  const { konto, ref } = qrKonto(f, r.referenz, r.nummer)!;
  const adresseFehlt = glaeubigerFehler(f);
  if (adresseFehlt.length) return { svg: null, konto: ibanGruppen(konto), glaeubiger, referenz: null, mitteilung, schuldner, betragRp, fehler: adresseFehlt };
  const daten: QrData = {
    currency: 'CHF',
    amount: betragRp ? betragRp / 100 : undefined,
    creditor: { account: konto, name: glaeubigerName, address: f.strasse.trim().slice(0, 70), zip: f.plz.trim(), city: f.ort.trim(), country: land(f.land) },
    // Schuldner kürzen statt scheitern: zu lange Kundenangaben dürfen den Zahlteil nie verhindern
    debtor: schuldnerDa ? { name: schuldnerName, address: e.strasse!.trim().slice(0, 70), zip: e.plz!.trim().slice(0, 16), city: e.ort!.trim().slice(0, 35), country: land(e.land) } : undefined,
    reference: ref,
    message: mitteilung,
  };
  let svg: string | null = null;
  const fehler: string[] = [];
  try {
    svg = new SwissQRCode(daten, 46).toString();
  } catch (err) {
    fehler.push(`${FEHLER[sprache].ungueltig}: ${(err as Error).message}`);
  }
  let konto4 = konto;
  try {
    konto4 = formatIBAN(konto);
  } catch {
    /* Rohform */
  }
  let referenz: string | null = null;
  try {
    referenz = ref ? formatReference(ref) : null;
  } catch {
    referenz = ref ?? null;
  }
  return { svg, konto: konto4, glaeubiger, referenz, mitteilung, schuldner, betragRp, fehler };
}

/** «1 690.50» wie auf dem Zahlteil (Leerzeichen als Tausendertrenner, SIX) */
export const qrBetrag = (rp: number) =>
  `${Math.floor(rp / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}.${String(rp % 100).padStart(2, '0')}`;
