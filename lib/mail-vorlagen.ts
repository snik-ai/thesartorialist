// Gebrandete E-Mails (Termin, Rückruf) — Tabellen-Layout für alle Mailprogramme,
// keine externen Schriften/Bilder, Dunkelmodus-tauglich durch feste Flächenfarben.
// Termine bekommen einen Kalendereintrag (.ics) und einen Google-Kalender-Link.
// Kundenmails in der Sprache des Kunden (Texte: lib/i18n/<sprache>/mail.ts, Standard Deutsch);
// Mails ans Atelier bleiben Deutsch.
import { SITE } from './site';
import { mail as MAIL_DE } from './i18n/de/mail';

export type MailTexte = typeof MAIL_DE;
const f = (s: string, w: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in w ? String(w[k]) : m));
const adresse = () => `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`;

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

export function icsDatei(d: TerminDaten, fuer: 'kunde' | 'atelier', status: 'TENTATIVE' | 'CONFIRMED' = 'TENTATIVE', t: MailTexte = MAIL_DE) {
  const z = zeitraum(d);
  if (!z) return null;
  const tt = fuer === 'kunde' ? t : MAIL_DE;
  const titel = fuer === 'kunde' ? t.kalenderTitel : `Beratung: ${d.name}`;
  const beschr = [
    fuer === 'atelier' ? `Telefon: ${d.telefon || '–'}\\nE-Mail: ${d.email || '–'}` : f(t.icsTelefon, { telefon: SITE.phone }),
    d.stoffe.length ? f(tt.icsStoff, { stoffe: d.stoffe.join(', ') }) : '',
    d.stil.length ? f(tt.icsStil, { n: d.stil.length }) : '',
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

function googleKalender(d: TerminDaten, t: MailTexte) {
  const z = zeitraum(d);
  if (!z) return null;
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: t.kalenderTitel,
    dates: `${z.start}/${z.ende}`,
    ctz: 'Europe/Zurich',
    location: adresse(),
    details: f(t.kalenderDetails, { telefon: SITE.phone }),
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

function stilBlock(d: TerminDaten, t: MailTexte = MAIL_DE) {
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
    ? `<tr><td colspan="2" style="padding:18px 0 6px;font:700 11px/1 Helvetica,Arial,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:${INK}">${esc(t.stoffKicker)}</td></tr><tr><td colspan="2" style="padding:10px 14px;background:${WARM};font:700 17px/1.4 Helvetica,Arial,sans-serif;letter-spacing:1px;color:${INK}">${d.stoffe.map(esc).join(' &nbsp;·&nbsp; ')}</td></tr>`
    : '';
  return `<tr><td style="padding:8px 36px 28px">${kicker(f(t.stilKicker, { n: d.stil.length }))}<table width="100%" cellpadding="0" cellspacing="0" role="presentation">${stoff}${teile}</table></td></tr>`;
}

function rahmen(vorschau: string, inhalt: string, t: MailTexte = MAIL_DE) {
  return `<!doctype html><html lang="${t.htmlLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(vorschau)}</title></head>
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
${esc(t.fussZeiten)}</td></tr>
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

/** An den Kunden: Bestätigung der Anfrage (in der Sprache des Kunden, Standard Deutsch) */
export function mailTerminKunde(d: TerminDaten, t: MailTexte = MAIL_DE) {
  const e = t.eingang;
  const vorname = d.name.split(' ')[0];
  const gcal = googleKalender(d, t);
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(f(t.waVerschieben, { termin: d.wunschText ?? '' }))}`;
  const html = rahmen(
    f(e.vorschau, { termin: d.wunschText ?? '' }),
    titelZeile(f(e.titel, { vorname }), e.text) +
      `<tr><td style="padding:18px 36px 6px">${kicker(e.kicker)}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(
        d.wunschText || t.nachAbsprache,
      )}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">${esc(e.unterzeile)}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 6px">${gcal ? knopf(gcal, t.inGoogleKalender, 'ink') : ''}${knopf(MAPS, t.routePlanen, 'line')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:4px">${esc(t.icsHinweis)}</div></td></tr>` +
      `<tr><td style="padding:24px 36px 6px">${kicker(e.ablaufKicker)}${zeilen([
        [e.zeilen.ort, adresse()],
        [e.zeilen.ablauf, e.zeilen.ablaufText],
        [e.zeilen.mitbringen, e.zeilen.mitbringenText],
        [e.zeilen.preis, e.zeilen.preisText],
      ])}</td></tr>` +
      stilBlock(d, t) +
      `<tr><td style="padding:6px 36px 32px">${kicker(t.verschiebenKicker)}<p style="margin:0 0 14px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${SOFT}">${esc(t.verschiebenText)}</p>${knopf(wa, 'WhatsApp', 'gold')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}</td></tr>`,
    t,
  );
  const text = [
    f(t.gruss, { name: d.name }),
    '',
    f(e.textDanke, { termin: d.wunschText ?? '' }),
    '',
    f(e.textAtelier, { adresse: adresse() }),
    f(e.textTelefon, { telefon: SITE.phone }),
    d.stoffe.length ? `\n${f(e.textStoff, { stoffe: d.stoffe.join(', ') })}` : '',
    ...d.stil.map((s) => `${s.kategorie} · ${s.untergruppe}: ${s.option}`),
    '',
    t.grussFormel,
    t.signatur,
  ]
    .filter((x) => x !== '')
    .join('\n');
  return { html, text, subject: e.betreff };
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

/** Ans Atelier: Ratgeber «Der passende Anzug» heruntergeladen (Lead mit Name + Telefon) */
export function mailRatgeber(d: { name: string; telefon: string; pfad: string; einwilligung: boolean; kontaktUrl?: string }) {
  const vorname = d.name ? ` ${d.name.split(' ')[0]}` : '';
  const html = rahmen(
    `Ratgeber-Download ${d.name || d.telefon}`,
    titelZeile('Ratgeber heruntergeladen', `${d.name || 'Ein Interessent'} hat den Ratgeber «Der passende Anzug» geöffnet — ein guter Moment für einen persönlichen Anruf.`) +
      `<tr><td style="padding:18px 36px 6px">${zeilen([
        ['Name', d.name || '–'],
        ['Telefon', d.telefon],
        ['WhatsApp/SMS', d.einwilligung ? 'Einwilligung erteilt' : 'keine Einwilligung (nur Anruf)'],
        ['Gesendet von', d.pfad],
      ])}</td></tr>` +
      `<tr><td style="padding:22px 36px 32px">${knopf(telHref(d.telefon), 'Jetzt anrufen')}${d.einwilligung ? knopf(waHref(d.telefon, `Grüezi${vorname}, hier ist The Sartorialist Zürich — danke für Ihr Interesse an unserem Ratgeber. Dürfen wir Sie zu einer kostenlosen Beratung einladen?`), 'WhatsApp', 'line') : ''}${d.kontaktUrl ? knopf(d.kontaktUrl, 'Im Backend öffnen', 'line') : ''}</td></tr>`,
  );
  return {
    html,
    text: `Ratgeber heruntergeladen\nName: ${d.name || '–'}\nTelefon: ${d.telefon}\nWhatsApp/SMS: ${d.einwilligung ? 'Einwilligung erteilt' : 'keine Einwilligung'}\nSeite: ${d.pfad}${d.kontaktUrl ? `\nBackend: ${d.kontaktUrl}` : ''}`,
    subject: `Ratgeber-Download — ${d.name || d.telefon}`,
  };
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
export function mailTerminBestaetigt(d: TerminDaten & { nachricht?: string }, t: MailTexte = MAIL_DE) {
  const b = t.bestaetigt;
  const vorname = d.name.split(' ')[0];
  const gcal = googleKalender(d, t);
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(f(t.waVerschieben, { termin: d.wunschText ?? '' }))}`;
  const html = rahmen(
    f(b.vorschau, { termin: d.wunschText ?? '' }),
    titelZeile(f(b.titel, { vorname }), d.nachricht || b.text) +
      `<tr><td style="padding:18px 36px 6px">${kicker(b.kicker)}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(
        d.wunschText || '',
      )}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">${esc(f(b.unterzeile, { adresse: `${SITE.address.street}, ${SITE.address.city}` }))}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 6px">${gcal ? knopf(gcal, t.inGoogleKalender, 'ink') : ''}${knopf(MAPS, t.routePlanen, 'line')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:4px">${esc(t.icsHinweis)}</div></td></tr>` +
      stilBlock(d, t) +
      `<tr><td style="padding:6px 36px 32px">${kicker(t.verschiebenKicker)}<p style="margin:0 0 14px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${SOFT}">${esc(t.verschiebenText)}</p>${knopf(wa, 'WhatsApp', 'gold')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}</td></tr>`,
    t,
  );
  const text = [
    f(t.gruss, { name: d.name }),
    '',
    f(b.textBestaetigt, { termin: d.wunschText ?? '' }),
    d.nachricht || '',
    '',
    f(t.eingang.textAtelier, { adresse: adresse() }),
    f(t.eingang.textTelefon, { telefon: SITE.phone }),
    '',
    t.grussFormel,
    t.signatur,
  ].join('\n');
  return { html, text, subject: f(b.betreff, { termin: d.wunschText ?? '' }) };
}

/** An den Kunden: neue Terminvorschläge (1–3) */
export function mailTerminVorschlag(d: { name: string; vorschlaege: string[]; nachricht?: string }, t: MailTexte = MAIL_DE) {
  const v = t.vorschlag;
  const vorname = d.name.split(' ')[0];
  const html = rahmen(
    v.vorschau,
    titelZeile(f(t.gruss, { name: vorname }), d.nachricht || v.text) +
      `<tr><td style="padding:18px 36px 10px">${kicker(v.kicker)}${d.vorschlaege
        .map(
          (v, i) =>
            `<div style="padding:16px 20px;margin:0 0 8px;background:${i === 0 ? INK : WARM};color:${i === 0 ? '#ffffff' : INK};font:700 18px/1.35 Georgia,'Times New Roman',serif">${esc(v)}</div>`,
        )
        .join('')}</td></tr>` +
      `<tr><td style="padding:14px 36px 32px">${knopf(`mailto:${SITE.email}?subject=${encodeURIComponent(v.antwortBetreff)}`, v.perMail)}${knopf(SITE.whatsapp, 'WhatsApp', 'gold')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}</td></tr>`,
    t,
  );
  const text = [f(t.gruss, { name: d.name }), '', d.nachricht || v.textKurz, '', ...d.vorschlaege.map((x) => `– ${x}`), '', t.grussFormel, t.signatur].join('\n');
  return { html, text, subject: v.betreff };
}

/* ---------- Termin-Erinnerung (2 h vorher), in der Sprache des Kunden ---------- */

export type ErinnerungZweck = 'beratung' | 'massnehmen' | 'anprobe' | 'abholung';

/** An den Kunden: Erinnerung kurz vor dem Termin. Unbestätigt = Wunschtermin mit Hinweis, dass wir uns ggf. melden. */
export function mailTerminErinnerung(d: TerminDaten & { bestaetigt: boolean; zweck: ErinnerungZweck }, t: MailTexte = MAIL_DE) {
  const e = t.erinnerung;
  const vorname = d.name.split(' ')[0] || d.name;
  const termin = d.wunschText ?? '';
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(f(t.waVerschieben, { termin }))}`;
  const html = rahmen(
    f(e.vorschau, { termin }),
    titelZeile(f(e.titel, { vorname }), d.bestaetigt ? e.text : e.textWunsch) +
      `<tr><td style="padding:18px 36px 6px">${kicker(d.bestaetigt ? e.kicker : e.kickerWunsch)}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(
        termin,
      )}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">${esc(`${e.zweck[d.zweck]} · ${adresse()}`)}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 32px">${knopf(MAPS, t.routePlanen, 'ink')}${knopf(telHref(SITE.phone), SITE.phone, 'line')}${knopf(wa, 'WhatsApp', 'gold')}</td></tr>`,
    t,
  );
  const text = [f(t.gruss, { name: d.name }), '', d.bestaetigt ? e.text : e.textWunsch, '', `${termin} — ${e.zweck[d.zweck]}`, adresse(), f(t.eingang.textTelefon, { telefon: SITE.phone }), '', t.grussFormel, t.signatur].join('\n');
  return { html, text, subject: f(d.bestaetigt ? e.betreff : e.betreffWunsch, { termin }) };
}

/* ---------- Angebot, Auftrag, Rechnung (Deutsch) ---------- */

const chfMail = (rp: number) => `CHF ${(rp / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
const anredeName = (name: string, anrede?: string | null) => (anrede ? `${anrede} ${name.split(' ').slice(-1)[0]}` : name);

/** An den Kunden: Angebot mit Online-Annahme-Link und PDF im Anhang */
export function mailAngebot(d: { name: string; anrede?: string | null; nummer: string; titel: string; totalRp: number; gueltigBis?: string; link: string; nachricht?: string }) {
  const html = rahmen(
    `Ihr Angebot ${d.nummer} — ${d.titel}`,
    titelZeile(`Ihr Angebot, ${anredeName(d.name, d.anrede)}.`, d.nachricht || 'Vielen Dank für Ihren Besuch. Gerne senden wir Ihnen unser Angebot für Ihre Massanfertigung — Sie können es online ansehen und mit einem Klick annehmen.') +
      `<tr><td style="padding:18px 36px 6px">${kicker(`Angebot ${d.nummer}`)}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(d.titel)}</div><div style="font:600 17px/1.5 Helvetica,Arial,sans-serif;color:#ffffff;margin-top:8px">${esc(chfMail(d.totalRp))}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:2px">${esc(d.gueltigBis ? `inkl. MWST · gültig bis ${d.gueltigBis}` : 'inkl. MWST')}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 8px">${knopf(d.link, 'Angebot ansehen & annehmen', 'gold')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:4px">Das Angebot liegt zusätzlich als PDF bei.</div></td></tr>` +
      `<tr><td style="padding:14px 36px 32px">${kicker('Fragen zum Angebot?')}<p style="margin:0 0 14px;font:14px/1.6 Helvetica,Arial,sans-serif;color:${SOFT}">Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.</p>${knopf(telHref(SITE.phone), SITE.phone, 'line')}${knopf(SITE.whatsapp, 'WhatsApp', 'line')}</td></tr>`,
  );
  const text = [`Grüezi ${d.name}`, '', d.nachricht || 'Gerne senden wir Ihnen unser Angebot für Ihre Massanfertigung.', '', `Angebot ${d.nummer}: ${d.titel}`, `Total ${chfMail(d.totalRp)} inkl. MWST${d.gueltigBis ? `, gültig bis ${d.gueltigBis}` : ''}`, '', `Online ansehen und annehmen: ${d.link}`, '', 'Freundliche Grüsse', 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: `Ihr Angebot ${d.nummer} — The Sartorialist Zürich` };
}

/** An den Kunden: Bestätigung nach der Annahme (Auftragsbestätigung) */
export function mailAuftragBestaetigt(d: { name: string; anrede?: string | null; angebotNummer: string; auftragNummer: string; titel: string; totalRp: number }) {
  const html = rahmen(
    `Auftrag ${d.auftragNummer} bestätigt`,
    titelZeile(`Herzlichen Dank, ${anredeName(d.name, d.anrede)}.`, 'Wir haben Ihre Zusage erhalten und beginnen mit Ihrer Massanfertigung. Als Nächstes bestellen wir den Stoff und melden uns für die Anprobe.') +
      `<tr><td style="padding:18px 36px 6px">${kicker('Ihr Auftrag')}${zeilen([
        ['Auftrag', d.auftragNummer],
        ['Angebot', d.angebotNummer],
        ['Bezeichnung', d.titel],
        ['Total', `${chfMail(d.totalRp)} inkl. MWST`],
      ])}</td></tr>` +
      `<tr><td style="padding:22px 36px 32px">${kicker('So geht es weiter')}<p style="margin:0;font:14px/1.7 Helvetica,Arial,sans-serif;color:${SOFT}">1 · Stoff und Material werden bestellt<br>2 · Fertigung in Italien<br>3 · Anprobe im Atelier, Feinanpassungen<br>4 · Abholung — wir melden uns, sobald alles bereit ist</p></td></tr>`,
  );
  const text = [`Grüezi ${d.name}`, '', 'Herzlichen Dank für Ihre Zusage. Wir beginnen mit Ihrer Massanfertigung.', '', `Auftrag: ${d.auftragNummer}`, `Angebot: ${d.angebotNummer}`, `${d.titel} — ${chfMail(d.totalRp)} inkl. MWST`, '', 'Freundliche Grüsse', 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: `Auftragsbestätigung ${d.auftragNummer} — The Sartorialist Zürich` };
}

/** Ans Atelier: Angebot wurde online angenommen */
export function mailAngebotAngenommenAtelier(d: { name: string; angebotNummer: string; auftragNummer: string; titel: string; totalRp: number; link: string }) {
  const html = rahmen(
    `Angebot ${d.angebotNummer} angenommen`,
    titelZeile('Angebot angenommen', `${d.name} hat das Angebot ${d.angebotNummer} online angenommen. Der Auftrag ${d.auftragNummer} ist eröffnet.`) +
      `<tr><td style="padding:18px 36px 6px">${zeilen([
        ['Kunde', d.name],
        ['Angebot', `${d.angebotNummer} · ${d.titel}`],
        ['Total', chfMail(d.totalRp)],
        ['Auftrag', d.auftragNummer],
      ])}</td></tr><tr><td style="padding:22px 36px 32px">${knopf(d.link, 'Auftrag öffnen')}</td></tr>`,
  );
  return { html, text: `${d.name} hat das Angebot ${d.angebotNummer} angenommen (${chfMail(d.totalRp)}). Auftrag ${d.auftragNummer}: ${d.link}`, subject: `Angenommen: ${d.angebotNummer} — ${d.name}` };
}

/** An den Kunden: Rechnung (PDF mit QR-Zahlteil im Anhang) */
export function mailRechnung(d: { name: string; anrede?: string | null; nummer: string; art: 'rechnung' | 'anzahlung' | 'schluss'; titel: string; betragRp: number; faellig?: string; nachricht?: string }) {
  const artText = d.art === 'anzahlung' ? 'Anzahlungsrechnung' : d.art === 'schluss' ? 'Schlussrechnung' : 'Rechnung';
  const html = rahmen(
    `${artText} ${d.nummer}`,
    titelZeile(`Ihre ${artText}, ${anredeName(d.name, d.anrede)}.`, d.nachricht || 'Herzlichen Dank für Ihren Auftrag. Im Anhang finden Sie die Rechnung mit QR-Zahlteil — scannen Sie den Code einfach mit Ihrer Banking-App.') +
      `<tr><td style="padding:18px 36px 6px">${kicker(`${artText} ${d.nummer}`)}<div style="padding:20px 22px;background:${INK};color:#ffffff"><div style="font:700 21px/1.35 Georgia,'Times New Roman',serif">${esc(chfMail(d.betragRp))}</div><div style="font:13px/1.6 Helvetica,Arial,sans-serif;color:#d8d4cc;margin-top:6px">${esc([d.titel, d.faellig ? `zahlbar bis ${d.faellig}` : ''].filter(Boolean).join(' · '))}</div></div></td></tr>` +
      `<tr><td style="padding:22px 36px 32px;font:13px/1.6 Helvetica,Arial,sans-serif;color:${MUTED}">Fragen zur Rechnung? Antworten Sie einfach auf diese E-Mail.</td></tr>`,
  );
  const text = [`Grüezi ${d.name}`, '', d.nachricht || 'Im Anhang finden Sie die Rechnung mit QR-Zahlteil.', '', `${artText} ${d.nummer}: ${chfMail(d.betragRp)}${d.faellig ? `, zahlbar bis ${d.faellig}` : ''}`, '', 'Freundliche Grüsse', 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: `${artText} ${d.nummer} — The Sartorialist Zürich` };
}

/** An den Kunden: Massanfertigung ist abholbereit */
export function mailAbholbereit(d: { name: string; anrede?: string | null; titel: string; auftragNummer: string }) {
  const html = rahmen(
    'Ihre Massanfertigung ist bereit',
    titelZeile(`Es ist so weit, ${anredeName(d.name, d.anrede)}.`, `Ihre Massanfertigung «${d.titel}» ist fertig und wartet im Atelier auf Sie. Wann passt es Ihnen für die Abholung?`) +
      `<tr><td style="padding:18px 36px 32px">${knopf(telHref(SITE.phone), SITE.phone, 'ink')}${knopf(SITE.whatsapp, 'WhatsApp', 'gold')}${knopf(MAPS, 'Route planen', 'line')}<div style="font:12px/1.5 Helvetica,Arial,sans-serif;color:${MUTED};margin-top:6px">Auftrag ${esc(d.auftragNummer)} · ${esc(adresse())}</div></td></tr>`,
  );
  const text = [`Grüezi ${d.name}`, '', `Ihre Massanfertigung «${d.titel}» ist abholbereit. Wann passt es Ihnen?`, `Atelier: ${adresse()}`, `Telefon: ${SITE.phone}`, '', 'Freundliche Grüsse', 'The Sartorialist Zürich'].join('\n');
  return { html, text, subject: 'Ihre Massanfertigung ist abholbereit — The Sartorialist Zürich' };
}

/** Bausteine für weitere Kundenmails (lib/beleg/mails.ts: Mahnungen in der Kundensprache) */
export const mailBausteine = { rahmen, titelZeile, kicker, knopf, zeilen, esc, chfMail, telHref, farben: { INK, SOFT, MUTED, LINE, WARM, GOLD } };
