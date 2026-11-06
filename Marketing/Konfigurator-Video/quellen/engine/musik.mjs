// musik.mjs – cineastischer Score über die ElevenLabs Music-API (composition_plan, Abschnitte auf die Filmzeit).
//   ELEVENLABS_KEY_FILE=~/_Claude/voxcrm/.env node engine/musik.mjs [--modell music_v2] [--out ton/musik.mp3] [--plan]
import { writeFileSync } from 'node:fs';
import { anfrage } from './eleven.mjs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', 'ton/musik.mp3'), modell = arg('modell', 'music_v2');
// Abschnitte (ms) passend zu film.html: Hook 0–4.9 · Konfigurator 4.9–15.9 · Stoff/Übersicht 15.9–24.9 · Finale 24.9–33.4 · Ausklang
const S = [
  ['intro', 4900, ['sparse elegant intro', 'soft low string pulse', 'single plucked harp note', 'anticipation, luxurious', 'no drums']],
  ['atelier', 11000, ['tight staccato string pizzicato ostinato enters', 'deep warm cello pulse', 'precise soft percussion, rim and shaker', 'confident, refined, forward motion']],
  ['stoff', 9000, ['fuller strings, warm legato violins over the pizzicato', 'subtle piano accents', 'elegant lift', 'polished and sophisticated']],
  ['finale', 10300, ['grand but tasteful resolution, warm sustained strings and low brass swell', 'percussion drops out', 'final chord rings out and decays naturally, clean ending']],
];
const GLOBAL = ['cinematic luxury brand film score', 'instrumental', '96 bpm', 'modern elegant orchestral', 'string pizzicato and deep pulses', 'Savile Row tailoring, Italian craftsmanship', 'pristine high-end mix'];
const NEG = ['vocals', 'lyrics', 'choir', 'epic trailer drums', 'electric guitar', 'EDM', 'dubstep', 'lo-fi', 'cheesy', 'aggressive', 'synth bass drops'];
const body = modell === 'music_v1'
  ? { model_id: 'music_v1', respect_sections_durations: true, composition_plan: { positive_global_styles: GLOBAL, negative_global_styles: NEG,
      sections: S.map(([n, ms, st]) => ({ section_name: n, positive_local_styles: st, negative_local_styles: [], duration_ms: ms, lines: [] })) } }
  : { model_id: modell, composition_plan: { chunks: S.map(([n, ms, st]) => ({ text: `[${n}] {instrumental, no vocals}`, duration_ms: ms,
      positive_styles: [...GLOBAL.slice(0, 5), ...st.slice(0, 3)], negative_styles: NEG, context_adherence: 'high' })) } };
if (process.argv.includes('--plan')) { console.log(JSON.stringify(body, null, 1)); process.exit(0); }
const r = await anfrage('/v1/music?output_format=mp3_44100_192', body, OUT, 'musik konfigurator v2');
writeFileSync(OUT + '.plan.json', JSON.stringify(body, null, 1));
console.log('→', OUT, r.bytes, r.kosten);
