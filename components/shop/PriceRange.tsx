'use client';

// Preis-Filter (aus Versaloro): Verteilungs-Histogramm, zwei Griffe mit Wert-Bubble,
// Eingabefelder für Min/Max und Schnellwahl-Chips. Übernommen wird beim Loslassen.
import { useEffect, useMemo, useRef, useState } from 'react';
import { chf } from '@/lib/shop/format';

type Props = {
  bounds: [number, number];
  prices: number[];
  value: [number, number] | null;
  onChange: (v: [number, number] | null) => void;
};

const BINS = 24;
const STEP = 10;
const fmt = (n: number) => n.toLocaleString('de-CH').replace(/’/g, "'");
const QUICK: { label: string; range: [number, number | null] }[] = [
  { label: 'bis CHF 300', range: [0, 300] },
  { label: 'CHF 300–700', range: [300, 700] },
  { label: 'ab CHF 700', range: [700, null] },
];

export default function PriceRange({ bounds, prices, value, onChange }: Props) {
  const lo0 = Math.floor(bounds[0] / STEP) * STEP;
  const hi0 = Math.ceil(bounds[1] / STEP) * STEP;
  const [v, setV] = useState<[number, number]>(value ?? [lo0, hi0]);
  const [drag, setDrag] = useState<0 | 1 | null>(null);
  const [text, setText] = useState<[string, string]>(['', '']);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => setV(value ?? [lo0, hi0]), [value, lo0, hi0]);
  useEffect(() => setText([fmt(v[0]), fmt(v[1])]), [v]);

  const span = Math.max(STEP, hi0 - lo0);
  const pct = (n: number) => ((n - lo0) / span) * 100;
  const bins = useMemo(() => {
    const b = Array<number>(BINS).fill(0);
    prices.forEach((p) => (b[Math.min(BINS - 1, Math.max(0, Math.floor(((p - lo0) / span) * BINS)))] += 1));
    const max = Math.max(1, ...b);
    return b.map((n) => (n ? n / max : 0));
  }, [prices, lo0, span]);

  const commit = (next: [number, number]) => onChange(next[0] <= lo0 && next[1] >= hi0 ? null : next);
  const fromX = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.round((lo0 + Math.min(1, Math.max(0, (x - r.left) / r.width)) * span) / STEP) * STEP;
  };
  const move = (i: 0 | 1, n: number, cur = v): [number, number] =>
    i === 0 ? [Math.min(Math.max(lo0, n), cur[1] - STEP), cur[1]] : [cur[0], Math.max(Math.min(hi0, n), cur[0] + STEP)];

  const onDown = (e: React.PointerEvent) => {
    const n = fromX(e.clientX);
    const i: 0 | 1 = Math.abs(n - v[0]) <= Math.abs(n - v[1]) ? 0 : 1;
    setDrag(i);
    setV(move(i, n));
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag !== null) setV(move(drag, fromX(e.clientX)));
  };
  const onUp = () => {
    if (drag !== null) {
      setDrag(null);
      commit(v);
    }
  };
  const onKey = (i: 0 | 1) => (e: React.KeyboardEvent) => {
    const d = ({ ArrowLeft: -STEP, ArrowDown: -STEP, ArrowRight: STEP, ArrowUp: STEP, PageDown: -100, PageUp: 100 } as Record<string, number>)[e.key];
    if (d === undefined) return;
    e.preventDefault();
    const next = move(i, v[i] + d);
    setV(next);
    commit(next);
  };
  const fromText = (i: 0 | 1) => {
    const n = parseInt(text[i].replace(/[^\d]/g, ''), 10);
    if (Number.isFinite(n)) {
      const next = move(i, n);
      setV(next);
      commit(next);
    } else setText([fmt(v[0]), fmt(v[1])]);
  };
  const countIn = (a: number, b: number) => prices.filter((p) => p >= a && p <= b).length;
  const inRange = countIn(v[0], v[1]);

  return (
    <div className="prange">
      <div className="prange-hist" aria-hidden="true">
        {bins.map((h, i) => {
          const mid = lo0 + ((i + 0.5) / BINS) * span;
          return <span key={i} className={h && mid >= v[0] && mid <= v[1] ? 'is-in' : ''} style={{ height: `${Math.max(5, h * 100)}%` }} />;
        })}
      </div>
      <div className="prange-track" ref={track} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="prange-rail" />
        <span className="prange-fill" style={{ left: `${pct(v[0])}%`, right: `${100 - pct(v[1])}%` }} />
        {([0, 1] as const).map((i) => (
          <button
            key={i}
            type="button"
            role="slider"
            className={`prange-thumb${drag === i ? ' is-drag' : ''}`}
            style={{ left: `${pct(v[i])}%` }}
            aria-label={i === 0 ? 'Mindestpreis' : 'Höchstpreis'}
            aria-valuemin={lo0}
            aria-valuemax={hi0}
            aria-valuenow={v[i]}
            aria-valuetext={chf(v[i])}
            onKeyDown={onKey(i)}
          >
            <span className="prange-bubble num">{chf(v[i])}</span>
          </button>
        ))}
      </div>
      <div className="prange-fields">
        {([0, 1] as const).map((i) => (
          <label key={i} className="pfield">
            <span className="pfield-kicker">{i === 0 ? 'Min' : 'Max'}</span>
            <span className="pfield-row">
              <span className="pfield-unit">CHF</span>
              <input
                inputMode="numeric"
                className="num"
                value={text[i]}
                onChange={(e) => setText(i === 0 ? [e.target.value, text[1]] : [text[0], e.target.value])}
                onBlur={() => fromText(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fromText(i);
                }}
                aria-label={i === 0 ? 'Mindestpreis in CHF' : 'Höchstpreis in CHF'}
              />
            </span>
          </label>
        ))}
      </div>
      <div className="pills">
        {QUICK.map((q) => {
          const r: [number, number] = [Math.max(lo0, q.range[0]), Math.min(hi0, q.range[1] ?? hi0)];
          const on = value?.[0] === r[0] && value?.[1] === r[1];
          const n = countIn(r[0], r[1]);
          return (
            <button key={q.label} type="button" className={`pill${on ? ' is-on' : ''}`} aria-pressed={on} disabled={n === 0 && !on} onClick={() => (on ? onChange(null) : commit(r))}>
              {q.label}
              <span className="num">{n}</span>
            </button>
          );
        })}
      </div>
      <p className="prange-note num" aria-live="polite">
        {inRange} {inRange === 1 ? 'Stück' : 'Stücke'} in diesem Bereich
      </p>
    </div>
  );
}
