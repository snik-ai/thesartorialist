import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CtaBand from '@/components/CtaBand';
import { JsonLd, faqSchema } from '@/components/JsonLd';
import { GLOSSAR, getBegriff } from '@/lib/glossar';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSAR.map((b) => ({ slug: b.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = getBegriff(slug);
  if (!b) return {};
  const url = `/glossar/${b.slug}/`;
  const og = `/glossar/og/${b.slug}.jpg`;
  return {
    title: b.metaTitle,
    description: b.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: SITE.locale,
      siteName: SITE.name,
      title: `${b.begriff} — Glossar The Sartorialist Zürich`,
      description: b.metaDescription,
      url,
      images: [{ url: og, width: 1200, height: 630, alt: `${b.begriff} — Glossar der Massschneiderei` }],
    },
    twitter: { card: 'summary_large_image', title: `${b.begriff} — Glossar`, description: b.metaDescription, images: [og] },
  };
}

/** Absätze (\n\n) als <p> */
function Text({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

export default async function BegriffPage({ params }: Props) {
  const { slug } = await params;
  const b = getBegriff(slug);
  if (!b) notFound();
  const idx = GLOSSAR.findIndex((x) => x.slug === b.slug);
  const prev = GLOSSAR[(idx - 1 + GLOSSAR.length) % GLOSSAR.length];
  const next = GLOSSAR[(idx + 1) % GLOSSAR.length];
  const verwandt = b.verwandt.map(getBegriff).filter((x): x is NonNullable<typeof x> => !!x);
  const illustration = b.bild.startsWith('/konfigurator/');
  const url = `${SITE.url}/glossar/${b.slug}/`;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Glossar', href: '/glossar/' },
          { name: b.begriff, href: `/glossar/${b.slug}/` },
        ]}
      />
      <article className="begriff">
        <header className="container begriff-head">
          <div className="begriff-intro">
            <span className="eyebrow">Glossar · {b.gruppe}</span>
            <h1 className="display">{b.begriff}</h1>
            {b.auchGenannt && b.auchGenannt.length > 0 && <p className="begriff-auch">Auch: {b.auchGenannt.join(' · ')}</p>}
            <p className="begriff-kurz">{b.kurz}</p>
          </div>
          <figure className={`begriff-bild${illustration ? ' begriff-bild--zeichnung' : ''}`}>
            <img src={b.bild} alt={b.bildAlt} width={720} height={900} fetchPriority="high" />
          </figure>
        </header>

        <div className="container begriff-body">
          <div className="begriff-text">
            {b.abschnitte.map((a) => (
              <section key={a.titel}>
                <h2 className="h2">{a.titel}</h2>
                <Text text={a.text} />
              </section>
            ))}

            <aside className="begriff-beispiel">
              <span className="eyebrow">Beispiel aus dem Atelier</span>
              <h2 className="h3">{b.beispiel.titel}</h2>
              <Text text={b.beispiel.text} />
            </aside>

            <section className="begriff-faq">
              <h2 className="h2">Häufige Fragen zu «{b.begriff}»</h2>
              <div className="faq">
                {b.faq.map((f) => (
                  <details key={f.frage}>
                    <summary>{f.frage}</summary>
                    <div className="faq-body">
                      <p>{f.antwort}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          <aside className="begriff-side">
            <div className="begriff-box">
              <p className="begriff-box-t">Weiterlesen</p>
              <ul>
                {b.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            {verwandt.length > 0 && (
              <div className="begriff-box">
                <p className="begriff-box-t">Verwandte Begriffe</p>
                <ul>
                  {verwandt.map((v) => (
                    <li key={v.slug}>
                      <Link href={`/glossar/${v.slug}/`}>{v.begriff}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="begriff-box begriff-box--ink">
              <p className="begriff-box-t">Massanzug ab CHF 1’690</p>
              <p>Full Canvas, 100&nbsp;% Made in Italy, in 20 Arbeitstagen abholbereit.</p>
              <Link href="/massanzug-konfigurator/" className="btn btn--light btn--wide">
                Anzug gestalten
              </Link>
              <Link href="/termin/" className="text-link">
                Termin buchen
              </Link>
            </div>
          </aside>
        </div>

        <nav className="container begriff-nav" aria-label="Weitere Begriffe">
          <Link href={`/glossar/${prev.slug}/`}>← {prev.begriff}</Link>
          <Link href="/glossar/">Alle {GLOSSAR.length} Begriffe</Link>
          <Link href={`/glossar/${next.slug}/`}>{next.begriff} →</Link>
        </nav>
      </article>

      <CtaBand />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          '@id': `${url}#term`,
          name: b.begriff,
          alternateName: b.auchGenannt,
          description: b.kurz,
          url,
          image: `${SITE.url}/glossar/og/${b.slug}.jpg`,
          inDefinedTermSet: `${SITE.url}/glossar/#set`,
        }}
      />
      <JsonLd data={faqSchema(b.faq.map((f) => ({ q: f.frage, a: f.antwort })))} />
    </>
  );
}
