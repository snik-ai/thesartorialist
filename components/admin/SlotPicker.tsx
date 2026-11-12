'use client';
// Eigener Kalender- und Slot-Picker: Öffnungszeiten aus lib/site.ts (hours), 30-Minuten-Raster,
// Beratung 90 Minuten (letzter Start 90 Min. vor Ladenschluss), belegte Termine und private Blocker
// (Wochenplanung) gesperrt. belegt: Startzeiten (ISO, ±90 Min.) oder Bereiche { start, ende } aus lib/crm/kalender.ts.
import { useMemo, useState } from 'react';
import Icon from './Icon';
import { SITE } from '@/lib/site';
import { terminLang, zuerich, zuerichTeile } from '@/lib/zeit';
import type { Bereich } from '@/lib/kalender';

export type Belegt = (string | Bereich)[];

const DAUER_MIN = 90;
const WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const pad = (n: number) => String(n).padStart(2, '0');
const minuten = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function slotsFuer(datum: string, wochentag: number): string[] {
  const h = SITE.hours[wochentag];
  if (!h) return [];
  const out: string[] = [];
  for (let m = minuten(h[0]); m + DAUER_MIN <= minuten(h[1]); m += 30) out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  return out.map((z) => `${datum}T${z}`);
}

export default function SlotPicker({
  max = 1,
  wert,
  onChange,
  belegt = [],
  wunsch,
}: {
  max?: number;
  wert: string[];
  onChange: (iso: string[]) => void;
  belegt?: Belegt;
  wunsch?: string | null;
}) {
  const heute = zuerichTeile(new Date());
  const start = wunsch && new Date(wunsch) > new Date() ? zuerichTeile(new Date(wunsch)).datum : heute.datum;
  const [monat, setMonat] = useState(start.slice(0, 7));
  const [tag, setTag] = useState<string>(start);

  // Punkt (Startzeit eines Termins) → ±90 Min. gesperrt; Bereich → jede Überschneidung mit dem 90-Minuten-Slot gesperrt
  const sperren = useMemo(
    () =>
      belegt.map((b) => {
        if (typeof b === 'string') {
          const t = new Date(b).getTime();
          return { von: t - DAUER_MIN * 60_000, bis: t + DAUER_MIN * 60_000, privat: false };
        }
        return { von: new Date(b.start).getTime() - DAUER_MIN * 60_000, bis: new Date(b.ende).getTime(), privat: b.art === 'privat' };
      }),
    [belegt],
  );
  const wunschTag = wunsch ? zuerichTeile(new Date(wunsch)).datum : null;
  const wunschZeit = wunsch ? zuerichTeile(new Date(wunsch)).zeit : null;
  const gewaehltTage = new Set(wert.map((w) => zuerichTeile(new Date(w)).datum));

  const [jahr, mon] = monat.split('-').map(Number);
  const ersterWt = (new Date(Date.UTC(jahr, mon - 1, 1)).getUTCDay() + 6) % 7; // Montag = 0
  const tageImMonat = new Date(Date.UTC(jahr, mon, 0)).getUTCDate();
  const monatName = new Date(Date.UTC(jahr, mon - 1, 15)).toLocaleDateString('de-CH', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const verschiebe = (d: number) => {
    const n = new Date(Date.UTC(jahr, mon - 1 + d, 1));
    setMonat(`${n.getUTCFullYear()}-${pad(n.getUTCMonth() + 1)}`);
  };
  const grenze = (() => {
    const n = new Date();
    n.setMonth(n.getMonth() + 6);
    return `${n.getFullYear()}-${pad(n.getMonth() + 1)}`;
  })();

  const tagWt = (datum: string) => new Date(`${datum}T12:00:00Z`).getUTCDay();
  const slots = slotsFuer(tag, tagWt(tag));
  const jetzt = Date.now();

  function waehle(lokal: string) {
    const [d, z] = lokal.split('T');
    const iso = zuerich(d, z)!.toISOString();
    if (wert.includes(iso)) return onChange(wert.filter((w) => w !== iso));
    if (max === 1) return onChange([iso]);
    if (wert.length >= max) return;
    onChange([...wert, iso].sort());
  }

  return (
    <div className="a-kal">
      <div className="a-kal-kopf">
        <button type="button" onClick={() => verschiebe(-1)} disabled={monat <= heute.datum.slice(0, 7)} aria-label="Vorheriger Monat">
          <Icon name="pfeilLinks" />
        </button>
        <b>{monatName}</b>
        <button type="button" onClick={() => verschiebe(1)} disabled={monat >= grenze} aria-label="Nächster Monat">
          <Icon name="pfeilRechts" />
        </button>
      </div>
      <div className="a-kal-raster" role="grid" aria-label={monatName}>
        {WT.map((w) => (
          <div key={w} className="a-kal-wt">
            {w}
          </div>
        ))}
        {Array.from({ length: ersterWt }).map((_, i) => (
          <div key={`l${i}`} />
        ))}
        {Array.from({ length: tageImMonat }).map((_, i) => {
          const datum = `${monat}-${pad(i + 1)}`;
          const offen = Boolean(SITE.hours[tagWt(datum)]) && datum >= heute.datum;
          const klassen = ['a-kal-tag', datum === heute.datum ? 'heute' : '', datum === wunschTag ? 'wunsch' : '', gewaehltTage.has(datum) ? 'gewaehlt' : ''].join(' ');
          return (
            <button
              key={datum}
              type="button"
              className={klassen}
              disabled={!offen}
              aria-pressed={tag === datum}
              aria-label={new Date(`${datum}T12:00:00Z`).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}
              onClick={() => setTag(datum)}
            >
              <span className="zahl">{i + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="a-slots" role="group" aria-label="Uhrzeit">
        {slots.length === 0 && <p className="a-sub">An diesem Tag ist das Atelier geschlossen.</p>}
        {slots.map((lokal) => {
          const [d, z] = lokal.split('T');
          const ms = zuerich(d, z)!.getTime();
          const iso = new Date(ms).toISOString();
          const vorbei = ms < jetzt;
          const sperre = sperren.find((b) => ms > b.von && ms < b.bis);
          const besetzt = Boolean(sperre);
          return (
            <button
              key={lokal}
              type="button"
              className={`a-slot${d === wunschTag && z === wunschZeit ? ' wunsch' : ''}`}
              disabled={vorbei || besetzt}
              aria-pressed={wert.includes(iso)}
              title={sperre ? (sperre.privat ? 'Blockiert (privater Eintrag)' : 'Belegt (bestätigter Termin)') : d === wunschTag && z === wunschZeit ? 'Wunschzeit der Kundin / des Kunden' : undefined}
              onClick={() => waehle(lokal)}
            >
              {z}
            </button>
          );
        })}
      </div>

      {max > 1 && wert.length > 0 && (
        <div className="a-gewaehlt" style={{ marginTop: 14 }}>
          {wert.map((w, i) => (
            <div key={w} className="a-gewaehlt-zeile">
              <b className="zahl">{i + 1}</b>
              <span>{terminLang(new Date(w))}</span>
              <button type="button" aria-label="Entfernen" onClick={() => onChange(wert.filter((x) => x !== w))}>
                <Icon name="x" width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
