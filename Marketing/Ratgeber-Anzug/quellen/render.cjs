// Rendert ratgeber.html als A4-PDF (Chrome/Puppeteer), prüft auf Überläufe und legt das PDF in
// Marketing/Ratgeber-Anzug/ ab. Mit «--web» zusätzlich die Website-Kopie und das Cover für public/ratgeber/.
// Aufruf (im Ordner quellen/): node render.cjs [--web]
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/strachi/_Claude/dlmdigital/node_modules/puppeteer-core');

const HTML = path.join(__dirname, 'ratgeber.html');
const OUT_DIR = path.join(__dirname, 'out');
const ZIEL = path.join(__dirname, '..', 'The-Sartorialist-Ratgeber-Anzug-A4.pdf');
const WEB_DIR = path.resolve(__dirname, '../../../public/ratgeber');

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + HTML, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  // Überlauf-Prüfung: Inhalte, die über den Seitenrand hinausragen oder abgeschnitten sind
  const probleme = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((p, i) => {
      const r = p.getBoundingClientRect();
      p.querySelectorAll('*').forEach((el) => {
        const e = el.getBoundingClientRect();
        if (e.width && (e.bottom > r.bottom + 0.5 || e.right > r.right + 0.5) && !el.closest('.bleed'))
          out.push(`Seite ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> ragt hinaus`);
        if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow === 'hidden' && !el.classList.contains('page') && !el.closest('.bleed'))
          out.push(`Seite ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> abgeschnitten`);
      });
    });
    const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.style);
    return { out, fonts: [...new Set(fonts)], seiten: document.querySelectorAll('.page').length };
  });
  console.log('Seiten:', probleme.seiten);
  console.log('Schriften geladen:', probleme.fonts.join(', '));
  console.log(probleme.out.length ? probleme.out.join('\n') : 'Keine Überläufe gefunden.');
  const tmp = path.join(OUT_DIR, 'ratgeber-roh.pdf');
  await page.pdf({ path: tmp, format: 'A4', printBackground: true, preferCSSPageSize: true });
  fs.copyFileSync(tmp, ZIEL);
  console.log('PDF:', ZIEL, (fs.statSync(ZIEL).size / 1024 / 1024).toFixed(2), 'MB');

  if (process.argv.includes('--web')) {
    fs.mkdirSync(WEB_DIR, { recursive: true });
    fs.copyFileSync(ZIEL, path.join(WEB_DIR, 'ratgeber-anzug-a.pdf'));
    // Cover: nur die Titelseite als Bild (800 × 1131)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    const cover = await page.$('.page');
    const png = path.join(OUT_DIR, 'cover-a.png');
    await cover.screenshot({ path: png });
    const sharp = require('/Users/strachi/_Claude/dlmdigital/node_modules/sharp');
    await sharp(png).resize(800, 1131, { fit: 'fill' }).webp({ quality: 82 }).toFile(path.join(WEB_DIR, 'cover-a.webp'));
    console.log('Web:', path.join(WEB_DIR, 'ratgeber-anzug-a.pdf'), '+ cover-a.webp');
  }
  await browser.close();
})();
