'use client';
// Kontakt im Atelier erfassen (Laufkundschaft, Telefon): Name, E-Mail, Telefon, Firma, Lead oder Kunde.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import { MeldungZeile, useAktion } from './useAktion';

export default function NeuKontakt({ standard = 'lead', offen: anfangsOffen = false }: { standard?: 'lead' | 'kunde'; offen?: boolean }) {
  const router = useRouter();
  const [offen, setOffen] = useState(anfangsOffen);
  const [f, setF] = useState({ name: '', email: '', telefon: '', firma: '', status: standard });
  const { laedt, meldung, senden } = useAktion();

  async function anlegen(e: React.FormEvent) {
    e.preventDefault();
    const r = await senden<{ id: string }>('/api/admin/kontakte/', f, 'POST', { ohneRefresh: true });
    if (r) router.push(`/admin/kontakte/${r.id}/`);
  }

  if (!offen)
    return (
      <button type="button" className="a-knopf" onClick={() => setOffen(true)}>
        <Icon name="plus" /> Neuer Kontakt
      </button>
    );

  return (
    <div className="a-ebene" role="dialog" aria-modal="true" aria-label="Neuer Kontakt" onKeyDown={(e) => e.key === 'Escape' && setOffen(false)}>
      <form className="a-ebene-karte" onSubmit={anlegen}>
        <div className="a-karte-kopf">
          <h2>Neuer Kontakt</h2>
          <button type="button" className="a-x" aria-label="Schliessen" onClick={() => setOffen(false)}>
            <Icon name="x" />
          </button>
        </div>
        <div className="a-karte-inhalt">
          <div className="a-segment" role="group" aria-label="Art" style={{ marginBottom: 16 }}>
            {(['lead', 'kunde'] as const).map((s) => (
              <button key={s} type="button" aria-pressed={f.status === s} onClick={() => setF({ ...f, status: s })}>
                {s === 'lead' ? 'Lead (Interessent)' : 'Kunde'}
              </button>
            ))}
          </div>
          <label className="a-feld">
            <span>Name</span>
            <input className="a-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoFocus autoComplete="off" required />
          </label>
          <label className="a-feld">
            <span>E-Mail</span>
            <input className="a-input" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value.replace(/\s/g, '') })} />
          </label>
          <label className="a-feld">
            <span>Telefon</span>
            <input className="a-input" type="tel" inputMode="tel" value={f.telefon} onChange={(e) => setF({ ...f, telefon: e.target.value })} placeholder="079 123 45 67" />
          </label>
          <label className="a-feld">
            <span>Firma (optional)</span>
            <input className="a-input" value={f.firma} onChange={(e) => setF({ ...f, firma: e.target.value })} />
          </label>
          <MeldungZeile m={meldung} />
          <button type="submit" className="a-knopf voll" disabled={laedt || !f.name.trim()} style={{ marginTop: 8 }}>
            {laedt ? 'Moment …' : 'Kontakt anlegen'}
          </button>
          <p className="a-sub" style={{ fontSize: 12.5 }}>
            Gibt es die E-Mail oder Telefonnummer schon, wird der bestehende Kontakt ergänzt (Golden Record).
          </p>
        </div>
      </form>
    </div>
  );
}
