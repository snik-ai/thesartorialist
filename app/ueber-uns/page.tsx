import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { STORE_GALLERY } from '@/lib/brands';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Über uns — 15 Jahre Erfahrung bei Tom Ford & Prada',
  description:
    'The Sartorialist Zürich: exklusive Designer- und Luxuslabels, handgemachte Schneiderkunst — gegründet von Alexander Shubin nach über 15 Jahren in führenden Positionen bei Tom Ford und Prada.',
  alternates: { canonical: '/ueber-uns/' },
  openGraph: {
    title: 'Über uns — The Sartorialist Zürich',
    description: 'Eine Vision, verwirklicht nach 15 Jahren bei Tom Ford und Prada.',
    url: '/ueber-uns/',
    images: [{ url: '/images/Foto-mit-Schere.webp' }],
  },
};

export default function UeberUnsPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Über uns', href: '/ueber-uns/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Das Haus</span>
          <h1 className="display">Über uns</h1>
          <p className="lead">
            Bei uns finden Sie eine Auswahl von exklusiven Designer- und Luxuslabels, die
            neben höchster Qualität und Einzigartigkeit auch den gewissen Chic verkörpern.
          </p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src="/images/Foto-mit-Schere.webp"
            alt={`${SITE.founder}, Gründer von The Sartorialist Zürich`}
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          <h2 className="h2">Eine Vision, verwirklicht in Zürich</h2>
          <p>
            Exklusive Anzüge, Sakkos, Hosen, Jeans, Hemden, stilvolle Accessoires und
            feinste Cashmere-Mode in höchster handgemachter Schneiderkunstqualität — jetzt
            für jeden in der Schweiz erhältlich.
          </p>
          <p>
            Eine Vision, die wir nach über 15 Jahren Erfahrung in führenden Positionen bei
            den Weltmarken Tom Ford und Prada mit The Sartorialist in Zürich verwirklicht
            haben.
          </p>
          <p>
            Wir arbeiten ausschliesslich mit familiengeführten Unternehmen zusammen, die
            wir persönlich kennen. Qualität und perfekter Service sind unser oberstes
            Gebot.
          </p>
          <p>
            Lassen Sie sich bei einem unverbindlichen Espresso von uns beraten und
            begeistern.
          </p>
          <Link href="/termin/" className="btn">
            Termin buchen
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Der Store</span>
            <h2 className="h2">Einblicke in unseren Showroom</h2>
          </div>
          <div className="gallery-grid">
            {STORE_GALLERY.slice(0, 6).map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`Showroom von The Sartorialist an der Kuttelgasse 7 in Zürich — Ansicht ${i + 1}`}
                width={600}
                height={800}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
