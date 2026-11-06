// Rendert broschuere.html als A4-PDF (Chrome/Puppeteer) und legt es in Marketing/Broschuere/ ab.
// Aufruf: node render.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/strachi/_Claude/dlmdigital/node_modules/puppeteer-core');

const HTML = path.join(__dirname, 'broschuere.html');
const OUT_DIR = path.join(__dirname, 'out');
const ZIEL = path.join(__dirname, '..', 'The-Sartorialist-Broschuere-A4.pdf');

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.goto('file://' + HTML, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  // Überlauf-Prüfung: Inhalte, die über den Seitenrand hinausragen
  const probleme = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((p, i) => {
      const r = p.getBoundingClientRect();
      p.querySelectorAll('*').forEach((el) => {
        const e = el.getBoundingClientRect();
        if (e.width && (e.bottom > r.bottom + 0.5 || e.right > r.right + 0.5) && !el.closest('.img') && !el.classList.contains('cover-img'))
          out.push(`Seite ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> ragt hinaus`);
        if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow === 'hidden' && !el.classList.contains('page'))
          out.push(`Seite ${i + 1}: <${el.tagName.toLowerCase()} class="${el.className}"> abgeschnitten`);
      });
    });
    const fonts = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.style);
    return { out, fonts: [...new Set(fonts)] };
  });
  console.log('Schriften geladen:', probleme.fonts.join(', '));
  console.log(probleme.out.length ? probleme.out.join('\n') : 'Keine Überläufe gefunden.');
  const tmp = path.join(OUT_DIR, 'broschuere-roh.pdf');
  await page.pdf({ path: tmp, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  fs.copyFileSync(tmp, ZIEL);
  console.log('PDF:', ZIEL, (fs.statSync(ZIEL).size / 1024 / 1024).toFixed(2), 'MB');
})();
