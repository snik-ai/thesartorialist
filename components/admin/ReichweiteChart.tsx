'use client';
// Hauptverlauf: Besucher als weiche Fläche (gestrichelt die Vorperiode), darunter die Kontaktwege als
// eigene Bahnen übereinander auf derselben Zeitachse (Anrufe, WhatsApp, E-Mail, Rückrufe, Terminanfragen).
// Fadenkreuz über alle Bahnen mit Tooltip inkl. Kontaktquote des Tages. Eigenes SVG, Tastatur (←/→).
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Tag } from '@/lib/crm/reichweite';
import { BAHNEN } from '@/lib/crm/bahnen';


const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const fmtTag = (t: string, lang = false) => {
  const d = new Date(`${t}T12:00:00Z`);
  return lang ? d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) : `${WT[d.getUTCDay()]} ${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;
};

/** Monotone Kurve (Fritsch-Carlson): weich, ohne Überschwingen unter 0. */
function kurve(p: [number, number][]) {
  if (p.length < 3) return p.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  const n = p.length;
  const dx = p.slice(1).map((q, i) => q[0] - p[i][0]);
  const m = p.slice(1).map((q, i) => (q[1] - p[i][1]) / (dx[i] || 1));
  const t = p.map((_, i) => (i === 0 ? m[0] : i === n - 1 ? m[n - 2] : m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[i + 1];
    const h = (x1 - x0) / 3;
    d += `C${(x0 + h).toFixed(1)} ${(y0 + h * t[i]).toFixed(1)} ${(x1 - h).toFixed(1)} ${(y1 - h * t[i + 1]).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

function schoeneMax(v: number) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const f of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (f * p >= v) return f * p;
  return 10 * p;
}

export default function ReichweiteChart({ tage, vorTage }: { tage: Tag[]; vorTage: Tag[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [breite, setBreite] = useState(900);
  const [aktiv, setAktiv] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBreite(Math.max(320, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const schmal = breite < 640;
  const L = schmal ? 76 : 118;
  const R = schmal ? 34 : 56;
  const HA = schmal ? 170 : 220; // Flächen-Höhe
  const BAHN = schmal ? 30 : 36;
  const T = 12;
  const ACHSE = 26;
  const ob = T + HA + ACHSE;
  const H = ob + BAHNEN.length * BAHN + 10;
  const n = tage.length;
  const innen = breite - L - R;
  const x = (i: number) => L + (n <= 1 ? innen / 2 : (i / (n - 1)) * innen);
  const max = schoeneMax(Math.max(1, ...tage.map((t) => t.besucher), ...vorTage.map((t) => t.besucher)));
  const y = (v: number) => T + HA - (v / max) * HA;

  const pkt = tage.map((t, i) => [x(i), y(t.besucher)] as [number, number]);
  const vorPkt = vorTage.map((t, i) => [x(i), y(t.besucher)] as [number, number]);
  const linie = kurve(pkt);
  const flaeche = `${linie}L${x(n - 1).toFixed(1)} ${T + HA}L${x(0).toFixed(1)} ${T + HA}Z`;
  const schritt = Math.max(1, Math.ceil(n / (schmal ? 5 : 10)));
  const balkenB = Math.max(3, Math.min(18, (innen / n) * 0.62));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  function zeige(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * breite;
    const i = Math.round(((px - L) / innen) * (n - 1));
    setAktiv(Math.max(0, Math.min(n - 1, i)));
  }
  function taste(e: KeyboardEvent<SVGSVGElement>) {
    if (e.key === 'ArrowRight') setAktiv((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setAktiv((a) => Math.max(0, (a ?? n) - 1));
    else if (e.key === 'Escape') setAktiv(null);
    else return;
    e.preventDefault();
  }

  const t = aktiv !== null ? tage[aktiv] : null;
  const kontakteTag = t ? t.tel + t.wa + t.mail + t.rueckruf + t.termin : 0;

  return (
    <div className="a-chart" ref={box}>
      <svg
        viewBox={`0 0 ${breite} ${H}`}
        width={breite}
        height={H}
        role="img"
        aria-label="Besucher pro Tag und Kontaktwege"
        tabIndex={0}
        onPointerMove={zeige}
        onPointerDown={zeige}
        onPointerLeave={() => setAktiv(null)}
        onKeyDown={taste}
        style={{ touchAction: 'pan-y', outline: 'none' }}
      >
        <defs>
          <linearGradient id="rw-flaeche" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#b08d57" stopOpacity="0.34" />
            <stop offset="1" stopColor="#b08d57" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gitter + Achse links */}
        {ticks.map((v) => (
          <g key={v}>
            <line className="gitter" x1={L} x2={breite - R} y1={y(v)} y2={y(v)} strokeDasharray={v === 0 ? undefined : '2 4'} />
            <text className="achse" x={L - 10} y={y(v) + 3.5} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <text className="a-lane-label" x={0} y={T + 10}>
          Besucher
        </text>

        {/* Vorperiode gestrichelt, aktuelle Periode als Fläche */}
        {vorPkt.length > 1 && <path d={kurve(vorPkt)} fill="none" stroke="#a9a49a" strokeWidth="1.4" strokeDasharray="4 5" />}
        <path d={flaeche} fill="url(#rw-flaeche)" />
        <path d={linie} fill="none" stroke="#101010" strokeWidth="2" strokeLinejoin="round" />

        {/* X-Achse */}
        {tage.map((d, i) =>
          (i % schritt === 0 && n - 1 - i >= schritt / 2) || i === n - 1 ? (
            <text key={d.tag} className="achse" x={x(i)} y={T + HA + 18} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {fmtTag(d.tag)}
            </text>
          ) : null,
        )}

        {/* Kontakt-Bahnen übereinander */}
        {BAHNEN.map((b, bi) => {
          const y0 = ob + bi * BAHN;
          const werte = tage.map((d) => d[b.key]);
          const bmax = Math.max(1, ...werte);
          const total = werte.reduce((s, v) => s + v, 0);
          return (
            <g key={b.key}>
              <line className="gitter" x1={L} x2={breite - R} y1={y0 + BAHN - 6} y2={y0 + BAHN - 6} />
              <rect x={0} y={y0 + BAHN / 2 - 8} width={4} height={10} fill={b.farbe} />
              <text className="a-lane-label" x={10} y={y0 + BAHN / 2 + 1}>
                {schmal ? b.label.replace('Terminanfragen', 'Termine') : b.label}
              </text>
              <text className="a-lane-summe" x={breite - R + 16} y={y0 + BAHN / 2 + 1}>
                {total}
              </text>
              {werte.map((v, i) => {
                const h = v ? Math.max(4, (v / bmax) * (BAHN - 12)) : 0;
                return v ? (
                  <rect key={i} x={x(i) - balkenB / 2} y={y0 + BAHN - 6 - h} width={balkenB} height={h} fill={b.farbe} opacity={aktiv === null || aktiv === i ? 1 : 0.35} />
                ) : (
                  <circle key={i} cx={x(i)} cy={y0 + BAHN - 6} r={1.2} fill="#d6d3cc" />
                );
              })}
            </g>
          );
        })}

        {/* Fadenkreuz */}
        {aktiv !== null && (
          <g pointerEvents="none">
            <line x1={x(aktiv)} x2={x(aktiv)} y1={T} y2={H - 6} stroke="#101010" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <circle cx={x(aktiv)} cy={y(tage[aktiv].besucher)} r={5} fill="#fff" stroke="#101010" strokeWidth="2" />
          </g>
        )}
      </svg>

      {t && aktiv !== null && (
        <div className="a-tip" style={{ left: Math.min(Math.max(x(aktiv), 110), breite - 110), top: 8 }}>
          <b>{fmtTag(t.tag, true)}</b>
          <div>
            <span>
              <i style={{ background: '#b08d57' }} /> Besucher
            </span>
            <strong>{t.besucher}</strong>
          </div>
          <div>
            <span>
              <i style={{ background: '#a9a49a' }} /> Vorperiode
            </span>
            <strong>{vorTage[aktiv]?.besucher ?? 0}</strong>
          </div>
          {BAHNEN.map((b) => (
            <div key={b.key}>
              <span>
                <i style={{ background: b.farbe === '#101010' ? '#fff' : b.farbe }} /> {b.label}
              </span>
              <strong>{t[b.key]}</strong>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 6, paddingTop: 6 }}>
            <span>Kontaktquote</span>
            <strong>{t.besucher ? `${((kontakteTag / t.besucher) * 100).toFixed(1)} %` : '–'}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
