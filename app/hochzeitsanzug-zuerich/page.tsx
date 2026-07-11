import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import Faq from '@/components/Faq';
import { JsonLd, serviceSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Hochzeitsanzug Zürich — massgeschneidert',
  description:
    'Hochzeitsanzug massgeschneidert in Zürich: perfekte Passform, atmende Naturstoffe, individuelle Details bis zur Stickerei im Innenfutter — The Sartorialist, ab CHF 1’690.',
  alternates: { canonical: '/hochzeitsanzug-zuerich/' },
  openGraph: {
    title: 'Hochzeitsanzug Zürich — The Sartorialist',
    description: 'Der perfekte Auftritt für den schönsten Tag Ihres Lebens.',
    url: '/hochzeitsanzug-zuerich/',
    images: [{ url: '/images/Hochzeitsanzug-Zurich-scaled.webp' }],
  },
};

const FAQ = [
  {
    q: 'Was ist der Unterschied zwischen einem Hochzeitsanzug und einem Businessanzug?',
    a: [
      'Ein Hochzeitsanzug ist nicht einfach ein normaler Anzug — er ist ein Statement. Während ein Businessanzug funktional und dezent gehalten ist, steht der Hochzeitsanzug im Zentrum eines der emotionalsten Tage Ihres Lebens. Er muss perfekt sitzen, Ihren Charakter widerspiegeln, zum Stil der Hochzeit passen und auf Fotos wie in Erinnerung bestehen.',
    ],
  },
  {
    q: 'Wie lange im Voraus sollte ich meinen Hochzeitsanzug anfertigen lassen?',
    a: [
      'Wir empfehlen, den Termin mindestens 8 bis 10 Wochen vor der Hochzeit zu buchen — besser früher. So bleibt genug Zeit für Stoffwahl, Massnehmen, erste Anprobe, eventuelle Änderungen und die persönliche Feinabstimmung. Kurzfristige Anfragen sind in Ausnahmefällen möglich — sprechen Sie uns an.',
    ],
  },
  {
    q: 'Welche Anzugstile sind für Hochzeiten beliebt?',
    a: [
      'Klassischer Dreiteiler mit Weste (zeitlos elegant), moderner Slim-Fit-Anzug (schlanke Silhouette), italienischer Leinenanzug (ideal für Sommerhochzeiten), Smoking oder Dinner Jacket (Black Tie), Vintage-Anzug mit Tweed oder Karos (rustikale Settings) sowie farbige Anzüge in Dunkelgrün, Bordeaux oder Beige.',
      'Sie bestimmen die Richtung — wir sorgen dafür, dass sie perfekt umgesetzt wird.',
    ],
  },
  {
    q: 'Kann ich meinen Massanzug nach der Hochzeit noch tragen?',
    a: [
      'Ja — genau das ist einer der Vorteile. Wir achten bereits in der Beratung darauf, dass Ihr Anzug vielseitig bleibt: klassische Farben wie Navy, Anthrazit oder Dunkelgrün, dezente Stoffe, die Option, Weste oder Accessoires separat zu tragen. Die italienischen Stoffe bleiben auch nach Jahren formstabil und elegant.',
    ],
  },
  {
    q: 'Welche Accessoires passen zum Hochzeitsanzug?',
    a: [
      'Wir bieten eine sorgfältig kuratierte Auswahl an Fliegen, Krawatten, Einstecktüchern, Manschettenknöpfen, Westen und Ledergürteln, die perfekt auf Ihre Anzugwahl abgestimmt werden. Auch Farbabstimmungen zum Brautkleid oder zur Dekoration erfüllen wir gerne.',
    ],
  },
];

export default function HochzeitsanzugPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ name: 'Hochzeitsanzug Zürich', href: '/hochzeitsanzug-zuerich/' }]}
      />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Hochzeit</span>
          <h1 className="display">Hochzeitsanzug Zürich</h1>
          <p className="lead">
            Der perfekte Auftritt für den schönsten Tag Ihres Lebens: ein Anzug, der
            perfekt sitzt, Ihre Persönlichkeit strahlen lässt und jede Bewegung mitmacht.
          </p>
        </div>
      </section>

      <section className="container split" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="split-media">
          <img
            src="/images/Hochzeitsanzug-Zurich-scaled.webp"
            alt="Massgeschneiderter Hochzeitsanzug von The Sartorialist Zürich"
            width={800}
            height={1100}
            fetchPriority="high"
          />
        </div>
        <div className="split-body">
          <h2 className="h2">Warum Hochzeitsanzüge bei The Sartorialist?</h2>
          <ul className="checklist">
            <li>15 Jahre Erfahrung — Ihr Garant für die schönsten Hochzeitsanzüge in Zürich und Umgebung</li>
            <li>Wir lieben Mode — und wir lieben es, unsere Kunden persönlich zu beraten</li>
            <li>Aktuelle Trends, exklusive Materialien und faire Konditionen</li>
            <li>Full Canvas für perfekt sitzende massgeschneiderte Anzüge</li>
          </ul>
          <p className="mt-2">
            Bei The Sartorialist erhalten Sie massgeschneiderte Hochzeitsanzüge, die jeden
            Wunsch erfüllen, aus hochwertigen Stoffen gefertigt werden und dank
            unverwechselbarer Details echte Unikate sind — zu erschwinglichen Preisen.
          </p>
          <Link href="/termin/" className="btn">
            Unverbindliches Beratungsgespräch
          </Link>
        </div>
      </section>

      <section className="section section--warm">
        <div className="container grid-2">
          <div>
            <span className="eyebrow">Passform</span>
            <h2 className="h2" style={{ marginBottom: '1rem' }}>
              Passform und Tragekomfort — für jede Hochzeit unverzichtbar
            </h2>
            <p>
              Ihr Körper ist auf Ihrer Hochzeit nonstop gefordert: das Warten auf die
              Trauung mit Herzklopfen, das Knien in der Kirche, das Fotoshooting, der
              Eröffnungstanz, das lange Sitzen beim Festmahl, die ausgelassene Party.
              Anzüge von der Stange halten dem selten stand — sie knittern, beulen aus,
              engen ein.
            </p>
            <p className="mt-1">
              Ein massgeschneiderter Hochzeitsanzug von The Sartorialist begleitet Sie in
              jedem Augenblick optimal: Dank perfekter Passform und aussergewöhnlich
              hochwertiger, natürlicher Stoffqualität atmet Ihr Anzug mit und führt Hitze
              und Feuchtigkeit zuverlässig nach aussen ab.
            </p>
          </div>
          <div>
            <span className="eyebrow">Details</span>
            <h2 className="h2" style={{ marginBottom: '1rem' }}>
              Sie wählen die Details — und schaffen ein Unikat
            </h2>
            <p>
              Wählen Sie aus unterschiedlichen Knopfformen und Macharten, lassen Sie sich
              den Namen Ihrer Braut, einen Sinnspruch oder das Hochzeitsdatum ins
              Innenfutter sticken. Luxuriöse Manschettenknöpfe zaubern optische
              Glanzmomente für den Augenblick, in dem Sie den Ring reichen.
            </p>
            <p className="mt-1">
              Dazu eine breite Palette an Krawatten, Hosenträgern und Fliegen — und auf
              Wunsch ein Masshemd nach Ihren exakten Massen.
            </p>
          </div>
        </div>
      </section>

      <Faq items={FAQ} title="Häufige Fragen zum Hochzeitsanzug" />
      <CtaBand
        title="Ihr Hochzeitsanzug — buchen Sie 8–10 Wochen vor dem grossen Tag."
        text="Wer früh kommt, bekommt die volle Auswahl und den besten Service."
      />
      <JsonLd
        data={serviceSchema({
          name: 'Hochzeitsanzug Zürich',
          description:
            'Massgeschneiderte Hochzeitsanzüge in Zürich: perfekte Passform, edle Naturstoffe, individuelle Details — The Sartorialist.',
          url: '/hochzeitsanzug-zuerich/',
        })}
      />
    </>
  );
}
