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
import AnzugFarben from '@/components/AnzugFarben';
import RatgeberBlock from '@/components/ratgeber/RatgeberBlock';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).massanzug.meta;
  return seitenMeta(lang, 'massanzug', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
    bild: '/images/massanzug-zuerich.webp',
  });
}

export default function Massanzug({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).massanzug;
  const url = pfad(lang, 'massanzug');
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
          <img src="/images/massanzug-zuerich.webp" alt={t.luxus.bildAlt} width={800} height={1000} fetchPriority="high" />
        </div>
        <div className="split-body">
          <h2 className="h2">{t.luxus.titel}</h2>
          {t.luxus.absaetze.map((a) => (
            <p key={a}>{a}</p>
          ))}
          <Link href={pfad(lang, 'termin')} className="btn">
            {t.luxus.knopf}
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          {t.verarbeitung.map((v) => (
            <div key={v.titel}>
              <span className="eyebrow">{v.eyebrow}</span>
              <h2 className="h2" style={{ marginBottom: '1rem' }}>
                {v.titel}
              </h2>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split-cta">
          <div>
            <span className="eyebrow">{t.konfigurator.eyebrow}</span>
            <h2 className="h2">{t.konfigurator.titel}</h2>
            <p className="lead">{t.konfigurator.lead}</p>
          </div>
          <div className="split-cta-actions">
            <Link href={pfad(lang, 'konfigurator')} className="btn">
              {t.konfigurator.knopf}
            </Link>
          </div>
        </div>
      </section>

      <AnzugFarben lang={lang} />
      <Faq lang={lang} items={t.faq} title={t.faqTitel} />
      <RatgeberBlock lang={lang} />
      <CtaBand lang={lang} title={t.cta.titel} text={t.cta.text} />
      <JsonLd data={serviceSchema({ name: t.schema.name, description: t.schema.beschreibung, url, lang })} />
    </>
  );
}
