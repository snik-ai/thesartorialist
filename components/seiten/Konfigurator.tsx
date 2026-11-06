// Massanzug-Konfigurator «Styles & Options» — in allen Sprachen dieselbe Seite.
// Deutsch: Katalog unverändert aus lib/konfigurator/daten.ts (keine Überlagerung an den
// Client). Fremdsprachen: nur die Überlagerung der jeweiligen Sprache geht als Prop mit.
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import Faq from '@/components/Faq';
import Konfigurator from '@/components/konfigurator/Konfigurator';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { KONFIG_KATEGORIEN } from '@/lib/konfigurator/daten';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

const anzahl = KONFIG_KATEGORIEN.reduce((n, k) => n + k.subCategories.reduce((m, u) => m + u.options.length, 0), 0);

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).konfigurator.meta;
  return seitenMeta(lang, 'konfigurator', {
    title: t.titel,
    description: fmt(t.beschreibung, { anzahl }),
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

export default function KonfiguratorSeite({ lang }: { lang: Sprache }) {
  const w = woerterbuch(lang);
  const t = w.konfigurator;
  const selbst = pfad(lang, 'konfigurator');
  return (
    <>
      <Breadcrumbs
        lang={lang}
        items={[
          { name: t.breadcrumb.massanzug, href: pfad(lang, 'massanzug') },
          { name: t.breadcrumb.seite, href: selbst },
        ]}
      />
      <section className="page-hero konf-hero">
        <div className="container">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="display">{t.hero.h1}</h1>
          <p className="lead">{t.hero.lead}</p>
          <ul className="konf-hints">
            {t.hero.hinweise.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </section>

      <Konfigurator
        lang={lang}
        t={{ ui: t.ui, pdf: t.pdf }}
        {...(lang === 'de' ? {} : { uebersetzung: w.konfigDaten })}
      />

      <section className="section section--warm">
        <div className="container split-text">
          <div>
            <h2 className="h2">{t.sogehts.titel}</h2>
            {t.sogehts.absaetze.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div>
            <h2 className="h2">{t.zuerich.titel}</h2>
            <p>{t.zuerich.text}</p>
            <p>
              <Link href={pfad(lang, 'massanzug')} className="text-link">
                {t.zuerich.linkMassanzug}
              </Link>{' '}
              ·{' '}
              <Link href={pfad(lang, 'hochzeitsanzug')} className="text-link">
                {t.zuerich.linkHochzeit}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Faq lang={lang} items={t.faq} title={t.faqTitel} />
      <CtaBand lang={lang} title={t.cta.titel} text={t.cta.text} />
      <JsonLd
        data={serviceSchema({
          name: t.schema.name,
          description: t.schema.beschreibung,
          url: selbst,
          ...(lang === 'de' ? {} : { lang }),
        })}
      />
    </>
  );
}
