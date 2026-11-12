// «Anzüge nach Farbe» — Kacheln zu den Farbseiten (/anzug-blau/ usw.), auf der Massanzug-Seite.
import Link from 'next/link';
import { woerterbuch } from '@/lib/i18n';
import { fmt } from '@/lib/i18n/fmt';
import { farbenFuer, farbPfad } from '@/lib/i18n/inhalte';
import type { Sprache } from '@/lib/i18n/sprachen';

export default function AnzugFarben({ lang }: { lang: Sprache }) {
  const t = woerterbuch(lang).brands.farben;
  return (
    <section className="section section--warm">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="h2">{t.titel}</h2>
        </div>
        <div className="farb-grid">
          {farbenFuer(lang).map((c) => (
            <Link key={c.slug} href={farbPfad(lang, c.slug)} className="product-card">
              <div className="product-media">
                <img src={c.hero} alt={fmt(t.bildAlt, { name: c.name })} width={600} height={800} loading="lazy" />
              </div>
              <div className="product-info">
                <h3>{c.name}</h3>
                <p className="sub">{c.claim}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
