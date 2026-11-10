// Bildschirmfotos der wichtigsten Schritte (lokal, Chrome über puppeteer-core): Einstellungen Bank, Übersicht ohne IBAN,
// Rechnungseditor ohne/mit IBAN, Angebot mit Zahlungsbedingungen + Annahme-Dialog, Auftrag ohne Plan, Annahmeseite.
// Aufruf: node scripts/screens-qr.mjs http://localhost:3147 <ordner>
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [BASIS, ORDNER = 'screens'] = process.argv.slice(2);
mkdirSync(ORDNER, { recursive: true });
let cookie = '';
async function api(p, body, methode = 'POST') {
  const r = await fetch(BASIS + p, { method: methode, headers: { 'Content-Type': 'application/json', Origin: BASIS, ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const sc = r.headers.get('set-cookie');
  if (sc && /ts_admin=/.test(sc)) cookie = sc.split(';')[0];
  return r.json().catch(() => ({}));
}
const c = await api('/api/login/code/', { email: 'store@thesartorialist.ch' });
await api('/api/login/pruefen/', { email: 'store@thesartorialist.ch', code: c.devCode });
const [name, wert] = cookie.split('=');

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await page.setCookie({ name, value: wert, url: BASIS });
const fehler = [];
page.on('pageerror', (e) => fehler.push(e.message));
const foto = async (pfad, datei, vorher) => {
  await page.goto(BASIS + pfad, { waitUntil: 'networkidle0' });
  // Angebote nach dem Login (Benachrichtigungen, Face ID) wegklicken
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => /^(später|nicht jetzt)$/i.test(b.textContent?.trim() ?? ''))?.click());
  }
  if (vorher) await vorher();
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ORDNER, datei), fullPage: false });
  console.log(`✓ ${datei}`);
};
const klick = (text) => page.evaluate((t) => [...document.querySelectorAll('button,a')].find((b) => b.textContent?.trim().startsWith(t))?.click(), text);

// Kunde + Angebot (gesendet) + Auftrag ohne Plan
const k = await api('/api/admin/kontakte/', { name: 'Bildschirm Kunde', status: 'kunde' });
await api(`/api/admin/kontakte/${k.id}/`, { strasse: 'Seestrasse 4', plz: '8002', ort: 'Zürich' }, 'PATCH');
const pos = [{ art: 'position', bezeichnung: 'Massanzug dreiteilig · Super 130', menge: 1, einheit: 'Stk.', einzelpreisRp: 289000, mwstSatz: 8.1, kategorie: 'massanzug' }];
const an = await api('/api/admin/angebote/', { kontaktId: k.id });
await api(`/api/admin/angebote/${an.id}/`, { titel: 'Hochzeitsanzug dreiteilig', positionen: pos }, 'PATCH');
const l = await api(`/api/admin/angebote/${an.id}/`, { aktion: 'link' });
const an2 = await api('/api/admin/angebote/', { kontaktId: k.id });
await api(`/api/admin/angebote/${an2.id}/`, { titel: 'Mantel', positionen: pos, zahlungsplan: null }, 'PATCH');
const a2 = await api(`/api/admin/angebote/${an2.id}/`, { aktion: 'annehmen', name: 'Bildschirm Kunde', zahlungsplan: null });

// Ohne IBAN
await api('/api/admin/firma/', { schluessel: 'firma', wert: { iban: '', qrIban: '' } }, 'PUT');
const re = await api(`/api/admin/rechnungen/`, { kontaktId: k.id, art: 'rechnung' });
await api(`/api/admin/rechnungen/${re.id}/`, { titel: 'Hemden nach Mass', positionen: [{ ...pos[0], bezeichnung: 'Hemd nach Mass', einzelpreisRp: 29000, menge: 2 }] }, 'PATCH');
await foto('/admin/uebersicht/', '01-uebersicht-ohne-iban.png');
await foto(`/admin/rechnungen/${re.id}/`, '02-rechnung-ohne-iban.png');
await foto('/admin/einstellungen/#bank', '03-einstellungen-bank-leer.png', () => page.evaluate(() => document.getElementById('bank')?.scrollIntoView()));
// Mit QR-IBAN
await api('/api/admin/firma/', { schluessel: 'firma', wert: { iban: 'CH58 0079 1123 0008 8901 2', qrIban: 'CH44 3199 9123 0008 8901 2' } }, 'PUT');
await foto('/admin/einstellungen/?neu=1#bank', '04-einstellungen-bank-ok.png', () => page.evaluate(() => document.getElementById('bank')?.scrollIntoView()));
await foto(`/admin/rechnungen/${re.id}/`, '05-rechnung-mit-qr.png', () => page.evaluate(() => document.querySelector('.bl-qr-teil, .dk-zusatz, .bl-qr-seite')?.scrollIntoView()));
await foto(`/admin/angebote/${an.id}/`, '06-angebot-zahlungsbedingungen.png', () => page.evaluate(() => [...document.querySelectorAll('h3,h2,span,b')].find((x) => x.textContent === 'Zahlungsbedingungen')?.scrollIntoView()));
await foto(`/admin/angebote/${an.id}/`, '07-annahme-dialog.png', async () => {
  await klick('Als angenommen erfassen');
  await new Promise((r) => setTimeout(r, 500));
  await klick('Anzahlung + Rest');
});
await foto(`/admin/auftraege/${a2.auftragId}/`, '08-auftrag-ohne-plan.png');
await foto(l.link.replace(/^https?:\/\/[^/]+/, ''), '09-annahmeseite.png');
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await foto(`/admin/auftraege/${a2.auftragId}/`, '10-auftrag-ohne-plan-mobil.png');
await api('/api/admin/firma/', { schluessel: 'firma', wert: { qrIban: '' } }, 'PUT');
await browser.close();
console.log(fehler.length ? `Seitenfehler: ${fehler.join(' | ')}` : 'Keine Seitenfehler.');
