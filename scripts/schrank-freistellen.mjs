// Stellt Produktfotos (Flat-Lays) für den 3D-Kleiderschrank auf /shop frei.
// Liest die Bilder live aus Shopify, entfernt den Hintergrund per Flood-Fill vom
// Bildrand aus (nur zusammenhängender Hintergrund, Kleidung bleibt unberührt),
// schneidet auf das Kleidungsstück zu und speichert transparentes WebP.
//
//   npm i --no-save sharp && node scripts/schrank-freistellen.mjs
//
// Ergebnis: public/media/schrank/<handle>.webp + lib/shop/wardrobe-data.json
// Stücke tauschen: Liste PIECES unten anpassen (nur Bilder ohne Model, ruhiger Hintergrund).
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/media/schrank');
const ENDPOINT = 'https://thesartorialistch.myshopify.com/api/2025-07/graphql.json';

// handle, Bildindex (Flat-Lay), Aufhängung: 'buegel' (Schulter) oder 'klammer' (Hose am Bund),
// optional Toleranz (helle Stücke auf hellem Grund: tiefer; Schlagschatten: höher).
// Helle Stücke auf hellem Grund (z. B. beige Chino) lassen sich so nicht freistellen.
const PIECES = [
  ['double-breasted-jacket-giacomo-gabardine-relax-light-beige', 0, 'buegel', { tol: 9, step: 3 }],
  ['cashmere-and-faux-fur-fishermans-rib-jacket', 0, 'buegel'],
  ['cloud-parka-melton-blue', 0, 'buegel'],
  ['felted-cashmere-crew-neck', 0, 'buegel'],
  ['wool-alaskan-shirt-jacket-dark-brown', 0, 'buegel'],
  ['pant-chino-luis-regular-gabardine-relax-green', 0, 'klammer'],
  ['single-breasted-jacket-filippo-gabardine-relax-green', 0, 'buegel'],
  ['mock-merinos-wool-bordeaux-red', 0, 'buegel'],
  ['double-wool-coat-melton-blue', 0, 'buegel'],
  ['cabled-and-ribbed-cashmere-polo-navy-blue', 0, 'buegel'],
  ['wool-keating-shirt-jacket-falcon', 0, 'buegel'],
  ['arctic-parka-black', 0, 'buegel', { tol: 70, step: 3 }],
  ['alcantara-and-merinos-full-zip-blue-navy', 0, 'buegel'],
  ['technical-wool-overshirt-blue-navy', 0, 'buegel'],
  ['vintage-merinos-mock-zip-concrete-grey', 0, 'buegel'],
];

async function images(handle) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `query($h:String!){ product(handle:$h){ title images(first:6){ nodes { url } } } }`, variables: { h: handle } }),
  });
  const j = await res.json();
  return j.data.product;
}

function cutout(data, w, h, opt = {}) {
  const px = (i) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  // Hintergrundfarbe = Median der Randpixel
  const border = [];
  for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  const med = [0, 1, 2].map((c) => {
    const v = border.map((i) => data[i * 4 + c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
  const TOL = opt.tol ?? 18, STEP = opt.step ?? 7;
  const diff = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  const bg = new Uint8Array(w * h);
  const stack = [];
  for (const i of border) if (diff(px(i), med) < TOL * 1.6) { bg[i] = 1; stack.push(i); }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    const c = px(i);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (bg[n]) continue;
      const p = px(n);
      // Weicher Verlauf/Schatten im Hintergrund: nah an der Hintergrundfarbe oder sehr nah am Nachbarn
      if (diff(p, med) < TOL || (diff(p, c) < STEP && diff(p, med) < TOL * 2.2)) { bg[n] = 1; stack.push(n); }
    }
  }
  // Alpha mit 1-px-Kante (Antialiasing) und Bounding Box
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (bg[i]) { data[i * 4 + 3] = 0; continue; }
    let edge = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && bg[ny * w + nx]) edge++;
    }
    data[i * 4 + 3] = edge ? 150 : 255;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

await fs.mkdir(OUT, { recursive: true });
const meta = [];
for (const [handle, idx, hang, opt] of PIECES) {
  const p = await images(handle);
  if (!p) { console.warn('fehlt in Shopify:', handle); continue; }
  const url = new URL(p.images.nodes[idx].url);
  url.searchParams.set('width', '900');
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const box = cutout(data, info.width, info.height, opt);
  const out = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract(box)
    .resize({ width: 560, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(path.join(OUT, `${handle}.webp`), out.data);
  meta.push({ handle, hang, w: out.info.width, h: out.info.height });
  console.log(handle, out.info.width + 'x' + out.info.height, Math.round(out.data.length / 1024) + ' KB');
}
await fs.writeFile(path.join(ROOT, 'lib/shop/wardrobe-data.json'), JSON.stringify(meta, null, 2) + '\n');
