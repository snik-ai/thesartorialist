// Zentrale Konstanten für die gesamte Website — eine Quelle der Wahrheit.

export const SITE = {
  name: 'The Sartorialist Zürich',
  shortName: 'The Sartorialist',
  legalName: 'Swiss Art Partner AG',
  url: 'https://thesartorialist.ch',
  tagline: 'Massanzüge & italienische Herrenmode in Zürich',
  description:
    'The Sartorialist Zürich – Massanzüge, Hochzeitsanzüge und exklusive italienische Herrenmode. Full-Canvas-Verarbeitung, 100% Made in Italy, Massanzüge ab CHF 1’690. Showroom an der Kuttelgasse 7, vis-à-vis Park Hyatt.',
  locale: 'de_CH',
  lang: 'de',
  phone: '+41 43 243 02 77',
  phoneHref: 'tel:+41432430277',
  mobile: '+41 76 488 06 30',
  mobileHref: 'tel:+41764880630',
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
  priceRange: 'CHF 1’690 – CHF 2’500',
  areaServed: 'Zürich und Umgebung, Schweiz',
  socials: {
    instagram: 'https://www.instagram.com/the_sartorialist_zurich/',
  },
} as const;

export type NavItem = { label: string; href: string };

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Kollektion', href: '/kollektion/' },
  { label: 'Massanzug', href: '/massanzug-zuerich/' },
  { label: 'Hochzeitsanzug', href: '/hochzeitsanzug-zuerich/' },
  { label: 'Brands', href: '/category/brand/' },
  { label: 'Über uns', href: '/ueber-uns/' },
];

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'Atelier',
    items: [
      { label: 'Massanzug Zürich', href: '/massanzug-zuerich/' },
      { label: 'Hochzeitsanzug Zürich', href: '/hochzeitsanzug-zuerich/' },
      { label: 'Hochzeit Anzug 2024', href: '/hochzeit-anzug-2024/' },
      { label: 'Anzüge Zürich', href: '/anzuege-zuerich/' },
      { label: 'Services', href: '/services/' },
    ],
  },
  {
    title: 'Kollektion',
    items: [
      { label: 'Alle Anzüge', href: '/kollektion/' },
      { label: 'Anzug blau', href: '/anzug-blau/' },
      { label: 'Anzug grün', href: '/anzug-gruen/' },
      { label: 'Anzug beige', href: '/anzug-beige/' },
    ],
  },
  {
    title: 'Haus',
    items: [
      { label: 'Über uns', href: '/ueber-uns/' },
      { label: 'Brands', href: '/category/brand/' },
      { label: 'Termin buchen', href: '/termin/' },
      { label: 'Kontakt / Anfahrt', href: '/kontakt/' },
      { label: 'Newsletter', href: '/newsletter/' },
    ],
  },
  {
    title: 'Rechtliches',
    items: [
      { label: 'Impressum', href: '/impressum/' },
      { label: 'Datenschutzerklärung', href: '/datenschutzerklaerung/' },
      { label: 'AGB / Zahlung auf Raten', href: '/allgemeine-geschaeftsbedingungen/' },
    ],
  },
];
