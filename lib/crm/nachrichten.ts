// Vorbereitete 1:1-Nachrichten (WhatsApp, SMS, E-Mail-Betreff) — gleich im Browser und auf dem Server.
import { SITE } from '@/lib/site';

const vorname = (name: string) => name.trim().split(/\s+/)[0] || '';
const gruss = (name: string) => (vorname(name) ? `Grüezi ${vorname(name)}` : 'Grüezi');

export function textBestaetigung(name: string, terminText: string) {
  return `${gruss(name)}, hier ist The Sartorialist Zürich. Gerne bestätigen wir Ihren Termin am ${terminText} im Atelier an der ${SITE.address.street}. Wir freuen uns auf Sie!`;
}

export function textVorschlag(name: string, vorschlaege: string[]) {
  const liste = vorschlaege.map((v, i) => `${i + 1}) ${v}`).join('\n');
  return `${gruss(name)}, hier ist The Sartorialist Zürich. Ihr Wunschtermin ist leider schon vergeben. Passt Ihnen einer dieser Termine?\n${liste}\nAntworten Sie einfach mit der Nummer. Herzlichen Dank!`;
}

export function textRueckruf(name: string) {
  return `${gruss(name)}, hier ist The Sartorialist Zürich. Sie hatten um einen Rückruf gebeten — wann passt es Ihnen am besten?`;
}

export function textAllgemein(name: string) {
  return `${gruss(name)}, hier ist The Sartorialist Zürich. `;
}
