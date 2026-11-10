// App-Icon (macOS-Stil) und Menüleisten-Symbol aus dem Monogramm der Marke (public/images/marke/).
// - app-icon-1024.png: abgerundetes Quadrat (824 px auf 1024, Apple-Raster), tiefschwarz mit sehr leichtem Verlauf, feiner Goldrand,
//   weisses Monogramm. Daraus erzeugt `tauri icon` icon.icns, icon.ico und die PNG-Grössen (npm run icons).
// - tray-vorlage.png / tray-vorlage@2x.png: Template-Bild (schwarz auf transparent), macOS färbt es hell/dunkel selbst ein.
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const ziel = join(hier, '../src-tauri/icons');
const marke = join(hier, '../../public/images/marke');

// Monogramm (700 × 558, Alphakanal) auf 500 px Breite, mittig in die Kachel
const mono = await sharp(join(marke, 'monogramm-weiss.png')).trim().resize({ width: 470 }).png().toBuffer();
const { width: mw, height: mh } = await sharp(mono).metadata();

const kachel = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161615"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity=".3"/></filter>
  </defs>
  <rect x="100" y="100" width="824" height="824" rx="185" fill="url(#g)" filter="url(#s)"/>
  <rect x="122" y="122" width="780" height="780" rx="165" fill="none" stroke="#c9a063" stroke-opacity=".55" stroke-width="3"/>
  <rect x="452" y="790" width="120" height="4" rx="2" fill="#c9a063"/>
</svg>`;
await sharp(Buffer.from(kachel))
  .composite([{ input: mono, left: Math.round(512 - mw / 2), top: Math.round(480 - mh / 2) }])
  .png()
  .toFile(join(ziel, 'app-icon-1024.png'));

// Menüleiste: 22 pt hoch (44 px @2x), schwarzes Monogramm als Vorlage
for (const [px, datei] of [[22, 'tray-vorlage.png'], [44, 'tray-vorlage@2x.png']]) {
  const m = await sharp(join(marke, 'monogramm-schwarz.png')).trim().resize({ height: Math.round(px * 0.86), width: px, fit: 'inside' }).png().toBuffer();
  const meta = await sharp(m).metadata();
  await sharp({ create: { width: px, height: px, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: m, left: Math.round((px - meta.width) / 2), top: Math.round((px - meta.height) / 2) }])
    .png()
    .toFile(join(ziel, datei));
}
console.log('Icons erzeugt in', ziel);
