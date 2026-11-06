// TODO übersetzen (Serbisch (Kyrillisch)) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Services (alterations)
export const services: Woerterbuch['services'] = {
  meta: {
    titel: 'Tailoring Alterations Zurich — Services',
    beschreibung:
      'Alterations at The Sartorialist Zurich: our long-standing partner tailor alters anything that fits under a sewing machine — jackets, coats, trousers and shirts at fair prices.',
    ogTitel: 'Services — The Sartorialist Zurich',
    ogBeschreibung: 'Alterations for jackets, coats, trousers and shirts.',
  },
  breadcrumb: 'Services',
  hero: {
    eyebrow: 'Alterations & adjustments',
    h1: 'Services',
    lead: 'Our long-standing partner alterations tailor can handle anything that fits under a sewing machine — and at sensible prices.',
  },
  leistungen: [
    {
      titel: 'Jacket / coat',
      text: 'Shortening or lengthening sleeves, taking in the waist, correcting the shoulders — after alteration, your jacket or coat fits as if made to measure.',
    },
    {
      titel: 'Trousers',
      text: 'Length, waist, turn-ups or a slimmer leg line — quick, precise adjustments for the perfect silhouette.',
    },
    {
      titel: 'Shirt',
      text: 'Tapering, shortening sleeves, renewing collars or cuffs — so that even your favourite shirt fits impeccably once again.',
    },
  ],
  hinweis: 'Simply bring your garment to our store — or [book an appointment](termin).',
  cta: {
    titel: 'Need an alteration? We will take care of it.',
    text: 'Kuttelgasse 7, 8001 Zurich — Mon–Fri 10 am–7 pm, Sat 10 am–5 pm.',
  },
  schema: {
    name: 'Tailoring alterations Zurich',
    beschreibung:
      'Alterations for jackets, coats, trousers and shirts — the partner alterations tailor of The Sartorialist Zurich.',
  },
};
