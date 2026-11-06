import Produkt, { meta, produktParams } from '@/components/seiten/shop/Produkt';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateStaticParams() {
  return istAktiv('sr') ? produktParams() : [];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return istAktiv('sr') ? meta('sr', handle) : {};
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  if (!istAktiv('sr')) notFound();
  const { handle } = await params;
  return <Produkt lang="sr" handle={handle} />;
}
