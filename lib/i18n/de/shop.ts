// Shop: Startseite (/shop/), Landingpages (/shop/<slug>/), Produktseiten und die
// Client-Komponenten (Filter, Karten, Kaufbox, Galerie, Preisfilter, Kleiderschrank).
// Produkttexte kommen von Shopify und bleiben Original. Die Texte der Landingpages
// stehen auf Deutsch in lib/shop/pages.ts; andere Sprachen überlagern sie hier je Slug.
// Platzhalter {…} werden mit fmt() ersetzt.

/** Übersetzung einer Shop-Landingpage (Felder wie in lib/shop/pages.ts). */
export type ShopSeitenText = { label?: string; h1?: string; title?: string; description?: string; intro?: string };

export const shop = {
  start: {
    meta: {
      titel: 'Shop — Woolrich, Gran Sasso & Tramarossa online kaufen',
      beschreibung:
        'Der Online-Shop von The Sartorialist Zürich: {n} ausgewählte Stücke — Woolrich Parkas, Gran Sasso Strick, Tramarossa Sakkos. Versand in der ganzen Schweiz oder Anprobe im Showroom.',
      ogTitel: 'Der Kleiderschrank — Shop The Sartorialist Zürich',
      ogBeschreibung: 'Woolrich, Gran Sasso und Tramarossa online bestellen — oder im Showroom an der Kuttelgasse 7 anprobieren.',
      ogAlt: 'Shop The Sartorialist Zürich',
    },
    sortimentEyebrow: 'Sortiment',
    alleStuecke: 'Alle Stücke',
    direktZu: 'Direkt zu',
    direktZuAria: 'Shop nach Marke und Kategorie',
    mass: {
      eyebrow: 'Der Massanzug',
      titel: 'Was Sie hier nicht finden, nähen wir nach Mass.',
      text: 'Unser Kerngeschäft ist der Massanzug: Full Canvas, 100 % Made in Italy, ab CHF 1’690 und in 20 Arbeitstagen abholbereit. Die Stücke im Shop sind die Begleiter dazu.',
      knopf: 'Massanzug entdecken',
      termin: 'Termin buchen',
    },
    faqTitel: 'Fragen zum Shop',
    faq: [
      {
        q: 'Wohin liefert der Shop von The Sartorialist?',
        a: ['Wir liefern in die ganze Schweiz. Versandkosten und Lieferzeit sehen Sie im Checkout, bevor Sie bestellen.'],
      },
      {
        q: 'Kann ich die Stücke vor dem Kauf anprobieren?',
        a: [
          'Ja. Alle Stücke im Shop führen wir auch im Showroom an der {strasse} in Zürich. Buchen Sie einen Termin, dann legen wir Ihre Grösse bereit.',
        ],
      },
      {
        q: 'Wie bezahle ich im Shop?',
        a: ['Bezahlt wird im sicheren Shopify-Checkout. Welche Zahlungsarten verfügbar sind, sehen Sie dort im letzten Schritt.'],
      },
      {
        q: 'Gibt es im Shop auch Massanzüge?',
        a: [
          'Nein. Ein Massanzug entsteht nach Ihren Massen und beginnt deshalb mit einem Termin im Showroom: ab CHF 1’690, Full Canvas, 100 % Made in Italy, in 20 Arbeitstagen abholbereit. Im Shop finden Sie die passenden Stücke dazu — Strick, Parkas, Mäntel und Sakkos.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Zürich',
    eyebrow: 'Shop · {gruppe}',
    mehrUeber: 'Mehr über {label}',
    weitereAria: 'Weitere Shop-Bereiche',
    alleStuecke: 'Alle Stücke',
    ctaTitel: 'Lieber anprobieren?',
    ctaText: 'Alle Stücke aus dem Shop führen wir auch im Showroom an der Kuttelgasse 7 — dazu Massanzüge ab CHF 1’690.',
  },
  /** Gruppenbezeichnung der Landingpages zur Anzeige (Schlüssel = Wert in pages.ts) */
  gruppen: { Marke: 'Marke', Für: 'Für', Kategorie: 'Kategorie' } as Record<string, string>,
  /** Überlagerung der Landingpage-Texte je Slug (Deutsch: leer, Quelle ist pages.ts) */
  seiten: {} as Record<string, ShopSeitenText>,
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} von {marke} bei The Sartorialist Zürich, {preis}. {text} Online bestellen oder im Showroom anprobieren.',
    versand: 'Versand in die ganze Schweiz, Kosten im Checkout',
    anprobe: 'Anprobe im Showroom: {strasse}, {stadt}',
    beratung: 'Persönliche Beratung:',
    beschreibung: 'Beschreibung',
    alleKategorie: 'Alle {label}',
    massDazu: 'Massanzug dazu',
    passtEyebrow: 'Passt dazu',
    mehrTitel: 'Mehr aus dem Kleiderschrank',
    ctaEyebrow: 'Beratung im Store',
    ctaTitel: 'Lieber anprobieren? Wir legen es für Sie bereit.',
    ctaText: 'Termin buchen oder Rückruf anfordern — wir beraten Sie zu Grösse, Kombination und passendem Massanzug.',
    /** Variantenname im JSON-LD: «<Titel> — Grösse M» */
    groesse: 'Grösse {groesse}',
  },

  /* ---------- Client-Komponenten (gehen als Props in den Browser) ---------- */
  /** Anzeigenamen für Filterwerte (Kategorien, Farben, Herren/Damen). Werte und
   * URL-Parameter bleiben deutsch; Deutsch braucht keine Einträge. */
  werte: {} as Record<string, string>,
  /** Grössensysteme im Filter: int (XS–XXL), it (44–56), w (Bundweite) */
  groessenSysteme: { int: 'International', it: 'Italienisch (Sakko, Strick)', w: 'Bundweite (Hosen)' } as Record<string, string>,
  grid: {
    facetten: {
      group: 'Kategorie',
      sub: 'Art',
      type: 'Modell',
      brand: 'Marke',
      size: 'Grösse',
      color: 'Farbe',
      price: 'Preis',
      gender: 'Für',
    },
    sort: {
      neu: 'Neueste zuerst',
      'preis-auf': 'Preis aufsteigend',
      'preis-ab': 'Preis absteigend',
      marke: 'Marke A–Z',
    },
    anzahlEins: '{n} Stück',
    anzahlMehr: '{n} Stücke',
    zeigen: '{anzahl} zeigen',
    groesseAria: 'Grösse {groesse}, {anzahl}',
    nurAnLager: 'Nur Grössen an Lager.',
    markenSuchen: '{n} Marken durchsuchen',
    markenSuchenAria: 'Marken durchsuchen',
    alle: 'Alle',
    alleName: 'Alle {name}',
    kategorienAria: 'Kategorien',
    sortiment: 'Sortiment',
    nachArtAria: '{name} nach Art',
    nachModellAria: '{name} nach Modell',
    alleFilter: 'Alle Filter',
    filter: 'Filter',
    nachFiltern: 'Nach {label} filtern',
    zuruecksetzen: 'Zurücksetzen',
    ansicht: 'Ansicht',
    kompakt: 'Mehr Stücke pro Reihe',
    gross: 'Grössere Bilder',
    sortieren: 'Sortieren',
    filterEntfernen: 'Filter {label} entfernen',
    alleZuruecksetzen: 'Alle zurücksetzen',
    leer: 'Für diese Kombination haben wir gerade nichts an Lager.',
    alleFilterZuruecksetzen: 'Alle Filter zurücksetzen',
    sheetTitel: 'Filtern & sortieren',
    filterSchliessen: 'Filter schliessen',
  },
  preis: {
    bis: 'bis CHF 300',
    mitte: 'CHF 300–700',
    ab: 'ab CHF 700',
    min: 'Min',
    max: 'Max',
    minAria: 'Mindestpreis',
    maxAria: 'Höchstpreis',
    minFeldAria: 'Mindestpreis in CHF',
    maxFeldAria: 'Höchstpreis in CHF',
    imBereichEins: '{n} Stück in diesem Bereich',
    imBereichMehr: '{n} Stücke in diesem Bereich',
  },
  karte: {
    ausverkauft: 'Ausverkauft',
    sale: 'Sale',
  },
  buybox: {
    groesseWaehlen: 'Grösse wählen',
    groesseHinweis: ' — bitte zuerst eine Grösse antippen',
    groesseAria: 'Grösse',
    ausverkauft: 'Ausverkauft',
    busy: 'Wird hinzugefügt …',
    fertig: 'Im Warenkorb ✓',
    hinzufuegen: 'In den Warenkorb',
    fehler: 'Das hat nicht geklappt. Bitte nochmals versuchen oder uns anrufen.',
    anprobieren: 'Im Showroom anprobieren',
  },
  galerie: {
    ansicht: '{titel} — Ansicht {n}',
    bilderAria: 'Bilder',
    bild: 'Bild {n}',
  },
  schrank: {
    eyebrow: 'Shop · The Sartorialist Zürich',
    h1: 'Der Kleiderschrank',
    text: '{n} ausgewählte Stücke von Woolrich, Gran Sasso und Tramarossa — online bestellen oder im Showroom anprobieren.',
    rolle: 'Karussell',
    aria: 'Der Kleiderschrank — ausgewählte Stücke',
    zurueck: 'Vorheriges Stück',
    weiter: 'Nächstes Stück',
    ansehen: 'Ansehen →',
    alleArtikel: 'Alle {n} Artikel',
  },
};
