// Teilzahlung und Mahnwesen gegen einen laufenden lokalen Server (ohne Resend, Login-Code kommt als devCode):
// Auftrag mit Zahlungsplan 50/50 → Rate 1 bezahlt → Rate 2 überfällig → Zahlungserinnerung → 1. Mahnung (Gebühr)
// → Restzahlung inkl. Gebühr → bezahlt → Auftrag abgeschlossen. Dazu ein Auftrag «Ganz» mit einer Rechnung.
// Aufruf: node scripts/test-teilzahlung.mjs http://localhost:3142 [ordner-fuer-pdfs]
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
const tag = (tage) => new Date(Date.now() + tage * 86400_000).toISOString().slice(0, 10);
const pdfOk = (b) => Buffer.isBuffer(b) && b.subarray(0, 4).toString() === '%PDF';

/** Angebot mit Positionen (neues Format) für den Kontakt, im Atelier angenommen → Auftrag */
async function auftragFuer(kontaktId, titel, positionen) {
  const an = await api('/api/admin/angebote/', { kontaktId });
  await api(`/api/admin/angebote/${an.id}/`, { titel, positionen }, 'PATCH');
  const a = await api(`/api/admin/angebote/${an.id}/`, { aktion: 'annehmen', name: 'Test Teilzahlung' });
  ok(Boolean(a.auftragId), `${titel}: Angebot ${an.nummer} angenommen → Auftrag`);
  return a.auftragId;
}

async function teilzahlungUndMahnung(kontaktId) {
  const auftragId = await auftragFuer(kontaktId, 'Massanzug Teilzahlung', [
    { art: 'position', bezeichnung: 'Massanzug zweiteilig · Super 130', menge: 1, einheit: 'Stk.', einzelpreisRp: 189000, mwstSatz: 8.1 },
    { art: 'position', bezeichnung: 'Hemd nach Mass', menge: 1, einheit: 'Stk.', einzelpreisRp: 25000, mwstSatz: 8.1 },
  ]);
  const U = `/api/admin/auftraege/${auftragId}/`;

  // Plan prüfen (falsch) und setzen (50/50, Rate 2 schon vor 40 Tagen fällig → überfällig)
  const falsch = await api(U, { aktion: 'zahlungsplan', nurPruefen: true, plan: { modus: 'teil', raten: [{ bezeichnung: 'Anzahlung', art: 'prozent', wert: 50 }, { bezeichnung: 'Rest', art: 'prozent', wert: 40 }] } });
  ok(falsch.pruefung.ok === false && /fehlen/.test(falsch.pruefung.fehler), `Summenprüfung meldet: ${falsch.pruefung.fehler}`);
  const p = await api(U, { aktion: 'zahlungsplan', plan: { modus: 'teil', raten: [{ bezeichnung: 'Anzahlung', art: 'prozent', wert: 50, anlass: 'bei Bestellung', faelligAm: tag(10) }, { bezeichnung: 'Restzahlung', art: 'prozent', wert: 50, anlass: 'bei Abholung', faelligAm: tag(-40) }] } });
  ok(p.pruefung.ok && p.pruefung.betraege[0] === 107000 && p.pruefung.betraege[1] === 107000, `Zahlungsplan 50/50 gespeichert (${p.pruefung.betraege.map((x) => x / 100).join(' / ')})`);
  const [r1, r2] = p.plan.raten;

  // Schlussrechnung vor Rate 1 nicht möglich
  const zuFrueh = await fetch(BASIS + U, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS, Cookie: cookie }, body: JSON.stringify({ aktion: 'rate-rechnung', rateId: r2.id }) });
  ok(zuFrueh.status === 409, 'Schlussrechnung erst nach den vorherigen Raten');

  // Rate 1: Rechnung, festschreiben, bezahlen
  const re1 = await api(U, { aktion: 'rate-rechnung', rateId: r1.id });
  await api(`/api/admin/rechnungen/${re1.id}/`, { aktion: 'festschreiben' });
  const pdf1 = await api(`/api/admin/rechnungen/${re1.id}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdf1), `Rate 1: ${re1.nummer} als PDF mit QR (${pdf1.length} Bytes)`);
  const z1 = await api(`/api/admin/rechnungen/${re1.id}/`, { aktion: 'zahlung', betragRp: 107000, art: 'twint' });
  ok(z1.status === 'bezahlt', 'Rate 1 bezahlt');

  // Plan ändern: verschickte Rate gesperrt
  const gesperrt = await fetch(BASIS + U, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS, Cookie: cookie }, body: JSON.stringify({ aktion: 'zahlungsplan', plan: { modus: 'teil', raten: [{ ...r1, wert: 30 }, { ...r2, wert: 70 }] } }) });
  ok(gesperrt.status === 409, 'Verschickte Rate lässt sich nicht mehr ändern');

  // Rate 2: Schlussrechnung zieht Rate 1 ab, überfällig
  const re2 = await api(U, { aktion: 'rate-rechnung', rateId: r2.id });
  await api(`/api/admin/rechnungen/${re2.id}/`, { aktion: 'festschreiben' });
  const reSeite = await seite(`/admin/rechnungen/${re2.id}/`);
  ok(reSeite.status === 200, `Schlussrechnung ${re2.nummer} erstellt und festgeschrieben`);
  const au1 = await seite(`/admin/auftraege/${auftragId}/`);
  ok(au1.html.includes('Überfällig') && au1.html.includes('Bezahlt'), 'Auftrag zeigt Zahlungsplan: Rate 1 bezahlt, Rate 2 überfällig');
  const liste = await seite('/admin/rechnungen/?f=mahnen');
  ok(liste.html.includes(re2.nummer), 'Rate 2 steht in der Liste «Zu mahnen»');

  // Mahnwesen
  const m0 = await api(`/api/admin/rechnungen/${re2.id}/mahnung/`, undefined, 'GET');
  ok(m0.vorschlag?.stufe === 1 && m0.vorschlag.faellig && m0.offenRp === 107000, `Vorschlag: ${m0.vorschlag?.bezeichnung}, ${m0.vorschlag?.tageUeberfaellig} Tage überfällig, offen ${m0.offenRp / 100}`);
  const e1 = await api(`/api/admin/rechnungen/${re2.id}/mahnung/`, { stufe: 1 });
  ok(/^MA-\d{4}-\d{4}$/.test(e1.nummer) && e1.offenRp === 107000, `Zahlungserinnerung ${e1.nummer} (ohne Gebühr)`);
  const pdfE = await api(`/api/admin/mahnungen/${e1.id}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdfE), `Zahlungserinnerung als PDF (${pdfE.length} Bytes)`);
  if (ORDNER) writeFileSync(path.join(ORDNER, 'zahlungserinnerung.pdf'), pdfE);
  const falscheStufe = await fetch(`${BASIS}/api/admin/rechnungen/${re2.id}/mahnung/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS, Cookie: cookie }, body: JSON.stringify({ stufe: 3 }) });
  ok(falscheStufe.status === 409, 'Stufe überspringen ist nicht möglich');
  const e2 = await api(`/api/admin/rechnungen/${re2.id}/mahnung/`, { stufe: 2 });
  ok(e2.offenRp === 109000, `1. Mahnung ${e2.nummer} mit CHF 20 Gebühr (offen ${e2.offenRp / 100})`);
  const pdfM = await api(`/api/admin/mahnungen/${e2.id}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdfM), `1. Mahnung als PDF (${pdfM.length} Bytes)`);
  if (ORDNER) writeFileSync(path.join(ORDNER, 'mahnung-1.pdf'), pdfM);
  const ohneMail = await fetch(`${BASIS}/api/admin/mahnungen/${e2.id}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS, Cookie: cookie }, body: JSON.stringify({ aktion: 'senden' }) });
  ok([400, 503].includes(ohneMail.status), `Mail ohne Adresse/Versand sauber abgelehnt (${ohneMail.status})`);
  const m2 = await api(`/api/admin/rechnungen/${re2.id}/mahnung/`, undefined, 'GET');
  ok(m2.mahnungen.length === 2 && m2.mahnstufe === 2 && m2.vorschlag?.stufe === 3, 'Mahnverlauf: 2 Mahnungen, nächste Stufe 2. Mahnung');
  const akte = await seite(`/admin/kontakte/${kontaktId}/`);
  ok(akte.html.includes(e1.nummer) && akte.html.includes(e2.nummer), 'Kundenakte zeigt die Mahnstufen');

  // Zahlung ohne Gebühr → teilbezahlt, mit Gebühr → bezahlt; Abholung → abgeschlossen
  const z2 = await api(`/api/admin/rechnungen/${re2.id}/`, { aktion: 'zahlung', betragRp: 107000, art: 'bank' });
  ok(z2.status === 'teilbezahlt', 'Ohne Mahngebühr noch nicht bezahlt (teilbezahlt)');
  await api(U, { aktion: 'status', status: 'abgeholt' });
  const z3 = await api(`/api/admin/rechnungen/${re2.id}/`, { aktion: 'zahlung', betragRp: 2000, art: 'bank', notiz: 'Mahngebühr' });
  ok(z3.status === 'bezahlt' && /abgeschlossen/.test(z3.meldung), `Mahngebühr bezahlt → ${z3.meldung}`);
  const ende = await seite(`/admin/auftraege/${auftragId}/`);
  ok(ende.html.includes('au-abgeschlossen'), 'Auftrag mit Teilzahlung abgeschlossen');
  return auftragId;
}

async function ganz(kontaktId) {
  const auftragId = await auftragFuer(kontaktId, 'Sakko Ganz', [{ art: 'position', bezeichnung: 'Sakko nach Mass', menge: 1, einheit: 'Stk.', einzelpreisRp: 129000, mwstSatz: 8.1 }]);
  const U = `/api/admin/auftraege/${auftragId}/`;
  const p = await api(U, { aktion: 'zahlungsplan', plan: { modus: 'ganz', raten: [{ bezeichnung: 'Gesamtbetrag', art: 'prozent', wert: 100, anlass: 'bei Abholung' }] } });
  ok(p.pruefung.ok && p.pruefung.betraege[0] === 129000, 'Zahlungsplan «Ganz» gespeichert');
  const re = await api(U, { aktion: 'rate-rechnung', rateId: p.plan.raten[0].id });
  await api(`/api/admin/rechnungen/${re.id}/`, { aktion: 'festschreiben' });
  const pdf = await api(`/api/admin/rechnungen/${re.id}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdf), `Eine Rechnung ${re.nummer} über alles (${pdf.length} Bytes)`);
  if (ORDNER) writeFileSync(path.join(ORDNER, 'rechnung-ganz.pdf'), pdf);
  await api(U, { aktion: 'status', status: 'abgeholt' });
  const z = await api(`/api/admin/rechnungen/${re.id}/`, { aktion: 'zahlung', betragRp: 129000, art: 'karte' });
  ok(z.status === 'bezahlt' && /abgeschlossen/.test(z.meldung), `Ganz bezahlt → ${z.meldung}`);
  return auftragId;
}

async function main() {
  const c = await api('/api/login/code/', { email: 'store@thesartorialist.ch' });
  await api('/api/login/pruefen/', { email: 'store@thesartorialist.ch', code: c.devCode });
  ok(Boolean(cookie), 'Angemeldet');
  // IBAN für den QR-Zahlteil
  await api('/api/admin/firma/', { schluessel: 'firma', wert: { iban: 'CH93 0076 2011 6238 5295 7' } }, 'PUT');
  const k = await api('/api/admin/kontakte/', { name: `Teilzahlung ${Date.now().toString().slice(-5)}`, status: 'kunde' });
  ok(Boolean(k.id), 'Kunde angelegt');
  const teil = await teilzahlungUndMahnung(k.id);
  const g = await ganz(k.id);
  console.log(fehlerZahl ? `\n${fehlerZahl} Prüfung(en) fehlgeschlagen` : '\nAlle Prüfungen bestanden.');
  console.log(JSON.stringify({ kontaktId: k.id, teilAuftrag: teil, ganzAuftrag: g }));
  process.exitCode = fehlerZahl ? 1 : 0;
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exitCode = 1;
});
