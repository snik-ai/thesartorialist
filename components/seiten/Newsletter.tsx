import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).newsletter.meta;
  return seitenMeta(lang, 'newsletter', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

export default function Newsletter({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).newsletter;
  const subject = encodeURIComponent(t.mail.betreff);
  const body = encodeURIComponent(t.mail.text);
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: pfad(lang, 'newsletter') }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="display">{t.h1}</h1>
          <p className="lead">{t.lead}</p>
          <div className="hero-cta">
            <a href={`mailto:${SITE.email}?subject=${subject}&body=${body}`} className="btn">
              {t.knopf}
            </a>
          </div>
          <p className="muted mt-2" style={{ fontSize: '0.85rem' }}>
            {fmt(t.hinweis, { email: SITE.email })}
          </p>
        </div>
      </section>
    </>
  );
}
