import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import BookingWizard from '@/components/BookingWizard';

export const metadata: Metadata = {
  title: 'Kontakt & Anfahrt — Kuttelgasse 7, Zürich',
  description:
    'The Sartorialist Zürich: Kuttelgasse 7, 8001 Zürich — vis-à-vis Park Hyatt. Telefon +41 43 243 02 77, store@thesartorialist.ch. Mo–Fr 10–19 Uhr, Sa 10–17 Uhr.',
  alternates: { canonical: '/kontakt/' },
  openGraph: {
    title: 'Kontakt — The Sartorialist Zürich',
    description: 'Kuttelgasse 7, 8001 Zürich — vis-à-vis Park Hyatt.',
    url: '/kontakt/',
  },
};

export default function KontaktPage() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `The Sartorialist, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`
  )}`;

  return (
    <>
      <Breadcrumbs items={[{ name: 'Kontakt', href: '/kontakt/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Kontakt &amp; Anfahrt</span>
          <h1 className="display">Ihr Men-Shop, Stil-Berater &amp; Tailor</h1>
          <p className="lead">
            Kommen Sie in unseren Shop und lassen Sie sich bei einem feinen Kaffee
            unverbindlich zeigen, wovon wir sprechen. Am besten vereinbaren Sie einen
            Termin — damit wir ganz für Sie da sind.
          </p>
        </div>
      </section>

      <section className="container contact-grid" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div>
          <img
            src="/images/slider-1.webp"
            alt="Der Store von The Sartorialist an der Kuttelgasse 7 in Zürich"
            width={1200}
            height={600}
            fetchPriority="high"
          />
          <ul className="info-list">
            <li>
              <strong>Adresse</strong>
              {SITE.shortName} · {SITE.address.street} · {SITE.address.postalCode}{' '}
              {SITE.address.city} — vis-à-vis Park Hyatt
              <br />
              <a href={mapsUrl} target="_blank" rel="noopener">
                Route auf Google Maps
              </a>
            </li>
            <li>
              <strong>Telefon</strong>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
              {' · '}
              <a href={SITE.mobileHref}>{SITE.mobile}</a>
            </li>
            <li>
              <strong>E-Mail</strong>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <strong>Instagram</strong>
              <a href={SITE.socials.instagram} target="_blank" rel="noopener">
                @the_sartorialist_zurich
              </a>
            </li>
            <li>
              <strong>Öffnungszeiten</strong>
              <table className="hours-table">
                <tbody>
                  {SITE.openingHours.map((h) => (
                    <tr key={h.days}>
                      <td>{h.days}</td>
                      <td>{h.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="h3" style={{ marginBottom: '1rem' }}>Ihr Wunschtermin</h2>
          <BookingWizard />
          <p className="mt-2">
            <Link href="/termin/" className="text-link">
              Mehr zum Beratungsablauf
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
