// Bereitet die Bilder des Ratgebers «Der passende Anzug» (Konzept A) vor: WebP aus public/ → JPEG,
// verkleinert und komprimiert, Ablage in quellen/img/. Läuft mit Chrome (Canvas), ohne Zusatzpakete.
// Aufruf (im Ordner quellen/): node bilder-vorbereiten.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/strachi/_Claude/dlmdigital/node_modules/puppeteer-core');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.join(__dirname, 'img');
fs.mkdirSync(OUT, { recursive: true });

// [Quelle relativ zu public/, Zielname, maximale Breite, Qualität]
const FOTOS = [
  ['images/massanzug-loro-piana.webp', 'titel.jpg', 1500, 0.74],
  ['images/Foto-mit-Schere.webp', 'schere.jpg', 1400, 0.72],
  ['images/italienischer-massanzug.webp', 'anlass.jpg', 1500, 0.74],
  ['images/massanzug-zuerich.webp', 'business.jpg', 1100, 0.74],
  ['images/braeutigam-anzug-zuerich.webp', 'gast.jpg', 1100, 0.74],
  ['images/business-anzug-zuerich.webp', 'casual.jpg', 1100, 0.74],
  ['images/hochzeitsanzug-zuerich.webp', 'sommer.jpg', 1100, 0.74],
  ['images/eleganter-hochzeitsanzug.webp', 'braeutigam.jpg', 1100, 0.74],
  ['images/Hochzeitsanzug-Zurich-scaled.webp', 'hochzeit.jpg', 1300, 0.74],
  ['images/vintage-hochzeitsanzug.webp', 'vintage.jpg', 1000, 0.74],
  ['images/44849194_2705195396372447_7380840413906304788_n.webp', 'flanell.jpg', 1080, 0.74],
  ['images/Holland-Sherry-8-scaled.webp', 'stoff-1.jpg', 1300, 0.72],
  ['images/Holland-Sherry-7-scaled.webp', 'stoff-2.jpg', 1100, 0.72],
  ['images/Holland-Sherry-2-scaled.webp', 'stoff-3.jpg', 1100, 0.72],
  ['images/Holland-Sherry-1-scaled.webp', 'stoff-4.jpg', 1100, 0.72],
  ['images/hermes-rivera-YxbwyTb5ijs-unsplash-scaled.webp', 'farbe-blau.jpg', 900, 0.74],
  ['images/grigore-ricky-TVUUz6bMFSQ-unsplash-scaled.webp', 'farbe-gruen.jpg', 900, 0.74],
  ['images/sommeranzug-hochzeit.webp', 'farbe-beige.jpg', 1000, 0.74],
  ['images/masshemd.webp', 'hemd.jpg', 1100, 0.74],
  ['images/masshend-zuerich.webp', 'hemd-2.jpg', 1000, 0.74],
  ['images/9.webp', 'santangelo.jpg', 300, 0.86],
  ['images/the-sartorialist-zuerich.webp', 'atelier.jpg', 1300, 0.74],
  ['images/DSC_7280-scaled.webp', 'anprobe.jpg', 1300, 0.72],
  ['images/DSC_7381-scaled.webp', 'zuschnitt.jpg', 1100, 0.72],
  ['images/DSC_7309-scaled.webp', 'handarbeit.jpg', 1100, 0.72],
];

// Illustrationen aus «Styles & Options» (public/konfigurator)
const ILLU = [
  'jacket/sb-1b', 'jacket/sb-2b', 'jacket/sb-3b', 'jacket/sb-3-2b', 'jacket/db-6x2',
  'jacket/lapel-sb-notch-regular', 'jacket/lapel-sb-notch-large', 'jacket/lapel-sb-peak-regular', 'jacket/lapel-db-peak-regular',
  'jacket/pocket-barchetta-jetted', 'jacket/pocket-barchetta-flap', 'jacket/pocket-barchetta-patch', 'jacket/pocket-patch-patch', 'jacket/pocket-ticket-flap-clean',
  'jacket/back-side-vents', 'jacket/back-ventless', 'jacket/shoulder-soft', 'jacket/shoulder-traditional', 'jacket/shoulder-roped',
  'jacket/lining-unlined', 'jacket/cuff-4b', 'jacket/buttonhole-milanese', 'jacket/monogram-lined',
  'trousers/front-flat', 'trousers/front-single-pleat', 'trousers/front-double-pleat', 'trousers/waistband-side-adjusters', 'trousers/waistband-belt-loops',
  'trousers/hem-plain-bottom', 'trousers/hem-turnup-4cm',
  'waistcoat/sb-5b', 'waistcoat/db-6b', 'waistcoat/sb-horseshoe',
  'black-tie/tux-shawl', 'black-tie/tux-peak-sb', 'black-tie/tux-peak-db', 'black-tie/facing-satin-v2', 'black-tie/trousers-braid-stripe',
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
  for (const i of ILLU) await convert(`konfigurator/${i}.webp`, `illu/${i.replace('/', '-')}.jpg`, 500, 0.86);
  await convert('images/sartorialist-zurich-logo.png', 'logo-weiss.png', 600, 1, 'image/png', true);
  await convert('images/sartorialist-zurich-logo.png', 'logo-schwarz.png', 600, 1, 'image/png');
  await browser.close();
  console.log('Bilder vorbereitet:', FOTOS.length + ILLU.length + 2);
})();
