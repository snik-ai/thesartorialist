// Anzug-Farbseiten. Blau/Grün/Beige-Texte von der bestehenden Website übernommen; Bilder und Varianten
// aus dem Holland & Sherry Look Book Herbst/Winter 2026 (Stobo Castle), seit 12.11.2026.

/** Ein Teil eines Looks (Anzug, Sakko, Hose, Mantel, Weste) mit Stoff aus der H&S-Kollektion */
export type LookTeil = {
  /** z. B. «Zweiteiler in Mittelbraun mit Kreidestreifen» */
  art: string;
  /** Kollektion bei Holland & Sherry (Eigenname, wird nicht übersetzt) */
  kollektion: string;
  /** Artikelnummer bei Holland & Sherry */
  artikel: string;
  /** Material, z. B. «100 % Schurwolle Super 120's» */
  material: string;
  /** Stoffmuster-Foto */
  stoff: string;
};

export type Variante = {
  /** Look-Nummer im Look Book */
  look: number;
  titel: string;
  /** Erstes Bild = gross, weitere = Detailbilder */
  bilder: string[];
  teile: LookTeil[];
};

export type SuitColor = {
  slug: string;
  name: string;
  title: string;
  claim: string;
  metaDescription: string;
  hero: string;
  sections: { title: string; text: string }[];
  varianten?: Variante[];
};

const B = '/images/anzugfarben/';
const HS = 'Holland & Sherry';

const V_DINNER_BLAU: Variante = {
  look: 10,
  titel: 'Dinner Jacket in Royalblau mit Jacquard',
  bilder: [B + 'blau-dinnerjacket-treppe.webp', B + 'blau-dinnerjacket-detail.webp', B + 'blau-dinnerjacket-schloss.webp'],
  teile: [
    { art: 'Dinner Jacket, Royalblau mit Gepard-Jacquard', kollektion: 'Masquerade', artikel: '9725057', material: '100 % Seide', stoff: B + 'stoff-blau-jacquard.webp' },
    { art: 'Hose aus schwarzer Bengaline', kollektion: 'Black Tie', artikel: '9722023', material: '100 % Schurwolle', stoff: B + 'stoff-schwarz-bengaline-hose.webp' },
  ],
};
const V_MANTEL_NAVY: Variante = {
  look: 3,
  titel: 'Mantel in Navy mit Fischgrat',
  bilder: [B + 'navy-fischgrat-mantel-rot.webp', B + 'navy-fischgrat-mantel-detail.webp'],
  teile: [
    { art: 'Mantel in Navy mit Fischgrat', kollektion: 'Overcoats & Topcoats', artikel: '9826024', material: '100 % Schurwolle', stoff: B + 'stoff-navy-fischgrat-mantel.webp' },
    { art: 'Zweiteiler in Mittelrot mit Fischgrat', kollektion: 'Target', artikel: '7426059', material: "100 % Schurwolle Super 120's", stoff: B + 'stoff-rot-fischgrat.webp' },
  ],
};
const V_GRUEN_KARO: Variante = {
  look: 2,
  titel: 'Zweiteiler in Forest Green mit Split-Matt-Karo',
  bilder: [B + 'gruen-karo-anzug-forest.webp', B + 'gruen-karo-anzug-detail.webp', B + 'gruen-karo-anzug-schloss.webp'],
  teile: [
    { art: 'Zweiteiler in Forest Green mit Split-Matt-Karo', kollektion: 'Target', artikel: '7426000', material: "100 % Schurwolle Super 120's", stoff: B + 'stoff-gruen-split-matt-karo.webp' },
  ],
};
const V_BEIGE_HAHNENTRITT: Variante = {
  look: 6,
  titel: 'Sakko mit hellem Hahnentritt, Hose in Weiss',
  bilder: [B + 'beige-hahnentritt-sakko.webp', B + 'beige-hahnentritt-detail.webp', B + 'beige-hahnentritt-wasser.webp'],
  teile: [
    { art: 'Sakko mit hellem Hahnentritt in Tan', kollektion: 'Nàdarra', artikel: '8526001', material: '100 % naturbelassene Shetland-Wolle', stoff: B + 'stoff-hahnentritt-hell.webp' },
    { art: 'Hose in Weiss, uni', kollektion: 'Classic Woollen Flannel', artikel: '7718300', material: '100 % Schurwolle', stoff: B + 'stoff-weiss-flanell.webp' },
  ],
};
const V_BRAUN_KREIDE: Variante = {
  look: 1,
  titel: 'Zweiteiler in Mittelbraun mit Kreidestreifen',
  bilder: [B + 'braun-kreidestreifen-anzug-schloss.webp', B + 'braun-kreidestreifen-detail.webp', B + 'braun-kreidestreifen-mantel-tan.webp', B + 'braun-kreidestreifen-mantel-detail.webp'],
  teile: [
    { art: 'Zweiteiler in Mittelbraun mit Kreidestreifen', kollektion: 'Target', artikel: '7426024', material: "100 % Schurwolle Super 120's", stoff: B + 'stoff-braun-kreidestreifen.webp' },
    { art: 'Mantel in Tan mit Fischgrat', kollektion: 'Sherry Tweed', artikel: '8825101', material: '100 % Schurwolle', stoff: B + 'stoff-tan-fischgrat-mantel.webp' },
  ],
};
const V_BRAUN_GLENCHECK: Variante = {
  look: 7,
  titel: 'Sakko mit Glencheck in Mittelbraun',
  bilder: [B + 'braun-glencheck-sakko.webp', B + 'braun-glencheck-detail.webp', B + 'braun-glencheck-wiese.webp'],
  teile: [
    { art: 'Sakko mit Glencheck in Mittelbraun', kollektion: 'Nàdarra', artikel: '8526005', material: '100 % naturbelassene Shetland-Wolle', stoff: B + 'stoff-braun-glencheck.webp' },
    { art: 'Hose in Mittelbraun, uni', kollektion: 'Classic Worsted Flannel', artikel: '7523400', material: "100 % Schurwolle Super 140's", stoff: B + 'stoff-braun-flanell.webp' },
  ],
};
const V_CORD_HONIG: Variante = {
  look: 8,
  titel: 'Cord-Zweiteiler in Honig',
  bilder: [B + 'cord-honig-anzug.webp', B + 'cord-honig-detail.webp', B + 'cord-honig-anzug-holz.webp', B + 'cord-honig-ganz.webp'],
  teile: [
    { art: 'Zweiteiler aus 14-Wale-Cord in Honig', kollektion: 'Corduroys & Moleskin', artikel: '1824314', material: '98 % Baumwolle, 2 % Elastan', stoff: B + 'stoff-cord-honig.webp' },
    { art: 'Mantel in Ocker mit Fischgrat', kollektion: 'Harris Tweed', artikel: '8924014', material: '100 % Schurwolle', stoff: B + 'stoff-ocker-fischgrat.webp' },
  ],
};
const V_ROT_FISCHGRAT: Variante = {
  look: 3,
  titel: 'Zweiteiler in Mittelrot mit Fischgrat',
  bilder: [B + 'rot-fischgrat-anzug-schloss.webp', B + 'rot-fischgrat-anzug.webp', B + 'navy-fischgrat-mantel-rot.webp'],
  teile: [
    { art: 'Zweiteiler in Mittelrot mit Fischgrat', kollektion: 'Target', artikel: '7426059', material: "100 % Schurwolle Super 120's", stoff: B + 'stoff-rot-fischgrat.webp' },
    { art: 'Mantel in Navy mit Fischgrat', kollektion: 'Overcoats & Topcoats', artikel: '9826024', material: '100 % Schurwolle', stoff: B + 'stoff-navy-fischgrat-mantel.webp' },
  ],
};
const V_ROT_GUNCLUB: Variante = {
  look: 5,
  titel: 'Sakko mit Gun-Club-Karo, Hose in Merlot',
  bilder: [B + 'gunclub-sakko-merlot-hose.webp', B + 'gunclub-sakko-detail.webp', B + 'gunclub-sakko-nah.webp'],
  teile: [
    { art: 'Sakko mit Gun-Club-Karo in Tan und Fensterkaro in Burgund', kollektion: 'Estate Tweed', artikel: '8226020', material: '100 % Schurwolle mit natürlichem Stretch', stoff: B + 'stoff-gunclub-fenster.webp' },
    { art: 'Hose in Merlot, uni', kollektion: 'Bespoke #31 Gaberdines', artikel: '6126513', material: '100 % Schurwolle', stoff: B + 'stoff-merlot.webp' },
  ],
};
const V_GRAU_KARO: Variante = {
  look: 4,
  titel: 'Sakko mit Karo in Grau und Rosa, Hose in Mittelgrau',
  bilder: [B + 'grau-karo-sakko-schloss.webp', B + 'grau-karo-sakko-detail.webp', B + 'grau-karo-sakko-treppe.webp'],
  teile: [
    { art: 'Sakko mit Karo in Grau und Rosa und Bouclé-Überkaro', kollektion: 'Four Seasons', artikel: '9026030', material: '93 % Schurwolle, 7 % Seide', stoff: B + 'stoff-grau-rosa-karo.webp' },
    { art: 'Hose in Mittelgrau, uni', kollektion: 'Four Seasons', artikel: '9026117', material: "100 % Schurwolle Super 130's", stoff: B + 'stoff-mittelgrau.webp' },
  ],
};
const V_SCHWARZ_SMOKING: Variante = {
  look: 9,
  titel: 'Smoking aus schwarzer Bengaline mit Jacquard-Weste',
  bilder: [B + 'schwarz-smoking-jaguar.webp', B + 'schwarz-smoking-detail.webp', B + 'schwarz-smoking-auto.webp'],
  teile: [
    { art: 'Smoking aus schwarzer Bengaline', kollektion: 'Black Tie', artikel: '9722023', material: '100 % Schurwolle', stoff: B + 'stoff-schwarz-bengaline.webp' },
    { art: 'Weste mit schwarzem Blumen-Jacquard', kollektion: 'Masquerade', artikel: '9725017', material: '45 % Acryl, 25 % Schurwolle, 30 % Viskose', stoff: B + 'stoff-schwarz-jacquard-weste.webp' },
  ],
};

export const SUIT_COLORS: SuitColor[] = [
  {
    slug: 'anzug-blau',
    name: 'Anzug blau',
    title: 'Anzug blau — Massgeschneiderte Eleganz',
    claim: 'Klassische Eleganz neu definiert',
    metaDescription:
      'Blauer Anzug nach Mass in Zürich: von Himmelblau bis Marineblau — massgeschneidert von The Sartorialist. Jetzt Termin buchen.',
    hero: B + 'blau-dinnerjacket-detail.webp',
    varianten: [V_DINNER_BLAU, V_MANTEL_NAVY],
    sections: [
      {
        title: 'Klassische Eleganz neu definiert',
        text: 'Der blaue Anzug gehört zu den zeitlosen Klassikern der Herrenmode und bietet eine elegante Alternative zu Schwarz und Grau. In verschiedenen Nuancen — von hellem Himmelblau bis zu tiefem Marineblau — passt der blaue Anzug zu nahezu jedem Anlass, sei es im beruflichen Umfeld oder bei gesellschaftlichen Events. Er kombiniert klassische Eleganz mit einem modernen Touch.',
      },
      {
        title: 'Vorteile eines blauen Anzugs',
        text: 'Ein blauer Anzug ist vielseitig kombinierbar und verleiht Ihnen einen souveränen, gepflegten Look. Blau wirkt beruhigend und professionell und bringt gleichzeitig Frische und Dynamik in Ihre Garderobe. Ideal für das Büro, Geschäftstreffen oder besondere Anlässe — kombinierbar mit klassischen wie mit trendigen Accessoires.',
      },
      {
        title: 'Massgeschneiderte Exzellenz',
        text: 'Bei uns lassen Sie Ihren blauen Anzug individuell anfertigen — perfekt sitzend und auf Ihren persönlichen Stil abgestimmt. Unser erfahrenes Team hilft Ihnen bei der Auswahl des idealen Blautons, des passenden Stoffes und der perfekten Schnittführung.',
      },
      {
        title: 'Materialien und Oberflächen',
        text: 'Wir verwenden hochwertige Stoffe, die für Langlebigkeit und Tragekomfort bekannt sind: von luxuriöser Wolle über feines Leinen bis zu edlem Kaschmir. Die Wahl des Materials beeinflusst nicht nur das Aussehen, sondern auch den Komfort Ihres Anzugs.',
      },
      {
        title: 'Individuelle Gestaltung',
        text: 'Gestalten Sie Ihren blauen Anzug ganz nach Ihren Vorstellungen: Stoffe, Schnitte und Details nach Wahl — ein Unikat, das Ihre Persönlichkeit unterstreicht.',
      },
    ],
  },
  {
    slug: 'anzug-grau',
    name: 'Anzug grau',
    title: 'Grauer Anzug nach Mass in Zürich',
    claim: 'Die vielseitigste Farbe im Kleiderschrank',
    metaDescription:
      'Grauer Anzug nach Mass in Zürich: von Hellgrau bis Anthrazit, uni oder mit Karo — Stoffe von Holland & Sherry, massgeschneidert von The Sartorialist.',
    hero: B + 'grau-karo-sakko-detail.webp',
    varianten: [V_GRAU_KARO],
    sections: [
      {
        title: 'Die vielseitigste Farbe im Kleiderschrank',
        text: 'Grau ist die Farbe, die immer passt. Ein grauer Anzug wirkt seriös, ohne streng zu sein, und lässt sich mit fast jeder Hemd- und Krawattenfarbe kombinieren. Von hellem Perlgrau über Mittelgrau bis zu tiefem Anthrazit deckt Grau das Büro, das Geschäftsessen und die Hochzeit am Nachmittag ab.',
      },
      {
        title: 'Uni, Flanell oder Karo',
        text: 'Ein uni Mittelgrau ist der Grundstein jeder Garderobe. Grauer Flanell bringt Wärme und Tiefe für Herbst und Winter. Wer Charakter zeigen will, wählt ein Karo: Im Holland-&-Sherry-Look-Book trägt das Sakko ein Grau mit rosafarbenem Karo und Bouclé-Überkaro, kombiniert mit einer Hose in Mittelgrau.',
      },
      {
        title: 'Massgeschneidert in Zürich',
        text: 'Wir fertigen Ihren grauen Anzug nach Ihren Massen und Ihrem Stil. Im Showroom an der Kuttelgasse zeigen wir Ihnen die Grautöne im Tageslicht und beraten Sie, welcher Ton zu Ihrem Teint und Ihrem Anlass passt.',
      },
      {
        title: 'Stoffe und Gewichte',
        text: 'Von leichter Super-130\'s-Schurwolle für das ganze Jahr bis zu kräftigem Flanell für den Winter: Die Wahl des Stoffs bestimmt Fall, Glanz und Tragekomfort. Die Four-Seasons-Kollektion von Holland & Sherry ist für Anzüge gemacht, die man von Frühling bis Winter trägt.',
      },
      {
        title: 'Kombinieren mit Grau',
        text: 'Weisse und hellblaue Hemden wirken klassisch, Rosa und Bordeaux setzen warme Akzente. Schwarze oder dunkelbraune Schuhe passen gleichermassen. Das Sakko lässt sich auch einzeln zu Chino oder Flanellhose tragen.',
      },
    ],
  },
  {
    slug: 'anzug-schwarz',
    name: 'Anzug schwarz',
    title: 'Schwarzer Anzug und Smoking nach Mass in Zürich',
    claim: 'Für die grossen Abende',
    metaDescription:
      'Schwarzer Anzug und Smoking nach Mass in Zürich: Bengaline, Jacquard-Weste und Black Tie von Holland & Sherry — massgeschneidert von The Sartorialist.',
    hero: B + 'schwarz-smoking-detail.webp',
    varianten: [V_SCHWARZ_SMOKING],
    sections: [
      {
        title: 'Für die grossen Abende',
        text: 'Schwarz ist die Farbe des Abends. Ein schwarzer Anzug oder Smoking gehört zu Galas, Opernabenden, Black-Tie-Hochzeiten und festlichen Empfängen. Massgeschneidert sitzt er so, dass er nicht streng, sondern souverän wirkt.',
      },
      {
        title: 'Anzug oder Smoking?',
        text: 'Der Smoking unterscheidet sich vom schwarzen Anzug durch Details: seidenbelegtes Revers, Galonstreifen an der Hose, meist ein einziger Knopf und eine Fliege statt Krawatte. Der schwarze Anzug ist schlichter und lässt sich auch tagsüber tragen. Wir beraten Sie, was zu Ihrem Anlass und dem Dresscode passt.',
      },
      {
        title: 'Black Tie mit Charakter',
        text: 'Im Holland-&-Sherry-Look-Book wird der Smoking aus schwarzer Bengaline mit einer Weste aus schwarzem Blumen-Jacquard kombiniert. Das ist klassisch in der Farbe und eigenständig im Detail. Für einen modernen Auftritt passt auch ein Dinner Jacket in Royalblau zur schwarzen Hose.',
      },
      {
        title: 'Massgeschneidert in Zürich',
        text: 'Revers, Knöpfe, Futter, Galon und Weste wählen Sie bei uns frei. Wir nehmen Mass, fertigen und passen an, bis der Smoking oder Anzug perfekt sitzt, rechtzeitig für Ihren Anlass.',
      },
      {
        title: 'Stoffe für den Abend',
        text: 'Bengaline, Barathea und feine Schurwolle geben Schwarz die nötige Tiefe. Die Black-Tie- und Masquerade-Kollektionen von Holland & Sherry bieten dazu Jacquards, Samt und Seide für Westen und Dinner Jackets.',
      },
    ],
  },
  {
    slug: 'anzug-braun',
    name: 'Anzug braun',
    title: 'Brauner Anzug nach Mass in Zürich',
    claim: 'Warm, stilsicher und zeitlos',
    metaDescription:
      'Brauner Anzug nach Mass in Zürich: Kreidestreifen, Glencheck oder Cord in Honig — Stoffe von Holland & Sherry, massgeschneidert von The Sartorialist.',
    hero: B + 'braun-kreidestreifen-anzug-schloss.webp',
    varianten: [V_BRAUN_KREIDE, V_BRAUN_GLENCHECK, V_CORD_HONIG],
    sections: [
      {
        title: 'Warm, stilsicher und zeitlos',
        text: 'Braun ist zurück, und zwar mit Stil. Ein brauner Anzug wirkt warm, nahbar und selbstbewusst. Er ist die elegante Alternative zu Blau und Grau und passt ins Büro genauso wie zur Hochzeit im Herbst oder zum Wochenende auf dem Land.',
      },
      {
        title: 'Drei Varianten aus dem Look Book',
        text: 'Holland & Sherry zeigt Braun in der Herbst/Winter-Kollektion 2026 in drei Varianten: als Zweiteiler in Mittelbraun mit Kreidestreifen, als Sakko mit Glencheck zur Flanellhose und als Cord-Anzug in Honig mit einem Mantel in Ocker.',
      },
      {
        title: 'Massgeschneidert in Zürich',
        text: 'Wir fertigen Ihren braunen Anzug nach Ihren Massen. Im Showroom an der Kuttelgasse finden wir gemeinsam den Ton, der zu Ihrem Teint passt, von Tabak über Schokolade bis Honig.',
      },
      {
        title: 'Stoffe und Strukturen',
        text: 'Braun lebt von Struktur: Kreidestreifen auf Super-120\'s-Schurwolle, Glencheck aus Shetland-Wolle oder 14-Wale-Cord aus Baumwolle. Jeder Stoff verändert den Charakter des Anzugs, vom Business-Look bis zum entspannten Landhausstil.',
      },
      {
        title: 'Kombinieren mit Braun',
        text: 'Hellblaue und cremefarbene Hemden, Krawatten in Bordeaux, Grün oder Paisley und Schuhe in Dunkelbraun oder Wildleder passen zum braunen Anzug. Ein Mantel in Tan oder Ocker rundet den Look ab.',
      },
    ],
  },
  {
    slug: 'anzug-gruen',
    name: 'Anzug grün',
    title: 'Anzug grün — Massgeschneiderte Eleganz',
    claim: 'Frische Akzente für Ihren Look',
    metaDescription:
      'Grüner Anzug nach Mass in Zürich: von Pastell bis Dunkelgrün — massgeschneidert von The Sartorialist. Jetzt Termin buchen.',
    hero: B + 'gruen-karo-anzug-forest.webp',
    varianten: [V_GRUEN_KARO],
    sections: [
      {
        title: 'Frische Akzente für Ihren Look',
        text: 'Der grüne Anzug ist eine trendige Wahl für alle, die ihren Look mit einem Hauch von Farbe aufwerten möchten. Grüntöne reichen von sanften Pastellnuancen bis zu kräftigen, tiefen Tönen und bieten eine moderne Alternative zu klassischen Farben. Ein grüner Anzug setzt frische Akzente und sorgt für einen markanten Auftritt.',
      },
      {
        title: 'Vorteile eines grünen Anzugs',
        text: 'Ein grüner Anzug bringt Farbe in Ihre Garderobe und hebt sich durch seinen einzigartigen Charakter hervor. Er ist vielseitig kombinierbar — elegant mit neutralen Farben oder modisch mit kräftigen Akzenten. Besonders im Frühling und Sommer sorgt er für einen lebhaften, dynamischen Look.',
      },
      {
        title: 'Massgeschneiderte Exklusivität',
        text: 'Wir fertigen Ihren grünen Anzug individuell nach Ihren Vorstellungen und Massen. Unser Team berät Sie bei der Auswahl des perfekten Grüntons, des geeigneten Materials und der passenden Schnittelemente.',
      },
      {
        title: 'Materialien und Oberflächen',
        text: 'Feine Wolle, edles Leinen oder luxuriöses Kaschmir: Die Wahl des Materials beeinflusst Tragekomfort und Langlebigkeit. Wir achten auf Details, die den einzigartigen Charakter Ihres grünen Anzugs unterstreichen.',
      },
      {
        title: 'Individuelle Gestaltung',
        text: 'Ein grüner Anzug von uns ist mehr als ein Kleidungsstück — er ist Ausdruck Ihrer Persönlichkeit. Wählen Sie aus verschiedenen Stoffen, Schnitten und Details.',
      },
    ],
  },
  {
    slug: 'anzug-beige',
    name: 'Anzug beige',
    title: 'Anzug beige — Massgeschneiderte Eleganz',
    claim: 'Zeitlose Raffinesse in Beige',
    metaDescription:
      'Beiger Anzug nach Mass in Zürich: leicht, hell, elegant — ideal für Sommer und Hochzeit. Massgeschneidert von The Sartorialist.',
    hero: B + 'beige-hahnentritt-sakko.webp',
    varianten: [V_BEIGE_HAHNENTRITT],
    sections: [
      {
        title: 'Zeitlose Raffinesse in Beige',
        text: 'Der beige Anzug ist ein Klassiker, der durch Vielseitigkeit und Eleganz besticht. Er vereint zeitlose Raffinesse mit einem neutralen Ton, der für formelle wie informelle Anlässe geeignet ist — ideal für Frühling und Sommer, da er leicht und hell wirkt.',
      },
      {
        title: 'Vorteile eines beigen Anzugs',
        text: 'Ein beiger Anzug lässt sich mühelos mit verschiedenen Farben und Mustern kombinieren. Ob Hochzeit, geschäftliches Event oder entspanntes Treffen — er verleiht Ihnen stets einen stilvollen, gepflegten Look. Die helle Farbe reflektiert das Sonnenlicht und trägt sich besonders angenehm.',
      },
      {
        title: 'Massgeschneiderte Perfektion',
        text: 'Bei uns gestalten Sie Ihren beigen Anzug ganz nach Ihren Wünschen: individuell auf Ihre Masse und Ihren Stil abgestimmt, mit Beratung zu Stoff, Passform und Details.',
      },
      {
        title: 'Materialien und Oberflächen',
        text: 'Nur hochwertige Stoffe, die Komfort und Langlebigkeit garantieren — von feiner Wolle über edles Leinen bis zu luxuriösem Kaschmir. Jedes Detail stimmt, damit Sie sich rundum wohlfühlen.',
      },
      {
        title: 'Individuelle Gestaltung',
        text: 'Wählen Sie Stoff, Schnitt und besondere Details wie Knöpfe und Futter — so entsteht ein Anzug, der perfekt passt und Ihre persönliche Note widerspiegelt.',
      },
    ],
  },
  {
    slug: 'anzug-rot',
    name: 'Anzug rot',
    title: 'Roter Anzug nach Mass in Zürich',
    claim: 'Bordeaux, Merlot und Burgund',
    metaDescription:
      'Roter Anzug nach Mass in Zürich: Bordeaux mit Fischgrat oder Sakko mit Hose in Merlot — Stoffe von Holland & Sherry, massgeschneidert von The Sartorialist.',
    hero: B + 'rot-fischgrat-anzug-schloss.webp',
    varianten: [V_ROT_FISCHGRAT, V_ROT_GUNCLUB],
    sections: [
      {
        title: 'Bordeaux, Merlot und Burgund',
        text: 'Ein roter Anzug ist ein Statement, aber in den richtigen Tönen ist er erstaunlich elegant. Gedeckte Rottöne wie Bordeaux, Merlot und Burgund wirken tief und edel statt laut. Sie passen zu Abendanlässen, Hochzeiten und überall dort, wo Sie auffallen möchten, ohne zu übertreiben.',
      },
      {
        title: 'Zwei Varianten aus dem Look Book',
        text: 'Holland & Sherry zeigt Rot in der Herbst/Winter-Kollektion 2026 als Zweiteiler in Mittelrot mit Fischgrat, getragen unter einem Mantel in Navy, und als Hose in Merlot zum Sakko mit Gun-Club-Karo in Tan.',
      },
      {
        title: 'Massgeschneidert in Zürich',
        text: 'Wir fertigen Ihren roten Anzug oder Ihre Kombination nach Ihren Massen. Gemeinsam wählen wir den Rotton, der zu Ihnen passt, und die Details, die ihn ruhig oder markant wirken lassen.',
      },
      {
        title: 'Stoffe für Rot',
        text: 'Fischgrat auf feiner Schurwolle gibt Rot Tiefe und Struktur, Gabardine lässt Merlot satt und ruhig wirken. Auch Samt und Flanell eignen sich für Rottöne im Herbst und Winter.',
      },
      {
        title: 'Kombinieren mit Rot',
        text: 'Weisse und hellrosa Hemden, dunkle Krawatten und schwarze oder dunkelbraune Schuhe halten den Look elegant. Ein Mantel in Navy oder Anthrazit ist der ruhige Gegenpol.',
      },
    ],
  },
];

export function getSuitColor(slug: string): SuitColor | undefined {
  return SUIT_COLORS.find((s) => s.slug === slug);
}
