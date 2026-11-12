// stt-detail.mjs – Scribe-Transkript mit Audio-Ereignissen (Atmen, Seufzen …) und Sprechtempo; Schlüssel wird nie ausgegeben
import { readFileSync } from 'node:fs';
const key = readFileSync(process.env.ELEVENLABS_KEY_FILE, 'utf8').match(/^ELEVENLABS_API_KEY=\"?([^\"\n]+)/m)[1].trim();
for (const f of process.argv.slice(2)) {
  const fd = new FormData(); fd.append('model_id', 'scribe_v1'); fd.append('language_code', 'deu'); fd.append('tag_audio_events', 'true');
  fd.append('file', new Blob([readFileSync(f)]), f.split('/').pop());
  const j = await (await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: fd })).json();
  const ws = (j.words ?? []).filter((w) => w.type === 'word'), ev = (j.words ?? []).filter((w) => w.type === 'audio_event');
  const dur = ws.reduce((a, w) => a + (w.end - w.start), 0);
  console.log(f.split('/').pop().padEnd(14), `Wörter ${ws.length}, reine Sprechzeit ${dur.toFixed(1)} s, ${(ws.length / dur).toFixed(2)} W/s`, ev.length ? 'Ereignisse: ' + ev.map((e) => e.text + '@' + e.start.toFixed(1)).join(' ') : 'keine Ereignisse');
  console.log('   ', j.text);
}
