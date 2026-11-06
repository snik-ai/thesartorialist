// TODO übersetzen (Portugiesisch (Portugal)) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Made-to-measure suit configurator “Styles & Options”
export const konfigurator: Woerterbuch['konfigurator'] = {
  meta: {
    titel: 'Styles & Options — Made-to-Measure Suit Configurator',
    beschreibung:
      'Design your own made-to-measure suit: {anzahl} styles & options for jacket, trousers, waistcoat and dinner suit — lapels, buttons, pockets, lining. Save your selection as a PDF and have your suit made to measure in Zurich.',
    ogTitel: 'Design Your Made-to-Measure Suit — Styles & Options, The Sartorialist Zurich',
    ogBeschreibung:
      'Choose the lapels, pockets, buttons and lining of your made-to-measure suit online — and bring your selection to your appointment at the atelier.',
  },
  breadcrumb: { massanzug: 'Made-to-measure suit', seite: 'Styles & Options' },
  hero: {
    eyebrow: 'Styles & Options · Style Configurator',
    h1: 'Your made-to-measure suit begins here.',
    lead: 'Your style. Your measurements. Your suit. Explore lapels, buttons, pockets and finishing details, and put together at your leisure what suits you — wherever and whenever you like. Bring your selection to your appointment at the atelier: there we take your measurements, choose the cloth with you and refine every detail until the suit fits not only your body, but your character.',
    hinweise: ['Tap whatever you like', 'You need not choose everything', 'Summary below — as a PDF or straight to your appointment'],
  },
  sogehts: {
    titel: 'Design your own made-to-measure suit — it’s this simple',
    absaetze: [
      'A made-to-measure suit is the sum of many small decisions. Here you can make the first ones at your leisure: single- or double-breasted, notch or peak lapel, jetted or flap pockets, soft Neapolitan or classic shoulder, lined or unlined. Every option is illustrated, so you can see exactly what changes.',
      'Choose only what matters to you. Your selection appears in the summary below, can be saved as a PDF and is sent directly to us with your appointment request.',
    ],
  },
  zuerich: {
    titel: 'Your made-to-measure suit in Zurich',
    text: 'At our atelier on Kuttelgasse 7 we take your measurements, show you cloths from Loro Piana, Vitale Barberis Canonico, Holland & Sherry and other mills, and refine every detail with you. Every made-to-measure suit is full-canvas, 100 % made in Italy, from CHF 1’690 — ready for collection in 20 working days.',
    linkMassanzug: 'More about made-to-measure suits in Zurich',
    linkHochzeit: 'Made-to-measure wedding suits',
  },
  faqTitel: 'Questions about the suit configurator',
  faq: [
    {
      q: 'Can I design my made-to-measure suit online?',
      a: [
        'Yes. In “Styles & Options” you choose the details of your made-to-measure suit online — buttoning, lapels, pockets, shoulder, lining, waistband and more. Measuring and the choice of cloth then take place in person at our atelier in Zurich, so that the suit truly fits.',
      ],
    },
    {
      q: 'What is the suit configurator for?',
      a: [
        'The configurator lets you make the first style decisions at your leisure at home: lapels, buttons, pockets, shoulder, lining, waistband and hem. Bring your selection to your appointment — at the atelier we take your measurements, choose the cloth and refine every detail together.',
      ],
    },
    {
      q: 'Do I have to choose every detail?',
      a: [
        'No. Choose only what matters to you. Anything left open we discuss at your appointment, and we advise you honestly on what suits your figure and the occasion.',
      ],
    },
    {
      q: 'Where is my selection saved?',
      a: [
        'Only in your browser on this device. We receive it only when you request an appointment with your selection or send it to us as a PDF or text.',
      ],
    },
    {
      q: 'How much does a made-to-measure suit with these details cost?',
      a: [
        'Our made-to-measure suits start from CHF 1’690. The final price depends mainly on the cloth and is typically up to around CHF 2’500. Every suit is full-canvas, 100 % made in Italy, and ready for collection in 20 working days.',
      ],
    },
  ],
  cta: {
    titel: 'Selection complete? Now have your measurements taken.',
    text: 'Bring your style selection to a complimentary consultation at Kuttelgasse 7 — or we call you back and discuss everything by phone.',
  },
  schema: {
    name: 'Made-to-measure suit configurator',
    beschreibung:
      'Online style selection for made-to-measure suits: jacket, trousers, waistcoat and dinner suit — selection as a PDF and for your appointment at the atelier in Zurich.',
  },
  ui: {
    kategorienAria: 'Categories',
    gewaehltAria: '{n} selected',
    stoff: 'Cloth',
    meineAuswahl: 'My selection',
    brustSeite: 'Breast · Side',
    detailsZu: 'Details of {label}',
    stoffSub: 'The Holland & Sherry cloth collection',
    stoffText:
      'Since 1836 Holland & Sherry has woven cloth for the finest tailors in the world. Browse the collection and note the numbers of your favourites — we will have the swatches ready for your appointment at the atelier.',
    stoffBildAlt: 'Cloths by Holland & Sherry',
    stoffAnsehen: 'View the cloth collection',
    neuesFenster: 'Opens in a new window',
    stoffKicker: 'Cloth number (optional)',
    stoffPlatzhalter: 'e.g. 9722022',
    stoffAria: 'Cloth number',
    hinzufuegen: 'Add',
    stoffHinweis:
      'You will find the number on the cloth page under “Product Code”. Several numbers are possible — or simply choose the cloth at the atelier.',
    stoffEntfernen: 'Remove cloth {n}',
    uebersicht: 'Summary',
    summaryTitelEins: 'Your made-to-measure suit in {n} detail',
    summaryTitelMehr: 'Your made-to-measure suit in {n} details',
    summaryText: 'Saved in this browser. We take your measurements together at the atelier — where we refine every detail.',
    reset: 'Reset all',
    stoffGruppe: 'Cloth · Holland & Sherry',
    stoffnummer: 'Cloth number',
    leerTitel: 'Nothing selected yet.',
    leerText: 'Tap lapels, pockets, buttons and lining above — your selection will appear here.',
    leerKnopf: 'Start with the jacket',
    entfernen: 'Remove {label}',
    terminKnopf: 'Book an appointment with this selection',
    pdfKnopf: 'Download PDF',
    pdfLaeuft: 'Creating PDF …',
    pdfFertig: 'PDF downloaded',
    pdfFehler: 'The PDF could not be created',
    dockLeer: 'Your summary',
    dockEins: '{n} detail selected',
    dockMehr: '{n} details selected',
    dockText: 'You need not choose everything — we discuss the rest at the atelier.',
    dockGo: 'To the summary',
    schliessen: 'Close',
    code: 'Code {code}',
    brusttasche: 'Breast pocket:',
    seitentaschen: 'Side pockets:',
    abwaehlen: 'Remove from selection',
    waehlen: 'Choose this detail',
    auswahl: {
      taschen: 'Breast {brust}, side {seite}',
      stoffKopf: 'CLOTH (HOLLAND & SHERRY)',
      stoffnummer: 'Cloth number',
      stoffnummern: 'Cloth numbers',
    },
  },
  pdf: {
    dateiname: 'The-Sartorialist-Style-Selection.pdf',
    locale: 'en-GB',
    dokTitel: 'Style Selection, Made-to-Measure Suit — The Sartorialist Zurich',
    dokThema: 'Made-to-measure suit Styles & Options',
    ort: 'ZURICH',
    kopfFolge: 'Style selection · {datum}',
    titel: 'My Style Selection',
    untertitel: 'for the made-to-measure suit — Styles & Options',
    detailEins: '{n} detail',
    detailMehr: '{n} details',
    stoffEins: '{n} cloth',
    stoffMehr: '{n} cloths',
    stoffAbschnitt: 'Cloth · Holland & Sherry',
    stoffnummerKopf: 'CLOTH NUMBER',
    stoffnummernKopf: 'CLOTH NUMBERS',
    notizen: 'Notes for the atelier',
    fussHinweis: 'We take your measurements at the atelier — bring this selection to your appointment.',
    seite: 'Page {p} of {n}',
  },
};
