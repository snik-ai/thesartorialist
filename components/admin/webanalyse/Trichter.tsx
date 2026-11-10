'use client';
// Trichter vom Besuch zum Kontakt: jede Stufe eine Säule vor ihrer Spur (100 % = alle Besuche), dazwischen
// das Band zur nächsten Stufe und der Abfall als Plakette. Darunter Zahl, Anteil am Start und Vergleich zur
// Vorperiode. Mit den Chips je Kanal ansehen.
import { useMemo, useState } from 'react';
import type { Stufe, Uebersicht } from '@/lib/crm/webanalyse';
import { zahl } from './format';

const pct = (t: number, g: number) => (g > 0 ? (t / g) * 100 : null);

export default function Trichter({ trichter, vorher, kanaele }: { trichter: Stufe[]; vorher: Stufe[]; kanaele: Uebersicht['trichterKanaele'] }) {
  const [kanal, setKanal] = useState('alle');
  const liste = kanaele.filter((k) => (k.stufen[0]?.wert ?? 0) > 0).slice(0, 6);
  const stufen = useMemo(() => (kanal === 'alle' ? trichter : liste.find((k) => k.kanal === kanal)?.stufen ?? trichter), [kanal, trichter, liste]);
  const start = stufen[0]?.wert ?? 0;

  return (
    <div className="wa-trichter">
      {liste.length > 1 && (
        <div className="a-chips wa-trichter-chips" role="group" aria-label="Kanal">
          <button type="button" className="a-chip klein" aria-pressed={kanal === 'alle'} onClick={() => setKanal('alle')}>
            Alle Kanäle
          </button>
          {liste.map((k) => (
            <button key={k.kanal} type="button" className="a-chip klein" aria-pressed={kanal === k.kanal} onClick={() => setKanal(k.kanal)}>
              {k.label}
            </button>
          ))}
        </div>
      )}
      {start === 0 ? (
        <p className="a-sub">Noch keine Besuche in diesem Zeitraum.</p>
      ) : (
        <ol className="wa-stufen">
          {stufen.map((s, i) => {
            const anteil = pct(s.wert, start) ?? 0;
            const naechste = stufen[i + 1];
            const weiter = naechste ? pct(naechste.wert, s.wert) : null;
            const v = kanal === 'alle' ? vorher[i]?.wert : undefined;
            const d = v ? ((s.wert - v) / v) * 100 : null;
            return (
              <li key={s.stufe}>
                <div className="wa-saeule" aria-hidden>
                  <i style={{ height: `${Math.max(1.5, anteil)}%` }} className={i === stufen.length - 1 ? 'ziel' : ''} />
                </div>
                {naechste && (
                  <span className="wa-abfall" title="Weiter zur nächsten Stufe">
                    {weiter === null ? '–' : `${weiter.toFixed(0)} % weiter`}
                  </span>
                )}
                <div className="wa-stufe-text">
                  <strong className="zahl">{zahl(s.wert)}</strong>
                  <span className="zahl">{i === 0 ? '100 %' : `${anteil.toFixed(anteil < 10 ? 1 : 0)} %`}</span>
                  <small>{s.label}</small>
                  {kanal === 'alle' && (
                    <em className={d === null ? '' : d >= 0 ? 'auf' : 'ab'}>{d === null ? 'keine Vergleichsbasis' : `${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)} %`}</em>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
