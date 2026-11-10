// Bereitet die Bilder des Ratgebers (Konzept B) vor: WebP aus public/ → JPEG, verkleinert und
// komprimiert, Ablage in quellen/img/. Läuft mit Chrome (Canvas), ohne Zusatzpakete.
// Aufruf: node bilder-vorbereiten.cjs
const fs = require('fs');
const path = require('path');
const puppeteer = require('/Users/strachi/_Claude/dlmdigital/node_modules/puppeteer-core');

const ROOT = path.resolve(__dirname, '../../../..');
const OUT = path.join(__dirname, 'img');
fs.mkdirSync(path.join(OUT, 'illu'), { recursive: true });

// [Quelle relativ zu public/, Zielname, maximale Breite, Qualität]
const FOTOS = [
  ['images/massanzug-zuerich.webp', 'titel.jpg', 1400, 0.82],
  ['images/massanzug-loro-piana.webp', 'business.jpg', 1000, 0.8],
  ['images/business-anzug-zuerich.webp', 'smart-casual.jpg', 1000, 0.8],
  ['images/hochzeitsanzug-zuerich.webp', 'braeutigam.jpg', 1000, 0.8],
  ['images/slider-1.webp', 'gast.jpg', 1000, 0.8],
  ['images/sommeranzug-hochzeit.webp', 'sommer.jpg', 1000, 0.8],
  ['images/navy-blauer-anzug.webp', 'abend.jpg', 1000, 0.8],
  ['images/Holland-Sherry-3-scaled.webp', 'stoff-super.jpg', 1000, 0.8],
  ['images/Holland-Sherry-4-scaled.webp', 'stoff-streifen.jpg', 1000, 0.8],
  ['images/Holland-Sherry-5-scaled.webp', 'stoff-muster.jpg', 1000, 0.8],
  ['images/Holland-Sherry-7-scaled.webp', 'stoff-karo.jpg', 1000, 0.8],
  ['images/loro-piana-stoffe.webp', 'loro-piana.jpg', 900, 0.8],
  ['images/the-sartorialist-zuerich.webp', 'kombi.jpg', 1000, 0.8],
  ['images/vintage-hochzeitsanzug.webp', 'kombi-2.jpg', 900, 0.8],
  ['images/DSC_7280-scaled.webp', 'anprobe.jpg', 1200, 0.8],
  ['images/Foto-mit-Schere.webp', 'schere.jpg', 1200, 0.8],
  ['images/DSC_7187-scaled.webp', 'zuschnitt.jpg', 1200, 0.8],
];

// Illustrationen aus «Styles & Options» (public/konfigurator)
const ILLU = [
  'jacket/sb-1b', 'jacket/sb-2b', 'jacket/sb-3-2b', 'jacket/db-6x2', 'jacket/lapel-sb-notch-regular', 'jacket/lapel-sb-peak-regular',
  'jacket/lapel-sb-shawl-regular', 'jacket/back-side-vents', 'jacket/back-ventless', 'jacket/pocket-patch-patch', 'jacket/pocket-barchetta-flap',
  'jacket/pocket-barchetta-jetted', 'jacket/sb-3b', 'jacket/lapel-sb-peak-large',
  'trousers/front-flat', 'trousers/front-double-pleat', 'trousers/waistband-side-adjusters', 'trousers/hem-turnup-4cm', 'trousers/hem-plain-bottom',
  'waistcoat/sb-5b', 'waistcoat/sb-horseshoe', 'black-tie/tux-shawl', 'black-tie/tux-peak-db', 'black-tie/tux-peak-sb', 'black-tie/trousers-braid-stripe',
];

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage();
  await page.setContent('<canvas id="c"></canvas>');
  async function convert(src, dest, maxW, q) {
    const b64 = fs.readFileSync(path.join(ROOT, 'public', src)).toString('base64');
    const data = await page.evaluate(async (b64, maxW, q) => {
      const img = new Image();
      img.src = `data:image/webp;base64,${b64}`;
      await img.decode();
      const s = Math.min(1, maxW / img.naturalWidth);
      const c = document.getElementById('c');
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.fillStyle = '#fff';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', q).split(',')[1];
    }, b64, maxW, q);
    fs.writeFileSync(path.join(OUT, dest), Buffer.from(data, 'base64'));
  }
  for (const [src, dest, w, q] of FOTOS) await convert(src, dest, w, q);
  for (const i of ILLU) await convert(`konfigurator/${i}.webp`, `illu/${i.replace('/', '-')}.jpg`, 600, 0.9);
  await browser.close();
  console.log('Bilder vorbereitet:', FOTOS.length + ILLU.length);
})();
