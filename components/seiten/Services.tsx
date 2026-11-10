import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import Rich from '@/components/i18n/Rich';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';
import RatgeberBlock from '@/components/ratgeber/RatgeberBlock';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).services.meta;
  return seitenMeta(lang, 'services', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

export default function Services({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).services;
  const url = pfad(lang, 'services');
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

      <section className="container" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {t.leistungen.map((s) => (
            <div key={s.titel} style={{ borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.titel}
              </h2>
              <p className="muted">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-2">
          <Rich lang={lang} text={t.hinweis} linkKlasse="text-link" />
        </p>
      </section>

      <RatgeberBlock lang={lang} />
      <CtaBand lang={lang} title={t.cta.titel} text={t.cta.text} />
      <JsonLd data={serviceSchema({ name: t.schema.name, description: t.schema.beschreibung, url, lang })} />
    </>
  );
}
