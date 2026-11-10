'use client';
// Wann die Leute kommen — und wann sie Kontakt aufnehmen: Wochentag × Stunde (Zürcher Zeit), eine Goldrampe
// von hell nach kräftig. Umschaltbar Sitzungen/Kontakte; rechts und unten die Summen je Tag und je Stunde.
import { useMemo, useState } from 'react';
import type { Uebersicht } from '@/lib/crm/webanalyse';
import { zahl } from './format';

const TAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const TAGE_LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
type Mass = 'sitzungen' | 'kontakte';

export default function Wochenraster({ heatmap }: { heatmap: Uebersicht['heatmap'] }) {
  const [mass, setMass] = useState<Mass>('sitzungen');
  const { raster, max, jeTag, jeStunde, spitze } = useMemo(() => {
    const raster = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
    for (const z of heatmap) if (z.tag >= 1 && z.tag <= 7 && z.stunde >= 0 && z.stunde < 24) raster[z.tag - 1][z.stunde] = z[mass];
    const jeTag = raster.map((r) => r.reduce((s, w) => s + w, 0));
    const jeStunde = Array.from({ length: 24 }, (_, h) => raster.reduce((s, r) => s + r[h], 0));
    let spitze: { tag: number; stunde: number; wert: number } | null = null;
    raster.forEach((r, t) => r.forEach((w, h) => (w > 0 && (!spitze || w > spitze.wert) ? (spitze = { tag: t, stunde: h, wert: w }) : null)));
    return { raster, max: Math.max(1, ...raster.flat()), jeTag, jeStunde, spitze: spitze as { tag: number; stunde: number; wert: number } | null };
  }, [heatmap, mass]);
  const maxTag = Math.max(1, ...jeTag);
  const maxStunde = Math.max(1, ...jeStunde);
  const stufe = (w: number) => (w === 0 ? 0 : Math.min(5, Math.ceil((w / max) * 5)));

  return (
    <div className="wa-woche">
      <div className="wa-woche-kopf">
        <div className="wa-seg" role="group" aria-label="Wochenraster zeigt">
          <button type="button" aria-pressed={mass === 'sitzungen'} onClick={() => setMass('sitzungen')}>
            Besuche
          </button>
          <button type="button" aria-pressed={mass === 'kontakte'} onClick={() => setMass('kontakte')}>
            Kontakte
          </button>
        </div>
        <p className="a-sub">
          {spitze ? (
            <>
              Am meisten {mass === 'sitzungen' ? 'Besuche' : 'Kontakte'}: <b>{TAGE_LANG[spitze.tag]}, {String(spitze.stunde).padStart(2, '0')}–{String(spitze.stunde + 1).padStart(2, '0')} Uhr</b> ({zahl(spitze.wert)})
            </>
          ) : (
            'Noch keine Daten in diesem Zeitraum.'
          )}
        </p>
      </div>
      <div className="wa-woche-scroll">
        <div className="wa-woche-raster" role="table" aria-label={`${mass === 'sitzungen' ? 'Besuche' : 'Kontakte'} nach Wochentag und Stunde`}>
          {raster.map((r, t) => (
            <div className="zeile" role="row" key={t}>
              <span className="tag" role="rowheader">
                {TAGE[t]}
              </span>
              {r.map((w, h) => (
                <i key={h} role="cell" className={`s${stufe(w)}`} title={`${TAGE_LANG[t]} ${String(h).padStart(2, '0')}:00 – ${zahl(w)}`} aria-label={`${TAGE_LANG[t]} ${h} Uhr: ${w}`} />
              ))}
              <span className="summe" role="cell">
                <b style={{ width: `${(jeTag[t] / maxTag) * 100}%` }} />
                <em className="zahl">{zahl(jeTag[t])}</em>
              </span>
            </div>
          ))}
          <div className="zeile fuss" aria-hidden>
            <span className="tag" />
            {jeStunde.map((w, h) => (
              <i key={h} className="stunde">
                <b style={{ height: `${(w / maxStunde) * 100}%` }} />
              </i>
            ))}
            <span className="summe" />
          </div>
          <div className="zeile achse" aria-hidden>
            <span className="tag" />
            {Array.from({ length: 24 }, (_, h) => (
              <i key={h} className="std">
                {h % 3 === 0 ? String(h).padStart(2, '0') : ''}
              </i>
            ))}
            <span className="summe" />
          </div>
        </div>
      </div>
      <div className="wa-rampe" aria-hidden>
        <span>weniger</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <i key={s} className={`s${s}`} />
        ))}
        <span>mehr</span>
      </div>
    </div>
  );
}
