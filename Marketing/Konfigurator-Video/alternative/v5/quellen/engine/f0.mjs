// f0.mjs – mittlere Grundfrequenz (Stimmlage) und Variation einer Sprachaufnahme
import { execFileSync } from 'node:child_process';
for (const f of process.argv.slice(2)) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4), N = 640, hop = 320, f0s = [];
  for (let s = 0; s + N < x.length; s += hop) {
    let e = 0; for (let i = 0; i < N; i++) e += x[s + i] * x[s + i]; if (e / N < 2e-4) continue;
    let best = 0, lag = 0;
    for (let L = 40; L <= 220; L++) { let c = 0, n1 = 0, n2 = 0; for (let i = 0; i < N - L; i++) { c += x[s + i] * x[s + i + L]; n1 += x[s + i] ** 2; n2 += x[s + i + L] ** 2; } c /= Math.sqrt(n1 * n2) + 1e-9; if (c > best) { best = c; lag = L; } }
    if (best > 0.75) f0s.push(16000 / lag);
  }
  f0s.sort((a, b) => a - b); const med = f0s[f0s.length >> 1], p10 = f0s[Math.floor(f0s.length * .1)], p90 = f0s[Math.floor(f0s.length * .9)];
  console.log(f.split('/').pop().padEnd(12), 'F0 Median', med.toFixed(0), 'Hz  (P10–P90', p10.toFixed(0), '–', p90.toFixed(0), ')');
}
