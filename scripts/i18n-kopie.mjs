// Legt die Wörterbuch-Dateien einer noch nicht übersetzten Sprache als Kopie der
// englischen Fassung an (gleiche Struktur, typkompatibel, mit «// TODO übersetzen»).
//
//   node scripts/i18n-kopie.mjs fr it es pt-pt ru sr sq   → nur fehlende Dateien anlegen
//   node scripts/i18n-kopie.mjs fr --force               → vorhandene Dateien überschreiben (Vorsicht!)
//
// Übersetzt wird danach direkt in lib/i18n/<sprache>/*.ts; freigeschaltet über
// lib/i18n/aktive-sprachen.json (siehe docs/decisions/2026-11-06-mehrsprachigkeit.md).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'i18n');
const NAMEN = { fr: 'Französisch', it: 'Italienisch', es: 'Spanisch', 'pt-pt': 'Portugiesisch (Portugal)', ru: 'Russisch', sr: 'Serbisch (Kyrillisch)', sq: 'Albanisch' };
const args = process.argv.slice(2);
const force = args.includes('--force');
const sprachen = args.filter((a) => !a.startsWith('--'));

const bezeichner = (l) => l.replace(/-(\w)/g, (_, c) => c.toUpperCase()); // pt-pt → ptPt

for (const l of sprachen) {
  if (!NAMEN[l]) {
    console.error(`Unbekannte Sprache: ${l}`);
    process.exit(1);
  }
  const ziel = join(ROOT, l);
  mkdirSync(ziel, { recursive: true });
  for (const datei of readdirSync(join(ROOT, 'en')).filter((f) => f.endsWith('.ts'))) {
    const pfad = join(ziel, datei);
    if (existsSync(pfad) && !force) continue;
    let text = readFileSync(join(ROOT, 'en', datei), 'utf8');
    if (datei === 'index.ts') {
      text = text
        .replace(/^\/\/ English dictionary.*$/m, `// Wörterbuch ${NAMEN[l]} — Struktur und Typ aus lib/i18n/de.`)
        .replace('export const en: Woerterbuch', `export const ${bezeichner(l)}: Woerterbuch`);
    } else {
      text = `// TODO übersetzen (${NAMEN[l]}) — noch Kopie der englischen Fassung.\n${text}`;
    }
    writeFileSync(pfad, text);
  }
  console.log(`${l}: ok`);
}
