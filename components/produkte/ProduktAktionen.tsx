'use client';
// Aktionen auf der Produktseite: aktiv/inaktiv umschalten, löschen (in Belegen verwendete Produkte werden nur deaktiviert).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import { MeldungZeile, useAktion } from '@/components/admin/useAktion';

export default function ProduktAktionen({ id, aktiv, verwendet }: { id: string; aktiv: boolean; verwendet: number }) {
  const router = useRouter();
  const { laedt, meldung, senden } = useAktion();
  const [frage, setFrage] = useState(false);
  return (
    <div className="pd-aktionen">
      <button type="button" className="a-toggle" aria-pressed={aktiv} disabled={laedt} onClick={() => senden(`/api/admin/produkte/${id}/`, { aktiv: !aktiv }, 'PATCH')}>
        <i />
        {aktiv ? 'Aktiv' : 'Inaktiv'}
      </button>
      {!frage ? (
        <button type="button" className="a-knopf leise klein" onClick={() => setFrage(true)}>
          <Icon name="papierkorb" /> {verwendet ? 'Deaktivieren' : 'Löschen'}
        </button>
      ) : (
        <span className="pd-frage">
          {verwendet ? `In ${verwendet} Beleg${verwendet === 1 ? '' : 'en'} verwendet — nur deaktivieren?` : 'Produkt endgültig löschen?'}
          <button
            type="button"
            className="a-knopf rot klein"
            disabled={laedt}
            onClick={async () => {
              const r = await senden<{ geloescht: boolean }>(`/api/admin/produkte/${id}/`, undefined, 'DELETE', { ohneRefresh: true });
              setFrage(false);
              if (r?.geloescht) router.push('/admin/produkte/');
              else router.refresh();
            }}
          >
            Ja
          </button>
          <button type="button" className="a-knopf leise klein" onClick={() => setFrage(false)}>
            Nein
          </button>
        </span>
      )}
      <MeldungZeile m={meldung} />
    </div>
  );
}
