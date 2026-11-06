import Link from 'next/link';
import { woerterbuch } from '@/lib/i18n';
import { pfad } from '@/lib/i18n/routen';
import type { Sprache } from '@/lib/i18n/sprachen';

export default function NichtGefunden({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).allgemein.nichtGefunden;
  return (
    <section className="section" style={{ textAlign: 'center', minHeight: '50vh' }}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="display">{t.titel}</h1>
        <p className="lead" style={{ margin: '1.5rem auto 0', maxWidth: '38rem' }}>
          {t.text}
        </p>
        <div className="hero-cta" style={{ justifyContent: 'center' }}>
          <Link href={pfad(lang, 'start')} className="btn">
            {t.start}
          </Link>
          <Link href={pfad(lang, 'konfigurator')} className="btn btn--ghost">
            {t.gestalten}
          </Link>
        </div>
      </div>
    </section>
  );
}
