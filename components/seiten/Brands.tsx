import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, itemListSchema } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { farbenFuer, farbPfad, markenFuer, markenPfad } from '@/lib/i18n/inhalte';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).brands.meta;
  return seitenMeta(lang, 'brands', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

export default function Brands({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).brands;
  const marken = markenFuer(lang);
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: pfad(lang, 'brands') }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="display">{t.hero.h1}</h1>
          <p className="lead">{t.hero.lead}</p>
        </div>
      </section>

      <div className="brand-index" style={{ marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        {marken.map((brand) => (
          <Link key={brand.slug} href={markenPfad(lang, brand.slug)} className="brand-row">
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
            <span className="eyebrow">{t.farben.eyebrow}</span>
            <h2 className="h2">{t.farben.titel}</h2>
          </div>
          <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {farbenFuer(lang).map((c) => (
              <Link key={c.slug} href={farbPfad(lang, c.slug)} className="product-card">
                <div className="product-media">
                  <img src={c.hero} alt={fmt(t.farben.bildAlt, { name: c.name })} width={600} height={800} loading="lazy" />
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

      <CtaBand lang={lang} />
      <JsonLd data={itemListSchema(marken.map((b) => ({ name: b.name, url: markenPfad(lang, b.slug) })))} />
    </>
  );
}
