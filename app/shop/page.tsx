import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts, toCard, ogImg } from '@/lib/shop/catalog';
import { activePages } from '@/lib/shop/pages';
import { shareMeta, shopItemList } from '@/lib/shop/seo';
import WARDROBE from '@/lib/shop/wardrobe-data.json';
import Wardrobe from '@/components/shop/Wardrobe';
import type { Piece } from '@/components/shop/WardrobeScene';
import ShopGrid from '@/components/shop/ShopGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const all = await getAllProducts();
  const og = all[0]?.images[0];
  return {
    title: 'Shop — Woolrich, Gran Sasso & Tramarossa online kaufen',
    description: `Der Online-Shop von The Sartorialist Zürich: ${all.length} ausgewählte Stücke — Woolrich Parkas, Gran Sasso Strick, Tramarossa Sakkos. Versand in der ganzen Schweiz oder Anprobe im Showroom.`,
    alternates: { canonical: '/shop/' },
    ...shareMeta({
      title: 'Der Kleiderschrank — Shop The Sartorialist Zürich',
      description: 'Woolrich, Gran Sasso und Tramarossa online bestellen — oder im Showroom an der Kuttelgasse 7 anprobieren.',
      url: '/shop/',
      image: og ? ogImg(og.url) : undefined,
      alt: 'Shop The Sartorialist Zürich',
    }),
  };
}

const SHOP_FAQ = [
  {
    q: 'Wohin liefert der Shop von The Sartorialist?',
    a: ['Wir liefern in die ganze Schweiz. Versandkosten und Lieferzeit sehen Sie im Checkout, bevor Sie bestellen.'],
  },
  {
    q: 'Kann ich die Stücke vor dem Kauf anprobieren?',
    a: [
      `Ja. Alle Stücke im Shop führen wir auch im Showroom an der ${SITE.address.street} in Zürich. Buchen Sie einen Termin, dann legen wir Ihre Grösse bereit.`,
    ],
  },
  {
    q: 'Wie bezahle ich im Shop?',
    a: ['Bezahlt wird im sicheren Shopify-Checkout. Welche Zahlungsarten verfügbar sind, sehen Sie dort im letzten Schritt.'],
  },
  {
    q: 'Gibt es im Shop auch Massanzüge?',
    a: [
      'Nein. Ein Massanzug entsteht nach Ihren Massen und beginnt deshalb mit einem Termin im Showroom: ab CHF 1’690, Full Canvas, 100 % Made in Italy, in 20 Arbeitstagen abholbereit. Im Shop finden Sie die passenden Stücke dazu — Strick, Parkas, Mäntel und Sakkos.',
    ],
  },
];

export default async function ShopPage() {
  const all = await getAllProducts();
  const byHandle = new Map(all.map((p) => [p.handle, p]));
  const pieces: Piece[] = (WARDROBE as { handle: string; hang: 'buegel' | 'klammer'; w: number; h: number }[])
    .map((w) => {
      const p = byHandle.get(w.handle);
      return p && p.available ? { ...w, title: p.title, brand: p.brand, price: p.price } : null;
    })
    .filter((x): x is Piece => !!x);
  const pages = activePages(all);

  return (
    <>
      {pieces.length >= 6 ? (
        <Wardrobe pieces={pieces} count={all.length} />
      ) : (
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Shop · The Sartorialist Zürich</span>
            <h1 className="display">Der Kleiderschrank</h1>
          </div>
        </section>
      )}

      <Breadcrumbs items={[{ name: 'Shop', href: '/shop/' }]} />

      <section className="section shop-section" id="sortiment">
        <div className="container">
          <div className="shop-head">
            <div>
              <span className="eyebrow">Sortiment</span>
              <h2 className="h2">Alle Stücke</h2>
            </div>
          </div>
          <ShopGrid items={all.map(toCard)} />
          <nav className="shop-links shop-links--foot" aria-label="Shop nach Marke und Kategorie">
            <span className="eyebrow">Direkt zu</span>
            {pages.map((pg) => (
              <Link key={pg.slug} href={`/shop/${pg.slug}/`} className="chip">
                {pg.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container split-cta">
          <div>
            <span className="eyebrow">Der Massanzug</span>
            <h2 className="h2">Was Sie hier nicht finden, nähen wir nach Mass.</h2>
            <p className="lead">
              Unser Kerngeschäft ist der Massanzug: Full Canvas, 100&nbsp;% Made in Italy, ab CHF&nbsp;1’690 und in 20
              Arbeitstagen abholbereit. Die Stücke im Shop sind die Begleiter dazu.
            </p>
          </div>
          <div className="split-cta-actions">
            <Link href="/massanzug-zuerich/" className="btn">
              Massanzug entdecken
            </Link>
            <Link href="/termin/" className="btn btn--ghost">
              Termin buchen
            </Link>
          </div>
        </div>
      </section>

      <Faq items={SHOP_FAQ} title="Fragen zum Shop" />
      <JsonLd data={shopItemList(all)} />
    </>
  );
}
