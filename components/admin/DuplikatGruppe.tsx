'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { telAnzeige } from '@/lib/crm/telefon';

type K = { id: string; name: string; email: string | null; telefon: string | null; firma: string | null; erstelltAm: string; termine: number };

export default function DuplikatGruppe({ titel, kontakte }: { titel: string; kontakte: K[] }) {
  const router = useRouter();
  const [ziel, setZiel] = useState(kontakte[0]?.id);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState('');

  async function zusammenfuehren() {
    setLaedt(true);
    setFehler('');
    const r = await fetch('/api/admin/kontakte/zusammenfuehren/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zielId: ziel, quellen: kontakte.filter((k) => k.id !== ziel).map((k) => k.id) }),
    });
    const j = await r.json().catch(() => ({}));
    setLaedt(false);
    if (!r.ok) return setFehler(j.fehler || 'Fehler');
    router.refresh();
  }

  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2 style={{ fontSize: 16 }}>{titel}</h2>
        <button type="button" className="a-knopf klein" onClick={zusammenfuehren} disabled={laedt}>
          <Icon name="merge" /> {laedt ? 'Moment …' : 'Zusammenführen'}
        </button>
      </div>
      <div className="a-liste" role="radiogroup" aria-label="Datensatz, der bleibt">
        {kontakte.map((k) => (
          <button
            key={k.id}
            type="button"
            role="radio"
            aria-checked={ziel === k.id}
            className="a-zeile"
            style={{ textAlign: 'left', width: '100%', background: ziel === k.id ? 'var(--a-gold-soft)' : undefined }}
            onClick={() => setZiel(k.id)}
          >
            <span className="a-avatar" style={{ background: ziel === k.id ? 'var(--a-ink)' : '#d9d6cf' }}>
              {ziel === k.id ? <Icon name="check" width={20} height={20} /> : null}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="a-zeile-titel" style={{ display: 'block' }}>
                {k.name || 'Ohne Namen'} {k.firma ? `· ${k.firma}` : ''}
              </span>
              <span className="a-zeile-sub" style={{ display: 'block' }}>
                {[k.email, k.telefon ? telAnzeige(k.telefon) : null].filter(Boolean).join(' · ')}
              </span>
            </span>
            <span className="a-zeile-rechts">
              <span>{ziel === k.id ? 'bleibt' : 'wird übernommen'}</span>
              <span className="zahl">
                {k.termine} Anfr. · seit {new Date(k.erstelltAm).toLocaleDateString('de-CH')}
              </span>
            </span>
          </button>
        ))}
      </div>
      {fehler && <p className="a-hinweis rot">{fehler}</p>}
    </div>
  );
}
