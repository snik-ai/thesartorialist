// stills.mjs (v5) – Kontrollbilder zu beliebigen Zeiten (page.screenshot statt Element-Screenshot: robuster bei schweren Frames)
//   node engine/stills.mjs --page film-v5.html --w 1920 --h 1080 [--q f=9x16] --times 0.5,1,2 --out out/stills
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAGE = arg('page', 'film-v5.html'), W = +arg('w', 1920), H = +arg('h', 1080), OUT = arg('out', 'out/stills'), Q = arg('q', '');
const times = arg('times', '0').split(',').map(Number);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto('file://' + resolve(PAGE) + '?render' + (Q ? '&' + Q : ''));
await p.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });
for (const t of times) { await p.evaluate((t) => window.seek(t), t); await p.screenshot({ path: `${OUT}/t${t.toFixed(2).padStart(5, '0')}.png`, clip: { x: 0, y: 0, width: W, height: H } }); }
await b.close();
