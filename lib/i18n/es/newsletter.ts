// TODO übersetzen (Spanisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Newsletter
export const newsletter: Woerterbuch['newsletter'] = {
  meta: {
    titel: 'Newsletter — Offers & New Arrivals',
    beschreibung:
      'Subscribe to The Sartorialist Zurich newsletter and receive our latest offers — unsubscribe at any time.',
    ogTitel: 'Newsletter — The Sartorialist Zurich',
    ogBeschreibung: 'New arrivals, collections and offers delivered straight to your inbox.',
  },
  breadcrumb: 'Newsletter',
  eyebrow: 'Stay informed',
  h1: 'Newsletter',
  lead: 'Subscribe to our newsletter and receive our latest offers, collections and invitations. You can unsubscribe at any time.',
  knopf: 'Subscribe now',
  hinweis: 'Subscribing opens a pre-filled email to {email}.',
  mail: {
    betreff: 'Newsletter subscription',
    text: 'Hello\n\nI would like to subscribe to The Sartorialist newsletter.\n\nName:\nEmail:\n\nKind regards',
  },
};
