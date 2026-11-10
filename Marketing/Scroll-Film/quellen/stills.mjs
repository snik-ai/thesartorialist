// Kontrollbilder des Scroll-Films an festen Fortschritts-Positionen (Desktop + Mobile).
// Aufruf: node stills.mjs <url> <ausgabeordner> [p1,p2,…]
// Beispiel: node stills.mjs http://localhost:3417/ out/stills -0.1,0.05,0.2,0.34,0.45,0.56,0.7,0.8,0.9,1
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:3000/';
const out = process.argv[3] ?? 'out/stills';
const ps = (process.argv[4] ?? '-0.1,0.05,0.12,0.2,0.34,0.45,0.56,0.66,0.75,0.84,0.9,1').split(',').map(Number);
const geraete = (process.env.GERAETE ?? 'desktop,mobile').split(',');
const GROESSE = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
for (const g of geraete) {
  const page = await browser.newPage();
  await page.setViewport(GROESSE[g]);
  if (process.env.RUHIG) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await page.evaluate(() => document.querySelector('.cookie-banner, [data-cookie]')?.remove());
  if (process.env.RUHIG) {
    const y = await page.evaluate(() => document.querySelector('.mf').getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo(0, y), y);
    await new Promise((r) => setTimeout(r, 1500));
    const el = await page.$('.mf');
    await el.screenshot({ path: `${out}/${g}-ruhig.png` });
    await page.close();
    continue;
  }
  for (const p of ps) {
    await page.evaluate((p) => {
      const s = document.querySelector('.mf');
      const top = s.getBoundingClientRect().top + scrollY;
      const weg = s.offsetHeight - innerHeight;
      scrollTo(0, top + p * weg);
    }, p);
    await new Promise((r) => setTimeout(r, 1400));
    await page.screenshot({ path: `${out}/${g}-${String(p).replace('-', 'm')}.png` });
  }
  await page.close();
}
await browser.close();
console.log('fertig', out);
