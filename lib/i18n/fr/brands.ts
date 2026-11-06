import type { Woerterbuch } from '../de';

// Aperçu des marques et textes d’interface des pages marques et couleurs de costume
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Marques — nos maisons de tailleurs & tissages',
    beschreibung:
      'Les marques de The Sartorialist Zurich : Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso et Woolrich — des maisons familiales, choisies personnellement.',
    ogTitel: 'Marques — The Sartorialist Zurich',
    ogBeschreibung: 'Des maisons familiales, choisies personnellement.',
  },
  breadcrumb: 'Marques',
  hero: {
    eyebrow: 'Nos marques',
    h1: 'Les vrais visages derrière les labels',
    lead: 'Nous travaillons exclusivement avec des entreprises familiales que nous connaissons personnellement. Chaque maison est dirigée par des maîtres de leur art et peut s’appuyer sur des décennies de tradition.',
  },
  farben: {
    eyebrow: 'Sur mesure',
    titel: 'Costumes par couleur',
    bildAlt: '{name} — sur mesure à Zurich',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} chez The Sartorialist Zurich',
    bildAlt: '{name} chez The Sartorialist Zurich',
    termin: 'Prendre rendez-vous',
    shopEyebrow: 'Dans la boutique',
    shopTitel: '{name} chez The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Tout {name} dans la boutique',
    impressionenEyebrow: 'Impressions',
    impressionAlt: '{name} — impression {n}, The Sartorialist Zurich',
    weitereEyebrow: 'Autres marques',
    weitereTitel: 'Découvrez nos maisons',
    ctaTitel: 'Découvrez {name} en personne — dans notre showroom de la Kuttelgasse.',
    ctaText: 'Profitez d’un conseil détendu et sans engagement autour d’un espresso — et laissez-vous inspirer.',
    schemaName: '{name} à Zurich',
  },
  farbe: {
    breadcrumbMassanzug: 'Costume sur mesure',
    eyebrow: 'Sur mesure',
    bildAlt: '{name} — sur mesure par The Sartorialist Zurich',
    termin: 'Prendre rendez-vous',
    weitereFarben: 'Autres couleurs',
    ctaTitel: '{name} sur mesure — à partir de CHF 1’690.',
    ctaText: 'Choix du tissu, prise de mesures et conseil dans notre showroom, Kuttelgasse 7, Zurich.',
    schemaName: '{name} sur mesure à Zurich',
  },
};
