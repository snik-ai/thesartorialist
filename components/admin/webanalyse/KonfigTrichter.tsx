'use client';
// Konfigurator Schritt für Schritt: jede Stufe als Zeile mit Balken (100 % = geöffnet), Anteil am Start,
// Übergang von der vorigen Stufe und wie viele dort verloren gingen. Je Gerät über die Chips.
// Die Stufen sind nicht zwingend Teilmengen (Reiter-Sprünge) — darum zeigt jede Zeile die echte Zahl.
import { useMemo, useState } from 'react';
import type { KonfigAnalyse, KStufe } from '@/lib/crm/konfiganalyse';
import { zahl } from './format';

const pct = (t: number, g: number) => (g > 0 ? (t / g) * 100 : null);
const p = (v: number | null) => (v === null ? '–' : `${v.toFixed(v < 10 && v > 0 ? 1 : 0)} %`);

/** Welche Stufen eine Gruppe bilden (für die Zwischenlinien) */
const GRUPPE = (s: string) => (s === 'offen' || s === 'start' ? 'a' : s.startsWith('kat_') || s === 'stoff' || s === 'uebersicht' ? 'b' : 'c');

export default function KonfigTrichter({ trichter, vorher, geraete }: { trichter: KStufe[]; vorher: KStufe[]; geraete: KonfigAnalyse['trichterGeraete'] }) {
  const [geraet, setGeraet] = useState('alle');
  const liste = geraete.filter((g) => (g.stufen[0]?.wert ?? 0) > 0);
  const stufen = useMemo(() => (geraet === 'alle' ? trichter : (liste.find((g) => g.geraet === geraet)?.stufen ?? trichter)), [geraet, trichter, liste]);
  const start = stufen[0]?.wert ?? 0;

  return (
    <div className="wa-kt">
      {liste.length > 1 && (
        <div className="a-chips wa-trichter-chips" role="group" aria-label="Gerät">
          <button type="button" className="a-chip klein" aria-pressed={geraet === 'alle'} onClick={() => setGeraet('alle')}>
            Alle Geräte <span className="zahl">{zahl(trichter[0]?.wert ?? 0)}</span>
          </button>
          {liste.map((g) => (
            <button key={g.geraet} type="button" className="a-chip klein" aria-pressed={geraet === g.geraet} onClick={() => setGeraet(g.geraet)}>
              {g.label} <span className="zahl">{zahl(g.stufen[0]?.wert ?? 0)}</span>
            </button>
          ))}
        </div>
      )}
      {start === 0 ? (
        <p className="a-sub wa-leer">Im Zeitraum hat niemand den Konfigurator geöffnet.</p>
      ) : (
        <ol className="wa-kt-liste">
          <li className="wa-kt-kopf" aria-hidden>
            <span>Stufe</span>
            <span>Sitzungen · Anteil an «geöffnet»</span>
            <span className="r">von voriger Stufe</span>
            <span className="r">Vorperiode</span>
          </li>
          {stufen.map((s, i) => {
            const vor = stufen[i - 1];
            const anteil = pct(s.wert, start) ?? 0;
            const weiter = vor ? pct(s.wert, vor.wert) : null;
            const verlust = vor ? vor.wert - s.wert : 0;
            const v = geraet === 'alle' ? vorher[i]?.wert : undefined;
            const d = v ? ((s.wert - v) / v) * 100 : null;
            const neueGruppe = vor && GRUPPE(vor.stufe) !== GRUPPE(s.stufe);
            const ziel = s.stufe === 'anfrage';
            return (
              <li key={s.stufe} className={`${neueGruppe ? 'trenner' : ''}${ziel ? ' ziel' : ''}`}>
                <span className="wa-kt-name">
                  <i className="zahl">{String(i + 1).padStart(2, '0')}</i>
                  {s.label}
                </span>
                <span className="wa-kt-spur" title={`${s.wert} Sitzungen`}>
                  <b style={{ width: `${Math.max(s.wert ? 1.2 : 0, Math.min(100, anteil))}%` }} />
                  <em className="zahl">
                    <strong>{zahl(s.wert)}</strong> · {i === 0 ? '100 %' : p(anteil)}
                  </em>
                </span>
                <span className="wa-kt-weiter zahl r">
                  {weiter === null ? (
                    <span className="leer">Start</span>
                  ) : weiter > 100 ? (
                    // mehr als die vorige Stufe (Sprung per Reiter): kein Prozentwert, nur die Differenz
                    <span className="leer">+{zahl(-verlust)}</span>
                  ) : (
                    <>
                      <span className={weiter >= 100 ? 'auf' : weiter < 50 ? 'ab' : ''}>{p(weiter)}</span>
                      {verlust > 0 ? <small>−{zahl(verlust)}</small> : null}
                    </>
                  )}
                </span>
                <span className="wa-kt-vorher zahl r">
                  {geraet !== 'alle' ? (
                    <span className="leer">–</span>
                  ) : d === null ? (
                    <span className="leer">{v === 0 && s.wert > 0 ? 'neu' : '–'}</span>
                  ) : (
                    <span className={d >= 0 ? 'auf' : 'ab'}>
                      {d >= 0 ? '▲' : '▼'} {Math.abs(d).toFixed(0)} %
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
