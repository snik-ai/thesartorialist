import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
const BILDER = [
  '/images/the-sartorialist-zuerich.webp',
  '/images/Foto-mit-Schere.webp',
  '/images/massanzug-zuerich.webp',
  '/images/eleganter-hochzeitsanzug.webp',
  '/images/dreiteiler-anzug.webp',
  '/images/hochzeitsanzug.webp',
];
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
          <span className="eyebrow">Der Gründer</span>
          <h2 className="h2">Von Tom Ford Zürich zum persönlichen Herrenausstatter</h2>
          <p>
            Ich bin Alexander Shubin, Gründer von «The Sartorialist» in Zürich — Modemacher
            mit Leidenschaft, Erfahrung und besten Kontakten zu traditionellen italienischen
            Textil-Manufakturen. Als langjähriger Geschäftsführer des ersten Tom Ford Stores
            Europas in Zürich habe ich mich mit Haut und Haaren feinster Herrenmode
            verschrieben und schliesslich den Wunsch verspürt, im Herzen von Zürich mein
            eigenes exklusives Bekleidungsgeschäft für Herren zu eröffnen.
          </p>
          <p>
            Die besondere «italienische Note» war mir bei der Anfertigung und dem Verkauf der
            Anzüge und weiterer Produkte wie Hemden, Jeans und Accessoires von Beginn an ein
            echtes Herzensanliegen, ebenso wie ein wacher Blick auf neue Trends. Bei «The
            Sartorialist» profitieren Sie von meiner langjährigen und breitgefächerten
            Erfahrung als Geschäftsführer des Tom Ford Stores in Zürich.
          </p>
          <p>
            Jede der von mir ausgewählten Manufakturen wird von Meistern ihres Fachs geführt
            und kann auf eine jahrzehntelange Tradition zurückblicken. So lernen Sie bei mir
            die echten Gesichter hinter den Brands kennen — und dementsprechend fair und
            angemessen sind meine Preise, sodass Ihr hochwertiger Luxus-Anzug kein ferner
            Traum bleiben muss.
          </p>
          <Link href="/termin/" className="btn">
            Termin buchen
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Stil &amp; Handwerk</span>
            <h2 className="h2">Massanzüge von The Sartorialist</h2>
          </div>
          <div className="gallery-grid">
            {BILDER.map((img, i) => (
              <img
                key={img}
                src={img}
                alt={`Massanzug und Handwerk bei The Sartorialist Zürich — Bild ${i + 1}`}
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
