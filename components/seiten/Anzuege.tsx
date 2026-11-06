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
  const t = woerterbuch(lang).anzuege.meta;
  return seitenMeta(lang, 'anzuege', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

export default function Anzuege({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).anzuege;
  const url = pfad(lang, 'anzuege');
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: url }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="display">{t.hero.h1}</h1>
          <p className="lead">{t.hero.lead}</p>
          <div className="hero-cta">
            <Link href={pfad(lang, 'konfigurator')} className="btn">
              {t.hero.gestalten}
            </Link>
            <Link href={pfad(lang, 'termin')} className="btn btn--ghost">
              {t.hero.termin}
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="grid-2">
          {t.abschnitte.map((s) => (
            <div key={s.titel}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.titel}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand lang={lang} />
      <JsonLd data={serviceSchema({ name: t.schema.name, description: t.schema.beschreibung, url, lang })} />
    </>
  );
}
