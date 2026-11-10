// Vorschau für die Auswahl: Titel + zwei Innenseiten nebeneinander (aus den PDFKit-Kontrollbildern).
// Voraussetzung: swift kontrolle.swift ../The-Sartorialist-Ratgeber-Anzug-A4.pdf out/kontrolle
// Aufruf (im Ordner quellen/): node vorschau.cjs
const path = require('path');
const sharp = require('/Users/strachi/_Claude/dlmdigital/node_modules/sharp');

const SEITEN = ['seite-01.png', 'seite-06.png', 'seite-10.png'];
const ZIEL = path.join(__dirname, '..', 'The-Sartorialist-Ratgeber-Anzug-Vorschau.png');
const RAND = 64, ABSTAND = 40, H = 1100;

(async () => {
  const bilder = await Promise.all(SEITEN.map((s) => sharp(path.join(__dirname, 'out/kontrolle', s)).resize({ height: H }).png().toBuffer({ resolveWithObject: true })));
  const breite = bilder.reduce((a, b) => a + b.info.width, 0) + ABSTAND * (bilder.length - 1) + RAND * 2;
  let x = RAND;
  const comps = [];
  for (const b of bilder) {
    // feine Linie statt Schatten
    comps.push({ input: { create: { width: b.info.width + 2, height: H + 2, channels: 3, background: '#cfc8bb' } }, left: x - 1, top: RAND - 1 });
    comps.push({ input: b.data, left: x, top: RAND });
    x += b.info.width + ABSTAND;
  }
  await sharp({ create: { width: breite, height: H + RAND * 2, channels: 3, background: '#ebe6dd' } }).composite(comps).png().toFile(ZIEL);
  console.log('Vorschau:', ZIEL, breite + '×' + (H + RAND * 2));
})();
