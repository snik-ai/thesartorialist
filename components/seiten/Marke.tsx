// Brand-Seite (/<slug>/ bzw. /<sprache>/<slug>/): Inhalte aus lib/brands.ts, übersetzt über
// woerterbuch(lang).marken; UI-Texte aus woerterbuch(lang).brands.marke.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { getAllProducts, img as shopImg } from '@/lib/shop/catalog';
import { chf } from '@/lib/shop/format';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { markeFuer, markenFuer, markenPfad } from '@/lib/i18n/inhalte';
import { pfad, type SeitenKey } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache, slug: string): Metadata {
  const brand = markeFuer(lang, slug);
  if (!brand) return {};
  const t = woerterbuch(lang).brands.marke;
  return seitenMeta(lang, `marke:${slug}` as SeitenKey, {
    title: fmt(t.metaTitel, { name: brand.name, claim: brand.claim }),
    description: brand.metaDescription,
    ogTitle: fmt(t.ogTitel, { name: brand.name }),
    bild: brand.hero,
  });
}

export default async function Marke({ lang, slug }: { lang: Sprache; slug: string }) {
  const brand = markeFuer(lang, slug);
  if (!brand) notFound();
  const w = woerterbuch(lang).brands;
  const t = w.marke;
  // Marken aus dem Shop: echte Produktfotos statt Platzhaltern
  const produkte = brand.shopMarke
    ? (await getAllProducts().catch(() => [])).filter((p) => p.brand === brand.shopMarke && p.available).slice(0, 6)
    : [];
  const others = markenFuer(lang)
    .filter((b) => b.slug !== brand.slug)
    .slice(0, 4);
  const url = markenPfad(lang, brand.slug);

  return (
    <>
      <Breadcrumbs
        lang={lang}
        items={[
          { name: w.breadcrumb, href: pfad(lang, 'brands') },
          { name: brand.name, href: url },
        ]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{brand.origin}</span>
          <h1 className="display">{brand.name}</h1>
          <p className="lead">{brand.claim}</p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img src={brand.hero} alt={fmt(t.bildAlt, { name: brand.name })} width={800} height={1000} fetchPriority="high" />
        </div>
        <div className="split-body">
          {brand.sections.slice(0, 2).map((s) => (
            <div key={s.title} style={{ marginBottom: '1.75rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
          <Link href={pfad(lang, 'termin')} className="btn">
            {t.termin}
          </Link>
        </div>
      </section>

      {brand.sections.length > 2 && (
        <section className="section section--warm">
          <div className="container grid-2">
            {brand.sections.slice(2).map((s) => (
              <div key={s.title}>
                <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                  {s.title}
                </h2>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {produkte.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t.shopEyebrow}</span>
              <h2 className="h2">{fmt(t.shopTitel, { name: brand.name })}</h2>
            </div>
            <div className="gallery-grid gallery-grid--shop">
              {produkte.map((p) => (
                <Link key={p.handle} href={pfad(lang, 'shop', `products/${p.handle}/`)} className="brand-shopcard">
                  <img
                    src={shopImg(p.images[0].url, 700)}
                    alt={fmt(t.shopBildAlt, { titel: p.title, name: brand.name })}
                    width={600}
                    height={800}
                    loading="lazy"
                  />
                  <span className="brand-shopcard-t">{p.title}</span>
                  <span className="brand-shopcard-p num">{chf(p.price)}</span>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <Link href={pfad(lang, 'shop', `${brand.shopSlug}/`)} className="btn btn--ghost">
                {fmt(t.alleImShop, { name: brand.name })}
              </Link>
            </p>
          </div>
        </section>
      ) : brand.gallery.length > 1 ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{t.impressionenEyebrow}</span>
              <h2 className="h2">{brand.name}</h2>
            </div>
            <div className="gallery-grid">
              {brand.gallery.map((img, i) => (
                <img
                  key={img}
                  src={img}
                  alt={fmt(t.impressionAlt, { name: brand.name, n: i + 1 })}
                  width={600}
                  height={800}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.weitereEyebrow}</span>
            <h2 className="h2">{t.weitereTitel}</h2>
          </div>
        </div>
        <div className="brand-index">
          {others.map((b) => (
            <Link key={b.slug} href={markenPfad(lang, b.slug)} className="brand-row">
              <span className="name">{b.name}</span>
              <span className="claim">{b.claim}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CtaBand lang={lang} title={fmt(t.ctaTitel, { name: brand.name })} text={t.ctaText} />
      <JsonLd
        data={serviceSchema({
          name: fmt(t.schemaName, { name: brand.name }),
          description: brand.metaDescription,
          url,
          lang,
        })}
      />
    </>
  );
}
