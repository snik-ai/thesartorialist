// Zentrale Konstanten für die gesamte Website — eine Quelle der Wahrheit.

export const SITE = {
  name: 'The Sartorialist Zürich',
  shortName: 'The Sartorialist',
  legalName: 'Swiss Art Partner AG',
  url: 'https://thesartorialist.ch',
  tagline: 'Massanzüge & italienische Herrenmode in Zürich',
  description:
    'The Sartorialist Zürich – Massanzüge, Hochzeitsanzüge und exklusive italienische Herrenmode. Full-Canvas-Verarbeitung, 100% Made in Italy, Massanzüge ab CHF 1’690. Showroom an der Kuttelgasse 7 in Zürich.',
  locale: 'de_CH',
  lang: 'de',
  phone: '+41 43 243 02 77',
  phoneHref: 'tel:+41432430277',
  mobile: '+41 76 488 06 30',
  mobileHref: 'tel:+41764880630',
  /** WhatsApp über die Mobilnummer */
  whatsapp: 'https://wa.me/41764880630',
  email: 'store@thesartorialist.ch',
  founder: 'Alexander Shubin',
  address: {
    street: 'Kuttelgasse 7',
    postalCode: '8001',
    city: 'Zürich',
    region: 'Zürich',
    country: 'CH',
    lat: 47.3728,
    lng: 8.5383,
  },
  openingHours: [
    { days: 'Montag – Freitag', time: '10:00 – 19:00' },
    { days: 'Samstag', time: '10:00 – 17:00' },
    { days: 'Termin', time: 'nach Vereinbarung' },
  ],
  openingHoursSchema: ['Mo-Fr 10:00-19:00', 'Sa 10:00-17:00'],
  /** Öffnungszeiten maschinenlesbar (0 = Sonntag … 6 = Samstag), Zeitzone Europe/Zurich */
  hours: { 1: ['10:00', '19:00'], 2: ['10:00', '19:00'], 3: ['10:00', '19:00'], 4: ['10:00', '19:00'], 5: ['10:00', '19:00'], 6: ['10:00', '17:00'] } as Record<number, [string, string]>,
  priceRange: 'CHF 1’690 – CHF 2’500',
  areaServed: 'Zürich und Umgebung, Schweiz',
  socials: {
    instagram: 'https://www.instagram.com/the_sartorialist_zurich/',
  },
} as const;

// Navigation und Footer-Spalten: siehe lib/i18n/<sprache>/allgemein.ts (je Sprache).
