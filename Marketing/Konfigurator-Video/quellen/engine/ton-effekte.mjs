// ton-effekte.mjs – erzeugt die Soundeffekt-Bibliothek _vorlage/ton/effekte/<name>[-n].mp3 mit ElevenLabs (nur fehlende).
//   node ton-effekte.mjs            alle fehlenden      node ton-effekte.mjs pop whoosh   nur diese (fehlende)
//   --neu                            vorhandene überschreiben (kostet erneut)
// Danach misst es den Kontaktpunkt jedes Klangs (lauteste Stelle) und schreibt ton/effekte-anker.json.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { anfrage, TON } from './eleven.mjs';
const KAT = JSON.parse(readFileSync(`${TON}/effekte.json`, 'utf8'));
const nur = process.argv.slice(2).filter((a) => !a.startsWith('--')), neu = process.argv.includes('--neu');
const dateien = [];
for (const [name, e] of Object.entries(KAT)) {
  if (name.startsWith('_') || (nur.length && !nur.includes(name))) continue;
  for (let v = 1; v <= (e.varianten ?? 1); v++) {
    const datei = `${TON}/effekte/${name}${v > 1 ? '-' + v : ''}.mp3`;
    dateien.push([name, datei]);
    if (existsSync(datei) && !neu) continue;
    process.stdout.write(`  ${name} ${v} … `);
    await anfrage('/v1/sound-generation?output_format=mp3_44100_128', { text: e.text, duration_seconds: e.dauer, prompt_influence: e.einfluss ?? 0.5, model_id: 'eleven_text_to_sound_v2' }, datei, `effekt ${name}-${v} ${e.dauer}s`);
    console.log('ok');
  }
}
// Kontaktpunkt messen (Spitze der Hüllkurve) – für 'spitze'-Anker
const anker = existsSync(`${TON}/effekte-anker.json`) ? JSON.parse(readFileSync(`${TON}/effekte-anker.json`, 'utf8')) : {};
for (const [name, datei] of dateien) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', datei, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
  const f = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  let max = 0, imax = 0; for (let i = 0; i < f.length; i++) { const a = Math.abs(f[i]); if (a > max) { max = a; imax = i; } }
  const k = datei.split('/').pop().replace('.mp3', '');
  anker[k] = { spitze: +(imax / 8000).toFixed(3), dauer: +(f.length / 8000).toFixed(3), pegel: +max.toFixed(3) };
}
writeFileSync(`${TON}/effekte-anker.json`, JSON.stringify(anker, null, 1));
console.log(`  → ${Object.keys(anker).length} Effekte, Anker in ton/effekte-anker.json`);
