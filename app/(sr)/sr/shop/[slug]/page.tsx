import ShopKategorie, { meta, kategorieParams } from '@/components/seiten/shop/ShopKategorie';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;
export const dynamicParams = true; // neue oder im Build nicht geladene Produkte entstehen zur Laufzeit (ISR)

export async function generateStaticParams() {
  return istAktiv('sr') ? kategorieParams() : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return istAktiv('sr') ? meta('sr', slug) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (!istAktiv('sr')) notFound();
  const { slug } = await params;
  return <ShopKategorie lang="sr" slug={slug} />;
}
