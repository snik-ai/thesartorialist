// Brand-Seiten — Inhalte vollumfänglich von der bestehenden Website übernommen.

export type Brand = {
  slug: string;
  name: string;
  claim: string;
  metaDescription: string;
  origin: string;
  hero: string;
  gallery: string[];
  /** Marke im Shopify-Shop: Galerie zeigt dann echte Produktfotos aus dem Shop */
  shopMarke?: string;
  shopSlug?: string;
  /** Breites Stimmungsbild zwischen Einleitung und weiteren Abschnitten */
  banner?: string;
  /** Galerie im Hochformat 2:3 (Ganzkörper-Fotos), sonst 3:4 */
  galerieHoch?: boolean;
  sections: { title: string; text: string }[];
};

export const BRANDS: Brand[] = [
  {
    slug: 'gran-sasso',
    name: 'Gran Sasso',
    claim: 'Italienische Strickkunst',
    metaDescription:
      'Gran Sasso bei The Sartorialist Zürich: luxuriöse Strickmode aus Italien — Kaschmir, Wolle und Baumwolle in zeitlosem Design.',
    origin: 'Abruzzen, Italien · seit den 1950ern',
    hero: '/images/2024069_A20245715220202049L.webp',
    gallery: ['/images/2024069_A20245715220202049L.webp'],
    shopMarke: 'Gran Sasso',
    shopSlug: 'gran-sasso',
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
    slug: 'berwich',
    name: 'Berwich',
    claim: 'Die italienische Hose',
    metaDescription:
      'Berwich bei The Sartorialist Zürich: Hosen aus Apulien, seit 1975 komplett im eigenen Haus gefertigt — italienische Passform, ausgesuchte Stoffe, Made in Italy.',
    origin: 'Martina Franca, Apulien · seit 1975',
    hero: '/images/berwich/berwich-hose-herren-kollektion.webp',
    banner: '/images/berwich/berwich-naehmaschine-manufaktur.webp',
    galerieHoch: true,
    gallery: [
      '/images/berwich/berwich-hose-vulcanolux-braun.webp',
      '/images/berwich/berwich-hose-retrolong-gruen.webp',
      '/images/berwich/berwich-hose-lucano-navy.webp',
      '/images/berwich/berwich-hose-retrolux-greige.webp',
      '/images/berwich/berwich-hose-m5t19-grau.webp',
      '/images/berwich/berwich-hose-vulcanolux-latte.webp',
      '/images/berwich/berwich-hose-chiaia-grau.webp',
      '/images/berwich/berwich-hose-spiaggia-caramel.webp',
      '/images/berwich/berwich-hose-negroni-blau.webp',
    ],
    sections: [
      {
        title: 'Eine Leidenschaft, die in einer kleinen Garage begann',
        text: 'Berwich beginnt 1975 in einer kleinen Garage in Martina Franca, Apulien: Michele und Anna Fumarola beginnen dort, Hosen zu nähen — und führen das Unternehmen bis heute. Während die Modebranche ihre Produktion immer weiter auslagert, bleibt bei Berwich jeder Schritt im eigenen Haus, vom Zuschnitt bis zur letzten Naht. Techniken und Schneidertradition werden vom Vater an den Sohn weitergegeben und verfeinert.',
      },
      {
        title: 'Die Hose in der Hauptrolle',
        text: 'Seit 2007 trägt die eigene Kollektion den Namen Berwich — inspiriert vom Reisen und Entdecken. Im Mittelpunkt steht die Passform: von der Bundfaltenhose mit hoher Taille über die schmale Chino bis zur lässigen Cargo, gefertigt aus ausgesuchten Stoffen. Eine Berwich-Hose sitzt, fällt sauber und macht aus Sakko, Strick oder Hemd einen stimmigen Auftritt.',
      },
      {
        title: 'Berwich bei uns im Store in Zürich',
        text: 'Als Partner von Berwich führen wir die Hosen in unserem Showroom an der Kuttelgasse. Probieren Sie Schnitte und Stoffe direkt an — wir kombinieren sie mit Ihrem Sakko oder Massanzug und beraten Sie zu Bundhöhe, Weite und Länge, bis alles stimmt.',
      },
    ],
  },
  {
    slug: 'gimos',
    name: "Gimo's",
    claim: 'Italienische Lederkunst',
    metaDescription:
      "Gimo's bei The Sartorialist Zürich: Lederjacken, Lammfell und Mäntel aus Padua — Familienmanufaktur seit 1968, traditionelle italienische Verarbeitung.",
    origin: 'San Martino di Lupari, Padua · seit 1968',
    hero: '/images/gimos/gimos-lammfelljacke-herbst-winter-2026.webp',
    banner: '/images/gimos/gimos-herbst-winter-2026-paar.webp',
    gallery: [
      '/images/gimos/gimos-lammfell-kurzmantel.webp',
      '/images/gimos/gimos-bomber-wolle-stone.webp',
      '/images/gimos/gimos-flanell-mantel-kapuze.webp',
      '/images/gimos/gimos-wildleder-hemdjacke.webp',
      '/images/gimos/gimos-gms75-lammfell.webp',
      '/images/gimos/gimos-blouson-flanell-kaschmir.webp',
      '/images/gimos/gimos-fruehling-sommer-2026.webp',
      '/images/gimos/gimos-bomber-wolle-kragen.webp',
      '/images/gimos/gimos-manufaktur-padua.webp',
    ],
    sections: [
      {
        title: 'Eine Familienwerkstatt für Leder',
        text: "Gimo's beginnt 1968 als kleine Familienwerkstatt in der Nähe von Padua, spezialisiert auf Lederbekleidung für Damen und Herren. Ab 1975 baut Gründer Renzo Girardin das Unternehmen zu seiner heutigen Grösse aus. Von Anfang an setzt Gimo's auf erstklassige Materialien und sorgfältige Verarbeitung — und bleibt den traditionellen italienischen Methoden der Lederverarbeitung treu, offen für neue Impulse aus der Mode.",
      },
      {
        title: 'Klassischer Schnitt, zeitgemässer Auftritt',
        text: "Die Kollektion reicht von der Wildleder-Hemdjacke über den Lammfell-Kurzmantel bis zum Blouson aus Flanell mit Kaschmir und Seide. Klassische Schnitte erhalten einen zeitgemässen Touch, jedes Detail ist durchdacht, die Materialien sind nie beliebig. Dazu kommen Mäntel und Jacken aus Stoff, die Stil und Schutz vor der Kälte vereinen — mit klaren Linien in Form und Volumen.",
      },
      {
        title: "Gimo's bei uns im Store in Zürich",
        text: "Wir führen ausgewählte Stücke von Gimo's in unserem Showroom an der Kuttelgasse. Spüren Sie die Qualität des Leders selbst — wir beraten Sie, welche Jacke oder welcher Mantel zu Ihrem Anzug, Ihrer Garderobe und Ihrem Alltag passt.",
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
    gallery: ['/images/CFWOOU0792MRUT3496-3989.webp'],
    shopMarke: 'Woolrich',
    shopSlug: 'woolrich',
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
    gallery: [
      '/images/loro-piana-stoffe.webp',
      '/images/massanzug-loro-piana.webp',
      '/images/italienischer-massanzug.webp',
      '/images/massanzug.webp',
      '/images/navy-blauer-anzug.webp',
      '/images/modern-classic-anzug.webp',
    ],
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
];

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
