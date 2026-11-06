'use client';
// Eigener Datums-Picker (kein <input type="date">): Knopf mit Datum, Kalender im Panel, Schnellwahl-Chips.
// Wert als «YYYY-MM-DD» (Zürcher Kalendertag) oder null.
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const pad = (n: number) => String(n).padStart(2, '0');
const heuteIso = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' });
const plusTage = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const datumLang = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function DatumPicker({
  wert,
  onChange,
  label,
  leer = 'Datum wählen',
  schnell = [
    ['Heute', 0],
    ['+1 Woche', 7],
    ['+4 Wochen', 28],
  ],
  abHeute = false,
  entfernbar = true,
  klein,
  warnen,
}: {
  wert: string | null;
  onChange: (iso: string | null) => void;
  label?: string;
  leer?: string;
  schnell?: [string, number][];
  abHeute?: boolean;
  entfernbar?: boolean;
  klein?: boolean;
  /** z. B. Liefertermin nach dem Anlass → Hinweisfarbe */
  warnen?: boolean;
}) {
  const [offen, setOffen] = useState(false);
  const [monat, setMonat] = useState((wert ?? heuteIso()).slice(0, 7));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!offen) return;
    setMonat((wert ?? heuteIso()).slice(0, 7));
    const zu = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOffen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOffen(false);
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', zu);
      document.removeEventListener('keydown', esc);
    };
  }, [offen, wert]);

  const [j, m] = monat.split('-').map(Number);
  const erster = (new Date(Date.UTC(j, m - 1, 1)).getUTCDay() + 6) % 7;
  const tage = new Date(Date.UTC(j, m, 0)).getUTCDate();
  const name = new Date(Date.UTC(j, m - 1, 15)).toLocaleDateString('de-CH', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const heute = heuteIso();
  const verschiebe = (d: number) => {
    const n = new Date(Date.UTC(j, m - 1 + d, 1));
    setMonat(`${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}`);
  };
  const waehle = (iso: string | null) => {
    onChange(iso);
    setOffen(false);
  };

  return (
    <div className={`a-datum${klein ? ' klein' : ''}`} ref={ref}>
      {label && <span className="a-datum-label">{label}</span>}
      <button type="button" className={`a-datum-knopf${wert ? '' : ' leer'}${warnen ? ' warnen' : ''}`} aria-expanded={offen} aria-haspopup="dialog" onClick={() => setOffen(!offen)}>
        <Icon name="kalender" />
        <span className="zahl">{wert ? datumLang(wert) : leer}</span>
      </button>
      {offen && (
        <div className="a-datum-panel" role="dialog" aria-label={label ?? 'Datum wählen'}>
          <div className="a-kal-kopf">
            <button type="button" onClick={() => verschiebe(-1)} aria-label="Vorheriger Monat">
              <Icon name="pfeilLinks" />
            </button>
            <b>{name}</b>
            <button type="button" onClick={() => verschiebe(1)} aria-label="Nächster Monat">
              <Icon name="pfeilRechts" />
            </button>
          </div>
          <div className="a-kal-raster">
            {WT.map((w) => (
              <div key={w} className="a-kal-wt">
                {w}
              </div>
            ))}
            {Array.from({ length: erster }).map((_, i) => (
              <div key={`l${i}`} />
            ))}
            {Array.from({ length: tage }).map((_, i) => {
              const iso = `${monat}-${pad(i + 1)}`;
              const gesperrt = abHeute && iso < heute;
              return (
                <button key={iso} type="button" className={`a-kal-tag${iso === heute ? ' heute' : ''}`} disabled={gesperrt} aria-pressed={iso === wert} onClick={() => waehle(iso)}>
                  <span className="zahl">{i + 1}</span>
                </button>
              );
            })}
          </div>
          <div className="a-datum-schnell">
            {schnell.map(([l, n]) => (
              <button key={l} type="button" className="a-chip klein" onClick={() => waehle(plusTage(heute, n))}>
                {l}
              </button>
            ))}
            {entfernbar && wert && (
              <button type="button" className="a-chip klein" onClick={() => waehle(null)}>
                Entfernen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
