import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import Faq from '@/components/Faq';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Massanzug Zürich — Create Your Own Style',
  description:
    'Massanzug in Zürich anfertigen lassen: Full-Canvas-Verarbeitung, exklusive Stoffe von Loro Piana, Scabal & Cerruti, MTM-Prozess mit persönlicher Beratung — ab CHF 1’690.',
  alternates: { canonical: '/massanzug-zuerich/' },
  openGraph: {
    title: 'Massanzug Zürich — The Sartorialist',
    description: 'Full Canvas, exklusive italienische Stoffe, ab CHF 1’690.',
    url: '/massanzug-zuerich/',
    images: [{ url: '/images/massanzug-zuerich.webp' }],
  },
};

const FAQ = [
  {
    q: 'Wo kann ich einen Massanzug in Zürich anfertigen lassen?',
    a: [
      'Bei The Sartorialist Zürich erhalten Sie keinen Konfektionsanzug mit kleinen Anpassungen, sondern ein vollständig auf Sie zugeschnittenes Einzelstück. Sie beginnen mit einem Beratungsgespräch über Wünsche, Anlass, Stil und Körperform — danach wählen Sie aus einer exklusiven Stoffkollektion mit feinen Wollstoffen, Seidenmischungen, Leinen, Kaschmir oder Mohair.',
      'Unser Fokus liegt auf den edelsten Stoffen Europas: Wir arbeiten mit Loro Piana, Scabal, Cerruti und weiteren renommierten Herstellern zusammen.',
    ],
  },
  {
    q: 'Was bedeutet Full Canvas — und warum ist es besser?',
    a: [
      'In der Fertigkonfektion werden die Materialien vor dem Nähen mechanisch unter hohem Druck verklebt. Beim Full-Canvas-Verfahren wird die Einlage hingegen komplett vernäht statt geklebt — in der ganzen Länge, vom Hals bis zum Saum. Die Einlage erhält mehr Spielraum und passt sich beim Tragen der Körperform besonders gut an.',
      'Die genähte Konstruktion erlaubt dem Veston zu atmen und gewinnt an Langlebigkeit — die qualitativ hochwertigste und langlebigste Lösung für Ihren massgeschneiderten Anzug.',
    ],
  },
  {
    q: 'Wie läuft der MTM-Prozess ab?',
    a: [
      'Die erste Beratung gliedert sich in drei Schritte: Auswahl des Stoffes, Messung und Auswahl der Details. Sie wählen Reversstil und -breite, Futterfarbe, Seitenversteller, Hosenaufschläge, Taschenart, Button Style und vieles mehr.',
      'Drei bis sechs Wochen später kommt Ihr Anzug im Store an — bei der endgültigen Anprobe nehmen wir alle erforderlichen Anpassungen vor, bis der Anzug perfekt passt. Auf Wunsch beraten wir Sie auch bei Ihnen im Büro oder zu Hause.',
    ],
  },
  {
    q: 'Welche Stoffe stehen zur Auswahl?',
    a: [
      'Von superfeinen Wollqualitäten und weichen Flanellen bis zu luftigen Seersucker-Stoffen für Sommeranzüge; dichter gewebte Flanelle für Abendkleidung, Samt als edle Variante für die Wintergarderobe. Dazu Farbe, Webart und Muster — Kreidestreifen, kräftige oder subtile Karos und mehr.',
    ],
  },
];

export default function MassanzugPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Massanzug Zürich', href: '/massanzug-zuerich/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Made to Measure</span>
          <h1 className="display">Massanzug Zürich</h1>
          <p className="lead">
            Create Your Own Style: Bei The Sartorialist können Sie Ihr eigener Designer
            sein — exklusive Designermode namhafter italienischer Traditions-Manufakturen,
            perfekt auf Ihre Masse zugeschnitten.
          </p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src="/images/massanzug-zuerich.webp"
            alt="Massanzug Zürich — massgeschneidert von The Sartorialist"
            width={800}
            height={1000}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          <h2 className="h2">Der ultimative Luxus: ein Anzug nach Ihren Massen</h2>
          <p>
            Es gibt nichts Schöneres, als einen Anzug zu tragen, der genau auf Ihre Masse
            zugeschnitten ist. Ein massgeschneiderter Anzug ist ein wertvolles Stück
            Lebensqualität, in das jeder Gentleman investieren sollte.
          </p>
          <p>
            Die massgeschneiderte Reise beginnt mit Probiergrössen, die komplett neu
            entwickelt wurden, um eine verbesserte Passform zu bieten. Im Rahmen des
            MTM-Programms steht eine Kollektion aus Stoffen bereit, die sämtliche Anlässe
            abdeckt — ganzjährige Anzüge, Jackets und Abendgarderoben, ergänzt durch
            exklusive saisonale Kollektionen.
          </p>
          <Link href="/termin/" className="btn">
            Termin buchen
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          <div>
            <span className="eyebrow">Verarbeitung</span>
            <h2 className="h2" style={{ marginBottom: '1rem' }}>
              Langlebig dank Full Canvas
            </h2>
            <p>
              Beim Full-Canvas-Verfahren wird die Einlage komplett vernäht statt geklebt —
              vom Hals bis zum Saum. Dadurch passt sich das Veston der Körperform besonders
              gut an, kann atmen und gewinnt an Langlebigkeit. Es ist die qualitativ
              hochwertigste Lösung, die bei jedem Tragen spürbar ist.
            </p>
          </div>
          <div>
            <span className="eyebrow">Tailoring</span>
            <h2 className="h2" style={{ marginBottom: '1rem' }}>
              Vestons — leicht und formstabil
            </h2>
            <p>
              Die Qualität eines Herrenvestons bemisst sich am Tragekomfort: Leichtigkeit
              und Formstabilität des Oberstoffs. Canvas — ein Einlagegewebe aus Leinen oder
              Baumwolle — verleiht dem feinen, leichten Oberstoff die gewünschte
              Stabilität, durch Nähen (Pikieren) statt thermischem Bekleben.
            </p>
          </div>
        </div>
      </section>

      <Faq items={FAQ} title="Der massgeschneiderte MTM-Prozess" />
      <CtaBand
        title="Ihr Massanzug — ab CHF 1’690, in 20 Arbeitstagen abholbereit."
        text="Massgeschneiderte Anzüge sind die perfekte Lösung für den modernen Gentleman, der Stil und Individualität schätzt."
      />
      <JsonLd
        data={serviceSchema({
          name: 'Massanzug Zürich',
          description:
            'Massanzüge in Full-Canvas-Verarbeitung aus exklusiven italienischen Stoffen — MTM-Prozess mit persönlicher Beratung in Zürich, ab CHF 1’690.',
          url: '/massanzug-zuerich/',
        })}
      />
    </>
  );
}
