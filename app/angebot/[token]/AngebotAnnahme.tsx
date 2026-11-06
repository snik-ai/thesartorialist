'use client';
// Annahme auf der Angebotsseite: vollständiger Name + Bestätigung (eigener Schalter, keine native Checkbox), Rückfrage.
import { useState } from 'react';
import { SITE } from '@/lib/site';

export default function AngebotAnnahme({ token, status, name: vorschlag, angenommen }: { token: string; status: string; name: string; angenommen: { name: string; am: string } | null }) {
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
      if (!r.ok) throw new Error(j.fehler || 'Das hat leider nicht geklappt.');
      setFertig(ziel);
    } catch (e) {
      setFehler((e as Error).message);
    } finally {
      setLaedt(false);
    }
  }

  if (angenommen || fertig === 'angenommen' || status === 'angenommen')
    return (
      <section className="ao-annahme ao-danke" role="status">
        <span className="ao-haken" aria-hidden="true">
          ✓
        </span>
        <h2>Herzlichen Dank{angenommen ? `, ${angenommen.name.split(' ')[0]}` : ''}.</h2>
        <p>{angenommen ? `Angenommen am ${angenommen.am}.` : 'Ihre Zusage ist bei uns eingegangen.'} Wir bestellen jetzt Ihren Stoff und melden uns für die Anprobe. Eine Bestätigung erhalten Sie per E-Mail.</p>
      </section>
    );

  if (status === 'abgelaufen' || status === 'abgelehnt')
    return (
      <section className="ao-annahme">
        <h2>{status === 'abgelaufen' ? 'Dieses Angebot ist abgelaufen' : 'Dieses Angebot ist nicht mehr aktiv'}</h2>
        <p>Gerne erstellen wir Ihnen ein aktuelles Angebot — rufen Sie uns an oder schreiben Sie uns.</p>
        <div className="ao-knoepfe">
          <a className="ao-knopf" href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
            {SITE.phone}
          </a>
          <a className="ao-knopf linie" href={SITE.whatsapp} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </div>
      </section>
    );

  return (
    <section className="ao-annahme" aria-labelledby="ao-annahme-titel">
      <span className="ao-kicker">Angebot annehmen</span>
      <h2 id="ao-annahme-titel">Passt alles? Dann können Sie hier verbindlich zusagen.</h2>
      <label className="ao-feld">
        <span>Ihr vollständiger Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={vorschlag || 'Vor- und Nachname'} autoComplete="name" />
      </label>
      <button type="button" className={`ao-schalter${ok ? ' an' : ''}`} role="switch" aria-checked={ok} onClick={() => setOk(!ok)}>
        <i aria-hidden="true" />
        <span>Ich nehme dieses Angebot verbindlich an. Die Massanfertigung beginnt nach meiner Zusage.</span>
      </button>
      {fehler && (
        <p className="ao-fehler" role="alert">
          {fehler}
        </p>
      )}
      <button type="button" className="ao-knopf gross" disabled={laedt || name.trim().length < 3 || !ok} onClick={() => senden({ aktion: 'annehmen', name, bestaetigt: ok }, 'angenommen')}>
        {laedt ? 'Einen Moment …' : 'Angebot annehmen'}
      </button>

      <div className="ao-frage">
        {fertig === 'frage' ? (
          <p role="status">Danke für Ihre Nachricht — wir melden uns persönlich bei Ihnen.</p>
        ) : !frageOffen ? (
          <button type="button" className="ao-link" onClick={() => setFrageOffen(true)}>
            Noch eine Frage oder ein Änderungswunsch?
          </button>
        ) : (
          <>
            <label className="ao-feld">
              <span>Ihre Nachricht an das Atelier</span>
              <textarea rows={3} value={frage} onChange={(e) => setFrage(e.target.value)} />
            </label>
            <button type="button" className="ao-knopf linie" disabled={laedt || !frage.trim()} onClick={() => senden({ aktion: 'frage', text: frage }, 'frage')}>
              Nachricht senden
            </button>
          </>
        )}
      </div>
    </section>
  );
}
