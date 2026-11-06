import type { Metadata } from 'next';
import Folgt from '@/components/admin/Folgt';

export const metadata: Metadata = { title: 'Aufträge' };

export default function Page() {
  return <Folgt titel="Aufträge" text="Massanfertigungen vom Massnehmen bis zur Abholung verfolgen — mit Anproben und Liefertermin." />;
}
