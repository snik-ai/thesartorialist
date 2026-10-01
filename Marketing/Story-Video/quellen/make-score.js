// Erzeugt score.json (Musik + Effekte) aus der Szenen-Timeline über die Speed-Ramps (TW).
require('./timewarp.js');
const fs = require('fs');
const ZONES = [[0.78, 1.42, 2.0], [2.5, 3.55, 1.5], [4.5, 4.95, 0.5], [7.5, 8.6, 2.0], [9.5, 10.6, 1.5], [11.6, 12.6, 2.0], [13.35, 13.95, 2.0], [16.6, 17.8, 1.0]];
const T = TW.make(ZONES, 18.5), m = (t) => +T.oldToNew(t).toFixed(3);
const DUR = Math.round(T.total * 10) / 10;

// ---- Effekte in Szenenzeit, ~0.03 s vor dem Kontakt ----
const c = [];
c.push({ t: 0.0, type: 'thump', gain: 0.55 }, { t: 0.22, type: 'thump', gain: 0.5 }, { t: 0.47, type: 'hit', gain: 0.55, notes: ['D3', 'A3', 'C4', 'F4'] });
c.push({ t: 1.47, type: 'whoosh', len: 0.5, gain: 0.45 });                          // Kontraktion → Massband
for (const [t0, n] of [[1.72, 16], [2.47, 10], [3.17, 14]]) c.push({ t: t0, type: 'reel', n, len: 0.55, gain: 0.45 });
c.push({ t: 3.98, type: 'swish', len: 0.3, gain: 0.5 });                           // 3D-Flip
c.push({ t: 4.12, type: 'reel', n: 20, len: 0.7, gain: 0.4 });                     // 1'000 rollt
c.push({ t: 4.2, type: 'pop', gain: 0.3 });
for (const tt of [5.0, 6.0]) c.push({ t: tt, type: 'whoosh', len: 0.32, gain: 0.4, pan: -0.2 }, { t: tt + 0.14, type: 'pop', gain: 0.25 });
c.push({ t: 7.0, type: 'riser', len: 0.9, gain: 0.45 }, { t: 7.0, type: 'thump', gain: 0.5 });   // Zoom-Through
for (let k = 0; k < 22; k++) c.push({ t: 7.47 + k * (1.2 / 22), type: 'tick', gain: 0.35 + 0.15 * ((k * 37) % 5) / 5, pan: -0.4 + 0.8 * k / 21 }); // Steppnaht
c.push({ t: 8.95, type: 'whoosh', len: 0.5, gain: 0.5 });                          // Filmstreifen-Push
c.push({ t: 10.97, type: 'whoosh', len: 0.45, gain: 0.45 });                       // Kontraktion → Pille
c.push({ t: 11.2, type: 'reel', n: 18, len: 0.8, gain: 0.45 }, { t: 11.15, type: 'reel', n: 12, len: 0.6, gain: 0.3 });
c.push({ t: 12.98, type: 'swish', len: 0.25, gain: 0.4 }, { t: 13.18, type: 'pop', gain: 0.45 });
c.push({ t: 14.17, type: 'click', gain: 1.0 });                                    // Tap
c.push({ t: 14.95, type: 'swish', len: 0.35, gain: 0.45 });                        // Iris
c.push({ t: 15.6, type: 'chime', gain: 0.6, f: 1174.7 });                          // Logo steigt auf
c.push({ t: 16.13, type: 'pop', gain: 0.3 }, { t: 16.58, type: 'pop', gain: 0.25 });
const cues = c.map((x) => ({ ...x, t: m(x.t) }));
// Effekte in Ausgabezeit
cues.push({ t: m(14.25), type: 'boom', gain: 0.6 }, { t: m(14.25), type: 'impact', gain: 0.45 });
cues.push({ t: m(9.0), type: 'boom', gain: 0.45 });
cues.push({ t: m(15.6), type: 'revcym', len: 0.7, gain: 0.4 });

// ---- Musik: Felt-Piano, Sub-Bass, weiche Kick, Shaker. 120 BPM, Takt = 2 s ----
const Dm = ['D3', 'F3', 'A3', 'C4'], Bb = ['Bb2', 'D3', 'F3', 'A3'], F = ['F2', 'A3', 'C4', 'E4'], C = ['C3', 'E3', 'G3', 'D4'], Gm = ['G2', 'Bb3', 'D4', 'F4'];
const PROG = [Dm, Bb, F, C];
const MEL = {
  D: [[0, 'A4', 4], [6, 'F4', 2], [8, 'G4', 2], [10, 'A4', 6]],
  B: [[0, 'D5', 4], [6, 'C5', 2], [8, 'A4', 2], [10, 'F4', 6]],
  F: [[0, 'C5', 4], [6, 'A4', 2], [8, 'G4', 2], [10, 'F4', 6]],
  C: [[0, 'G4', 4], [6, 'E4', 2], [8, 'D4', 2], [10, 'E4', 6]],
};
const MK = ['D', 'B', 'F', 'C'];
const K4 = 'x...x...x...x...', SH = 'x.x.X.x.x.x.X.x.', CL = '............x...', BS = 'x.....x.x.....x.';
const nb = Math.ceil(DUR / 2);
const sec = { drop: m(1.45), breakA: m(7.0), back: m(9.0), flood: m(14.25), logo: m(15.6) };
const chords = [], bars = [];
for (let b = 0; b < nb; b++) {
  const t0 = b * 2, ch = PROG[b % 4], mel = MEL[MK[b % 4]];
  chords.push(ch);
  if (t0 < sec.drop - 0.5) bars.push({ pchord: 0.85, mel: mel.slice(0, 2) });
  else if (t0 < sec.drop + 1.5) bars.push({ pchord: 0.6, mel: mel.slice(2), kick: '........x...x...', bass: '........x.....x.', shaker: '........x.x.X.x.' });
  else if (t0 >= sec.breakA - 0.5 && t0 < sec.back - 0.5) bars.push({ pchord: 0.75, mel: mel.map(([s, n, l]) => [s, n, l, 0.8]), bass: 'x.......x.......', shaker: 'x...x...x...x...' });
  else if (t0 < sec.flood - 2) bars.push({ pchord: 0.5, mel, kick: K4, bass: BS, shaker: SH, clap: t0 >= sec.back - 0.5 ? CL : undefined });
  else if (t0 < sec.flood) bars.push({ pchord: 0.55, mel, kick: 'x...x...x.......', bass: 'x.....x.x.......', shaker: SH, clap: '....x...........' });
  else if (t0 < sec.logo + 0.5) bars.push({ pchord: 0.4, mel: [] });
  else bars.push({ pchord: 0.9, pchordAt: 0, mel: [[0, 'A4', 6], [8, 'F4', 8]] });
}
// Schluss-Akkord: Dm über die Endkarte ausklingen lassen
const base = { bpm: 120, dur: DUR, tail: 0.6, master: 0.9, musicGain: 0.75, duck: 0.18, musicEnd: DUR - 0.8, musicFade: 1.6, chords };
fs.writeFileSync('score.json', JSON.stringify({ ...base, bars, cues }, null, 1));
console.log('cues', cues.length, 'bars', nb, 'dur', DUR, sec);
