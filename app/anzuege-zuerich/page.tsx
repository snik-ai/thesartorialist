import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import ProductCard from '@/components/ProductCard';
import { COLLECTION } from '@/lib/collection';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Anzüge Zürich — exklusive Anzüge & Markenexpertise',
  description:
    'Anzüge in Zürich: exklusive Anzüge, Sakkos, Hemden und Hosen von The Sartorialist — handgemachte Schneiderkunst aus Italien trifft aktuelle Modetrends. Beratung im Store vis-à-vis Park Hyatt.',
  alternates: { canonical: '/anzuege-zuerich/' },
  openGraph: {
    title: 'Anzüge Zürich — The Sartorialist',
    description: 'Die vielleicht schönsten Anzüge Zürichs — Beratung auf höchstem Niveau.',
    url: '/anzuege-zuerich/',
  },
};

const SECTIONS = [
  {
    title: 'Echte Markenexpertise',
    text: 'Wir bieten Ihnen exklusive Anzüge, Sakkos, Jeanshemden und Hosen — abgerundet durch stilvolle Accessoires und Kaschmir in feinster Qualität. Dank unserer ausgewählten Exklusiv-Marken garantieren wir die besten Materialien und Schnittführungen. 15 Jahre Erfahrung in der Modebranche und beim Herrenmode-Giganten Tom Ford sind Ihr Garant für die schönsten Anzüge Zürichs.',
  },
  {
    title: 'So entsteht ein Anzug mit Qualität',
    text: 'Zunächst schildern Sie uns Ihre Wünsche und wir nehmen die genauen Masse. Unser Schneiderteam designt und näht den Anzug passgenau — im Durchschnitt dauert das nur 15 bis 20 Tage. Nach einer letzten Probierrunde bessern wir bei Bedarf nach, bis der Anzug perfekt sitzt und alle Wünsche erfüllt sind.',
  },
  {
    title: 'Welcher Anzug passt zu mir?',
    text: 'Ob moderner Zweireiher oder Einreiher, ob für Business, Hochzeit oder Oper: Ein Anzug ist wie eine zweite Haut. Neben dem Typ des Anzugs spielen Passgenauigkeit, Stoff und Farben eine entscheidende Rolle. Wir achten mit Argusaugen darauf, dass Sie den perfekten Anzug zu Ihrem persönlichen Typ erhalten.',
  },
  {
    title: 'Preise & Konditionen',
    text: 'Ein exklusiver Anzug hat seinen Preis — und wir sorgen dafür, dass sich die Investition lohnt. Von billigen Anzügen von der Stange raten wir ab: Sie erreichen nie den Tragekomfort und die Wertigkeit eines massgeschneiderten Anzugs. Unsere Preise sind stets fair und transparent.',
  },
];

export default function AnzuegeZuerichPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Anzüge Zürich', href: '/anzuege-zuerich/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Herrenausstatter im Herzen von Zürich</span>
          <h1 className="display">Anzüge Zürich</h1>
          <p className="lead">
            Bei The Sartorialist bekommen Sie die vielleicht schönsten Anzüge Zürichs. Wir
            beraten professionell, persönlich und auf höchstem Niveau — handgemachte
            Schneiderkunst aus Italien trifft aktuelle Modetrends.
          </p>
          <div className="hero-cta">
            <Link href="/kollektion/" className="btn">
              Kollektion entdecken
            </Link>
            <Link href="/termin/" className="btn btn--ghost">
              Termin buchen
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="grid-2">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Wir lieben Anzüge</span>
            <h2 className="h2">Eine Auswahl aus der Kollektion</h2>
          </div>
          <div className="product-grid">
            {COLLECTION.slice(0, 3).map((piece) => (
              <ProductCard key={piece.slug} piece={piece} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
      <JsonLd
        data={serviceSchema({
          name: 'Anzüge Zürich',
          description:
            'Exklusive Anzüge, Sakkos, Hemden und Hosen in Zürich — Beratung auf höchstem Niveau bei The Sartorialist.',
          url: '/anzuege-zuerich/',
        })}
      />
    </>
  );
}
