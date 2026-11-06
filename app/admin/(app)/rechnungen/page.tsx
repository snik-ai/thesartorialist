import type { Metadata } from 'next';
import Folgt from '@/components/admin/Folgt';

export const metadata: Metadata = { title: 'Rechnungen' };

export default function Page() {
  return <Folgt titel="Rechnungen" text="Rechnungen mit QR-Einzahlungsschein, Anzahlung und Ratenzahlung, Zahlungseingang im Blick." />;
}
