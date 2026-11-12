// Vorbereitete 1:1-Nachrichten (WhatsApp, SMS, E-Mail-Betreff) — gleich im Browser und auf dem Server.
import { SITE } from '@/lib/site';
import { TZ, zuerichTeile } from '@/lib/zeit';

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

export type BestaetigungsKanal = 'whatsapp' | 'sms' | 'mail';

const ADRESSE = `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`;
const KARTE = `https://maps.google.com/?q=${encodeURIComponent(`The Sartorialist, ${ADRESSE}`)}`;

/**
 * Terminbestätigung je Kanal, mit sauberer Struktur:
 * WhatsApp mit dezenten Emojis und *fett*, SMS kurz mit wenigen Emojis, E-Mail (mailto) ohne Emojis.
 */
export function bestaetigungNachricht(kanal: BestaetigungsKanal, name: string, start: Date): { text: string; betreff: string } {
  const tag = start.toLocaleDateString('de-CH', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const kurz = start.toLocaleDateString('de-CH', { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  const zeit = `${zuerichTeile(start).zeit} Uhr`;
  const betreff = `Ihr Termin am ${tag}, ${zeit} — The Sartorialist Zürich`;
  const g = gruss(name);

  if (kanal === 'whatsapp') {
    return {
      betreff,
      text: [
        `${g} 👋`,
        '',
        '*Ihr Termin ist bestätigt* ✅',
        '',
        `📅 ${tag}`,
        `⏰ ${zeit}`,
        `📍 The Sartorialist, ${ADRESSE}`,
        `🗺️ ${KARTE}`,
        '',
        `Wir freuen uns, Sie in unserem Atelier an der ${SITE.address.street} begrüssen zu dürfen. Gemeinsam finden wir Stoff, Schnitt und Details für Ihren Anzug – ein Espresso steht für Sie bereit ☕`,
        '',
        'Falls etwas dazwischenkommt, antworten Sie einfach auf diese Nachricht.',
        '',
        'Herzliche Grüsse',
        'Ihr Team von *The Sartorialist Zürich*',
      ].join('\n'),
    };
  }
  if (kanal === 'sms') {
    return {
      betreff,
      text: [
        `${g}, Ihr Termin bei The Sartorialist Zürich ist bestätigt ✅`,
        '',
        `📅 ${kurz}, ${zeit}`,
        `📍 ${ADRESSE}`,
        '',
        `Wir freuen uns, Sie in unserem Atelier begrüssen zu dürfen. Fragen oder Verschiebung: ${SITE.phone}`,
      ].join('\n'),
    };
  }
  return {
    betreff,
    text: [
      `${g}`,
      '',
      'Gerne bestätigen wir Ihren Termin bei The Sartorialist Zürich:',
      '',
      `${tag}, ${zeit}`,
      `The Sartorialist, ${ADRESSE}`,
      '',
      `Wir freuen uns, Sie in unserem Atelier an der ${SITE.address.street} begrüssen zu dürfen. Gemeinsam wählen wir Stoff, Schnitt und Details für Ihren Anzug – nehmen Sie sich gerne Zeit, ein Espresso steht für Sie bereit.`,
      '',
      'Falls etwas dazwischenkommt, antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.',
      '',
      'Herzliche Grüsse',
      'The Sartorialist Zürich',
      `${ADRESSE}`,
      `${SITE.phone} · ${SITE.email}`,
    ].join('\n'),
  };
}
