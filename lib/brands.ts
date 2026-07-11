// Brand-Seiten — Inhalte vollumfänglich von der bestehenden Website übernommen.

export type Brand = {
  slug: string;
  name: string;
  claim: string;
  metaDescription: string;
  origin: string;
  hero: string;
  gallery: string[];
  sections: { title: string; text: string }[];
};

// Gemeinsame Store-Galerie (Aufnahmen aus dem Showroom Kuttelgasse).
export const STORE_GALLERY = [
  '/images/97-12-scaled.webp',
  '/images/98-12-scaled.webp',
  '/images/99-12-scaled.webp',
  '/images/100-12-scaled.webp',
  '/images/101-12-scaled.webp',
  '/images/102-12-scaled.webp',
  '/images/103-12-scaled.webp',
];

export const BRANDS: Brand[] = [
  {
    slug: 'orazio-luciano',
    name: 'Orazio Luciano',
    claim: 'Neapolitanische Schneiderkunst',
    metaDescription:
      'Orazio Luciano bei The Sartorialist Zürich: handgemachte Anzüge aus Neapel — raffinierte Klassik, polsterlose Schultern, berühmte Passform.',
    origin: 'Neapel, Italien',
    hero: '/images/orazio-luzioano.webp',
    gallery: [
      '/images/DSC_7143-scaled.webp',
      '/images/DSC_7187-scaled.webp',
      '/images/DSC_7251-scaled.webp',
      '/images/DSC_7254-scaled.webp',
      '/images/DSC_7266-scaled.webp',
      '/images/DSC_7270-scaled.webp',
      '/images/DSC_7273-scaled.webp',
      '/images/DSC_7280-scaled.webp',
      '/images/DSC_7309-scaled.webp',
      '/images/DSC_7381-scaled.webp',
      '/images/DSC_7403-scaled.webp',
      '/images/DSC_7416-scaled.webp',
    ],
    sections: [
      {
        title: 'Mailand ist die Stadt der Mode. Neapel ist die Stadt der Schneider.',
        text: 'Jeder Mann sollte einen handgemachten Anzug aus Neapel besitzen — einen Anzug, der Stolz, Stil und Erfolg verkörpert. Die Marke Orazio Luciano zeichnet sich durch raffinierte Klassik mit einem Touch technischer Virtuosität aus, inspiriert von der neapolitanischen Schneiderei. Die Modelle werden mit modernen Schnittlinien entworfen — für einen leichten, uneingeschränkten Tragekomfort.',
      },
      {
        title: 'Die berühmte Passform',
        text: 'Die Orazio-Luciano-Passform bietet uneingeschränkte Bewegungsfreiheit und eine perfekt herausgearbeitete Silhouette. Die Schultern werden optimal akzentuiert, die Taille schmeichelhaft betont, die Hose auf die perfekte Länge gebracht. Typisch ist das mindestens 10 cm breite Revers, das zusammen mit den polsterlosen Schultern für einen souveränen, jedoch «weichen» Auftritt sorgt. Das neapolitanische Flair ist in jedem Anzug, jeder Jacke, jedem Mantel und jedem Detail präsent.',
      },
    ],
  },
  {
    slug: 'maria-santangelo',
    name: 'Maria Santangelo',
    claim: 'Handgefertigte Hemden seit 1953',
    metaDescription:
      'Maria Santangelo bei The Sartorialist Zürich: handgenähte Hemden aus Neapel seit 1953 — australische Perlmuttknöpfe, 100% hauseigene Produktion.',
    origin: 'Neapel, Italien · seit 1953',
    hero: '/images/masshemd.webp',
    gallery: [
      '/images/1.webp', '/images/2.webp', '/images/3.webp', '/images/4.webp',
      '/images/5.webp', '/images/6.webp', '/images/7.webp', '/images/8.webp',
      '/images/9.webp', '/images/10.webp', '/images/11.webp', '/images/12.webp',
    ],
    sections: [
      {
        title: 'Neapolitanische Hemdenkunst',
        text: 'Der neapolitanischen Schule folgend wird jedes Hemd von Maria Santangelo von Hand hergestellt und bestickt — nur so kann Perfektion erreicht werden. Mit australischen Perlmuttknöpfen versehen, ist das Hemd eine luxuriöse und legere Option. Um Nähte und Unebenheiten zu vermeiden, wird jedes Etikett von Hand angenäht — das Kennzeichen eines echten Santangelo-Hemds.',
      },
      {
        title: 'Familientradition seit 1953',
        text: 'Seit 1953 sind Maria-Santangelo-Hemden ein Ausdruck der neapolitanischen Schneidertradition. Das Unternehmen wird bis heute von Familienhand geführt und scheut nicht vor Innovation zurück. Ein besonderer Stolz ist die zu 100 % hauseigene Produktion — die Stückzahl ist bewusst limitiert, was jedes Hemd noch exklusiver macht.',
      },
    ],
  },
  {
    slug: 'loro-piana',
    name: 'Loro Piana',
    claim: 'Feinste Stoffe der Welt',
    metaDescription:
      'Loro Piana bei The Sartorialist Zürich: Massanzüge aus feinsten Woll- und Kaschmirstoffen — über 200 Jahre Textilerfahrung, kompromisslose Qualität.',
    origin: 'Quarona, Italien · über 200 Jahre',
    hero: '/images/massanzug-loro-piana.webp',
    gallery: ['/images/loro-piana-stoffe.webp', ...STORE_GALLERY.slice(0, 5)],
    sections: [
      {
        title: 'Luxuriöse Stoffe für erstklassige Anzüge',
        text: 'Loro Piana steht weltweit für feinste Stoffe und kompromisslose Qualität. Die italienische Marke hat sich auf die Herstellung edelster Materialien spezialisiert und ist bekannt für ihre aussergewöhnlichen Woll- und Kaschmirprodukte. Mit über 200 Jahren Erfahrung in der Textilbranche bietet Loro Piana Stoffe, die Eleganz, Komfort und Langlebigkeit perfekt vereinen.',
      },
      {
        title: 'Handwerkskunst trifft auf Innovation',
        text: 'Loro Piana kombiniert traditionelle Handwerkskunst mit modernster Technologie. Von feinstem Kaschmir über luxuriöse Merinowolle bis hin zu seltenen Naturfasern — jeder Stoff ist ein Meisterwerk. Die besondere Verarbeitung garantiert nicht nur eine elegante Optik, sondern auch Funktionalität und Haltbarkeit, die ihresgleichen sucht.',
      },
      {
        title: 'Massgeschneiderte Perfektion in unserem Store',
        text: 'Unsere Anzüge aus exklusiven Loro-Piana-Stoffen werden individuell auf Ihre Masse und Ihren Stil abgestimmt. Die Kombination aus erstklassigen Materialien und präziser Massanfertigung sorgt für perfekten Sitz und maximalen Tragekomfort. Erleben Sie die Stoffe direkt bei uns im Store in Zürich — unser Team findet den perfekten Anzug für Sie.',
      },
    ],
  },
  {
    slug: 'holland-sherry',
    name: 'Holland & Sherry',
    claim: 'Britische Stofftradition seit 1836',
    metaDescription:
      'Holland & Sherry bei The Sartorialist Zürich: feinste Wollstoffe, Kaschmir und Seide für massgeschneiderte Anzüge höchster Güte.',
    origin: 'London / Peebles, Grossbritannien',
    hero: '/images/Holland-Sherry-8-scaled.webp',
    gallery: [
      '/images/Holland-Sherry-1-scaled.webp',
      '/images/Holland-Sherry-2-scaled.webp',
      '/images/Holland-Sherry-3-scaled.webp',
      '/images/Holland-Sherry-4-scaled.webp',
      '/images/Holland-Sherry-5-scaled.webp',
      '/images/Holland-Sherry-6-scaled.webp',
      '/images/Holland-Sherry-7-scaled.webp',
      '/images/Holland-Sherry-9-scaled.webp',
      '/images/Holland-Sherry-10-scaled.webp',
    ],
    sections: [
      {
        title: 'Eine Tradition der Exzellenz',
        text: 'Seit seiner Gründung hat sich Holland & Sherry auf die Herstellung feinster Wollstoffe, Kaschmir und Seide spezialisiert, die höchste Ansprüche an Qualität und Stil erfüllen. Die Marke steht für zeitlose Eleganz und kontinuierliche Innovation. Die Stoffe sind bekannt für ihre luxuriöse Textur und aussergewöhnliche Strapazierfähigkeit — die erste Wahl für anspruchsvolle Massanzüge.',
      },
      {
        title: 'Massgeschneiderte Anzüge mit Holland-&-Sherry-Stoffen',
        text: 'Bei uns können Sie Anzüge anfertigen lassen, die mit den erlesenen Stoffen von Holland & Sherry gefertigt werden. Ob klassischer Businessanzug, eleganter Hochzeitsanzug oder modischer Freizeitanzug — wir bieten eine breite Palette an Farben, Mustern und Texturen mit unzähligen Gestaltungsmöglichkeiten.',
      },
      {
        title: 'Qualität und Stil vereint',
        text: 'Die Stoffe zeichnen sich durch aussergewöhnliche Qualität und präzise Verarbeitung aus: leicht, atmungsaktiv und hervorragend haltbar — ideal für massgeschneiderte Anzüge mit makellosem Sitz und edler Optik, die über viele Jahre höchsten Tragekomfort bieten.',
      },
    ],
  },
  {
    slug: 'gran-sasso',
    name: 'Gran Sasso',
    claim: 'Italienische Strickkunst',
    metaDescription:
      'Gran Sasso bei The Sartorialist Zürich: luxuriöse Strickmode aus Italien — Kaschmir, Wolle und Baumwolle in zeitlosem Design.',
    origin: 'Abruzzen, Italien · seit den 1950ern',
    hero: '/images/2024069_A20245715220202049L.webp',
    gallery: STORE_GALLERY.slice(0, 6),
    sections: [
      {
        title: 'Zeitlose italienische Eleganz',
        text: 'Gran Sasso steht seit Jahrzehnten für hochwertige italienische Mode, die Eleganz und Handwerkskunst vereint. Die in den 1950er Jahren gegründete Marke hat sich auf luxuriöse Strickmode spezialisiert und überzeugt mit zeitlosem Stil und exquisiten Materialien. Jedes Kleidungsstück wird in Italien gefertigt und verkörpert die Tradition des «Made in Italy».',
      },
      {
        title: 'Qualität und Design',
        text: 'Bei Gran Sasso treffen innovative Designs auf traditionelle Handarbeit. Das Sortiment reicht von edlen Pullovern und Cardigans über Polohemden bis hin zu eleganten Freizeit- und Businessoutfits. Hochwertige Materialien wie Kaschmir, Wolle und Baumwolle sorgen für Komfort und Langlebigkeit.',
      },
      {
        title: 'Gran Sasso bei uns im Store in Zürich',
        text: 'Entdecken Sie die exklusive Mode von Gran Sasso in unserem Store im Herzen von Zürich. Wir bieten eine sorgfältig ausgewählte Kollektion der hochwertigen Strickwaren und eleganten Kleidungsstücke dieser renommierten Marke. Unser Team steht Ihnen beratend zur Seite.',
      },
    ],
  },
  {
    slug: 'jacob-cohen',
    name: 'Jacob Cohën',
    claim: 'Luxus-Denim aus Italien',
    metaDescription:
      'Jacob Cohën bei The Sartorialist Zürich: das luxuriöse Jeans-Label aus Italien — Handarbeit, edelste Materialien, sportliche Eleganz.',
    origin: 'Pontelongo, Italien',
    hero: '/images/jacob-cohen.webp',
    gallery: STORE_GALLERY.slice(0, 6),
    sections: [
      {
        title: 'Das luxuriöse Jeans-Label',
        text: 'Jacob Cohën zeichnet sich durch einen einzigartigen Stil und exzellente Designs aus. Mit Liebe zum Detail kreiert die Lifestyle-Marke innovative Kollektionen aus edelsten Materialien in Handarbeit. Das Label hat sich weltweit einen Namen gemacht und setzt seine Qualitätsansprüche mit «Made in Italy» weit nach oben.',
      },
      {
        title: 'Sportliche Lässigkeit trifft Eleganz',
        text: 'Durch das Gespür für Innovation werden sportliche Lässigkeit und Eleganz vereint. Jacob-Cohën-Jeans sind nicht nur aussergewöhnlich komfortabel — sie gelten in der Modewelt als Symbol für luxuriösen Denim.',
      },
    ],
  },
  {
    slug: 'paul-and-shark',
    name: 'Paul & Shark',
    claim: 'Italienische Premium-Mode, maritime Wurzeln',
    metaDescription:
      'Paul & Shark bei The Sartorialist Zürich: italienische Premium-Mode mit maritimem Flair — luxuriöse Freizeit- und Sportbekleidung seit 1975.',
    origin: 'Varese, Italien · seit 1975',
    hero: '/images/paul-shark-look.webp',
    gallery: STORE_GALLERY.slice(0, 6),
    sections: [
      {
        title: 'Premium-Mode mit maritimen Wurzeln',
        text: 'Paul & Shark steht für erstklassige italienische Mode mit unverkennbar maritimem Flair. Die 1975 gegründete Marke hat sich durch hochwertige Materialien und innovative Designs weltweit einen Namen gemacht — besonders bekannt für luxuriöse Freizeit- und Sportbekleidung, die stilvolle Eleganz mit Funktionalität verbindet.',
      },
      {
        title: 'Qualität und Nachhaltigkeit',
        text: 'Die Philosophie von Paul & Shark basiert auf Qualität und Nachhaltigkeit. Jedes Kleidungsstück wird mit höchster Präzision aus den besten Materialien gefertigt. Die Marke legt grossen Wert auf umweltfreundliche Produktionstechniken — für stilvolle Mode, die langlebig und verantwortungsbewusst ist.',
      },
      {
        title: 'Maritimer Stil für jede Gelegenheit',
        text: 'Von eleganten Jacken und Poloshirts bis zu luxuriösen Strickwaren: Die Kollektion eignet sich für den Alltag wie für besondere Anlässe. Erleben Sie Paul & Shark direkt bei uns im Store in Zürich.',
      },
    ],
  },
  {
    slug: 'woolrich',
    name: 'Woolrich',
    claim: 'Outdoor-Ikone seit 1830',
    metaDescription:
      'Woolrich bei The Sartorialist Zürich: ikonische Outdoor-Bekleidung seit 1830 — vom Arctic Parka bis zum eleganten Wollmantel.',
    origin: 'USA · seit 1830',
    hero: '/images/CFWOOU0792MRUT3496-3989.webp',
    gallery: STORE_GALLERY.slice(0, 6),
    sections: [
      {
        title: 'Traditionelle Outdoor-Mode mit modernem Flair',
        text: 'Woolrich ist eine ikonische Marke, die seit 1830 für hochwertige Outdoor-Bekleidung bekannt ist. Ursprünglich in den USA gegründet, vereint Woolrich traditionelle Handwerkskunst mit innovativen Designs und setzt Massstäbe für funktionale, stilvolle Mode — robust, wetterfest, klassisch.',
      },
      {
        title: 'Zeitlose Qualität und Funktionalität',
        text: 'Von der ikonischen Arctic Parka bis zu eleganten Wollmänteln: Jedes Kleidungsstück wird aus erstklassigen Materialien gefertigt, die Schutz vor den Elementen bieten und höchsten Komfort gewährleisten — in der Stadt wie in der Natur.',
      },
      {
        title: 'Woolrich bei uns im Store',
        text: 'Erleben Sie die exklusive Welt von Woolrich direkt bei uns im Store in Zürich — mit einer sorgfältig ausgewählten Kollektion hochwertiger Outdoor-Bekleidung und Accessoires.',
      },
    ],
  },
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
