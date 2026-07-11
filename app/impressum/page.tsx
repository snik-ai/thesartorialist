import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Impressum von The Sartorialist Zürich — Swiss Art Partner AG.',
  alternates: { canonical: '/impressum/' },
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: 'Impressum', href: '/impressum/' }]} />
      <section className="page-hero">
        <div className="container">
          <h1 className="display">Impressum</h1>
        </div>
      </section>
      <section className="container prose" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <h2>Angaben zum Unternehmen</h2>
        <p>
          {SITE.legalName}
          <br />
          {SITE.address.street}
          <br />
          {SITE.address.postalCode} {SITE.address.city}, Schweiz
        </p>
        <p>Vertreten durch: {SITE.founder}</p>

        <h2>Kontakt</h2>
        <p>
          Telefon: <a href={SITE.phoneHref}>{SITE.phone}</a>
          <br />
          E-Mail: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>

        <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
          Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach
          den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung
          ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
          möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
          Inhalte umgehend entfernen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
          keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
          Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
          Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden
          zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstösse überprüft.
        </p>
        <p>
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete
          Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
          Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
          unterliegen dem Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und
          jede Art der Verwertung ausserhalb der Grenzen des Urheberrechts bedürfen der
          schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und
          Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch
          gestattet.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden
          die Urheberrechte Dritter beachtet. Sollten Sie trotzdem auf eine
          Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden
          Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
          umgehend entfernen.
        </p>
      </section>
    </>
  );
}
