import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Newsletter — Angebote & Neuheiten',
  description:
    'Abonnieren Sie den Newsletter von The Sartorialist Zürich und erhalten Sie unsere neuesten Angebote — jederzeit abbestellbar.',
  alternates: { canonical: '/newsletter/' },
  openGraph: {
    title: 'Newsletter — The Sartorialist Zürich',
    description: 'Neuheiten, Kollektionen und Angebote direkt in Ihr Postfach.',
    url: '/newsletter/',
  },
};

export default function NewsletterPage() {
  const subject = encodeURIComponent('Newsletter-Anmeldung');
  const body = encodeURIComponent(
    'Guten Tag\n\nIch möchte den Newsletter von The Sartorialist abonnieren.\n\nName:\nE-Mail:\n\nFreundliche Grüsse'
  );
  return (
    <>
      <Breadcrumbs items={[{ name: 'Newsletter', href: '/newsletter/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Bleiben Sie informiert</span>
          <h1 className="display">Newsletter</h1>
          <p className="lead">
            Abonnieren Sie unseren Newsletter und erhalten Sie unsere neuesten Angebote,
            Kollektionen und Einladungen. Sie können den Newsletter jederzeit wieder
            abbestellen.
          </p>
          <div className="hero-cta">
            <a href={`mailto:${SITE.email}?subject=${subject}&body=${body}`} className="btn">
              Jetzt anmelden
            </a>
          </div>
          <p className="muted mt-2" style={{ fontSize: '0.85rem' }}>
            Die Anmeldung öffnet eine vorbefüllte E-Mail an {SITE.email}.
          </p>
        </div>
      </section>
    </>
  );
}
