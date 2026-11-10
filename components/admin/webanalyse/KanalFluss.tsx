'use client';
// Woher die Kontakte kommen: Fluss (Sankey) vom Kanal zur ersten Kontaktart der Sitzung. Jede Sitzung mit
// Kontakt zählt genau einmal; die Bandbreite ist die Zahl dieser Sitzungen. Sitzungen ohne Kontakt fliessen
// bewusst nicht mit (sie wären fast das ganze Bild) — ihre Quote steht als Conversion-Rate neben dem Kanal.
import { useEffect, useRef, useState } from 'react';
import type { Uebersicht } from '@/lib/crm/webanalyse';
import { KONTAKTARTEN } from '@/lib/crm/bahnen';
import { quote, zahl } from './format';

const LUECKE = 12;
const KNOTEN = 10;

export default function KanalFluss({ fluss, kanaele }: { fluss: Uebersicht['fluss']; kanaele: Uebersicht['kanaele'] }) {
  const box = useRef<HTMLDivElement>(null);
  const [breite, setBreite] = useState(640);
  const [fokus, setFokus] = useState<string | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBreite(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mit = fluss.filter((f) => f.kontakt !== 'keiner' && f.sitzungen > 0);
  const total = mit.reduce((s, f) => s + f.sitzungen, 0);
  if (!total) return <p className="a-sub">Noch keine Sitzungen mit Kontakt in diesem Zeitraum — sobald jemand anruft, schreibt oder anfragt, erscheint hier der Weg dorthin.</p>;

  const schmal = breite < 560;
  const LB = schmal ? 104 : 168;
  const RB = schmal ? 92 : 132;
  const links = [...new Set(mit.map((f) => f.kanal))]
    .map((k) => ({ id: k, label: mit.find((f) => f.kanal === k)!.kanalLabel, wert: mit.filter((f) => f.kanal === k).reduce((s, f) => s + f.sitzungen, 0) }))
    .sort((a, b) => b.wert - a.wert);
  const rechts = KONTAKTARTEN.map((k) => ({ id: k.key, label: k.label, farbe: k.farbe, wert: mit.filter((f) => f.kontakt === k.key).reduce((s, f) => s + f.sitzungen, 0) })).filter((r) => r.wert > 0);
  // Bandhöhen proportional; jeder Knoten bekommt aber mindestens Platz für seine zwei Textzeilen
  const skala = 220 / total;
  const SLOT = 30;
  const hoehe = <T extends { wert: number }>(l: T[]) => l.reduce((s, k) => s + Math.max(SLOT, k.wert * skala), 0) + LUECKE * (l.length - 1);
  const H = Math.max(200, hoehe(links), hoehe(rechts)) + 4;
  const stapel = <T extends { wert: number }>(l: T[]) => {
    let y = (H - hoehe(l)) / 2;
    return l.map((k) => {
      const h = Math.max(3, k.wert * skala);
      const slot = Math.max(SLOT, h);
      const r = { ...k, y: y + (slot - h) / 2, h };
      y += slot + LUECKE;
      return r;
    });
  };
  const L = stapel(links);
  const R = stapel(rechts);
  const x0 = LB + KNOTEN;
  const x1 = breite - RB - KNOTEN;
  const offL = new Map(L.map((k) => [k.id, k.y]));
  const offR = new Map(R.map((k) => [k.id, k.y]));
  const baender = L.flatMap((l) =>
    R.map((r) => {
      const w = mit.filter((f) => f.kanal === l.id && f.kontakt === r.id).reduce((s, f) => s + f.sitzungen, 0);
      if (!w) return null;
      const h = Math.max(1.5, (w / l.wert) * l.h);
      const hr = Math.max(1.5, (w / r.wert) * r.h);
      const ya = offL.get(l.id)!;
      const yb = offR.get(r.id)!;
      offL.set(l.id, ya + h);
      offR.set(r.id, yb + hr);
      const m = (x0 + x1) / 2;
      const d = `M${x0} ${ya}C${m} ${ya} ${m} ${yb} ${x1} ${yb}L${x1} ${yb + hr}C${m} ${yb + hr} ${m} ${ya + h} ${x0} ${ya + h}Z`;
      return { key: `${l.id}-${r.id}`, d, farbe: r.farbe, l: l.id, r: r.id, w, titel: `${l.label} → ${r.label}: ${w}` };
    }),
  ).filter(Boolean) as { key: string; d: string; farbe: string; l: string; r: string; w: number; titel: string }[];

  const rate = (k: string) => kanaele.find((x) => x.schluessel === k)?.conversionRate ?? null;

  return (
    <div className="a-chart wa-fluss" ref={box}>
      <svg viewBox={`0 0 ${breite} ${H}`} width={breite} height={H} role="img" aria-label="Fluss vom Kanal zur Kontaktart" onPointerLeave={() => setFokus(null)}>
        {baender.map((b) => (
          <path
            key={b.key}
            d={b.d}
            fill={b.farbe}
            opacity={fokus === null ? 0.32 : fokus === b.l || fokus === b.r ? 0.62 : 0.08}
            onPointerEnter={() => setFokus(b.l)}
            style={{ transition: 'opacity .2s' }}
          >
            <title>{b.titel}</title>
          </path>
        ))}
        {L.map((k) => (
          <g key={k.id} onPointerEnter={() => setFokus(k.id)} style={{ cursor: 'default' }}>
            <rect x={LB} y={k.y} width={KNOTEN} height={k.h} fill="#101010" />
            <text className="wa-fluss-label" x={LB - 10} y={k.y + k.h / 2 - 2} textAnchor="end">
              {k.label.length > (schmal ? 13 : 24) ? `${k.label.slice(0, schmal ? 12 : 23)}…` : k.label}
            </text>
            <text className="wa-fluss-zahl" x={LB - 10} y={k.y + k.h / 2 + 12} textAnchor="end">
              {zahl(k.wert)} · {quote(rate(k.id))}
            </text>
          </g>
        ))}
        {R.map((k) => (
          <g key={k.id} onPointerEnter={() => setFokus(k.id)}>
            <rect x={breite - RB - KNOTEN} y={k.y} width={KNOTEN} height={k.h} fill={k.farbe} />
            <text className="wa-fluss-label" x={breite - RB + 8} y={k.y + k.h / 2 - 2}>
              {schmal ? KONTAKTARTEN.find((x) => x.key === k.id)!.kurz : k.label}
            </text>
            <text className="wa-fluss-zahl" x={breite - RB + 8} y={k.y + k.h / 2 + 12}>
              {zahl(k.wert)} · {Math.round((k.wert / total) * 100)} %
            </text>
          </g>
        ))}
      </svg>
      <p className="a-sub wa-fussnote">
        {zahl(total)} Sitzungen mit Kontakt. Links: Kanal mit Sitzungen mit Kontakt · Conversion-Rate des Kanals. Rechts: erste Kontaktart der Sitzung.
      </p>
    </div>
  );
}
