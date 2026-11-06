import { SITE } from '@/lib/site';
import { SPRACH_INFO, type Sprache } from '@/lib/i18n/sprachen';

// Zentrale JSON-LD-Helfer — jede Seite injiziert nur, was sie braucht.

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const ORG_ID = `${SITE.url}/#organization`;

export function organizationSchema(beschreibung: string = SITE.description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    image: `${SITE.url}/images/the-sartorialist-zuerich.webp`,
    logo: `${SITE.url}/images/sartorialist-zurich-logo.png`,
    description: beschreibung,
    founder: { '@type': 'Person', name: SITE.founder },
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: SITE.priceRange,
    currenciesAccepted: 'CHF',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.address.lat,
      longitude: SITE.address.lng,
    },
    openingHours: SITE.openingHoursSchema,
    areaServed: SITE.areaServed,
    sameAs: [SITE.socials.instagram],
  };
}

export function websiteSchema(lang: Sprache = 'de') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: SPRACH_INFO[lang].html,
    publisher: { '@id': ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.href}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; url: string; lang?: Sprache }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.url}`,
    ...(opts.lang ? { inLanguage: SPRACH_INFO[opts.lang].html } : {}),
    provider: { '@id': ORG_ID },
    areaServed: SITE.areaServed,
  };
}

export function productSchema(opts: {
  name: string;
  description: string;
  image: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: opts.description,
    image: `${SITE.url}${opts.image}`,
    url: `${SITE.url}${opts.url}`,
    brand: { '@type': 'Brand', name: SITE.shortName },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'CHF',
      price: '1690',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: '1690',
        priceCurrency: 'CHF',
      },
      availability: 'https://schema.org/InStoreOnly',
      seller: { '@id': ORG_ID },
    },
  };
}

export function itemListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE.url}${item.url}`,
    })),
  };
}
