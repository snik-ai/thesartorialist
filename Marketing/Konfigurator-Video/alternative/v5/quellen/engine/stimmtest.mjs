// stimmtest.mjs (v5) – derselbe Satz mit mehreren weiblichen deutschen Stimmen (ElevenLabs TTS), zum Vergleichen.
//   node engine/stimmtest.mjs [name …]          nur fehlende erzeugen; --neu überschreibt
// Kandidaten aus der ElevenLabs-Voice-Library (deutsch, weiblich; IDs geprüft über TTS-Aufruf).
import { anfrage } from './eleven.mjs';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const STIMMEN = {
  kerstin: 'Y5JXXvUD3rmjDInkLVA2',   // Kerstin – Seductive, Sensual and Silky
  lyra: 'Ehc9dVwDGENWbpsWNTfK',      // Lyra – Sensual, Warm and Soft
  ramona: 'r0fLdYmTH96Lr4s10B6K',    // Ramona – Sensual and Soft
  lilith: 't7VaN65ClS2VrEUwk1nR',    // Lilith Nightfal – Deep tone, mysterious
  laura: 'Qy4b2JlSGxY7I9M9Bqxb',     // Laura – Calm and Smooth
};
const nur = process.argv.slice(2).filter((a) => !a.startsWith('--')), neu = process.argv.includes('--neu');
const text = 'Ihr Massanzug. Bis ins Detail von Ihnen entworfen. Den Stoff von Holland and Sherry. Ab sechzehnhundertneunzig Franken. Gestalten Sie ihn jetzt auf The Sartorialist Punkt C H.';
for (const [n, id] of Object.entries(STIMMEN)) {
  if (nur.length && !nur.includes(n)) continue;
  const ziel = `ton/stimmtest/${n}.mp3`;
  if (existsSync(ziel) && !neu) { console.log(n, 'vorhanden'); continue; }
  try {
    await anfrage(`/v1/text-to-speech/${id}?output_format=mp3_44100_192`, { text, model_id: 'eleven_multilingual_v2', language_code: 'de', seed: 7,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 0.9 } }, ziel, `stimmtest ${n}`);
    const d = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ziel]).toString().trim();
    console.log(n, 'ok', d, 's');
  } catch (e) { console.log(n, 'FEHLER', String(e.message).slice(0, 200)); }
}
