'use client';
// Annahme in der Kundenansicht (VoxCRM KundenAnsicht): vollständiger Name + Bestätigung (Schalter, keine native Checkbox),
// Rückfrage ans Atelier. Texte in der Dokumentsprache.
import { useState } from 'react';
import { SITE } from '@/lib/site';
import type { BelegSprache } from '@/lib/db/schema';
import { KT } from './texte';

export default function AngebotAnnahme({ token, status, name: vorschlag, angenommen, sprache }: { token: string; status: string; name: string; angenommen: { name: string; am: string } | null; sprache: BelegSprache }) {
  const T = KT[sprache];
  const [name, setName] = useState('');
  const [ok, setOk] = useState(false);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState('');
  const [fertig, setFertig] = useState<null | 'angenommen' | 'frage'>(null);
  const [frage, setFrage] = useState('');
  const [frageOffen, setFrageOffen] = useState(false);

  async function senden(body: Record<string, unknown>, ziel: 'angenommen' | 'frage') {
    setLaedt(true);
    setFehler('');
    try {
      const r = await fetch(`/api/angebot/${token}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || T.fehler);
      setFertig(ziel);
    } catch (e) {
      setFehler((e as Error).message);
    } finally {
      setLaedt(false);
    }
  }

  if (angenommen || fertig === 'angenommen' || status === 'angenommen')
    return (
      <div className="k-done" role="status">
        <div className="ring">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 className="k-h1" style={{ fontSize: 24 }}>
          {T.danke}
          {angenommen ? `, ${angenommen.name.split(' ')[0]}` : ''}.
        </h2>
        <p className="k-sub">
          {angenommen ? T.angenommenAm.replace('{datum}', angenommen.am) : T.eingegangen} {T.dankeText}
        </p>
      </div>
    );

  if (status === 'abgelaufen' || status === 'abgelehnt')
    return (
      <div className="k-hinweis bad">
        <div>
          <b>{status === 'abgelaufen' ? T.abgelaufen : T.inaktiv}</b>
          <p style={{ margin: '4px 0 10px' }}>{T.neuText}</p>
          <a className="k-btn" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
            {SITE.phone}
          </a>
        </div>
      </div>
    );

  return (
    <section aria-labelledby="k-annahme-titel">
      <span className="k-lbl">{T.annehmenKicker}</span>
      <p id="k-annahme-titel" className="k-sub" style={{ margin: '0 0 12px' }}>
        {T.annehmenTitel}
      </p>
      <label>
        <span className="k-lbl" style={{ margin: '0 0 6px' }}>
          {T.name}
        </span>
        <input className="k-inp" value={name} onChange={(e) => setName(e.target.value)} placeholder={vorschlag || T.namePlatz} autoComplete="name" />
      </label>
      <button type="button" className={`k-tgl ${ok ? 'on' : ''}`} role="switch" aria-checked={ok} onClick={() => setOk(!ok)}>
        <span className="tg" aria-hidden="true" />
        <span>{T.bestaetigen}</span>
      </button>
      {fehler && (
        <div className="k-hinweis bad" role="alert">
          {fehler}
        </div>
      )}
      <button type="button" className="k-btn" disabled={laedt || name.trim().length < 3 || !ok} onClick={() => senden({ aktion: 'annehmen', name, bestaetigt: ok }, 'angenommen')}>
        {laedt ? T.moment : T.annehmen}
      </button>
      <div style={{ marginTop: 10 }}>
        {fertig === 'frage' ? (
          <p className="k-sub" role="status">
            {T.frageDanke}
          </p>
        ) : !frageOffen ? (
          <button type="button" className="k-link" onClick={() => setFrageOffen(true)}>
            {T.frage}
          </button>
        ) : (
          <>
            <label>
              <span className="k-lbl">{T.frageLabel}</span>
              <textarea className="k-inp k-ta" rows={3} value={frage} onChange={(e) => setFrage(e.target.value)} />
            </label>
            <button type="button" className="k-btn line" disabled={laedt || !frage.trim()} onClick={() => senden({ aktion: 'frage', text: frage }, 'frage')}>
              {T.frageSenden}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
