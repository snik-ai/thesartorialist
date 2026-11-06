// Bereitet die Bilder der Broschüre vor: WebP aus public/ → JPEG (Fotos) bzw. PNG (Logo),
// verkleinert und komprimiert, Ablage in quellen/img/. Läuft mit Chrome (Canvas), ohne Zusatzpakete.
// Aufruf: node bilder-vorbereiten.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/strachi/_Claude/dlmdigital/node_modules/puppeteer-core');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.join(__dirname, 'img');
fs.mkdirSync(OUT, { recursive: true });

// [Quelle relativ zu public/, Zielname, maximale Breite, Qualität]
const FOTOS = [
  ['images/massanzug-loro-piana.webp', 'titel.jpg', 1500, 0.84],
  ['images/Foto-mit-Schere.webp', 'schere.jpg', 1600, 0.82],
  ['images/the-sartorialist-zuerich.webp', 'atelier-sakko.jpg', 1500, 0.82],
  ['images/massanzug-zuerich.webp', 'massanzug.jpg', 1500, 0.82],
  ['images/italienischer-massanzug.webp', 'italienisch.jpg', 1500, 0.82],
  ['images/DSC_7187-scaled.webp', 'manufaktur-1.jpg', 1600, 0.8],
  ['images/DSC_7309-scaled.webp', 'manufaktur-3.jpg', 1600, 0.8],
  ['images/DSC_7143-scaled.webp', 'manufaktur-4.jpg', 1600, 0.8],
  ['images/Holland-Sherry-8-scaled.webp', 'stoff-1.jpg', 1600, 0.82],
  ['images/Holland-Sherry-3-scaled.webp', 'stoff-2.jpg', 1600, 0.82],
  ['images/Holland-Sherry-4-scaled.webp', 'stoff-3.jpg', 1600, 0.82],
  ['images/Holland-Sherry-6-scaled.webp', 'stoff-4.jpg', 1600, 0.82],
  ['images/Holland-Sherry-5-scaled.webp', 'stoff-5.jpg', 1600, 0.82],
  ['images/Hochzeitsanzug-Zurich-scaled.webp', 'hochzeit.jpg', 1454, 0.84],
  ['images/braeutigam-anzug-zuerich.webp', 'braeutigam.jpg', 1500, 0.82],
  ['images/vintage-hochzeitsanzug.webp', 'vintage.jpg', 1500, 0.82],
  ['images/eleganter-hochzeitsanzug.webp', 'hochzeit-elegant.jpg', 1500, 0.82],
  ['images/orazio-luzioano.webp', 'brand-orazio.jpg', 474, 0.9],
  ['images/9.webp', 'brand-santangelo.jpg', 1000, 0.82],
  ['images/Holland-Sherry-9-scaled.webp', 'brand-hollandsherry.jpg', 1200, 0.82],
  ['images/2024069_A20245715220202049L.webp', 'brand-gransasso.jpg', 1000, 0.82],
  ['images/CFWOOU0792MRUT3496-3989.webp', 'brand-woolrich.jpg', 1000, 0.82],
];

// Illustrationen aus «Styles & Options» (public/konfigurator)
const ILLU = [
  'jacket/sb-2b', 'jacket/db-6x2', 'jacket/lapel-sb-notch-regular', 'jacket/lapel-sb-peak-regular',
  'jacket/lapel-sb-shawl-regular', 'jacket/pocket-barchetta-flap', 'jacket/pocket-patch-patch', 'jacket/back-side-vents',
  'jacket/sb-3-2b', 'jacket/pocket-safari', 'jacket/canvas-traditional', 'jacket/monogram-lined',
  'trousers/front-flat', 'trousers/front-double-pleat', 'trousers/waistband-side-adjusters', 'trousers/hem-turnup-4cm',
  'waistcoat/sb-5b', 'waistcoat/db-6b', 'black-tie/tux-shawl', 'black-tie/tux-peak-db',
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage();
  await page.setContent('<canvas id="c"></canvas>');
  async function convert(src, dest, maxW, q, mime = 'image/jpeg', weiss = false) {
    const b64 = fs.readFileSync(path.join(ROOT, 'public', src)).toString('base64');
    const ext = path.extname(src).slice(1).replace('jpg', 'jpeg');
    const data = await page.evaluate(async (b64, ext, maxW, q, mime, weiss) => {
      const img = new Image();
      img.src = `data:image/${ext};base64,${b64}`;
      await img.decode();
      const s = Math.min(1, maxW / img.naturalWidth);
      const c = document.getElementById('c');
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      if (mime === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
      else x.clearRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      if (weiss) { x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
      return c.toDataURL(mime, q).split(',')[1];
    }, b64, ext, maxW, q, mime, weiss);
    fs.writeFileSync(path.join(OUT, dest), Buffer.from(data, 'base64'));
  }
  for (const [src, dest, w, q] of FOTOS) await convert(src, dest, w, q);
  fs.mkdirSync(path.join(OUT, 'illu'), { recursive: true });
  for (const i of ILLU) await convert(`konfigurator/${i}.webp`, `illu/${i.replace('/', '-')}.jpg`, 600, 0.9);
  await convert('images/sartorialist-zurich-logo.png', 'logo-weiss.png', 600, 1, 'image/png', true);
  await browser.close();
  console.log('Bilder vorbereitet:', FOTOS.length + ILLU.length + 2);
})();
