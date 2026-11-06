// TODO übersetzen (Portugiesisch (Portugal)) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Shop (UI only — product texts come from Shopify and stay in German)
export const shop: Woerterbuch['shop'] = {
  start: {
    meta: {
      titel: 'Shop — Buy Woolrich, Gran Sasso & Tramarossa Online',
      beschreibung:
        'The online shop of The Sartorialist Zurich: {n} hand-picked pieces — Woolrich parkas, Gran Sasso knitwear, Tramarossa jackets. Delivery throughout Switzerland or fittings in our showroom.',
      ogTitel: 'The Wardrobe — Shop The Sartorialist Zurich',
      ogBeschreibung: 'Order Woolrich, Gran Sasso and Tramarossa online — or try them on in our showroom at Kuttelgasse 7.',
      ogAlt: 'Shop The Sartorialist Zurich',
    },
    sortimentEyebrow: 'The collection',
    alleStuecke: 'All pieces',
    direktZu: 'Go to',
    direktZuAria: 'Shop by brand and category',
    mass: {
      eyebrow: 'The made-to-measure suit',
      titel: 'What you do not find here, we tailor to measure.',
      text: 'Our core business is the made-to-measure suit: full canvas, 100 % made in Italy, from CHF 1’690 and ready for collection in 20 working days. The pieces in the shop are its companions.',
      knopf: 'Discover made-to-measure',
      termin: 'Book an appointment',
    },
    faqTitel: 'Questions about the shop',
    faq: [
      {
        q: 'Where does The Sartorialist shop deliver?',
        a: ['We deliver throughout Switzerland. You will see shipping costs and delivery times at checkout, before you place your order.'],
      },
      {
        q: 'Can I try the pieces on before buying?',
        a: [
          'Yes. Every piece in the shop is also available in our showroom at {strasse} in Zurich. Book an appointment and we will have your size ready.',
        ],
      },
      {
        q: 'How do I pay in the shop?',
        a: ['Payment is made through the secure Shopify checkout. The available payment methods are shown there in the final step.'],
      },
      {
        q: 'Are made-to-measure suits available in the shop?',
        a: [
          'No. A made-to-measure suit is cut to your measurements and therefore begins with an appointment in our showroom: from CHF 1’690, full canvas, 100 % made in Italy, ready for collection in 20 working days. In the shop you will find the pieces to go with it — knitwear, parkas, coats and jackets.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Zurich',
    eyebrow: 'Shop · {gruppe}',
    mehrUeber: 'More about {label}',
    weitereAria: 'More shop sections',
    alleStuecke: 'All pieces',
    ctaTitel: 'Rather try it on?',
    ctaText: 'Every piece in the shop is also available in our showroom at Kuttelgasse 7 — along with made-to-measure suits from CHF 1’690.',
  },
  gruppen: { Marke: 'Brand', Für: 'For', Kategorie: 'Category' },
  seiten: {
    woolrich: {
      h1: 'Buy Woolrich Parkas & Jackets Online',
      title: 'Buy Woolrich Parkas & Jackets — Shop Zurich',
      description:
        'Woolrich at The Sartorialist Zurich: Arctic Parka, Cloud Parka, Wool Shirt Jackets and coats for men and women. Order online or try them on in our showroom.',
      intro:
        'Since 1830, Woolrich has stood for outerwear built for real winters. Here you will find the icons of the brand — from the down-filled Arctic Parka to the Wool Shirt Jacket in Melton wool — for men and women. Order online or try your size on in our showroom at Kuttelgasse 7.',
    },
    'gran-sasso': {
      h1: 'Buy Gran Sasso Knitwear Online',
      title: 'Buy Gran Sasso Jumpers & Cashmere — Shop Zurich',
      description:
        'Gran Sasso at The Sartorialist Zurich: merino jumpers, cashmere knitwear, half-zips and cardigans from the Abruzzo region. Order online or try them on in our showroom.',
      intro:
        'Gran Sasso has been knitting in the Abruzzo region since 1952 — merino, cashmere and silk, made in its own manufactory in Sant’Egidio alla Vibrata. The jumpers, half-zips and cardigans sit as well beneath a jacket as with jeans, and are the ideal complement to your made-to-measure suit.',
    },
    tramarossa: {
      h1: 'Buy Tramarossa Jackets & Chinos Online',
      title: 'Buy Tramarossa Jackets & Chinos — Shop Zurich',
      description:
        'Tramarossa at The Sartorialist Zurich: relaxed jackets and chinos in Italian gabardine. Order online or try them on in our showroom.',
      intro:
        'Tramarossa from the Veneto pairs Italian tailoring with an easy attitude: unstructured jackets and chinos in soft gabardine that work as well day to day as they do at the office. Everything combines — jacket and chinos in the same colour make a relaxed suit.',
    },
    herren: {
      label: 'Men',
      h1: 'Buy Menswear Online',
      title: 'Buy Menswear Online — Parkas, Knitwear & Jackets',
      description:
        'Italian menswear in the shop of The Sartorialist Zurich: Woolrich parkas, Gran Sasso knitwear and Tramarossa jackets. Delivery throughout Switzerland.',
      intro:
        'Hand-picked menswear to accompany the made-to-measure suit: parkas and coats for winter, knitwear in merino and cashmere, relaxed jackets and chinos. Everything we carry in our showroom on Kuttelgasse can be ordered here directly — with delivery throughout Switzerland.',
    },
    damen: {
      label: 'Women',
      h1: 'Buy Women’s Parkas & Coats Online',
      title: 'Buy Women’s Parkas & Coats — Shop Zurich',
      description:
        'Women’s parkas and coats by Woolrich at The Sartorialist Zurich: Arctic Parka, Kelly Parka and Madison Coat. Order online, delivery throughout Switzerland.',
      intro:
        'For women we carry Woolrich’s winter jackets: the classic Arctic Parka, the long Kelly Parka and the Madison Coat — warm, water-repellent and timelessly cut. We would be delighted to show you the models in our showroom in Zurich, too.',
    },
    parkas: {
      label: 'Parkas',
      h1: 'Buy Parkas Online',
      title: 'Buy a Parka — Woolrich Arctic & Cloud Parka',
      description:
        'Parkas for men and women at The Sartorialist Zurich: Woolrich Arctic Parka, Cloud Parka, Polar and Ramar. Down-filled and water-repellent.',
      intro:
        'A good parka withstands the Swiss winter and looks as good over a suit as it does with jeans. Our Woolrich parkas are down-filled, water-repellent and have a detachable hood — from the short Cloud Parka to the long Arctic Parka.',
    },
    maentel: {
      label: 'Coats',
      h1: 'Buy Coats Online',
      title: 'Buy a Coat — Wool Coats for Men and Women',
      description:
        'Coats at The Sartorialist Zurich: wool coats and overcoats by Woolrich for men and women — elegant over a suit, warm in winter.',
      intro:
        'A coat is the first thing people see over your suit. Our coats in wool and technical fabrics are long enough to cover the jacket beneath and understated enough for any occasion.',
    },
    strick: {
      label: 'Knitwear',
      h1: 'Buy Jumpers & Knitwear Online',
      title: 'Buy Jumpers & Cashmere — Knitwear from Italy',
      description:
        'Jumpers, half-zips and cardigans in merino and cashmere at The Sartorialist Zurich — made by Gran Sasso in Italy.',
      intro:
        'Knitwear from Italy that never adds bulk beneath a jacket: fine merino roll-necks, half-zips, cashmere jumpers and cardigans. The lighter qualities can be worn all year round; the heavier ones take the place of a jacket in autumn.',
    },
    jacken: {
      label: 'Jackets & Overshirts',
      h1: 'Buy Jackets & Overshirts Online',
      title: 'Buy Jackets & Overshirts — Woolrich Wool Shirt Jacket',
      description:
        'Jackets and overshirts at The Sartorialist Zurich: Woolrich Wool Shirt Jackets, technical overshirts and short jackets for men and women.',
      intro:
        'Between shirt and coat: wool overshirts and short jackets for the transitional seasons. The Woolrich Wool Shirt Jacket has been a classic for decades — robust, warm and woven in Melton wool.',
    },
    'sakkos-hosen': {
      label: 'Jackets & Trousers',
      h1: 'Buy Tailored Jackets & Trousers Online',
      title: 'Buy Tailored Jackets & Chinos — Italian Menswear',
      description:
        'Tailored jackets and chinos at The Sartorialist Zurich: unstructured jackets and chinos in Italian gabardine. For a made-to-measure suit: book an appointment in our showroom.',
      intro:
        'Ready-to-wear jackets and trousers, but with an Italian hand: unstructured, soft and comfortable. If you are looking for a suit that truly fits, book an appointment with us for a made-to-measure suit — from CHF 1’690, ready in 20 working days.',
    },
  },
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} by {marke} at The Sartorialist Zurich, {preis}. Order online or try it on in our showroom in Zurich.',
    versand: 'Delivery throughout Switzerland, costs shown at checkout',
    anprobe: 'Fittings in our showroom: {strasse}, Zurich',
    beratung: 'Personal advice:',
    beschreibung: 'Description',
    alleKategorie: 'All {label}',
    massDazu: 'A made-to-measure suit to match',
    passtEyebrow: 'Goes well with',
    mehrTitel: 'More from the wardrobe',
    ctaEyebrow: 'Advice in store',
    ctaTitel: 'Rather try it on? We will have it ready for you.',
    ctaText: 'Book an appointment or request a call back — we will advise you on size, combinations and the right made-to-measure suit.',
    groesse: 'Size {groesse}',
  },
  werte: {
    // Kategorien (Gruppe → Art → Modell)
    'Jacken & Mäntel': 'Jackets & Coats',
    Strick: 'Knitwear',
    'Sakkos & Hosen': 'Jackets & Trousers',
    Parkas: 'Parkas',
    Mäntel: 'Coats',
    Overshirts: 'Overshirts',
    Jacken: 'Jackets',
    Chinos: 'Chinos',
    Sakkos: 'Tailored jackets',
    Polos: 'Polos',
    Strickjacken: 'Cardigans',
    Troyer: 'Half-zips',
    Rundhals: 'Crew necks',
    Stehkragen: 'Mock necks',
    Pullover: 'Jumpers',
    Wollmantel: 'Wool coat',
    Technisch: 'Technical',
    Zweireiher: 'Double-breasted',
    Einreiher: 'Single-breasted',
    Wolle: 'Wool',
    // Farben
    Schwarz: 'Black',
    Rot: 'Red',
    Beige: 'Beige',
    Braun: 'Brown',
    Grün: 'Green',
    Grau: 'Grey',
    Blau: 'Blue',
    // Für
    Herren: 'Men',
    Damen: 'Women',
  },
  groessenSysteme: { int: 'International', it: 'Italian (jackets, knitwear)', w: 'Waist (trousers)' },
  grid: {
    facetten: {
      group: 'Category',
      sub: 'Type',
      type: 'Model',
      brand: 'Brand',
      size: 'Size',
      color: 'Colour',
      price: 'Price',
      gender: 'For',
    },
    sort: {
      neu: 'Newest first',
      'preis-auf': 'Price: low to high',
      'preis-ab': 'Price: high to low',
      marke: 'Brand A–Z',
    },
    anzahlEins: '{n} piece',
    anzahlMehr: '{n} pieces',
    zeigen: 'Show {anzahl}',
    groesseAria: 'Size {groesse}, {anzahl}',
    nurAnLager: 'Only sizes in stock.',
    markenSuchen: 'Search {n} brands',
    markenSuchenAria: 'Search brands',
    alle: 'All',
    alleName: 'All {name}',
    kategorienAria: 'Categories',
    sortiment: 'Collection',
    nachArtAria: '{name} by type',
    nachModellAria: '{name} by model',
    alleFilter: 'All filters',
    filter: 'Filter',
    nachFiltern: 'Filter by {label}',
    zuruecksetzen: 'Reset',
    ansicht: 'View',
    kompakt: 'More pieces per row',
    gross: 'Larger images',
    sortieren: 'Sort',
    filterEntfernen: 'Remove filter {label}',
    alleZuruecksetzen: 'Reset all',
    leer: 'We have nothing in stock for this combination at the moment.',
    alleFilterZuruecksetzen: 'Reset all filters',
    sheetTitel: 'Filter & sort',
    filterSchliessen: 'Close filters',
  },
  preis: {
    bis: 'up to CHF 300',
    mitte: 'CHF 300–700',
    ab: 'from CHF 700',
    min: 'Min',
    max: 'Max',
    minAria: 'Minimum price',
    maxAria: 'Maximum price',
    minFeldAria: 'Minimum price in CHF',
    maxFeldAria: 'Maximum price in CHF',
    imBereichEins: '{n} piece in this range',
    imBereichMehr: '{n} pieces in this range',
  },
  karte: {
    ausverkauft: 'Sold out',
    sale: 'Sale',
  },
  buybox: {
    groesseWaehlen: 'Select size',
    groesseHinweis: ' — please choose a size first',
    groesseAria: 'Size',
    ausverkauft: 'Sold out',
    busy: 'Adding …',
    fertig: 'In your bag ✓',
    hinzufuegen: 'Add to bag',
    fehler: 'Something went wrong. Please try again or give us a call.',
    anprobieren: 'Try it on in our showroom',
  },
  galerie: {
    ansicht: '{titel} — view {n}',
    bilderAria: 'Images',
    bild: 'Image {n}',
  },
  schrank: {
    eyebrow: 'Shop · The Sartorialist Zurich',
    h1: 'The Wardrobe',
    text: '{n} hand-picked pieces from Woolrich, Gran Sasso and Tramarossa — order online or try them on in our showroom.',
    rolle: 'Carousel',
    aria: 'The Wardrobe — hand-picked pieces',
    zurueck: 'Previous piece',
    weiter: 'Next piece',
    ansehen: 'View →',
    alleArtikel: 'All {n} items',
  },
};
