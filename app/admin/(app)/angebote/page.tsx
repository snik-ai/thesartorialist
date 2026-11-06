import type { Metadata } from 'next';
import Folgt from '@/components/admin/Folgt';

export const metadata: Metadata = { title: 'Angebote' };

export default function Page() {
  return <Folgt titel="Angebote" text="Offerten aus der Beratung erstellen, als PDF senden und mit einem Klick in einen Auftrag umwandeln." />;
}
