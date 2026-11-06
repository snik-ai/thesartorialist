// klang.mjs – einzelner Klang/Musikteil über ElevenLabs Sound Effects (/v1/sound-generation)
//   node engine/klang.mjs <ziel.mp3> <sekunden> <einfluss> "<prompt>"
import { anfrage } from './eleven.mjs';
const [ziel, sek, einfl, ...p] = process.argv.slice(2);
const r = await anfrage('/v1/sound-generation?output_format=mp3_44100_192', { text: p.join(' '), duration_seconds: +sek, prompt_influence: +einfl, model_id: 'eleven_text_to_sound_v2' }, ziel, `klang ${ziel}`);
console.log('→', ziel, r.bytes);
