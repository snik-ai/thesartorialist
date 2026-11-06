import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import ProduktEditor from '@/components/produkte/ProduktEditor';
import '../produkte.css';

export const metadata: Metadata = { title: 'Neues Produkt' };
export const dynamic = 'force-dynamic';

export default function NeuesProdukt() {
  return (
    <>
      <Link href="/admin/produkte/" className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> Alle Produkte
      </Link>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Produkte</span>
          <h1>Neues Produkt</h1>
          <p className="a-sub">Preise inkl. MWST — das Produkt erscheint danach in der Positionssuche von Angebot und Rechnung.</p>
        </div>
      </div>
      <ProduktEditor />
    </>
  );
}
