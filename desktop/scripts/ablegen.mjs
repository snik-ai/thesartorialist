// Nach `tauri build`: fertiges DMG nach desktop/release/ kopieren (gitignored), mit festem Namen.
//   node scripts/ablegen.mjs              aktuelle Architektur
//   node scripts/ablegen.mjs --universal  Intel + Apple Silicon
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const universal = process.argv.includes('--universal');
const bundle = join(hier, '../src-tauri/target', ...(universal ? ['universal-apple-darwin'] : []), 'release/bundle');
const dmgOrdner = join(bundle, 'dmg');
if (!existsSync(dmgOrdner)) throw new Error(`Kein DMG-Ordner: ${dmgOrdner}`);
const dmg = readdirSync(dmgOrdner)
  .filter((f) => f.endsWith('.dmg'))
  .map((f) => join(dmgOrdner, f))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
if (!dmg) throw new Error('Kein DMG gefunden');
const ziel = join(hier, '../release');
mkdirSync(ziel, { recursive: true });
const name = `TheSartorialist-Mac-App${universal ? '-universal' : '-apple-silicon'}.dmg`;
copyFileSync(dmg, join(ziel, name));
console.log(`DMG abgelegt: ${join(ziel, name)} (${(statSync(dmg).size / 1e6).toFixed(1)} MB)`);
