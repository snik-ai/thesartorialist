import Produkt, { meta, produktParams } from '@/components/seiten/shop/Produkt';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateStaticParams() {
  return istAktiv('ru') ? produktParams() : [];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return istAktiv('ru') ? meta('ru', handle) : {};
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  if (!istAktiv('ru')) notFound();
  const { handle } = await params;
  return <Produkt lang="ru" handle={handle} />;
}
