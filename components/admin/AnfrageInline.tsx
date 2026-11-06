'use client';
// Anfrage direkt in der Kundenakte bestätigen oder neue Termine vorschlagen (gleiche Aktionen wie in der Termin-Ansicht).
import { useState } from 'react';
import TerminAktionen from './TerminAktionen';
import Icon from './Icon';

type Props = React.ComponentProps<typeof TerminAktionen>;

export default function AnfrageInline(p: Props & { offen?: boolean }) {
  const [auf, setAuf] = useState(Boolean(p.offen));
  return (
    <div className="a-anfrage-aktion">
      <button type="button" className={`a-knopf klein${auf ? ' linie' : ''}`} aria-expanded={auf} onClick={() => setAuf(!auf)}>
        {auf ? (
          <>
            <Icon name="x" /> Schliessen
          </>
        ) : (
          <>
            <Icon name="check" /> {p.status === 'vorgeschlagen' ? 'Vorschläge bearbeiten' : 'Bestätigen / vorschlagen'}
          </>
        )}
      </button>
      {auf && (
        <div className="a-anfrage-panel">
          <TerminAktionen {...p} />
        </div>
      )}
    </div>
  );
}
