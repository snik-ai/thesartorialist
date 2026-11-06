// Schnellablauf ohne Anfrage gegen einen laufenden lokalen Server (Login-Code kommt als devCode):
// Laufkunde im Store → Angebot ohne Anfrage mit Katalogprodukt + individueller Position → individuelle Position als
// Produkt speichern → Annahme → Auftrag; Golden Record (gleiche E-Mail → gleicher Kontakt);
// Direktverkauf → Rechnung → bar bezahlt → PDF.
// Aufruf: node scripts/test-schnell.mjs http://localhost:3143 [ordner-fuer-pdfs]
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
  const c = await api('/api/login/code/', { email: 'store@thesartorialist.ch' });
  await api('/api/login/pruefen/', { email: 'store@thesartorialist.ch', code: c.devCode });
  ok(Boolean(cookie), 'Angemeldet');
  const stamp = Date.now();
  const email = `laufkunde.${stamp}@beispiel.ch`;

  // 1. Laufkunde → Angebot ohne Anfrage
  const ohne = await fetch(`${BASIS}/api/admin/belege/neu/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASIS, Cookie: cookie }, body: JSON.stringify({ art: 'angebot', neu: { name: 'Ohne Kontakt' }, herkunft: 'store' }) });
  ok(ohne.status === 400, 'Neuer Kunde ohne E-Mail/Telefon wird abgelehnt');
  const n = await api('/api/admin/belege/neu/', { art: 'angebot', neu: { name: `Laufkunde ${stamp}`, email, telefon: '' }, herkunft: 'store' });
  ok(n.neu === true && /^\/admin\/angebote\/[0-9a-f-]{36}\/$/.test(n.url), `Angebot ${n.nummer} für neuen Laufkunden, Blatt ${n.url}`);
  const blatt = await seite(n.url);
  ok(blatt.status === 200 && blatt.html.includes('dk-papier'), 'A4-Blatt des leeren Angebots öffnet sich');
  const akte = await seite(`/admin/kontakte/${n.kontaktId}/`);
  ok(akte.html.includes('Laufkundschaft im Store'), 'Herkunft «Laufkundschaft im Store» im Verlauf');
  ok(akte.html.includes('Angebot offen'), 'Kontakt ist Lead in Phase «Angebot offen»');

  // 2. Katalogprodukt + individuelle Position
  const treffer = await api('/api/admin/produkte/suche/?q=Super%20150', undefined, 'GET');
  const t = treffer[0];
  ok(Boolean(t?.produktId), `Katalogtreffer «${t?.name}» CHF ${(t?.preisRp ?? 0) / 100}`);
  const positionen = [
    { art: 'position', bezeichnung: 'Massanzug zweiteilig · Super 150', menge: 1, einheit: 'Stk.', einzelpreisRp: 219000, mwstSatz: 8.1, produktId: t.produktId, varianteId: t.varianteId, kategorie: 'massanzug' },
    { art: 'position', bezeichnung: `Monogramm handgestickt ${stamp}`, menge: 1, einheit: 'Stk.', einzelpreisRp: 4500, mwstSatz: 8.1 },
  ];
  const p = await api(`/api/admin/angebote/${n.id}/`, { titel: 'Massanzug für Laufkunden', positionen }, 'PATCH');
  ok(p.totalRp === 223500, `Total CHF ${p.totalRp / 100} (Katalog + individuell)`);
  const prod = await api('/api/admin/produkte/', { name: `Monogramm handgestickt ${stamp}`, kategorie: 'dienstleistung', beschreibung: null, preisRp: 4500, mwstSatz: 8.1, einheit: 'Stk.', aktiv: true, varianten: [] });
  ok(Boolean(prod.produkt?.id), 'Individuelle Position als Produkt gespeichert');
  const such2 = await api(`/api/admin/produkte/suche/?q=${encodeURIComponent(`Monogramm handgestickt ${stamp}`)}`, undefined, 'GET');
  ok(such2.some((x) => x.produktId === prod.produkt.id), 'Neues Produkt erscheint in der Positionssuche');

  // 3. Annahme → Auftrag
  const an = await api(`/api/admin/angebote/${n.id}/`, { aktion: 'annehmen', name: `Laufkunde ${stamp}` });
  ok(Boolean(an.auftragId), 'Angebot im Atelier angenommen → Auftrag eröffnet');

  // 4. Golden Record
  const g = await api('/api/admin/belege/neu/', { art: 'angebot', neu: { name: 'Laufkunde Zweitbesuch', email: email.toUpperCase() }, herkunft: 'email' });
  ok(g.kontaktId === n.kontaktId && g.neu === false, 'Gleiche E-Mail → bestehender Kontakt (kein Duplikat)');
  await api(`/api/admin/angebote/${g.id}/`, undefined, 'DELETE');

  // 5. Direktverkauf im Store
  const r = await api('/api/admin/belege/neu/', { art: 'rechnung', neu: { name: `Hemdkauf ${stamp}`, telefon: '079 444 55 66' }, herkunft: 'store' });
  ok(/^\/admin\/rechnungen\//.test(r.url), `Rechnung ${r.nummer} (Direktverkauf) erstellt`);
  const rp = await api(`/api/admin/rechnungen/${r.id}/`, { positionen: [{ art: 'position', bezeichnung: 'Hemd nach Mass', menge: 1, einheit: 'Stk.', einzelpreisRp: 24000, mwstSatz: 8.1, kategorie: 'hemd' }] }, 'PATCH');
  ok(rp.totalRp === 24000, 'Hemd CHF 240 im Blatt');
  const b = await api(`/api/admin/rechnungen/${r.id}/`, { aktion: 'sofort-bezahlt', art: 'bar' });
  ok(b.status === 'bezahlt', `Bar bezahlt: ${b.meldung}`);
  const pdf = await api(`/api/admin/rechnungen/${r.id}/pdf/`, undefined, 'GET');
  ok(Buffer.isBuffer(pdf) && pdf.subarray(0, 4).toString() === '%PDF', `Rechnungs-PDF (${pdf.length} Bytes)`);
  if (ORDNER) writeFileSync(path.join(ORDNER, 'direktverkauf.pdf'), pdf);

  for (const s of ['/admin/uebersicht/', '/admin/angebote/', '/admin/rechnungen/', `/admin/kontakte/${n.kontaktId}/`]) {
    const x = await seite(s);
    ok(x.status === 200 && x.html.includes(s.includes('rechnungen') ? 'Neue Rechnung' : 'Neues Angebot'), `${s} zeigt den Neu-Knopf`);
  }
  console.log(fehlerZahl ? `\n${fehlerZahl} Prüfung(en) fehlgeschlagen` : '\nAlle Prüfungen bestanden.');
  process.exitCode = fehlerZahl ? 1 : 0;
}
main().catch((e) => {
  console.error('✗', e.message);
  process.exitCode = 1;
});
