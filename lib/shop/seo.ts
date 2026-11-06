// Strukturierte Daten für den Shop (Produkt mit Grössen als ProductGroup).
// URLs in der Seitensprache; Metadaten (Canonical, hreflang, og:locale) über
// seitenMeta() aus lib/i18n/seo.ts. Nur auf dem Server verwenden.
import { SITE } from '@/lib/site';
import { ORG_ID } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';
import { img, type ShopProduct } from './catalog';

/** Absolute URL einer Produktseite in der Sprache. */
export const produktUrl = (lang: Sprache, handle: string) => `${SITE.url}${pfad(lang, 'shop', `products/${handle}/`)}`;

export function productGroupSchema(p: ShopProduct, lang: Sprache = 'de') {
  const url = produktUrl(lang, p.handle);
  const groesse = woerterbuch(lang).shop.produkt.groesse;
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
      name: `${p.title} — ${fmt(groesse, { groesse: v.size ?? '' })}`,
      sku: v.id.split('/').pop(),
      size: v.size,
      image: images[0],
      offers: offer(v.price, v.available),
    })),
  };
}

export function shopItemList(items: ShopProduct[], lang: Sprache = 'de') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: produktUrl(lang, p.handle),
      name: p.title,
    })),
  };
}
