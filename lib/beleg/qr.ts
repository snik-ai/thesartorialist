// Swiss QR-Zahlteil (wie VoxCRM verkauf/qr.ts): Daten aus Firma, Rechnung und Empfänger, QR-Code als SVG (swissqrbill/svg).
// Der Zahlteil selbst wird als HTML nach dem Style Guide von SIX gesetzt (lib/beleg/vorlage.ts zahlteilHtml), damit Papier
// im Editor und PDF gleich aussehen. Läuft im Browser (Live-Vorschau) und auf dem Server.
import { SwissQRCode } from 'swissqrbill/svg';
import type { Data as QrData } from 'swissqrbill/types';
import { formatIBAN, formatReference, isQRIBAN } from 'swissqrbill/utils';
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

export function qrTeil(f: Pick<Firma, 'qrIban' | 'iban' | 'name' | 'rechtsname' | 'strasse' | 'plz' | 'ort' | 'land'>, e: QrEmpfaenger, r: { nummer: string; referenz: string | null; offenRp: number; mitteilung?: string }, sprache: BelegSprache = 'de'): QrTeil {
  const konto = (f.qrIban.trim() || f.iban.trim()).replace(/\s+/g, '').toUpperCase();
  const mitteilung = (r.mitteilung ?? `${sprache === 'de' ? 'Rechnung' : sprache === 'fr' ? 'Facture' : sprache === 'it' ? 'Fattura' : 'Invoice'} ${r.nummer}`).slice(0, 140);
  const glaeubigerName = (f.rechtsname || f.name).slice(0, 70);
  const glaeubiger = [glaeubigerName, f.strasse, `${f.plz} ${f.ort}`.trim()].filter(Boolean);
  const schuldnerDa = Boolean(e.strasse && e.plz && e.ort);
  const schuldnerName = [e.name, e.firma ? `(${e.firma})` : ''].filter(Boolean).join(' ').slice(0, 70);
  const schuldner = schuldnerDa ? [schuldnerName, e.strasse!, `${e.plz} ${e.ort}`] : null;
  const betragRp = r.offenRp > 0 ? r.offenRp : null;
  if (!konto) return { svg: null, konto: '', glaeubiger, referenz: null, mitteilung, schuldner, betragRp, fehler: [FEHLER[sprache].iban] };
  const qrIban = isQRIBAN(konto);
  const ref = r.referenz && (qrIban ? /^\d{27}$/.test(r.referenz) : /^RF\d{2}/.test(r.referenz)) ? r.referenz : undefined;
  const daten: QrData = {
    currency: 'CHF',
    amount: betragRp ? betragRp / 100 : undefined,
    creditor: { account: konto, name: glaeubigerName, address: f.strasse.slice(0, 70), zip: f.plz, city: f.ort, country: (f.land || 'CH').toUpperCase() },
    debtor: schuldnerDa ? { name: schuldnerName, address: e.strasse!.slice(0, 70), zip: e.plz!, city: e.ort!, country: (e.land || 'CH').toUpperCase() } : undefined,
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
