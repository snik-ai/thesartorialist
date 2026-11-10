'use client';
// Hauptverlauf: Besuche als weiche Goldfläche (gestrichelt die Vorperiode an derselben Stelle), darunter alle
// Kontaktarten als eigene Bahnen auf derselben Zeitachse — Anrufe, Terminanfragen, Konfigurator, Rückrufe,
// E-Mail, WhatsApp. Umschaltbar Besucher/Sitzungen/Seitenaufrufe. Fadenkreuz mit Tooltip (Tastatur ←/→),
// ein Klick auf einen Tag zeigt diesen Tag stündlich (Zeitraum in der URL).
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Uebersicht } from '@/lib/crm/webanalyse';
import { BESUCH_FARBE, KONTAKTARTEN, LINIE_FARBE, VORPERIODE_FARBE } from '@/lib/crm/bahnen';
import { eimerText, zahl } from './format';

type Verkehr = 'besucher' | 'sitzungen' | 'aufrufe';
const VERKEHR: { id: Verkehr; label: string }[] = [
  { id: 'besucher', label: 'Besucher' },
  { id: 'sitzungen', label: 'Sitzungen' },
  { id: 'aufrufe', label: 'Seitenaufrufe' },
];

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
  // Durch 4 teilbar, damit die Viertel-Linien ganze Zahlen tragen
  for (const g of [4, 8, 12, 20, 40, 60, 80, 100]) if (v <= g) return g;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const f of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (f * p >= v) return f * p;
  return 10 * p;
}

export default function Verlauf({ punkte, aufloesung }: { punkte: Uebersicht['verlauf']; aufloesung: 'stunde' | 'tag' }) {
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pfad = usePathname();
  const [breite, setBreite] = useState(900);
  const [aktiv, setAktiv] = useState<number | null>(null);
  const [verkehr, setVerkehr] = useState<Verkehr>('besucher');

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBreite(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const schmal = breite < 640;
  const L = schmal ? 70 : 118;
  const R = schmal ? 30 : 56;
  const HA = schmal ? 160 : 220;
  const BAHN = schmal ? 28 : 34;
  const T = 12;
  const ACHSE = 26;
  const ob = T + HA + ACHSE;
  const H = ob + KONTAKTARTEN.length * BAHN + 10;
  const n = punkte.length;
  const innen = breite - L - R;
  const x = (i: number) => L + (n <= 1 ? innen / 2 : (i / (n - 1)) * innen);
  const wert = (i: number) => punkte[i][verkehr];
  const vorWert = (i: number) => punkte[i].vorher?.[verkehr] ?? 0;
  const max = schoeneMax(Math.max(1, ...punkte.map((_, i) => Math.max(wert(i), vorWert(i)))));
  const y = (v: number) => T + HA - (v / max) * HA;

  const pkt = punkte.map((_, i) => [x(i), y(wert(i))] as [number, number]);
  const vorPkt = punkte.map((_, i) => [x(i), y(vorWert(i))] as [number, number]);
  const linie = kurve(pkt);
  const flaeche = `${linie}L${x(n - 1).toFixed(1)} ${T + HA}L${x(0).toFixed(1)} ${T + HA}Z`;
  const schritt = Math.max(1, Math.ceil(n / (schmal ? 4 : aufloesung === 'stunde' ? 12 : 10)));
  const balkenB = Math.max(2.5, Math.min(18, (innen / Math.max(1, n)) * 0.62));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const verkehrLabel = VERKEHR.find((v) => v.id === verkehr)!.label;

  const tipp = useRef<{ touch: boolean; zweiter: boolean }>({ touch: false, zweiter: false });
  function index(e: PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * breite;
    return Math.max(0, Math.min(n - 1, Math.round(((px - L) / innen) * (n - 1))));
  }
  function zeige(e: PointerEvent<SVGSVGElement>) {
    setAktiv(index(e));
  }
  function druck(e: PointerEvent<SVGSVGElement>) {
    // Auf dem Handy: erster Tipp zeigt den Tag, zweiter Tipp auf denselben Tag öffnet ihn
    const i = index(e);
    tipp.current = { touch: e.pointerType !== 'mouse', zweiter: aktiv === i };
    setAktiv(i);
  }
  function klick() {
    if (tipp.current.touch && !tipp.current.zweiter) return;
    oeffneTag(aktiv);
  }
  function oeffneTag(i: number | null) {
    if (i === null || aufloesung !== 'tag') return;
    const tag = punkte[i].schluessel;
    router.push(`${pfad}?zeitraum=frei&von=${tag}&bis=${tag}`, { scroll: false });
  }
  function taste(e: KeyboardEvent<SVGSVGElement>) {
    if (e.key === 'ArrowRight') setAktiv((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setAktiv((a) => Math.max(0, (a ?? n) - 1));
    else if (e.key === 'Escape') setAktiv(null);
    else if (e.key === 'Enter') oeffneTag(aktiv);
    else return;
    e.preventDefault();
  }

  const p = aktiv !== null ? punkte[aktiv] : null;
  const kontakteP = p ? KONTAKTARTEN.reduce((s, k) => s + p[k.key], 0) : 0;

  return (
    <>
      <div className="wa-verlauf-kopf">
        <div className="wa-seg" role="group" aria-label="Besuche messen als">
          {VERKEHR.map((v) => (
            <button key={v.id} type="button" aria-pressed={verkehr === v.id} onClick={() => setVerkehr(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="a-legende">
          <span>
            <i style={{ background: BESUCH_FARBE }} />
            {verkehrLabel}
          </span>
          <span>
            <i style={{ background: 'transparent', borderTop: `2px dashed ${VORPERIODE_FARBE}`, height: 0, width: 14, borderRadius: 0 }} />
            Vorperiode
          </span>
        </div>
      </div>
      <div className="a-chart" ref={box}>
        <svg
          viewBox={`0 0 ${breite} ${H}`}
          width={breite}
          height={H}
          role="img"
          aria-label={`${verkehrLabel} und Kontakte ${aufloesung === 'stunde' ? 'pro Stunde' : 'pro Tag'}`}
          tabIndex={0}
          onPointerMove={zeige}
          onPointerDown={druck}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setAktiv(null)}
          onClick={klick}
          onKeyDown={taste}
          style={{ touchAction: 'pan-y', outline: 'none', cursor: aufloesung === 'tag' ? 'pointer' : 'crosshair' }}
        >
          <defs>
            <linearGradient id="wa-flaeche" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={BESUCH_FARBE} stopOpacity="0.34" />
              <stop offset="1" stopColor={BESUCH_FARBE} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {ticks.map((v) => (
            <g key={v}>
              <line className="gitter" x1={L} x2={breite - R} y1={y(v)} y2={y(v)} strokeDasharray={v === 0 ? undefined : '2 4'} />
              <text className="achse" x={L - 10} y={y(v) + 3.5} textAnchor="end">
                {zahl(v)}
              </text>
            </g>
          ))}
          {!schmal && (
            <text className="a-lane-label" x={0} y={T + 10}>
              {verkehrLabel}
            </text>
          )}

          {n > 1 && <path d={kurve(vorPkt)} fill="none" stroke={VORPERIODE_FARBE} strokeWidth="1.4" strokeDasharray="4 5" />}
          {n > 1 && <path d={flaeche} fill="url(#wa-flaeche)" />}
          {n > 1 && <path d={linie} fill="none" stroke={LINIE_FARBE} strokeWidth="2" strokeLinejoin="round" />}
          {n === 1 && <circle cx={x(0)} cy={y(wert(0))} r={5} fill={LINIE_FARBE} />}

          {punkte.map((d, i) =>
            (i % schritt === 0 && n - 1 - i >= Math.max(2, schritt * 0.8)) || i === n - 1 ? (
              <text key={d.schluessel} className="achse" x={x(i)} y={T + HA + 18} textAnchor={n === 1 ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
                {schmal && !d.schluessel.includes('T') ? eimerText(d.schluessel).split(' ')[1] : eimerText(d.schluessel)}
              </text>
            ) : null,
          )}

          {KONTAKTARTEN.map((b, bi) => {
            const y0 = ob + bi * BAHN;
            const werte = punkte.map((d) => d[b.key]);
            const bmax = Math.max(1, ...werte);
            const total = werte.reduce((s, v) => s + v, 0);
            return (
              <g key={b.key}>
                <line className="gitter" x1={L} x2={breite - R} y1={y0 + BAHN - 6} y2={y0 + BAHN - 6} />
                <rect x={0} y={y0 + BAHN / 2 - 8} width={3} height={10} fill={b.farbe} />
                <text className="a-lane-label" x={9} y={y0 + BAHN / 2 + 1}>
                  {schmal ? b.kurz : b.label}
                </text>
                <text className="a-lane-summe" x={breite - R + (schmal ? 8 : 16)} y={y0 + BAHN / 2 + 1}>
                  {zahl(total)}
                </text>
                {werte.map((v, i) => {
                  const h = v ? Math.max(4, (v / bmax) * (BAHN - 12)) : 0;
                  return v ? (
                    <rect key={i} x={x(i) - balkenB / 2} y={y0 + BAHN - 6 - h} width={balkenB} height={h} fill={b.farbe} opacity={aktiv === null || aktiv === i ? 1 : 0.35} />
                  ) : n <= 60 ? (
                    <circle key={i} cx={x(i)} cy={y0 + BAHN - 6} r={1.2} fill="#d6d3cc" />
                  ) : null;
                })}
              </g>
            );
          })}

          {aktiv !== null && (
            <g pointerEvents="none">
              <line x1={x(aktiv)} x2={x(aktiv)} y1={T} y2={H - 6} stroke={LINIE_FARBE} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              <circle cx={x(aktiv)} cy={y(wert(aktiv))} r={5} fill="#fff" stroke={LINIE_FARBE} strokeWidth="2" />
            </g>
          )}
        </svg>

        {p && aktiv !== null && (
          <div className="a-tip" style={{ left: Math.min(Math.max(x(aktiv), 115), breite - 115), top: 8 }}>
            <b>{eimerText(p.schluessel, true)}</b>
            <div>
              <span>
                <i style={{ background: BESUCH_FARBE }} /> {verkehrLabel}
              </span>
              <strong>{zahl(p[verkehr])}</strong>
            </div>
            <div>
              <span>
                <i style={{ background: VORPERIODE_FARBE }} /> Vorperiode
              </span>
              <strong>{zahl(p.vorher?.[verkehr] ?? 0)}</strong>
            </div>
            {KONTAKTARTEN.map((b) => (
              <div key={b.key}>
                <span>
                  <i style={{ background: b.farbe === '#101010' ? '#fff' : b.farbe }} /> {b.label}
                </span>
                <strong>{zahl(p[b.key])}</strong>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 6, paddingTop: 6 }}>
              <span>Kontakte je 100 Besucher</span>
              <strong>{p.besucher ? ((kontakteP / p.besucher) * 100).toFixed(1) : '–'}</strong>
            </div>
            {aufloesung === 'tag' && <small className="wa-tip-hinweis">Klick (am Handy zweimal tippen) zeigt den Tag stündlich</small>}
          </div>
        )}
      </div>
    </>
  );
}
