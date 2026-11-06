'use client';
// Massblatt-Eingabe fürs Atelier (Tablet-tauglich): grosse Zahlenfelder in cm, Tab-Reihenfolge je Bereich,
// Vergleich zur Vorversion (Wert und Differenz), Körperhaltung als Chips, Zuordnung zu einem Auftrag.
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import Auswahl from './Auswahl';
import DatumPicker from './DatumPicker';
import { MeldungZeile, useAktion } from './useAktion';
import { KOERPER, MASS_BEREICHE, differenz, massText, massWert, FELD } from '@/lib/crm/massblatt';

type Werte = Record<string, number | string>;

export default function MassblattEditor({
  kontaktId,
  id,
  version,
  werte,
  koerper: k0,
  notiz: n0,
  gemessenAm,
  auftragId: a0,
  vorher,
  auftraege,
}: {
  kontaktId: string;
  id: string | null;
  version: number;
  werte: Werte;
  koerper: string[];
  notiz: string;
  gemessenAm: string | null;
  auftragId: string | null;
  vorher: { version: number; datum: string; masse: Werte } | null;
  auftraege: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [text, setText] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(werte).map(([key, v]) => [key, typeof v === 'number' ? String(v) : v])));
  const [koerper, setKoerper] = useState(k0);
  const [notiz, setNotiz] = useState(n0);
  const [datum, setDatum] = useState<string | null>(gemessenAm ?? new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' }));
  const [auftragId, setAuftragId] = useState(a0);
  const [geaendert, setGeaendert] = useState(!id);
  const [bereich, setBereich] = useState<string | null>(null);
  const { laedt, meldung, senden } = useAktion();

  const masse = useMemo(() => {
    const m: Werte = {};
    for (const [key, t] of Object.entries(text)) {
      const f = FELD[key];
      const v = f ? massWert(f, t) : undefined;
      if (v !== undefined) m[key] = v;
    }
    return m;
  }, [text]);
  const anzahl = Object.keys(masse).length;
  const sichtbar = bereich ? MASS_BEREICHE.filter((b) => b.key === bereich) : MASS_BEREICHE;

  async function speichern(neueVersion: boolean) {
    const body = { kontaktId, masse, koerper, notiz, gemessenAm: datum, auftragId };
    if (!id || neueVersion) {
      const r = await senden<{ id: string }>('/api/admin/massblaetter/', body, 'POST', { ohneRefresh: true });
      if (r) router.push(`/admin/massblaetter/${r.id}/`);
    } else if (await senden(`/api/admin/massblaetter/${id}/`, { masse, koerper, notiz, gemessenAm: datum }, 'PATCH')) setGeaendert(false);
  }

  return (
    <div className="a-mass">
      <div className="a-mass-leiste">
        <div className="a-chips" role="tablist" aria-label="Bereiche">
          <button type="button" className="a-chip" aria-pressed={bereich === null} onClick={() => setBereich(null)}>
            Alle
          </button>
          {MASS_BEREICHE.map((b) => {
            const n = b.felder.filter((f) => masse[f.key] !== undefined).length;
            return (
              <button key={b.key} type="button" className="a-chip" aria-pressed={bereich === b.key} onClick={() => setBereich(b.key)}>
                {b.titel}
                {n > 0 && <span className="zahl">{n}</span>}
              </button>
            );
          })}
        </div>
        <div className="a-knopfreihe">
          {id && (
            <a href={`/api/admin/massblaetter/${id}/pdf/`} target="_blank" rel="noopener" className="a-knopf linie">
              <Icon name="pdf" /> PDF
            </a>
          )}
          {id ? (
            <>
              <button type="button" className="a-knopf linie" disabled={laedt || !geaendert} onClick={() => speichern(false)}>
                V{version} korrigieren
              </button>
              <button type="button" className="a-knopf" disabled={laedt} onClick={() => speichern(true)}>
                <Icon name="plus" /> Als neue Version
              </button>
            </>
          ) : (
            <button type="button" className="a-knopf" disabled={laedt} onClick={() => speichern(true)}>
              <Icon name="check" /> Massblatt speichern
            </button>
          )}
        </div>
      </div>
      <MeldungZeile m={meldung} />

      <div className="a-mass-raster">
        <div>
          {sichtbar.map((b) => (
            <section key={b.key} className="a-karte a-mass-bereich" id={`bereich-${b.key}`}>
              <div className="a-karte-kopf">
                <h2>{b.titel}</h2>
                {vorher && <span className="a-sub" style={{ margin: 0 }}>Vergleich V{vorher.version} · {vorher.datum}</span>}
              </div>
              <div className="a-mass-felder">
                {b.felder.map((f) => {
                  const v = masse[f.key];
                  const alt = vorher?.masse[f.key];
                  const d = differenz(v, alt);
                  return (
                    <label key={f.key} className={`a-massfeld${v !== undefined ? ' voll' : ''}`}>
                      <span className="name">
                        {f.label}
                        {f.hinweis && <small>{f.hinweis}</small>}
                      </span>
                      <span className="eingabe">
                        <input
                          className="zahl"
                          inputMode={f.einheit === '' ? 'text' : 'decimal'}
                          enterKeyHint="next"
                          value={text[f.key] ?? ''}
                          placeholder={alt !== undefined ? String(alt) : '—'}
                          onChange={(e) => {
                            setText({ ...text, [f.key]: e.target.value });
                            setGeaendert(true);
                          }}
                          aria-label={`${b.titel} ${f.label}`}
                        />
                        {f.einheit && <em>{f.einheit}</em>}
                      </span>
                      {vorher && (
                        <span className="vergleich zahl">
                          {alt !== undefined ? massText(alt, f.einheit) : ''}
                          {d && <b className={d.startsWith('+') ? 'plus' : 'minus'}>{d}</b>}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="a-mass-seite">
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Messung</h2>
              <span className="a-sub zahl" style={{ margin: 0 }}>
                {anzahl} Masse
              </span>
            </div>
            <div className="a-karte-inhalt a-aktionen">
              <DatumPicker label="Gemessen am" wert={datum} onChange={(v) => { setDatum(v); setGeaendert(true); }} entfernbar={false} schnell={[['Heute', 0]]} />
              {auftraege.length > 0 && <Auswahl label="Für Auftrag" optionen={auftraege.map((a) => ({ wert: a.id, label: a.label }))} wert={auftragId} onChange={(v) => { setAuftragId(v); setGeaendert(true); }} leerOption="Ohne Auftrag" platzhalter="Ohne Auftrag" suche={false} />}
            </div>
          </section>
          <section className="a-karte">
            <div className="a-karte-kopf">
              <h2>Körperhaltung</h2>
            </div>
            <div className="a-karte-inhalt">
              {KOERPER.map((g) => (
                <div key={g.gruppe} className="a-koerper">
                  <span className="a-kicker">{g.gruppe}</span>
                  <div className="a-chips">
                    {g.optionen.map((o) => (
                      <button
                        key={o}
                        type="button"
                        className="a-chip klein"
                        aria-pressed={koerper.includes(o)}
                        onClick={() => {
                          setKoerper(koerper.includes(o) ? koerper.filter((x) => x !== o) : [...koerper, o]);
                          setGeaendert(true);
                        }}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="a-karte">
            <div className="a-karte-inhalt">
              <label className="a-feld" style={{ margin: 0 }}>
                <span>Notizen</span>
                <textarea className="a-input" rows={4} value={notiz} onChange={(e) => { setNotiz(e.target.value); setGeaendert(true); }} placeholder="z. B. trägt Uhr links, Hose ohne Bruch, Schultern leicht abfallend" />
              </label>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
