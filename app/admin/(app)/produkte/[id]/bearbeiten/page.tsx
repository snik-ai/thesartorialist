import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/admin/Icon';
import ProduktEditor from '@/components/produkte/ProduktEditor';
import { produktLaden } from '@/components/produkte/server';
import { UUID } from '@/lib/admin/zugang';
import '../../produkte.css';

export const metadata: Metadata = { title: 'Produkt bearbeiten' };
export const dynamic = 'force-dynamic';

export default async function ProduktBearbeiten({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = UUID.test(id) ? await produktLaden(id) : null;
  if (!p) notFound();
  return (
    <>
      <Link href={`/admin/produkte/${p.id}/`} className="a-zurueck">
        <Icon name="zurueck" width={16} height={16} /> {p.name}
      </Link>
      <div className="a-kopf">
        <div>
          <span className="a-kicker">Produkt bearbeiten</span>
          <h1>{p.name}</h1>
          <p className="a-sub">Änderungen gelten für neue Positionen — bestehende Angebote und Rechnungen bleiben unverändert.</p>
        </div>
      </div>
      <ProduktEditor produkt={p} />
    </>
  );
}
