import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import BookingWizard from '@/components/BookingWizard';
import RueckrufButton from '@/components/RueckrufButton';
import InstagramBand from '@/components/InstagramBand';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import { seitenMeta } from '@/lib/i18n/seo';
import type { Sprache } from '@/lib/i18n/sprachen';

export function meta(lang: Sprache): Metadata {
  const t = woerterbuch(lang).kontakt.meta;
  return seitenMeta(lang, 'kontakt', {
    title: t.titel,
    description: t.beschreibung,
    ogTitle: t.ogTitel,
    ogDescription: t.ogBeschreibung,
  });
}

export default function Kontakt({ lang }: { lang: Sprache }) {
  const w = woerterbuch(lang);
  const t = w.kontakt;
  // Postadresse bleibt in allen Sprachen «Kuttelgasse 7, 8001 Zürich»
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `The Sartorialist, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`,
  )}`;

  return (
    <>
      <Breadcrumbs lang={lang} items={[{ name: t.breadcrumb, href: pfad(lang, 'kontakt') }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t.hero.eyebrow}</span>
          <h1 className="display">{t.hero.h1}</h1>
          <p className="lead">{t.hero.lead}</p>
        </div>
      </section>

      <section className="container contact-grid" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div>
          <img src="/images/slider-1.webp" alt={t.bildAlt} width={1200} height={600} fetchPriority="high" />
          <ul className="info-list">
            <li>
              <strong>{t.info.adresse}</strong>
              {SITE.shortName} · {SITE.address.street} · {SITE.address.postalCode} {SITE.address.city}
              <br />
              <a href={mapsUrl} target="_blank" rel="noopener">
                {t.info.route}
              </a>
            </li>
            <li>
              <strong>{t.info.telefon}</strong>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              {' · '}
              <a href={SITE.mobileHref}>{SITE.mobile}</a>
            </li>
            <li>
              <strong>{t.info.email}</strong>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <strong>{t.info.instagram}</strong>
              <a href={SITE.socials.instagram} target="_blank" rel="noopener">
                @the_sartorialist_zurich
              </a>
            </li>
            <li>
              <strong>{t.info.oeffnungszeiten}</strong>
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
        <div>
          <h2 className="h3" style={{ marginBottom: '1rem' }}>
            {t.wunschtermin}
          </h2>
          <BookingWizard lang={lang} t={w.termin.wizard} />
          <p className="mt-2">
            <Link href={pfad(lang, 'termin')} className="text-link">
              {t.ablauf}
            </Link>
          </p>
          <div className="kontakt-alt">
            <p>{t.alternativ.frage}</p>
            <RueckrufButton className="btn btn--ghost">{t.alternativ.rueckruf}</RueckrufButton>
            <a
              className="btn btn--ghost"
              href={`${SITE.whatsapp}?text=${encodeURIComponent(t.alternativ.waText)}`}
              target="_blank"
              rel="noopener"
            >
              {t.alternativ.whatsapp}
            </a>
          </div>
        </div>
      </section>
      <InstagramBand lang={lang} />
    </>
  );
}
