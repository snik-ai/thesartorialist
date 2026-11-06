import ShopKategorie, { meta, kategorieParams } from '@/components/seiten/shop/ShopKategorie';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;
export const dynamicParams = false;

export async function generateStaticParams() {
  return istAktiv('pt-pt') ? kategorieParams() : [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return istAktiv('pt-pt') ? meta('pt-pt', slug) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  if (!istAktiv('pt-pt')) notFound();
  const { slug } = await params;
  return <ShopKategorie lang="pt-pt" slug={slug} />;
}
