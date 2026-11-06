import type { Woerterbuch } from '../de';

// Newsletter
export const newsletter: Woerterbuch['newsletter'] = {
  meta: {
    titel: 'Newsletter — offres & nouveautés',
    beschreibung:
      'Abonnez-vous à la newsletter de The Sartorialist Zurich et recevez nos dernières offres — désabonnement possible à tout moment.',
    ogTitel: 'Newsletter — The Sartorialist Zurich',
    ogBeschreibung: 'Nouveautés, collections et offres directement dans votre boîte de réception.',
  },
  breadcrumb: 'Newsletter',
  eyebrow: 'Restez informé',
  h1: 'Newsletter',
  lead: 'Abonnez-vous à notre newsletter et recevez nos dernières offres, collections et invitations. Vous pouvez vous désabonner à tout moment.',
  knopf: 'S’abonner maintenant',
  hinweis: 'L’inscription ouvre un e-mail prérempli à l’adresse {email}.',
  mail: {
    betreff: 'Inscription à la newsletter',
    text: 'Bonjour,\n\nJe souhaite m’abonner à la newsletter de The Sartorialist.\n\nNom :\nE-mail :\n\nMeilleures salutations',
  },
};
