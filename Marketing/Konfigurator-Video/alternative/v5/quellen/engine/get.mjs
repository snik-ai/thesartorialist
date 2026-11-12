// get.mjs – GET-Abfrage an ElevenLabs (Schlüssel aus ELEVENLABS_KEY_FILE, wird nie ausgegeben)
import { readFileSync } from 'node:fs';
const key = readFileSync(process.env.ELEVENLABS_KEY_FILE, 'utf8').match(/^ELEVENLABS_API_KEY=\"?([^\"\n]+)/m)[1].trim();
const r = await fetch('https://api.elevenlabs.io' + process.argv[2], { headers: { 'xi-api-key': key } });
process.stdout.write(await r.text());
