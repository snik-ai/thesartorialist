'use client';
// Status in der Kundenakte: Lead / Kunde / Inaktiv, Pipeline-Phase (mit Grund bei «verloren»), Umsatzpotenzial.
import { useState } from 'react';
import { LEAD_PHASEN } from '@/lib/crm/belege';
import { rpAusText, rpZuText } from '@/lib/crm/geld';
import { MeldungZeile, useAktion } from './useAktion';
import type { KontaktStatus, LeadPhase } from '@/lib/db/schema';

export default function LeadStatus({ id, status, phase, grund, potenzialRp }: { id: string; status: KontaktStatus; phase: LeadPhase; grund: string | null; potenzialRp: number | null }) {
  const { laedt, meldung, senden } = useAktion();
  const [verlieren, setVerlieren] = useState(false);
  const [text, setText] = useState(grund ?? '');
  const [pot, setPot] = useState(potenzialRp ? rpZuText(potenzialRp) : '');
  const speichern = (b: Record<string, unknown>) => senden(`/api/admin/kontakte/${id}/`, b, 'PATCH');

  return (
    <div className="a-karte">
      <div className="a-karte-kopf">
        <h2>Status</h2>
      </div>
      <div className="a-karte-inhalt a-aktionen">
        <div className="a-segment" role="group" aria-label="Status">
          {(['lead', 'kunde', 'inaktiv'] as KontaktStatus[]).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} disabled={laedt} onClick={() => speichern({ status: s })}>
              {s === 'lead' ? 'Lead' : s === 'kunde' ? 'Kunde' : 'Inaktiv'}
            </button>
          ))}
        </div>
        {status === 'lead' && (
          <>
            <span className="a-kicker" style={{ margin: '4px 0 0' }}>
              Pipeline
            </span>
            <div className="a-chips">
              {LEAD_PHASEN.filter((p) => p.key !== 'gewonnen').map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="a-chip"
                  aria-pressed={phase === p.key}
                  disabled={laedt}
                  onClick={() => (p.key === 'verloren' ? setVerlieren(true) : speichern({ leadPhase: p.key }))}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {(verlieren || phase === 'verloren') && (
              <div className="a-aktionen" style={{ gap: 8 }}>
                <label className="a-feld" style={{ margin: 0 }}>
                  <span>Grund (optional)</span>
                  <input className="a-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="z. B. Budget, anderer Anbieter, kein Bedarf" />
                </label>
                <button type="button" className="a-knopf linie klein" disabled={laedt} onClick={async () => (await speichern({ leadPhase: 'verloren', verlorenGrund: text })) && setVerlieren(false)}>
                  Als verloren speichern
                </button>
              </div>
            )}
            <label className="a-feld" style={{ margin: '6px 0 0' }}>
              <span>Umsatzpotenzial CHF</span>
              <input className="a-input zahl" inputMode="decimal" value={pot} onChange={(e) => setPot(e.target.value)} onBlur={() => {
                const rp = rpAusText(pot);
                if (rp !== null && rp !== (potenzialRp ?? 0)) speichern({ potenzialRp: rp || null });
              }} placeholder="sonst gilt das offene Angebot" />
            </label>
          </>
        )}
        {status === 'kunde' && <p className="a-sub" style={{ margin: 0 }}>Kunde — automatisch gesetzt, sobald ein Angebot angenommen wird.</p>}
        <MeldungZeile m={meldung} />
      </div>
    </div>
  );
}
