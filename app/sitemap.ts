import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { BRANDS } from '@/lib/brands';
import { SUIT_COLORS } from '@/lib/suitColors';
import { getAllProducts } from '@/lib/shop/catalog';
import { activePages } from '@/lib/shop/pages';
import { GLOSSAR } from '@/lib/glossar';
import { pfad, sprachenFuer, type SeitenKey } from '@/lib/i18n/routen';
import { sprachAlternativen } from '@/lib/i18n/seo';

export const revalidate = 3600;

type Eintrag = MetadataRoute.Sitemap[number];

// Jede Seite in jeder freigeschalteten Sprache, mit hreflang-Alternativen (lib/i18n/routen.json).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getAllProducts().catch(() => []);
  const abs = (p: string) => `${SITE.url}${p}`;

  /** Eine Seite in allen Sprachen, in denen es sie gibt */
  const seite = (
    key: SeitenKey,
    priority: number,
    changeFrequency: Eintrag['changeFrequency'] = 'monthly',
    rest = '',
    lastModified: Date = now,
  ): Eintrag[] => {
    const alt = Object.fromEntries(Object.entries(sprachAlternativen(key, rest)).map(([k, v]) => [k, abs(v)]));
    const sprachen = sprachenFuer(key);
    return sprachen.map((lang) => ({
      url: abs(pfad(lang, key, rest)),
      lastModified,
      changeFrequency,
      priority,
      ...(sprachen.length > 1 ? { alternates: { languages: alt } } : {}),
    }));
  };
  const nurDe = (path: string, priority: number, changeFrequency: Eintrag['changeFrequency'] = 'monthly'): Eintrag => ({
    url: abs(path),
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    ...seite('start', 1, 'weekly'),
    ...seite('termin', 0.9),
    ...seite('massanzug', 0.9),
    ...seite('konfigurator', 0.8),
    // Glossar vorerst nur Deutsch
    nurDe('/glossar/', 0.7, 'weekly'),
    ...GLOSSAR.map((b) => nurDe(`/glossar/${b.slug}/`, 0.6)),
    ...seite('hochzeitsanzug', 0.9),
    ...seite('hochzeit2024', 0.8),
    ...seite('anzuege', 0.8),
    ...seite('brands', 0.8),
    ...seite('ueberUns', 0.7),
    ...seite('kontakt', 0.8),
    ...seite('services', 0.6),
    ...seite('newsletter', 0.4),
    ...BRANDS.flatMap((b) => seite(`marke:${b.slug}` as SeitenKey, 0.7)),
    ...SUIT_COLORS.flatMap((s) => seite(`farbe:${s.slug}` as SeitenKey, 0.7)),
    ...seite('shop', 0.7, 'daily'),
    ...activePages(products).flatMap((pg) => seite('shop', 0.6, 'weekly', `${pg.slug}/`)),
    ...products.flatMap((p) => seite('shop', 0.5, 'weekly', `products/${encodeURI(p.handle)}/`, new Date(p.updatedAt))),
    ...seite('impressum', 0.2, 'yearly'),
    ...seite('datenschutz', 0.2, 'yearly'),
    ...seite('agb', 0.2, 'yearly'),
  ];
}
