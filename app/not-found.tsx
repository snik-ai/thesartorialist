import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section" style={{ textAlign: 'center', minHeight: '50vh' }}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="display">Seite nicht gefunden</h1>
        <p className="lead" style={{ margin: '1.5rem auto 0', maxWidth: '38rem' }}>
          Diese Seite existiert nicht — aber der perfekte Anzug für Sie schon.
        </p>
        <div className="hero-cta" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn">
            Zur Startseite
          </Link>
          <Link href="/kollektion/" className="btn btn--ghost">
            Kollektion ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
