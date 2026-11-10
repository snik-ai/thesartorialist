// Anzug-Farbseite (/anzug-blau/ usw.): Inhalte aus lib/suitColors.ts, übersetzt über
// woerterbuch(lang).farben; UI-Texte aus woerterbuch(lang).brands.farbe.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { farbeFuer, farbenFuer, farbPfad } from '@/lib/i18n/inhalte';
import { pfad, type SeitenKey } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';
import RatgeberBlock from '@/components/ratgeber/RatgeberBlock';

export function meta(lang: Sprache, slug: string): Metadata {
  const color = farbeFuer(lang, slug);
  if (!color) return {};
  return seitenMeta(lang, `farbe:${slug}` as SeitenKey, {
    title: color.title,
    description: color.metaDescription,
    bild: color.hero,
  });
}

export default async function Farbe({ lang, slug }: { lang: Sprache; slug: string }) {
  const color = farbeFuer(lang, slug);
  if (!color) notFound();
  const t = woerterbuch(lang).brands.farbe;
  const otherColors = farbenFuer(lang).filter((s) => s.slug !== color.slug);
  const url = farbPfad(lang, color.slug);

  return (
    <>
      <Breadcrumbs
        lang={lang}
        items={[
          { name: t.breadcrumbMassanzug, href: pfad(lang, 'massanzug') },
          { name: color.name, href: url },
        ]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="display">{color.name}</h1>
          <p className="lead">{color.claim}</p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img src={color.hero} alt={fmt(t.bildAlt, { name: color.name })} width={800} height={1000} fetchPriority="high" />
        </div>
        <div className="split-body">
          {color.sections.slice(0, 2).map((s) => (
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

      <section className="section section--warm">
        <div className="container grid-2">
          {color.sections.slice(2).map((s) => (
            <div key={s.title}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
          <div>
            <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
              {t.weitereFarben}
            </h2>
            <p>
              {otherColors.map((s, i) => (
                <span key={s.slug}>
                  <Link href={farbPfad(lang, s.slug)} className="text-link">
                    {s.name}
                  </Link>
                  {i < otherColors.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <RatgeberBlock lang={lang} hell />
      <CtaBand lang={lang} title={fmt(t.ctaTitel, { name: color.name })} text={t.ctaText} />
      <JsonLd
        data={serviceSchema({
          name: fmt(t.schemaName, { name: color.name }),
          description: color.metaDescription,
          url,
          lang,
        })}
      />
    </>
  );
}
