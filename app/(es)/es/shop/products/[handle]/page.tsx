import Produkt, { meta, produktParams } from '@/components/seiten/shop/Produkt';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateStaticParams() {
  return istAktiv('es') ? produktParams() : [];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return istAktiv('es') ? meta('es', handle) : {};
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  if (!istAktiv('es')) notFound();
  const { handle } = await params;
  return <Produkt lang="es" handle={handle} />;
}
