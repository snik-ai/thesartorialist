import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import Konfigurator from '@/components/konfigurator/Konfigurator';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { KONFIG_KATEGORIEN } from '@/lib/konfigurator/daten';

const anzahl = KONFIG_KATEGORIEN.reduce((n, k) => n + k.subCategories.reduce((m, u) => m + u.options.length, 0), 0);

export const metadata: Metadata = {
  title: 'Styles & Options — Massanzug-Konfigurator',
  description: `Massanzug selbst gestalten: ${anzahl} Styles & Options für Sakko, Hose, Weste und Smoking — Revers, Knöpfe, Taschen, Futter. Auswahl als PDF speichern und Ihren Anzug nach Mass in Zürich fertigen lassen.`,
  alternates: { canonical: '/massanzug-konfigurator/' },
  openGraph: {
    title: 'Massanzug selbst gestalten — Styles & Options, The Sartorialist Zürich',
    description: 'Revers, Taschen, Knöpfe und Futter für Ihren Massanzug online wählen — und die Auswahl zum Termin ins Atelier mitbringen.',
    url: '/massanzug-konfigurator/',
  },
};

const FAQ = [
  {
    q: 'Kann ich meinen Massanzug online selbst gestalten?',
    a: [
      'Ja. In «Styles & Options» wählen Sie online die Details Ihres Massanzugs — Knopfung, Revers, Taschen, Schulter, Futter, Hosenbund und mehr. Massnehmen und Stoffwahl erfolgen danach persönlich im Atelier in Zürich, damit der Anzug wirklich sitzt.',
    ],
  },
  {
    q: 'Wofür ist der Massanzug-Konfigurator?',
    a: [
      'Im Konfigurator treffen Sie die ersten Stil-Entscheidungen in Ruhe zu Hause: Revers, Knöpfe, Taschen, Schulter, Futter, Hosenbund und Saum. Die Auswahl bringen Sie zum Termin mit — im Atelier nehmen wir Mass, wählen den Stoff und verfeinern jedes Detail gemeinsam.',
    ],
  },
  {
    q: 'Muss ich alle Details auswählen?',
    a: [
      'Nein. Wählen Sie nur, was Ihnen wichtig ist. Alles Offene besprechen wir im Termin, und wir beraten ehrlich, was zu Ihrer Figur und zum Anlass passt.',
    ],
  },
  {
    q: 'Wo wird meine Auswahl gespeichert?',
    a: [
      'Nur in Ihrem Browser auf diesem Gerät. Wir erhalten sie erst, wenn Sie einen Termin mit Ihrer Auswahl anfragen oder sie uns als PDF oder Text schicken.',
    ],
  },
  {
    q: 'Was kostet ein Massanzug mit diesen Details?',
    a: [
      'Unsere Massanzüge beginnen ab CHF 1’690. Der Endpreis hängt vor allem vom Stoff ab und liegt typischerweise bis etwa CHF 2’500. Alle Anzüge entstehen in Full-Canvas-Verarbeitung, 100 % Made in Italy, und sind in 20 Arbeitstagen abholbereit.',
    ],
  },
];

export default function KonfiguratorPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Massanzug', href: '/massanzug-zuerich/' },
          { name: 'Styles & Options', href: '/massanzug-konfigurator/' },
        ]}
      />
      <section className="page-hero konf-hero">
        <div className="container">
          <span className="eyebrow">Styles &amp; Options · Stil-Konfigurator</span>
          <h1 className="display">Ihr Massanzug beginnt hier.</h1>
          <p className="lead">
            Ihr Stil. Ihr Mass. Ihr Anzug. Entdecken Sie Revers, Knöpfe, Taschen und Verarbeitungsdetails und stellen Sie in
            Ruhe zusammen, was zu Ihnen passt — wo und wann Sie möchten. Ihre Auswahl bringen Sie zum Termin ins Atelier mit:
            Dort nehmen wir Mass, wählen mit Ihnen den Stoff und verfeinern jedes Detail, bis der Anzug nicht nur zu Ihrem
            Körper passt, sondern zu Ihrem Charakter.
          </p>
          <ul className="konf-hints">
            <li>Antippen, was gefällt</li>
            <li>Sie müssen nicht alles wählen</li>
            <li>Übersicht unten — als PDF oder direkt zum Termin</li>
          </ul>
        </div>
      </section>

      <Konfigurator />

      <section className="section section--warm">
        <div className="container split-text">
          <div>
            <h2 className="h2">Massanzug selbst gestalten — so einfach geht es</h2>
            <p>
              Ein Massanzug entsteht aus vielen kleinen Entscheidungen. Hier treffen Sie die ersten in Ruhe: Einreiher oder
              Zweireiher, fallendes oder steigendes Revers, Paspel- oder Pattentaschen, weiche neapolitanische oder
              klassische Schulter, gefüttert oder ungefüttert. Jede Option ist gezeichnet, damit Sie sehen, was sich verändert.
            </p>
            <p>
              Wählen Sie nur, was Ihnen wichtig ist. Ihre Auswahl erscheint unten in der Übersicht, lässt sich als PDF
              speichern und geht mit Ihrer Terminanfrage direkt an uns.
            </p>
          </div>
          <div>
            <h2 className="h2">Ihr Anzug nach Mass in Zürich</h2>
            <p>
              Im Atelier an der Kuttelgasse 7 nehmen wir Mass, zeigen Ihnen die Stoffe von Loro Piana, Vitale Barberis
              Canonico, Holland &amp; Sherry und weiteren Webereien und verfeinern jedes Detail mit Ihnen. Jeder
              massgeschneiderte Anzug entsteht in Full-Canvas-Verarbeitung, 100&nbsp;% Made in Italy, ab CHF&nbsp;1’690 —
              in 20 Arbeitstagen abholbereit.
            </p>
            <p>
              <Link href="/massanzug-zuerich/" className="text-link">
                Mehr zum Massanzug in Zürich
              </Link>{' '}
              ·{' '}
              <Link href="/hochzeitsanzug-zuerich/" className="text-link">
                Hochzeitsanzug nach Mass
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Faq items={FAQ} title="Fragen zum Massanzug-Konfigurator" />
      <JsonLd
        data={serviceSchema({
          name: 'Massanzug-Konfigurator',
          description: 'Online-Stilwahl für Massanzüge: Sakko, Hose, Weste und Smoking — Auswahl als PDF und für den Termin im Atelier Zürich.',
          url: '/massanzug-konfigurator/',
        })}
      />
    </>
  );
}
