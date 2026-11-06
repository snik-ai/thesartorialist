import ShopStart, { meta } from '@/components/seiten/shop/ShopStart';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateMetadata() {
  return istAktiv('it') ? meta('it') : {};
}

export default async function Page() {
  if (!istAktiv('it')) notFound();
  return <ShopStart lang="it" />;
}
