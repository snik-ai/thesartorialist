// Gebrandete E-Mails (Termin, Rückruf) — Tabellen-Layout für alle Mailprogramme,
// keine externen Schriften/Bilder, Dunkelmodus-tauglich durch feste Flächenfarben.
// Termine bekommen einen Kalendereintrag (.ics) und einen Google-Kalender-Link.
import { SITE } from './site';

export type StilZeile = { kategorie: string; untergruppe: string; option: string };
export type TerminDaten = {
  name: string;
  email?: string;
  telefon?: string;
  datum?: string; // YYYY-MM-DD
  zeit?: string; // HH:MM
  wunschText?: string; // lesbar, z. B. «Montag, 10. November 2026, 14:30 Uhr»
  stil: StilZeile[];
  stoffe: string[];
  firma?: string;
  brandDomain?: string;
  /** Einwilligung: Terminbestätigung und Erinnerung auch per WhatsApp/SMS */
  einwilligung?: boolean;
};

const INK = '#101010';
const SOFT = '#3a3833';
const MUTED = '#7a766e';
const LINE = '#e5e3de';
const WARM = '#f6f5f2';
const GOLD = '#b08d57';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const telHref = (t: string) => `tel:${t.replace(/[^\d+]/g, '').replace(/^0(?=\d)/, '+41')}`;
const waHref = (t: string, text: string) =>
  `https://wa.me/${t.replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^0(?=\d)/, '41')}?text=${encodeURIComponent(text)}`;
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`)}`;

/** Start/Ende in Zürcher Lokalzeit (für .ics mit TZID und Google-Link) */
function zeitraum(d: TerminDaten) {
  if (!d.datum || !d.zeit) return null;
  const [y, m, t] = d.datum.split('-').map(Number);
  const [h, min] = d.zeit.split(':').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const start = `${y}${pad(m)}${pad(t)}T${pad(h)}${pad(min)}00`;
  const endeMin = h * 60 + min + 90; // Beratung 60–90 Minuten
  const ende = `${y}${pad(m)}${pad(t)}T${pad(Math.floor(endeMin / 60))}${pad(endeMin % 60)}00`;
  return { start, ende };
}

export function icsDatei(d: TerminDaten, fuer: 'kunde' | 'atelier', status: 'TENTATIVE' | 'CONFIRMED' = 'TENTATIVE') {
  const z = zeitraum(d);
  if (!z) return null;
  const titel = fuer === 'kunde' ? 'Beratung Massanzug — The Sartorialist Zürich' : `Beratung: ${d.name}`;
  const beschr = [
    fuer === 'atelier' ? `Telefon: ${d.telefon || '–'}\\nE-Mail: ${d.email || '–'}` : `Telefon Atelier: ${SITE.phone}`,
    d.stoffe.length ? `Stoff: ${d.stoffe.join(', ')}` : '',
    d.stil.length ? `Stil-Auswahl: ${d.stil.length} Details` : '',
  ]
    .filter(Boolean)
    .join('\\n');
  const uid = `${z.start}-${Math.random().toString(36).slice(2, 10)}@thesartorialist.ch`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Sartorialist Zürich//Termin//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Zurich',
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Zurich:${z.start}`,
    `DTEND;TZID=Europe/Zurich:${z.ende}`,
    `SUMMARY:${titel}`,
    `LOCATION:${SITE.name}\\, ${SITE.address.street}\\, ${SITE.address.postalCode} ${SITE.address.city}`,
    `DESCRIPTION:${beschr}`,
    `STATUS:${status}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return Buffer.from(ics, 'utf8').toString('base64');
}

function googleKalender(d: TerminDaten) {
  const z = zeitraum(d);
  if (!z) return null;
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'Beratung Massanzug — The Sartorialist Zürich',
    dates: `${z.start}/${z.ende}`,
    ctz: 'Europe/Zurich',
    location: `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`,
    details: `Ihre Beratung im Atelier. Telefon ${SITE.phone}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/* ---------- Bausteine ---------- */

const knopf = (href: string, label: string, art: 'ink' | 'line' | 'gold' = 'ink') => {
  const bg = art === 'ink' ? INK : art === 'gold' ? GOLD : '#ffffff';
  const fg = art === 'line' ? INK : '#ffffff';
  const border = art === 'line' ? `1px solid ${INK}` : `1px solid ${bg}`;
  return `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:${fg};border:${border};text-decoration:none;font:600 12px/1 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;padding:15px 22px;margin:0 8px 8px 0">${esc(label)}</a>`;
};

const kicker = (t: string) =>
  `<div style="font:600 10px/1.4 Helvetica,Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:${MUTED};margin:0 0 10px">${esc(t)}</div>`;

const zeilen = (rows: [string, string][]) =>
  `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:11px 0;border-bottom:1px solid ${LINE};font:13px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};width:38%;vertical-align:top">${esc(k)}</td><td style="padding:11px 0;border-bottom:1px solid ${LINE};font:15px/1.5 Helvetica,Arial,sans-serif;color:${INK};vertical-align:top">${esc(v)}</td></tr>`,
    )
    .join('')}</table>`;

function stilBlock(d: TerminDaten) {
  if (!d.stil.length && !d.stoffe.length) return '';
  const gruppen = [...new Set(d.stil.map((s) => s.kategorie))];
  const teile = gruppen
    .map(
      (g) =>
        `<tr><td colspan="2" style="padding:18px 0 6px;font:700 11px/1 Helvetica,Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:${INK}">${esc(g)}</td></tr>` +
        d.stil
          .filter((s) => s.kategorie === g)
          .map(
            (s) =>
              `<tr><td style="padding:7px 12px 7px 0;border-bottom:1px solid ${LINE};font:13px/1.45 Helvetica,Arial,sans-serif;color:${MUTED};width:46%;vertical-align:top">${esc(s.untergruppe)}</td><td style="padding:7px 0;border-bottom:1px solid ${LINE};font:600 14px/1.45 Helvetica,Arial,sans-serif;color:${INK};vertical-align:top">${esc(s.option)}</td></tr>`,
          )
          .join(''),
    )
    .join('');
  const stoff = d.stoffe.length
    ? `<tr><td colspan="2" style="padding:18px 0 6px;font:700 11px/1 Helvetica,Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:${INK}">Stoff · Holland &amp; Sherry</td></tr><tr><td colspan="2" style="padding:10px 14px;background:${WARM};font:700 17px/1.4 Helvetica,Arial,sans-serif;letter-spacing:1px;color:${INK}">${d.stoffe.map(esc).join(' &nbsp;·&nbsp; ')}</td></tr>`
    : '';
  return `<tr><td style="padding:8px 36px 28px">${kicker(`Stil-Auswahl · ${d.stil.length} Details`)}<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${stoff}${teile}</table></td></tr>`;
}

function rahmen(vorschau: string, inhalt: string) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(vorschau)}</title></head>
<body style="margin:0;padding:0;background:${WARM}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(vorschau)}</div>
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${WARM}"><tr><td align="center" style="padding:28px 12px">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border:1px solid ${LINE}">
<tr><td style="background:${INK};padding:30px 36px 26px;text-align:center">
<div style="font:700 24px/1 Georgia,'Times New Roman',serif;letter-spacing:1.5px;color:#ffffff">THE SARTORIALIST</div>
<div style="font:11px/1 Helvetica,Arial,sans-serif;letter-spacing:8px;color:#ffffff;margin-top:8px">ZÜRICH</div>
<div style="width:46px;height:2px;background:${GOLD};margin:18px auto 0;line-height:2px;font-size:0">&nbsp;</div></td></tr>
${inhalt}
<tr><td style="padding:24px 36px;background:${WARM};border-top:1px solid ${LINE};font:12px/1.7 Helvetica,Arial,sans-serif;color:${MUTED}">
<strong style="color:${INK}">${esc(SITE.name)}</strong><br>${esc(SITE.address.street)}, ${esc(SITE.address.postalCode)} ${esc(SITE.address.city)}<br>
<a href="${telHref(SITE.phone)}" style="color:${MUTED}">${esc(SITE.phone)}</a> · <a href="mailto:${SITE.email}" style="color:${MUTED}">${esc(SITE.email)}</a> · <a href="${SITE.url}" style="color:${MUTED}">thesartorialist.ch</a><br>
Mo–Fr 10–19 Uhr · Sa 10–17 Uhr</td></tr>
</table></td></tr></table></body></html>`;
}

const titelZeile = (titel: string, text?: string) =>
  `<tr><td style="padding:34px 36px 10px"><h1 style="margin:0;font:700 28px/1.2 Georgia,'Times New Roman',serif;color:${INK}">${esc(titel)}</h1>${
    text ? `<p style="margin:14px 0 0;font:16px/1.65 Helvetica,Arial,sans-serif;color:${SOFT}">${esc(text)}</p>` : ''
  }</td></tr>`;

/* ---------- Vorlagen ---------- */

/** Ans Atelier: neue Terminanfrage, mit Schnellaktionen */
export function mailTerminAtelier(d: TerminDaten) {
  const vorname = d.name.split(' ')[0];
  const antwort = `mailto:${d.email}?subject=${encodeURIComponent('Ihr Termin bei The Sartorialist Zürich')}&body=${encodeURIComponent(
    `Grüezi ${d.name}\n\nGerne bestätigen wir Ihren Termin am ${d.wunschText}.\n\nWir freuen uns auf Sie im Atelier an der ${SITE.address.street}.\n\nFreundliche Grüsse\nThe Sartorialist Zürich`,
  )}`;
  const aktionen = [
    d.email ? knopf(antwort, 'Termin bestätigen') : '',
    d.telefon ? knopf(telHref(d.telefon), 'Anrufen', 'line') : '',
    d.telefon ? knopf(waHref(d.telefon, `Grüezi ${vorname}, hier ist The Sartorialist Zürich — gerne bestätigen wir Ihren Termin am ${d.wunschText}.`), 'WhatsApp', 'line') : '',
  ].join('');
  const html = rahmen(
    `Terminanfrage ${d.wunschText} — ${d.name}`,
    titelZeile('Neue Terminanfrage', `${d.name} möchte zur Beratung ins Atelier kommen.`) +
      `<tr><td style="padding:18px 36px 6px">${kicker('Wunschtermin')}<div style="padding:18px 20px;background:${INK};color:#ffffff;font:700 20px/1.35 Georgia,'Times New Roman',serif">${esc(d.wunschText || 'nach Absprache')}</div></td></tr>` +
      `<tr><td style="padding:24px 36px 6px">${kicker('Kunde')}${zeilen([
        ['Name', d.name],
        ['Telefon', d.telefon || ''],
        ['E-Mail', d.email || ''],
        ['Firma', [d.firma, d.brandDomain && d.brandDomain !== d.firma ? `(${d.brandDomain})` : ''].filter(Boolean).join(' ')],
        ['WhatsApp/SMS', d.einwilligung ? 'Ja, Bestätigung und Erinnerung erwünscht' : 'Nein'],
      ])}</td></tr>` +
      `<tr><td style="padding:22px 36px 18px">${aktionen}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:4px">Kalendereintrag im Anhang (Termin.ics) · Antworten gehen direkt an den Kunden.</div></td></tr>` +
      stilBlock(d),
  );
  const text = [
    `Neue Terminanfrage`,
    `Wunschtermin: ${d.wunschText}`,
    `Name: ${d.name}`,
    `Telefon: ${d.telefon || '–'}`,
    `E-Mail: ${d.email || '–'}`,
    d.firma || d.brandDomain ? `Firma: ${[d.firma, d.brandDomain].filter(Boolean).join(' · ')}` : '',
    `WhatsApp/SMS: ${d.einwilligung ? 'ja' : 'nein'}`,
    d.stoffe.length ? `Stoff: ${d.stoffe.join(', ')}` : '',
    ...d.stil.map((s) => `${s.kategorie} · ${s.untergruppe}: ${s.option}`),
  ]
    .filter(Boolean)
    .join('\n');
  return { html, text, subject: `Terminanfrage — ${d.wunschText} — ${d.name}` };
}

/** An den Kunden: Bestätigung der Anfrage */
export function mailTerminKunde(d: TerminDaten) {
  const vorname = d.name.split(' ')[0];
  const gcal = googleKalender(d);
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(`Grüezi, ich möchte meinen Termin vom ${d.wunschText} verschieben.`)}`;
  const html = rahmen(
    `Ihre Terminanfrage für ${d.wunschText}`,
    titelZeile(
      `Vielen Dank, ${vorname}.`,
      'Wir haben Ihre Terminanfrage erhalten und bestätigen Ihnen den Termin so rasch wie möglich — persönlich per Telefon oder E-Mail.',
    ) +
      `<tr><td style="padding:18px 36px 6px">${kicker('Ihr Wunschtermin')}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(
        d.wunschText || 'nach Absprache',
      )}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">Persönliche Beratung · 60–90 Minuten · kostenlos</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 6px">${gcal ? knopf(gcal, 'In Google Kalender', 'ink') : ''}${knopf(MAPS, 'Route planen', 'line')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:4px">Für Apple- und Outlook-Kalender: Anhang «Termin.ics» öffnen.</div></td></tr>` +
      `<tr><td style="padding:24px 36px 6px">${kicker('So läuft Ihre Beratung')}${zeilen([
        ['Ort', `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`],
        ['Ablauf', 'Gespräch, Stoffauswahl, Schnitt und Details, Massnehmen mit über 30 Parametern'],
        ['Mitbringen', 'Wenn möglich Schuhe und Hemd, die Sie zum Anzug tragen möchten'],
        ['Preis', 'Massanzüge ab CHF 1’690, in 20 Arbeitstagen abholbereit'],
      ])}</td></tr>` +
      stilBlock(d) +
      `<tr><td style="padding:6px 36px 32px">${kicker('Termin verschieben?')}<p style="margin:0 0 14px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${SOFT}">Kein Problem — schreiben Sie uns kurz oder rufen Sie an.</p>${knopf(wa, 'WhatsApp', 'gold')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}</td></tr>`,
  );
  const text = [
    `Grüezi ${d.name}`,
    '',
    `Vielen Dank für Ihre Terminanfrage für ${d.wunschText}. Wir bestätigen Ihnen den Termin so rasch wie möglich.`,
    '',
    `Atelier: ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`,
    `Telefon: ${SITE.phone}`,
    d.stoffe.length ? `\nStoff: ${d.stoffe.join(', ')}` : '',
    ...d.stil.map((s) => `${s.kategorie} · ${s.untergruppe}: ${s.option}`),
    '',
    'Freundliche Grüsse',
    'The Sartorialist Zürich',
  ]
    .filter((x) => x !== '')
    .join('\n');
  return { html, text, subject: 'Ihre Terminanfrage bei The Sartorialist Zürich' };
}

/** Ans Atelier: Rückrufbitte */
export function mailRueckruf(d: { name: string; telefon: string; wunsch: string; pfad: string }) {
  const html = rahmen(
    `Rückrufbitte ${d.name || d.telefon}`,
    titelZeile('Bitte um Rückruf', `${d.name || 'Ein Kunde'} möchte zurückgerufen werden.`) +
      `<tr><td style="padding:18px 36px 6px">${zeilen([
        ['Name', d.name || '–'],
        ['Telefon', d.telefon],
        ['Wunschzeit', d.wunsch || 'egal'],
        ['Gesendet von', d.pfad],
      ])}</td></tr>` +
      `<tr><td style="padding:22px 36px 32px">${knopf(telHref(d.telefon), `Jetzt anrufen`)}${knopf(waHref(d.telefon, `Grüezi${d.name ? ` ${d.name.split(' ')[0]}` : ''}, hier ist The Sartorialist Zürich — Sie hatten um einen Rückruf gebeten.`), 'WhatsApp', 'line')}</td></tr>`,
  );
  return { html, text: `Bitte um Rückruf\nName: ${d.name || '–'}\nTelefon: ${d.telefon}\nWunschzeit: ${d.wunsch || 'egal'}\nSeite: ${d.pfad}`, subject: `Rückrufbitte — ${d.name || d.telefon}` };
}

/* ---------- Admin: Login, Bestätigung, Vorschläge ---------- */

/** Login-Code für das Backend (6 Stellen, 10 Minuten gültig) */
export function mailLoginCode(code: string) {
  const html = rahmen(
    `${code} ist Ihr Anmeldecode`,
    titelZeile('Ihr Anmeldecode', 'Geben Sie diesen Code im Backend ein. Er ist 10 Minuten gültig und nur einmal verwendbar.') +
      `<tr><td style="padding:18px 36px 10px"><div style="padding:22px;background:${INK};color:#ffffff;text-align:center;font:700 34px/1 Helvetica,Arial,sans-serif;letter-spacing:12px">${esc(code)}</div></td></tr>` +
      `<tr><td style="padding:14px 36px 32px;font:13px/1.6 Helvetica,Arial,sans-serif;color:${MUTED}">Sie haben keinen Code angefordert? Dann können Sie diese E-Mail ignorieren.</td></tr>`,
  );
  return { html, text: `Ihr Anmeldecode: ${code}\n\nGültig für 10 Minuten.`, subject: `${code} ist Ihr Anmeldecode — The Sartorialist` };
}

/** An den Kunden: Termin verbindlich bestätigt (mit .ics, STATUS:CONFIRMED) */
export function mailTerminBestaetigt(d: TerminDaten & { nachricht?: string }) {
  const vorname = d.name.split(' ')[0];
  const gcal = googleKalender(d);
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(`Grüezi, ich möchte meinen Termin vom ${d.wunschText} verschieben.`)}`;
  const html = rahmen(
    `Ihr Termin am ${d.wunschText} ist bestätigt`,
    titelZeile(`Ihr Termin ist bestätigt, ${vorname}.`, d.nachricht || 'Wir freuen uns auf Ihren Besuch im Atelier.') +
      `<tr><td style="padding:18px 36px 6px">${kicker('Ihr Termin')}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(
        d.wunschText || '',
      )}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">Persönliche Beratung · 60–90 Minuten · ${esc(SITE.address.street)}, ${esc(SITE.address.city)}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 6px">${gcal ? knopf(gcal, 'In Google Kalender', 'ink') : ''}${knopf(MAPS, 'Route planen', 'line')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:4px">Für Apple- und Outlook-Kalender: Anhang «Termin.ics» öffnen.</div></td></tr>` +
      stilBlock(d) +
      `<tr><td style="padding:6px 36px 32px">${kicker('Termin verschieben?')}<p style="margin:0 0 14px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${SOFT}">Kein Problem — schreiben Sie uns kurz oder rufen Sie an.</p>${knopf(wa, 'WhatsApp', 'gold')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}</td></tr>`,
  );
  const text = [
    `Grüezi ${d.name}`,
    '',
    `Ihr Termin ist bestätigt: ${d.wunschText}.`,
    d.nachricht || '',
    '',
    `Atelier: ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`,
    `Telefon: ${SITE.phone}`,
    '',
    'Freundliche Grüsse',
    'The Sartorialist Zürich',
  ].join('\n');
  return { html, text, subject: `Termin bestätigt — ${d.wunschText}` };
}

/** An den Kunden: neue Terminvorschläge (1–3) */
export function mailTerminVorschlag(d: { name: string; vorschlaege: string[]; nachricht?: string }) {
  const vorname = d.name.split(' ')[0];
  const html = rahmen(
    'Neue Terminvorschläge',
    titelZeile(
      `Grüezi ${vorname}`,
      d.nachricht || 'Leider passt Ihr Wunschtermin nicht ganz. Gerne schlagen wir Ihnen folgende Termine vor — antworten Sie einfach mit Ihrer Wahl.',
    ) +
      `<tr><td style="padding:18px 36px 10px">${kicker('Unsere Vorschläge')}${d.vorschlaege
        .map(
          (v, i) =>
            `<div style="padding:16px 20px;margin:0 0 8px;background:${i === 0 ? INK : WARM};color:${i === 0 ? '#ffffff' : INK};font:700 18px/1.35 Georgia,'Times New Roman',serif">${esc(v)}</div>`,
        )
        .join('')}</td></tr>` +
      `<tr><td style="padding:14px 36px 32px">${knopf(`mailto:${SITE.email}?subject=${encodeURIComponent('Terminwahl')}`, 'Per E-Mail antworten')}${knopf(SITE.whatsapp, 'WhatsApp', 'gold')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}</td></tr>`,
  );
  const text = [`Grüezi ${d.name}`, '', d.nachricht || 'Gerne schlagen wir Ihnen folgende Termine vor:', '', ...d.vorschlaege.map((v) => `– ${v}`), '', 'Freundliche Grüsse', 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: 'Terminvorschläge — The Sartorialist Zürich' };
}
