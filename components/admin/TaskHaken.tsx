'use client';
// Runder Erledigt-Haken für Aufgaben (keine native Checkbox): sofortiges Feedback, danach Server-Daten neu laden.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

export default function TaskHaken({ auftragId, taskId, erledigt }: { auftragId: string; taskId: string; erledigt: boolean }) {
  const router = useRouter();
  const [an, setAn] = useState(erledigt);
  const [laedt, setLaedt] = useState(false);
  async function umschalten() {
    const neu = !an;
    setAn(neu);
    setLaedt(true);
    const r = await fetch(`/api/admin/auftraege/${auftragId}/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktion: 'task', taskId, erledigt: neu }) }).catch(() => null);
    setLaedt(false);
    if (!r?.ok) setAn(!neu);
    else router.refresh();
  }
  return (
    <button type="button" className="a-haken" role="checkbox" aria-checked={an} aria-label={an ? 'Als offen markieren' : 'Als erledigt markieren'} disabled={laedt} onClick={umschalten}>
      <Icon name="check" />
    </button>
  );
}
