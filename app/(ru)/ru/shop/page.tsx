import ShopStart, { meta } from '@/components/seiten/shop/ShopStart';
import { istAktiv } from '@/lib/i18n/sprachen';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateMetadata() {
  return istAktiv('ru') ? meta('ru') : {};
}

export default async function Page() {
  if (!istAktiv('ru')) notFound();
  return <ShopStart lang="ru" />;
}
