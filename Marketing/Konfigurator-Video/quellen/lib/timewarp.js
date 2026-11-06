// timewarp.js — Speed-Ramps (After-Effects-Time-Remapping) statt Freeze-Holds.
// In jeder Zone [a, b] (Szenenzeit) bremst die Zeit weich ab (Raised-Cosine) und beschleunigt wieder;
// die minimale Geschwindigkeit wird pro Zone so gelöst, dass die Zone genau `extra` Sekunden länger dauert.
// Nichts friert ein – alles läuft in Zeitlupe weiter. Übergänge ausserhalb der Zonen laufen in Echtzeit.
// Browser: <script src="timewarp.js"> → TW.make(zones, oldEnd). Node: require('./timewarp.js') → globalThis.TW.
(function (root) {
  function make(ZONES, OLDEND) {
    const bump = (t, a, b) => (t <= a || t >= b ? 0 : 0.5 - 0.5 * Math.cos(2 * Math.PI * (t - a) / (b - a)));
    const extraFor = (a, b, smin) => { let e = 0; const n = 2000, dt = (b - a) / n; for (let i = 0; i < n; i++) { const t = a + (i + 0.5) * dt; e += (1 / (1 - (1 - smin) * bump(t, a, b)) - 1) * dt; } return e; };
    const SMIN = ZONES.map(([a, b, x]) => { let lo = 0.01, hi = 1; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (extraFor(a, b, m) > x) lo = m; else hi = m; } return (lo + hi) / 2; });
    const speed = (t) => { let s = 1; ZONES.forEach(([a, b], i) => { const bb = bump(t, a, b); if (bb > 0) s = 1 - (1 - SMIN[i]) * bb; }); return s; };
    const STEP = 1 / 4000, NEWT = new Float64Array(Math.ceil(OLDEND / STEP) + 2);
    let acc = 0; for (let i = 1; i < NEWT.length; i++) { acc += STEP / speed((i - 0.5) * STEP); NEWT[i] = acc; }
    const last = NEWT.length - 1;
    function oldToNew(t) { if (t >= last * STEP) return NEWT[last] + (t - last * STEP); const i = Math.max(0, Math.floor(t / STEP)), f = t / STEP - i; return NEWT[i] + (NEWT[i + 1] - NEWT[i]) * f; }
    function newToOld(tn) {
      if (tn >= NEWT[last]) return last * STEP + (tn - NEWT[last]);
      let lo = 0, hi = last; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (NEWT[m] <= tn) lo = m; else hi = m; }
      return (lo + (tn - NEWT[lo]) / (NEWT[hi] - NEWT[lo])) * STEP;
    }
    return { ZONES, SMIN, speed, oldToNew, newToOld, total: NEWT[last] };
  }
  root.TW = { make };
})(typeof window !== 'undefined' ? window : globalThis);
