import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Services — Änderungsschneiderei & Anpassungen',
  description:
    'Services bei The Sartorialist Zürich: Unsere langjährige Partner-Änderungsschneiderei näht alles, was unter die Nähmaschine passt — Veston, Mantel, Hosen und Hemden zu vernünftigen Preisen.',
  alternates: { canonical: '/services/' },
  openGraph: {
    title: 'Services — The Sartorialist Zürich',
    description: 'Änderungsschneiderei für Veston, Mantel, Hosen und Hemden.',
    url: '/services/',
  },
};

const SERVICES = [
  {
    title: 'Veston / Mantel',
    text: 'Ärmel kürzen oder verlängern, Taille anpassen, Schultern korrigieren — Ihr Veston oder Mantel sitzt nach der Änderung wie massgefertigt.',
  },
  {
    title: 'Hosen',
    text: 'Länge, Bundweite, Aufschläge oder eine schlankere Beinlinie — schnelle und präzise Anpassungen für die perfekte Silhouette.',
  },
  {
    title: 'Hemd',
    text: 'Taillieren, Ärmel kürzen, Kragen oder Manschetten erneuern — damit auch Ihr Lieblingshemd wieder makellos sitzt.',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Services', href: '/services/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Änderungen &amp; Anpassungen</span>
          <h1 className="display">Services</h1>
          <p className="lead">
            Unsere langjährige Partner-Änderungsschneiderei näht alles, was unter die
            Nähmaschine passt — und das zu vernünftigen Preisen.
          </p>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {SERVICES.map((s) => (
            <div key={s.title} style={{ borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
              <h2 className="h3" style={{ marginBottom: '0.6rem' }}>
                {s.title}
              </h2>
              <p className="muted">{s.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-2">
          Bringen Sie Ihr Kleidungsstück einfach im Store vorbei — oder{' '}
          <Link href="/termin/" className="text-link">
            buchen Sie einen Termin
          </Link>
          .
        </p>
      </section>

      <CtaBand
        title="Änderung nötig? Wir kümmern uns darum."
        text="Kuttelgasse 7, 8001 Zürich — Mo–Fr 10–19 Uhr, Sa 10–17 Uhr."
      />
      <JsonLd
        data={serviceSchema({
          name: 'Änderungsschneiderei Zürich',
          description:
            'Änderungen für Veston, Mantel, Hosen und Hemden — Partner-Änderungsschneiderei von The Sartorialist Zürich.',
          url: '/services/',
        })}
      />
    </>
  );
}
