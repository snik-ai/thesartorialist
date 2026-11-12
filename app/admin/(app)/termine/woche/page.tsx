import type { Metadata } from 'next';
import Wochenplan from '@/components/admin/wochenplan/Wochenplan';
import { kalenderItems } from '@/lib/crm/kalender';
import { montagVon, plusTage } from '@/lib/kalender';
import { mailBereit } from '@/lib/mail';
import { zuerich, zuerichTeile } from '@/lib/zeit';

export const metadata: Metadata = { title: 'Wochenplanung' };
export const dynamic = 'force-dynamic';

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

// Woche in der URL (?w=2026-11-09, beliebiger Tag der Woche), optional Tag für die Handy-Ansicht (?t=…), ?neu=1 öffnet den Dialog
export default async function WochePage({ searchParams }: { searchParams: Promise<{ w?: string; t?: string; neu?: string }> }) {
  const sp = await searchParams;
  const heute = zuerichTeile(new Date()).datum;
  const montag = montagVon(sp.w && DATUM.test(sp.w) && zuerich(sp.w, '12:00') ? sp.w : heute);
  const von = zuerich(montag, '00:00')!;
  const bis = zuerich(plusTage(montag, 7), '00:00')!;
  const items = await kalenderItems(von, bis);
  return <Wochenplan montag={montag} heute={heute} tag={sp.t && DATUM.test(sp.t) ? sp.t : null} items={items} mailBereit={mailBereit()} neuOffen={sp.neu === '1'} />;
}
