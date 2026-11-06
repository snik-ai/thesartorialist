// Teilen-Bilder (1200×630 JPG) für das Glossar: Illustration bzw. Foto rechts,
// Begriff links in Serifenschrift. Ausführen nach Änderungen am Glossar:
//   npm i --no-save sharp tsx && npx tsx scripts/glossar-og.mts
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { GLOSSAR } from '../lib/glossar/index.ts';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/glossar/og');
await fs.mkdir(OUT, { recursive: true });

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Begriff auf max. 2 Zeilen umbrechen */
function zeilen(t: string, max = 16) {
  const w = t.split(' ');
  const out: string[] = [];
  let cur = '';
  for (const x of w) {
    if ((cur + ' ' + x).trim().length > max && cur) {
      out.push(cur);
      cur = x;
    } else cur = (cur + ' ' + x).trim();
  }
  if (cur) out.push(cur);
  return out.slice(0, 3);
}

async function bild(slug: string, titel: string, sub: string, src: string | null) {
  const W = 1200, H = 630;
  // Textspalte ist ~600 px breit: Schriftgrösse an die längste Zeile anpassen (Georgia fett ≈ 0.58 em/Zeichen)
  const L = zeilen(titel, 13);
  const longest = Math.max(...L.map((l) => l.length));
  const size = Math.min(92, Math.floor(590 / (longest * 0.6)));
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f6f5f2"/>
    <rect x="0" y="0" width="12" height="${H}" fill="#101010"/>
    <text x="80" y="120" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="5" fill="#7a766e">GLOSSAR · ${esc(sub.toUpperCase())}</text>
    ${L.map((l, i) => `<text x="76" y="${250 + i * (size + 8)}" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="${size}" fill="#101010">${esc(l)}</text>`).join('')}
    <rect x="80" y="${270 + L.length * (size + 8) - size + 10}" width="70" height="3" fill="#b08d57"/>
    <text x="80" y="560" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="30" fill="#101010">THE SARTORIALIST</text>
    <text x="82" y="590" font-family="Helvetica, Arial, sans-serif" font-size="16" letter-spacing="8" fill="#101010">ZÜRICH · MASSANZUG</text>
  </svg>`;
  const layers: sharp.OverlayOptions[] = [];
  if (src) {
    const file = path.join(ROOT, 'public', src);
    const zeichnung = src.startsWith('/konfigurator/');
    const bw = 470, bh = 550;
    const img = await sharp(file)
      .resize(bw - (zeichnung ? 60 : 0), bh - (zeichnung ? 60 : 0), { fit: zeichnung ? 'contain' : 'cover', background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .toBuffer();
    const frame = await sharp({ create: { width: bw, height: bh, channels: 3, background: '#ffffff' } })
      .composite([{ input: img, gravity: 'center' }])
      .png()
      .toBuffer();
    layers.push({ input: frame, left: W - bw - 40, top: 40 });
  }
  await sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${slug}.jpg`));
}

for (const b of GLOSSAR) await bild(b.slug, b.begriff, b.gruppe, b.bild);
await bild('glossar', 'Glossar der Massschneiderei', `${GLOSSAR.length} Begriffe`, '/images/Holland-Sherry-8-scaled.webp');
console.log(`${GLOSSAR.length + 1} Bilder in public/glossar/og/`);
