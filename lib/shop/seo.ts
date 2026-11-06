// Strukturierte Daten für den Shop (Produkt mit Grössen als ProductGroup).
import { SITE } from '@/lib/site';
import { ORG_ID } from '@/components/JsonLd';
import type { Metadata } from 'next';
import { img, type ShopProduct } from './catalog';

/** Vollständige Teilen-Metadaten (OG + Twitter) für Shop-Seiten. */
export function shareMeta(o: { title: string; description: string; url: string; image?: string; alt: string }): Pick<Metadata, 'openGraph' | 'twitter'> {
  const images = o.image ? [{ url: o.image, width: 1200, height: 630, alt: o.alt }] : undefined;
  return {
    openGraph: { type: 'website', locale: SITE.locale, siteName: SITE.name, title: o.title, description: o.description, url: o.url, images },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images },
  };
}

export function productGroupSchema(p: ShopProduct) {
  const url = `${SITE.url}/shop/products/${p.handle}/`;
  const images = p.images.slice(0, 6).map((i) => img(i.url, 1200));
  const offer = (price: number, available: boolean) => ({
    '@type': 'Offer',
    url,
    price: price.toFixed(2),
    priceCurrency: 'CHF',
    availability: available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORG_ID },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CH' },
    },
  });
  const sized = p.variants.filter((v) => v.size);
  if (sized.length < 2) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${url}#product`,
      name: p.title,
      description: p.description || p.title,
      image: images,
      brand: { '@type': 'Brand', name: p.brand },
      url,
      offers: offer(p.price, p.available),
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${url}#product`,
    name: p.title,
    description: p.description || p.title,
    image: images,
    brand: { '@type': 'Brand', name: p.brand },
    url,
    productGroupID: p.id.split('/').pop(),
    variesBy: ['https://schema.org/size'],
    hasVariant: sized.map((v) => ({
      '@type': 'Product',
      name: `${p.title} — Grösse ${v.size}`,
      sku: v.id.split('/').pop(),
      size: v.size,
      image: images[0],
      offers: offer(v.price, v.available),
    })),
  };
}

export function shopItemList(items: ShopProduct[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE.url}/shop/products/${p.handle}/`,
      name: p.title,
    })),
  };
}
