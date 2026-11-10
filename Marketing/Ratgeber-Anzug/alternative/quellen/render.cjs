// Rendert ratgeber.html (Konzept B) als A4-PDF (Chrome/Puppeteer), prüft auf Überläufe und legt
// das PDF in Marketing/Ratgeber-Anzug/alternative/ ab. Zusätzlich: komprimierte Web-Fassung und
// Titelbild für die Website (public/ratgeber/), Auswahl-Vorschau (Titel + 2 Innenseiten).
// Aufruf: node render.cjs            (PDF + Prüfung)
//         node render.cjs --alles    (zusätzlich Web-Fassung, Cover, Vorschau)
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/strachi/_Claude/dlmdigital/node_modules/puppeteer-core');

const HTML = path.join(__dirname, 'ratgeber.html');
const OUT_DIR = path.join(__dirname, 'out');
const ZIEL = path.join(__dirname, '..', 'The-Sartorialist-Ratgeber-Anzug-A4.pdf');
const VORSCHAU = path.join(__dirname, '..', 'The-Sartorialist-Ratgeber-Anzug-Vorschau.png');
const PUBLIC = path.resolve(__dirname, '../../../../public/ratgeber');
const VORSCHAU_SEITEN = [1, 3, 8]; // Titel, Entscheidungsbaum, Matrix
const alles = process.argv.includes('--alles');

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + HTML, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  const probe = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((p, i) => {
      const r = p.getBoundingClientRect();
      p.querySelectorAll('*').forEach((el) => {
        if (el.closest('svg') || el.closest('.foto') || el.closest('.bild')) return;
        const e = el.getBoundingClientRect();
        if (e.width && (e.bottom > r.bottom + 0.5 || e.right > r.right + 0.5 || e.left < r.left - 0.5))
          out.push(`Seite ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> ragt hinaus`);
        if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow === 'hidden' && !el.classList.contains('page'))
          out.push(`Seite ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> abgeschnitten`);
      });
      // Inhalt darf den Seitenfuss nicht berühren
      const c = p.querySelector('.content');
      const f = p.querySelector('.foot');
      if (c && f) {
        const unten = Math.max(...[...c.querySelectorAll('*')].map((x) => x.getBoundingClientRect().bottom));
        if (unten > f.getBoundingClientRect().top - 2) out.push(`Seite ${i + 1}: Inhalt reicht bis in den Seitenfuss (${Math.round(unten - f.getBoundingClientRect().top)} px)`);
      }
    });
    const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.style);
    return { out, fonts: [...new Set(fonts)], seiten: document.querySelectorAll('.page').length };
  });
  console.log('Seiten:', probe.seiten);
  console.log('Schriften geladen:', probe.fonts.join(', '));
  console.log(probe.out.length ? probe.out.join('\n') : 'Keine Überläufe gefunden.');
  const tmp = path.join(OUT_DIR, 'ratgeber-roh.pdf');
  await page.pdf({ path: tmp, format: 'A4', printBackground: true, preferCSSPageSize: true });
  fs.copyFileSync(tmp, ZIEL);
  console.log('PDF:', ZIEL, (fs.statSync(ZIEL).size / 1024 / 1024).toFixed(2), 'MB');

  if (alles) {
    // Seiten einzeln als PNG (für Cover und Vorschau)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    const seitenPng = [];
    for (const n of VORSCHAU_SEITEN) {
      const el = (await page.$$('.page'))[n - 1];
      const datei = path.join(OUT_DIR, `seite-${n}.png`);
      await el.screenshot({ path: datei });
      seitenPng.push(datei);
    }
    const sharp = require('/Users/strachi/_Claude/dlmdigital/node_modules/sharp');
    fs.mkdirSync(PUBLIC, { recursive: true });
    await sharp(seitenPng[0]).resize(800, 1131, { fit: 'fill' }).webp({ quality: 82 }).toFile(path.join(PUBLIC, 'cover-b.webp'));
    // Innenseite (Matrix) für das Cover-Mockup und Web-Fassung des PDFs (bereits < 4 MB, Bilder vorab komprimiert)
    await sharp(seitenPng[2]).resize(800, 1131, { fit: 'fill' }).webp({ quality: 82 }).toFile(path.join(PUBLIC, 'innen-b.webp'));
    fs.copyFileSync(ZIEL, path.join(PUBLIC, 'ratgeber-anzug-b.pdf'));
    console.log('Web:', path.join(PUBLIC, 'ratgeber-anzug-b.pdf'), (fs.statSync(ZIEL).size / 1024 / 1024).toFixed(2), 'MB');
    // Vorschau: drei Seiten nebeneinander auf neutralem Grund, ohne Schatten (feiner Rahmen)
    const W = 720, H = 1018, gap = 60, rand = 80;
    const breite = rand * 2 + W * 3 + gap * 2;
    const hoehe = rand * 2 + H + 70;
    const teile = [];
    for (let i = 0; i < 3; i++) {
      const b = await sharp(seitenPng[i]).resize(W, H, { fit: 'fill' }).extend({ top: 1, bottom: 1, left: 1, right: 1, background: '#cfd3da' }).png().toBuffer();
      teile.push({ input: b, left: rand + i * (W + gap) - 1, top: rand - 1 });
    }
    const label = `<svg width="${breite}" height="60"><text x="${rand}" y="34" font-family="Helvetica Neue, Arial" font-size="24" fill="#5f6a80" letter-spacing="3">KONZEPT B · DER PASSENDE ANZUG · GRAFISCHER GUIDE · TITEL, ENTSCHEIDUNGSBAUM, MATRIX</text></svg>`;
    teile.push({ input: Buffer.from(label), left: 0, top: rand + H + 18 });
    await sharp({ create: { width: breite, height: hoehe, channels: 3, background: '#eceae5' } }).composite(teile).png({ compressionLevel: 9 }).toFile(VORSCHAU);
    console.log('Vorschau:', VORSCHAU);
  }
  await browser.close();
})();
