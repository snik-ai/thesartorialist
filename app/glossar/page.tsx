import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd } from '@/components/JsonLd';
import GlossarSuche from '@/components/glossar/GlossarSuche';
import { GLOSSAR, GRUPPEN, buchstabe } from '@/lib/glossar';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `Glossar Massanzug — ${GLOSSAR.length} Begriffe der Schneiderei erklärt`,
  description: `Vom Revers bis zur Super-Zahl: ${GLOSSAR.length} Begriffe rund um Massanzug, Stoffe, Smoking und Accessoires — verständlich erklärt vom Atelier The Sartorialist in Zürich.`,
  alternates: { canonical: '/glossar/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: 'Glossar der Massschneiderei — The Sartorialist Zürich',
    description: `${GLOSSAR.length} Fachbegriffe rund um den Massanzug, verständlich erklärt.`,
    url: '/glossar/',
    images: [{ url: '/glossar/og/glossar.jpg', width: 1200, height: 630, alt: 'Glossar der Massschneiderei' }],
  },
};

export default function GlossarPage() {
  const buchstaben = [...new Set(GLOSSAR.map(buchstabe))];
  return (
    <>
      <Breadcrumbs items={[{ name: 'Glossar', href: '/glossar/' }]} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Glossar</span>
          <h1 className="display">Die Sprache des Massanzugs.</h1>
          <p className="lead">
            {GLOSSAR.length} Begriffe aus der Massschneiderei — von Full Canvas über Revers und Bundfalte bis zu Super-Zahl,
            Smoking und Einstecktuch. Verständlich erklärt, mit Beispielen aus unserem Atelier in Zürich.
          </p>
        </div>
      </section>

      <section className="container glossar-hub">
        <GlossarSuche
          begriffe={GLOSSAR.map((b) => ({ slug: b.slug, begriff: b.begriff, gruppe: b.gruppe, kurz: b.kurz, auch: b.auchGenannt ?? [] }))}
          gruppen={GRUPPEN.filter((g) => GLOSSAR.some((b) => b.gruppe === g))}
        />

        <nav className="glossar-az" aria-label="Alphabet">
          {buchstaben.map((l) => (
            <a key={l} href={`#b-${l}`}>
              {l}
            </a>
          ))}
        </nav>

        <div className="glossar-list">
          {buchstaben.map((l) => (
            <div key={l} id={`b-${l}`} className="glossar-letter">
              <p className="glossar-l serif">{l}</p>
              <ul>
                {GLOSSAR.filter((b) => buchstabe(b) === l).map((b) => (
                  <li key={b.slug}>
                    <Link href={`/glossar/${b.slug}/`}>
                      <span className="glossar-t">{b.begriff}</span>
                      <span className="glossar-g">{b.gruppe}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <CtaBand title="Sie wissen jetzt, wie es heisst — wir zeigen Ihnen, wie es sitzt." />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          '@id': `${SITE.url}/glossar/#set`,
          name: 'Glossar der Massschneiderei — The Sartorialist Zürich',
          url: `${SITE.url}/glossar/`,
          inLanguage: 'de-CH',
          hasDefinedTerm: GLOSSAR.map((b) => ({
            '@type': 'DefinedTerm',
            name: b.begriff,
            url: `${SITE.url}/glossar/${b.slug}/`,
            description: b.kurz,
          })),
        }}
      />
    </>
  );
}
