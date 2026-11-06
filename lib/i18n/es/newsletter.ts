import type { Woerterbuch } from '../de';

// Newsletter
export const newsletter: Woerterbuch['newsletter'] = {
  meta: {
    titel: 'Newsletter — Ofertas y novedades',
    beschreibung:
      'Suscríbase a la newsletter de The Sartorialist Zúrich y reciba nuestras últimas ofertas; puede darse de baja en cualquier momento.',
    ogTitel: 'Newsletter — The Sartorialist Zúrich',
    ogBeschreibung: 'Novedades, colecciones y ofertas directamente en su bandeja de entrada.',
  },
  breadcrumb: 'Newsletter',
  eyebrow: 'Manténgase informado',
  h1: 'Newsletter',
  lead: 'Suscríbase a nuestra newsletter y reciba nuestras últimas ofertas, colecciones e invitaciones. Puede darse de baja en cualquier momento.',
  knopf: 'Suscribirse ahora',
  hinweis: 'Al suscribirse se abre un correo electrónico ya redactado a {email}.',
  mail: {
    betreff: 'Suscripción a la newsletter',
    text: 'Buenos días:\n\nMe gustaría suscribirme a la newsletter de The Sartorialist.\n\nNombre:\nCorreo electrónico:\n\nUn cordial saludo',
  },
};
