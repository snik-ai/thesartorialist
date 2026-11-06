import type { Metadata } from 'next';
import { Fragment } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Rich from '@/components/i18n/Rich';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).impressum.meta;
  return seitenMeta(lang, 'impressum', {
    title: t.titel,
    description: t.beschreibung,
    robots: { index: true, follow: true },
  });
}

export default function Impressum({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).impressum;
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.h1, href: pfad(lang, 'impressum') }]} />
      <section className="page-hero">
        <div className="container">
          <h1 className="display">{t.h1}</h1>
          {/* Fremdsprachen: Hinweis, dass die deutsche Fassung massgeblich ist */}
          {lang !== 'de' && (
            <p className="lead">
              <Rich lang={lang} text={t.hinweisMassgeblich} />
            </p>
          )}
        </div>
      </section>
      <section className="container prose" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <h2>{t.unternehmen.titel}</h2>
        <p>
          {SITE.legalName}
          <br />
          {SITE.address.street}
          <br />
          {SITE.address.postalCode} {SITE.address.city}, {t.unternehmen.land}
        </p>
        <p>
          {t.unternehmen.vertreten}
          {SITE.founder}
        </p>

        <h2>{t.kontakt.titel}</h2>
        <p>
          {t.kontakt.telefon}
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          <br />
          {t.kontakt.email}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>

        {t.abschnitte.map((a) => (
          <Fragment key={a.titel}>
            <h2>{a.titel}</h2>
            {a.absaetze.map((p) => (
              <p key={p}>
                <Rich lang={lang} text={p} />
              </p>
            ))}
          </Fragment>
        ))}
      </section>
    </>
  );
}
