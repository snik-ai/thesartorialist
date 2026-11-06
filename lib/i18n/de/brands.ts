// Brands-Übersicht sowie die UI-Texte der Brand-Seiten (marke) und Anzug-Farbseiten (farbe).
// Inhalte der einzelnen Brands/Farben: lib/brands.ts bzw. lib/suitColors.ts (Übersetzungen in marken/farben).
export const brands = {
  meta: {
    titel: 'Brands — Unsere Manufakturen',
    beschreibung:
      'Die Brands von The Sartorialist Zürich: Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso und Woolrich — familiengeführte Manufakturen, persönlich ausgewählt.',
    ogTitel: 'Brands — The Sartorialist Zürich',
    ogBeschreibung: 'Familiengeführte Manufakturen, persönlich ausgewählt.',
  },
  breadcrumb: 'Brands',
  hero: {
    eyebrow: 'Unsere Brands',
    h1: 'Die echten Gesichter hinter den Marken',
    lead: 'Wir arbeiten ausschliesslich mit familiengeführten Unternehmen zusammen, die wir persönlich kennen. Jede Manufaktur wird von Meistern ihres Fachs geführt und blickt auf jahrzehntelange Tradition zurück.',
  },
  farben: {
    eyebrow: 'Massanfertigung',
    titel: 'Anzüge nach Farbe',
    bildAlt: '{name} — massgeschneidert in Zürich',
  },
  /** Brand-Seite (/<slug>/) — Platzhalter {name}, {claim}, {titel}, {n} */
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} bei The Sartorialist Zürich',
    bildAlt: '{name} bei The Sartorialist Zürich',
    termin: 'Termin buchen',
    shopEyebrow: 'Im Shop',
    shopTitel: '{name} bei The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Alle {name} im Shop',
    impressionenEyebrow: 'Impressionen',
    impressionAlt: '{name} — Impression {n}, The Sartorialist Zürich',
    weitereEyebrow: 'Weitere Brands',
    weitereTitel: 'Entdecken Sie unsere Manufakturen',
    ctaTitel: '{name} live erleben — im Showroom an der Kuttelgasse.',
    ctaText: 'Lassen Sie sich bei einem unverbindlichen Espresso beraten und begeistern.',
    schemaName: '{name} in Zürich',
  },
  /** Anzug-Farbseite (/anzug-blau/ usw.) — Platzhalter {name} */
  farbe: {
    breadcrumbMassanzug: 'Massanzug',
    eyebrow: 'Massanfertigung',
    bildAlt: '{name} — massgeschneidert von The Sartorialist Zürich',
    termin: 'Termin buchen',
    weitereFarben: 'Weitere Farben',
    ctaTitel: 'Ihr {name} nach Mass — ab CHF 1’690.',
    ctaText: 'Stoffwahl, Massnahme und Beratung im Showroom an der Kuttelgasse 7, Zürich.',
    schemaName: '{name} nach Mass in Zürich',
  },
};
