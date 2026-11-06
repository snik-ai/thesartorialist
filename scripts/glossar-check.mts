// Qualitätsprüfung Glossar: npx tsx scripts/glossar-check.mts
import fs from 'node:fs';
import path from 'node:path';
import { GLOSSAR, woerter } from '../lib/glossar/index.ts';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ERLAUBT = ['/massanzug-zuerich/', '/massanzug-konfigurator/', '/hochzeitsanzug-zuerich/', '/anzuege-zuerich/', '/termin/', '/services/', '/loro-piana/', '/holland-sherry/', '/orazio-luciano/', '/maria-santangelo/', '/gran-sasso/', '/woolrich/', '/anzug-blau/', '/anzug-gruen/', '/anzug-beige/', '/shop/strick/', '/shop/parkas/', '/shop/sakkos-hosen/', '/kontakt/'];
const slugs = new Set(GLOSSAR.map((b) => b.slug));
let fehler = 0;
const f = (b: string, m: string) => { fehler++; console.log(`✗ ${b}: ${m}`); };
if (GLOSSAR.length !== 60) f('GESAMT', `${GLOSSAR.length} statt 60 Begriffe`);
if (slugs.size !== GLOSSAR.length) f('GESAMT', 'doppelte Slugs');
const zahlen: number[] = [];
for (const b of GLOSSAR) {
  const w = woerter(b); zahlen.push(w);
  if (w < 430) f(b.slug, `nur ${w} Wörter`);
  if (b.abschnitte.length < 4) f(b.slug, `${b.abschnitte.length} Abschnitte`);
  if (b.faq.length !== 3) f(b.slug, `${b.faq.length} FAQ`);
  if (b.metaTitle.length > 60) f(b.slug, `metaTitle ${b.metaTitle.length} Zeichen`);
  if (b.metaDescription.length < 120 || b.metaDescription.length > 160) f(b.slug, `metaDescription ${b.metaDescription.length} Zeichen`);
  if (!fs.existsSync(path.join(ROOT, 'public', b.bild))) f(b.slug, `Bild fehlt ${b.bild}`);
  for (const v of b.verwandt) if (!slugs.has(v)) f(b.slug, `verwandt unbekannt: ${v}`);
  for (const l of b.links) if (!ERLAUBT.includes(l.href.split('#')[0])) f(b.slug, `Link nicht erlaubt: ${l.href}`);
  const alles = JSON.stringify(b);
  if (/ß/.test(alles)) f(b.slug, 'enthält ß');
  if (/exkl\.|exklusive Mehrwert|Mittelstand/i.test(alles)) f(b.slug, 'verbotener Begriff');
}
zahlen.sort((a, b) => a - b);
console.log(`${GLOSSAR.length} Begriffe, Wörter ${zahlen[0]}–${zahlen[zahlen.length - 1]} (Median ${zahlen[zahlen.length >> 1]}), ${fehler} Fehler`);
process.exit(fehler ? 1 : 0);
