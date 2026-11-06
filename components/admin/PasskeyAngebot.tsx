'use client';
// «Face ID einrichten?» — Angebot direkt nach der Anmeldung (frische Sitzung, noch kein Passkey, Gerät kann es).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { geraetKann, passkeyEinrichten, plattform } from '@/lib/admin/passkey-geraet';

const MERKER = 'ts.passkey.angebot';

export default function PasskeyAngebot({ anzahl, frisch }: { anzahl: number; frisch: boolean }) {
  const router = useRouter();
  const [zeigen, setZeigen] = useState(false);
  const [p, setP] = useState({ methode: 'Face ID', geraet: 'Gerät' });
  const [laedt, setLaedt] = useState(false);
  const [meldung, setMeldung] = useState('');

  useEffect(() => {
    if (anzahl > 0 || !frisch) return;
    let spaeter = false;
    try {
      spaeter = Number(localStorage.getItem(MERKER) || 0) > Date.now();
    } catch {}
    if (spaeter) return;
    geraetKann().then((ok) => {
      if (ok) {
        setP(plattform());
        setZeigen(true);
      }
    });
  }, [anzahl, frisch]);

  if (!zeigen) return null;

  async function einrichten() {
    setLaedt(true);
    setMeldung('');
    try {
      await passkeyEinrichten(`${p.geraet} (${p.methode})`);
      setZeigen(false);
      router.refresh();
    } catch (e) {
      setMeldung((e as Error).message);
    } finally {
      setLaedt(false);
    }
  }
  function spaeter() {
    try {
      localStorage.setItem(MERKER, String(Date.now() + 14 * 86400_000));
    } catch {}
    setZeigen(false);
  }

  return (
    <div className="a-angebot" role="region" aria-label={`${p.methode} einrichten`}>
      <Icon name="faceid" />
      <div>
        <b>{p.methode} einrichten?</b>
        <small>{meldung || `Nächstes Mal ohne Code anmelden — mit ${p.methode} auf diesem ${p.geraet}.`}</small>
      </div>
      <div className="a-knopfreihe" style={{ flex: 'none', minWidth: 0 }}>
        <button type="button" className="a-knopf gold" onClick={einrichten} disabled={laedt}>
          {laedt ? 'Moment …' : 'Einrichten'}
        </button>
        <button type="button" className="a-knopf linie" onClick={spaeter}>
          Später
        </button>
      </div>
    </div>
  );
}
