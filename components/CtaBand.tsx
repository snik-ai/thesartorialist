import Link from 'next/link';

export default function CtaBand({
  title = 'Erleben Sie den Unterschied — bei einem Espresso im Showroom.',
  text = 'Eine umfassende und kostenlose Beratung — vis-à-vis Park Hyatt, Kuttelgasse 7 in Zürich. Beratungen ausserhalb von Zürich nach Absprache.',
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="section section--ink cta-band">
      <div className="container">
        <span className="eyebrow">Termin buchen</span>
        <h2 className="h2">{title}</h2>
        <p className="muted">{text}</p>
        <div className="hero-cta">
          <Link href="/termin/" className="btn btn--light">
            Termin buchen
          </Link>
          <Link href="/kontakt/" className="btn btn--ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>
            Kontakt &amp; Anfahrt
          </Link>
        </div>
      </div>
    </section>
  );
}
