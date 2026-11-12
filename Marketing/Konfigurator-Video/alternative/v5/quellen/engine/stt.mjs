// stt.mjs – Kontroll-Transkript (ElevenLabs Speech-to-Text) einer Audiodatei
import { readFileSync } from 'node:fs';
const key = readFileSync(process.env.ELEVENLABS_KEY_FILE, 'utf8').match(/^ELEVENLABS_API_KEY=\"?([^\"\n]+)/m)[1].trim();
for (const f of process.argv.slice(2)) {
  const fd = new FormData(); fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'deu');
  fd.append('file', new Blob([readFileSync(f)]), f.split('/').pop());
  const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: fd });
  const j = await r.json(); console.log(f.split('/').pop(), '→', j.text ?? JSON.stringify(j).slice(0, 200));
}
