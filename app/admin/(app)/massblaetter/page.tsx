import type { Metadata } from 'next';
import Folgt from '@/components/admin/Folgt';

export const metadata: Metadata = { title: 'Massblätter' };

export default function Page() {
  return <Folgt titel="Massblätter" text="Alle Masse pro Kundin und Kunde, versioniert — die Grundlage für jeden weiteren Anzug." />;
}
