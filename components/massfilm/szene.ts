// Scroll-Film «Vom Mass zum Anzug»: reine Zeichenfunktion zeichne(ctx, W, H, p, …).
// p = Scroll-Fortschritt (−0.25 … 1). Keine Timer, kein Zustand zwischen Frames:
// Rückwärtsscrollen spult exakt zurück. Alles ist Vektor (Körper als 3D-Konturlinien,
// Massband, Papierschnitt), dazu zwei Bilder: Holland-&-Sherry-Stoff und das Schlussfoto.

export type MassTexte = {
  schulter: string;
  brust: string;
  taille: string;
  aermel: string;
  bein: string;
  cm: string;
  punkte: string;
};
export type TeilTexte = { vorderteil: string; rueckenteil: string; aermel: string; hose: string };
export type SzeneTexte = { masse: MassTexte; teile: TeilTexte; stoff: string };
export type SzeneMittel = { stoff: HTMLImageElement | null; foto: HTMLImageElement | null; serif: string; sans: string };

/* ---------- Werkzeuge ---------- */
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const out3 = (t: number) => 1 - Math.pow(1 - t, 3);
const outExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const inOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const rgba = (c: number[], a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mixC = (a: number[], b: number[], t: number) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

const GOLD = [201, 170, 110];
const CREME = [240, 232, 214];
const SILBER = [214, 210, 202];
const BG = '#0c0b0a';

/* ---------- Körpermodell (cm, y = Höhe über Boden, z zur Kamera) ---------- */
type Key = [number, number, number, number, number]; // y, cx, cz, hw, hd
type Ring = { y: number; cx: number; cz: number; hw: number; hd: number; teil: 'rumpf' | 'kopf' | 'arm' | 'hand' | 'bein' | 'fuss'; seite: number };

function interp(keys: Key[], y: number): Key {
  if (y >= keys[0][0]) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (y <= a[0] && y >= b[0]) {
      const t = inOutSine((a[0] - y) / (a[0] - b[0]));
      return [y, mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t), mix(a[4], b[4], t)];
    }
  }
  return keys[keys.length - 1];
}

// Rumpf von oben nach unten
const RUMPF: Key[] = [
  [151, 0, 0.4, 7, 6.6],
  [149, 0, 0, 10.5, 7.4],
  [146.5, 0, 0, 15, 8.6],
  [143.5, 0, 0, 18, 9.8],
  [140, 0, 0.3, 18.8, 11],
  [136, 0, 0.8, 18.6, 12],
  [131, 0, 1.2, 18.4, 12.7],
  [126, 0, 1.4, 18, 13],
  [120, 0, 1.2, 17.4, 12.6],
  [114, 0, 0.8, 16.4, 12],
  [108, 0, 0.4, 15.4, 11.3],
  [103, 0, 0.2, 15.2, 11],
  [98, 0, -0.2, 16.4, 11.6],
  [93, 0, -0.8, 17.6, 12.4],
  [88, 0, -1, 17.4, 12.4],
  [84, 0, -0.5, 16.5, 11.5],
];
const KOPF: Key[] = [
  [182, 0, -0.2, 2, 2.5],
  [180.5, 0, -0.2, 5.2, 6.4],
  [178, 0, -0.2, 7.1, 8.6],
  [175, 0, 0, 8, 9.7],
  [171, 0, 0.2, 8.2, 10.1],
  [167, 0, 0.6, 8, 10],
  [163, 0, 1.2, 7.8, 9.6],
  [160, 0, 1.6, 7.2, 8.6],
  [157.5, 0, 1.2, 6.2, 7],
  [155, 0, 0.8, 5.9, 6.3],
  [151.5, 0, 0.6, 6.3, 6.5],
];
// Arm (rechte Körperseite = +x), Radius → hw/hd
const ARM: Key[] = [
  [147.5, 19.2, 0, 3.2, 3.6],
  [145.5, 20.2, 0, 5.3, 5.8],
  [140, 20.6, 0, 5.1, 5.6],
  [130, 21.2, -0.5, 4.6, 5],
  [120, 21.8, -0.8, 4.2, 4.6],
  [112, 22.2, -0.8, 3.8, 4.2],
  [104, 22.6, -0.2, 4, 4.5],
  [96, 23, 0.6, 3.4, 3.9],
  [88, 23.2, 1.2, 2.6, 3.1],
];
const HAND: Key[] = [
  [87, 23.2, 1.4, 2.1, 3.6],
  [82, 23.4, 1.8, 2, 4.5],
  [76, 23.2, 2, 1.7, 4.1],
  [71, 22.8, 2.2, 1.1, 2.6],
  [68.5, 22.6, 2.2, 0.4, 0.9],
];
const BEIN: Key[] = [
  [86, 9.6, -0.5, 7.9, 8.6],
  [80, 9.8, -0.3, 7.6, 8.2],
  [70, 10, 0, 6.8, 7.4],
  [60, 10.1, 0.2, 5.9, 6.4],
  [50, 10.2, 0.2, 4.8, 5.2],
  [46, 10.2, 0, 4.6, 5],
  [38, 10.3, -0.8, 5.1, 5.6],
  [28, 10.4, -0.6, 4.2, 4.6],
  [18, 10.5, -0.2, 3.3, 3.6],
  [9, 10.6, 0, 2.9, 3.1],
];
const FUSS: Key[] = [
  [8, 10.8, 2.6, 3.4, 6.5],
  [5.5, 11, 4.6, 4.1, 10.5],
  [3, 11.2, 5.6, 4.4, 12.4],
  [0.8, 11.2, 5.8, 4, 12],
];

function baueRinge(): Ring[] {
  const r: Ring[] = [];
  const add = (keys: Key[], step: number, teil: Ring['teil'], seite: number) => {
    const top = keys[0][0];
    const bot = keys[keys.length - 1][0];
    for (let y = top; y >= bot - 0.01; y -= step) {
      const k = interp(keys, y);
      r.push({ y, cx: k[1] * seite, cz: k[2], hw: k[3], hd: k[4], teil, seite });
    }
  };
  add(KOPF, 1.75, 'kopf', 1);
  add(RUMPF, 2.2, 'rumpf', 1);
  for (const s of [1, -1]) {
    add(ARM, 2.3, 'arm', s);
    add(HAND, 2.2, 'hand', s);
    add(BEIN, 2.4, 'bein', s);
    add(FUSS, 2.4, 'fuss', s);
  }
  return r;
}
const RINGE = baueRinge();
const LETZTER_RUMPF = RINGE.filter((r) => r.teil === 'rumpf').pop();

// Anzug-Morph: s = 0 (Hemd) … 1 (Anzug)
function anzug(r: Ring, s: number): { cx: number; cz: number; hw: number; hd: number } {
  let { cx, cz, hw, hd } = r;
  if (s <= 0) return { cx, cz, hw, hd };
  if (r.teil === 'rumpf') {
    if (r.y < 146 && r.y > 83) {
      const schulter = seg(r.y, 136, 141) * (1 - seg(r.y, 144, 146.5));
      hw += s * (1.5 + schulter * 1.6);
      hd += s * 1.3;
      if (r.y < 96) hw = mix(hw, Math.max(hw, 18.6), s);
    }
  } else if (r.teil === 'arm') {
    if (r.y > 89) {
      hw += s * 1.1;
      hd += s * 1.2;
    }
  } else if (r.teil === 'bein') {
    const hosenR = 8.4 - (86 - r.y) * 0.044;
    hw = mix(hw, Math.max(hw, hosenR * 0.93), s);
    hd = mix(hd, Math.max(hd, hosenR), s);
  }
  return { cx, cz, hw, hd };
}

// Superellipse-Querschnitt
const N_PTS = 40;
const EXP = 2 / 2.5;
function quer(a: number, hw: number, hd: number): [number, number, number, number] {
  const sa = Math.sin(a);
  const ca = Math.cos(a);
  const x = hw * Math.sign(sa) * Math.pow(Math.abs(sa), EXP);
  const z = hd * Math.sign(ca) * Math.pow(Math.abs(ca), EXP);
  return [x, z, sa, ca];
}

/* ---------- Kamera ---------- */
type Kamera = { cx: number; cy: number; k: number; th: number; neig: number };
const D = 520;
function proj(cam: Kamera, x: number, y: number, z: number): [number, number, number] {
  const c = Math.cos(cam.th);
  const s = Math.sin(cam.th);
  const xr = x * c + z * s;
  const zr = -x * s + z * c;
  const f = D / (D - zr);
  // neig: Blick leicht von oben, damit die Konturringe als Ellipsen lesbar sind
  return [cam.cx + xr * f * cam.k, cam.cy - (y - 100) * f * cam.k + zr * cam.neig * f * cam.k, zr];
}
function nz(cam: Kamera, nx: number, nzz: number) {
  return -nx * Math.sin(cam.th) + nzz * Math.cos(cam.th);
}

type Layout = { hoch: boolean; still: boolean; A: { cx: number; cy: number; k: number }; B: { cx: number; cy: number; k: number }; foto: { ox: number; oy: number; s: number } };
const FOTO = { w: 1500, h: 1000, mannX: 476, kopfY: 65, pxProCm: 7 };

export function layout(W: number, H: number, still = false): Layout {
  const hoch = W / H < 1.05;
  const A = still
    ? { k: (H * 0.8) / 184, boden: H * 0.93, cx: W * 0.5 }
    : hoch
    ? { k: (H * 0.47) / 184, boden: H * 0.6, cx: W * 0.5 }
    : { k: (H * 0.78) / 184, boden: H * 0.92, cx: W * 0.32 };
  const s = Math.max(W / FOTO.w, H / FOTO.h);
  const anker = hoch ? 0.5 : 0.32;
  const ox = clamp(W * anker - FOTO.mannX * s, W - FOTO.w * s, 0);
  const oy = (H - FOTO.h * s) / 2;
  return {
    hoch,
    still,
    A: { cx: A.cx, cy: A.boden - 100 * A.k, k: A.k },
    B: { cx: ox + FOTO.mannX * s, cy: oy + (FOTO.kopfY + (181.5 - 100) * FOTO.pxProCm) * s, k: FOTO.pxProCm * s },
    foto: { ox, oy, s },
  };
}

/* ---------- Schnittteile (cm, y nach unten) ---------- */
type Cmd = ['M' | 'L', number, number] | ['Q', number, number, number, number];
const TEILE: { id: keyof TeilTexte; cmds: Cmd[]; ziel: [number, number, number]; mass: keyof MassTexte; wert: number }[] = [
  {
    id: 'vorderteil',
    cmds: [['M', 9, 0], ['L', 21, 4], ['Q', 17, 13, 18, 20], ['Q', 20, 26, 28, 27], ['Q', 25, 42, 27, 55], ['L', 29, 78], ['Q', 15, 80, 1, 78], ['L', 0, 32], ['L', -3, 14], ['L', 9, 0]],
    ziel: [-9, 118, 1],
    mass: 'brust',
    wert: 102,
  },
  {
    id: 'rueckenteil',
    cmds: [['M', 0, 2], ['Q', 5, 0, 9, 0], ['L', 22, 3], ['Q', 19, 12, 20, 22], ['Q', 21, 26, 25, 28], ['Q', 23, 44, 24, 56], ['L', 25, 78], ['L', 4, 78], ['Q', 2, 60, 3, 50], ['Q', 0, 38, 0, 2]],
    ziel: [9, 118, 1],
    mass: 'schulter',
    wert: 47,
  },
  {
    id: 'aermel',
    cmds: [['M', 3, 10], ['Q', 12, -2, 22, 4], ['Q', 27, 8, 27, 12], ['Q', 25, 40, 23, 72], ['L', 9, 74], ['Q', 8, 45, 2, 22], ['Q', 0, 15, 3, 10]],
    ziel: [22, 116, 0.75],
    mass: 'aermel',
    wert: 64,
  },
  {
    id: 'hose',
    cmds: [['M', 2, 0], ['L', 20, 0], ['Q', 20, 14, 27, 22], ['L', 26, 25], ['Q', 22, 60, 22, 104], ['L', 6, 104], ['Q', 4, 60, 0, 30], ['Q', 0, 10, 2, 0]],
    ziel: [10, 50, 0.85],
    mass: 'bein',
    wert: 104,
  },
];
type Teil = { pts: [number, number][]; len: number[]; total: number; bx: number; by: number; bw: number; bh: number };
function sample(cmds: Cmd[]): Teil {
  const pts: [number, number][] = [];
  let cx = 0;
  let cy = 0;
  for (const c of cmds) {
    if (c[0] === 'M' || c[0] === 'L') {
      if (c[0] === 'L') {
        const n = 8;
        for (let i = 1; i <= n; i++) pts.push([mix(cx, c[1], i / n), mix(cy, c[2], i / n)]);
      } else pts.push([c[1], c[2]]);
      cx = c[1];
      cy = c[2];
    } else {
      const q = c as ['Q', number, number, number, number];
      const n = 14;
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        pts.push([u * u * cx + 2 * u * t * q[1] + t * t * q[3], u * u * cy + 2 * u * t * q[2] + t * t * q[4]]);
      }
      cx = q[3];
      cy = q[4];
    }
  }
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const bx = Math.min(...xs);
  const by = Math.min(...ys);
  return { pts, len, total: len[len.length - 1], bx, by, bw: Math.max(...xs) - bx, bh: Math.max(...ys) - by };
}
const TEIL_GEO = TEILE.map((t) => sample(t.cmds));

/* ---------- Massband-Stationen ---------- */
type Station = { key: keyof MassTexte; wert: number; a: number; b: number; seite: number };
const STATIONEN: Station[] = [
  { key: 'schulter', wert: 47, a: 0.075, b: 0.13, seite: -1 },
  { key: 'brust', wert: 102, a: 0.13, b: 0.185, seite: -1 },
  { key: 'taille', wert: 88, a: 0.185, b: 0.24, seite: -1 },
  { key: 'aermel', wert: 64, a: 0.24, b: 0.295, seite: 1 },
  { key: 'bein', wert: 104, a: 0.295, b: 0.35, seite: 1 },
];

// 32 Messpunkte (deterministisch)
const PUNKTE: { y: number; a: number; teil: 'rumpf' | 'arm' | 'bein'; seite: number; t: number }[] = (() => {
  const out: { y: number; a: number; teil: 'rumpf' | 'arm' | 'bein'; seite: number; t: number }[] = [];
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const ys = [146, 143, 140, 136, 131, 126, 120, 114, 108, 103, 98, 93, 88];
  for (let i = 0; i < 32; i++) {
    const art = i % 4 === 3 ? 'arm' : i % 5 === 4 ? 'bein' : 'rumpf';
    let y: number;
    if (art === 'arm') y = 140 - rnd() * 48;
    else if (art === 'bein') y = 80 - rnd() * 70;
    else y = ys[Math.floor(rnd() * ys.length)];
    out.push({ y, a: (rnd() - 0.5) * 2.2, teil: art, seite: rnd() > 0.5 ? 1 : -1, t: 0.06 + (i / 31) * 0.29 });
  }
  return out;
})();

/* ---------- Text-Helfer ---------- */
function gesperrt(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, sp: number, align: 'left' | 'right' | 'center', max = Infinity) {
  const chars = [...text];
  const w = chars.reduce((s, c) => s + ctx.measureText(c).width, 0) + sp * (chars.length - 1);
  // Zu lang (z. B. Übersetzungen auf dem Handy)? Gleichmässig verkleinern statt abschneiden
  const f = w > max ? max / w : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(f, f);
  let cx = align === 'left' ? 0 : align === 'right' ? -w : -w / 2;
  ctx.textAlign = 'left';
  for (const c of chars) {
    ctx.fillText(c, cx, 0);
    cx += ctx.measureText(c).width + sp;
  }
  ctx.restore();
  return w * f;
}
// Zahl mit festen Ziffernzellen (kein Springen beim Hochzählen)
function ziffern(ctx: CanvasRenderingContext2D, n: number, stellen: number, suffix: string, x: number, y: number, align: 'left' | 'right') {
  const s = String(Math.round(n)).padStart(stellen, ' ');
  const cell = ctx.measureText('0').width * 1.04;
  const sw = ctx.measureText(suffix).width;
  const w = cell * stellen + sw;
  let cx = align === 'left' ? x : x - w;
  const prev = ctx.textAlign;
  ctx.textAlign = 'center';
  for (const ch of s) {
    if (ch !== ' ') ctx.fillText(ch, cx + cell / 2, y);
    cx += cell;
  }
  ctx.textAlign = 'left';
  ctx.fillText(suffix, cx, y);
  ctx.textAlign = prev;
  return w;
}

/* ---------- Hauptfunktion ---------- */
export function zeichne(ctx: CanvasRenderingContext2D, W: number, H: number, p: number, m: SzeneMittel, t: SzeneTexte, still = false) {
  const L = layout(W, H, still);
  const klein = Math.min(W, H) < 560;
  ctx.save();
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // --- Phasen ---
  const scan = seg(p, -0.17, 0.04);
  const schnitt = seg(p, 0.355, 0.43); // Figur → Schnitt
  const stoffT = seg(p, 0.45, 0.56);
  const zurueck = seg(p, 0.6, 0.69); // Schnittteile fliegen auf die Figur
  const sAnzug = inOut(seg(p, 0.62, 0.8));
  const dreh = inOut(seg(p, 0.635, 0.865));
  const kamT = inOut(seg(p, 0.66, 0.865));
  const reveal = seg(p, 0.865, 0.945);
  const schluss = seg(p, 0.93, 1);

  // Drehwinkel: Dreiviertelansicht beim Messen, dann eine volle Drehung bis frontal
  const th0 = mix(-0.44, -0.26, seg(p, 0, 0.36)) + mix(0, 0.06, seg(p, 0.36, 0.6));
  const th = mix(th0, Math.PI * 2, dreh);
  const cam: Kamera = {
    cx: mix(L.A.cx, L.B.cx, kamT),
    cy: mix(L.A.cy, L.B.cy, kamT),
    k: mix(L.A.k, L.B.k, kamT),
    th,
    neig: mix(0.2, 0.02, kamT),
  };

  // --- Licht ---
  const licht = 0.55 + 0.45 * seg(p, 0.6, 0.86);
  const brustP = proj(cam, 0, 125, 0);
  const g = ctx.createRadialGradient(brustP[0], brustP[1], 0, brustP[0], brustP[1], Math.max(W, H) * 0.55);
  g.addColorStop(0, rgba(mixC([70, 56, 36], [120, 92, 52], seg(p, 0.6, 0.86)), 0.55 * licht * scan));
  g.addColorStop(1, 'rgba(12,11,10,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Bodenlicht
  const boden = proj(cam, 0, 0, 0);
  ctx.save();
  ctx.translate(boden[0], boden[1]);
  ctx.scale(1, 0.16);
  const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, 60 * cam.k);
  fg.addColorStop(0, rgba(GOLD, 0.22 * scan * (1 - kamT)));
  fg.addColorStop(1, rgba(GOLD, 0));
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(0, 0, 60 * cam.k, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Figur ---
  const figAlpha = mix(mix(1, 0.2, inOut(schnitt)), 1, inOut(seg(p, 0.6, 0.7)));
  const nachReveal = 1 - seg(p, 0.885, 0.97);
  const linie = mixC(GOLD, SILBER, sAnzug);
  const scanY = mix(-6, 190, outExpo(scan));
  const welleY = mix(195, -15, seg(p, 0.62, 0.74));
  zeichneFigur(ctx, cam, sAnzug, scanY, linie, figAlpha * nachReveal, klein, welleY, m.stoff);

  if (scan > 0 && scan < 1) {
    // Scanlinie
    const sp = proj(cam, 0, scanY, 0);
    const lg = ctx.createLinearGradient(sp[0] - 40 * cam.k, 0, sp[0] + 40 * cam.k, 0);
    lg.addColorStop(0, rgba(CREME, 0));
    lg.addColorStop(0.5, rgba(CREME, 0.9));
    lg.addColorStop(1, rgba(CREME, 0));
    ctx.fillStyle = lg;
    ctx.fillRect(sp[0] - 40 * cam.k, sp[1] - 0.6, 80 * cam.k, 1.2);
  }

  // Anzug-Details (Revers, Knopf) – nur frontal sichtbar
  if (sAnzug > 0.3) zeichneRevers(ctx, cam, (sAnzug - 0.3) / 0.7, figAlpha * nachReveal);

  // --- Messpunkte und Massband ---
  const messAlpha = 1 - seg(p, 0.355, 0.4);
  if (messAlpha > 0 && p > 0.05) {
    zeichnePunkte(ctx, cam, p, messAlpha);
    zeichneMassbaender(ctx, cam, L, p, messAlpha, m, t, klein, W);
    // Zähler
    const n = Math.round(32 * seg(p, 0.06, 0.35));
    ctx.globalAlpha = messAlpha * seg(p, 0.05, 0.08);
    const oben = L.hoch && !L.still;
    const zx = oben || L.still ? 18 : Math.max(24, cam.cx - 64 * cam.k);
    const zy = oben ? H * 0.085 + 40 : H * 0.86;
    ctx.fillStyle = rgba(CREME, 1);
    ctx.font = `500 ${klein ? 34 : 54}px ${m.serif}`;
    ziffern(ctx, n, 2, '', zx, zy, 'left');
    ctx.font = `600 ${klein ? 9 : 10.5}px ${m.sans}`;
    ctx.fillStyle = rgba(GOLD, 1);
    gesperrt(ctx, t.masse.punkte.toUpperCase(), zx, zy + (klein ? 16 : 22), 2.2, 'left');
    ctx.globalAlpha = 1;
  }

  // --- Schnittteile ---
  if (p > 0.34 && p < 0.72) zeichneSchnitt(ctx, cam, L, W, H, p, schnitt, stoffT, zurueck, m, t, klein);

  // --- Reveal: das Foto ---
  if (reveal > 0 && m.foto && m.foto.complete && m.foto.naturalWidth > 0) {
    const r = inOut(reveal);
    const sx = mix(-0.12 * W, 1.12 * W, r);
    const zoom = 1 + 0.035 * schluss;
    const { ox, oy, s } = L.foto;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, Math.max(0, sx), H);
    ctx.clip();
    ctx.translate(L.B.cx, L.B.cy);
    ctx.scale(zoom, zoom);
    ctx.translate(-L.B.cx, -L.B.cy);
    ctx.drawImage(m.foto, ox, oy, FOTO.w * s, FOTO.h * s);
    ctx.restore();
    // Lichtkante
    const bell = Math.sin(Math.PI * clamp(reveal * 1.05));
    if (bell > 0.01) {
      const bw = W * 0.16;
      const lg = ctx.createLinearGradient(sx - bw, 0, sx + bw * 0.25, 0);
      lg.addColorStop(0, 'rgba(255,240,215,0)');
      lg.addColorStop(0.82, `rgba(255,240,215,${0.35 * bell})`);
      lg.addColorStop(0.97, `rgba(255,248,235,${0.75 * bell})`);
      lg.addColorStop(1, 'rgba(255,248,235,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = lg;
      ctx.fillRect(sx - bw, 0, bw * 1.25, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Lesbarkeit für den Schlusstext
    const lesen = seg(p, 0.9, 0.96);
    if (lesen > 0) {
      const gg = L.hoch ? ctx.createLinearGradient(0, H * 0.45, 0, H) : ctx.createLinearGradient(W * 0.42, 0, W * 0.8, 0);
      gg.addColorStop(0, 'rgba(10,9,8,0)');
      gg.addColorStop(1, `rgba(10,9,8,${0.82 * lesen})`);
      ctx.fillStyle = gg;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // Untertitel-Grund (Hochformat)
  if (L.hoch && !L.still) {
    const ug = ctx.createLinearGradient(0, H * 0.6, 0, H);
    ug.addColorStop(0, 'rgba(12,11,10,0)');
    ug.addColorStop(0.45, 'rgba(12,11,10,0.7)');
    ug.addColorStop(1, 'rgba(12,11,10,0.85)');
    ctx.fillStyle = ug;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);
  }
  ctx.restore();
}

/* ---------- Figur ---------- */
const MUSTER = new WeakMap<HTMLImageElement, CanvasPattern | null>();
function muster(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null) {
  if (!img || !img.complete || !img.naturalWidth) return null;
  if (!MUSTER.has(img)) MUSTER.set(img, ctx.createPattern(img, 'repeat'));
  return MUSTER.get(img) ?? null;
}

function zeichneFigur(
  ctx: CanvasRenderingContext2D,
  cam: Kamera,
  s: number,
  scanY: number,
  farbe: number[],
  alpha: number,
  klein: boolean,
  welleY: number,
  stoff: HTMLImageElement | null,
) {
  if (alpha <= 0.002) return;
  const vorne = new Path2D();
  const hinten = new Path2D();
  const welle = new Path2D();
  const step = (Math.PI * 2) / N_PTS;
  // Silhouetten je Körperteil (für die Stoff-Füllung im Anzug)
  const sil = new Map<string, { l: [number, number][]; r: [number, number][]; z: number }>();
  const addRing = (cx: number, y: number, cz: number, hw: number, hd: number, ziel: [Path2D, Path2D], key: string | null) => {
    let prevV: boolean | null = null;
    let px = 0;
    let py = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let lp: [number, number] = [0, 0];
    let rp: [number, number] = [0, 0];
    for (let i = 0; i <= N_PTS; i++) {
      const a = i * step;
      const [x, z, sa, ca] = quer(a, hw, hd);
      const q = proj(cam, cx + x, y, cz + z);
      const v = nz(cam, sa * hd, ca * hw) > 0;
      if (i > 0) {
        const pth = prevV && v ? ziel[0] : ziel[1];
        pth.moveTo(px, py);
        pth.lineTo(q[0], q[1]);
      }
      if (q[0] < minX) {
        minX = q[0];
        lp = [q[0], q[1]];
      }
      if (q[0] > maxX) {
        maxX = q[0];
        rp = [q[0], q[1]];
      }
      prevV = v;
      px = q[0];
      py = q[1];
    }
    if (key) {
      let e = sil.get(key);
      if (!e) {
        e = { l: [], r: [], z: proj(cam, cx, y, cz)[2] };
        sil.set(key, e);
      }
      e.l.push(lp);
      e.r.push(rp);
    }
  };
  const fuellen = s > 0.02 && !!stoff;
  for (const r of RINGE) {
    if (r.y > scanY) continue;
    const g = anzug(r, s);
    const nahe = Math.abs(r.y - welleY) < 7;
    const key =
      fuellen && ((r.teil === 'rumpf' && r.y < 147) || (r.teil === 'arm' && r.y > 88 && r.y < 146) || r.teil === 'bein')
        ? `${r.teil}${r.seite}`
        : null;
    addRing(g.cx, r.y, g.cz, g.hw, g.hd, nahe ? [welle, hinten] : [vorne, hinten], key);
    // Sakko-Saum direkt unter dem Rumpf anhängen
    if (s > 0.02 && r === LETZTER_RUMPF) {
      for (let y = 82.5; y >= 76; y -= 2.2) addRing(0, y, -0.4, 18.6, 12.6, Math.abs(y - welleY) < 7 ? [welle, hinten] : [vorne, hinten], fuellen ? 'rumpf1' : null);
    }
  }
  // Stoff legt sich über die Figur
  if (fuellen) {
    const pat = muster(ctx, stoff);
    const teile = [...sil.values()].sort((a, b) => a.z - b.z);
    if (pat) {
      pat.setTransform(new DOMMatrix().scale(cam.k / 5.2));
      for (const e of teile) {
        if (e.l.length < 2) continue;
        ctx.beginPath();
        e.l.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        for (let i = e.r.length - 1; i >= 0; i--) ctx.lineTo(e.r[i][0], e.r[i][1]);
        ctx.closePath();
        ctx.globalAlpha = 0.62 * s * alpha;
        ctx.fillStyle = pat;
        ctx.fill();
        ctx.globalAlpha = 0.5 * s * alpha;
        ctx.fillStyle = '#2a2724';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.lineWidth = klein ? 0.8 : 1;
  ctx.strokeStyle = rgba(farbe, 0.13 * alpha * (1 - 0.6 * s));
  ctx.stroke(hinten);
  ctx.strokeStyle = rgba(farbe, 0.78 * alpha);
  ctx.stroke(vorne);
  ctx.strokeStyle = rgba(CREME, alpha);
  ctx.lineWidth = klein ? 1.1 : 1.5;
  ctx.stroke(welle);
}

function zeichneRevers(ctx: CanvasRenderingContext2D, cam: Kamera, t: number, alpha: number) {
  const front = Math.max(0, Math.cos(cam.th));
  const a = alpha * t * front;
  if (a < 0.01) return;
  const vorn = (x: number, y: number) => {
    const k = interp(RUMPF, y);
    const xs = clamp(x / (k[3] + 1.5), -1, 1);
    const z = k[2] + (k[4] + 1.3) * Math.sqrt(1 - xs * xs) + 0.3;
    return proj(cam, x, y, z);
  };
  ctx.strokeStyle = rgba(CREME, 0.85 * a);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const sx of [1, -1]) {
    const pts: [number, number][] = [
      [5.5 * sx, 149],
      [8 * sx, 141.5],
      [12.5 * sx, 133],
      [10.5 * sx, 131.5],
      [11.5 * sx, 129],
      [1.5 * sx, 104],
      [5.5 * sx, 149],
    ];
    pts.forEach(([x, y], i) => {
      const q = vorn(x, y);
      if (i === 0) ctx.moveTo(q[0], q[1]);
      else ctx.lineTo(q[0], q[1]);
    });
  }
  ctx.stroke();
  // Knopf
  ctx.fillStyle = rgba(CREME, 0.9 * a);
  for (const by of [103, 92]) {
    const kb = vorn(0.6, by);
    ctx.beginPath();
    ctx.arc(kb[0], kb[1], Math.max(1.4, 0.7 * cam.k), 0, Math.PI * 2);
    ctx.fill();
  }
  // Brusttasche
  ctx.beginPath();
  const t1 = vorn(-8.5, 128);
  const t2 = vorn(-15, 127);
  ctx.moveTo(t1[0], t1[1]);
  ctx.lineTo(t2[0], t2[1]);
  ctx.stroke();
}

function zeichnePunkte(ctx: CanvasRenderingContext2D, cam: Kamera, p: number, alpha: number) {
  for (const pt of PUNKTE) {
    const lt = (p - pt.t) / 0.02;
    if (lt < 0) continue;
    let x: number;
    let z: number;
    let nx: number;
    let nzz: number;
    if (pt.teil === 'rumpf') {
      const k = interp(RUMPF, pt.y);
      const q = quer(pt.a, k[3], k[4]);
      x = q[0];
      z = k[2] + q[1];
      nx = q[2];
      nzz = q[3];
    } else {
      const keys = pt.teil === 'arm' ? ARM : BEIN;
      const k = interp(keys, pt.y);
      const q = quer(pt.a * 0.6 + (pt.teil === 'arm' ? 0.9 : 0), k[3], k[4]);
      x = k[1] * pt.seite + q[0];
      z = k[2] + q[1];
      nx = q[2];
      nzz = q[3];
    }
    if (nz(cam, nx, nzz) < 0.1) continue;
    const s = proj(cam, x, pt.y, z);
    const pop = clamp(lt);
    ctx.fillStyle = rgba(CREME, alpha * 0.95);
    ctx.beginPath();
    ctx.arc(s[0], s[1], 1.7 * out3(pop), 0, Math.PI * 2);
    ctx.fill();
    if (lt < 1.5) {
      ctx.strokeStyle = rgba(GOLD, alpha * (1 - clamp(lt / 1.5)) * 0.9);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s[0], s[1], 2 + 9 * outExpo(clamp(lt / 1.5)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/* ---------- Massband ---------- */
type BandPt = { top: [number, number, number]; bot: [number, number, number]; v: boolean };
function bandRing(cam: Kamera, y: number, frac: number): BandPt[] {
  const k = interp(RUMPF, y);
  const n = 72;
  const out: BandPt[] = [];
  const m = Math.max(1, Math.round(n * frac));
  for (let i = 0; i <= m; i++) {
    // Start vorne-links (aus Kamerasicht) und einmal herum
    const a = -0.55 + (i / n) * Math.PI * 2;
    const [x, z, sa, ca] = quer(a, k[3] * 1.06, k[4] * 1.07);
    out.push({
      top: proj(cam, x, y + 0.9, k[2] + z),
      bot: proj(cam, x, y - 0.9, k[2] + z),
      v: nz(cam, sa * k[4], ca * k[3]) > 0,
    });
  }
  return out;
}
function bandLinie(cam: Kamera, pts: [number, number, number][], quer: [number, number, number], normal: [number, number], frac: number): BandPt[] {
  const out: BandPt[] = [];
  const m = Math.max(1, Math.round((pts.length - 1) * frac));
  const v = nz(cam, normal[0], normal[1]) > -0.05;
  for (let i = 0; i <= m; i++) {
    const [x, y, z] = pts[i];
    out.push({ top: proj(cam, x + quer[0], y + quer[1], z + quer[2]), bot: proj(cam, x - quer[0], y - quer[1], z - quer[2]), v });
  }
  return out;
}
function zeichneBand(ctx: CanvasRenderingContext2D, b: BandPt[], alpha: number) {
  for (const pass of [false, true]) {
    for (let i = 0; i < b.length - 1; i++) {
      const a = b[i];
      const c = b[i + 1];
      if (a.v !== pass) continue;
      ctx.fillStyle = pass ? rgba(CREME, 0.95 * alpha) : rgba(CREME, 0.18 * alpha);
      ctx.beginPath();
      ctx.moveTo(a.top[0], a.top[1]);
      ctx.lineTo(c.top[0], c.top[1]);
      ctx.lineTo(c.bot[0], c.bot[1]);
      ctx.lineTo(a.bot[0], a.bot[1]);
      ctx.closePath();
      ctx.fill();
      if (pass && i % 3 === 0) {
        ctx.strokeStyle = rgba([60, 50, 36], 0.7 * alpha);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.top[0], a.top[1]);
        ctx.lineTo(mix(a.top[0], a.bot[0], i % 6 === 0 ? 0.6 : 0.35), mix(a.top[1], a.bot[1], i % 6 === 0 ? 0.6 : 0.35));
        ctx.stroke();
      }
    }
  }
  // Metallende
  const e = b[b.length - 1];
  ctx.fillStyle = rgba(GOLD, alpha);
  ctx.beginPath();
  ctx.arc((e.top[0] + e.bot[0]) / 2, (e.top[1] + e.bot[1]) / 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function zeichneMassbaender(ctx: CanvasRenderingContext2D, cam: Kamera, L: Layout, p: number, alpha: number, m: SzeneMittel, t: SzeneTexte, klein: boolean, W: number) {
  for (const st of STATIONEN) {
    const lt = seg(p, st.a, st.b);
    if (lt <= 0) continue;
    const zieh = out3(seg(lt, 0, 0.75));
    const aBand = alpha * (1 - 0.55 * seg(p, st.b + 0.01, st.b + 0.05)); // altes Band tritt zurück
    let band: BandPt[];
    let anker: [number, number];
    if (st.key === 'brust' || st.key === 'taille') {
      const y = st.key === 'brust' ? 126 : 103;
      band = bandRing(cam, y, zieh);
      // Anker: linke Silhouettenkante
      const voll = bandRing(cam, y, 1);
      const links = voll.reduce((acc, b) => (b.top[0] < acc.top[0] ? b : acc), voll[0]);
      anker = [links.top[0], (links.top[1] + links.bot[1]) / 2];
    } else if (st.key === 'schulter') {
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= 30; i++) {
        const a = -Math.PI / 2 + (i / 30) * Math.PI;
        const k = interp(RUMPF, 145);
        const [x, z] = quer(a, k[3] * 1.18, k[4] * 1.15);
        pts.push([x, 145 + Math.cos(a) * 0.8, k[2] + z]);
      }
      band = bandLinie(cam, pts, [0, 0.8, 0], [0, 1], zieh);
      const a0 = proj(cam, pts[0][0], pts[0][1], pts[0][2]);
      anker = [a0[0], a0[1]];
    } else if (st.key === 'aermel') {
      const pts: [number, number, number][] = [];
      for (let y = 146; y >= 87; y -= 2) {
        const k = interp(ARM, y);
        pts.push([k[1] + k[3] + 0.5, y, k[2]]);
      }
      band = bandLinie(cam, pts, [0, 0, 0.9], [1, 0], zieh);
      const e = band[band.length - 1];
      const mid = pts[Math.floor(pts.length * 0.55)];
      const q = proj(cam, mid[0], mid[1], mid[2]);
      anker = [q[0], q[1]];
      void e;
    } else {
      const pts: [number, number, number][] = [];
      for (let y = 103; y >= 2; y -= 2.5) {
        const k = y > 86 ? interp(RUMPF, y) : interp(BEIN, y);
        const x = y > 86 ? k[3] + 0.6 : k[1] + k[3] + 0.6;
        pts.push([x, y, k[2]]);
      }
      band = bandLinie(cam, pts, [0, 0, 0.9], [1, 0], zieh);
      const mid = pts[Math.floor(pts.length * 0.5)];
      const q = proj(cam, mid[0], mid[1], mid[2]);
      anker = [q[0], q[1]];
    }
    zeichneBand(ctx, band, aBand);

    // Beschriftung
    const la = alpha * seg(lt, 0.15, 0.45);
    if (la <= 0) continue;
    const bodyHalf = 30 * cam.k;
    const lx = st.seite < 0 ? Math.max(klein ? 14 : 28, cam.cx - bodyHalf - (klein ? 26 : 120)) : Math.min(W - (klein ? 14 : 28), cam.cx + bodyHalf + (klein ? 26 : 120));
    const ly = anker[1];
    const ex = st.seite < 0 ? lx + (klein ? 4 : 10) : lx - (klein ? 4 : 10);
    // Führungslinie
    const lineT = out3(seg(lt, 0.1, 0.4));
    const sx = st.seite < 0 ? Math.min(anker[0] - 4, cam.cx - 21 * cam.k) : Math.max(anker[0] + 4, cam.cx + 21 * cam.k);
    ctx.strokeStyle = rgba(GOLD, 0.8 * la);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, ly);
    ctx.lineTo(mix(sx, ex, lineT), ly);
    ctx.stroke();
    ctx.fillStyle = rgba(GOLD, la);
    ctx.beginPath();
    ctx.arc(sx, ly, 2, 0, Math.PI * 2);
    ctx.fill();
    // Text
    const align = st.seite < 0 ? 'right' : 'left';
    const tx = st.seite < 0 ? ex - (klein ? 4 : 8) : ex + (klein ? 4 : 8);
    ctx.globalAlpha = la;
    ctx.font = `600 ${klein ? 8.5 : 10}px ${m.sans}`;
    ctx.fillStyle = rgba(GOLD, 1);
    gesperrt(ctx, t.masse[st.key].toUpperCase(), tx, ly - (klein ? 9 : 13), klein ? 1.4 : 2, align, st.seite < 0 ? tx - 8 : W - 8 - tx);
    ctx.font = `500 ${klein ? 15 : 24}px ${m.serif}`;
    ctx.fillStyle = rgba(CREME, 1);
    ziffern(ctx, st.wert * out3(seg(lt, 0.1, 0.8)), 3, ` ${t.masse.cm}`, tx, ly + (klein ? 9 : 14), align);
    ctx.globalAlpha = 1;
  }
}

/* ---------- Schnitt ---------- */
function zeichneSchnitt(
  ctx: CanvasRenderingContext2D,
  cam: Kamera,
  L: Layout,
  W: number,
  H: number,
  p: number,
  auf: number,
  stoffT: number,
  zurueck: number,
  m: SzeneMittel,
  t: SzeneTexte,
  klein: boolean,
) {
  // Ziel-Reihe
  const reg = L.still
    ? { x0: W * 0.05, x1: W * 0.95, y0: H * 0.1, y1: H * 0.86 }
    : L.hoch
      ? { x0: W * 0.05, x1: W * 0.95, y0: H * 0.1, y1: H * 0.6 } : { x0: W * 0.05, x1: W * 0.56, y0: H * 0.16, y1: H * 0.84 };
  const gap = 7;
  const sumW = TEIL_GEO.reduce((s, g) => s + g.bw, 0) + gap * (TEIL_GEO.length - 1);
  const maxH = Math.max(...TEIL_GEO.map((g) => g.bh));
  const k2 = Math.min((reg.x1 - reg.x0) / sumW, (reg.y1 - reg.y0) / maxH);
  let x = (reg.x0 + reg.x1) / 2 - (sumW * k2) / 2;
  const yTop = (reg.y0 + reg.y1) / 2 - (maxH * k2) / 2;
  const stoffBox = { x: x, y: yTop, w: sumW * k2, h: maxH * k2 };

  TEIL_GEO.forEach((g, i) => {
    const def = TEILE[i];
    const reihe = { x, y: yTop + (maxH - g.bh) * k2 * 0.5, k: k2 };
    x += (g.bw + gap) * k2;
    // Start/Ziel am Körper
    const ziel = proj(cam, def.ziel[0], def.ziel[1], 0);
    const kz = cam.k * def.ziel[2] * mix(1, 0.55, zurueck);
    const amKoerper = { x: ziel[0] - (g.bw * kz) / 2, y: ziel[1] - (g.bh * kz) / 2, k: kz };
    const ti = inOut(seg(auf, i * 0.08, 0.76 + i * 0.08));
    const tz = inOut(seg(zurueck, i * 0.06, 0.82 + i * 0.06));
    const aufT = ti * (1 - tz);
    const pos = { x: mix(amKoerper.x, reihe.x, aufT), y: mix(amKoerper.y, reihe.y, aufT), k: mix(amKoerper.k, reihe.k, aufT) };
    const alpha = seg(auf, i * 0.08, 0.3 + i * 0.08) * (1 - seg(zurueck, 0.25 + i * 0.06, 0.7 + i * 0.06));
    if (alpha <= 0.003) return;
    const tr = (px: number, py: number): [number, number] => [pos.x + (px - g.bx) * pos.k, pos.y + (py - g.by) * pos.k];
    const pfad = new Path2D();
    g.pts.forEach((pt, j) => {
      const q = tr(pt[0], pt[1]);
      if (j === 0) pfad.moveTo(q[0], q[1]);
      else pfad.lineTo(q[0], q[1]);
    });
    pfad.closePath();

    // Stoff (alle Teile aus einem Stück Stoff geschnitten)
    const st = clamp((stoffT - i * 0.1) / 0.7);
    if (st > 0 && m.stoff && m.stoff.complete && m.stoff.naturalWidth > 0) {
      ctx.save();
      ctx.clip(pfad);
      // diagonaler Wisch
      const wx = mix(pos.x - g.bh * pos.k, pos.x + (g.bw + g.bh * 0.5) * pos.k + 10, out3(st));
      ctx.beginPath();
      ctx.moveTo(pos.x - 2000, pos.y - 10);
      ctx.lineTo(wx + g.bh * pos.k * 0.5, pos.y - 10);
      ctx.lineTo(wx - g.bh * pos.k * 0.5, pos.y + g.bh * pos.k + 10);
      ctx.lineTo(pos.x - 2000, pos.y + g.bh * pos.k + 10);
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = alpha;
      const img = m.stoff;
      const bw = g.bw * pos.k;
      const bh = g.bh * pos.k;
      const sc = Math.max(bw / img.naturalWidth, bh / img.naturalHeight);
      const iw = img.naturalWidth * sc;
      const ih = img.naturalHeight * sc;
      ctx.drawImage(img, pos.x + (bw - iw) * (0.2 + 0.2 * i), pos.y + (bh - ih) * 0.5, iw, ih);
      // Licht auf dem Stoff
      const lg = ctx.createLinearGradient(pos.x, pos.y, pos.x + bw, pos.y + bh);
      lg.addColorStop(0, 'rgba(255,240,215,0.06)');
      lg.addColorStop(1, 'rgba(0,0,0,0.42)');
      ctx.fillStyle = lg;
      ctx.fillRect(pos.x - 4, pos.y - 4, g.bw * pos.k + 8, g.bh * pos.k + 8);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Kontur zeichnet sich
    const zeichT = out3(seg(auf, i * 0.08, 0.62 + i * 0.08));
    const lim = g.total * zeichT;
    ctx.strokeStyle = rgba(CREME, 0.92 * alpha);
    ctx.lineWidth = klein ? 1 : 1.3;
    ctx.beginPath();
    for (let j = 0; j < g.pts.length; j++) {
      if (g.len[j] > lim) {
        const a = g.pts[j - 1];
        const b = g.pts[j];
        const f = (lim - g.len[j - 1]) / (g.len[j] - g.len[j - 1] || 1);
        const q = tr(mix(a[0], b[0], f), mix(a[1], b[1], f));
        ctx.lineTo(q[0], q[1]);
        break;
      }
      const q = tr(g.pts[j][0], g.pts[j][1]);
      if (j === 0) ctx.moveTo(q[0], q[1]);
      else ctx.lineTo(q[0], q[1]);
    }
    ctx.stroke();

    // Nahtzugabe (gestrichelt) + Fadenlauf
    const det = alpha * seg(auf, 0.55 + i * 0.05, 0.9 + i * 0.03) * (1 - tz);
    if (det > 0.01) {
      const cxp = g.bx + g.bw / 2;
      const cyp = g.by + g.bh / 2;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = rgba(GOLD, 0.65 * det);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      g.pts.forEach((pt, j) => {
        const q = tr(cxp + (pt[0] - cxp) * 1.06, cyp + (pt[1] - cyp) * 1.035);
        if (j === 0) ctx.moveTo(q[0], q[1]);
        else ctx.lineTo(q[0], q[1]);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      // Fadenlauf-Pfeil
      const a = tr(cxp, g.by + g.bh * 0.3);
      const b = tr(cxp, g.by + g.bh * 0.62);
      ctx.strokeStyle = clamp((stoffT - i * 0.1) / 0.7) > 0.75 ? `rgba(28,25,22,${0.6 * det})` : rgba(CREME, 0.75 * det);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.moveTo(a[0] - 3, a[1] + 5);
      ctx.lineTo(a[0], a[1]);
      ctx.lineTo(a[0] + 3, a[1] + 5);
      ctx.moveTo(b[0] - 3, b[1] - 5);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(b[0] + 3, b[1] - 5);
      ctx.stroke();
      // Beschriftung
      const lab = tr(cxp, g.by + g.bh * 0.74);
      ctx.globalAlpha = det;
      const aufStoff = clamp((stoffT - i * 0.1) / 0.7) > 0.75;
      ctx.fillStyle = aufStoff ? 'rgba(28,25,22,0.9)' : rgba(CREME, 1);
      ctx.font = `600 ${klein ? 7 : 9.5}px ${m.sans}`;
      gesperrt(ctx, t.teile[def.id].toUpperCase(), lab[0], lab[1], klein ? 0.8 : 1.6, 'center', g.bw * pos.k * 0.9);
      ctx.font = `500 ${klein ? 10 : 15}px ${m.serif}`;
      ctx.fillStyle = aufStoff ? 'rgba(28,25,22,0.9)' : rgba(GOLD, 1);
      ctx.textAlign = 'center';
      ctx.fillText(`${def.wert} ${t.masse.cm}`, lab[0], lab[1] + (klein ? 13 : 19));
      ctx.globalAlpha = 1;
    }
  });

  // Stoff-Etikett
  const et = seg(stoffT, 0.35, 0.7) * (1 - seg(zurueck, 0, 0.4));
  if (et > 0) {
    ctx.globalAlpha = et;
    ctx.fillStyle = rgba(GOLD, 1);
    ctx.font = `600 ${klein ? 8 : 10}px ${m.sans}`;
    gesperrt(ctx, t.stoff.toUpperCase(), stoffBox.x + stoffBox.w / 2, stoffBox.y + stoffBox.h + (klein ? 22 : 34), klein ? 1.6 : 2.4, 'center');
    ctx.globalAlpha = 1;
  }
}
