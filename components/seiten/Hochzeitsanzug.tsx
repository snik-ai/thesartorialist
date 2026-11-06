import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import Faq from '@/components/Faq';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).hochzeitsanzug.meta;
  return seitenMeta(lang, 'hochzeitsanzug', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
    bild: '/images/Hochzeitsanzug-Zurich-scaled.webp',
  });
}

export default function Hochzeitsanzug({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).hochzeitsanzug;
  const url = pfad(lang, 'hochzeitsanzug');
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: url }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="display">{t.hero.h1}</h1>
          <p className="lead">{t.hero.lead}</p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src="/images/Hochzeitsanzug-Zurich-scaled.webp"
            alt={t.warum.bildAlt}
            width={800}
            height={1100}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          <h2 className="h2">{t.warum.titel}</h2>
          <ul className="checklist">
            {t.warum.liste.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="mt-2">{t.warum.text}</p>
          <Link href={pfad(lang, 'termin')} className="btn">
            {t.warum.knopf}
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          {t.bloecke.map((b) => (
            <div key={b.titel}>
              <span className="eyebrow">{b.eyebrow}</span>
              <h2 className="h2" style={{ marginBottom: '1rem' }}>
                {b.titel}
              </h2>
              {b.absaetze.map((a, i) => (
                <p key={a} className={i > 0 ? 'mt-1' : undefined}>
                  {a}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Faq lang={lang} items={t.faq} title={t.faqTitel} />
      <CtaBand lang={lang} title={t.cta.titel} text={t.cta.text} />
      <JsonLd data={serviceSchema({ name: t.schema.name, description: t.schema.beschreibung, url, lang })} />
    </>
  );
}
