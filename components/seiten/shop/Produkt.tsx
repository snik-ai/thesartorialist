// Produktseite (/shop/products/<handle>/). Titel, Beschreibung und Bilder kommen von
// Shopify und bleiben Original (Deutsch); übersetzt werden Oberfläche, Metadaten-Vorlage,
// Links und JSON-LD-URLs.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { preconnect } from 'react-dom';
import { getAllProducts, getProduct, ogImg, related, toCard } from '@/lib/shop/catalog';
import { SHOP_PAGES, seiteIn } from '@/lib/shop/pages';
import { productGroupSchema } from '@/lib/shop/seo';
import { chf, clip } from '@/lib/shop/format';
import Gallery from '@/components/shop/Gallery';
import BuyBox from '@/components/shop/BuyBox';
import ShopCard from '@/components/shop/ShopCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import CtaBand from '@/components/CtaBand';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export async function produktParams(): Promise<{ handle: string }[]> {
  const all = await getAllProducts();
  return all.map((p) => ({ handle: p.handle }));
}

export async function meta(lang: Sprache, handle: string): Promise<Metadata> {
  const p = await getProduct(handle);
  if (!p) return {};
  const t = woerterbuch(lang).shop.produkt;
  const titel = fmt(t.metaTitel, { titel: p.title, marke: p.brand });
  // SEO-Texte aus Shopify sind deutsch: nur auf der deutschen Seite verwenden
  const description = clip(
    (lang === 'de' && p.seoDescription) ||
      fmt(t.metaBeschreibung, { titel: p.title, marke: p.brand, preis: chf(p.price), text: p.description }),
  );
  return seitenMeta(lang, 'shop', {
    title: (lang === 'de' && p.seoTitle) || titel,
    description,
    ogTitle: titel,
    bild: { url: ogImg(p.images[0].url), width: 1200, height: 630, alt: p.images[0].alt },
    rest: `products/${p.handle}/`,
  });
}

export default async function Produkt({ lang, handle }: { lang: Sprache; handle: string }) {
  const all = await getAllProducts();
  const p = all.find((x) => x.handle === handle);
  if (!p) notFound();
  const s = woerterbuch(lang).shop;
  const t = s.produkt;
  const brandRoh = SHOP_PAGES.find((pg) => pg.group === 'Marke' && pg.label === p.brand);
  const catRoh = SHOP_PAGES.find((pg) => pg.group === 'Kategorie' && pg.match(p));
  const brandPage = brandRoh && seiteIn(lang, brandRoh);
  const catPage = catRoh && seiteIn(lang, catRoh);
  const more = related(all, p, 4);
  const seite = (sl: string) => pfad(lang, 'shop', `${sl}/`);
  const self = pfad(lang, 'shop', `products/${p.handle}/`);

  preconnect('https://cdn.shopify.com');
  return (
    <>
      <Breadcrumbs
        lang={lang}
        items={[
          { name: 'Shop', href: pfad(lang, 'shop') },
          ...(brandPage ? [{ name: brandPage.label, href: seite(brandPage.slug) }] : []),
          { name: p.title, href: self },
        ]}
      />
      <section className="section spdp">
        <div className="container spdp-grid">
          <Gallery images={p.images} title={p.title} t={s.galerie} />
          <div className="spdp-info">
            <span className="eyebrow">
              {brandPage ? <Link href={seite(brandPage.slug)}>{p.brand}</Link> : p.brand} · {s.werte[p.gender] ?? p.gender}
            </span>
            <h1 className="spdp-title">{p.title}</h1>
            <p className="spdp-price num">
              {p.compareAt && <s>{chf(p.compareAt)}</s>} {chf(p.price)}
            </p>
            <BuyBox variants={p.variants} t={s.buybox} terminHref={pfad(lang, 'termin')} />
            <ul className="spdp-facts">
              <li>{t.versand}</li>
              <li>{fmt(t.anprobe, { strasse: SITE.address.street, stadt: SITE.address.city })}</li>
              <li>
                {t.beratung} <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
            </ul>
            {p.descriptionHtml && (
              <details className="spdp-desc" open>
                <summary>{t.beschreibung}</summary>
                <div className="spdp-desc-body" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
              </details>
            )}
            <div className="spdp-links">
              {catPage && (
                <Link href={seite(catPage.slug)} className="text-link">
                  {fmt(t.alleKategorie, { label: catPage.label })}
                </Link>
              )}
              <Link href={pfad(lang, 'massanzug')} className="text-link">
                {t.massDazu}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="section section--warm">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t.passtEyebrow}</span>
              <h2 className="h2">{t.mehrTitel}</h2>
            </div>
            <div className="shop-grid">
              {more.map((q) => (
                <ShopCard key={q.handle} p={toCard(q)} lang={lang} t={s.karte} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand lang={lang} eyebrow={t.ctaEyebrow} title={t.ctaTitel} text={t.ctaText} />
      <JsonLd data={productGroupSchema(p, lang)} />
    </>
  );
}
