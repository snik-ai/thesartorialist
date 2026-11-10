'use client';
// Zeitraumwahl: Schnellwahl als Chips (Heute, Gestern, 7/30/90 Tage), Pfeile zum Blättern um genau die Länge
// des Bereichs und ein eigener Bereichs-Kalender (kein natives Datumsfeld): erster Klick = Anfang, zweiter =
// Ende, beim Überfahren Vorschau. Alles steht in der URL (?zeitraum=…&von=…&bis=…) — ein Blick ist teilbar.
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { bereichText } from './format';

const SCHNELL = [
  ['heute', 'Heute'],
  ['gestern', 'Gestern'],
  ['7', '7 Tage'],
  ['30', '30 Tage'],
  ['90', '90 Tage'],
] as const;
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const tagPlus = (t: string, n: number) => new Date(Date.parse(`${t}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const tageZwischen = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000) + 1;
const monatPlus = (m: string, n: number) => {
  const d = new Date(`${m}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 7);
};

function Monat({ monat, heute, von, bis, vorschau, onTag, onUeber }: { monat: string; heute: string; von: string | null; bis: string | null; vorschau: string | null; onTag: (t: string) => void; onUeber: (t: string | null) => void }) {
  const erster = `${monat}-01`;
  const wtErster = (new Date(`${erster}T00:00:00Z`).getUTCDay() + 6) % 7;
  const anzahl = new Date(Date.UTC(+monat.slice(0, 4), +monat.slice(5, 7), 0)).getUTCDate();
  const ende = bis ?? (von && vorschau ? (vorschau >= von ? vorschau : von) : von);
  const anfang = von && vorschau && !bis && vorschau < von ? vorschau : von;
  return (
    <div className="wa-monat">
      <b>
        {MONATE[+monat.slice(5, 7) - 1]} {monat.slice(0, 4)}
      </b>
      <div className="wa-monat-raster" onPointerLeave={() => onUeber(null)}>
        {WT.map((w) => (
          <span key={w} className="wt">
            {w}
          </span>
        ))}
        {Array.from({ length: wtErster }, (_, i) => (
          <span key={`l${i}`} />
        ))}
        {Array.from({ length: anzahl }, (_, i) => {
          const t = `${monat}-${String(i + 1).padStart(2, '0')}`;
          const zukunft = t > heute;
          const drin = anfang && ende && t >= anfang && t <= ende;
          const rand = t === anfang || t === ende;
          return (
            <button
              key={t}
              type="button"
              disabled={zukunft}
              className={`${drin ? 'drin' : ''}${rand ? ' rand' : ''}${t === heute ? ' heute' : ''}`}
              onClick={() => onTag(t)}
              onPointerEnter={() => onUeber(t)}
              onFocus={() => onUeber(t)}
              aria-label={t}
              aria-pressed={!!rand}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Zeitraumwahl({ art, von, bis, heute }: { art: string; von: string; bis: string; heute: string }) {
  const router = useRouter();
  const pfad = usePathname();
  const [offen, setOffen] = useState(false);
  const [a, setA] = useState<string | null>(von);
  const [b, setB] = useState<string | null>(bis);
  const [vorschau, setVorschau] = useState<string | null>(null);
  const [monat, setMonat] = useState(bis.slice(0, 7));
  const box = useRef<HTMLDivElement>(null);
  const [laedt, setLaedt] = useState(false);

  useEffect(() => setLaedt(false), [art, von, bis]);
  useEffect(() => {
    if (!offen) return;
    const zu = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOffen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOffen(false);
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', zu);
      document.removeEventListener('keydown', esc);
    };
  }, [offen]);

  const gehe = (q: string) => {
    setLaedt(true);
    setOffen(false);
    router.push(`${pfad}?${q}`, { scroll: false });
  };
  const frei = (v: string, w: string) => gehe(`zeitraum=frei&von=${v}&bis=${w}`);
  const laenge = tageZwischen(von, bis);
  const zurueck = () => frei(tagPlus(von, -laenge), tagPlus(von, -1));
  const vor = () => {
    const neuBis = tagPlus(bis, laenge) > heute ? heute : tagPlus(bis, laenge);
    frei(tagPlus(neuBis, -(laenge - 1)), neuBis);
  };

  function tag(t: string) {
    if (!a || b) {
      setA(t);
      setB(null);
    } else if (t < a) {
      setB(a);
      setA(t);
    } else setB(t);
  }

  return (
    <div className="wa-zeit" ref={box}>
      <div className="a-chips wa-zeit-chips" role="group" aria-label="Zeitraum">
        {SCHNELL.map(([k, l]) => (
          <button key={k} type="button" className="a-chip" aria-pressed={art === k} onClick={() => gehe(`zeitraum=${k}`)}>
            {l}
          </button>
        ))}
      </div>
      <div className="wa-zeit-bereich">
        <button type="button" className="wa-pfeil" onClick={zurueck} aria-label="Vorheriger Zeitraum">
          <Icon name="zurueck" />
        </button>
        <button
          type="button"
          className={`wa-zeit-knopf${art === 'frei' ? ' aktiv' : ''}`}
          aria-expanded={offen}
          aria-haspopup="dialog"
          onClick={() => {
            setA(von);
            setB(bis);
            setMonat(bis.slice(0, 7));
            setOffen((o) => !o);
          }}
        >
          <Icon name="kalender" />
          <span className="zahl">{bereichText(von, bis)}</span>
          {laedt && <i className="wa-lader" aria-label="lädt" />}
        </button>
        <button type="button" className="wa-pfeil" onClick={vor} disabled={bis >= heute} aria-label="Nächster Zeitraum">
          <Icon name="zurueck" style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>

      {offen && (
        <div className="wa-kal" role="dialog" aria-label="Zeitraum wählen">
          <div className="wa-kal-kopf">
            <button type="button" onClick={() => setMonat(monatPlus(monat, -1))} aria-label="Früherer Monat">
              <Icon name="zurueck" />
            </button>
            <span>{a && b ? bereichText(a, b) : a ? 'Ende wählen' : 'Anfang wählen'}</span>
            <button type="button" onClick={() => setMonat(monatPlus(monat, 1))} disabled={monat >= heute.slice(0, 7)} aria-label="Späterer Monat">
              <Icon name="zurueck" style={{ transform: "scaleX(-1)" }} />
            </button>
          </div>
          <div className="wa-kal-monate">
            <Monat monat={monatPlus(monat, -1)} heute={heute} von={a} bis={b} vorschau={vorschau} onTag={tag} onUeber={setVorschau} />
            <Monat monat={monat} heute={heute} von={a} bis={b} vorschau={vorschau} onTag={tag} onUeber={setVorschau} />
          </div>
          <div className="wa-kal-fuss">
            <div className="a-chips">
              {[
                ['Diese Woche', () => [tagPlus(heute, -((new Date(`${heute}T00:00:00Z`).getUTCDay() + 6) % 7)), heute]],
                ['Dieser Monat', () => [`${heute.slice(0, 7)}-01`, heute]],
                ['Letzter Monat', () => [`${monatPlus(heute.slice(0, 7), -1)}-01`, tagPlus(`${heute.slice(0, 7)}-01`, -1)]],
                ['Dieses Jahr', () => [`${heute.slice(0, 4)}-01-01`, heute]],
              ].map(([l, f]) => (
                <button
                  key={l as string}
                  type="button"
                  className="a-chip klein"
                  onClick={() => {
                    const [x, y] = (f as () => string[])();
                    frei(x, y);
                  }}
                >
                  {l as string}
                </button>
              ))}
            </div>
            <button type="button" className="a-knopf klein" disabled={!a} onClick={() => a && frei(a, b ?? a)}>
              Übernehmen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
