'use client';
// Kanban-Karte: Auftrag einen Schritt weiter. Schritte mit Angaben (Liefertermin, Anprobe) führen in den Auftrag.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Icon from './Icon';
import { AUFTRAG_SCHRITTE, naechsterSchritt } from '@/lib/crm/belege';
import type { AuftragStatus } from '@/lib/db/schema';

export default function StatusWeiter({ id, status }: { id: string; status: AuftragStatus }) {
  const router = useRouter();
  const [laedt, setLaedt] = useState(false);
  const n = naechsterSchritt(status);
  if (!n || n === 'abgeschlossen') return null;
  const label = AUFTRAG_SCHRITTE.find((s) => s.key === n)!.kurz;
  return (
    <button
      type="button"
      className="a-weiter"
      disabled={laedt}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (n === 'produktion' || n === 'anprobe') return router.push(`/admin/auftraege/${id}/?schritt=${n}`);
        setLaedt(true);
        await fetch(`/api/admin/auftraege/${id}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktion: 'status', status: n }) }).catch(() => null);
        setLaedt(false);
        router.refresh();
      }}
    >
      {label} <Icon name="pfeilRechts" />
    </button>
  );
}
