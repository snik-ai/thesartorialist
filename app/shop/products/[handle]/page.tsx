import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, getProduct, ogImg, related, toCard } from '@/lib/shop/catalog';
import { SHOP_PAGES } from '@/lib/shop/pages';
import { productGroupSchema, shareMeta } from '@/lib/shop/seo';
import { chf, clip } from '@/lib/shop/format';
import Gallery from '@/components/shop/Gallery';
import BuyBox from '@/components/shop/BuyBox';
import ShopCard from '@/components/shop/ShopCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import CtaBand from '@/components/CtaBand';
import { SITE } from '@/lib/site';

export const revalidate = 900;

export async function generateStaticParams() {
  const all = await getAllProducts();
  return all.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return {};
  const description = clip(
    p.seoDescription ||
      `${p.title} von ${p.brand} bei The Sartorialist Zürich, ${chf(p.price)}. ${p.description} Online bestellen oder im Showroom anprobieren.`,
  );
  return {
    title: p.seoTitle || `${p.title} — ${p.brand}`,
    description,
    alternates: { canonical: `/shop/products/${p.handle}/` },
    ...shareMeta({
      title: `${p.title} — ${p.brand}`,
      description,
      url: `/shop/products/${p.handle}/`,
      image: ogImg(p.images[0].url),
      alt: p.images[0].alt,
    }),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const all = await getAllProducts();
  const p = all.find((x) => x.handle === handle);
  if (!p) notFound();
  const brandPage = SHOP_PAGES.find((pg) => pg.group === 'Marke' && pg.label === p.brand);
  const catPage = SHOP_PAGES.find((pg) => pg.group === 'Kategorie' && pg.match(p));
  const more = related(all, p, 4);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Shop', href: '/shop/' },
          ...(brandPage ? [{ name: brandPage.label, href: `/shop/${brandPage.slug}/` }] : []),
          { name: p.title, href: `/shop/products/${p.handle}/` },
        ]}
      />
      <section className="section spdp">
        <div className="container spdp-grid">
          <Gallery images={p.images} title={p.title} />
          <div className="spdp-info">
            <span className="eyebrow">
              {brandPage ? <Link href={`/shop/${brandPage.slug}/`}>{p.brand}</Link> : p.brand} · {p.gender}
            </span>
            <h1 className="spdp-title">{p.title}</h1>
            <p className="spdp-price num">
              {p.compareAt && <s>{chf(p.compareAt)}</s>} {chf(p.price)}
            </p>
            <BuyBox variants={p.variants} />
            <ul className="spdp-facts">
              <li>Versand in die ganze Schweiz, Kosten im Checkout</li>
              <li>
                Anprobe im Showroom: {SITE.address.street}, {SITE.address.city}
              </li>
              <li>
                Persönliche Beratung: <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
            </ul>
            {p.descriptionHtml && (
              <details className="spdp-desc" open>
                <summary>Beschreibung</summary>
                <div className="spdp-desc-body" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
              </details>
            )}
            <div className="spdp-links">
              {catPage && (
                <Link href={`/shop/${catPage.slug}/`} className="text-link">
                  Alle {catPage.label}
                </Link>
              )}
              <Link href="/massanzug-zuerich/" className="text-link">
                Massanzug dazu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="section section--warm">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Passt dazu</span>
              <h2 className="h2">Mehr aus dem Kleiderschrank</h2>
            </div>
            <div className="shop-grid">
              {more.map((q) => (
                <ShopCard key={q.handle} p={toCard(q)} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand
        eyebrow="Beratung im Store"
        title="Lieber anprobieren? Wir legen es für Sie bereit."
        text="Termin buchen oder Rückruf anfordern — wir beraten Sie zu Grösse, Kombination und passendem Massanzug."
      />
      <JsonLd data={productGroupSchema(p)} />
    </>
  );
}
