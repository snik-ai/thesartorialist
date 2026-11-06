'use client';
// Positionen für Angebot und Rechnung: Katalog-Chips, freie Positionen, Menge-Stepper, Preis in CHF, Rabatt je Position.
import { useState } from 'react';
import Icon from './Icon';
import Auswahl from './Auswahl';
import { KATEGORIEN, KATEGORIE_LABEL } from '@/lib/crm/belege';
import { chf, neueId, positionBetrag, rpAusText, rpZuText } from '@/lib/crm/geld';
import type { Position } from '@/lib/db/schema';
import type { KatalogEintrag } from '@/lib/crm/firma';

function PreisFeld({ rp, onChange, label }: { rp: number; onChange: (rp: number) => void; label: string }) {
  const [text, setText] = useState(rp ? rpZuText(rp) : '');
  const [fehler, setFehler] = useState(false);
  return (
    <label className="a-pos-feld preis">
      <span>{label}</span>
      <span className="a-betrag">
        <em>CHF</em>
        <input
          className={`a-input zahl${fehler ? ' fehler' : ''}`}
          inputMode="decimal"
          value={text}
          placeholder="0.00"
          onChange={(e) => {
            setText(e.target.value);
            const v = rpAusText(e.target.value);
            setFehler(v === null);
            if (v !== null) onChange(v);
          }}
          onBlur={() => !fehler && setText(rp ? rpZuText(rp) : '')}
        />
      </span>
    </label>
  );
}

export default function PositionenEditor({ positionen, onChange, katalog, gesperrt }: { positionen: Position[]; onChange: (p: Position[]) => void; katalog: KatalogEintrag[]; gesperrt?: boolean }) {
  const setze = (i: number, teil: Partial<Position>) => onChange(positionen.map((p, j) => (j === i ? { ...p, ...teil } : p)));
  const verschiebe = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= positionen.length) return;
    const n = [...positionen];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const hinzu = (e?: KatalogEintrag) =>
    onChange([...positionen, { id: neueId(), kategorie: e?.kategorie ?? 'sonstiges', bezeichnung: e?.bezeichnung ?? '', beschreibung: e?.beschreibung, menge: 1, einzelpreisRp: e?.preisRp ?? 0 }]);

  return (
    <div className="a-positionen">
      {positionen.length === 0 && (
        <div className="a-leer klein">
          <Icon name="dokument" />
          <p>Noch keine Positionen — wählen Sie unten aus der Preisliste oder erfassen Sie eine freie Position.</p>
        </div>
      )}
      {positionen.map((p, i) => (
        <div key={p.id} className="a-pos">
          <div className="a-pos-nr zahl">{i + 1}</div>
          <div className="a-pos-felder">
            <div className="a-pos-zeile1">
              <Auswahl klein optionen={KATEGORIEN.map((k) => ({ wert: k.key, label: k.label }))} wert={p.kategorie} onChange={(v) => setze(i, { kategorie: v ?? 'sonstiges' })} suche={false} />
              <input className="a-input a-pos-titel" value={p.bezeichnung} onChange={(e) => setze(i, { bezeichnung: e.target.value })} placeholder="Bezeichnung, z. B. Massanzug zweiteilig" disabled={gesperrt} aria-label="Bezeichnung" />
            </div>
            <textarea className="a-input a-pos-text" rows={2} value={p.beschreibung ?? ''} onChange={(e) => setze(i, { beschreibung: e.target.value })} placeholder="Beschreibung, Details, Stil" disabled={gesperrt} aria-label="Beschreibung" />
            <div className="a-pos-zahlen">
              <label className="a-pos-feld">
                <span>Stoff-Nr.</span>
                <input className="a-input zahl" value={p.stoffnummer ?? ''} onChange={(e) => setze(i, { stoffnummer: e.target.value.toUpperCase() })} placeholder="HS…" disabled={gesperrt} autoCapitalize="characters" />
              </label>
              <div className="a-pos-feld">
                <span>Menge</span>
                <div className="a-stepper">
                  <button type="button" aria-label="Weniger" disabled={gesperrt || p.menge <= 1} onClick={() => setze(i, { menge: Math.max(1, p.menge - 1) })}>
                    −
                  </button>
                  <b className="zahl">{p.menge}</b>
                  <button type="button" aria-label="Mehr" disabled={gesperrt} onClick={() => setze(i, { menge: p.menge + 1 })}>
                    +
                  </button>
                </div>
              </div>
              <PreisFeld rp={p.einzelpreisRp} onChange={(rp) => setze(i, { einzelpreisRp: rp })} label="Preis" />
              <label className="a-pos-feld rabatt">
                <span>Rabatt %</span>
                <input className="a-input zahl" inputMode="decimal" value={p.rabattProzent ? String(p.rabattProzent) : ''} placeholder="0" disabled={gesperrt} onChange={(e) => {
                  const n = Number(e.target.value.replace(',', '.'));
                  setze(i, { rabattProzent: Number.isFinite(n) && n >= 0 && n <= 100 ? n : p.rabattProzent });
                }} />
              </label>
              <div className="a-pos-betrag">
                <span>Betrag</span>
                <b className="zahl">{chf(positionBetrag(p))}</b>
              </div>
            </div>
          </div>
          {!gesperrt && (
            <div className="a-pos-werkzeug">
              <button type="button" aria-label="Nach oben" disabled={i === 0} onClick={() => verschiebe(i, -1)}>
                <Icon name="pfeilRechts" style={{ transform: 'rotate(-90deg)' }} />
              </button>
              <button type="button" aria-label="Nach unten" disabled={i === positionen.length - 1} onClick={() => verschiebe(i, 1)}>
                <Icon name="pfeilRechts" style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button type="button" aria-label="Position entfernen" className="rot" onClick={() => onChange(positionen.filter((_, j) => j !== i))}>
                <Icon name="papierkorb" />
              </button>
            </div>
          )}
        </div>
      ))}
      {!gesperrt && (
        <div className="a-katalog">
          <span className="a-kicker">Aus der Preisliste</span>
          <div className="a-chips">
            {katalog.map((e) => (
              <button key={e.id} type="button" className="a-chip" onClick={() => hinzu(e)}>
                <Icon name="plus" /> {e.bezeichnung}
                <span className="zahl">{e.preisRp ? chf(e.preisRp).replace('.00', '') : KATEGORIE_LABEL[e.kategorie]}</span>
              </button>
            ))}
            <button type="button" className="a-chip dunkel" onClick={() => hinzu()}>
              <Icon name="plus" /> Freie Position
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
