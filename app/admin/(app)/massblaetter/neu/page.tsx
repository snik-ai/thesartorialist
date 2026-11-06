import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import MassblattAnsicht from '@/components/admin/MassblattAnsicht';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Neues Massblatt' };
export const dynamic = 'force-dynamic';

// Neue Messung für einen Kunden (Werte der aktuellen Version vorausgefüllt)
export default async function NeuesMassblatt({ searchParams }: { searchParams: Promise<{ kontakt?: string; auftrag?: string }> }) {
  const { kontakt, auftrag } = await searchParams;
  if (!kontakt || !UUID.test(kontakt)) redirect('/admin/massblaetter/');
  return <MassblattAnsicht kontaktId={kontakt} m={null} auftragVorwahl={auftrag && UUID.test(auftrag) ? auftrag : null} />;
}
