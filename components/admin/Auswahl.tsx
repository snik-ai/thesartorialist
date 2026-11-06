'use client';
// Eigenes Auswahl-Panel (kein <select>): Knopf zeigt die Wahl, Panel mit Suche, Tastatur (↑ ↓ Enter Esc), Häkchen.
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';

export type Option = { wert: string; label: string; sub?: string };

export default function Auswahl({
  optionen,
  wert,
  onChange,
  platzhalter = 'Auswählen',
  suche = optionen.length > 7,
  label,
  leerOption,
  klein,
}: {
  optionen: Option[];
  wert: string | null;
  onChange: (wert: string | null) => void;
  platzhalter?: string;
  suche?: boolean;
  label?: string;
  /** z. B. «Niemand» → wählt null */
  leerOption?: string;
  klein?: boolean;
}) {
  const [offen, setOffen] = useState(false);
  const [q, setQ] = useState('');
  const [aktiv, setAktiv] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const eingabe = useRef<HTMLInputElement>(null);
  const liste = useMemo(() => {
    const t = q.trim().toLowerCase();
    const o = t ? optionen.filter((x) => `${x.label} ${x.sub ?? ''}`.toLowerCase().includes(t)) : optionen;
    return leerOption && !t ? [{ wert: '', label: leerOption }, ...o] : o;
  }, [q, optionen, leerOption]);
  const gewaehlt = optionen.find((o) => o.wert === wert);

  useEffect(() => {
    if (!offen) return;
    setQ('');
    setAktiv(Math.max(0, liste.findIndex((o) => o.wert === (wert ?? ''))));
    setTimeout(() => eingabe.current?.focus(), 10);
    const zu = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOffen(false);
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offen]);

  const waehle = (o: Option) => {
    onChange(o.wert || null);
    setOffen(false);
  };
  const taste = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOffen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAktiv((a) => Math.min(liste.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAktiv((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && liste[aktiv]) {
      e.preventDefault();
      waehle(liste[aktiv]);
    }
  };

  return (
    <div className={`a-auswahl${klein ? ' klein' : ''}`} ref={ref} onKeyDown={offen ? taste : undefined}>
      {label && <span className="a-datum-label">{label}</span>}
      <button type="button" className={`a-auswahl-knopf${gewaehlt ? '' : ' leer'}`} aria-haspopup="listbox" aria-expanded={offen} onClick={() => setOffen(!offen)}>
        <span>{gewaehlt ? gewaehlt.label : platzhalter}</span>
        <Icon name="pfeilRechts" className="pfeil" />
      </button>
      {offen && (
        <div className="a-auswahl-panel">
          {suche && (
            <div className="a-suche">
              <Icon name="suche" />
              <input ref={eingabe} className="a-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen …" aria-label="Suchen" />
            </div>
          )}
          <ul role="listbox" tabIndex={-1}>
            {liste.length === 0 && <li className="a-auswahl-leer">Keine Treffer</li>}
            {liste.map((o, i) => (
              <li key={o.wert || '_'} role="option" aria-selected={o.wert === (wert ?? '')} className={i === aktiv ? 'aktiv' : ''} onMouseEnter={() => setAktiv(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => waehle(o)}>
                <span>
                  {o.label}
                  {o.sub && <small>{o.sub}</small>}
                </span>
                {o.wert === (wert ?? '') && <Icon name="check" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
