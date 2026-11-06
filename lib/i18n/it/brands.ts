import type { Woerterbuch } from '../de';

// Panoramica dei marchi e testi UI delle pagine marchio e colore
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Marchi — Le nostre sartorie e i nostri lanifici',
    beschreibung:
      'I marchi di The Sartorialist Zurigo: Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso e Woolrich — case a conduzione familiare, scelte personalmente.',
    ogTitel: 'Marchi — The Sartorialist Zurigo',
    ogBeschreibung: 'Case a conduzione familiare, scelte personalmente.',
  },
  breadcrumb: 'Marchi',
  hero: {
    eyebrow: 'I nostri marchi',
    h1: 'I veri volti dietro le etichette',
    lead: 'Lavoriamo esclusivamente con aziende a conduzione familiare che conosciamo di persona. Ogni casa è guidata da maestri del proprio mestiere e vanta decenni di tradizione.',
  },
  farben: {
    eyebrow: 'Su misura',
    titel: 'Abiti per colore',
    bildAlt: '{name} — su misura a Zurigo',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} da The Sartorialist Zurigo',
    bildAlt: '{name} da The Sartorialist Zurigo',
    termin: 'Prenoti un appuntamento',
    shopEyebrow: 'Nello shop',
    shopTitel: '{name} da The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Tutto {name} nello shop',
    impressionenEyebrow: 'Impressioni',
    impressionAlt: '{name} — impressione {n}, The Sartorialist Zurigo',
    weitereEyebrow: 'Altri marchi',
    weitereTitel: 'Scopra le nostre case',
    ctaTitel: 'Scopra {name} di persona — nel nostro showroom in Kuttelgasse.',
    ctaText: 'Una consulenza rilassata e senza impegno davanti a un espresso — per lasciarsi ispirare.',
    schemaName: '{name} a Zurigo',
  },
  farbe: {
    breadcrumbMassanzug: 'Abito su misura',
    eyebrow: 'Su misura',
    bildAlt: '{name} — su misura da The Sartorialist Zurigo',
    termin: 'Prenoti un appuntamento',
    weitereFarben: 'Altri colori',
    ctaTitel: '{name} su misura — a partire da CHF 1’690.',
    ctaText: 'Scelta del tessuto, presa delle misure e consulenza nel nostro showroom in Kuttelgasse 7, Zurigo.',
    schemaName: '{name} su misura a Zurigo',
  },
};
