import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, itemListSchema } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { markenFuer, markenPfad } from '@/lib/i18n/inhalte';
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

      <CtaBand lang={lang} />
      <JsonLd data={itemListSchema(marken.map((b) => ({ name: b.name, url: markenPfad(lang, b.slug) })))} />
    </>
  );
}
