import ShopKategorie, { meta, kategorieParams } from '@/components/seiten/shop/ShopKategorie';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;
export const dynamicParams = true; // neue oder im Build nicht geladene Produkte entstehen zur Laufzeit (ISR)

export async function generateStaticParams() {
  return istAktiv('sq') ? kategorieParams() : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return istAktiv('sq') ? meta('sq', slug) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (!istAktiv('sq')) notFound();
  const { slug } = await params;
  return <ShopKategorie lang="sq" slug={slug} />;
}
