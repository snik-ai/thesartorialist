// TODO übersetzen (Albanisch) — noch Kopie der englischen Fassung.
import type { Woerterbuch } from '../de';

// Brands overview plus UI texts of the brand pages and suit colour pages
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Brands — Our Tailoring Houses & Mills',
    beschreibung:
      'The brands of The Sartorialist Zurich: Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso and Woolrich — family-run houses, personally selected.',
    ogTitel: 'Brands — The Sartorialist Zurich',
    ogBeschreibung: 'Family-run houses, personally selected.',
  },
  breadcrumb: 'Brands',
  hero: {
    eyebrow: 'Our brands',
    h1: 'The real faces behind the labels',
    lead: 'We work exclusively with family-run businesses that we know personally. Every house is led by masters of their craft and looks back on decades of tradition.',
  },
  farben: {
    eyebrow: 'Made to measure',
    titel: 'Suits by colour',
    bildAlt: '{name} — made to measure in Zurich',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} at The Sartorialist Zurich',
    bildAlt: '{name} at The Sartorialist Zurich',
    termin: 'Book an appointment',
    shopEyebrow: 'In the shop',
    shopTitel: '{name} at The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'All {name} in the shop',
    impressionenEyebrow: 'Impressions',
    impressionAlt: '{name} — impression {n}, The Sartorialist Zurich',
    weitereEyebrow: 'More brands',
    weitereTitel: 'Discover our houses',
    ctaTitel: 'Experience {name} in person — at our Kuttelgasse showroom.',
    ctaText: 'Enjoy relaxed, no-obligation advice over an espresso — and be inspired.',
    schemaName: '{name} in Zurich',
  },
  farbe: {
    breadcrumbMassanzug: 'Made-to-measure suit',
    eyebrow: 'Made to measure',
    bildAlt: '{name} — made to measure by The Sartorialist Zurich',
    termin: 'Book an appointment',
    weitereFarben: 'Other colours',
    ctaTitel: '{name}, made to measure — from CHF 1’690.',
    ctaText: 'Choice of cloth, measuring and advice in our showroom at Kuttelgasse 7, Zurich.',
    schemaName: '{name}, made to measure in Zurich',
  },
};
