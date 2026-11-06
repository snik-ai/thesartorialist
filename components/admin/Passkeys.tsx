'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { geraetKann, passkeyEinrichten, plattform } from '@/lib/admin/passkey-geraet';

type P = { id: string; name: string; erstellt: string; zuletzt: string | null };

export default function Passkeys({ liste, darfEinrichten }: { liste: P[]; darfEinrichten: boolean }) {
  const router = useRouter();
  const [kann, setKann] = useState(false);
  const [p, setP] = useState({ methode: 'Face ID', geraet: 'Gerät' });
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState<{ art: 'gruen' | 'rot'; text: string } | null>(null);

  useEffect(() => {
    geraetKann().then(setKann);
    setP(plattform());
  }, []);

  async function einrichten() {
    setLaedt(true);
    setMeldung(null);
    try {
      await passkeyEinrichten(`${p.geraet} (${p.methode})`);
      setMeldung({ art: 'gruen', text: `${p.methode} ist eingerichtet.` });
      router.refresh();
    } catch (e) {
      setMeldung({ art: 'rot', text: (e as Error).message });
    } finally {
      setLaedt(false);
    }
  }

  async function entfernen(id: string) {
    if (!confirm('Diesen Passkey entfernen?')) return;
    const r = await fetch(`/api/admin/passkey/${id}/`, { method: 'DELETE' });
    if (r.ok) router.refresh();
  }

  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2>Face ID &amp; Passkeys</h2>
      </div>
      <div className="a-karte-inhalt">
        {liste.length === 0 ? (
          <p className="a-sub" style={{ marginTop: 0 }}>
            Noch kein Passkey. Mit {p.methode} melden Sie sich ohne Code an.
          </p>
        ) : (
          <ul className="a-balken" style={{ marginBottom: 14 }}>
            {liste.map((x) => (
              <li key={x.id} style={{ gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center' }}>
                <span>
                  <b style={{ display: 'block' }}>{x.name}</b>
                  <small className="a-sub zahl" style={{ fontSize: 12 }}>
                    Eingerichtet {x.erstellt}
                    {x.zuletzt ? ` · zuletzt ${x.zuletzt}` : ''}
                  </small>
                </span>
                <button type="button" className="a-knopf rot klein" onClick={() => entfernen(x.id)}>
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}
        {kann ? (
          darfEinrichten ? (
            <button type="button" className="a-knopf" onClick={einrichten} disabled={laedt}>
              <Icon name="faceid" /> {laedt ? 'Moment …' : `${p.methode} auf diesem ${p.geraet} einrichten`}
            </button>
          ) : (
            <p className="a-hinweis">Aus Sicherheitsgründen nur direkt nach der Anmeldung möglich. Bitte ab- und wieder anmelden.</p>
          )
        ) : (
          <p className="a-sub">Dieses Gerät unterstützt keine Passkeys mit Gerätesperre.</p>
        )}
        {meldung && (
          <p className={`a-hinweis ${meldung.art}`} style={{ marginTop: 12 }}>
            {meldung.text}
          </p>
        )}
      </div>
    </div>
  );
}
