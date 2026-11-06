// Shop-Landingpage (/shop/<slug>/): Marke, Damen/Herren oder Kategorie.
// Texte aus lib/shop/pages.ts (Deutsch), in anderen Sprachen überlagert aus dem Wörterbuch.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllProducts, toCard, ogImg } from '@/lib/shop/catalog';
import { SHOP_PAGES, activePages, pageProducts, seiteIn } from '@/lib/shop/pages';
import { shopItemList } from '@/lib/shop/seo';
import ShopGrid from '@/components/shop/ShopGrid';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd } from '@/components/JsonLd';
import { gridTexte } from './ShopStart';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { markenPfad } from '@/lib/i18n/inhalte';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export async function kategorieParams(): Promise<{ slug: string }[]> {
  const all = await getAllProducts();
  return activePages(all).map((p) => ({ slug: p.slug }));
}

export async function meta(lang: Sprache, slug: string): Promise<Metadata> {
  const roh = SHOP_PAGES.find((p) => p.slug === slug);
  if (!roh) return {};
  const page = seiteIn(lang, roh);
  const t = woerterbuch(lang).shop.kategorie;
  const items = pageProducts(page, await getAllProducts());
  const og = items[0]?.images[0];
  return seitenMeta(lang, 'shop', {
    title: page.title,
    description: page.description,
    ogTitle: fmt(t.ogTitel, { h1: page.h1 }),
    bild: og ? { url: ogImg(og.url), width: 1200, height: 630, alt: page.h1 } : undefined,
    rest: `${page.slug}/`,
  });
}

export default async function ShopKategorie({ lang, slug }: { lang: Sprache; slug: string }) {
  const roh = SHOP_PAGES.find((p) => p.slug === slug);
  if (!roh) notFound();
  const page = seiteIn(lang, roh);
  const s = woerterbuch(lang).shop;
  const t = s.kategorie;
  const all = await getAllProducts();
  const items = pageProducts(page, all);
  if (!items.length) notFound();
  const others = activePages(all)
    .filter((p) => p.slug !== page.slug)
    .map((p) => seiteIn(lang, p));
  const hide = page.group === 'Marke' ? (['brand'] as const) : page.group === 'Für' ? (['gender'] as const) : ([] as const);
  const seite = (sl: string) => pfad(lang, 'shop', `${sl}/`);

  return (
    <>
      <Breadcrumbs
        lang={lang}
        items={[
          { name: 'Shop', href: pfad(lang, 'shop') },
          { name: page.label, href: seite(page.slug) },
        ]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">
            {fmt(t.eyebrow, { gruppe: page.group === 'Für' ? page.label : (s.gruppen[page.group] ?? page.group) })}
          </span>
          <h1 className="display">{page.h1}</h1>
          <p className="lead">{page.intro}</p>
          {page.brandPage && (
            <Link href={markenPfad(lang, page.brandPage)} className="text-link" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              {fmt(t.mehrUeber, { label: page.label })}
            </Link>
          )}
        </div>
      </section>

      <section className="section shop-section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <ShopGrid items={items.map(toCard)} lang={lang} t={gridTexte(lang)} hide={[...hide]} />
          <nav className="shop-links shop-links--foot" aria-label={t.weitereAria}>
            <Link href={pfad(lang, 'shop')} className="chip">
              {t.alleStuecke}
            </Link>
            {others.map((pg) => (
              <Link key={pg.slug} href={seite(pg.slug)} className="chip">
                {pg.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <CtaBand lang={lang} title={t.ctaTitel} text={t.ctaText} />
      <JsonLd data={shopItemList(items, lang)} />
    </>
  );
}
