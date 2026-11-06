import Produkt, { meta, produktParams } from '@/components/seiten/shop/Produkt';

export const revalidate = 900;

export async function generateStaticParams() {
  return produktParams();
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return meta('de', handle);
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <Produkt lang="de" handle={handle} />;
}
