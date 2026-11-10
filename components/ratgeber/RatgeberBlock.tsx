// Seitenblock «Gratis-Ratgeber» (Server): Cover-Mockup, Titel, 3 Nutzenpunkte, Formular Name + Telefon.
// voll = grosser Block (Startseite, Leistungsseiten, Über uns, Glossar), kompakt = Alternative auf Termin/Kontakt
// und am Ende des Konfigurators.
import RatgeberKarte from './RatgeberKarte';
import { woerterbuch } from '@/lib/i18n';
import type { Sprache } from '@/lib/i18n/sprachen';

export default function RatgeberBlock({
  lang,
  variante = 'voll',
  kicker,
  hell = false,
}: {
  lang: Sprache;
  variante?: 'voll' | 'kompakt';
  kicker?: string;
  /** weisser statt warmer Hintergrund (wenn der Block auf eine warme Sektion folgt) */
  hell?: boolean;
}) {
  const t = woerterbuch(lang).allgemein.client.ratgeber;
  return (
    <section className={`section rg-section${hell ? '' : ' section--warm'}${variante === 'kompakt' ? ' rg-section--kompakt' : ''}`} id="ratgeber">
      <div className="container">
        <RatgeberKarte
          t={t}
          lang={lang}
          variante={variante === 'kompakt' ? 'kompakt' : 'block'}
          kicker={variante === 'kompakt' ? (kicker ?? t.alternativeKicker) : kicker}
        />
      </div>
    </section>
  );
}
