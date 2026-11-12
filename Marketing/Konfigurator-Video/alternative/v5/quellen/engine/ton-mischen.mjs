// ton-mischen.mjs – mischt Filmmusik + Effekt-Bibliothek exakt auf die Aktionen des Films (window.CUES).
//   node ../../_vorlage/engine/ton-mischen.mjs --page film.html --musik ton/musik.mp3 --out out/ton.wav [--musikPegel -4] [--versatz 0.4]
// Ablauf: Cues (Filmzeit, aus dem Film) → Effekt-Datei (Typ → Name, Varianten abwechselnd) → Lage über den Anker
// (start/spitze/ende, ton/effekte-anker.json) → Pegel, Panorama (fest oder als Fahrt panVon→panBis) → Effekt-Spur.
// Musik: Hochpass, leichte Mitten-Absenkung, Ducking per Sidechain (Effekte drücken die Musik), Ausblenden am Ende.
// Summe: sanfter Kompressor, Limiter, Lautheit −14 LUFS (zweistufig gemessen), True Peak −1.5 dB.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
// v5: Effekt-Bibliothek gemeinsam mit v3/v4 (nur gelesen) in Marketing/Konfigurator-Video/quellen/ton
const HIER = dirname(new URL(import.meta.url).pathname), TON = resolve(HIER, '../../../../quellen/ton');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAGE = arg('page', 'film.html'), OUT = resolve(arg('out', 'out/ton.wav')), MUSIK = arg('musik', '');
mkdirSync(dirname(OUT), { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage(); await p.goto('file://' + resolve(PAGE) + `?render`);   // --format 9x16: Cues des Hochformats (z. B. Cold Open)
const { CUES, DUR } = await p.evaluate(async () => { await window.ready; return { CUES: window.CUES, DUR: window.DUR }; });
await b.close();

// Typ im Film → Effekt in der Bibliothek, Grundpegel (dB)
const KARTE = {
  click: ['klick', 0], tick: ['tick', -4], pop: ['pop', -3], type: ['tippen', -6], whoosh: ['whoosh', -3], swish: ['swish', -5],
  riser: ['riser', -6], revcym: ['revcym', -6], impact: ['impact', -2], boom: ['impact', -2], thump: ['thump', -2], hit: ['thump', 0],
  flut: ['flut', -1], reel: ['slot', -5], slot: ['slot', -5], chime: ['chime', -6], push: ['push', -2], funken: ['funken', -8],
  falten: ['falten', -2], papier: ['papier', -4], logo: ['logo', 0],
};
const KAT = JSON.parse(readFileSync(`${TON}/effekte.json`, 'utf8')), ANKER = JSON.parse(readFileSync(`${TON}/effekte-anker.json`, 'utf8'));
const SR = 48000, N = Math.ceil((DUR + 0.5) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const cache = {};
const lade = (name) => cache[name] ??= (() => {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', `${TON}/effekte/${name}.mp3`, '-ac', '2', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
})();
const zaehler = {};
let fehlt = new Set();
for (const c of CUES) {
  const [name, db] = KARTE[c.type] ?? [c.type, -4];
  if (!KAT[name]) { fehlt.add(c.type); continue; }
  const n = KAT[name].varianten ?? 1, v = (zaehler[name] = (zaehler[name] ?? 0) + 1) % n, datei = v ? `${name}-${v + 1}` : name;
  const buf = lade(datei), anker = KAT[name].anker ?? 'start', info = ANKER[datei] ?? { spitze: 0, dauer: buf.length / 2 / SR };
  const start = c.t - (anker === 'spitze' ? info.spitze : anker === 'ende' ? info.dauer : 0);
  const gain = Math.pow(10, db / 20) * (c.gain ?? 1) * (c.type === 'hit' ? 1.3 : 1);
  const s0 = Math.round(start * SR), len = buf.length / 2;
  for (let i = 0; i < len; i++) {
    const n2 = s0 + i; if (n2 < 0 || n2 >= N) continue;
    const q = i / len, pan = c.panVon != null ? c.panVon + (c.panBis - c.panVon) * q : (c.pan ?? 0);
    const gl = Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2, gr = Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
    const fade = Math.min(1, (len - i) / (0.02 * SR));             // keine harten Enden
    L[n2] += buf[i * 2] * gain * gl * fade; R[n2] += buf[i * 2 + 1] * gain * gr * fade;
  }
}
if (fehlt.size) console.log('  Hinweis: kein Effekt für', [...fehlt].join(', '));
const tmp = OUT.replace(/\.wav$/, '');
const pcm = Buffer.alloc(N * 8); for (let i = 0; i < N; i++) { pcm.writeFloatLE(L[i], i * 8); pcm.writeFloatLE(R[i], i * 8 + 4); }
writeFileSync(`${tmp}-sfx.f32`, pcm);
const mp = +arg('musikPegel', -4), ende = DUR - 0.2;
// --versatz s: Musik um s Sekunden früher (positiv, schneidet den Anfang) bzw. später (negativ) – z. B. um den Drop auf eine Naht zu legen
const vs = +arg('versatz', 0), versatz = vs > 0 ? `atrim=start=${vs},asetpts=PTS-STARTPTS,` : vs < 0 ? `adelay=${Math.round(-vs * 1000)}:all=1,` : '';
const sfxIn = ['-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', `${tmp}-sfx.f32`];
const filter = MUSIK
  ? `[1:a]${versatz}aresample=${SR},highpass=f=35,equalizer=f=320:t=q:w=1.2:g=-2.5,equalizer=f=3500:t=q:w=1.5:g=-1.5,volume=${mp}dB,afade=t=out:st=${(ende - 2.2).toFixed(2)}:d=2.2,apad,atrim=0:${(DUR + 0.5).toFixed(2)}[mu];` +
    `[0:a]highpass=f=40,asplit=2[fx][sc];[mu][sc]sidechaincompress=threshold=0.04:ratio=3.5:attack=8:release=280:makeup=1[md];` +
    `[md][fx]amix=inputs=2:normalize=0,acompressor=threshold=0.25:ratio=2:attack=15:release=200:makeup=1.2,alimiter=limit=0.9[mix]`
  : `[0:a]highpass=f=40,acompressor=threshold=0.25:ratio=2:attack=15:release=200,alimiter=limit=0.9[mix]`;
const ins = [...sfxIn, ...(MUSIK ? ['-i', resolve(MUSIK)] : [])];
execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', filter, '-map', '[mix]', '-ar', String(SR), '-c:a', 'pcm_f32le', `${tmp}-roh.wav`]);
// Lautheit zweistufig: messen, dann linear auf −14 LUFS / −1.5 dBTP
let m; try { const err = execFileSync('sh', ['-c', `ffmpeg -v info -i "${tmp}-roh.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1`], { encoding: 'utf8' }); const js = err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1); m = JSON.parse(js); } catch { m = null; }
const ln = m ? `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true` : 'loudnorm=I=-14:TP=-1.5:LRA=11';
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${tmp}-roh.wav`, '-af', `${ln},aresample=48000`, '-t', DUR.toFixed(3), '-c:a', 'pcm_s16le', OUT]);
execFileSync('rm', ['-f', `${tmp}-sfx.f32`, `${tmp}-roh.wav`]);
console.log(`  → ${OUT}  (${DUR.toFixed(2)} s, ${CUES.length} Cues${m ? `, vorher ${m.input_i} LUFS` : ''})`);
