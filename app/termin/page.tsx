import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';
import BookingWizard from '@/components/BookingWizard';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Termin buchen — Beratung im Showroom Zürich',
  description:
    'Buchen Sie Ihren persönlichen Beratungstermin bei The Sartorialist Zürich: 60–90 Minuten Stilberatung, Stoffauswahl und Massnahme — kostenlos und unverbindlich. Kuttelgasse 7, vis-à-vis Park Hyatt.',
  alternates: { canonical: '/termin/' },
  openGraph: {
    title: 'Termin buchen — The Sartorialist Zürich',
    description: 'Kostenlose Beratung im Showroom: Stil, Stoffe, Massnahme.',
    url: '/termin/',
  },
};

const STEPS = [
  { t: 'Persönliches Gespräch', d: 'Anlass, Stil, Farben — wir lernen Sie und Ihre Wünsche kennen.' },
  { t: 'Stoffauswahl', d: 'Sehen, fühlen, vergleichen: edelste italienische Stoffe, von Leinen bis Kaschmir.' },
  { t: 'Schnittberatung', d: 'Klassisch, modern, italienisch oder britisch — ehrlich beraten, was zu Ihrer Figur passt.' },
  { t: 'Vermessung', d: 'Präzises Massnehmen mit über 30 Parametern — das Fundament der Passform.' },
  { t: 'Designentscheidung', d: 'Kragenform, Taschen, Knöpfe, Innenfutter, Initialen und weitere Details.' },
  { t: 'Anprobe & Feinschliff', d: 'Zwei bis drei Wochen später: Anprobe — kleine Änderungen direkt vor Ort.' },
];

export default function TerminPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Termin buchen', href: '/termin/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Showroom Zürich</span>
          <h1 className="display">Buchen Sie Ihren Termin</h1>
          <p className="lead">
            60–90 Minuten persönliche Beratung — kostenlos und unverbindlich. Bei einem
            feinen Espresso zeigen wir Ihnen, wovon wir sprechen.
          </p>
        </div>
      </section>

      <section className="container contact-grid" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div>
          <h2 className="h3" style={{ marginBottom: '1rem' }}>Ihr Wunschtermin</h2>
          <BookingWizard />
        </div>
        <div>
          <h2 className="h3">Direkt erreichen</h2>
          <ul className="info-list">
            <li>
              <strong>Showroom</strong>
              {SITE.shortName} · {SITE.address.street} · {SITE.address.postalCode}{' '}
              {SITE.address.city} — vis-à-vis Park Hyatt
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
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Der Ablauf</span>
            <h2 className="h2">So läuft Ihre Beratung ab</h2>
          </div>
          <div className="grid-2">
            {STEPS.map((s, i) => (
              <div key={s.t} style={{ display: 'flex', gap: '1.25rem' }}>
                <span className="serif" style={{ fontSize: '1.6rem', color: 'var(--muted)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
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
      <JsonLd
        data={serviceSchema({
          name: 'Beratungstermin Massanzug Zürich',
          description:
            'Kostenlose 60–90-minütige Stilberatung mit Stoffauswahl und Massnahme im Showroom von The Sartorialist Zürich.',
          url: '/termin/',
        })}
      />
    </>
  );
}
