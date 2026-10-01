// motion.js — deterministische Motion-Bibliothek für seek(t)-Filme.
// Alles ist eine reine Funktion der Zeit: kein Zustand zwischen Frames,
// kein Math.random, keine Timer. Als <script src> einbinden → window.M.
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const mix = lerp;
  const seg = (t, a, b) => clamp((t - a) / (b - a));

  // Geschlossene gedämpfte Feder 0 → 1 (keine Simulation, frame-exakt).
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }
  // Presets (Kurven siehe reference/diagrams): UI knackig, Standard, schwer, verspielt
  const SPR = {
    snappy: [320, 30],   // Buttons, Toggles, Vorderkanten
    ui: [260, 28],       // Chips, kleine Elemente, minimaler Overshoot
    default: [170, 26],  // Karten, Container, Kamera
    heavy: [90, 20],     // grosse Typo, Logo-Lockups (kein Overshoot)
    playful: [220, 14],  // Sticker, Maskottchen (sichtbarer Overshoot)
  };
  const sp = (t, name = 'default') => spring(t, ...SPR[name]);

  // Wert mit mehreren Zielen: Summe je einer Feder pro Wechsel → stetig, seekbar.
  // keys: [[zeit, wert], ...] sortiert. Werte dürfen Zahlen sein.
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    // optional pro Schlüssel eigene Feder: [zeit, wert, k, d]
    for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], keys[i][2] || k, keys[i][3] || d);
    return v;
  }
  // track für Objekte {x,y,w,h,r,...}: jede Eigenschaft eigene Summe
  function trackObj(t, keys, k = 170, d = 26) {
    const out = {};
    for (const p of Object.keys(keys[0][1])) out[p] = track(t, keys.map(([tt, o, kk, dd]) => [tt, o[p], kk, dd]), k, d);
    return out;
  }
  // Streckender Indikator: Vorder- und Hinterkante auf verschiedenen Federn
  function stretch(t, stops, kLead = 320, kTrail = 140) {
    const lead = track(t, stops, kLead, 30), trail = track(t, stops, kTrail, 22);
    return { a: Math.min(lead, trail), b: Math.max(lead, trail) };
  }
  // Text in einem morphenden Container: rein nach Morph-Start, raus vor dem nächsten
  const swapAlpha = (t, tIn, tOut, fin = .12, fout = .1) => Math.min(clamp((t - tIn - .08) / fin), clamp((tOut - .1 - t) / fout));

  // Farben
  const hex = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mixColor = (a, b, p) => [0, 1, 2].map((i) => lerp(a[i], b[i], p));
  function trackColor(t, keys, k = 170, d = 26) {
    return [0, 1, 2].map((i) => track(t, keys.map(([tt, c]) => [tt, c[i]]), k, d));
  }

  // Seeded Rauschen (mulberry32) — niemals Math.random
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  // glatter 1D-Noise für Kamera-Drift / Handheld
  function noise1(x, seed = 1) {
    const r = (i) => { const f = rng(seed * 7919 + i * 104729); return f() * 2 - 1; };
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return lerp(r(i), r(i + 1), u);
  }

  // Klassische Easings für Fälle ohne Feder (Masken, Striche)
  const E = {
    outCubic: (p) => 1 - Math.pow(1 - p, 3),
    outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    inOutCubic: (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    inOutExpo: (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < .5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2),
    inCubic: (p) => p * p * p,
  };

  // Beat-Raster: bpm → Zeit von Takt/Schlag
  const grid = (bpm, offset = 0) => ({ beat: (n) => offset + n * 60 / bpm, bar: (n, beatsPerBar = 4) => offset + n * beatsPerBar * 60 / bpm, spb: 60 / bpm });

  // Canvas-Helfer
  function rrect(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  // Masken-Reveal einer Textzeile: p 0→1 schiebt von unten in die Maske, q 0→1 nach oben raus
  function maskLine(g, text, x, y, size, p, q = 0, opts = {}) {
    const { align = 'left', color = '#141414', font = `800 ${size}px "Inter Tight"`, tracking = 0, blur = 0 } = opts;
    g.save();
    g.font = font; g.textAlign = align; g.textBaseline = 'alphabetic';
    const w = g.measureText(text).width + Math.abs(tracking) * text.length;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    g.beginPath(); g.rect(x0 - size, y - size * 1.02, w + size * 2, size * 1.32); g.clip();
    const dy = (1 - p) * size * 1.15 - q * size * 1.15;
    if (blur) g.filter = `blur(${blur}px)`;
    g.fillStyle = color;
    if ('letterSpacing' in g) g.letterSpacing = tracking + 'px';
    g.fillText(text, x, y + dy);
    g.restore();
    return w;
  }
  // Per-Buchstaben-Stagger mit Feder (für Headlines)
  function staggerText(g, text, x, y, t, opts = {}) {
    const { size = 100, font = `800 ${size}px "Inter Tight"`, color = '#141414', delay = .028, spring: s = 'ui', rise = .9, align = 'left', out = null } = opts;
    g.save(); g.font = font; g.fillStyle = color; g.textBaseline = 'alphabetic';
    const total = g.measureText(text).width;
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    g.beginPath(); g.rect(cx - size, y - size * 1.05, total + size * 2, size * 1.35); g.clip();
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], w = g.measureText(ch).width;
      const pIn = sp(t - i * delay, s);
      const pOut = out ? E.inCubic(clamp((t - out - i * delay * .6) / .28)) : 0;
      g.fillText(ch, cx, y + (1 - pIn) * size * rise - pOut * size * 1.2);
      cx += w;
    }
    g.restore();
    return total;
  }

  root.M = { clamp, lerp, mix, seg, spring, SPR, sp, track, trackObj, stretch, swapAlpha, hex, rgb, mixColor, trackColor, rng, noise1, E, grid, rrect, maskLine, staggerText };
})(typeof window !== 'undefined' ? window : globalThis);
