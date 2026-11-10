// QR-Rechnung und Zahlungsplan gegen einen laufenden lokalen Server (ohne Resend, Login-Code kommt als devCode):
// 1. Ohne Bankverbindung: Entwurf geht, Festschreiben/Senden gesperrt (klare Meldung), Hinweise in Editor/Übersicht/Liste.
// 2. IBAN-Prüfung in den Einstellungen (Prüfziffer, QR-IBAN im falschen Feld, Gläubiger-Adresse).
// 3. Mit IBAN (RF-Referenz) und QR-IBAN (QR-Referenz): gültiger Zahlteil im Editor und als PDF; Entwurf von vor dem
//    Eintrag der IBAN bekommt beim Festschreiben die passende Referenz.
// 4. Zahlungsplan im Angebot (Standard aus den Einstellungen, PDF/Annahmeseite), Online-Annahme übernimmt ihn; ohne Plan
//    «Zahlungsplan festlegen» im Auftrag, in der Übersicht und als Aufgabe.
// 5. Annahme im Atelier mit Plan-Wahl und erster Rechnung; Teilverrechnung: Rate splitten, Betrag im Entwurf geändert →
//    Plan übernimmt ihn, Rest verteilen, Reihenfolge-Sperren, Schlussrechnung zieht alle Raten ab.
// Aufruf: node scripts/test-qr-zahlungsplan.mjs http://localhost:3147 [ordner-fuer-pdfs]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const BASIS = process.argv[2] ?? 'http://localhost:3000';
const ORDNER = process.argv[3];
if (ORDNER) mkdirSync(ORDNER, { recursive: true });
// Offizielle Testwerte aus den Beispielen von SIX (Swiss Payment Standards)
const IBAN = 'CH58 0079 1123 0008 8901 2';
const QR_IBAN = 'CH44 3199 9123 0008 8901 2';
let cookie = '';
let fehlerZahl = 0;
let pruefungen = 0;

const ok = (bed, text) => {
  pruefungen++;
  console.log(`${bed ? '✓' : '✗'} ${text}`);
  if (!bed) fehlerZahl++;
};

async function roh(pfad, body, methode = 'POST') {
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
  return { status: r.status, daten };
}
async function api(pfad, body, methode = 'POST') {
  const { status, daten } = await roh(pfad, body, methode);
  if (status !== 200) throw new Error(`${methode} ${pfad} → ${status} ${typeof daten === 'object' && !Buffer.isBuffer(daten) ? JSON.stringify(daten) : String(daten).slice(0, 200)}`);
  return daten;
}
const seite = async (pfad) => {
  const r = await fetch(BASIS + pfad, { headers: cookie ? { Cookie: cookie } : {} });
  return { status: r.status, html: await r.text() };
};
const pdfOk = (b) => Buffer.isBuffer(b) && b.subarray(0, 4).toString() === '%PDF';
const speichern = (name, buf) => ORDNER && writeFileSync(path.join(ORDNER, name), buf);
const chf = (rp) => `${Math.floor(rp / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’')}.${String(rp % 100).padStart(2, '0')}`;
const firma = (wert) => roh('/api/admin/firma/', { schluessel: 'firma', wert }, 'PUT');
const POS = (rp, name = 'Massanzug dreiteilig · Super 130') => [{ art: 'position', bezeichnung: name, menge: 1, einheit: 'Stk.', einzelpreisRp: rp, mwstSatz: 8.1, kategorie: 'massanzug' }];

async function angebotMit(kontaktId, titel, rp, extra = {}) {
  const an = await api('/api/admin/angebote/', { kontaktId });
  await api(`/api/admin/angebote/${an.id}/`, { titel, positionen: POS(rp), ...extra }, 'PATCH');
  return an;
}

async function main() {
  const c = await api('/api/login/code/', { email: 'store@thesartorialist.ch' });
  await api('/api/login/pruefen/', { email: 'store@thesartorialist.ch', code: c.devCode });
  ok(Boolean(cookie), 'Angemeldet');
  const stamp = Date.now().toString().slice(-6);
  const KNAME = `QR Test ${stamp}`;
  const k = await api('/api/admin/kontakte/', { name: KNAME, email: `qr.${stamp}@beispiel.ch`, status: 'kunde' });
  await api(`/api/admin/kontakte/${k.id}/`, { strasse: 'Bahnhofstrasse 12', plz: '8001', ort: 'Zürich' }, 'PATCH');

  /* ---------- 1. Ohne Bankverbindung ---------- */
  const leer = await firma({ iban: '', qrIban: '', zahlungsplanStandard: 'anzahlung', anzahlungProzent: 50 });
  ok(leer.status === 200 && leer.daten.bank?.ok === false && leer.daten.bank.kontoArt === null, `Bankverbindung leer gespeichert → «${leer.daten.bank?.kurz}»`);
  const anLeer = await angebotMit(k.id, 'Sakko ohne IBAN', 129000);
  const aLeer = await api(`/api/admin/angebote/${anLeer.id}/`, { aktion: 'annehmen', name: KNAME, zahlungsplan: { modus: 'ganz', raten: [{ bezeichnung: 'Gesamtbetrag', art: 'prozent', wert: 100, anlass: 'bei Abholung' }] }, ersteRechnung: true });
  ok(Boolean(aLeer.rechnungId), `Annahme im Atelier mit «Ganz» und erster Rechnung → ${aLeer.meldung}`);
  const reLeer = aLeer.rechnungId;
  const patch = await roh(`/api/admin/rechnungen/${reLeer}/`, { titel: 'Sakko nach Mass (Entwurf ohne IBAN)' }, 'PATCH');
  ok(patch.status === 200, 'Entwurf lässt sich ohne IBAN bearbeiten (Autosave)');
  const fest = await roh(`/api/admin/rechnungen/${reLeer}/`, { aktion: 'festschreiben' });
  ok(fest.status === 409 && fest.daten.bankFehlt === true && /Bankverbindung fehlt/.test(fest.daten.fehler), `Festschreiben gesperrt (409): «${fest.daten.fehler?.slice(0, 70)}…»`);
  const send = await roh(`/api/admin/rechnungen/${reLeer}/`, { aktion: 'senden' });
  ok([409, 503].includes(send.status) && send.daten.fehler, `Senden gesperrt (${send.status}): «${send.daten.fehler?.slice(0, 60)}…»`);
  const reSeite0 = await seite(`/admin/rechnungen/${reLeer}/`);
  ok(reSeite0.status === 200 && reSeite0.html.includes('Bankverbindung fehlt') && reSeite0.html.includes('IBAN eintragen'), 'Rechnungseditor zeigt «Bankverbindung fehlt» mit Link zu den Einstellungen');
  ok(reSeite0.html.includes('QR-Zahlteil nicht möglich') || reSeite0.html.includes('keine IBAN'), 'Vorschau statt Zahlteil: freundlicher Hinweis, kein Absturz');
  const pdf0 = await api(`/api/admin/rechnungen/${reLeer}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdf0), `Entwurfs-PDF ohne IBAN wird trotzdem erzeugt (${pdf0.length} Bytes)`);
  speichern('entwurf-ohne-iban.pdf', pdf0);
  const ue0 = await seite('/admin/uebersicht/');
  ok(ue0.html.includes('Bankverbindung fehlt') && ue0.html.includes('/admin/einstellungen/#bank'), 'Übersicht: Hinweis «Bankverbindung fehlt» mit Link');
  const li0 = await seite('/admin/rechnungen/?f=entwurf');
  ok(li0.html.includes('QR-Zahlteil erscheint, sobald die IBAN in den Einstellungen steht'), 'Rechnungsliste: Hinweis mit Link');
  const ei0 = await seite('/admin/einstellungen/');
  ok(ei0.status === 200 && ei0.html.includes('Bankverbindung &amp; QR-Rechnung') && ei0.html.includes('Bankverbindung fehlt'), 'Einstellungen: Abschnitt «Bankverbindung & QR-Rechnung» mit Status');
  const bar = await api(`/api/admin/rechnungen/${(await api('/api/admin/rechnungen/', { kontaktId: k.id, art: 'rechnung' })).id}/`, { positionen: POS(24000, 'Hemd nach Mass') }, 'PATCH');
  ok(bar.totalRp === 24000, 'Direktverkauf-Entwurf ohne IBAN');

  /* ---------- 2. IBAN-Prüfung ---------- */
  const falsch = await firma({ iban: 'CH58 0079 1123 0008 8901 3' });
  ok(falsch.status === 400 && /Prüfziffer/.test(falsch.daten.fehler), `Falsche Prüfziffer abgelehnt: «${falsch.daten.fehler}»`);
  const qrFalsch = await firma({ iban: QR_IBAN });
  ok(qrFalsch.status === 400 && /QR-IBAN/.test(qrFalsch.daten.fehler), 'QR-IBAN im Feld IBAN abgelehnt');
  const ibanImQr = await firma({ qrIban: IBAN });
  ok(ibanImQr.status === 400 && /keine QR-IBAN/.test(ibanImQr.daten.fehler), 'Normale IBAN im Feld QR-IBAN abgelehnt');
  const de = await firma({ iban: 'DE89 3704 0044 0532 0130 00' });
  ok(de.status === 400 && /Schweizer/.test(de.daten.fehler), 'Ausländische IBAN abgelehnt (QR-Rechnung nur CH/LI)');
  const ohneStrasse = await firma({ iban: IBAN.replace(/\s/g, ''), strasse: '' });
  ok(ohneStrasse.status === 200 && ohneStrasse.daten.firma.iban === IBAN && ohneStrasse.daten.bank.ok === false && ohneStrasse.daten.bank.fehler.some((x) => /Strasse/.test(x)), 'IBAN in 4er-Gruppen gespeichert, fehlende Gläubiger-Adresse erkannt');
  const fest2 = await roh(`/api/admin/rechnungen/${reLeer}/`, { aktion: 'festschreiben' });
  ok(fest2.status === 409 && /Strasse/.test(fest2.daten.fehler), 'Festschreiben ohne Gläubiger-Adresse gesperrt');

  /* ---------- 3. Mit IBAN (RF) und QR-IBAN (QRR) ---------- */
  const mitIban = await firma({ strasse: 'Kuttelgasse 7', iban: IBAN });
  ok(mitIban.daten.bank.ok && mitIban.daten.bank.referenzArt === 'SCOR', `IBAN gültig → ${mitIban.daten.bank.kurz}`);
  const fest3 = await api(`/api/admin/rechnungen/${reLeer}/`, { aktion: 'festschreiben' });
  ok(/Festgeschrieben/.test(fest3.meldung), 'Entwurf von vor dem IBAN-Eintrag jetzt festgeschrieben');
  const reSeite1 = await seite(`/admin/rechnungen/${reLeer}/`);
  ok(reSeite1.html.includes('Empfangsschein') && reSeite1.html.includes('CH58 0079 1123 0008 8901 2') && /RF\d\d/.test(reSeite1.html), 'Zahlteil im Editor: IBAN und Creditor Reference (RF)');
  const pdf1 = await api(`/api/admin/rechnungen/${reLeer}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdf1) && pdf1.length > pdf0.length, `PDF mit QR-Zahlteil (IBAN/RF, ${pdf1.length} Bytes)`);
  speichern('rechnung-iban-rf.pdf', pdf1);

  const mitQr = await firma({ qrIban: QR_IBAN });
  ok(mitQr.daten.bank.ok && mitQr.daten.bank.referenzArt === 'QRR', `QR-IBAN gültig → ${mitQr.daten.bank.kurz}`);
  const anQr = await angebotMit(k.id, 'Hose QR', 48000);
  const aQr = await api(`/api/admin/angebote/${anQr.id}/`, { aktion: 'rechnung' });
  ok(Boolean(aQr.rechnungId), `Angebot → Auftrag → Rechnung mit einem Klick (${aQr.meldung})`);
  await api(`/api/admin/rechnungen/${aQr.rechnungId}/`, { aktion: 'festschreiben' });
  const reSeite2 = await seite(`/admin/rechnungen/${aQr.rechnungId}/`);
  ok(reSeite2.html.includes('CH44 3199 9123 0008 8901 2') && /\d{2} \d{5} \d{5} \d{5} \d{5} \d{5}/.test(reSeite2.html), 'Zahlteil mit QR-IBAN und QR-Referenz (27 Ziffern, 5er-Gruppen)');
  const pdf2 = await api(`/api/admin/rechnungen/${aQr.rechnungId}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdf2), `PDF mit QR-Zahlteil (QR-IBAN/QRR, ${pdf2.length} Bytes)`);
  speichern('rechnung-qr-iban.pdf', pdf2);
  const alt = await seite(`/admin/rechnungen/${reLeer}/`);
  ok(alt.html.includes('CH58 0079 1123 0008 8901 2'), 'Bereits festgeschriebene RF-Rechnung behält IBAN und Referenz nach dem Eintrag der QR-IBAN');

  /* ---------- 4. Zahlungsplan im Angebot, Online-Annahme ---------- */
  await firma({ zahlungsplanStandard: '30-40-30' });
  const an1 = await angebotMit(k.id, 'Hochzeitsanzug Online', 300000);
  const ed1 = await seite(`/admin/angebote/${an1.id}/`);
  ok(ed1.html.includes('Zahlungsbedingungen') && ed1.html.includes('Zahlung in 3 Raten') && ed1.html.includes('900.00'), 'Neues Angebot hat den Standard-Zahlungsplan 30/40/30 (Editor zeigt die Raten)');
  const pdfA = await api(`/api/admin/angebote/${an1.id}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdfA), `Angebots-PDF mit Zahlungsbedingungen (${pdfA.length} Bytes)`);
  speichern('angebot-30-40-30.pdf', pdfA);
  const l1 = await api(`/api/admin/angebote/${an1.id}/`, { aktion: 'link' });
  const token1 = l1.link.split('/angebot/')[1].replace(/\/$/, '');
  const oeff = await (await fetch(`${BASIS}/angebot/${token1}/`)).text();
  ok(oeff.includes('k-bedingung') && oeff.includes('Zahlung in 3 Raten'), 'Annahmeseite zeigt die Zahlungsbedingungen');
  const ann1 = await fetch(`${BASIS}/api/angebot/${token1}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS }, body: JSON.stringify({ aktion: 'annehmen', name: KNAME, bestaetigt: true }) });
  ok(ann1.status === 200, 'Online angenommen');
  const akte = await seite(`/admin/angebote/${an1.id}/`);
  const au1 = /\/admin\/auftraege\/([0-9a-f-]{36})\//.exec(akte.html)?.[1];
  const auSeite1 = await seite(`/admin/auftraege/${au1}/`);
  ok(Boolean(au1) && !auSeite1.html.includes('Zahlungsplan festlegen') && auSeite1.html.includes('2. Rate') && auSeite1.html.includes('1’200.00'), 'Auftrag übernimmt den Plan aus dem Angebot (kein «festlegen», Rate 2 = 1’200.00)');

  await firma({ zahlungsplanStandard: 'offen' });
  const an2 = await angebotMit(k.id, 'Mantel Online ohne Plan', 220000);
  const l2 = await api(`/api/admin/angebote/${an2.id}/`, { aktion: 'link' });
  const token2 = l2.link.split('/angebot/')[1].replace(/\/$/, '');
  await fetch(`${BASIS}/api/angebot/${token2}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS }, body: JSON.stringify({ aktion: 'annehmen', name: KNAME, bestaetigt: true }) });
  const au2 = /\/admin\/auftraege\/([0-9a-f-]{36})\//.exec((await seite(`/admin/angebote/${an2.id}/`)).html)?.[1];
  const auSeite2 = await seite(`/admin/auftraege/${au2}/`);
  ok(auSeite2.html.includes('Zahlungsplan festlegen') && auSeite2.html.includes('Jetzt festlegen'), 'Online ohne Plan angenommen → Auftrag zeigt «Zahlungsplan festlegen»');
  ok(auSeite2.html.includes('Zahlungsplan festlegen (ganz oder Teilzahlung)'), 'Aufgabe «Zahlungsplan festlegen» angelegt');
  const ue1 = await seite('/admin/uebersicht/');
  const nr2 = /AU-\d{4}-\d{4}/.exec(auSeite2.html)?.[0];
  ok(ue1.html.includes('Zahlungsplan festlegen ·') && ue1.html.includes(nr2), `Übersicht listet ${nr2} unter «Zahlungsplan festlegen»`);
  const p2 = await api(`/api/admin/auftraege/${au2}/`, { aktion: 'zahlungsplan', plan: { modus: 'teil', raten: [{ bezeichnung: 'Anzahlung 40 %', art: 'prozent', wert: 40, anlass: 'bei Bestellung' }, { bezeichnung: 'Restzahlung', art: 'prozent', wert: 60, anlass: 'bei Abholung' }] } });
  ok(p2.pruefung.ok && p2.pruefung.betraege[0] === 88000, 'Plan 40/60 gespeichert');
  const auSeite2b = await seite(`/admin/auftraege/${au2}/`);
  ok(!auSeite2b.html.includes('Jetzt festlegen'), 'Hinweis verschwindet nach dem Speichern');
  const ue2 = await seite('/admin/uebersicht/');
  ok(!ue2.html.includes(`/admin/auftraege/${au2}/#zahlung`), 'Übersicht: Auftrag nicht mehr in der Liste');

  /* ---------- 5. Atelier-Annahme mit Plan-Wahl, Teilverrechnung ---------- */
  const an3 = await angebotMit(k.id, 'Smoking Teilzahlung', 400000);
  const falschPlan = await roh(`/api/admin/angebote/${an3.id}/`, { aktion: 'annehmen', name: KNAME, zahlungsplan: { modus: 'teil', raten: [{ bezeichnung: 'A', art: 'prozent', wert: 30 }, { bezeichnung: 'B', art: 'prozent', wert: 30 }] } });
  ok(falschPlan.status === 400 && /fehlen/.test(falschPlan.daten.fehler), 'Annahme mit unvollständigem Plan abgelehnt (Summe)');
  const a3 = await api(`/api/admin/angebote/${an3.id}/`, {
    aktion: 'annehmen',
    name: KNAME,
    ersteRechnung: true,
    zahlungsplan: { modus: 'teil', raten: [{ bezeichnung: '1. Rate', art: 'prozent', wert: 30, anlass: 'bei Bestellung' }, { bezeichnung: '2. Rate', art: 'prozent', wert: 40, anlass: 'bei der Anprobe' }, { bezeichnung: 'Restzahlung', art: 'prozent', wert: 30, anlass: 'bei Abholung' }] },
  });
  ok(Boolean(a3.auftragId && a3.rechnungId), `Atelier-Annahme 30/40/30 + erste Rechnung: ${a3.meldung}`);
  const U = `/api/admin/auftraege/${a3.auftragId}/`;
  // Rate 1 im Entwurf auf CHF 1’000 geändert (statt 1’200), festschreiben → Plan übernimmt den Betrag
  await api(`/api/admin/rechnungen/${a3.rechnungId}/`, { positionen: [{ art: 'position', bezeichnung: '1. Rate', beschreibung: 'auf Auftrag', menge: 1, einheit: 'Stk.', einzelpreisRp: 100000, mwstSatz: 8.1, kategorie: 'sonstiges' }] }, 'PATCH');
  await api(`/api/admin/rechnungen/${a3.rechnungId}/`, { aktion: 'festschreiben' });
  await api(`/api/admin/rechnungen/${a3.rechnungId}/`, { aktion: 'zahlung', betragRp: 100000, art: 'twint' });
  const pr = await api(U, { aktion: 'zahlungsplan', nurPruefen: true, plan: { modus: 'teil', raten: [] } }).catch((e) => ({ fehler: e.message }));
  ok(Boolean(pr.fehler), 'Leerer Plan abgelehnt');
  const auS3 = await seite(`/admin/auftraege/${a3.auftragId}/`);
  ok(auS3.html.includes('1’000.00') && auS3.html.includes('Bezahlt'), 'Rate 1 zeigt den tatsächlichen Betrag 1’000.00 und «Bezahlt»');
  // aktuellen Plan holen (Rate 1 jetzt fester Betrag)
  const { auftrag: auJ } = await api(U, undefined, 'GET');
  const planJetzt = auJ.zahlungsplan;
  const r1 = planJetzt?.raten?.[0];
  ok(r1?.art === 'betrag' && r1.wert === 100000 && Boolean(r1.rechnungId), 'Zahlungsplan: Rate 1 als fester Betrag (CHF 1’000) übernommen');
  // Summe stimmt nicht mehr (1’000 + 40 % + 30 % ≠ 4’000) → im Auftrag erscheint «Rest verteilen»
  ok(auJ.pruefung.ok === false, `Summenprüfung meldet die Abweichung: ${auJ.pruefung.fehler}`);
  // Rest verteilen + Rate 2 splitten: 1’000 fix | 2a 800 | 2b 800 | Rest 1’400 → Summe 4’000
  const neuPlan = { modus: 'teil', raten: [r1, { ...planJetzt.raten[1], bezeichnung: '2. Rate (1/2)', art: 'betrag', wert: 80000 }, { bezeichnung: '2. Rate (2/2)', art: 'betrag', wert: 80000, anlass: 'bei der Anprobe' }, { ...planJetzt.raten[2], art: 'betrag', wert: 140000 }] };
  const gesp = await api(U, { aktion: 'zahlungsplan', plan: neuPlan });
  ok(gesp.pruefung.ok && gesp.plan.raten.length === 4 && gesp.plan.raten[0].rechnungId, 'Nach Teilverrechnung: Rate 2 gesplittet, Rest neu verteilt, Rate 1 bleibt verknüpft');
  const gesperrt = await roh(U, { aktion: 'zahlungsplan', plan: { ...neuPlan, raten: [{ ...r1, wert: 90000 }, ...neuPlan.raten.slice(1, 3), { ...neuPlan.raten[3], wert: 150000 }] } });
  ok(gesperrt.status === 409, 'Verschickte Rate 1 bleibt gesperrt (409)');
  const ohneSchluss = await roh(U, { aktion: 'zahlungsplan', plan: { modus: 'teil', raten: [{ ...r1 }, { bezeichnung: 'Rest', art: 'betrag', wert: 300000 }] } });
  ok(ohneSchluss.status === 200, 'Plan auf 2 Raten zusammenlegen geht (nur offene Raten geändert)');
  const p4 = await api(U, { aktion: 'zahlungsplan', plan: neuPlan });
  const [, ra, rb, rc] = p4.plan.raten;
  const zuFrueh = await roh(U, { aktion: 'rate-rechnung', rateId: rc.id });
  ok(zuFrueh.status === 409, 'Schlussrechnung erst, wenn alle vorherigen Raten festgeschrieben sind');
  for (const rate of [ra, rb]) {
    const re = await api(U, { aktion: 'rate-rechnung', rateId: rate.id });
    await api(`/api/admin/rechnungen/${re.id}/`, { aktion: 'festschreiben' });
  }
  const anhaengen = await roh(U, { aktion: 'zahlungsplan', plan: { modus: 'teil', raten: [...p4.plan.raten.slice(0, 3).map((x) => ({ ...x })), { bezeichnung: 'Teil A', art: 'betrag', wert: 70000 }, { bezeichnung: 'Teil B', art: 'betrag', wert: 70000 }] } });
  ok(anhaengen.status === 200, 'Letzte (offene) Rate kann noch geteilt werden');
  const p5 = await api(U, { aktion: 'zahlungsplan', plan: p4.plan });
  const schluss = await api(U, { aktion: 'rate-rechnung', rateId: p5.plan.raten[3].id });
  await api(`/api/admin/rechnungen/${schluss.id}/`, { aktion: 'festschreiben' });
  const sSeite = await seite(`/admin/rechnungen/${schluss.id}/`);
  const abzuege = (sSeite.html.match(/abzüglich Anzahlung RE-\d{4}-\d{4}/g) ?? []).length;
  ok(abzuege >= 3 && sSeite.html.includes(chf(140000)), `Schlussrechnung zieht alle ${abzuege / 2 >= 3 ? 3 : abzuege} Raten ab, zu zahlen ${chf(140000)}`);
  const pdfS = await api(`/api/admin/rechnungen/${schluss.id}/pdf/`, undefined, 'GET');
  ok(pdfOk(pdfS), `Schlussrechnung als PDF mit QR (${pdfS.length} Bytes)`);
  speichern('schlussrechnung-teilzahlung.pdf', pdfS);
  const nachSchluss = await roh(U, { aktion: 'zahlungsplan', plan: { modus: 'teil', raten: [...p5.plan.raten.slice(0, 3).map((x) => ({ ...x })), { ...p5.plan.raten[3], wert: 135000 }, { bezeichnung: 'Noch eine', art: 'betrag', wert: 5000 }] } });
  ok(nachSchluss.status === 409, 'Nach verschickter Schlussrechnung keine weitere Rate möglich');

  // Aufräumen: Standard wieder «Anzahlung 50 %», QR-IBAN entfernen (andere Tests erwarten IBAN/RF)
  await firma({ zahlungsplanStandard: 'anzahlung', qrIban: '', iban: IBAN });
  console.log(fehlerZahl ? `\n${fehlerZahl} von ${pruefungen} Prüfung(en) fehlgeschlagen` : `\nAlle ${pruefungen} Prüfungen bestanden.`);
  process.exitCode = fehlerZahl ? 1 : 0;
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exitCode = 1;
});
