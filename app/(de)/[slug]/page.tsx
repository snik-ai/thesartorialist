import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BRANDS, getBrand } from '@/lib/brands';
import { SUIT_COLORS, getSuitColor } from '@/lib/suitColors';
import Marke, { meta as markeMeta } from '@/components/seiten/Marke';
import Farbe, { meta as farbeMeta } from '@/components/seiten/Farbe';

// Dynamische Root-Slugs: Brand-Seiten + Anzug-Farbseiten (Original-URLs
// der bestehenden Website bleiben erhalten).

export function generateStaticParams() {
  return [...BRANDS.map((b) => ({ slug: b.slug })), ...SUIT_COLORS.map((s) => ({ slug: s.slug }))];
}

export const dynamicParams = false;
export const revalidate = 900;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (getBrand(slug)) return markeMeta('de', slug);
  if (getSuitColor(slug)) return farbeMeta('de', slug);
  return {};
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  if (getBrand(slug)) return <Marke lang="de" slug={slug} />;
  if (getSuitColor(slug)) return <Farbe lang="de" slug={slug} />;
  notFound();
}
