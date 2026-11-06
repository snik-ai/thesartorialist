import type { Woerterbuch } from '../de';

// Boutique (interface uniquement — les textes produits viennent de Shopify et restent en allemand)
export const shop: Woerterbuch['shop'] = {
  start: {
    meta: {
      titel: 'Boutique — Woolrich, Gran Sasso & Tramarossa en ligne',
      beschreibung:
        'La boutique en ligne de The Sartorialist Zurich : {n} pièces choisies avec soin — parkas Woolrich, maille Gran Sasso, vestes Tramarossa. Livraison dans toute la Suisse ou essayage dans notre showroom.',
      ogTitel: 'La garde-robe — boutique The Sartorialist Zurich',
      ogBeschreibung: 'Commandez Woolrich, Gran Sasso et Tramarossa en ligne — ou essayez-les dans notre showroom de la Kuttelgasse 7.',
      ogAlt: 'Boutique The Sartorialist Zurich',
    },
    sortimentEyebrow: 'L’assortiment',
    alleStuecke: 'Toutes les pièces',
    direktZu: 'Accès direct',
    direktZuAria: 'Boutique par marque et par catégorie',
    mass: {
      eyebrow: 'Le costume sur mesure',
      titel: 'Ce que vous ne trouvez pas ici, nous le confectionnons sur mesure.',
      text: 'Notre cœur de métier est le costume sur mesure : entoilage complet, 100 % fabriqué en Italie, à partir de CHF 1’690 et prêt en 20 jours ouvrables. Les pièces de la boutique en sont les compagnes.',
      knopf: 'Découvrir le sur-mesure',
      termin: 'Prendre rendez-vous',
    },
    faqTitel: 'Questions sur la boutique',
    faq: [
      {
        q: 'Où la boutique The Sartorialist livre-t-elle ?',
        a: ['Nous livrons dans toute la Suisse. Les frais et délais de livraison vous sont indiqués lors du passage en caisse, avant que vous ne passiez commande.'],
      },
      {
        q: 'Puis-je essayer les pièces avant de les acheter ?',
        a: [
          'Oui. Chaque pièce de la boutique est également disponible dans notre showroom, {strasse}, à Zurich. Prenez rendez-vous et nous préparerons votre taille.',
        ],
      },
      {
        q: 'Comment payer dans la boutique ?',
        a: ['Le paiement s’effectue via le processus de paiement sécurisé de Shopify. Les moyens de paiement disponibles y sont indiqués à la dernière étape.'],
      },
      {
        q: 'Les costumes sur mesure sont-ils disponibles dans la boutique ?',
        a: [
          'Non. Un costume sur mesure est coupé à vos mesures et commence donc par un rendez-vous dans notre showroom : à partir de CHF 1’690, entoilage complet, 100 % fabriqué en Italie, prêt en 20 jours ouvrables. Dans la boutique, vous trouverez les pièces qui l’accompagnent — maille, parkas, manteaux et vestes.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Zurich',
    eyebrow: 'Boutique · {gruppe}',
    mehrUeber: 'En savoir plus sur {label}',
    weitereAria: 'Autres rubriques de la boutique',
    alleStuecke: 'Toutes les pièces',
    ctaTitel: 'Vous préférez essayer ?',
    ctaText: 'Chaque pièce de la boutique est également disponible dans notre showroom de la Kuttelgasse 7 — tout comme nos costumes sur mesure à partir de CHF 1’690.',
  },
  gruppen: { Marke: 'Marque', Für: 'Pour', Kategorie: 'Catégorie' },
  seiten: {
    woolrich: {
      h1: 'Acheter parkas & vestes Woolrich en ligne',
      title: 'Acheter parkas & vestes Woolrich — boutique Zurich',
      description:
        'Woolrich chez The Sartorialist Zurich : Arctic Parka, Cloud Parka, Wool Shirt Jackets et manteaux pour hommes et femmes. Commandez en ligne ou essayez-les dans notre showroom.',
      intro:
        'Depuis 1830, Woolrich est synonyme de vêtements d’extérieur conçus pour les vrais hivers. Vous trouverez ici les icônes de la marque — de l’Arctic Parka garnie de duvet à la Wool Shirt Jacket en laine Melton — pour hommes et femmes. Commandez en ligne ou essayez votre taille dans notre showroom de la Kuttelgasse 7.',
    },
    'gran-sasso': {
      h1: 'Acheter la maille Gran Sasso en ligne',
      title: 'Acheter pulls & cachemire Gran Sasso — boutique Zurich',
      description:
        'Gran Sasso chez The Sartorialist Zurich : pulls en mérinos, maille en cachemire, camionneurs et cardigans des Abruzzes. Commandez en ligne ou essayez-les dans notre showroom.',
      intro:
        'Gran Sasso tricote dans les Abruzzes depuis 1952 — mérinos, cachemire et soie, fabriqués dans sa propre manufacture de Sant’Egidio alla Vibrata. Les pulls, camionneurs et cardigans se portent aussi bien sous une veste qu’avec un jean, et complètent idéalement votre costume sur mesure.',
    },
    tramarossa: {
      h1: 'Acheter vestes & chinos Tramarossa en ligne',
      title: 'Acheter vestes & chinos Tramarossa — boutique Zurich',
      description:
        'Tramarossa chez The Sartorialist Zurich : vestes décontractées et chinos en gabardine italienne. Commandez en ligne ou essayez-les dans notre showroom.',
      intro:
        'Tramarossa, maison de Vénétie, allie la confection italienne à une attitude décontractée : vestes déstructurées et chinos en gabardine souple, aussi à l’aise au quotidien qu’au bureau. Tout se combine — veste et chino de la même couleur forment un costume décontracté.',
    },
    herren: {
      label: 'Hommes',
      h1: 'Acheter la mode masculine en ligne',
      title: 'Mode masculine en ligne — parkas, maille & vestes',
      description:
        'Mode masculine italienne dans la boutique de The Sartorialist Zurich : parkas Woolrich, maille Gran Sasso et vestes Tramarossa. Livraison dans toute la Suisse.',
      intro:
        'Une mode masculine choisie avec soin pour accompagner le costume sur mesure : parkas et manteaux pour l’hiver, maille en mérinos et cachemire, vestes décontractées et chinos. Tout ce que nous proposons dans notre showroom de la Kuttelgasse peut être commandé ici directement — avec livraison dans toute la Suisse.',
    },
    damen: {
      label: 'Femmes',
      h1: 'Acheter parkas & manteaux pour femmes en ligne',
      title: 'Parkas & manteaux pour femmes — boutique Zurich',
      description:
        'Parkas et manteaux pour femmes de Woolrich chez The Sartorialist Zurich : Arctic Parka, Kelly Parka et Madison Coat. Commandez en ligne, livraison dans toute la Suisse.',
      intro:
        'Pour les femmes, nous proposons les vestes d’hiver de Woolrich : l’Arctic Parka classique, la longue Kelly Parka et le Madison Coat — chauds, déperlants et d’une coupe intemporelle. Nous vous présentons aussi volontiers les modèles dans notre showroom à Zurich.',
    },
    parkas: {
      label: 'Parkas',
      h1: 'Acheter une parka en ligne',
      title: 'Acheter une parka — Woolrich Arctic & Cloud Parka',
      description:
        'Parkas pour hommes et femmes chez The Sartorialist Zurich : Woolrich Arctic Parka, Cloud Parka, Polar et Ramar. Garnies de duvet et déperlantes.',
      intro:
        'Une bonne parka résiste à l’hiver suisse et s’accorde aussi bien à un costume qu’à un jean. Nos parkas Woolrich sont garnies de duvet, déperlantes et dotées d’une capuche amovible — de la courte Cloud Parka à la longue Arctic Parka.',
    },
    maentel: {
      label: 'Manteaux',
      h1: 'Acheter un manteau en ligne',
      title: 'Acheter un manteau — manteaux en laine pour hommes et femmes',
      description:
        'Manteaux chez The Sartorialist Zurich : manteaux en laine et pardessus de Woolrich pour hommes et femmes — élégants sur un costume, chauds en hiver.',
      intro:
        'Le manteau est la première chose que l’on voit, par-dessus votre costume. Nos manteaux en laine et en tissus techniques sont assez longs pour couvrir la veste et assez sobres pour toutes les occasions.',
    },
    strick: {
      label: 'Maille',
      h1: 'Acheter pulls & maille en ligne',
      title: 'Acheter pulls & cachemire — la maille italienne',
      description:
        'Pulls, camionneurs et cardigans en mérinos et cachemire chez The Sartorialist Zurich — fabriqués par Gran Sasso en Italie.',
      intro:
        'Une maille italienne qui n’épaissit jamais la silhouette sous une veste : cols roulés en mérinos fin, camionneurs, pulls en cachemire et cardigans. Les qualités légères se portent toute l’année ; les plus épaisses remplacent la veste en automne.',
    },
    jacken: {
      label: 'Vestes & surchemises',
      h1: 'Acheter vestes & surchemises en ligne',
      title: 'Acheter vestes & surchemises — Woolrich Wool Shirt Jacket',
      description:
        'Vestes et surchemises chez The Sartorialist Zurich : Woolrich Wool Shirt Jackets, surchemises techniques et vestes courtes pour hommes et femmes.',
      intro:
        'Entre la chemise et le manteau : surchemises en laine et vestes courtes pour la mi-saison. La Woolrich Wool Shirt Jacket est un classique depuis des décennies — robuste, chaude et tissée en laine Melton.',
    },
    'sakkos-hosen': {
      label: 'Vestes & pantalons',
      h1: 'Acheter vestes tailleur & pantalons en ligne',
      title: 'Acheter vestes tailleur & chinos — mode masculine italienne',
      description:
        'Vestes tailleur et chinos chez The Sartorialist Zurich : vestes déstructurées et chinos en gabardine italienne. Pour un costume sur mesure : prenez rendez-vous dans notre showroom.',
      intro:
        'Vestes et pantalons de prêt-à-porter, mais avec une main italienne : déstructurés, souples et confortables. Si vous cherchez un costume qui vous aille vraiment, prenez rendez-vous chez nous pour un costume sur mesure — à partir de CHF 1’690, prêt en 20 jours ouvrables.',
    },
  },
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} de {marke} chez The Sartorialist Zurich, {preis}. Commandez en ligne ou essayez-le dans notre showroom à Zurich.',
    versand: 'Livraison dans toute la Suisse, frais indiqués lors du paiement',
    anprobe: 'Essayage dans notre showroom : {strasse}, Zurich',
    beratung: 'Conseil personnel :',
    beschreibung: 'Description',
    alleKategorie: 'Tous les articles : {label}',
    massDazu: 'Un costume sur mesure assorti',
    passtEyebrow: 'S’accorde avec',
    mehrTitel: 'Plus de pièces de la garde-robe',
    ctaEyebrow: 'Conseil en boutique',
    ctaTitel: 'Vous préférez essayer ? Nous vous le préparons.',
    ctaText: 'Prenez rendez-vous ou demandez à être rappelé — nous vous conseillons sur la taille, les associations et le costume sur mesure qui convient.',
    groesse: 'Taille {groesse}',
  },
  werte: {
    // Kategorien (Gruppe → Art → Modell)
    'Jacken & Mäntel': 'Vestes & manteaux',
    Strick: 'Maille',
    'Sakkos & Hosen': 'Vestes & pantalons',
    Parkas: 'Parkas',
    Mäntel: 'Manteaux',
    Overshirts: 'Surchemises',
    Jacken: 'Vestes',
    Chinos: 'Chinos',
    Sakkos: 'Vestes tailleur',
    Polos: 'Polos',
    Strickjacken: 'Cardigans',
    Troyer: 'Camionneurs',
    Rundhals: 'Col rond',
    Stehkragen: 'Col montant',
    Pullover: 'Pulls',
    Wollmantel: 'Manteau en laine',
    Technisch: 'Technique',
    Zweireiher: 'Croisé',
    Einreiher: 'Droit',
    Wolle: 'Laine',
    // Farben
    Schwarz: 'Noir',
    Rot: 'Rouge',
    Beige: 'Beige',
    Braun: 'Marron',
    Grün: 'Vert',
    Grau: 'Gris',
    Blau: 'Bleu',
    // Für
    Herren: 'Hommes',
    Damen: 'Femmes',
  },
  groessenSysteme: { int: 'Internationale', it: 'Italienne (vestes, maille)', w: 'Tour de taille (pantalons)' },
  grid: {
    facetten: {
      group: 'Catégorie',
      sub: 'Type',
      type: 'Modèle',
      brand: 'Marque',
      size: 'Taille',
      color: 'Couleur',
      price: 'Prix',
      gender: 'Pour',
    },
    sort: {
      neu: 'Nouveautés d’abord',
      'preis-auf': 'Prix croissant',
      'preis-ab': 'Prix décroissant',
      marke: 'Marque A–Z',
    },
    anzahlEins: '{n} pièce',
    anzahlMehr: '{n} pièces',
    zeigen: 'Afficher {anzahl}',
    groesseAria: 'Taille {groesse}, {anzahl}',
    nurAnLager: 'Uniquement les tailles en stock.',
    markenSuchen: 'Rechercher parmi {n} marques',
    markenSuchenAria: 'Rechercher une marque',
    alle: 'Tout',
    alleName: 'Tout : {name}',
    kategorienAria: 'Catégories',
    sortiment: 'Assortiment',
    nachArtAria: '{name} par type',
    nachModellAria: '{name} par modèle',
    alleFilter: 'Tous les filtres',
    filter: 'Filtrer',
    nachFiltern: 'Filtrer par {label}',
    zuruecksetzen: 'Réinitialiser',
    ansicht: 'Affichage',
    kompakt: 'Plus de pièces par ligne',
    gross: 'Images plus grandes',
    sortieren: 'Trier',
    filterEntfernen: 'Retirer le filtre {label}',
    alleZuruecksetzen: 'Tout réinitialiser',
    leer: 'Nous n’avons actuellement rien en stock pour cette combinaison.',
    alleFilterZuruecksetzen: 'Réinitialiser tous les filtres',
    sheetTitel: 'Filtrer & trier',
    filterSchliessen: 'Fermer les filtres',
  },
  preis: {
    bis: 'jusqu’à CHF 300',
    mitte: 'CHF 300–700',
    ab: 'à partir de CHF 700',
    min: 'Min',
    max: 'Max',
    minAria: 'Prix minimum',
    maxAria: 'Prix maximum',
    minFeldAria: 'Prix minimum en CHF',
    maxFeldAria: 'Prix maximum en CHF',
    imBereichEins: '{n} pièce dans cette fourchette',
    imBereichMehr: '{n} pièces dans cette fourchette',
  },
  karte: {
    ausverkauft: 'Épuisé',
    sale: 'Soldes',
  },
  buybox: {
    groesseWaehlen: 'Choisir la taille',
    groesseHinweis: ' — veuillez d’abord choisir une taille',
    groesseAria: 'Taille',
    ausverkauft: 'Épuisé',
    busy: 'Ajout en cours …',
    fertig: 'Dans votre panier ✓',
    hinzufuegen: 'Ajouter au panier',
    fehler: 'Une erreur s’est produite. Veuillez réessayer ou nous appeler.',
    anprobieren: 'L’essayer dans notre showroom',
  },
  galerie: {
    ansicht: '{titel} — vue {n}',
    bilderAria: 'Images',
    bild: 'Image {n}',
  },
  schrank: {
    eyebrow: 'Boutique · The Sartorialist Zurich',
    h1: 'La garde-robe',
    text: '{n} pièces choisies avec soin chez Woolrich, Gran Sasso et Tramarossa — commandez en ligne ou essayez-les dans notre showroom.',
    rolle: 'Carrousel',
    aria: 'La garde-robe — pièces choisies avec soin',
    zurueck: 'Pièce précédente',
    weiter: 'Pièce suivante',
    ansehen: 'Voir →',
    alleArtikel: 'Les {n} articles',
  },
};
