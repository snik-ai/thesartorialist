import type { Woerterbuch } from '../de';

// Configurateur de costume sur mesure « Styles & options »
export const konfigurator: Woerterbuch['konfigurator'] = {
  meta: {
    titel: 'Styles & options — configurateur de costume sur mesure',
    beschreibung:
      'Créez votre propre costume sur mesure : {anzahl} styles & options pour la veste, le pantalon, le gilet et le smoking — revers, boutons, poches, doublure. Enregistrez votre sélection en PDF et faites confectionner votre costume sur mesure à Zurich.',
    ogTitel: 'Créez votre costume sur mesure — Styles & options, The Sartorialist Zurich',
    ogBeschreibung:
      'Choisissez en ligne les revers, les poches, les boutons et la doublure de votre costume sur mesure — et apportez votre sélection à votre rendez-vous à l’atelier.',
  },
  breadcrumb: { massanzug: 'Costume sur mesure', seite: 'Styles & options' },
  hero: {
    eyebrow: 'Styles & options · Configurateur de style',
    h1: 'Votre costume sur mesure commence ici.',
    lead: 'Votre style. Vos mesures. Votre costume. Découvrez revers, boutons, poches et finitions, et composez en toute tranquillité ce qui vous ressemble — où et quand vous le souhaitez. Apportez votre sélection à votre rendez-vous à l’atelier : nous y prenons vos mesures, choisissons le tissu avec vous et affinons chaque détail jusqu’à ce que le costume épouse non seulement votre corps, mais aussi votre caractère.',
    hinweise: ['Touchez ce qui vous plaît', 'Inutile de tout choisir', 'Récapitulatif en bas — en PDF ou directement pour votre rendez-vous'],
  },
  sogehts: {
    titel: 'Créer votre propre costume sur mesure — rien de plus simple',
    absaetze: [
      'Un costume sur mesure est la somme de nombreuses petites décisions. Vous pouvez prendre ici les premières en toute sérénité : droit ou croisé, revers cranté ou en pointe, poches passepoilées ou à rabat, épaule napolitaine souple ou classique, veste doublée ou non doublée. Chaque option est illustrée, pour que vous voyiez exactement ce qui change.',
      'Ne choisissez que ce qui compte pour vous. Votre sélection apparaît dans le récapitulatif en bas de page, peut être enregistrée en PDF et nous est transmise directement avec votre demande de rendez-vous.',
    ],
  },
  zuerich: {
    titel: 'Votre costume sur mesure à Zurich',
    text: 'Dans notre atelier de la Kuttelgasse 7, nous prenons vos mesures, vous présentons les tissus de Loro Piana, Vitale Barberis Canonico, Holland & Sherry et d’autres tissages, et affinons chaque détail avec vous. Chaque costume sur mesure est réalisé en entoilage complet, 100 % fabriqué en Italie, à partir de CHF 1’690 — prêt en 20 jours ouvrables.',
    linkMassanzug: 'En savoir plus sur les costumes sur mesure à Zurich',
    linkHochzeit: 'Costumes de mariage sur mesure',
  },
  faqTitel: 'Questions sur le configurateur de costume',
  faq: [
    {
      q: 'Puis-je créer mon costume sur mesure en ligne ?',
      a: [
        'Oui. Dans « Styles & options », vous choisissez en ligne les détails de votre costume sur mesure — boutonnage, revers, poches, épaule, doublure, ceinture et bien plus. La prise de mesures et le choix du tissu ont ensuite lieu en personne dans notre atelier à Zurich, afin que le costume tombe vraiment parfaitement.',
      ],
    },
    {
      q: 'À quoi sert le configurateur de costume ?',
      a: [
        'Le configurateur vous permet de prendre les premières décisions de style en toute tranquillité depuis chez vous : revers, boutons, poches, épaule, doublure, ceinture et ourlet. Apportez votre sélection à votre rendez-vous — à l’atelier, nous prenons vos mesures, choisissons le tissu et affinons ensemble chaque détail.',
      ],
    },
    {
      q: 'Dois-je choisir chaque détail ?',
      a: [
        'Non. Ne choisissez que ce qui compte pour vous. Tout ce qui reste ouvert, nous en discutons lors de votre rendez-vous, et nous vous conseillons honnêtement sur ce qui flatte votre silhouette et convient à l’occasion.',
      ],
    },
    {
      q: 'Où ma sélection est-elle enregistrée ?',
      a: [
        'Uniquement dans votre navigateur, sur cet appareil. Nous ne la recevons que lorsque vous demandez un rendez-vous avec votre sélection ou que vous nous l’envoyez en PDF ou en texte.',
      ],
    },
    {
      q: 'Combien coûte un costume sur mesure avec ces détails ?',
      a: [
        'Nos costumes sur mesure sont proposés à partir de CHF 1’690. Le prix final dépend principalement du tissu et se situe généralement jusqu’à environ CHF 2’500. Chaque costume est réalisé en entoilage complet, 100 % fabriqué en Italie, et prêt en 20 jours ouvrables.',
      ],
    },
  ],
  cta: {
    titel: 'Sélection terminée ? Faites maintenant prendre vos mesures.',
    text: 'Apportez votre sélection de style à un conseil gracieux à la Kuttelgasse 7 — ou nous vous rappelons et discutons de tout par téléphone.',
  },
  schema: {
    name: 'Configurateur de costume sur mesure',
    beschreibung:
      'Sélection de style en ligne pour costumes sur mesure : veste, pantalon, gilet et smoking — sélection en PDF et pour votre rendez-vous à l’atelier à Zurich.',
  },
  ui: {
    kategorienAria: 'Catégories',
    gewaehltAria: '{n} sélectionné(s)',
    stoff: 'Tissu',
    meineAuswahl: 'Ma sélection',
    brustSeite: 'Poitrine · Côtés',
    detailsZu: 'Détails : {label}',
    stoffSub: 'La collection de tissus Holland & Sherry',
    stoffText:
      'Depuis 1836, Holland & Sherry tisse pour les plus grands tailleurs du monde. Parcourez la collection et notez les numéros de vos favoris — nous préparerons les échantillons pour votre rendez-vous à l’atelier.',
    stoffBildAlt: 'Tissus de Holland & Sherry',
    stoffAnsehen: 'Voir la collection de tissus',
    neuesFenster: 'S’ouvre dans une nouvelle fenêtre',
    stoffKicker: 'Numéro de tissu (facultatif)',
    stoffPlatzhalter: 'p. ex. 9722022',
    stoffAria: 'Numéro de tissu',
    hinzufuegen: 'Ajouter',
    stoffHinweis:
      'Vous trouverez le numéro sur la page du tissu, sous « Product Code ». Plusieurs numéros sont possibles — ou choisissez simplement le tissu à l’atelier.',
    stoffEntfernen: 'Retirer le tissu {n}',
    uebersicht: 'Récapitulatif',
    summaryTitelEins: 'Votre costume sur mesure en {n} détail',
    summaryTitelMehr: 'Votre costume sur mesure en {n} détails',
    summaryText: 'Enregistré dans ce navigateur. Nous prenons vos mesures ensemble à l’atelier — et y affinons chaque détail.',
    reset: 'Tout réinitialiser',
    stoffGruppe: 'Tissu · Holland & Sherry',
    stoffnummer: 'Numéro de tissu',
    leerTitel: 'Aucune sélection pour l’instant.',
    leerText: 'Touchez ci-dessus les revers, poches, boutons et doublures — votre sélection apparaîtra ici.',
    leerKnopf: 'Commencer par la veste',
    entfernen: 'Retirer : {label}',
    terminKnopf: 'Prendre rendez-vous avec cette sélection',
    pdfKnopf: 'Télécharger le PDF',
    pdfLaeuft: 'Création du PDF …',
    pdfFertig: 'PDF téléchargé',
    pdfFehler: 'Le PDF n’a pas pu être créé',
    dockLeer: 'Votre récapitulatif',
    dockEins: '{n} détail sélectionné',
    dockMehr: '{n} détails sélectionnés',
    dockText: 'Inutile de tout choisir — nous discutons du reste à l’atelier.',
    dockGo: 'Vers le récapitulatif',
    schliessen: 'Fermer',
    code: 'Code {code}',
    brusttasche: 'Poche poitrine :',
    seitentaschen: 'Poches côtés :',
    abwaehlen: 'Retirer de la sélection',
    waehlen: 'Choisir ce détail',
    auswahl: {
      taschen: 'Poitrine {brust}, côtés {seite}',
      stoffKopf: 'TISSU (HOLLAND & SHERRY)',
      stoffnummer: 'Numéro de tissu',
      stoffnummern: 'Numéros de tissu',
    },
  },
  pdf: {
    dateiname: 'The-Sartorialist-Selection-de-style.pdf',
    locale: 'fr-CH',
    dokTitel: 'Sélection de style, costume sur mesure — The Sartorialist Zurich',
    dokThema: 'Costume sur mesure Styles & options',
    ort: 'ZURICH',
    kopfFolge: 'Sélection de style · {datum}',
    titel: 'Ma sélection de style',
    untertitel: 'pour le costume sur mesure — Styles & options',
    detailEins: '{n} détail',
    detailMehr: '{n} détails',
    stoffEins: '{n} tissu',
    stoffMehr: '{n} tissus',
    stoffAbschnitt: 'Tissu · Holland & Sherry',
    stoffnummerKopf: 'NUMÉRO DE TISSU',
    stoffnummernKopf: 'NUMÉROS DE TISSU',
    notizen: 'Notes pour l’atelier',
    fussHinweis: 'Nous prenons vos mesures à l’atelier — apportez cette sélection à votre rendez-vous.',
    seite: 'Page {p} sur {n}',
  },
};
