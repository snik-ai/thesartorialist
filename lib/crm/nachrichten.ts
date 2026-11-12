// Vorbereitete 1:1-Nachrichten (WhatsApp, SMS, E-Mail) — gleich im Browser und auf dem Server.
// Zweisprachig (de/en): die im Bestätigungsdialog gewählte Sprache wird beim Kontakt gespeichert
// und gilt danach für alle Kundenmails (Bestätigung, Erinnerung, Angebot, Rechnung).
import { SITE } from '@/lib/site';
import { TZ, zuerichTeile } from '@/lib/zeit';

export type NachrichtSprache = 'de' | 'en';
/** Kontaktsprache → Sprache der Nachrichten (alles ausser Englisch → Deutsch) */
export const nachrichtSprache = (s: string | null | undefined): NachrichtSprache => (s === 'en' ? 'en' : 'de');

const vorname = (name: string) => name.trim().split(/\s+/)[0] || '';
const gruss = (name: string, s: NachrichtSprache = 'de') => {
  const h = s === 'en' ? 'Hello' : 'Hallo';
  return vorname(name) ? `${h} ${vorname(name)}` : h;
};

const locale = (s: NachrichtSprache) => (s === 'en' ? 'en-GB' : 'de-CH');
const uhr = (d: Date, s: NachrichtSprache) => (s === 'en' ? zuerichTeile(d).zeit : `${zuerichTeile(d).zeit} Uhr`);

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

export function textAllgemein(name: string, s: NachrichtSprache = 'de') {
  return s === 'en' ? `${gruss(name, s)}, this is The Sartorialist Zürich. ` : `${gruss(name)}, hier ist The Sartorialist Zürich. `;
}

export type BestaetigungsKanal = 'whatsapp' | 'sms' | 'mail';

const ADRESSE = `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`;
const KARTE = `https://maps.google.com/?q=${encodeURIComponent(`The Sartorialist, ${ADRESSE}`)}`;
const FUSS_MAIL = ['The Sartorialist Zürich', ADRESSE, `${SITE.phone} · ${SITE.email}`];

/**
 * Terminbestätigung je Kanal, mit sauberer Struktur:
 * WhatsApp mit dezenten Emojis und *fett*, SMS kurz mit wenigen Emojis, E-Mail (mailto) ohne Emojis.
 */
export function bestaetigungNachricht(kanal: BestaetigungsKanal, name: string, start: Date, s: NachrichtSprache = 'de'): { text: string; betreff: string } {
  const tag = start.toLocaleDateString(locale(s), { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const kurz = start.toLocaleDateString(locale(s), { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  const zeit = uhr(start, s);
  const g = gruss(name, s);
  const en = s === 'en';
  const betreff = en ? `Your appointment on ${tag}, ${zeit} — The Sartorialist Zürich` : `Ihr Termin am ${tag}, ${zeit} — The Sartorialist Zürich`;

  if (kanal === 'whatsapp') {
    return {
      betreff,
      text: [
        `${g} 👋`,
        '',
        en ? '*Your appointment is confirmed* ✅' : '*Ihr Termin ist bestätigt* ✅',
        '',
        `📅 ${tag}`,
        `⏰ ${zeit}`,
        `📍 The Sartorialist, ${ADRESSE}`,
        `🗺️ ${KARTE}`,
        '',
        en
          ? `We look forward to welcoming you to our atelier on ${SITE.address.street}. Together we will find the fabric, cut and details for your suit – an espresso is waiting for you ☕`
          : `Wir freuen uns, Sie in unserem Atelier an der ${SITE.address.street} begrüssen zu dürfen. Gemeinsam finden wir Stoff, Schnitt und Details für Ihren Anzug – ein Espresso steht für Sie bereit ☕`,
        '',
        en ? 'If anything comes up, simply reply to this message.' : 'Falls etwas dazwischenkommt, antworten Sie einfach auf diese Nachricht.',
        '',
        en ? 'Kind regards' : 'Herzliche Grüsse',
        en ? 'Your team at *The Sartorialist Zürich*' : 'Ihr Team von *The Sartorialist Zürich*',
      ].join('\n'),
    };
  }
  if (kanal === 'sms') {
    return {
      betreff,
      text: [
        en ? `${g}, your appointment at The Sartorialist Zürich is confirmed ✅` : `${g}, Ihr Termin bei The Sartorialist Zürich ist bestätigt ✅`,
        '',
        `📅 ${kurz}, ${zeit}`,
        `📍 ${ADRESSE}`,
        '',
        en ? `We look forward to welcoming you to our atelier. Questions or rescheduling: ${SITE.phone}` : `Wir freuen uns, Sie in unserem Atelier begrüssen zu dürfen. Fragen oder Verschiebung: ${SITE.phone}`,
      ].join('\n'),
    };
  }
  return {
    betreff,
    text: [
      g,
      '',
      en ? 'We are pleased to confirm your appointment at The Sartorialist Zürich:' : 'Gerne bestätigen wir Ihren Termin bei The Sartorialist Zürich:',
      '',
      `${tag}, ${zeit}`,
      `The Sartorialist, ${ADRESSE}`,
      '',
      en
        ? `We look forward to welcoming you to our atelier on ${SITE.address.street}. Together we will choose the fabric, cut and details for your suit – take your time, an espresso is waiting for you.`
        : `Wir freuen uns, Sie in unserem Atelier an der ${SITE.address.street} begrüssen zu dürfen. Gemeinsam wählen wir Stoff, Schnitt und Details für Ihren Anzug – nehmen Sie sich gerne Zeit, ein Espresso steht für Sie bereit.`,
      '',
      en ? 'If anything comes up, simply reply to this e-mail or give us a call.' : 'Falls etwas dazwischenkommt, antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.',
      '',
      en ? 'Kind regards' : 'Herzliche Grüsse',
      ...FUSS_MAIL,
    ].join('\n'),
  };
}

/** Terminvorschläge je Kanal — gleiche Struktur wie die Bestätigung. */
export function vorschlagNachricht(kanal: BestaetigungsKanal, name: string, slots: Date[], s: NachrichtSprache = 'de'): string {
  const g = gruss(name, s);
  const en = s === 'en';
  const zeile = (d: Date) => `${d.toLocaleDateString(locale(s), { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' })}, ${uhr(d, s)}`;
  const nr = ['1️⃣', '2️⃣', '3️⃣'];
  if (kanal === 'whatsapp') {
    return [
      `${g} 👋`,
      '',
      en
        ? 'Thank you for your request! Unfortunately your preferred time is already taken – we can offer you these appointments:'
        : 'Danke für Ihre Anfrage! Ihr Wunschtermin ist leider schon vergeben – diese Termine können wir Ihnen anbieten:',
      '',
      ...slots.map((x, i) => `${nr[i] ?? `${i + 1})`} ${zeile(x)}`),
      '',
      en ? 'Simply reply with the number and we will reserve the appointment for you ✂️' : 'Antworten Sie einfach mit der Nummer, wir reservieren den Termin gerne für Sie ✂️',
      '',
      en ? 'Kind regards' : 'Herzliche Grüsse',
      en ? 'Your team at *The Sartorialist Zürich*' : 'Ihr Team von *The Sartorialist Zürich*',
    ].join('\n');
  }
  if (kanal === 'sms') {
    return [
      en ? `${g}, unfortunately your preferred time at The Sartorialist Zürich is taken. Would one of these suit you?` : `${g}, Ihr Wunschtermin bei The Sartorialist Zürich ist leider vergeben. Passt einer dieser Termine?`,
      '',
      ...slots.map((x, i) => `${i + 1}) ${zeile(x)}`),
      '',
      en ? 'Simply reply with the number.' : 'Antworten Sie einfach mit der Nummer.',
    ].join('\n');
  }
  return [
    g,
    '',
    en
      ? 'Thank you very much for your request. Unfortunately your preferred time is already taken – we are happy to offer you these appointments:'
      : 'Herzlichen Dank für Ihre Anfrage. Ihr Wunschtermin ist leider schon vergeben – gerne bieten wir Ihnen diese Termine an:',
    '',
    ...slots.map((x, i) => `${i + 1}) ${zeile(x)}`),
    '',
    en ? 'Simply reply with the matching number and we will reserve the appointment for you.' : 'Antworten Sie einfach mit der passenden Nummer, wir reservieren den Termin für Sie.',
    '',
    en ? 'Kind regards' : 'Herzliche Grüsse',
    ...FUSS_MAIL,
  ].join('\n');
}

/** Antwort auf eine Rückrufbitte je Kanal. */
export function rueckrufNachricht(kanal: BestaetigungsKanal, name: string, s: NachrichtSprache = 'de'): string {
  const g = gruss(name, s);
  const en = s === 'en';
  if (kanal === 'whatsapp') {
    return [
      `${g} 👋`,
      '',
      en ? 'this is *The Sartorialist Zürich*. You asked us to call you back – thank you!' : 'hier ist *The Sartorialist Zürich*. Sie hatten um einen Rückruf gebeten – herzlichen Dank!',
      '',
      en ? '📞 When would suit you best? Just let us know the day and time.' : '📞 Wann passt es Ihnen am besten? Nennen Sie uns einfach Tag und Uhrzeit.',
      '',
      en ? 'Kind regards' : 'Herzliche Grüsse',
      en ? 'Your team at *The Sartorialist Zürich*' : 'Ihr Team von *The Sartorialist Zürich*',
    ].join('\n');
  }
  if (kanal === 'sms')
    return en
      ? `${g}, this is The Sartorialist Zürich. You asked us to call you back – when would suit you best? Or call us directly: ${SITE.phone}`
      : `${g}, hier ist The Sartorialist Zürich. Sie hatten um einen Rückruf gebeten – wann passt es Ihnen am besten? Gerne auch direkt: ${SITE.phone}`;
  return [
    g,
    '',
    en
      ? 'You asked us to call you back – thank you very much. When would suit you best? Just let us know the day and time.'
      : 'Sie hatten um einen Rückruf gebeten – herzlichen Dank. Wann passt es Ihnen am besten? Nennen Sie uns einfach Tag und Uhrzeit.',
    '',
    en ? 'Kind regards' : 'Herzliche Grüsse',
    ...FUSS_MAIL,
  ].join('\n');
}

/** Nachfass nach dem Ratgeber-Download «Der passende Anzug» je Kanal. */
export function ratgeberNachricht(kanal: BestaetigungsKanal, name: string, s: NachrichtSprache = 'de'): string {
  const g = gruss(name, s);
  const en = s === 'en';
  if (kanal === 'whatsapp') {
    return [
      `${g} 👋`,
      '',
      en
        ? 'this is *The Sartorialist Zürich*. Thank you for your interest in our guide *«The right suit»* 📖'
        : 'hier ist *The Sartorialist Zürich*. Danke für Ihr Interesse an unserem Ratgeber *«Der passende Anzug»* 📖',
      '',
      en
        ? `We would love to show you fabrics, cuts and details in person – with a free consultation in our atelier on ${SITE.address.street} ✂️`
        : `Gerne zeigen wir Ihnen Stoffe, Schnitte und Details persönlich – bei einer kostenlosen Beratung in unserem Atelier an der ${SITE.address.street} ✂️`,
      '',
      en ? 'When would suit you?' : 'Wann würde es Ihnen passen?',
      '',
      en ? 'Kind regards' : 'Herzliche Grüsse',
      en ? 'Your team at *The Sartorialist Zürich*' : 'Ihr Team von *The Sartorialist Zürich*',
    ].join('\n');
  }
  if (kanal === 'sms')
    return en
      ? `${g}, this is The Sartorialist Zürich. Thank you for your interest in our guide «The right suit». May we invite you to a free consultation in our atelier?`
      : `${g}, hier ist The Sartorialist Zürich. Danke für Ihr Interesse an unserem Ratgeber «Der passende Anzug». Dürfen wir Sie zu einer kostenlosen Beratung im Atelier einladen?`;
  return [
    g,
    '',
    en
      ? 'Thank you very much for your interest in our guide «The right suit». We would love to show you fabrics, cuts and details in person – with a free consultation in our atelier.'
      : 'Herzlichen Dank für Ihr Interesse an unserem Ratgeber «Der passende Anzug». Gerne zeigen wir Ihnen Stoffe, Schnitte und Details persönlich – bei einer kostenlosen Beratung in unserem Atelier.',
    '',
    en ? 'When would suit you?' : 'Wann würde es Ihnen passen?',
    '',
    en ? 'Kind regards' : 'Herzliche Grüsse',
    ...FUSS_MAIL,
  ].join('\n');
}

/** Alle drei Kanäle auf einmal (für KontaktKanaele `texte`). */
export const alleKanaele = (f: (k: BestaetigungsKanal) => string) => ({ whatsapp: f('whatsapp'), sms: f('sms'), mail: f('mail') });

/** Telefontermin auf neue Zeit verschoben (Wochenplanung): kurze Nachricht, dass wir zur neuen Zeit anrufen. */
export function telefonNeuNachricht(kanal: BestaetigungsKanal, name: string, start: Date, s: NachrichtSprache = 'de'): { text: string; betreff: string } {
  const tag = start.toLocaleDateString(locale(s), { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });
  const zeit = uhr(start, s);
  const en = s === 'en';
  const betreff = en ? `Our call on ${tag}, ${zeit} — The Sartorialist Zürich` : `Unser Telefonat am ${tag}, ${zeit} — The Sartorialist Zürich`;
  const kern = en ? `A small change: I will call you on ${tag} at ${zeit}.` : `Kleine Änderung: Ich rufe Sie neu am ${tag} um ${zeit} an.`;
  const frage = en ? 'If that does not suit you, just reply to this message.' : 'Passt Ihnen das nicht, antworten Sie einfach auf diese Nachricht.';
  const fuss = en ? 'Kind regards\nThe Sartorialist Zürich' : 'Freundliche Grüsse\nThe Sartorialist Zürich';
  const g = gruss(name, s);
  if (kanal === 'whatsapp') return { betreff, text: [`${g} 👋`, '', `📞 ${kern}`, '', frage, '', fuss].join('\n') };
  if (kanal === 'sms') return { betreff, text: `${g}, ${kern} ${frage} — The Sartorialist Zürich` };
  return { betreff, text: [`${g}`, '', kern, '', frage, '', fuss].join('\n') };
}
