// Grobe Ruckel-Messung: scrollt die Sektion Bild für Bild durch und misst die Frame-Abstände.
// Aufruf: node perf.mjs <url> [cpu-drossel]   (Drossel 4 ≈ Mittelklasse-Handy)
import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://localhost:3000/';
const drossel = Number(process.argv[3] ?? 4);
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
for (const vp of [
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 2 },
]) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: drossel });
  const r = await page.evaluate(async () => {
    const s = document.querySelector('.mf');
    const top = s.getBoundingClientRect().top + scrollY - innerHeight;
    const ende = top + s.offsetHeight + innerHeight;
    scrollTo(0, top);
    await new Promise((r) => setTimeout(r, 800));
    const d = [];
    let last = performance.now();
    let y = top;
    await new Promise((fertig) => {
      const f = (now) => {
        d.push(now - last);
        last = now;
        y += 14;
        scrollTo(0, y);
        if (y < ende) requestAnimationFrame(f);
        else fertig();
      };
      requestAnimationFrame(f);
    });
    d.sort((a, b) => a - b);
    const q = (x) => d[Math.floor(d.length * x)];
    const z = (window.__mf ?? []).slice().sort((a, b) => a - b);
    const zq = (x) => (z.length ? z[Math.floor(z.length * x)].toFixed(2) : '–');
    return { zeichnenMedianMs: zq(0.5), zeichnenP95Ms: zq(0.95), zeichnenMaxMs: z.length ? z[z.length - 1].toFixed(2) : '–', frames: d.length, median: q(0.5).toFixed(1), p95: q(0.95).toFixed(1), max: d[d.length - 1].toFixed(1), ueber20: d.filter((x) => x > 20).length };
  });
  console.log(vp.name, `CPU÷${drossel}`, r);
  await page.close();
}
await browser.close();
