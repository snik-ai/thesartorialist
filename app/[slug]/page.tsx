import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BRANDS, getBrand } from '@/lib/brands';
import { SUIT_COLORS, getSuitColor } from '@/lib/suitColors';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

// Dynamische Root-Slugs: 8 Brand-Seiten + 3 Anzug-Farbseiten (Original-URLs
// der bestehenden Website bleiben erhalten).

export function generateStaticParams() {
  return [
    ...BRANDS.map((b) => ({ slug: b.slug })),
    ...SUIT_COLORS.map((s) => ({ slug: s.slug })),
  ];
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (brand) {
    return {
      title: `${brand.name} — ${brand.claim}`,
      description: brand.metaDescription,
      alternates: { canonical: `/${brand.slug}/` },
      openGraph: {
        title: `${brand.name} bei The Sartorialist Zürich`,
        description: brand.metaDescription,
        url: `/${brand.slug}/`,
        images: [{ url: brand.hero }],
      },
    };
  }
  const color = getSuitColor(slug);
  if (color) {
    return {
      title: color.title,
      description: color.metaDescription,
      alternates: { canonical: `/${color.slug}/` },
      openGraph: {
        title: color.title,
        description: color.metaDescription,
        url: `/${color.slug}/`,
        images: [{ url: color.hero }],
      },
    };
  }
  return {};
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (brand) return <BrandPage brand={brand} />;
  const color = getSuitColor(slug);
  if (color) return <SuitColorPage color={color} />;
  notFound();
}

function BrandPage({ brand }: { brand: NonNullable<ReturnType<typeof getBrand>> }) {
  const others = BRANDS.filter((b) => b.slug !== brand.slug).slice(0, 4);
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Brands', href: '/category/brand/' },
          { name: brand.name, href: `/${brand.slug}/` },
        ]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{brand.origin}</span>
          <h1 className="display">{brand.name}</h1>
          <p className="lead">{brand.claim}</p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src={brand.hero}
            alt={`${brand.name} bei The Sartorialist Zürich`}
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          {brand.sections.slice(0, 2).map((s) => (
            <div key={s.title} style={{ marginBottom: '1.75rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
          <Link href="/termin/" className="btn">
            Termin buchen
          </Link>
        </div>
      </section>

      {brand.sections.length > 2 && (
        <section className="section section--warm">
          <div className="container grid-2">
            {brand.sections.slice(2).map((s) => (
              <div key={s.title}>
                <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                  {s.title}
                </h2>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Impressionen</span>
            <h2 className="h2">{brand.name} in unserem Store</h2>
          </div>
          <div className="gallery-grid">
            {brand.gallery.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`${brand.name} — Impression ${i + 1} aus dem Store von The Sartorialist Zürich`}
                width={600}
                height={800}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Weitere Brands</span>
            <h2 className="h2">Entdecken Sie unsere Manufakturen</h2>
          </div>
        </div>
        <div className="brand-index">
          {others.map((b) => (
            <Link key={b.slug} href={`/${b.slug}/`} className="brand-row">
              <span className="name">{b.name}</span>
              <span className="claim">{b.claim}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand
        title={`${brand.name} live erleben — im Showroom an der Kuttelgasse.`}
        text="Lassen Sie sich bei einem unverbindlichen Espresso beraten und begeistern."
      />
      <JsonLd
        data={serviceSchema({
          name: `${brand.name} in Zürich`,
          description: brand.metaDescription,
          url: `/${brand.slug}/`,
        })}
      />
    </>
  );
}

function SuitColorPage({ color }: { color: NonNullable<ReturnType<typeof getSuitColor>> }) {
  const otherColors = SUIT_COLORS.filter((s) => s.slug !== color.slug);
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Kollektion', href: '/kollektion/' },
          { name: color.name, href: `/${color.slug}/` },
        ]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Massanfertigung</span>
          <h1 className="display">{color.name}</h1>
          <p className="lead">{color.claim}</p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src={color.hero}
            alt={`${color.name} — massgeschneidert von The Sartorialist Zürich`}
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          {color.sections.slice(0, 2).map((s) => (
            <div key={s.title} style={{ marginBottom: '1.75rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
          <Link href="/termin/" className="btn">
            Termin buchen
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          {color.sections.slice(2).map((s) => (
            <div key={s.title}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
          <div>
            <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
              Weitere Farben
            </h2>
            <p>
              {otherColors.map((s, i) => (
                <span key={s.slug}>
                  <Link href={`/${s.slug}/`} className="text-link">
                    {s.name}
                  </Link>
                  {i < otherColors.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <CtaBand
        title={`Ihr ${color.name} nach Mass — ab CHF 1’690.`}
        text="Stoffwahl, Massnahme und Beratung im Showroom an der Kuttelgasse 7, Zürich."
      />
      <JsonLd
        data={serviceSchema({
          name: `${color.name} nach Mass in Zürich`,
          description: color.metaDescription,
          url: `/${color.slug}/`,
        })}
      />
    </>
  );
}
