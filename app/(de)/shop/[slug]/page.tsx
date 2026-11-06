import ShopKategorie, { meta, kategorieParams } from '@/components/seiten/shop/ShopKategorie';

export const revalidate = 900;
export const dynamicParams = true; // neue oder im Build nicht geladene Produkte entstehen zur Laufzeit (ISR)

export async function generateStaticParams() {
  return kategorieParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return meta('de', slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ShopKategorie lang="de" slug={slug} />;
}
