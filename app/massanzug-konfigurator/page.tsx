import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import Konfigurator from '@/components/konfigurator/Konfigurator';
import { JsonLd, serviceSchema } from '@/components/JsonLd';
import { KONFIG_KATEGORIEN } from '@/lib/konfigurator/daten';

const anzahl = KONFIG_KATEGORIEN.reduce((n, k) => n + k.subCategories.reduce((m, u) => m + u.options.length, 0), 0);

export const metadata: Metadata = {
  title: 'Massanzug-Konfigurator — Stil & Details online wählen',
  description: `Stellen Sie Ihren Massanzug online zusammen: Revers, Knöpfe, Taschen, Schulter, Futter und ${anzahl} weitere Details für Sakko, Hose, Weste und Smoking. Auswahl speichern, als PDF mitnehmen und Termin in Zürich buchen.`,
  alternates: { canonical: '/massanzug-konfigurator/' },
  openGraph: {
    title: 'Massanzug-Konfigurator — The Sartorialist Zürich',
    description: 'Revers, Taschen, Knöpfe und Futter online wählen — und die Auswahl zum Termin ins Atelier mitbringen.',
    url: '/massanzug-konfigurator/',
  },
};

const FAQ = [
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
          { name: 'Konfigurator', href: '/massanzug-konfigurator/' },
        ]}
      />
      <section className="page-hero konf-hero">
        <div className="container">
          <span className="eyebrow">Stil-Konfigurator</span>
          <h1 className="display">Ihr Massanzug beginnt hier.</h1>
          <p className="lead">
            Ihr Stil. Ihr Mass. Ihr Anzug. Entdecken Sie Revers, Knöpfe, Taschen und Verarbeitungsdetails und stellen Sie in
            Ruhe zusammen, was zu Ihnen passt — wo und wann Sie möchten. Ihre Auswahl bringen Sie zum Termin ins Atelier mit:
            Dort nehmen wir Mass, wählen mit Ihnen den Stoff und verfeinern jedes Detail, bis der Anzug nicht nur zu Ihrem
            Körper passt, sondern zu Ihrem Charakter.
          </p>
        </div>
      </section>

      <Konfigurator />

      <Faq items={FAQ} title="Fragen zum Konfigurator" />
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
