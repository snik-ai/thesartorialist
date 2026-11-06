'use client';
// Admins verwalten: wer sich unter /admin anmelden darf (steht in der Datenbank).
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type A = { id: string; email: string; name: string | null; aktiv: boolean; zuletzt: string | null; ich: boolean };

export default function Admins({ liste }: { liste: A[] }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [meldung, setMeldung] = useState<{ art: 'gruen' | 'rot'; text: string } | null>(null);
  const [laedt, setLaedt] = useState(false);

  async function senden(method: 'POST' | 'PATCH', body: object, ok: string) {
    setLaedt(true);
    setMeldung(null);
    try {
      const r = await fetch('/api/admin/admins/', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.fehler || 'Fehler');
      setMeldung({ art: 'gruen', text: ok });
      router.refresh();
      return true;
    } catch (e) {
      setMeldung({ art: 'rot', text: (e as Error).message });
      return false;
    } finally {
      setLaedt(false);
    }
  }

  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2>Admins</h2>
      </div>
      <div className="a-karte-inhalt">
        <ul className="a-liste-schlicht">
          {liste.map((a) => (
            <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--a-linie, #e8e4dc)', opacity: a.aktiv ? 1 : 0.5 }}>
              <span>
                <strong>{a.name || a.email}</strong>
                {a.name && <span className="a-sub" style={{ display: 'block', margin: 0 }}>{a.email}</span>}
                <span className="a-sub" style={{ display: 'block', margin: 0 }}>
                  {a.ich ? 'Sie' : a.aktiv ? (a.zuletzt ? `Zuletzt angemeldet ${a.zuletzt}` : 'Noch nie angemeldet') : 'Deaktiviert'}
                </span>
              </span>
              {!a.ich && (
                <button type="button" className={`a-knopf klein${a.aktiv ? ' rot' : ''}`} disabled={laedt} onClick={() => senden('PATCH', { id: a.id, aktiv: !a.aktiv }, a.aktiv ? 'Zugang deaktiviert.' : 'Zugang wieder aktiv.')}>
                  {a.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                </button>
              )}
            </li>
          ))}
        </ul>
        <form
          style={{ display: 'grid', gap: 10, marginTop: 16 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (await senden('POST', { email, name }, `${email} kann sich jetzt anmelden.`)) {
              setEmail('');
              setName('');
            }
          }}
        >
          <label className="a-feld">
            <span>E-Mail</span>
            <input className="a-input" type="email" inputMode="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.ch" required />
          </label>
          <label className="a-feld">
            <span>Name (optional)</span>
            <input className="a-input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button type="submit" className="a-knopf" disabled={laedt || !email}>
            Admin hinzufügen
          </button>
        </form>
        {meldung && <p className={`a-hinweis ${meldung.art}`} style={{ marginTop: 10 }}>{meldung.text}</p>}
      </div>
    </div>
  );
}
