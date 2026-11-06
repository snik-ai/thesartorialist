import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import MassblattAnsicht from '@/components/admin/MassblattAnsicht';
import { UUID } from '@/lib/admin/zugang';

export const metadata: Metadata = { title: 'Massblatt' };
export const dynamic = 'force-dynamic';

export default async function MassblattSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [m] = await db().select().from(schema.massblatt).where(eq(schema.massblatt.id, id)).limit(1);
  if (!m) notFound();
  return <MassblattAnsicht kontaktId={m.kontaktId} m={m} />;
}
