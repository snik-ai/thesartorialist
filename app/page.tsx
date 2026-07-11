import type { Metadata } from 'next';
import Link from 'next/link';
import { COLLECTION } from '@/lib/collection';
import { BRANDS } from '@/lib/brands';
import ProductCard from '@/components/ProductCard';
import CtaBand from '@/components/CtaBand';
import Faq from '@/components/Faq';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Massanzug & Hochzeitsanzug Zürich — The Sartorialist',
  description:
    'Exklusive Massanzüge und Hochzeitsanzüge in Zürich: Full-Canvas-Verarbeitung, 100% Made in Italy, ab CHF 1’690 — in 20 Arbeitstagen abholbereit. Termin buchen.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Massanzug & Hochzeitsanzug Zürich — The Sartorialist',
    description:
      'Exklusive Massanzüge und Hochzeitsanzüge in Zürich: Full Canvas, Made in Italy, ab CHF 1’690.',
    url: '/',
  },
};

const HOME_FAQ = [
  {
    q: 'Wie läuft die Beratung bei The Sartorialist ab?',
    a: [
      'Sobald Sie einen Termin in Zürich buchen, nehmen wir uns mindestens 60 bis 90 Minuten Zeit. Der Ablauf: persönliches Gespräch, Stoffauswahl aus edelsten italienischen Stoffen, Schnittberatung, präzises Massnehmen mit über 30 Parametern, Designentscheidungen (Kragenform, Taschen, Knöpfe, Innenfutter, Initialen) und zwei bis drei Wochen später die Anprobe mit Feinschliff vor Ort.',
      'Sie brauchen keine Vorkenntnisse — wir holen Sie genau da ab, wo Sie sind. Keine Hektik, kein Druck, nur ehrliche Beratung mit Substanz.',
    ],
  },
  {
    q: 'Was kostet ein Massanzug bei The Sartorialist in Zürich?',
    a: [
      'Unsere Massanzüge beginnen ab CHF 1’690 — der Endpreis hängt von Ihrer Stoff- und Designwahl ab. Mit einem besonders edlen Stoff von Loro Piana oder Scabal, luxuriösem Innenfutter oder einer handvernähten Weste kann Ihr Anzug bis etwa CHF 2’500 kosten.',
      'Wir liefern Qualität ohne Kompromisse: italienische Webkunst, individuelles Design, echte Massarbeit — und ein Service-Erlebnis, das Sie sonst nur in London oder Florenz bekommen.',
    ],
  },
  {
    q: 'Wie lange dauert die Anfertigung?',
    a: [
      'Ihr Anzug ist in der Regel in 20 Arbeitstagen abholbereit — die schnellste Lieferzeit der Schweiz. Für Hochzeitsanzüge empfehlen wir, den Termin mindestens 8 bis 10 Wochen vor der Hochzeit zu buchen, damit genug Zeit für Stoffwahl, Massnehmen, Anprobe und Feinabstimmung bleibt.',
    ],
  },
  {
    q: 'Was bedeutet Full-Canvas-Verarbeitung?',
    a: [
      'Beim Full-Canvas-Verfahren wird die Einlage komplett vernäht statt geklebt — in der ganzen Länge, vom Hals bis zum Saum. Dadurch passt sich das Veston beim Tragen der Körperform besonders gut an, kann atmen und gewinnt deutlich an Langlebigkeit.',
      'Alle unsere Anzüge werden ausschliesslich in Full-Canvas-Qualität gefertigt — die hochwertigste Verarbeitung, die bei jedem Tragen spürbar ist.',
    ],
  },
  {
    q: 'Mit welchen Stoffen arbeitet The Sartorialist?',
    a: [
      'Wir arbeiten ausschliesslich mit hochwertigen Stoffen renommierter Webereien wie Loro Piana, Vitale Barberis Canonico, Drago, Reda, Cerruti, Scabal, Solbiati und Holland & Sherry — Auswahl aus über 1’000 Stoffen für Anzüge und über 400 Hemdenstoffen.',
    ],
  },
  {
    q: 'Kann ich auch ein Masshemd anfertigen lassen?',
    a: [
      'Absolut — ein Masshemd ist die logische Ergänzung zum Massanzug. Es sitzt perfekt, scheuert nicht und sieht auch ohne Sakko makellos aus. Sie wählen aus über 400 Hemdenstoffen — von klassischem Popeline bis Sea-Island-Cotton, von Marken wie Canclini, Albini oder Thomas Mason.',
    ],
  },
  {
    q: 'Bietet ihr auch Anzüge für Trauzeugen oder Hochzeitsgäste an?',
    a: [
      'Ja — wir statten nicht nur den Bräutigam aus, sondern auch Trauzeugen, Väter und weitere Hochzeitsgäste. Ob einheitliches Bild oder individuelle Looks: Wir sorgen für stilvolle, aufeinander abgestimmte Outfits, ohne den Bräutigam zu überstrahlen.',
    ],
  },
  {
    q: 'Was ist das Besondere an The Sartorialist in Zürich?',
    a: [
      'Kompromisslose Qualität, echte Handarbeit und persönliche Beratung mit Charakter: exklusive italienische Stoffe, langjährige Erfahrung aus führenden Positionen bei Tom Ford und Prada, ein persönliches Atelier vis-à-vis Park Hyatt — und faire, transparente Preise.',
      'Unsere Kunden suchen nicht den günstigsten Anzug, sondern den richtigen.',
    ],
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <img
          src="/images/the-sartorialist-zuerich.webp"
          alt="Massanzug auf Schneiderbüste im Atelier von The Sartorialist Zürich"
          className="hero-img"
          width={1500}
          height={1000}
          fetchPriority="high"
        />
        <div className="hero-content">
          <span className="eyebrow">Herrenausstatter · Zürich</span>
          <h1 className="display">
            «Mode ist vergänglich. <span className="accent">Stil ist für die&nbsp;Ewigkeit.</span>»
          </h1>
          <p className="lead">
            Massanzüge und exklusive italienische Herrenmode — Full-Canvas-Verarbeitung,
            100&nbsp;% Made in Italy, ab CHF&nbsp;1’690. In 20 Arbeitstagen abholbereit.
          </p>
          <div className="hero-cta">
            <Link href="/termin/" className="btn btn--light">
              Termin buchen
            </Link>
            <Link
              href="/kollektion/"
              className="btn btn--ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}
            >
              Kollektion entdecken
            </Link>
          </div>
        </div>
        <span className="hero-scrollcue" aria-hidden="true" />
      </section>

      {/* Stoffpartner-Marquee */}
      <div className="marquee" aria-label="Unsere Stoffpartner">
        <div className="marquee-track">
          {[0, 1].map((i) => (
            <span aria-hidden={i === 1} key={i}>
              {['Loro Piana', 'Vitale Barberis Canonico', 'Drago', 'Reda', 'Cerruti', 'Scabal', 'Solbiati', 'Holland & Sherry', 'Zegna', 'Thomas Mason'].join('  ·  ')}
            </span>
          ))}
        </div>
      </div>

      {/* USP-Leiste */}
      <div className="usp-bar">
        <div className="usp-grid">
          <div className="usp">
            <strong>Full Canvas</strong>
            <span className="muted">Nur hochwertigste Verarbeitung</span>
          </div>
          <div className="usp">
            <strong>Made in Italy</strong>
            <span className="muted">100 % italienische Manufakturen</span>
          </div>
          <div className="usp">
            <strong>Ab CHF 1’690</strong>
            <span className="muted">Faire, transparente Preise</span>
          </div>
          <div className="usp">
            <strong>20 Arbeitstage</strong>
            <span className="muted">Schnellste Lieferzeit der Schweiz</span>
          </div>
        </div>
      </div>

      {/* Kollektion */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Die Kollektion</span>
            <h2 className="h2">Anzüge, die man nicht kauft — sondern bucht.</h2>
            <p className="lead mt-1">
              Jedes Stück wird in Ihrer persönlichen Grösse gefertigt. Wählen Sie Ihren
              Favoriten und buchen Sie Ihren Termin im Showroom.
            </p>
          </div>
          <div className="product-grid">
            {COLLECTION.slice(0, 6).map((piece, i) => (
              <ProductCard key={piece.slug} piece={piece} lazy={i > 2} />
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/kollektion/" className="text-link">
              Gesamte Kollektion ansehen
            </Link>
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section section--warm">
        <div className="container split">
          <div className="split-media">
            <img
              src="/images/Foto-mit-Schere.webp"
              alt="Alexander Shubin, Gründer von The Sartorialist Zürich, mit Schneiderschere"
              width={800}
              height={1000}
              loading="lazy"
            />
          </div>
          <div className="split-body">
            <span className="eyebrow">Das Haus</span>
            <h2 className="h2">Vom Tom Ford Store Zürich zum persönlichen Herrenausstatter</h2>
            <p>
              Ich bin {SITE.founder}, Gründer von «The Sartorialist» in Zürich — Modemacher
              mit Leidenschaft, Erfahrung und besten Kontakten zu traditionellen
              italienischen Textil-Manufakturen. Als langjähriger Geschäftsführer des
              ersten Tom Ford Stores Europas in Zürich habe ich mich feinster Herrenmode
              verschrieben.
            </p>
            <p>
              Jede von mir ausgewählte Manufaktur wird von Meistern ihres Fachs geführt und
              blickt auf jahrzehntelange Tradition zurück. So lernen Sie bei mir die echten
              Gesichter hinter den Brands kennen — und entsprechend fair sind meine Preise.
            </p>
            <ul className="checklist">
              <li>Persönliche Beratung von der ersten Idee bis zum fertigen Anzug</li>
              <li>Exklusive Stoffauswahl aus italienischen &amp; englischen Manufakturen</li>
              <li>24/7 persönlicher Rund-um-Service — ohne Wartezeiten</li>
            </ul>
            <Link href="/ueber-uns/" className="text-link">
              Mehr über uns
            </Link>
          </div>
        </div>
      </section>

      {/* Hochzeit */}
      <section className="section">
        <div className="container split">
          <div className="split-body">
            <span className="eyebrow">Hochzeit</span>
            <h2 className="h2">Der perfekte Hochzeitsanzug für Ihren grossen Tag</h2>
            <p>
              Jede Hochzeit ist anders — und genauso individuell sollte Ihr Anzug sein. Von
              der Stoffauswahl über den Schnitt bis zu den Accessoires begleiten wir Sie zu
              Ihrem persönlichen Hochzeitsanzug: klassischer Dreiteiler, moderner Slim Fit,
              Leinen für den Sommer, Smoking für Black Tie oder Vintage mit Tweed.
            </p>
            <p>
              Auf Wunsch mit dem Namen Ihrer Braut, einem Sinnspruch oder dem
              Hochzeitsdatum ins Innenfutter gestickt — ein Unikat, das es kein zweites Mal
              gibt.
            </p>
            <Link href="/hochzeitsanzug-zuerich/" className="btn btn--ghost">
              Hochzeitsanzug Zürich
            </Link>
          </div>
          <div className="split-media">
            <img
              src="/images/Hochzeitsanzug-Zurich-scaled.webp"
              alt="Bräutigam im massgeschneiderten Hochzeitsanzug von The Sartorialist Zürich"
              width={800}
              height={1000}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="section section--warm">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Unsere Brands</span>
            <h2 className="h2">Familiengeführte Manufakturen, persönlich ausgewählt</h2>
          </div>
        </div>
        <div className="brand-index">
          {BRANDS.map((brand) => (
            <Link key={brand.slug} href={`/${brand.slug}/`} className="brand-row">
              <span className="name">{brand.name}</span>
              <span className="claim">{brand.claim}</span>
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Faq items={HOME_FAQ} title="Alles rund um Massanzug & Hochzeitsanzug in Zürich" />

      <CtaBand />
    </>
  );
}
