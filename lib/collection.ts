// Kollektion — Shop-Look ohne Kauf: jedes Stück führt zur Terminbuchung.
// Preise gemäss Website: Massanzüge ab CHF 1'690, Endpreis je nach Stoffwahl.

export type Piece = {
  slug: string;
  name: string;
  subtitle: string;
  price: string;
  category: 'Business' | 'Hochzeit' | 'Masshemd';
  image: string;
  gallery: string[];
  fabrics: string;
  description: string[];
  details: string[];
};

export const COLLECTION: Piece[] = [
  {
    slug: 'massanzug-navy',
    name: 'Massanzug Navy',
    subtitle: 'Zweiteiler aus Super-130-Wolle',
    price: 'ab CHF 1’690',
    category: 'Business',
    image: '/images/navy-blauer-anzug.webp',
    gallery: ['/images/navy-blauer-anzug.webp', '/images/massanzug.webp', '/images/anzug-nach-mass.webp'],
    fabrics: 'Loro Piana · Vitale Barberis Canonico',
    description: [
      'Der navyblaue Massanzug ist das Fundament jeder Garderobe: zeitlos, souverän und bei nahezu jedem Anlass richtig. Gefertigt in Full-Canvas-Verarbeitung passt er sich Ihrer Körperform mit jedem Tragen besser an.',
      'Sie wählen Stoff, Revers, Innenfutter, Knöpfe und alle Details — wir übernehmen Massnahme mit über 30 Parametern und begleiten Sie bis zur letzten Anprobe.',
    ],
    details: ['Full-Canvas-Verarbeitung', '100 % Made in Italy', 'Über 1’000 Stoffe zur Auswahl', 'In 20 Arbeitstagen abholbereit'],
  },
  {
    slug: 'business-anzug',
    name: 'Business-Anzug',
    subtitle: 'Einreiher, klassische Silhouette',
    price: 'ab CHF 1’690',
    category: 'Business',
    image: '/images/business-anzug-zuerich.webp',
    gallery: ['/images/business-anzug-zuerich.webp', '/images/massanzug-zuerich.webp', '/images/anzug-nach-mass.webp'],
    fabrics: 'Vitale Barberis Canonico · Drago · Reda',
    description: [
      'Funktional, dezent und kompromisslos präzise geschnitten: Der Business-Anzug nach Mass begleitet Sie zuverlässig durch lange Arbeitstage — ohne Ziehen, ohne Falten, ohne Kompromisse.',
      'Dichter gewebte Wollqualitäten machen ihn formstabil und langlebig; die genähte Full-Canvas-Einlage lässt das Veston atmen.',
    ],
    details: ['Full-Canvas-Verarbeitung', '100 % Made in Italy', 'Formstabile Wollqualitäten', 'In 20 Arbeitstagen abholbereit'],
  },
  {
    slug: 'dreiteiler',
    name: 'Klassischer Dreiteiler',
    subtitle: 'Mit Weste — zeitlos elegant',
    price: 'ab CHF 1’690',
    category: 'Hochzeit',
    image: '/images/dreiteiler-anzug.webp',
    gallery: ['/images/dreiteiler-anzug.webp', '/images/massanzug-hochzeit-zuerich.jp_.webp', '/images/hochzeitsanzug-zuerich.webp'],
    fabrics: 'Loro Piana · Holland & Sherry',
    description: [
      'Der klassische Dreiteiler mit Weste ist die eleganteste Antwort auf grosse Anlässe. Die Weste lässt sich später separat tragen — so bleibt der Anzug weit über den Anlass hinaus vielseitig.',
      'Besonders beliebt für Hochzeiten: abgestimmte Westen und farblich passende Accessoires für die Trauzeugen.',
    ],
    details: ['Zwei- oder Dreiteiler wählbar', 'Full-Canvas-Verarbeitung', 'Weste separat tragbar', 'Initialen-Stickerei möglich'],
  },
  {
    slug: 'hochzeitsanzug-klassik',
    name: 'Hochzeitsanzug Klassik',
    subtitle: 'Massgeschneidert für Ihren grossen Tag',
    price: 'ab CHF 1’690',
    category: 'Hochzeit',
    image: '/images/hochzeitsanzug.webp',
    gallery: ['/images/hochzeitsanzug.webp', '/images/eleganter-hochzeitsanzug.webp', '/images/Hochzeitsanzug-Zurich-scaled.webp'],
    fabrics: 'Loro Piana · Vitale Barberis Canonico · Drago',
    description: [
      'Ein Hochzeitsanzug ist nicht einfach ein Anzug — er ist ein Statement. Er muss perfekt sitzen, Ihren Charakter widerspiegeln und auf Fotos wie in Erinnerung bestehen.',
      'Auf Wunsch sticken wir den Namen Ihrer Braut, einen Sinnspruch oder das Hochzeitsdatum ins Innenfutter — ein Unikat, das es kein zweites Mal gibt.',
    ],
    details: ['Persönliche Stilberatung 60–90 Min.', 'Full-Canvas-Verarbeitung', 'Stickerei im Innenfutter möglich', '8–10 Wochen vor der Hochzeit buchen'],
  },
  {
    slug: 'braeutigam-anzug',
    name: 'Bräutigam-Anzug',
    subtitle: 'Individuell nach Ihren Wünschen',
    price: 'ab CHF 1’690',
    category: 'Hochzeit',
    image: '/images/braeutigam-anzug-zuerich.webp',
    gallery: ['/images/braeutigam-anzug-zuerich.webp', '/images/hochzeitsanzug-zuerich.webp', '/images/massanzug-hochzeit-zuerich.jp_.webp'],
    fabrics: 'Loro Piana · Vitale Barberis · Solbiati',
    description: [
      'Ob klassisch, modern oder extravagant — wir gestalten Ihren Bräutigam-Anzug individuell: Schnitt, Farbe, Innenfutter, Knöpfe und Details bestimmen Sie.',
      'Wir statten auch Trauzeugen, Väter und Gäste aus — stilvoll aufeinander abgestimmt, ohne den Bräutigam zu überstrahlen.',
    ],
    details: ['Beratung im Atelier Zürich', 'Auswahl aus über 1’000 Stoffen', 'Passende Accessoires', 'Stilberatung für Trauzeugen & Gäste'],
  },
  {
    slug: 'sommeranzug-leinen',
    name: 'Sommeranzug Leinen',
    subtitle: 'Leicht & atmungsaktiv',
    price: 'ab CHF 1’690',
    category: 'Hochzeit',
    image: '/images/sommeranzug-hochzeit.webp',
    gallery: ['/images/sommeranzug-hochzeit.webp', '/images/hochzeitsanzug.webp', '/images/anzug-nach-mass.webp'],
    fabrics: 'Solbiati · Loro Piana · Zegna',
    description: [
      'Für Sommerhochzeiten und warme Tage: Leinen, Woll-Leinen-Mischungen und luftige Gewebe aus Trockenwolle halten Sie frisch — ohne auf Eleganz zu verzichten.',
      'Unsere Erfahrung hilft Ihnen, das passende Material für Ort, Wetter und Stil auszuwählen.',
    ],
    details: ['Leinen & Woll-Leinen-Mischungen', 'Super-130/150-Wolle', 'Ideal für Sommerhochzeiten', 'Full-Canvas-Verarbeitung'],
  },
  {
    slug: 'vintage-anzug-tweed',
    name: 'Vintage-Anzug Tweed',
    subtitle: 'Tweed & Karos — mit Charakter',
    price: 'ab CHF 1’690',
    category: 'Hochzeit',
    image: '/images/vintage-hochzeitsanzug.webp',
    gallery: ['/images/vintage-hochzeitsanzug.webp', '/images/the-sartorialist-zuerich.webp', '/images/dreiteiler-anzug.webp'],
    fabrics: 'Holland & Sherry · Abraham Moon',
    description: [
      'Tweed und Karos feiern ein stilvolles Comeback — perfekt für rustikale Settings, Herbst- und Winterhochzeiten oder als markanter Auftritt im Alltag.',
      'Britische Stoffe, italienische Verarbeitung: Struktur, Wärme und ein eleganter Fall, kombinierbar mit Flanellhosen oder Denim.',
    ],
    details: ['Britische Tweed-Qualitäten', 'Zweireihige Weste möglich', 'Full-Canvas-Verarbeitung', 'Auch als Sakko einzeln'],
  },
  {
    slug: 'modern-classic',
    name: 'Modern Classic',
    subtitle: 'Slim Fit — klare Linie',
    price: 'ab CHF 1’690',
    category: 'Business',
    image: '/images/modern-classic-anzug.webp',
    gallery: ['/images/modern-classic-anzug.webp', '/images/business-anzug-zuerich.webp', '/images/massanzug.webp'],
    fabrics: 'Reda · Vitale Barberis Canonico',
    description: [
      'Schlanke Silhouette, klarer Look: Der Modern Classic verbindet aktuelle Schnittführung mit zeitloser Eleganz — ein Anzug, der auch in 20 Jahren noch überzeugt.',
      'Wir beraten ehrlich, welcher Schnitt zu Ihrer Figur passt — klassisch, modern, italienisch oder britisch.',
    ],
    details: ['Slim-Fit-Schnitt', 'Full-Canvas-Verarbeitung', '100 % Made in Italy', 'In 20 Arbeitstagen abholbereit'],
  },
  {
    slug: 'italienischer-massanzug',
    name: 'Italienischer Massanzug',
    subtitle: 'Neapolitanische Leichtigkeit',
    price: 'ab CHF 1’690',
    category: 'Business',
    image: '/images/italienischer-massanzug.webp',
    gallery: ['/images/italienischer-massanzug.webp', '/images/massanzug-loro-piana.webp', '/images/anzug-nach-mass.webp'],
    fabrics: 'Loro Piana · Cerruti · Scabal',
    description: [
      'Polsterlose Schultern, breites Revers, uneingeschränkte Bewegungsfreiheit: die neapolitanische Schule, wie sie Orazio Luciano perfektioniert hat.',
      'Ein souveräner, «weicher» Auftritt mit perfekt herausgearbeiteter Silhouette — Stolz, Stil und Erfolg in einem Anzug.',
    ],
    details: ['Neapolitanischer Schnitt', 'Polsterlose Schultern', 'Mind. 10 cm breites Revers', 'Handarbeit aus Neapel'],
  },
  {
    slug: 'massanzug-loro-piana',
    name: 'Massanzug Loro Piana',
    subtitle: 'Aus feinsten Loro-Piana-Stoffen',
    price: 'ab CHF 1’990',
    category: 'Business',
    image: '/images/massanzug-loro-piana.webp',
    gallery: ['/images/massanzug-loro-piana.webp', '/images/loro-piana-stoffe.webp', '/images/italienischer-massanzug.webp'],
    fabrics: 'Loro Piana',
    description: [
      'Loro Piana steht weltweit für feinste Stoffe und kompromisslose Qualität — über 200 Jahre Erfahrung, edelste Woll- und Kaschmirqualitäten.',
      'Ein Anzug aus Loro-Piana-Stoffen ist eine Investition in Stil und Qualität, die ein Leben lang hält.',
    ],
    details: ['Original Loro-Piana-Stoffe', 'Feinste Wolle & Kaschmir', 'Full-Canvas-Verarbeitung', 'Endpreis je nach Stoffwahl'],
  },
  {
    slug: 'smoking',
    name: 'Smoking',
    subtitle: 'Black Tie — Mohair-Woll-Mischung',
    price: 'Preis auf Anfrage',
    category: 'Hochzeit',
    image: '/images/eleganter-hochzeitsanzug.webp',
    gallery: ['/images/eleganter-hochzeitsanzug.webp', '/images/hochzeitsanzug.webp', '/images/dreiteiler-anzug.webp'],
    fabrics: 'Exklusive italienische Mohair-Woll-Mischungen',
    description: [
      'Der Inbegriff formeller Herrenmode: Satinkragen, Galonstreifen, Schwarz oder Mitternachtsblau — für Abendveranstaltungen und Hochzeiten mit Dresscode «Black Tie».',
      'Unsere Stoffauswahl für Smokings umfasst exklusive Mohair-Woll-Mischungen, die Sie in Zürich kaum ein zweites Mal finden.',
    ],
    details: ['Satinkragen & Galonstreifen', 'Schwarz oder Mitternachtsblau', 'Full-Canvas-Verarbeitung', 'Passende Fliege & Kummerbund'],
  },
  {
    slug: 'masshemd',
    name: 'Masshemd',
    subtitle: 'Über 400 Hemdenstoffe',
    price: 'Preis auf Anfrage',
    category: 'Masshemd',
    image: '/images/masshemd.webp',
    gallery: ['/images/masshemd.webp', '/images/masshend-zuerich.webp'],
    fabrics: 'Canclini · Albini · Thomas Mason',
    description: [
      'Die logische Ergänzung zum Massanzug: Ein Masshemd sitzt perfekt, scheuert nicht, steht nicht ab — und sieht auch ohne Sakko makellos aus.',
      'Von klassischem Popeline bis Sea-Island-Cotton; beliebt sind verdeckte Knopfleisten, Umschlagmanschetten und Monogramme.',
    ],
    details: ['Über 400 Hemdenstoffe', 'Monogramm & Kontrastnähte', 'Verdeckte Knopfleiste möglich', 'Italienische Qualität'],
  },
];

export function getPiece(slug: string): Piece | undefined {
  return COLLECTION.find((p) => p.slug === slug);
}
