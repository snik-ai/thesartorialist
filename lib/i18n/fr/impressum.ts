import type { Woerterbuch } from '../de';

// Mentions légales
export const impressum: Woerterbuch['impressum'] = {
  meta: {
    titel: 'Mentions légales',
    beschreibung: 'Mentions légales de The Sartorialist Zurich — Swiss Art Partner AG.',
  },
  h1: 'Mentions légales',
  hinweisMassgeblich:
    'Cette traduction française est fournie à titre informatif uniquement. Seule la version allemande fait foi : [lire la version allemande](/impressum/).',
  unternehmen: {
    titel: 'Informations sur l’entreprise',
    land: 'Suisse',
    vertreten: 'Représentée par : ',
  },
  kontakt: {
    titel: 'Contact',
    telefon: 'Téléphone : ',
    email: 'E-mail : ',
  },
  abschnitte: [
    {
      titel: 'Règlement des litiges de consommation / organe de conciliation',
      absaetze: [
        'Nous ne sommes ni disposés ni tenus de participer à une procédure de règlement des litiges devant un organe de conciliation pour les consommateurs.',
      ],
    },
    {
      titel: 'Responsabilité quant aux contenus',
      absaetze: [
        'En tant que prestataire de services, nous sommes responsables de nos propres contenus sur ces pages conformément au droit général. Nous ne sommes toutefois pas tenus de surveiller les informations de tiers transmises ou stockées, ni de rechercher des circonstances indiquant une activité illicite.',
        'Les obligations de supprimer ou de bloquer l’utilisation d’informations en vertu du droit général demeurent réservées. Une responsabilité à cet égard n’est toutefois possible qu’à partir du moment où nous avons connaissance d’une violation concrète. Dès que nous aurons connaissance d’une telle violation, nous supprimerons sans délai les contenus concernés.',
      ],
    },
    {
      titel: 'Responsabilité quant aux liens',
      absaetze: [
        'Notre site contient des liens vers des sites externes de tiers sur le contenu desquels nous n’avons aucune influence. Nous ne pouvons donc assumer aucune responsabilité pour ces contenus de tiers. Le fournisseur ou l’exploitant respectif des pages liées est toujours responsable de leur contenu. Les pages liées ont été vérifiées quant à d’éventuelles infractions légales au moment de la création des liens.',
        'Un contrôle permanent du contenu des pages liées n’est pas raisonnable sans indice concret d’une violation. Dès que nous aurons connaissance de violations, nous supprimerons sans délai les liens concernés.',
      ],
    },
    {
      titel: 'Droit d’auteur',
      absaetze: [
        'Les contenus et œuvres créés par les exploitants du site sur ces pages sont soumis au droit d’auteur. La reproduction, la modification, la diffusion et toute forme d’exploitation dépassant les limites du droit d’auteur requièrent l’accord écrit de l’auteur ou du créateur concerné. Les téléchargements et copies de ce site ne sont autorisés que pour un usage privé et non commercial.',
        'Dans la mesure où les contenus de ce site n’ont pas été créés par l’exploitant, les droits d’auteur de tiers sont respectés. Si vous deviez néanmoins constater une violation du droit d’auteur, nous vous prions de nous en informer. Dès que nous aurons connaissance de violations, nous supprimerons sans délai les contenus concernés.',
      ],
    },
  ],
};
