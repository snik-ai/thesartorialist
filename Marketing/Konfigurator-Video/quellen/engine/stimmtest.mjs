// stimmtest.mjs – dieselben zwei Sätze mit mehreren Stimmen (ElevenLabs TTS), zum Vergleichen
import { anfrage } from './eleven.mjs';
import { execFileSync } from 'node:child_process';
const STIMMEN = { michael: 'hBOVjideqPyMYjloL1lg', paul: 'RqYtbPVBBytc1OIowrh0', daniel: 'onwK4e9ZLuTAKqWW03F9', george: 'JBFqnCBsd6RMkjVDRZzb', brian: 'nPczCjzI2devNBz1zQrb' };
const nur = process.argv.slice(2);
const text = 'Ihr Massanzug. Bis ins letzte Detail entworfen. Ab sechzehnhundertneunzig Franken. Gestalten Sie ihn jetzt auf The Sartorialist Punkt C H.';
for (const [n, id] of Object.entries(STIMMEN)) {
  if (nur.length && !nur.includes(n)) continue;
  const ziel = `ton/stimmtest/${n}.mp3`;
  try {
    await anfrage(`/v1/text-to-speech/${id}?output_format=mp3_44100_192`, { text, model_id: 'eleven_multilingual_v2', language_code: 'de', seed: 7,
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed: 0.95 } }, ziel, `stimmtest ${n}`);
    const d = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ziel]).toString().trim();
    console.log(n, 'ok', d, 's');
  } catch (e) { console.log(n, 'FEHLER', String(e.message).slice(0, 200)); }
}
