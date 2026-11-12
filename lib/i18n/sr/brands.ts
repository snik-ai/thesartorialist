import type { Woerterbuch } from '../de';

// Pregled brendova i UI tekstovi stranica brendova i boja odela (srpski, ćirilica)
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Брендови — наше кројачке куће и ткачнице',
    beschreibung:
      'Брендови The Sartorialist Цирих: Gran Sasso, Berwich, Gimo’s, Woolrich, Orazio Luciano, Maria Santangelo, Loro Piana и Holland & Sherry — породичне куће, лично одабране.',
    ogTitel: 'Брендови — The Sartorialist Цирих',
    ogBeschreibung: 'Породичне куће, лично одабране.',
  },
  breadcrumb: 'Брендови',
  hero: {
    eyebrow: 'Наши брендови',
    h1: 'Права лица иза етикета',
    lead: 'Радимо искључиво са породичним предузећима која лично познајемо. Сваку кућу воде мајстори свог заната, а иза сваке стоје деценије традиције.',
  },
  farben: {
    eyebrow: 'По мери',
    titel: 'Одела по бојама',
    bildAlt: '{name} — по мери у Цириху',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} у The Sartorialist Цирих',
    bildAlt: '{name} у The Sartorialist Цирих',
    termin: 'Закажите термин',
    shopEyebrow: 'У продавници',
    shopTitel: '{name} у The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Све од {name} у продавници',
    impressionenEyebrow: 'Утисци',
    impressionAlt: '{name} — утисак {n}, The Sartorialist Цирих',
    weitereEyebrow: 'Други брендови',
    weitereTitel: 'Откријте наше куће',
    ctaTitel: 'Доживите {name} уживо — у нашем шоуруму у улици Kuttelgasse.',
    ctaText: 'Уз еспресо Вас опуштено и без обавезе саветујемо — и инспиришемо.',
    schemaName: '{name} у Цириху',
  },
  farbe: {
    breadcrumbMassanzug: 'Одело по мери',
    eyebrow: 'По мери',
    bildAlt: '{name} — по мери, The Sartorialist Цирих',
    termin: 'Закажите термин',
    weitereFarben: 'Друге боје',
    ctaTitel: '{name} по мери — од CHF 1’690.',
    ctaText: 'Избор тканине, узимање мера и савет у нашем шоуруму, Kuttelgasse 7, Цирих.',
    schemaName: '{name} по мери у Цириху',
  },
};
