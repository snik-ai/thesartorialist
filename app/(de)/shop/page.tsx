import ShopStart, { meta } from '@/components/seiten/shop/ShopStart';

export const revalidate = 900;

export async function generateMetadata() {
  return meta('de');
}

export default async function Page() {
  return <ShopStart lang="de" />;
}
