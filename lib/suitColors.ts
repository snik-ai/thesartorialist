// Anzug-Farbseiten — Inhalte von der bestehenden Website übernommen.

export type SuitColor = {
  slug: string;
  name: string;
  title: string;
  claim: string;
  metaDescription: string;
  hero: string;
  sections: { title: string; text: string }[];
};

export const SUIT_COLORS: SuitColor[] = [
  {
    slug: 'anzug-blau',
    name: 'Anzug blau',
    title: 'Anzug blau — Massgeschneiderte Eleganz',
    claim: 'Klassische Eleganz neu definiert',
    metaDescription:
      'Blauer Anzug nach Mass in Zürich: von Himmelblau bis Marineblau — massgeschneidert von The Sartorialist. Jetzt Termin buchen.',
    hero: '/images/hermes-rivera-YxbwyTb5ijs-unsplash-scaled.webp',
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
    slug: 'anzug-gruen',
    name: 'Anzug grün',
    title: 'Anzug grün — Massgeschneiderte Eleganz',
    claim: 'Frische Akzente für Ihren Look',
    metaDescription:
      'Grüner Anzug nach Mass in Zürich: von Pastell bis Dunkelgrün — massgeschneidert von The Sartorialist. Jetzt Termin buchen.',
    hero: '/images/grigore-ricky-TVUUz6bMFSQ-unsplash-scaled.webp',
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
    hero: '/images/logan-weaver-lgnwvr-JqRQtSr2MCI-unsplash-scaled.webp',
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
];

export function getSuitColor(slug: string): SuitColor | undefined {
  return SUIT_COLORS.find((s) => s.slug === slug);
}
