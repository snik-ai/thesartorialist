// Kopie aus ~/.claude/skills/motion-reel/engine/render.mjs (v5 angepasst)
// render.mjs — rendert eine seek(t)-Seite Frame für Frame zu MP4, mit echter Bewegungsunschärfe.
// node render.mjs --page film.html --w 1080 --h 1350 --fps 60 --dur 15 --sub 4 --out out/silent.mp4
//   [--from 4 --to 6]   nur einen Ausschnitt rendern (für Korrekturschleifen)
//   [--q "v=general"]   Query-String für Varianten
// Die Seite muss window.seek(t) bereitstellen und <canvas id="c"> enthalten.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.HOME + '/.nvm/versions/node/v20.19.2/lib/node_modules/playwright')); }

const argv = process.argv;
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > 0 ? argv[i + 1] : d; };
const PAGE = arg('page', 'index.html'), W = +arg('w', 1080), H = +arg('h', 1350);
const FPS = +arg('fps', 60), SUB = +arg('sub', 4), OUT = arg('out', 'out/silent.mp4');
const FROM = +arg('from', 0), DUR = +arg('dur', 15), TO = +arg('to', DUR), Q = arg('q', '');
mkdirSync(dirname(resolve(OUT)), { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('file://' + resolve(PAGE) + '?render' + (Q ? '&' + Q : ''));
await page.evaluate(async () => { await document.fonts.ready; if (window.ready) await window.ready; });

// tmix mittelt SUB aufeinanderfolgende Subframes (Bewegungsunschärfe wie ein 180°-Shutter)
const vf = SUB > 1 ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB` : 'null';
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
  '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT],
  { stdio: ['pipe', 'inherit', 'inherit'] });

const n0 = Math.round(FROM * FPS * SUB), n1 = Math.round(TO * FPS * SUB);
// v5: page.screenshot mit clip statt Element-Screenshot (Element-Screenshot wartet mit dieser Chrome-Version teils endlos auf «stable»)
const t0 = Date.now();
for (let i = n0; i < n1; i++) {
  // Subframes liegen innerhalb des Belichtungsfensters des Frames (Shutter 0.5 Frame)
  const t = (Math.floor(i / SUB) + (i % SUB) / SUB * 0.5) / FPS;
  await page.evaluate((t) => window.seek(t), t);
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if ((i - n0) % (FPS * SUB) === 0) process.stdout.write(`\r  ${((i - n0) / (FPS * SUB)).toFixed(0)}s / ${(TO - FROM).toFixed(0)}s  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log(`\n  → ${OUT}`);
