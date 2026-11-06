import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import BookingWizard from '@/components/BookingWizard';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).termin.meta;
  return seitenMeta(lang, 'termin', { title: t.titel, description: t.beschreibung, ogTitle: t.ogTitel, ogDescription: t.ogBeschreibung });
}

export default function Termin({ lang }: { lang: Sprache }) {
  const w = woerterbuch(lang);
  const t = w.termin;
  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: pfad(lang, 'termin') }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="display">{t.h1}</h1>
          <p className="lead">{t.lead}</p>
        </div>
      </section>

      <section className="container contact-grid" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div>
          <h2 className="h3" style={{ marginBottom: '1rem' }}>{t.wunschtermin}</h2>
          <BookingWizard lang={lang} t={t.wizard} />
        </div>
        <div>
          <h2 className="h3">{t.direkt}</h2>
          <ul className="info-list">
            <li>
              <strong>{t.labels.showroom}</strong>
              {SITE.shortName} · {SITE.address.street} · {SITE.address.postalCode}{' '}
              {SITE.address.city}
            </li>
            <li>
              <strong>{t.labels.telefon}</strong>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              {' · '}
              <a href={SITE.mobileHref}>{SITE.mobile}</a>
            </li>
            <li>
              <strong>{t.labels.email}</strong>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <strong>{t.labels.instagram}</strong>
              <a href={SITE.socials.instagram} target="_blank" rel="noopener">
                @the_sartorialist_zurich
              </a>
            </li>
            <li>
              <strong>{t.labels.zeiten}</strong>
              <table className="hours-table">
                <tbody>
                  {w.allgemein.client.oeffnungszeiten.map((h) => (
                    <tr key={h.tage}>
                      <td>{h.tage}</td>
                      <td>{h.zeit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          </ul>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.ablaufEyebrow}</span>
            <h2 className="h2">{t.ablaufTitel}</h2>
          </div>
          <div className="grid-2">
            {t.schritte.map((s) => (
              <div key={s.t}>
                <div>
                  <h3 className="h3" style={{ fontSize: '1.1rem' }}>
                    {s.t}
                  </h3>
                  <p className="muted" style={{ fontSize: '0.95rem' }}>
                    {s.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <JsonLd data={serviceSchema({ name: t.schema.name, description: t.schema.beschreibung, url: pfad(lang, 'termin'), lang })} />
    </>
  );
}
