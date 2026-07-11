import type { Metadata } from 'next';
import Link from 'next/link';
import { BRANDS } from '@/lib/brands';
import { SUIT_COLORS } from '@/lib/suitColors';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, itemListSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Brands — Unsere Manufakturen',
  description:
    'Die Brands von The Sartorialist Zürich: Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso, Jacob Cohën, Paul & Shark und Woolrich — familiengeführte Manufakturen, persönlich ausgewählt.',
  alternates: { canonical: '/category/brand/' },
  openGraph: {
    title: 'Brands — The Sartorialist Zürich',
    description: 'Familiengeführte Manufakturen, persönlich ausgewählt.',
    url: '/category/brand/',
  },
};

export default function BrandsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Brands', href: '/category/brand/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Unsere Brands</span>
          <h1 className="display">Die echten Gesichter hinter den Marken</h1>
          <p className="lead">
            Wir arbeiten ausschliesslich mit familiengeführten Unternehmen zusammen, die
            wir persönlich kennen. Jede Manufaktur wird von Meistern ihres Fachs geführt
            und blickt auf jahrzehntelange Tradition zurück.
          </p>
        </div>
      </section>

      <div className="brand-index" style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        {BRANDS.map((brand) => (
          <Link key={brand.slug} href={`/${brand.slug}/`} className="brand-row">
            <span className="name">{brand.name}</span>
            <span className="claim">
              {brand.claim} · {brand.origin}
            </span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Massanfertigung</span>
            <h2 className="h2">Anzüge nach Farbe</h2>
          </div>
          <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {SUIT_COLORS.map((c) => (
              <Link key={c.slug} href={`/${c.slug}/`} className="product-card">
                <div className="product-media">
                  <img
                    src={c.hero}
                    alt={`${c.name} — massgeschneidert in Zürich`}
                    width={600}
                    height={800}
                    loading="lazy"
                  />
                </div>
                <div className="product-info">
                  <h3>{c.name}</h3>
                  <p className="sub">{c.claim}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
      <JsonLd
        data={itemListSchema(BRANDS.map((b) => ({ name: b.name, url: `/${b.slug}/` })))}
      />
    </>
  );
}
