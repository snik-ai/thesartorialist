import ShopStart, { meta } from '@/components/seiten/shop/ShopStart';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateMetadata() {
  return istAktiv('en') ? meta('en') : {};
}

export default async function Page() {
  if (!istAktiv('en')) notFound();
  return <ShopStart lang="en" />;
}
