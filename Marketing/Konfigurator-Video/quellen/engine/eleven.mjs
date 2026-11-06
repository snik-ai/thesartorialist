// eleven.mjs – gemeinsamer Zugang zur ElevenLabs-API (Musik + Soundeffekte) für die Ton-Pipeline.
// Schlüssel: ELEVENLABS_API_KEY aus der Umgebung, sonst aus der Datei in ELEVENLABS_KEY_FILE, sonst aus <repo>/.env.
// Der Schlüssel wird nie ausgegeben. Jede Anfrage wird mit Kosten-Headern (falls vorhanden) in ton/kosten.log protokolliert.
// Doku (geprüft 20.10.2026): POST /v1/sound-generation {text, duration_seconds 0.5–30, prompt_influence 0–1, model_id}
//                           POST /v1/music {prompt | composition_plan, music_length_ms 3000–600000, model_id, force_instrumental}
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const HIER = dirname(new URL(import.meta.url).pathname);
export const ROOT = resolve(HIER, '../../../..');
export const TON = resolve(HIER, '../ton');

function schluessel() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const datei = process.env.ELEVENLABS_KEY_FILE ?? `${ROOT}/.env`;
  const m = readFileSync(datei, 'utf8').match(/^ELEVEN\w*API\w*=\"?([^\"\n]+)/m);
  if (!m) throw new Error(`Kein ElevenLabs-Schlüssel in ${datei}`);
  return m[1].trim();
}

export async function anfrage(pfad, body, ziel, notiz = '', versuche = 3) {
  const t0 = Date.now();
  let r;
  try {
    r = await fetch(`https://api.elevenlabs.io${pfad}`, { method: 'POST', headers: { 'xi-api-key': schluessel(), 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(pfad.includes('music') ? 300000 : 60000) });
  } catch (e) {
    if (versuche > 1) { console.log(`  (Zeitüberschreitung, neuer Versuch)`); return anfrage(pfad, body, ziel, notiz, versuche - 1); }
    throw e;
  }
  const kosten = [...r.headers].filter(([h]) => /cost|credit|character|request-id|song-id/i.test(h)).map(([h, v]) => `${h}=${v}`).join(' ');
  if (!r.ok) {
    const txt = (await r.text()).slice(0, 400);
    appendFileSync(`${TON}/kosten.log`, `${new Date().toISOString()}  FEHLER ${r.status} ${pfad} ${notiz} ${txt}\n`);
    throw new Error(`ElevenLabs ${r.status}: ${txt}`);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(ziel, buf);
  appendFileSync(`${TON}/kosten.log`, `${new Date().toISOString()}  ${pfad} ${notiz} ${(buf.length / 1024).toFixed(0)} KB ${((Date.now() - t0) / 1000).toFixed(1)} s ${kosten}\n`);
  return { kosten, bytes: buf.length };
}
