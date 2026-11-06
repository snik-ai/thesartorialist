import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, toCard, ogImg } from '@/lib/shop/catalog';
import { SHOP_PAGES, activePages, pageProducts } from '@/lib/shop/pages';
import { shareMeta, shopItemList } from '@/lib/shop/seo';
import ShopGrid from '@/components/shop/ShopGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd } from '@/components/JsonLd';

export const revalidate = 900;
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getAllProducts();
  return activePages(all).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = SHOP_PAGES.find((p) => p.slug === slug);
  if (!page) return {};
  const items = pageProducts(page, await getAllProducts());
  const og = items[0]?.images[0];
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/shop/${page.slug}/` },
    ...shareMeta({
      title: `${page.h1} — The Sartorialist Zürich`,
      description: page.description,
      url: `/shop/${page.slug}/`,
      image: og ? ogImg(og.url) : undefined,
      alt: page.h1,
    }),
  };
}

export default async function ShopLanding({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = SHOP_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();
  const all = await getAllProducts();
  const items = pageProducts(page, all);
  if (!items.length) notFound();
  const others = activePages(all).filter((p) => p.slug !== page.slug);
  const hide = page.group === 'Marke' ? (['brand'] as const) : page.group === 'Für' ? (['gender'] as const) : ([] as const);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Shop', href: '/shop/' },
          { name: page.label, href: `/shop/${page.slug}/` },
        ]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Shop · {page.group === 'Für' ? page.label : page.group}</span>
          <h1 className="display">{page.h1}</h1>
          <p className="lead">{page.intro}</p>
          {page.brandPage && (
            <Link href={page.brandPage} className="text-link" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Mehr über {page.label}
            </Link>
          )}
        </div>
      </section>

      <section className="section shop-section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <ShopGrid items={items.map(toCard)} hide={[...hide]} />
          <nav className="shop-links shop-links--foot" aria-label="Weitere Shop-Bereiche">
            <Link href="/shop/" className="chip">
              Alle Stücke
            </Link>
            {others.map((pg) => (
              <Link key={pg.slug} href={`/shop/${pg.slug}/`} className="chip">
                {pg.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <CtaBand
        title="Lieber anprobieren?"
        text="Alle Stücke aus dem Shop führen wir auch im Showroom an der Kuttelgasse 7 — dazu Massanzüge ab CHF 1’690."
      />
      <JsonLd data={shopItemList(items)} />
    </>
  );
}
