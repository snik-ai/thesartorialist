// Shop-Startseite (/shop/ bzw. /<sprache>/shop/): 3D-Kleiderschrank, alle Stücke mit
// Filtern, Links zu den Landingpages, Massanzug-Hinweis und FAQ.
// Produkttexte kommen von Shopify und bleiben Original; übersetzt wird nur die Oberfläche.
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts, toCard, ogImg } from '@/lib/shop/catalog';
import { activePages, seiteIn } from '@/lib/shop/pages';
import { shopItemList } from '@/lib/shop/seo';
import WARDROBE from '@/lib/shop/wardrobe-data.json';
import Wardrobe from '@/components/shop/Wardrobe';
import type { Piece } from '@/components/shop/WardrobeScene';
import ShopGrid, { type ShopGridTexte } from '@/components/shop/ShopGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';
import RatgeberKnopf, { RatgeberIcon } from '@/components/ratgeber/RatgeberKnopf';

/** Texte der Produktliste für den Browser — nur die Seitensprache. */
export function gridTexte(lang: Sprache): ShopGridTexte {
  const s = woerterbuch(lang).shop;
  return { grid: s.grid, karte: s.karte, preis: s.preis, werte: s.werte, groessenSysteme: s.groessenSysteme };
}

export async function meta(lang: Sprache): Promise<Metadata> {
  const t = woerterbuch(lang).shop.start.meta;
  const all = await getAllProducts();
  const og = all[0]?.images[0];
  return seitenMeta(lang, 'shop', {
    title: t.titel,
    description: fmt(t.beschreibung, { n: all.length }),
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
    bild: og ? { url: ogImg(og.url), width: 1200, height: 630, alt: t.ogAlt } : undefined,
  });
}

export default async function ShopStart({ lang }: { lang: Sprache }) {
  const s = woerterbuch(lang).shop;
  const t = s.start;
  const all = await getAllProducts();
  const byHandle = new Map(all.map((p) => [p.handle, p]));
  const pieces: Piece[] = (WARDROBE as { handle: string; hang: 'buegel' | 'klammer'; w: number; h: number }[])
    .map((w) => {
      const p = byHandle.get(w.handle);
      return p && p.available ? { ...w, title: p.title, brand: p.brand, price: p.price } : null;
    })
    .filter((x): x is Piece => !!x);
  const pages = activePages(all).map((pg) => seiteIn(lang, pg));
  const faq = t.faq.map((f) => ({ q: f.q, a: f.a.map((a) => fmt(a, { strasse: SITE.address.street })) }));

  return (
    <>
      {pieces.length >= 6 ? (
        <Wardrobe pieces={pieces} count={all.length} lang={lang} t={s.schrank} />
      ) : (
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">{s.schrank.eyebrow}</span>
            <h1 className="display">{s.schrank.h1}</h1>
          </div>
        </section>
      )}

      <Breadcrumbs lang={lang} items={[{ name: 'Shop', href: pfad(lang, 'shop') }]} />

      <section className="section shop-section" id="sortiment">
        <div className="container">
          <div className="shop-head">
            <div>
              <span className="eyebrow">{t.sortimentEyebrow}</span>
              <h2 className="h2">{t.alleStuecke}</h2>
            </div>
          </div>
          <ShopGrid items={all.map(toCard)} lang={lang} t={gridTexte(lang)} />
          <nav className="shop-links shop-links--foot" aria-label={t.direktZuAria}>
            <span className="eyebrow">{t.direktZu}</span>
            {pages.map((pg) => (
              <Link key={pg.slug} href={pfad(lang, 'shop', `${pg.slug}/`)} className="chip">
                {pg.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container split-cta">
          <div>
            <span className="eyebrow">{t.mass.eyebrow}</span>
            <h2 className="h2">{t.mass.titel}</h2>
            <p className="lead">{t.mass.text}</p>
          </div>
          <div className="split-cta-actions">
            <Link href={pfad(lang, 'massanzug')} className="btn">
              {t.mass.knopf}
            </Link>
            <Link href={pfad(lang, 'termin')} className="btn btn--ghost">
              {t.mass.termin}
            </Link>
            {/* dezent: Gratis-Ratgeber zum Massanzug */}
            <RatgeberKnopf track="ratgeber-shop">
              <RatgeberIcon /> {woerterbuch(lang).allgemein.client.ratgeber.knopf}
            </RatgeberKnopf>
          </div>
        </div>
      </section>

      <Faq lang={lang} items={faq} title={t.faqTitel} />
      <JsonLd data={shopItemList(all, lang)} />
    </>
  );
}
