import type { Metadata } from 'next';
import { Fragment } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import Rich from '@/components/i18n/Rich';
import { SITE } from '@/lib/site';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).agb.meta;
  return seitenMeta(lang, 'agb', { title: t.titel, description: t.beschreibung });
}

export default function Agb({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).agb;
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: pfad(lang, 'agb') }]} />
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
        <p>
          <Rich lang={lang} text={t.einleitung} />
        </p>
        {t.abschnitte.map((a) => (
          <Fragment key={a.titel}>
            <h2>{a.titel}</h2>
            {a.bloecke.map((b, i) =>
              b.h3 ? (
                <h3 key={i}>{b.h3}</h3>
              ) : b.schritte ? (
                <ol key={i}>
                  {b.schritte.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ol>
              ) : b.liste ? (
                <ul key={i}>
                  {b.liste.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : b.p ? (
                <p key={i}>
                  <Rich lang={lang} text={fmt(b.p, { email: SITE.email })} />
                </p>
              ) : null,
            )}
          </Fragment>
        ))}
      </section>
    </>
  );
}
