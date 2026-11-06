import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).hochzeit2024.meta;
  return seitenMeta(lang, 'hochzeit2024', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
    bild: '/images/braeutigam-anzug-zuerich.webp',
  });
}

export default function Hochzeit2024({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).hochzeit2024;
  const url = pfad(lang, 'hochzeit2024');
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: url }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="display">{t.hero.h1}</h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="hero-cta">
            <Link href={pfad(lang, 'termin')} className="btn">
              {t.hero.knopf}
            </Link>
          </div>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src="/images/braeutigam-anzug-zuerich.webp"
            alt={t.bildAlt}
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          {t.abschnitte.slice(0, 2).map((s) => (
            <div key={s.titel} style={{ marginBottom: '1.75rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.titel}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          {t.abschnitte.slice(2).map((s) => (
            <div key={s.titel}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.titel}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand lang={lang} title={t.cta.titel} text={t.cta.text} />
      <JsonLd data={serviceSchema({ name: t.schema.name, description: t.schema.beschreibung, url, lang })} />
    </>
  );
}
