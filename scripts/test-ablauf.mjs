// Durchspielen des Gesamtprozesses gegen einen laufenden lokalen Server (ohne Resend, Login-Code kommt als devCode):
// Anfrage → Lead → Termin bestätigen → Angebot → Online-Annahme über den Token-Link → Kunde + Auftrag →
// Tasks/Status/Liefertermin → Anzahlung + Schlussrechnung mit QR → Zahlungen → abgeschlossen.
// Aufruf: node scripts/test-ablauf.mjs http://localhost:3117 [ordner-fuer-pdfs]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const BASIS = process.argv[2] ?? 'http://localhost:3000';
const ORDNER = process.argv[3];
if (ORDNER) mkdirSync(ORDNER, { recursive: true });
let cookie = '';
let fehlerZahl = 0;

const ok = (bed, text) => {
  console.log(`${bed ? '✓' : '✗'} ${text}`);
  if (!bed) fehlerZahl++;
};

async function api(pfad, body, methode = 'POST', erwartet = 200) {
  const r = await fetch(BASIS + pfad, {
    method: methode,
    headers: { 'Content-Type': 'application/json', Origin: BASIS, ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  });
  const sc = r.headers.get('set-cookie');
  if (sc && /ts_admin=/.test(sc)) cookie = sc.split(';')[0];
  const typ = r.headers.get('content-type') ?? '';
  const daten = typ.includes('json') ? await r.json() : typ.includes('pdf') ? Buffer.from(await r.arrayBuffer()) : await r.text();
  if (r.status !== erwartet) throw new Error(`${methode} ${pfad} → ${r.status} ${typeof daten === 'object' && !Buffer.isBuffer(daten) ? JSON.stringify(daten) : String(daten).slice(0, 200)}`);
  return daten;
}
const seite = async (pfad) => {
  const r = await fetch(BASIS + pfad, { headers: cookie ? { Cookie: cookie } : {} });
  return { status: r.status, html: await r.text() };
};

async function main() {
  const email = `test.${Date.now()}@beispiel.ch`;
  // 1. Anfrage über die Website (wie BookingWizard)
  const morgen = new Date(Date.now() + 3 * 86400_000);
  while (morgen.getDay() === 0) morgen.setDate(morgen.getDate() + 1);
  const datum = morgen.toISOString().slice(0, 10);
  await api('/api/anfrage/', { art: 'termin', name: 'Test Kunde Ablauf', email, telefon: '079 555 12 34', datum, zeit: '14:00', wunsch: `${datum} 14:00`, stil: [{ kategorie: 'Sakko', untergruppe: 'Revers', option: 'Steigendes Revers 9 cm' }], stoffe: ['HS4471'], pfad: '/termin/', sprache: 'de' });
  ok(true, 'Anfrage über /api/anfrage/ gespeichert');

  // 2. Login (devCode)
  const c = await api('/api/login/code/', { email: 'store@thesartorialist.ch' });
  ok(Boolean(c.devCode), 'Login-Code (lokal) erhalten');
  await api('/api/login/pruefen/', { email: 'store@thesartorialist.ch', code: c.devCode });
  ok(Boolean(cookie), 'Angemeldet (Sitzungs-Cookie)');

  // 3. Lead in der Pipeline finden
  const leads = await seite('/admin/leads/');
  ok(leads.status === 200 && leads.html.includes('Test Kunde Ablauf'), 'Neuer Lead erscheint in der Pipeline');
  const kontaktId = /\/admin\/kontakte\/([0-9a-f-]{36})\/"[^>]*>(?:(?!<\/a>).)*Test Kunde Ablauf/s.exec(leads.html)?.[1];
  ok(Boolean(kontaktId), `Kontakt-ID gefunden (${kontaktId})`);
  const akte = await seite(`/admin/kontakte/${kontaktId}/`);
  ok(akte.status === 200 && akte.html.includes('Stil-Auswahl aus dem Konfigurator'), 'Kundenakte zeigt die Anfrage mit Stil-Auswahl');
  const terminId = /\/admin\/termine\/([0-9a-f-]{36})\//.exec(akte.html)?.[1];

  // 4. Termin bestätigen → Phase «Termin vereinbart»
  const start = new Date(`${datum}T13:00:00Z`).toISOString();
  await api(`/api/admin/termine/${terminId}/`, { aktion: 'bestaetigen', start, mail: false });
  ok(true, 'Termin bestätigt');

  // 5. Angebot mit Stil aus der Anfrage
  const an = await api('/api/admin/angebote/', { kontaktId, terminId });
  ok(/^AN-\d{4}-\d{4}$/.test(an.nummer), `Angebot ${an.nummer} erstellt`);
  const pos = [
    { kategorie: 'massanzug', bezeichnung: 'Massanzug zweiteilig', beschreibung: 'Full-Canvas, Made in Italy', stoffnummer: 'HS4471', menge: 1, einzelpreisRp: 169000 },
    { kategorie: 'hemd', bezeichnung: 'Hemd nach Mass', menge: 2, einzelpreisRp: 24000 },
  ];
  const p = await api(`/api/admin/angebote/${an.id}/`, { titel: 'Massanzug Testlauf', positionen: pos, rabattProzent: 5 }, 'PATCH');
  ok(p.totalRp === 206150 && p.mwstRp === 15447, `Total ${p.totalRp / 100} inkl. MWST ${p.mwstRp / 100} (5 % Rabatt, auf 5 Rp. gerundet)`);
  const pdfA = await api(`/api/admin/angebote/${an.id}/pdf/`, undefined, 'GET');
  ok(Buffer.isBuffer(pdfA) && pdfA.subarray(0, 4).toString() === '%PDF', `Angebots-PDF (${pdfA.length} Bytes)`);
  if (ORDNER) writeFileSync(path.join(ORDNER, 'test-angebot.pdf'), pdfA);
  const l = await api(`/api/admin/angebote/${an.id}/`, { aktion: 'link' });
  const token = l.link.split('/angebot/')[1].replace(/\/$/, '');
  ok(token.length >= 43, `Annahme-Link erstellt (Token ${token.length} Zeichen)`);

  // 6. Öffentliche Seite + falsche Tokens
  const oeff = await fetch(`${BASIS}/angebot/${token}/`);
  const oeffHtml = await oeff.text();
  ok(oeff.status === 200 && oeffHtml.includes('Massanzug Testlauf') && /noindex/.test(oeffHtml), 'Angebotsseite öffentlich sichtbar, noindex');
  const falsch = await fetch(`${BASIS}/angebot/${'x'.repeat(43)}/`);
  ok((await falsch.text()).includes('Link nicht mehr gültig'), 'Ungültiger Token zeigt keine Daten');
  const r404 = await fetch(`${BASIS}/api/angebot/${'y'.repeat(43)}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS }, body: JSON.stringify({ aktion: 'annehmen', name: 'X', bestaetigt: true }) });
  ok(r404.status === 404, 'Annahme mit falschem Token → 404');
  const ohne = await fetch(`${BASIS}/api/angebot/${token}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS }, body: JSON.stringify({ aktion: 'annehmen', name: 'Test Kunde Ablauf' }) });
  ok(ohne.status === 400, 'Annahme ohne Bestätigung abgelehnt');

  // 7. Online annehmen
  const annahme = await fetch(`${BASIS}/api/angebot/${token}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS }, body: JSON.stringify({ aktion: 'annehmen', name: 'Test Kunde Ablauf', bestaetigt: true }) });
  ok(annahme.status === 200, 'Angebot online angenommen');
  const akte2 = await seite(`/admin/kontakte/${kontaktId}/`);
  ok(akte2.html.includes('k-kunde'), 'Kontakt ist jetzt Kunde');
  const auftragId = /\/admin\/auftraege\/([0-9a-f-]{36})\//.exec(akte2.html)?.[1];
  ok(Boolean(auftragId), 'Auftrag eröffnet');

  // 8. Planung: Tasks, Status, Liefertermin, Anprobe
  let au = await seite(`/admin/auftraege/${auftragId}/`);
  ok(au.html.includes('Stoff bei Holland &amp; Sherry bestellen'), 'Standard-Aufgaben angelegt');
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'task-neu', titel: 'Knöpfe aus Horn bestätigen', faelligAm: datum });
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'bestellt' });
  const lt = new Date(Date.now() + 25 * 86400_000).toISOString().slice(0, 10);
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'produktion', liefertermin: lt });
  await api(`/api/admin/auftraege/${auftragId}/`, { anlass: 'Hochzeit', anlassDatum: new Date(Date.now() + 45 * 86400_000).toISOString().slice(0, 10) }, 'PATCH');
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'eingang' });
  const anprobe = new Date(Date.now() + 30 * 86400_000);
  anprobe.setUTCHours(14, 0, 0, 0);
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'termin', zweck: 'anprobe', start: anprobe.toISOString() });
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'anprobe' });
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'aenderung' });
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'fertig', mail: false });
  au = await seite(`/admin/auftraege/${auftragId}/`);
  ok(au.html.includes('Fertig · abholbereit') && au.html.includes('Anprobe'), 'Status «abholbereit», Liefertermin und Anprobe geplant');

  // 9. Anzahlung + Schlussrechnung mit QR
  const fz = await api('/api/admin/firma/', { schluessel: 'firma', wert: { iban: 'CH93 0076 2011 6238 5295 7' } }, 'PUT');
  ok(fz.firma.iban.startsWith('CH93'), 'IBAN in den Firmeneinstellungen');
  const anz = await api('/api/admin/rechnungen/', { auftragId, art: 'anzahlung', prozent: 50 });
  await api(`/api/admin/rechnungen/${anz.id}/`, { aktion: 'festschreiben' });
  await api(`/api/admin/rechnungen/${anz.id}/`, { aktion: 'zahlung', betragRp: 103075, art: 'twint' });
  const sr = await api('/api/admin/rechnungen/', { auftragId, art: 'schluss' });
  await api(`/api/admin/rechnungen/${sr.id}/`, { aktion: 'festschreiben' });
  const pdfR = await api(`/api/admin/rechnungen/${sr.id}/pdf/`, undefined, 'GET');
  ok(pdfR.subarray(0, 4).toString() === '%PDF', `Schlussrechnung ${sr.nummer} als PDF mit QR-Zahlteil (${pdfR.length} Bytes)`);
  if (ORDNER) writeFileSync(path.join(ORDNER, 'test-schlussrechnung.pdf'), pdfR);
  const reSeite = await seite(`/admin/rechnungen/${sr.id}/`);
  ok(reSeite.html.includes('abzüglich Anzahlung') && reSeite.html.includes('1’030.75'), 'Schlussrechnung zieht die Anzahlung ab (zu bezahlen CHF 1’030.75)');

  // 10. Abholung + Restzahlung → abgeschlossen
  await api(`/api/admin/auftraege/${auftragId}/`, { aktion: 'status', status: 'abgeholt' });
  const z = await api(`/api/admin/rechnungen/${sr.id}/`, { aktion: 'zahlung', betragRp: 103075, art: 'karte' });
  ok(z.status === 'bezahlt' && /abgeschlossen/.test(z.meldung), `Restzahlung → ${z.meldung}`);
  const auEnde = await seite(`/admin/auftraege/${auftragId}/`);
  ok(auEnde.html.includes('au-abgeschlossen'), 'Auftrag abgeschlossen');

  // 11. Massblatt mit Version + PDF
  const m1 = await api('/api/admin/massblaetter/', { kontaktId, masse: { 'sakko.brust': '101,5', 'hose.bund': 88 }, koerper: ['Bauch'], auftragId });
  const m2 = await api('/api/admin/massblaetter/', { kontaktId, masse: { 'sakko.brust': 102, 'hose.bund': 87.5 }, koerper: ['Bauch', 'Uhr links'] });
  const pdfM = await api(`/api/admin/massblaetter/${m2.id}/pdf/`, undefined, 'GET');
  ok(pdfM.subarray(0, 4).toString() === '%PDF' && m1.id !== m2.id, 'Massblatt V2 mit Vergleich als PDF');
  if (ORDNER) writeFileSync(path.join(ORDNER, 'test-massblatt.pdf'), pdfM);

  // 12. Seiten erreichbar
  for (const s of ['/admin/uebersicht/', '/admin/kunden/', '/admin/angebote/', '/admin/auftraege/', '/admin/auftraege/?ansicht=zeitstrahl', '/admin/rechnungen/', '/admin/massblaetter/', '/admin/einstellungen/', `/admin/massblaetter/${m2.id}/`, `/admin/angebote/${an.id}/`]) {
    const x = await seite(s);
    ok(x.status === 200 && !x.html.includes('Application error'), `Seite ${s} → ${x.status}`);
  }
  console.log(fehlerZahl ? `\n${fehlerZahl} Prüfung(en) fehlgeschlagen` : '\nAlle Prüfungen bestanden.');
  console.log(JSON.stringify({ kontaktId, angebotId: an.id, auftragId, rechnungId: sr.id, massblattId: m2.id, token }));
  process.exitCode = fehlerZahl ? 1 : 0;
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exitCode = 1;
});
