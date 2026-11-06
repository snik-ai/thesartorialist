'use client';
// Schnellablauf «Neues Angebot» / «Neue Rechnung» ohne Anfrage: Kunde suchen (Name, E-Mail, Telefon, Firma) oder
// «Neuer Kunde» (Name + E-Mail oder Telefon, Herkunft als Chips) → das leere A4-Blatt öffnet sich sofort.
// Golden Record serverseitig (gleiche E-Mail/Telefon → bestehender Kontakt). Mit kontaktId ohne Dialog.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import './neubeleg.css';

type Art = 'angebot' | 'rechnung';
type Treffer = { id: string; name: string; email: string | null; ort: string | null; status: string };
const HERKUNFT: [string, string][] = [
  ['store', 'Laufkundschaft im Store'],
  ['email', 'E-Mail'],
  ['telefon', 'Telefon'],
  ['empfehlung', 'Empfehlung'],
  ['anderes', 'Anderes'],
];
const TEXT: Record<Art, { titel: string; los: string; sub: string }> = {
  angebot: { titel: 'Neues Angebot', los: 'Angebot öffnen', sub: 'Für wen ist das Angebot? Danach öffnet sich das leere A4-Blatt.' },
  rechnung: { titel: 'Neue Rechnung', los: 'Rechnung öffnen', sub: 'Direktverkauf im Store, z. B. ein Hemd – im Blatt sofort als bezahlt markierbar.' },
};

async function erstellen(body: Record<string, unknown>): Promise<string> {
  const r = await fetch('/api/admin/belege/neu/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.fehler || 'Das hat nicht geklappt.');
  return j.url as string;
}

export function NeuBelegDialog({ art, offen, onZu }: { art: Art; offen: boolean; onZu: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [liste, setListe] = useState<Treffer[] | null>(null);
  const [fokus, setFokus] = useState(0);
  const [neu, setNeu] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [firma, setFirma] = useState('');
  const [herkunft, setHerkunft] = useState('store');
  const [laedt, setLaedt] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const suche = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!offen) return;
    setQ('');
    setNeu(false);
    setFehler(null);
    setTimeout(() => suche.current?.focus(), 30);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onZu();
    document.addEventListener('keydown', esc);
    document.body.classList.add('a-sheet-offen');
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.classList.remove('a-sheet-offen');
    };
  }, [offen, onZu]);
  useEffect(() => {
    if (!offen || neu) return;
    const t = setTimeout(
      () =>
        fetch(`/api/admin/kontakte/suche/?q=${encodeURIComponent(q)}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((r) => setListe(Array.isArray(r) ? r.slice(0, 8) : []))
          .catch(() => setListe([])),
      q ? 150 : 0,
    );
    return () => clearTimeout(t);
  }, [q, offen, neu]);

  const los = async (body: Record<string, unknown>, key: string) => {
    setLaedt(key);
    setFehler(null);
    try {
      const url = await erstellen({ art, ...body });
      onZu();
      router.push(url);
    } catch (e) {
      setFehler((e as Error).message);
    } finally {
      setLaedt(null);
    }
  };
  const neuStarten = () => {
    const t = q.trim();
    setNeu(true);
    if (t.includes('@')) setEmail(t);
    else if (/^[+\d\s()-]{6,}$/.test(t)) setTelefon(t);
    else setName(t);
  };
  const n = liste?.length ?? 0;
  const neuOk = name.trim() && (email.trim() || telefon.trim());

  if (!offen || typeof document === 'undefined') return null;
  return createPortal(
    <div className="adm nb-hg" onMouseDown={(e) => e.target === e.currentTarget && onZu()}>
      <div className="nb" role="dialog" aria-modal="true" aria-label={TEXT[art].titel}>
        <header className="nb-kopf">
          <div>
            <span className="a-kicker">{art === 'angebot' ? 'Angebot' : 'Rechnung'} · ohne Anfrage</span>
            <h2>{TEXT[art].titel}</h2>
            <p>{TEXT[art].sub}</p>
          </div>
          <button type="button" className="nb-zu" onClick={onZu} aria-label="Schliessen">
            <Icon name="x" />
          </button>
        </header>

        {!neu ? (
          <div className="nb-inhalt">
            <label className="nb-suche">
              <Icon name="suche" />
              <input
                ref={suche}
                className="a-input"
                value={q}
                placeholder="Kunde suchen: Name, E-Mail, Telefon oder Firma"
                aria-label="Kunde suchen"
                onChange={(e) => {
                  setQ(e.target.value);
                  setFokus(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setFokus((f) => Math.min(f + 1, n));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFokus((f) => Math.max(f - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (fokus < n && liste?.[fokus]) los({ kontaktId: liste[fokus].id }, liste[fokus].id);
                    else neuStarten();
                  }
                }}
              />
            </label>
            <ul className="nb-liste" role="listbox">
              {liste === null && <li className="nb-leer">Lädt …</li>}
              {liste?.length === 0 && q && <li className="nb-leer">Kein Kontakt gefunden – unten als neuen Kunden erfassen.</li>}
              {liste?.map((t, i) => (
                <li key={t.id} role="option" aria-selected={i === fokus}>
                  <button type="button" className={`nb-treffer ${i === fokus ? 'an' : ''}`} onMouseEnter={() => setFokus(i)} onClick={() => los({ kontaktId: t.id }, t.id)} disabled={Boolean(laedt)}>
                    <span className="nb-avatar">{(t.name || t.email || '?').trim().slice(0, 1).toUpperCase()}</span>
                    <span className="nb-t">
                      <b>{t.name || t.email}</b>
                      <small>{[t.status === 'kunde' ? 'Kunde' : 'Lead', t.email, t.ort].filter(Boolean).join(' · ')}</small>
                    </span>
                    {laedt === t.id ? <span className="nb-spinner" /> : <Icon name="pfeilRechts" />}
                  </button>
                </li>
              ))}
              <li role="option" aria-selected={fokus === n}>
                <button type="button" className={`nb-treffer nb-neu ${fokus === n ? 'an' : ''}`} onMouseEnter={() => setFokus(n)} onClick={neuStarten}>
                  <span className="nb-avatar gold">
                    <Icon name="plus" />
                  </span>
                  <span className="nb-t">
                    <b>{q.trim() ? `«${q.trim()}» als neuen Kunden erfassen` : 'Neuer Kunde'}</b>
                    <small>Nur Name und E-Mail oder Telefon nötig</small>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <form
            className="nb-inhalt nb-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (neuOk) los({ neu: { name, email, telefon, firma }, herkunft }, 'neu');
            }}
          >
            <button type="button" className="nb-zurueck" onClick={() => setNeu(false)}>
              <Icon name="pfeilLinks" /> Zur Suche
            </button>
            <label className="nb-feld">
              <span className="a-kicker">Name</span>
              <input className="a-input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Vorname Nachname" autoComplete="off" />
            </label>
            <label className="nb-feld">
              <span className="a-kicker">E-Mail</span>
              <input className="a-input" type="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} placeholder="name@beispiel.ch" />
            </label>
            <label className="nb-feld">
              <span className="a-kicker">Telefon</span>
              <input className="a-input" type="tel" inputMode="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="079 123 45 67" />
            </label>
            <label className="nb-feld">
              <span className="a-kicker">Firma (optional)</span>
              <input className="a-input" value={firma} onChange={(e) => setFirma(e.target.value)} />
            </label>
            <div className="nb-feld">
              <span className="a-kicker">Herkunft</span>
              <div className="a-chips" role="radiogroup" aria-label="Herkunft">
                {HERKUNFT.map(([k, l]) => (
                  <button key={k} type="button" role="radio" aria-checked={herkunft === k} aria-pressed={herkunft === k} className="a-chip" onClick={() => setHerkunft(k)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <p className="nb-klein">Gibt es die E-Mail oder Telefonnummer schon, wird der bestehende Kontakt verwendet – keine Duplikate.</p>
            <button type="submit" className="a-knopf nb-los" disabled={!neuOk || Boolean(laedt)}>
              {laedt === 'neu' ? <span className="nb-spinner hell" /> : <Icon name="dokument" />}
              {TEXT[art].los}
            </button>
          </form>
        )}
        {fehler && (
          <div className="a-hinweis rot" role="alert" style={{ margin: '0 24px 20px' }}>
            {fehler}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Knopf «Neues Angebot» / «Neue Rechnung». Mit kontaktId wird direkt erstellt und das Blatt geöffnet. */
export function NeuBelegKnopf({ art, kontaktId, klein, label, linie }: { art: Art; kontaktId?: string; klein?: boolean; label?: string; linie?: boolean }) {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const klick = async () => {
    if (!kontaktId) return setOffen(true);
    setLaedt(true);
    setFehler(null);
    try {
      router.push(await erstellen({ art, kontaktId }));
    } catch (e) {
      setFehler((e as Error).message);
      setLaedt(false);
    }
  };
  return (
    <>
      <button type="button" className={`a-knopf${linie ? ' linie' : ''}${klein ? ' klein' : ''}`} onClick={klick} disabled={laedt} title={fehler ?? undefined}>
        {laedt ? <span className={`nb-spinner${linie ? '' : ' hell'}`} /> : <Icon name={art === 'angebot' ? 'dokument' : 'rechnung'} />}
        {label ?? (art === 'angebot' ? 'Neues Angebot' : 'Neue Rechnung')}
      </button>
      <NeuBelegDialog art={art} offen={offen} onZu={() => setOffen(false)} />
    </>
  );
}

/** Schwebender «+»-Knopf (Handy): kleines Menü «Neues Angebot / Neue Rechnung» */
export function NeuBelegFab() {
  const [menue, setMenue] = useState(false);
  const [art, setArt] = useState<Art | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menue) return;
    const zu = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setMenue(false);
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [menue]);
  return (
    <div className="nb-fab" ref={box}>
      {menue && (
        <div className="nb-fab-menue" role="menu">
          {(['angebot', 'rechnung'] as Art[]).map((a) => (
            <button
              key={a}
              type="button"
              role="menuitem"
              onClick={() => {
                setMenue(false);
                setArt(a);
              }}
            >
              <Icon name={a === 'angebot' ? 'dokument' : 'rechnung'} />
              {a === 'angebot' ? 'Neues Angebot' : 'Neue Rechnung'}
            </button>
          ))}
        </div>
      )}
      <button type="button" className={`nb-fab-k${menue ? ' offen' : ''}`} aria-label="Neu erstellen" aria-expanded={menue} onClick={() => setMenue(!menue)}>
        <Icon name="plus" />
      </button>
      <NeuBelegDialog art={art ?? 'angebot'} offen={art !== null} onZu={() => setArt(null)} />
    </div>
  );
}
