// Telefonnummern: Normalform für Duplikate und Links für WhatsApp/SMS (Schweiz als Standard).

/** Letzte 9 Ziffern (Schweizer Nummer ohne 0/+41) — gleich für «079 …», «+41 79 …», «0041 79 …». */
export function telNorm(t?: string | null): string | null {
  const z = (t ?? '').replace(/\D/g, '');
  return z.length >= 9 ? z.slice(-9) : null;
}

/** Internationale Ziffern ohne «+» (für wa.me), z. B. «41791234567». */
export function telIntl(t: string): string {
  let s = t.replace(/[^\d+]/g, '');
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  if (s.startsWith('0')) s = `+41${s.slice(1)}`;
  if (!s.startsWith('+')) s = `+41${s}`;
  return s.slice(1);
}

export const waLink = (t: string, text: string) => `https://wa.me/${telIntl(t)}?text=${encodeURIComponent(text)}`;
/** iOS und Android verstehen «sms:+41…?&body=…» */
export const smsLink = (t: string, text: string) => `sms:+${telIntl(t)}?&body=${encodeURIComponent(text)}`;
export const telLink = (t: string) => `tel:+${telIntl(t)}`;

/** «+41 79 123 45 67» für die Anzeige (Schweizer Mobil-/Festnetznummern), sonst unverändert. */
export function telAnzeige(t: string): string {
  const i = telIntl(t);
  if (i.startsWith('41') && i.length === 11) return `+41 ${i.slice(2, 4)} ${i.slice(4, 7)} ${i.slice(7, 9)} ${i.slice(9)}`;
  return t;
}
