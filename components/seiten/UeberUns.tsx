import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';
import RatgeberBlock from '@/components/ratgeber/RatgeberBlock';

const BILDER = [
  '/images/the-sartorialist-zuerich.webp',
  '/images/Foto-mit-Schere.webp',
  '/images/massanzug-zuerich.webp',
  '/images/eleganter-hochzeitsanzug.webp',
  '/images/dreiteiler-anzug.webp',
  '/images/hochzeitsanzug.webp',
];

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).ueberUns.meta;
  return seitenMeta(lang, 'ueberUns', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
    bild: '/images/Foto-mit-Schere.webp',
  });
}

export default function UeberUns({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).ueberUns;
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: pfad(lang, 'ueberUns') }]} />
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
            src="/images/Foto-mit-Schere.webp"
            alt={fmt(t.gruender.bildAlt, { gruender: SITE.founder })}
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          <span className="eyebrow">{t.gruender.eyebrow}</span>
          <h2 className="h2">{t.gruender.titel}</h2>
          {t.gruender.absaetze.map((a) => (
            <p key={a}>{a}</p>
          ))}
          <Link href={pfad(lang, 'termin')} className="btn">
            {t.gruender.termin}
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.galerie.eyebrow}</span>
            <h2 className="h2">{t.galerie.titel}</h2>
          </div>
          <div className="gallery-grid">
            {BILDER.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={fmt(t.galerie.bildAlt, { n: i + 1 })}
                width={600}
                height={800}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <RatgeberBlock lang={lang} hell />
      <CtaBand lang={lang} />
    </>
  );
}
