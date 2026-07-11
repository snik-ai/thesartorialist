import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { COLLECTION } from '@/lib/collection';
import { BRANDS } from '@/lib/brands';
import { SUIT_COLORS } from '@/lib/suitColors';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly'
  ) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    entry('/', 1, 'weekly'),
    entry('/kollektion/', 0.9, 'weekly'),
    entry('/termin/', 0.9),
    entry('/massanzug-zuerich/', 0.9),
    entry('/hochzeitsanzug-zuerich/', 0.9),
    entry('/hochzeit-anzug-2024/', 0.8),
    entry('/anzuege-zuerich/', 0.8),
    entry('/category/brand/', 0.8),
    entry('/ueber-uns/', 0.7),
    entry('/kontakt/', 0.8),
    entry('/services/', 0.6),
    entry('/newsletter/', 0.4),
    ...COLLECTION.map((p) => entry(`/kollektion/${p.slug}/`, 0.7)),
    ...BRANDS.map((b) => entry(`/${b.slug}/`, 0.7)),
    ...SUIT_COLORS.map((s) => entry(`/${s.slug}/`, 0.7)),
    entry('/impressum/', 0.2, 'yearly'),
    entry('/datenschutzerklaerung/', 0.2, 'yearly'),
    entry('/allgemeine-geschaeftsbedingungen/', 0.2, 'yearly'),
  ];
}
