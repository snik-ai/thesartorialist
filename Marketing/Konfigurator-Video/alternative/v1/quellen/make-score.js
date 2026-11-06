// Erzeugt score.json (Musik + Sounddesign) auf dem Bild-Raster von film.html (90 BPM, Takt = 2.667 s).
// node make-score.js && node ~/.claude/skills/motion-reel/engine/audio.mjs score.json out/score.wav
const fs = require('fs');
const B = 60 / 90, b = (n) => n * B;
const T1 = b(5), T2 = b(11), T3 = b(16), T4 = b(21), T5 = b(26), T6 = b(31), TC = b(36), TL = b(42.5), DUR = b(44);
const CLICK = { revers: 4.95, knopf: 8.75, tasche: 12.1, stoff: 19.4, pdf: 22.6, termin: TC };
const r3 = (x) => +x.toFixed(3);

const cues = [];
const c = (t, type, gain, extra = {}) => cues.push({ t: r3(t), type, gain, ...extra });
// Vorhang
c(T1 - 0.35, 'swish', 0.35, { len: 0.5 }); c(T1, 'whoosh', 0.3, { len: 0.7 });
// Klicks (SFX ~0.03 s vor dem Kontakt) + Häkchen
for (const k of [CLICK.revers, CLICK.knopf, CLICK.tasche, CLICK.stoff, CLICK.pdf, CLICK.termin]) c(k - 0.03, 'click', 0.7);
for (const k of [CLICK.revers, CLICK.knopf, CLICK.tasche]) c(k + 0.04, 'pop', 0.28);
// Digital Zoom + Callout
c(5.95, 'whoosh', 0.18, { len: 0.9 }); c(5.97, 'tick', 0.3);
// Whip-Pan
c(T2, 'whoosh', 0.5, { len: 0.36 });
// Snap Zoom auf «zwei Knöpfen»
c(CLICK.knopf + 0.05, 'chime', 0.2, { f: 1318.5 });
// 3D-Flip, gestaffelt
[0, 1, 2].forEach((i) => c(T3 - 0.18 + i * 0.08, 'swish', 0.22, { len: 0.22, pan: (i - 1) * 0.4 }));
// Push nach oben
c(T4, 'whoosh', 0.38, { len: 0.5 });
// Checklist Pop – Glöckchen in Akkordtönen
[[14.5, 1046.5], [15.0, 1318.5], [15.5, 1568], [16.0, 1760]].forEach(([t, f]) => { c(t - 0.02, 'pop', 0.22); c(t, 'chime', 0.14, { f }); });
// Zoom-Through in den Stoff
c(T5, 'riser', 0.32, { len: 1.0 }); c(T5, 'boom', 0.3);
// Tippen der Stoffnummer
'4521 08'.split('').forEach((ch, k) => { if (ch !== ' ') c(18.3 + (k / 7) * 0.75, 'tick', 0.45 + 0.2 * ((k * 37) % 5) / 5, { pan: ((k % 3) - 1) * 0.15 }); });
c(CLICK.stoff + 0.08, 'pop', 0.3);
// Carrier in die Übersicht + Zeilen
c(T6, 'swish', 0.38, { len: 0.35 });
for (let i = 1; i < 8; i++) c(T6 + 0.25 + i * 0.07, 'tick', 0.14, { pan: (i % 2 - 0.5) * 0.5 });
c(CLICK.pdf + 0.35, 'chime', 0.18, { f: 1568 });
// Klick-Flood → Endkarte
c(TC, 'revcym', 0.3, { len: 0.7 }); c(TC + 0.02, 'boom', 0.5);
c(TC + 0.8, 'chime', 0.26, { f: 1046.5 });
// Loop-Rebuild
c(TL, 'swish', 0.2, { len: 0.4 });

// ---- Musik: Felt-Piano, Sub-Bass, weiche Kick, Shaker (ruhig, edel) ----
const Fmaj7 = ['F3', 'A3', 'C4', 'E4'], Em7 = ['E3', 'G3', 'B3', 'D4'], Am7 = ['A3', 'C4', 'E4', 'G4'], Dm7 = ['D3', 'F3', 'A3', 'C4'],
  G6 = ['G3', 'B3', 'D4', 'E4'], Cmaj7 = ['C3', 'E4', 'G4', 'B4'];
const chords = [Fmaj7, Em7, Am7, Dm7, Fmaj7, G6, Am7, Dm7, G6, Cmaj7, Fmaj7];
const MEL = {
  F: [[0, 'E5', 6], [8, 'C5', 4], [12, 'A4', 4]],
  Em: [[0, 'D5', 6], [8, 'B4', 4], [12, 'G4', 4]],
  Am: [[0, 'E5', 6], [8, 'G5', 4], [12, 'E5', 4]],
  Dm: [[0, 'F5', 6], [8, 'A5', 4], [12, 'C5', 4]],
  G: [[0, 'D5', 6], [8, 'B4', 4], [12, 'E5', 4]],
  C: [[0, 'G5', 8], [8, 'E5', 8]],
};
const K = 'x.......x.......', SH = '..x...x...x...x.', BS = 'x.......x.......';
const bars = [
  { pchord: 0.85, mel: MEL.F },                                                                    // Hook
  { pchord: 0.6, mel: MEL.Em, kick: '....x...x.......', bass: '....x...x.......', shaker: '....x.x...x...x.' }, // Vorhang 3.33
  { pchord: 0.45, mel: MEL.Am, kick: K, bass: BS, shaker: SH },
  { pchord: 0.45, mel: MEL.Dm, kick: K, bass: BS, shaker: SH },
  { pchord: 0.45, mel: MEL.F, kick: K, bass: BS, shaker: SH },
  { pchord: 0.45, mel: MEL.G, kick: K, bass: BS, shaker: SH },
  { pchord: 0.5, mel: MEL.Am.map(([s, n, l]) => [s, n, l, 0.8]), bass: 'x...............', shaker: '..x...x...x...x.' }, // Stoff (luftiger)
  { pchord: 0.45, mel: MEL.Dm, kick: K, bass: BS, shaker: SH },
  { pchord: 0.45, mel: MEL.G, kick: K, bass: BS, shaker: SH },
  { pchord: 0.9, mel: MEL.C, bass: 'x...............' },                                            // Endkarte
  { pchord: 0.7, mel: [[0, 'C5', 12]] },                                                            // Ausklang
];
const score = { bpm: 90, dur: r3(DUR), tail: 0.3, master: 0.9, musicGain: 0.75, duck: 0.12, musicEnd: r3(DUR - 0.6), musicFade: 0.6, delay: r3(B * 0.75), chords, bars, cues };
fs.writeFileSync(__dirname + '/score.json', JSON.stringify(score, null, 1));
console.log('cues', cues.length, 'dur', DUR.toFixed(3));
