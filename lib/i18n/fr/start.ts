// TODO übersetzen (Französisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Home page
export const start: Woerterbuch['start'] = {
  meta: {
    titel: 'Made-to-Measure Suits & Wedding Suits Zurich — The Sartorialist',
    beschreibung:
      'Exclusive made-to-measure suits and wedding suits in Zurich: full-canvas construction, 100% made in Italy, from CHF 1’690 — ready for collection in 20 working days. Book an appointment.',
    ogTitel: 'Made-to-Measure Suits & Wedding Suits Zurich — The Sartorialist',
    ogBeschreibung: 'Exclusive made-to-measure and wedding suits in Zurich: full canvas, made in Italy, from CHF 1’690.',
  },
  hero: {
    h1: 'Made-to-measure suits & wedding suits in Zurich',
    zitat: '“Fashion fades. ',
    zitatAkzent: 'Style is eternal.',
    zitatEnde: '”',
    lead: 'Made-to-measure suits and exclusive Italian menswear — full-canvas construction, 100 % made in Italy, from CHF 1’690. Ready for collection in 20 working days.',
    termin: 'Book an appointment',
    gestalten: 'Design your suit',
  },
  stoffpartnerAria: 'Our cloth merchants and mills',
  usps: [
    { titel: 'Full canvas', text: 'Only the finest construction' },
    { titel: 'Made in Italy', text: '100 % Italian workshops' },
    { titel: 'From CHF 1’690', text: 'Fair, transparent prices' },
    { titel: '20 working days', text: 'The fastest delivery in Switzerland' },
  ],
  styles: {
    eyebrow: 'Styles & Options',
    titel: 'Design your made-to-measure suit — detail by detail.',
    lead: 'Buttons, lapels, pockets, shoulders, lining: choose what you like, all on one page. There is no need to decide everything — we discuss the rest in the atelier, where we take your measurements and select the cloth with you.',
    knopf: 'Design your suit',
    hinweis: '118 options for jacket, trousers, waistcoat and dinner suit',
  },
  haus: {
    bildAlt: 'Alexander Shubin, founder of The Sartorialist Zurich, with tailoring shears',
    eyebrow: 'The house',
    titel: 'From the Tom Ford store in Zurich to a personal gentlemen’s outfitter',
    absaetze: [
      'I am {gruender}, founder of “The Sartorialist” in Zurich — a clothier with passion, experience and close ties to traditional Italian textile houses. As long-standing managing director of Europe’s first Tom Ford store, here in Zurich, I have devoted myself to the finest menswear.',
      'Every house I have chosen is run by masters of their craft and looks back on decades of tradition. With me, you meet the real people behind the brands — which is why my prices are fair.',
    ],
    liste: [
      'Personal advice from the first idea to the finished suit',
      'An exclusive selection of cloths from Italian & English mills',
      'Personal service around the clock — without waiting times',
    ],
    mehr: 'More about us',
  },
  hochzeit: {
    eyebrow: 'Weddings',
    titel: 'The perfect wedding suit for your big day',
    absaetze: [
      'Every wedding is different — and your suit should be just as individual. From the choice of cloth and the cut to the accessories, we guide you to your own wedding suit: a classic three-piece, a modern slim fit, linen for summer, a dinner suit for black tie or a vintage look in tweed.',
      'If you wish, we embroider your bride’s name, a motto or your wedding date into the lining — a one-off that will never exist twice.',
    ],
    knopf: 'Wedding suits Zurich',
    bildAlt: 'Groom in a made-to-measure wedding suit by The Sartorialist Zurich',
  },
  brands: { eyebrow: 'Our brands', titel: 'Family-run houses, personally chosen' },
  faqTitel: 'All about made-to-measure and wedding suits in Zurich',
  faq: [
    {
      q: 'How does a consultation at The Sartorialist work?',
      a: [
        'Once you book an appointment in Zurich, we take at least 60 to 90 minutes for you. The process: a personal conversation, choosing from the finest Italian cloths, advice on the cut, precise measuring with more than 30 parameters, design decisions (collar, pockets, buttons, lining, initials) and, two to three weeks later, a fitting with final adjustments in the atelier.',
        'No prior knowledge is needed — we meet you exactly where you are. No rush, no pressure, just honest advice with substance.',
      ],
    },
    {
      q: 'How much does a made-to-measure suit cost at The Sartorialist in Zurich?',
      a: [
        'Our made-to-measure suits start from CHF 1’690 — the final price depends on your choice of cloth and design. With a particularly fine cloth from Loro Piana or Scabal, a luxurious lining or a hand-finished waistcoat, your suit may cost up to around CHF 2’500.',
        'We deliver quality without compromise: Italian weaving, individual design, genuine made-to-measure tailoring — and a level of service you would otherwise only find in London or Florence.',
      ],
    },
    {
      q: 'How long does it take to make?',
      a: [
        'Your suit is usually ready for collection within 20 working days — the fastest delivery time in Switzerland. For wedding suits, we recommend booking your appointment at least 8 to 10 weeks before the wedding, leaving ample time for choosing the cloth, measuring, fitting and fine-tuning.',
      ],
    },
    {
      q: 'What does full-canvas construction mean?',
      a: [
        'In full-canvas construction, the canvas interlining is stitched rather than glued — along its entire length, from the collar to the hem. As a result, the jacket moulds itself to your body as you wear it, breathes and lasts considerably longer.',
        'All our suits are made exclusively in full-canvas quality — the finest construction, and you feel it every time you wear it.',
      ],
    },
    {
      q: 'Which cloths does The Sartorialist work with?',
      a: [
        'We work exclusively with fine cloths from renowned mills such as Loro Piana, Vitale Barberis Canonico, Drago, Reda, Cerruti, Scabal, Solbiati and Holland & Sherry — a choice of more than 1’000 suitings and more than 400 shirtings.',
      ],
    },
    {
      q: 'Can I also have a made-to-measure shirt made?',
      a: [
        'Absolutely — a made-to-measure shirt is the natural companion to a made-to-measure suit. It fits perfectly, never chafes and looks impeccable even without a jacket. Choose from more than 400 shirtings — from classic poplin to Sea Island cotton, by houses such as Canclini, Albini and Thomas Mason.',
      ],
    },
    {
      q: 'Do you also make suits for best men or wedding guests?',
      a: [
        'Yes — we dress not only the groom but also best men, fathers and other wedding guests. Whether a uniform look or individual styles: we create elegant, coordinated outfits without outshining the groom.',
      ],
    },
    {
      q: 'What makes The Sartorialist in Zurich special?',
      a: [
        'Uncompromising quality, genuine handwork and personal advice with character: exclusive Italian cloths, many years of experience in leading positions at Tom Ford and Prada, a personal atelier in the heart of Zurich — and fair, transparent prices.',
        'Our clients are not looking for the cheapest suit, but for the right one.',
      ],
    },
  ],
  film: {
    bildAlt: 'A clock as a symbol of timeless style — from the film by The Sartorialist Zurich',
    hintergrund: 'Background film, The Sartorialist',
    ansehen: 'Watch the film',
    dialog: 'Film “Create your own Style!”',
    schliessen: 'Close film',
  },
  video: {
    name: 'Create your own Style! — The Sartorialist Zurich',
    beschreibung: 'Made-to-measure suits with Italian elegance from The Sartorialist atelier in Zurich.',
  },
};
