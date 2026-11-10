// Bankverbindung für den Swiss QR-Zahlteil prüfen (rein, Browser + Server): IBAN/QR-IBAN (swissqrbill), Gläubiger-Adresse
// nach den Feldlängen des SIX-Standards, daraus folgende Referenzart. Genutzt in den Einstellungen (Live-Prüfung), beim
// Festschreiben/Senden einer Rechnung (Sperre ohne gültige Bankverbindung) und für die Hinweise im Editor/auf der Übersicht.
import { calculateQRReferenceChecksum, calculateSCORReferenceChecksum, isIBANValid, isQRIBAN } from 'swissqrbill/utils';

export const ibanRoh = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, '').toUpperCase();
/** «CH4431999123000889012» → «CH44 3199 9123 0008 8901 2» */
export const ibanGruppen = (s: string) => ibanRoh(s).replace(/(.{4})/g, '$1 ').trim();

export type IbanErgebnis = { leer: boolean; ok: boolean; qr: boolean; formatiert: string; fehler: string | null };

/** Ein Kontofeld prüfen: «iban» = normale IBAN (Referenz RF), «qr» = QR-IBAN (Institut-ID 30000–31999, QR-Referenz). */
export function ibanPruefen(eingabe: string | null | undefined, feld: 'iban' | 'qr'): IbanErgebnis {
  const roh = ibanRoh(eingabe);
  const formatiert = ibanGruppen(roh);
  if (!roh) return { leer: true, ok: false, qr: false, formatiert, fehler: null };
  const qr = /^(CH|LI)\d{2}3[01]/.test(roh) && roh.length === 21 && isQRIBAN(roh);
  let fehler: string | null = null;
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(roh)) fehler = 'Nur Buchstaben und Ziffern, beginnend mit dem Ländercode (CH …).';
  else if (!roh.startsWith('CH') && !roh.startsWith('LI')) fehler = 'Für den QR-Zahlteil braucht es ein Schweizer (CH) oder Liechtensteiner (LI) Konto.';
  else if (roh.length < 21) fehler = `Zu kurz: ${roh.length} von 21 Zeichen.`;
  else if (roh.length > 21) fehler = `Zu lang: ${roh.length} statt 21 Zeichen.`;
  else if (!isIBANValid(roh)) fehler = 'Prüfziffer stimmt nicht – bitte Zeichen für Zeichen mit dem Bankdokument vergleichen.';
  else if (feld === 'iban' && qr) fehler = 'Das ist eine QR-IBAN (Institut-ID 30000–31999) – bitte ins Feld «QR-IBAN» eintragen.';
  else if (feld === 'qr' && !qr) fehler = 'Das ist eine normale IBAN, keine QR-IBAN – bitte ins Feld «IBAN» eintragen.';
  return { leer: false, ok: !fehler, qr, formatiert, fehler };
}

export type BankFirma = { name: string; rechtsname: string; strasse: string; plz: string; ort: string; land: string; iban: string; qrIban: string };

export type BankPruefung = {
  /** QR-Zahlteil möglich: mindestens ein gültiges Konto und vollständige Gläubiger-Adresse */
  ok: boolean;
  /** Konto, das auf neuen Rechnungen steht (QR-IBAN hat Vorrang) */
  konto: string | null;
  kontoArt: 'qr' | 'iban' | null;
  referenzArt: 'QRR' | 'SCOR' | null;
  iban: IbanErgebnis;
  qrIban: IbanErgebnis;
  /** Fehler, die das Festschreiben verhindern (ohne Konto: nur «Bankverbindung fehlt») */
  fehler: string[];
  /** Kurztext für Hinweise im Editor und auf der Übersicht */
  kurz: string;
};

/** Gläubiger nach SIX: Name ≤ 70, Strasse ≤ 70, PLZ ≤ 16, Ort ≤ 35, Land 2 Buchstaben – alles Pflicht. */
export function glaeubigerFehler(f: Pick<BankFirma, 'name' | 'rechtsname' | 'strasse' | 'plz' | 'ort' | 'land'>): string[] {
  const out: string[] = [];
  const name = (f.rechtsname || f.name).trim();
  if (!name) out.push('Firmenname (Gläubiger) fehlt.');
  else if (name.length > 70) out.push('Firmenname ist länger als 70 Zeichen.');
  if (!f.strasse.trim()) out.push('Strasse und Hausnummer des Ateliers fehlen.');
  else if (f.strasse.trim().length > 70) out.push('Strasse ist länger als 70 Zeichen.');
  if (!f.plz.trim()) out.push('PLZ des Ateliers fehlt.');
  else if (f.plz.trim().length > 16) out.push('PLZ ist zu lang.');
  if (!f.ort.trim()) out.push('Ort des Ateliers fehlt.');
  else if (f.ort.trim().length > 35) out.push('Ort ist länger als 35 Zeichen.');
  if (!/^[A-Za-z]{2}$/.test((f.land || '').trim())) out.push('Land bitte als Ländercode mit 2 Buchstaben (z. B. CH).');
  return out;
}

export function bankPruefen(f: BankFirma): BankPruefung {
  const iban = ibanPruefen(f.iban, 'iban');
  const qrIban = ibanPruefen(f.qrIban, 'qr');
  const fehler: string[] = [];
  if (iban.fehler) fehler.push(`IBAN: ${iban.fehler}`);
  if (qrIban.fehler) fehler.push(`QR-IBAN: ${qrIban.fehler}`);
  const kontoArt = qrIban.ok ? 'qr' : iban.ok ? 'iban' : null;
  if (!kontoArt && iban.leer && qrIban.leer) fehler.unshift('Bankverbindung fehlt – bitte IBAN oder QR-IBAN in den Einstellungen eintragen.');
  fehler.push(...glaeubigerFehler(f));
  const ok = Boolean(kontoArt) && fehler.length === 0;
  const kurz = ok
    ? `QR-Zahlteil bereit · ${kontoArt === 'qr' ? 'QR-IBAN mit QR-Referenz' : 'IBAN mit Creditor Reference (RF)'}`
    : !kontoArt && iban.leer && qrIban.leer
      ? 'Bankverbindung fehlt – der QR-Zahlteil erscheint, sobald die IBAN in den Einstellungen steht.'
      : `QR-Zahlteil noch nicht möglich: ${fehler[0]}`;
  return { ok, konto: kontoArt === 'qr' ? qrIban.formatiert : kontoArt === 'iban' ? iban.formatiert : null, kontoArt, referenzArt: kontoArt === 'qr' ? 'QRR' : kontoArt === 'iban' ? 'SCOR' : null, iban, qrIban, fehler, kurz };
}

/** Zahlungsreferenz aus der Belegnummer: QR-Referenz (27 Ziffern, Modulo 10 rekursiv) bzw. Creditor Reference (RF, ISO 11649). */
export function referenzAus(art: 'QRR' | 'SCOR', nummer: string): string {
  const ziffern = nummer.replace(/\D/g, '');
  if (art === 'QRR') {
    const basis = ziffern.padStart(26, '0').slice(-26);
    return basis + calculateQRReferenceChecksum(basis);
  }
  const basis = ziffern || '1';
  return `RF${calculateSCORReferenceChecksum(basis)}${basis}`;
}

export const istQrReferenz = (r: string | null | undefined) => Boolean(r && /^\d{27}$/.test(r));
export const istRfReferenz = (r: string | null | undefined) => Boolean(r && /^RF\d{2}[A-Z0-9]{1,21}$/.test(r));
