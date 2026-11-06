import type { Woerterbuch } from '../de';

// Surcouche française de lib/konfigurator/daten.ts (ID identiques ; codes et images restent là-bas).
// Les titres de sous-groupes gardent la forme «Groupe — Variante» : la page d’accueil utilise la partie avant « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Veste',
      subtitle: 'Le fondement du sur-mesure',
      description:
        'Entoilage en crin de cheval travaillé à la main, proportions des revers, ligne d’épaule et architecture des poches, directement issus de nos spécifications de tailleur.',
    },
    trousers: {
      title: 'Pantalon',
      subtitle: 'Des lignes nettes et des détails de ceinture',
      description:
        'Un tombé de jambe impeccable, des fermetures de ceinture, des pattes de serrage latérales et des finitions d’ourlet, ajustés précisément à votre posture.',
    },
    waistcoat: {
      title: 'Gilet',
      subtitle: 'La touche finale du trois-pièces',
      description: 'Coupé pour recouvrir exactement la ceinture du pantalon, sans laisser apparaître la chemise entre les deux.',
    },
    'black-tie': {
      title: 'Smoking',
      subtitle: 'Tenue de soirée et détails du smoking',
      description: 'La tenue de soirée formelle, dans le strict respect du code vestimentaire classique « Black Tie ».',
    },
  },
  untergruppen: {
    // Veste
    'jacket-front-sb': { title: 'Devant — Droit', subtitle: 'Boutonnages de la veste droite' },
    'jacket-front-db': { title: 'Devant — Croisé', subtitle: 'Boutonnages de la veste croisée' },
    'jacket-lapel-notch': { title: 'Revers — Droit, cranté', subtitle: 'Mesuré de la ligne de cassure à la pointe du revers' },
    'jacket-lapel-peak': { title: 'Revers — Droit, en pointe', subtitle: 'Mesuré de la ligne de cassure au bord du revers' },
    'jacket-lapel-shawl': { title: 'Revers — Droit, col châle', subtitle: 'Un col arrondi d’un seul tenant' },
    'jacket-lapel-db-peak': { title: 'Revers — Croisé, en pointe', subtitle: 'Coupé spécialement pour la veste croisée' },
    'jacket-pockets': { title: 'Poches', subtitle: 'Poche poitrine et poches côtés' },
    'jacket-ticket-pocket': { title: 'Poches — Poche ticket', subtitle: 'Poche ticket supplémentaire à droite' },
    'jacket-back-style': { title: 'Dos & fentes', subtitle: 'Fentes dorsales et tombé' },
    'jacket-shoulder-style': { title: 'Épaule', subtitle: 'Rembourrage d’épaule et tête de manche' },
    'jacket-canvas': { title: 'Entoilage', subtitle: 'Plastron flottant' },
    'jacket-lining': { title: 'Doublure', subtitle: 'Étendue de la doublure en cupro' },
    'jacket-cuff-buttons': { title: 'Boutons de manche', subtitle: 'Nombre et disposition des boutons' },
    'jacket-cuff-style': { title: 'Disposition des boutons de manche', subtitle: 'Espacement des boutons' },
    'jacket-topstitching': { title: 'Surpiqûres (point main AMF)', subtitle: 'Point main sur les revers, le col et les coutures' },
    'jacket-lapel-buttonhole': { title: 'Boutonnière de revers', subtitle: 'Réalisée en asola a mano' },
    'jacket-monogram': { title: 'Monogramme intérieur', subtitle: 'Initiales et inscriptions brodées' },
    // Pantalon
    'trousers-front-style': { title: 'Devant du pantalon', subtitle: 'Pinces et devant' },
    'trousers-front-closure': { title: 'Fermeture', subtitle: 'Braguette et fermeture de ceinture' },
    'trousers-waistband': { title: 'Ceinture', subtitle: 'Maintien et réglage de la taille' },
    'trousers-side-pockets': { title: 'Poches côtés', subtitle: 'Coupe et angle de l’ouverture' },
    'trousers-back-pockets': { title: 'Poches arrière', subtitle: 'Disposition des poches passepoilées' },
    'trousers-lining': { title: 'Doublure', subtitle: 'Doublure du devant de jambe' },
    'trousers-hem': { title: 'Ourlet', subtitle: 'Revers ou ourlet simple' },
    'trousers-topstitching': { title: 'Surpiqûres', subtitle: 'Point main AMF sur la poche et la couture de côté' },
    'trousers-inside-waistband': { title: 'Ceinture intérieure', subtitle: 'Finition de la ceinture intérieure' },
    // Gilet
    'waistcoat-front-sb': { title: 'Gilet — Droit', subtitle: 'Devant et hauteur de boutonnage' },
    'waistcoat-front-db': { title: 'Gilet — Croisé', subtitle: 'Formel, et pour la jaquette' },
    'waistcoat-pockets': { title: 'Poches', subtitle: 'Poches passepoilées et poches à gorge' },
    'waistcoat-back': { title: 'Dos', subtitle: 'Dos en doublure ou en tissu' },
    'waistcoat-topstitching': { title: 'Surpiqûres', subtitle: 'Point main le long des bords' },
    'waistcoat-buttonholes': { title: 'Boutonnières', subtitle: 'Finition des boutonnières' },
    // Smoking
    'black-tie-jacket-style': { title: 'Veste de smoking', subtitle: 'En bleu nuit ou en noir profond' },
    'black-tie-facing': { title: 'Revers', subtitle: 'Parement de soie sur le revers du smoking' },
    'black-tie-trouser-details': { title: 'Pantalon de smoking : galon et ceinture', subtitle: 'Galon de soie et ceinture de smoking' },
    'black-tie-waistcoat': { title: 'Gilet du soir', subtitle: 'Un gilet de fête, largement décolleté' },
  },
  optionen: {
    // Veste — devant, droit
    'jacket-sb-1b': {
      label: 'Un bouton',
      subLabel: 'Boutonnage bas et élancé',
      description: 'Un boutonnage à un bouton moderne et épuré, avec une ouverture en V profonde.',
    },
    'jacket-sb-2b': {
      label: 'Deux boutons',
      subLabel: 'Le grand classique des affaires',
      description: 'Le standard intemporel de la confection masculine suisse.',
    },
    'jacket-sb-3-2b': {
      label: 'Trois roulé deux',
      subLabel: 'Revers roulé souple à la napolitaine',
      description: 'Le bouton supérieur disparaît avec élégance dans le revers légèrement roulé.',
    },
    'jacket-sb-3b': {
      label: 'Trois boutons',
      subLabel: 'Boutonnage haut, traditionnel',
      description: 'Traditionnellement britannique et boutonné haut, avec un tombé équilibré.',
    },
    // Veste — devant, croisé
    'jacket-db-4x2': {
      label: 'Quatre boutons, deux boutonnants',
      subLabel: 'Un croisé sportif et décontracté',
      description: 'Quatre boutons visibles, dont deux se boutonnent.',
    },
    'jacket-db-6x2': {
      label: 'Six boutons, deux boutonnants',
      subLabel: 'Le classique de Savile Row',
      description: 'Une silhouette classique à six boutons, dont deux se boutonnent.',
    },
    // Revers
    'jacket-lapel-notch-s': {
      label: 'Étroit (6,7 cm)',
      subLabel: '6,7 cm de large',
      description: 'Un revers cranté fin et précis, dans une largeur moderne.',
    },
    'jacket-lapel-notch-r': {
      label: 'Standard (8,0 cm)',
      subLabel: '8,0 cm de large',
      description: 'Des proportions équilibrées, idéales avec les cravates et les cols de chemise classiques.',
    },
    'jacket-lapel-notch-l': {
      label: 'Large (9,5 cm)',
      subLabel: '9,5 cm de large',
      description: 'Un revers cranté affirmé, d’une forte présence sur la poitrine.',
    },
    'jacket-lapel-peak-s': {
      label: 'Étroit (6,7 cm)',
      subLabel: '6,7 cm de large',
      description: 'Des pointes de revers dirigées vers le haut, qui allongent le buste.',
    },
    'jacket-lapel-peak-r': {
      label: 'Standard (8,0 cm)',
      subLabel: '8,0 cm de large',
      description: 'Un revers en pointe classique, à l’italienne.',
    },
    'jacket-lapel-peak-l': {
      label: 'Large (9,5 cm)',
      subLabel: '9,5 cm de large',
      description: 'Un revers en pointe généreux pour une allure imposante.',
    },
    'jacket-lapel-shawl-s': {
      label: 'Étroit (4,5 cm)',
      subLabel: '4,5 cm de large',
      description: 'Un col arrondi et fin pour les vestes du soir.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Standard (6,0 cm)',
      subLabel: '6,0 cm de large',
      description: 'Une courbe élégante d’un seul tenant pour les smokings et les vestes en velours.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'Étroit (9,0 cm)',
      subLabel: '9,0 cm de large',
      description: 'Un revers en pointe fin pour le costume croisé.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Standard (10,0 cm)',
      subLabel: '10,0 cm de large',
      description: 'Un revers en pointe ample pour l’élégance classique de la veste croisée.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'Large (11,0 cm)',
      subLabel: '11,0 cm de large',
      description: 'Un revers en pointe expressif et ample.',
    },
    // Poches
    'jacket-pocket-jetted': {
      label: 'Barchetta & poche passepoilée',
      description: 'La ligne la plus nette et la plus formelle, entièrement sans rabats.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche passepoilée' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta & passepoilée inclinée',
      description: 'Des poches passepoilées inclinées qui soulignent la taille.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche passepoilée inclinée' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta & poche à rabat',
      description: 'Des poches à rabat droites et polyvalentes ; les rabats peuvent aussi être rentrés.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche à rabat' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta & rabat incliné',
      description: 'La coupe hacking traditionnelle pour une ligne de taille dynamique.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche à rabat inclinée' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta & poche plaquée',
      description: 'Une combinaison napolitaine : poche poitrine barchetta et poches côtés plaquées arrondies.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche plaquée' },
    },
    'jacket-pocket-patch-patch': {
      label: 'Plaquée & plaquée',
      description: 'Un style blazer décontracté aux surpiqûres apparentes.',
      pocketSpec: { chest: 'Poche plaquée', side: 'Poche plaquée' },
    },
    'jacket-pocket-safari': {
      label: 'Safari & safari',
      description: 'Des poches soufflet fonctionnelles avec pli creux et fermeture par bouton central.',
      pocketSpec: { chest: 'Safari', side: 'Safari' },
    },
    // Poche ticket
    'jacket-ticket-flap': {
      label: 'Poche ticket à rabat',
      description: 'La poche ticket anglaise traditionnelle, au-dessus de la poche à rabat droite.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche ticket à rabat' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Poche ticket inclinée',
      description: 'Placée selon le même angle que la poche à rabat inclinée en dessous.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche ticket inclinée à rabat' },
    },
    'jacket-ticket-patch': {
      label: 'Poche ticket plaquée',
      description: 'Une version décontractée, au-dessus de la poche côté plaquée droite.',
      pocketSpec: { chest: 'Barchetta', side: 'Poche ticket plaquée' },
    },
    'jacket-ticket-patch-double': {
      label: 'Plaquée + poche ticket',
      description: 'Des poches plaquées partout, avec une petite poche ticket en haut à droite.',
      pocketSpec: { chest: 'Poche plaquée', side: 'Poche ticket plaquée' },
    },
    // Dos & fentes
    'jacket-back-ventless': {
      label: 'Sans fente',
      subLabel: 'Un dos lisse et ininterrompu',
      description: 'Un dos lisse particulièrement formel, réservé aux smokings et aux vestes du soir.',
    },
    'jacket-back-single-vent': {
      label: 'Fente centrale',
      subLabel: 'Une seule fente au milieu du dos',
      description: 'La fente centrale traditionnelle à l’américaine.',
    },
    'jacket-back-side-vents': {
      label: 'Fentes latérales',
      subLabel: 'Deux fentes sur les côtés',
      description: 'Un tombé impeccable en position assise ; vos mains trouvent place dans les poches sans que la veste ne tire.',
    },
    // Épaule
    'jacket-shoulder-soft': {
      label: 'Épaule souple',
      subLabel: 'Rembourrage fin · sans tête de manche relevée · naturelle',
      description: 'Coutures repassées vers l’intérieur pour un tombé léger, déstructuré et naturel.',
    },
    'jacket-shoulder-traditional': {
      label: 'Épaule classique',
      subLabel: 'Rembourrage moyen · tête de manche moyennement relevée',
      description: 'Coutures repassées vers l’extérieur pour une ligne d’épaule nette et soignée.',
    },
    'jacket-shoulder-roped': {
      label: 'Épaule à tête de manche relevée',
      subLabel: 'Rembourrage ferme · tête de manche marquée · pagode',
      description: 'Coutures repassées vers l’extérieur, avec une tête de manche nettement relevée (con rollino).',
    },
    // Entoilage
    'jacket-canvas-soft': {
      label: 'Entoilage souple',
      subLabel: 'Plastron flottant en crin de cheval, souple',
      description: 'Un entoilage léger qui épouse rapidement le corps et offre un merveilleux confort.',
    },
    'jacket-canvas-traditional': {
      label: 'Entoilage classique',
      subLabel: 'Entoilage complet en crin de cheval, structurant',
      description: 'Un roulé de revers précis et une poitrine nettement modelée, qui dureront des décennies.',
    },
    // Doublure
    'jacket-lining-lined': {
      label: 'Entièrement doublée',
      subLabel: 'Doublure au corps et aux manches',
      description: 'Glisse sans effort sur la chemise et protège entièrement l’intérieur.',
    },
    'jacket-lining-unlined': {
      label: 'Demi-doublée',
      subLabel: 'Doublure aux manches et en empiècement dorsal',
      description: 'Davantage de respirabilité pour les douces journées de printemps et d’automne.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Non doublée',
      subLabel: 'Ni le corps ni les manches doublés',
      description: 'Une circulation d’air maximale, avec des coutures intérieures soigneusement gansées.',
    },
    // Boutons de manche
    'jacket-cuff-0b': {
      label: 'Sans boutons',
      subLabel: 'Une manche nette et épurée',
      description: 'Une finition de manche nette, sans boutonnières ni boutons.',
    },
    'jacket-cuff-3b': {
      label: 'Trois boutons',
      subLabel: 'Classique européen',
      description: 'La finition de manche traditionnelle, à la manière continentale.',
    },
    'jacket-cuff-4b': {
      label: 'Quatre boutons',
      subLabel: 'Le standard du tailleur',
      description: 'La référence reconnue pour les manches dans la grande confection.',
    },
    'jacket-cuff-5b': {
      label: 'Cinq boutons',
      subLabel: 'Une touche napolitaine',
      description: 'Un détail inimitable de la grande confection italienne.',
    },
    'jacket-cuff-kissing': {
      label: 'Boutons chevauchants (kissing buttons)',
      subLabel: 'Les boutons se chevauchent (cascata)',
      description: 'Une véritable cascade travaillée à la main sur la manche.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Côte à côte',
      subLabel: 'Les boutons se touchent sans se chevaucher',
      description: 'Une rangée nette à la britannique, chaque bouton reposant à plat.',
    },
    // Surpiqûres
    'jacket-stitch-edge-2mm': {
      label: 'Point de bord (2 mm)',
      subLabel: 'Bord devant, revers, col et poches',
      description: 'Un fin point main à 2 mm du bord, qui dessine les contours et stabilise le roulé du revers.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Point de bord intégral (2 mm)',
      subLabel: 'Y compris pinces, épaules et coutures du dos',
      description: 'Un point main complet le long de toutes les coutures de construction importantes.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Couture surpiquée (5 mm)',
      subLabel: 'Surpiqûre marquée pour la veste sport',
      description: 'Une surpiqûre prononcée à 5 mm du bord, idéale pour le natté texturé, la flanelle et le tweed.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Coutures surpiquées intégrales (5 mm)',
      subLabel: 'Entièrement surpiquée à 5 mm',
      description: 'Des coutures surpiquées sur le devant, les revers, les pinces et toutes les coutures.',
    },
    // Boutonnière de revers
    'jacket-buttonhole-machine': {
      label: 'À la machine',
      subLabel: 'Point noué précis',
      description: 'Une boutonnière piquée à la machine, fiable et résistante.',
    },
    'jacket-buttonhole-hand': {
      label: 'Cousue main',
      subLabel: 'Fil de soie sur cordonnet, noué',
      description: 'Cousue à la main avec une véritable soie à boutonnière sur un cordonnet.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Boutonnière milanaise',
      subLabel: 'Soie enroulée sans nœuds · en relief',
      description: 'Le summum du travail à la main : une soie brillante, enroulée sans raccord sur un cordonnet.',
    },
    // Monogramme
    'jacket-monogram-lined': {
      label: 'Monogramme dans la doublure',
      subLabel: 'Brodé sous la poche poitrine intérieure',
      description: 'Les initiales de votre choix, brodées à la main ou à la machine sur la parementure de la doublure.',
    },
    'jacket-monogram-unlined': {
      label: 'Monogramme, non doublée',
      subLabel: 'Brodé sur le passepoil de la poche',
      description: 'Placé discrètement sur le passepoil de la poche intérieure, pour les vestes légères non doublées.',
    },

    // Pantalon — devant
    'trousers-front-flat': {
      label: 'Devant plat',
      subLabel: 'Lisse et moderne',
      description: 'Un devant lisse et net, sans pinces, pour une silhouette fine et élancée.',
    },
    'trousers-front-single-pleat': {
      label: 'Une pince',
      subLabel: 'Profondeur de pince 2 cm',
      description: 'Un peu plus d’aisance aux hanches en position assise, avec un pli marqué.',
    },
    'trousers-front-double-pleat': {
      label: 'Deux pinces',
      subLabel: 'Première 2 cm · seconde 1,25 cm',
      description: 'Une élégance généreuse avec une taille haute, une totale liberté de mouvement et un beau tombé.',
    },
    // Fermeture
    'trousers-closure-extended-belt': {
      label: 'Ceinture prolongée',
      subLabel: 'Patte de ceinture prolongée',
      description: 'Une patte de ceinture prolongée au-delà de la braguette pour une ligne de taille plus nette.',
    },
    'trousers-closure-standard': {
      label: 'Braguette à boutons — standard',
      subLabel: 'Braguette à boutons en corne',
      description: 'Une construction traditionnelle et épurée ; contrairement à une fermeture éclair, aucun renflement en position assise.',
    },
    'trousers-closure-double-belt': {
      label: 'Double ceinture',
      subLabel: 'Fermeture prolongée à deux boutons',
      description: 'Une ceinture haute à deux boutons, inspirée de la tradition des tailleurs florentins.',
    },
    // Ceinture
    'trousers-waistband-side-adjusters': {
      label: 'Pattes de serrage latérales',
      subLabel: 'Boucles en laiton · sans passants',
      description: 'Une ceinture nette avec pattes de serrage latérales, entièrement sans ceinture en cuir.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Passants',
      subLabel: 'Passants de ceinture classiques',
      description: 'Six passants posés à la main pour de belles ceintures en cuir.',
    },
    'trousers-waistband-plain': {
      label: 'Ceinture lisse',
      subLabel: 'Une taille simple et épurée',
      description: 'Une ceinture pure et lisse, sans passants ni boucles, à porter avec des bretelles.',
    },
    // Poches côtés
    'trousers-pocket-slanted': {
      label: 'Inclinées',
      subLabel: 'Accès naturel',
      description: 'Une ouverture inclinée ergonomique ; la main s’y glisse naturellement sans que le tissu ne tire.',
    },
    'trousers-pocket-inseam': {
      label: 'Dans la couture',
      subLabel: 'Dissimulées dans la couture de côté',
      description: 'Invisibles dans la couture de côté verticale, pour la ligne latérale la plus nette.',
    },
    'trousers-pocket-jetted': {
      label: 'Poche passepoilée',
      subLabel: 'Ouverture horizontale, double passepoil',
      description: 'Une ouverture fine à double passepoil pour les pantalons habillés.',
    },
    'trousers-pocket-jeans': {
      label: 'Poche jean',
      subLabel: 'Ouverture arrondie en haut',
      description: 'Une poche arrondie de style western, idéale pour les chinos et le velours côtelé.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'Frog mouth',
      subLabel: 'Ouverture horizontale sur le devant',
      description: 'Une ouverture horizontale sur le devant, comme sur les pantalons de cavalerie taillés du milieu du siècle dernier.',
    },
    // Poches arrière
    'trousers-back-none': {
      label: 'Aucune',
      subLabel: 'Un dos parfaitement lisse',
      description: 'Sans poches arrière, pour un tombé lisse et ininterrompu sur l’assise.',
    },
    'trousers-back-left': {
      label: 'À gauche uniquement',
      subLabel: 'Une poche passepoilée à gauche',
      description: 'Une poche passepoilée avec bouton en corne, du côté gauche de celui qui la porte.',
    },
    'trousers-back-right': {
      label: 'À droite uniquement',
      subLabel: 'Une poche passepoilée à droite',
      description: 'Une poche passepoilée avec bouton en corne, du côté droit de celui qui la porte.',
    },
    'trousers-back-two': {
      label: 'Deux poches',
      subLabel: 'Deux poches passepoilées symétriques',
      description: 'Des poches passepoilées classiques des deux côtés, avec fermeture par bouton.',
    },
    // Doublure
    'trousers-lining-unlined': {
      label: 'Non doublé',
      subLabel: 'Tissu pur, respirant',
      description: 'Entièrement sans doublure, pour une respirabilité maximale par temps chaud.',
    },
    'trousers-lining-half-lined': {
      label: 'Demi-doublé',
      subLabel: 'Doublé devant jusque sous le genou',
      description: 'Une doublure lisse en cupro au-dessus du genou évite les frottements et les genoux poches.',
    },
    'trousers-lining-fully-lined': {
      label: 'Entièrement doublé',
      subLabel: 'Doublé sur toute la longueur',
      description: 'Une doublure complète, confortable pour les peaux sensibles et les lainages lourds.',
    },
    // Ourlet
    'trousers-hem-plain-bottom': {
      label: 'Ourlet simple',
      subLabel: 'Légèrement en biais vers l’arrière',
      description: 'Une finition nette et droite, coupée un peu plus longue à l’arrière, vers le talon.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Revers (3,0 cm)',
      subLabel: 'Un revers discret',
      description: 'Un revers sobre qui donne à la jambe du pantalon un léger poids.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Revers (3,5 cm)',
      subLabel: 'Un revers équilibré',
      description: 'Des proportions équilibrées, idéales pour les hommes de taille moyenne.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Revers (4,0 cm)',
      subLabel: 'La largeur classique du tailleur',
      description: 'Le standard éprouvé de la grande confection, pour un tombé idéal et un pli net.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Revers (4,5 cm)',
      subLabel: 'Un revers affirmé',
      description: 'Un revers marqué pour les lainages lourds et la flanelle.',
    },
    // Surpiqûres
    'trousers-topstitching-none': {
      label: 'Aucune',
      subLabel: 'Point main AMF sur la poche côté uniquement',
      description: 'Un point AMF discret, limité au bord de la poche côté.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Point de bord (2 mm)',
      subLabel: 'AMF de 2 mm sur les poches et la couture de côté',
      description: 'Un aspect point main à 2 mm du bord, sur toute la longueur de la couture de côté extérieure.',
    },
    // Ceinture intérieure
    'trousers-inside-wb-pleated': {
      label: 'Ceinture plissée',
      subLabel: 'Ceinture intérieure classique à rideau',
      description: 'Une ceinture intérieure plissée traditionnelle, pour le confort et la souplesse.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Plissée + boutons de bretelles',
      subLabel: 'Boutons intérieurs en corne pour bretelles',
      description: 'Une ceinture intérieure plissée avec six boutons intérieurs en corne pour bretelles à boutonner.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Ceinture antiglisse',
      subLabel: 'Bande antiglisse caoutchoutée',
      description: 'Une bande antiglisse caoutchoutée intégrée maintient la chemise parfaitement rentrée toute la journée.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Antiglisse + boutons de bretelles',
      subLabel: 'Bande antiglisse et boutons de bretelles',
      description: 'Le summum du confort : bande antiglisse et boutons de bretelles réunis.',
    },

    // Gilet — droit
    'waistcoat-sb-4b': {
      label: 'Quatre boutons',
      subLabel: 'Ouverture basse',
      description: 'Boutonné bas, il laisse voir davantage la cravate et le plastron de la chemise.',
    },
    'waistcoat-sb-5b': {
      label: 'Cinq boutons',
      subLabel: 'Le gilet classique',
      description: 'Le gilet européen classique du costume trois-pièces, avec une hauteur de boutonnage équilibrée.',
    },
    'waistcoat-sb-6b': {
      label: 'Six boutons',
      subLabel: 'Boutonnage haut',
      description: 'Une fermeture haute ; selon la règle consacrée, le dernier bouton reste ouvert.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'Fer à cheval',
      subLabel: 'Ouverture basse en U, formelle',
      description: 'Une ouverture en U galbée qui met en valeur une chemise de soirée plissée et le nœud papillon.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Revers cranté',
      subLabel: 'Col à revers classique',
      description: 'Donne de la structure au cou et aux épaules, et un bel encadrement.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Col châle',
      subLabel: 'Col doucement arrondi',
      description: 'Un col arrondi d’un seul tenant, tout en douceur, comme sur les gilets du soir d’antan.',
    },
    // Gilet — croisé
    'waistcoat-db-6b': {
      label: 'Croisé, six boutons',
      subLabel: 'Bas droit',
      description: 'Une coupe croisée majestueuse, avec un bord inférieur droit et horizontal.',
    },
    'waistcoat-db-8b': {
      label: 'Croisé, huit boutons',
      subLabel: 'Fermeture haute, formel',
      description: 'Fermé haut, pour la jaquette ou une allure trois-pièces imposante.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Croisé, col châle',
      subLabel: 'Col arrondi d’un seul tenant',
      description: 'Croisé, avec un ample col châle.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Croisé, revers cranté',
      subLabel: 'Col à revers cranté',
      description: 'Un gilet croisé au revers cranté nettement découpé.',
    },
    // Gilet — poches
    'waistcoat-pocket-jetted': {
      label: 'Poches passepoilées',
      subLabel: 'Deux fines poches passepoilées',
      description: 'Des poches à double passepoil particulièrement plates, pour une ligne de taille d’une netteté absolue.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 poches à gorge',
      subLabel: 'Deux poches à gorge classiques',
      description: 'Des poches à gorge inférieures classiques.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 poches à gorge',
      subLabel: 'Deux en haut, deux en bas',
      description: 'Quatre poches à gorge, avec de la place pour une montre de gousset et sa chaîne.',
    },
    // Gilet — dos
    'waistcoat-back-cloth': {
      label: 'Dos en tissu',
      subLabel: 'Tissu du costume devant et dos',
      description: 'Se porte avec style sans veste, comme un gilet à part entière.',
    },
    'waistcoat-back-lining': {
      label: 'Dos en doublure',
      subLabel: 'Dos en cupro respirant',
      description: 'Un dos lisse en cupro, sur lequel la veste glisse sans effort.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Doublure + martingale',
      subLabel: 'Dos en cupro avec martingale à boucle',
      description: 'La martingale au dos permet un réglage des plus fins pour une silhouette parfaitement ajustée.',
    },
    // Gilet — surpiqûres
    'waistcoat-topstitching-none': {
      label: 'Aucune',
      subLabel: 'Bords nets sans surpiqûre',
      description: 'Une sobriété formelle, sans surpiqûre visible.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Point de bord (2 mm)',
      subLabel: 'Point main AMF de 2 mm le long des bords',
      description: 'Un fin point main à 2 mm du bord, qui dessine le bord devant et le roulé du col.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Couture surpiquée (5 mm)',
      subLabel: 'Surpiqûre marquée de 5 mm',
      description: 'Une surpiqûre prononcée, idéale pour le tweed et les lainages sportifs.',
    },
    // Gilet — boutonnières
    'waistcoat-buttonhole-none': {
      label: 'Aucune',
      subLabel: 'Sans boutonnière de revers décorative',
      description: 'Un bord de revers net, sans boutonnière décorative.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'À la machine',
      subLabel: 'Point noué précis',
      description: 'Une boutonnière piquée à la machine, nette, régulière et très résistante.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'Cousues main',
      subLabel: 'Boutonnières travaillées à la main',
      description: 'Travaillées à la main en fil de soie pure sur un cordonnet.',
    },

    // Smoking — veste
    'black-tie-tux-shawl': {
      label: 'Smoking à col châle',
      subLabel: 'Revers en soie arrondi · un bouton',
      description: 'Un col en soie arrondi d’un seul tenant, avec un unique bouton recouvert.',
    },
    'black-tie-tux-peak-sb': {
      label: 'Droit, revers en pointe',
      subLabel: 'Revers en soie dirigé vers le haut',
      description: 'Un revers en pointe large et expressif, avec un fin parement de soie.',
    },
    'black-tie-tux-peak-db': {
      label: 'Smoking croisé',
      subLabel: 'Six boutons, deux boutonnants, revers en soie',
      description: 'Se porte fermé, sans cummerbund ni gilet.',
    },
    // Smoking — parement
    'black-tie-facing-satin': {
      label: 'Satin',
      subLabel: 'Satin de soie brillant sur les revers et les boutons',
      description: 'Une soie pure très brillante, qui capte la lueur des bougies et l’éclat des lustres.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Gros-grain',
      subLabel: 'Soie côtelée mate sur les revers et les boutons',
      description: 'Une soie finement côtelée pour une élégance du soir sobre, pleine de profondeur et de relief.',
    },
    // Smoking — pantalon
    'black-tie-trousers-braid': {
      label: 'Galon de soie',
      subLabel: 'Une bande de soie assortie le long de la couture de côté',
      description: 'Un galon vertical en satin ou en gros-grain sur la couture de côté extérieure.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Galon de soie — vue de face',
      subLabel: 'Le devant complet avec galon',
      description: 'Vu de face, avec un tombé net sur toute la longueur.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Ceinture de smoking',
      subLabel: 'Ceinture parée de soie, sans passants',
      description: 'Parée d’une soie assortie, avec des boutons de bretelles intérieurs.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Ceinture de smoking — vue de face',
      subLabel: 'Un devant lisse, comme un cummerbund',
      description: 'Une fermeture frontale sans couture, qui s’ajuste à fleur sous la veste de smoking.',
    },
    // Smoking — gilet
    'black-tie-horseshoe': {
      label: 'Gilet du soir fer à cheval',
      subLabel: 'Ouverture basse qui dévoile le plastron',
      description: 'L’ouverture basse traditionnelle en fer à cheval pour la tenue de soirée formelle.',
    },
  },
};
