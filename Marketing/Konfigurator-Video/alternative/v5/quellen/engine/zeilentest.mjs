// zeilentest.mjs – eine Zeile in Schreibvarianten mit der v5-Stimme testen (Aussprache), danach mit stt.mjs prüfen
//   node engine/zeilentest.mjs <name> "<text>" …   → ton/stimmtest/zeile-<name>.mp3
import { readFileSync } from 'node:fs';
import { anfrage } from './eleven.mjs';
const plan = JSON.parse(readFileSync('ton/sprecher.json', 'utf8')), a = process.argv.slice(2);
for (let i = 0; i < a.length; i += 2) await anfrage(`/v1/text-to-speech/${plan.stimme.id}?output_format=mp3_44100_192`,
  { text: a[i + 1], model_id: plan.modell, language_code: 'de', seed: 7, voice_settings: plan.einstellungen }, `ton/stimmtest/zeile-${a[i]}.mp3`, `zeilentest ${a[i]}`);
