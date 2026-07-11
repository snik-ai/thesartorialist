import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Hochzeit Anzug auf Mass kaufen — Zürich',
  description:
    'Hochzeit Anzug auf Mass in Zürich: klassisches Design trifft modernen Stil — massgeschneidert für jede Feier, jede Location und jeden Stil. Kostenlose Vermessung bei The Sartorialist.',
  alternates: { canonical: '/hochzeit-anzug-2024/' },
  openGraph: {
    title: 'Hochzeit Anzug auf Mass — The Sartorialist Zürich',
    description: 'Massgeschneiderte Hochzeit Anzüge im Herzen von Zürich.',
    url: '/hochzeit-anzug-2024/',
    images: [{ url: '/images/braeutigam-anzug-zuerich.webp' }],
  },
};

const SECTIONS = [
  {
    title: 'Hochzeit Anzug von The Sartorialist in Zürich',
    text: 'Ein Hochzeitstag ist ein einzigartiges Ereignis, und der perfekte Anzug unterstreicht die Bedeutung dieses Moments. Unsere Kollektion verbindet klassisches Design mit modernem Stil. Ein massgeschneiderter Anzug passt nicht nur perfekt, sondern vermittelt das besondere Gefühl von Luxus und Individualität — abgestimmt auf Ihre Körperform und Ihren Stil, damit er sich den ganzen Tag angenehm trägt.',
  },
  {
    title: 'Raum für jede Feier',
    text: 'Ob intime Feier oder grosse Hochzeit: Ob im eleganten Ballsaal, einer rustikalen Scheune oder bei einer Trauung im Freien — unsere Anzüge lassen Sie stets perfekt aussehen. Unsere Hochzeit-Anzüge bestehen aus hochwertigen Stoffen wie edler Wolle, Seide oder Leinen: leicht und atmungsaktiv für Sommerhochzeiten, wärmer und strukturiert für kühlere Jahreszeiten.',
  },
  {
    title: 'Individuelle Gestaltung',
    text: 'Jede Hochzeit ist einzigartig — und so sollte es auch Ihr Anzug sein. Von der Wahl des Stoffes über den Schnitt bis zu persönlichen Details wie Stickereien oder besonderen Knöpfen: So entsteht ein unverwechselbares Kleidungsstück, das genau Ihren Vorstellungen entspricht.',
  },
  {
    title: 'Welcher Anzug passt zu mir?',
    text: 'Die Wahl des perfekten Anzugs hängt von Ihrem Stil, der Körperform und dem Anlass ab. Ob klassisch-elegant oder modern und zeitgemäss — unser Team hilft Ihnen, Schnitt, Material und Details zu wählen, die Ihre Persönlichkeit am besten unterstreichen.',
  },
  {
    title: 'Preise & Konditionen',
    text: 'Unsere Preise richten sich nach dem gewählten Stoff, den Details und der individuellen Gestaltung — jeder Anzug ist ein Unikat. Der Service umfasst eine umfassende Beratung, Massanfertigung sowie alle notwendigen Anpassungen. Für ein individuelles Angebot besuchen Sie uns im Atelier in Zürich.',
  },
  {
    title: 'Wir lieben Anzüge!',
    text: 'Ein perfekt sitzender Anzug bleibt Ihrem Gegenüber im Gedächtnis. Es ist unsere Passion, unsere Kunden einfühlsam und umfassend zu beraten — im Store vis-à-vis Park Hyatt Zürich. Beste Auswahl, sympathische Beratung und faire Preise.',
  },
];

export default function HochzeitAnzug2024Page() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Hochzeit Anzug', href: '/hochzeit-anzug-2024/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Hochzeit · Massanfertigung</span>
          <h1 className="display">Hochzeit Anzug auf Mass</h1>
          <p className="lead">
            Bei The Sartorialist bekommen Sie die vielleicht schönsten Hochzeit-Anzüge
            Zürichs — professionell, persönlich und auf höchstem Niveau beraten.
          </p>
          <div className="hero-cta">
            <Link href="/termin/" className="btn">
              Kostenlose Vermessung buchen
            </Link>
          </div>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src="/images/braeutigam-anzug-zuerich.webp"
            alt="Hochzeit Anzug auf Mass — Bräutigam bei The Sartorialist Zürich"
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          {SECTIONS.slice(0, 2).map((s) => (
            <div key={s.title} style={{ marginBottom: '1.75rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          {SECTIONS.slice(2).map((s) => (
            <div key={s.title}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Jetzt kostenlos abmessen lassen."
        text="Unverbindliche Vermessung und Beratung im Atelier an der Kuttelgasse 7, Zürich."
      />
      <JsonLd
        data={serviceSchema({
          name: 'Hochzeit Anzug auf Mass',
          description:
            'Massgeschneiderte Hochzeit-Anzüge in Zürich — klassisches Design, moderner Stil, kostenlose Vermessung.',
          url: '/hochzeit-anzug-2024/',
        })}
      />
    </>
  );
}
