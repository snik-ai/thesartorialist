import type { Metadata } from 'next';
import { COLLECTION } from '@/lib/collection';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, itemListSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Kollektion — Massanzüge, Hochzeitsanzüge & Masshemden',
  description:
    'Die Kollektion von The Sartorialist Zürich: Massanzüge ab CHF 1’690, Hochzeitsanzüge, Smoking und Masshemden. Kein Kauf von der Stange — jedes Stück wird nach Ihren Massen gefertigt. Termin buchen.',
  alternates: { canonical: '/kollektion/' },
  openGraph: {
    title: 'Kollektion — The Sartorialist Zürich',
    description: 'Massanzüge ab CHF 1’690 — jedes Stück nach Ihren Massen gefertigt.',
    url: '/kollektion/',
  },
};

const CATEGORIES = ['Business', 'Hochzeit', 'Masshemd'] as const;

export default function KollektionPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Kollektion', href: '/kollektion/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Die Kollektion</span>
          <h1 className="display">Nicht kaufen. Buchen.</h1>
          <p className="lead">
            Jedes Stück wird in Ihrer persönlichen Grösse gefertigt — Full Canvas,
            100&nbsp;% Made in Italy, in 20 Arbeitstagen abholbereit. Wählen Sie Ihren
            Favoriten und buchen Sie Ihren Termin im Showroom.
          </p>
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const pieces = COLLECTION.filter((p) => p.category === cat);
        if (pieces.length === 0) return null;
        return (
          <section className="section" key={cat} style={{ paddingTop: '2rem' }}>
            <div className="container">
              <div className="section-head">
                <h2 className="h2">{cat === 'Masshemd' ? 'Masshemden' : cat}</h2>
              </div>
              <div className="product-grid">
                {pieces.map((piece, i) => (
                  <ProductCard key={piece.slug} piece={piece} lazy={cat !== 'Business' || i > 2} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <CtaBand
        title="Nicht sicher, welcher Anzug zu Ihnen passt?"
        text="Wir beraten ehrlich, welcher Schnitt, Stoff und Stil zu Ihrer Figur passt — klassisch, modern, italienisch oder britisch."
      />
      <JsonLd
        data={itemListSchema(
          COLLECTION.map((p) => ({ name: p.name, url: `/kollektion/${p.slug}/` }))
        )}
      />
    </>
  );
}
