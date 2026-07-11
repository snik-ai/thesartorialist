import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COLLECTION, getPiece } from '@/lib/collection';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { JsonLd, productSchema } from '@/components/JsonLd';

export function generateStaticParams() {
  return COLLECTION.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) return {};
  return {
    title: `${piece.name} — ${piece.subtitle}`,
    description: `${piece.name} von The Sartorialist Zürich: ${piece.description[0].slice(0, 140)}…`,
    alternates: { canonical: `/kollektion/${piece.slug}/` },
    openGraph: {
      title: `${piece.name} — The Sartorialist Zürich`,
      description: piece.description[0],
      url: `/kollektion/${piece.slug}/`,
      images: [{ url: piece.image }],
    },
  };
}

export default async function PiecePage({ params }: Props) {
  const { slug } = await params;
  const piece = getPiece(slug);
  if (!piece) notFound();

  const related = COLLECTION.filter(
    (p) => p.slug !== piece.slug && p.category === piece.category
  ).slice(0, 3);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Kollektion', href: '/kollektion/' },
          { name: piece.name, href: `/kollektion/${piece.slug}/` },
        ]}
      />
      <div className="container pdp">
        <div className="pdp-gallery">
          <img
            src={piece.gallery[0]}
            alt={`${piece.name} — ${piece.subtitle}`}
            width={900}
            height={1200}
            fetchPriority="high"
          />
          {piece.gallery.length > 1 && (
            <div className="pair">
              {piece.gallery.slice(1, 3).map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt={`${piece.name} — Detailansicht ${i + 1}`}
                  width={600}
                  height={800}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <span className="eyebrow">{piece.category}</span>
          <h1>{piece.name}</h1>
          <p className="sub">
            {piece.subtitle} · Stoffe von {piece.fabrics}
          </p>
          <p className="price">{piece.price}</p>
          <div className="desc">
            {piece.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mtm-box">
            <strong>Dieses Stück wird in Ihrer persönlichen Grösse angefertigt.</strong>
            Besuchen Sie unseren Showroom an der Kuttelgasse 7, um sich vermessen zu
            lassen — die Beratung dauert 60–90 Minuten und ist kostenlos.
            <Link href="/termin/" className="btn btn--wide">
              Buchen Sie Ihren Termin
            </Link>
          </div>

          <ul className="pdp-details">
            {piece.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--warm">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Passend dazu</span>
              <h2 className="h2">Das könnte Ihnen auch gefallen</h2>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.slug} piece={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={productSchema({
          name: piece.name,
          description: piece.description.join(' '),
          image: piece.image,
          url: `/kollektion/${piece.slug}/`,
        })}
      />
    </>
  );
}
