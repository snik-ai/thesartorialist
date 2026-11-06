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
  const t = woerterbuch(lang).datenschutz.meta;
  return seitenMeta(lang, 'datenschutz', { title: t.titel, description: t.beschreibung });
}

export default function Datenschutz({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).datenschutz;
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.h1, href: pfad(lang, 'datenschutz') }]} />
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
        {t.abschnitte.map((a) => (
          <Fragment key={a.titel}>
            <h2>{a.titel}</h2>
            {a.bloecke.map((b, i) =>
              b.h3 ? (
                <h3 key={i}>{b.h3}</h3>
              ) : b.liste ? (
                <ul key={i}>
                  {b.liste.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : b.adresse ? (
                <p key={i}>
                  {SITE.founder}
                  <br />
                  {SITE.legalName}
                  <br />
                  {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}, {t.adresse.land}
                  <br />
                  {t.adresse.telefon}
                  {SITE.phone}
                  <br />
                  {t.adresse.email}
                  {SITE.email}
                </p>
              ) : b.p ? (
                <p key={i}>
                  <Rich lang={lang} text={b.p} />
                </p>
              ) : null,
            )}
          </Fragment>
        ))}
      </section>
    </>
  );
}
