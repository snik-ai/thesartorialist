import type { Woerterbuch } from '../de';

// Page d’accueil
export const start: Woerterbuch['start'] = {
  meta: {
    titel: 'Costumes sur mesure & costumes de mariage Zurich — The Sartorialist',
    beschreibung:
      'Costumes sur mesure et costumes de mariage d’exception à Zurich : entoilage complet, 100 % fabriqué en Italie, à partir de CHF 1’690 — prêts en 20 jours ouvrables. Prenez rendez-vous.',
    ogTitel: 'Costumes sur mesure & costumes de mariage Zurich — The Sartorialist',
    ogBeschreibung: 'Costumes sur mesure et de mariage d’exception à Zurich : entoilage complet, fabriqué en Italie, à partir de CHF 1’690.',
  },
  hero: {
    h1: 'Costumes sur mesure & costumes de mariage à Zurich',
    zitat: '« La mode passe. ',
    zitatAkzent: 'Le style est éternel.',
    zitatEnde: ' »',
    lead: 'Costumes sur mesure et prêt-à-porter masculin italien d’exception — entoilage complet, 100 % fabriqué en Italie, à partir de CHF 1’690. Prêts en 20 jours ouvrables.',
    termin: 'Prendre rendez-vous',
    gestalten: 'Créer votre costume',
  },
  stoffpartnerAria: 'Nos drapiers et tissages',
  usps: [
    { titel: 'Entoilage complet', text: 'Seulement la plus belle facture' },
    { titel: 'Made in Italy', text: '100 % ateliers italiens' },
    { titel: 'À partir de CHF 1’690', text: 'Des prix justes et transparents' },
    { titel: '20 jours ouvrables', text: 'Le délai le plus court de Suisse' },
  ],
  styles: {
    eyebrow: 'Styles & options',
    titel: 'Créez votre costume sur mesure — détail après détail.',
    lead: 'Boutons, revers, poches, épaules, doublure : choisissez ce qui vous plaît, le tout sur une seule page. Inutile de tout décider — nous discutons du reste à l’atelier, où nous prenons vos mesures et choisissons le tissu avec vous.',
    knopf: 'Créer votre costume',
    hinweis: '118 options pour la veste, le pantalon, le gilet et le smoking',
  },
  haus: {
    bildAlt: 'Alexander Shubin, fondateur de The Sartorialist Zurich, avec des ciseaux de tailleur',
    eyebrow: 'La maison',
    titel: 'Du magasin Tom Ford de Zurich à un tailleur personnel pour hommes',
    absaetze: [
      'Je suis {gruender}, fondateur de « The Sartorialist » à Zurich — un artisan du vêtement masculin animé par la passion, fort de son expérience et étroitement lié aux maisons textiles italiennes traditionnelles. Longtemps directeur du premier magasin Tom Ford d’Europe, ici à Zurich, je me suis consacré à la plus belle mode masculine.',
      'Chaque maison que j’ai choisie est dirigée par des maîtres de leur art et peut s’appuyer sur des décennies de tradition. Chez moi, vous rencontrez les véritables artisans derrière les marques — c’est pourquoi mes prix sont justes.',
    ],
    liste: [
      'Un conseil personnel, de la première idée au costume achevé',
      'Une sélection exclusive de tissus de tissages italiens et anglais',
      'Un service personnel à toute heure — sans temps d’attente',
    ],
    mehr: 'En savoir plus sur nous',
  },
  hochzeit: {
    eyebrow: 'Mariage',
    titel: 'Le costume de mariage parfait pour votre grand jour',
    absaetze: [
      'Chaque mariage est différent — et votre costume doit l’être tout autant. Du choix du tissu à la coupe en passant par les accessoires, nous vous accompagnons vers votre propre costume de mariage : un trois-pièces classique, une coupe ajustée moderne, du lin pour l’été, un smoking pour une soirée black tie ou un look vintage en tweed.',
      'Si vous le souhaitez, nous brodons dans la doublure le prénom de votre épouse, une devise ou la date de votre mariage — une pièce unique qui n’existera jamais deux fois.',
    ],
    knopf: 'Costumes de mariage Zurich',
    bildAlt: 'Marié en costume de mariage sur mesure de The Sartorialist Zurich',
  },
  brands: { eyebrow: 'Nos marques', titel: 'Des maisons familiales, choisies personnellement' },
  faqTitel: 'Tout sur les costumes sur mesure et de mariage à Zurich',
  faq: [
    {
      q: 'Comment se déroule un rendez-vous conseil chez The Sartorialist ?',
      a: [
        'Dès que vous prenez rendez-vous à Zurich, nous vous consacrons au moins 60 à 90 minutes. Le déroulement : un entretien personnel, le choix parmi les plus beaux tissus italiens, des conseils sur la coupe, une prise de mesures précise portant sur plus de 30 paramètres, les choix de style (col, poches, boutons, doublure, initiales) puis, deux à trois semaines plus tard, un essayage avec les derniers ajustements à l’atelier.',
        'Aucune connaissance préalable n’est nécessaire — nous partons exactement de là où vous en êtes. Sans hâte, sans pression, avec un conseil honnête et substantiel.',
      ],
    },
    {
      q: 'Combien coûte un costume sur mesure chez The Sartorialist à Zurich ?',
      a: [
        'Nos costumes sur mesure sont proposés à partir de CHF 1’690 — le prix final dépend du tissu et des finitions choisis. Avec un tissu particulièrement noble de Loro Piana ou Scabal, une doublure luxueuse ou un gilet fini à la main, votre costume peut atteindre environ CHF 2’500.',
        'Nous offrons une qualité sans compromis : tissage italien, création individuelle, véritable confection sur mesure — et un service que l’on ne trouve d’ordinaire qu’à Londres ou à Florence.',
      ],
    },
    {
      q: 'Combien de temps dure la confection ?',
      a: [
        'Votre costume est en général prêt en 20 jours ouvrables — le délai le plus court de Suisse. Pour un costume de mariage, nous vous recommandons de prendre rendez-vous au moins 8 à 10 semaines avant la cérémonie, afin de disposer de tout le temps nécessaire pour le choix du tissu, la prise de mesures, l’essayage et les derniers réglages.',
      ],
    },
    {
      q: 'Que signifie l’entoilage complet (full canvas) ?',
      a: [
        'Dans un entoilage complet, la toile intérieure est cousue et non thermocollée — sur toute sa longueur, du col jusqu’à l’ourlet. La veste épouse ainsi votre corps au fil du temps, respire et dure nettement plus longtemps.',
        'Tous nos costumes sont confectionnés exclusivement en entoilage complet — la plus belle facture qui soit, et vous la ressentez à chaque fois que vous le portez.',
      ],
    },
    {
      q: 'Avec quels tissus The Sartorialist travaille-t-il ?',
      a: [
        'Nous travaillons exclusivement avec des tissus nobles de tissages renommés tels que Loro Piana, Vitale Barberis Canonico, Drago, Reda, Cerruti, Scabal, Solbiati et Holland & Sherry — un choix de plus de 1’000 tissus pour costumes et de plus de 400 tissus pour chemises.',
      ],
    },
    {
      q: 'Puis-je aussi faire confectionner une chemise sur mesure ?',
      a: [
        'Absolument — la chemise sur mesure est le complément naturel du costume sur mesure. Elle tombe parfaitement, ne gêne jamais et reste impeccable même sans veste. Choisissez parmi plus de 400 tissus pour chemises — de la popeline classique au coton Sea Island, de maisons telles que Canclini, Albini et Thomas Mason.',
      ],
    },
    {
      q: 'Habillez-vous aussi les témoins ou les invités d’un mariage ?',
      a: [
        'Oui — nous habillons non seulement le marié, mais aussi les témoins, les pères et les autres invités. Look harmonisé ou styles individuels : nous créons des tenues élégantes et coordonnées, sans jamais éclipser le marié.',
      ],
    },
    {
      q: 'Qu’est-ce qui distingue The Sartorialist à Zurich ?',
      a: [
        'Une qualité sans compromis, un véritable savoir-faire artisanal et un conseil personnel qui a du caractère : des tissus italiens exclusifs, de longues années d’expérience à des postes de direction chez Tom Ford et Prada, un atelier personnel au cœur de Zurich — et des prix justes et transparents.',
        'Nos clients ne cherchent pas le costume le moins cher, mais le bon.',
      ],
    },
  ],
  film: {
    bildAlt: 'Une montre, symbole d’un style intemporel — extrait du film de The Sartorialist Zurich',
    hintergrund: 'Film d’arrière-plan, The Sartorialist',
    ansehen: 'Voir le film',
    dialog: 'Film « Create your own Style! »',
    schliessen: 'Fermer le film',
  },
  video: {
    name: 'Create your own Style! — The Sartorialist Zurich',
    beschreibung: 'Costumes sur mesure à l’élégance italienne, de l’atelier The Sartorialist à Zurich.',
  },
  massfilm: {
    eyebrow: 'Des mesures au costume',
    titel: 'Un costume fait pour une seule personne.',
    schritte: [
      { kicker: '01 · Prise de mesures', titel: 'Plus de 30 points de mesure', text: 'Épaules, poitrine, taille, manches, longueur de jambe : nous mesurons votre corps, pas une taille standard.' },
      { kicker: '02 · Patron & tissu', titel: 'Un patron dessiné pour vous seul', text: 'Vos mesures deviennent votre patron personnel, coupé dans le tissu de votre choix, par exemple de Holland & Sherry, Savile Row.' },
      { kicker: '03 · Votre costume', titel: 'Un tour sur vous-même. Votre costume.', text: 'Entoilage complet, 100 % fabriqué en Italie et prêt en 20 jours ouvrables.' },
    ],
    schluss: { titel: 'Fait pour vous. Rien que pour vous.', text: 'Prise de mesures et conseil à l’atelier, Kuttelgasse 7, Zurich. À partir de CHF 1’690.', knopf: 'Prendre rendez-vous' },
    masse: { schulter: 'Épaule', brust: 'Poitrine', taille: 'Taille', aermel: 'Manche', bein: 'Pantalon', cm: 'cm', punkte: 'Points de mesure' },
    teile: { vorderteil: 'Devant', rueckenteil: 'Dos', aermel: 'Manche', hose: 'Pantalon' },
    stoff: 'Holland & Sherry · Savile Row',
    bildAlt: 'Homme en costume gris sur mesure, chemise blanche et cravate, devant une porte en bois',
  },
};
