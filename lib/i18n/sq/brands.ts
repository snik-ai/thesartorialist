import type { Woerterbuch } from '../de';

// Përmbledhja e markave plus tekstet e faqeve të markave dhe të ngjyrave të kostumeve
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Markat — Shtëpitë tona të rrobaqepësisë dhe fabrikat e endjes',
    beschreibung:
      'Markat e The Sartorialist Cyrih: Orazio Luciano, Maria Santangelo, Loro Piana, Holland & Sherry, Gran Sasso dhe Woolrich — shtëpi familjare, të përzgjedhura personalisht.',
    ogTitel: 'Markat — The Sartorialist Cyrih',
    ogBeschreibung: 'Shtëpi familjare, të përzgjedhura personalisht.',
  },
  breadcrumb: 'Markat',
  hero: {
    eyebrow: 'Markat tona',
    h1: 'Fytyrat e vërteta pas etiketave',
    lead: 'Punojmë vetëm me ndërmarrje familjare që i njohim personalisht. Çdo shtëpi drejtohet nga mjeshtër të zanatit të tyre dhe mbart dekada tradite.',
  },
  farben: {
    eyebrow: 'Me porosi',
    titel: 'Kostume sipas ngjyrës',
    bildAlt: '{name} — me porosi në Cyrih',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} te The Sartorialist Cyrih',
    bildAlt: '{name} te The Sartorialist Cyrih',
    termin: 'Rezervoni një takim',
    shopEyebrow: 'Në shop',
    shopTitel: '{name} te The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Të gjitha {name} në shop',
    impressionenEyebrow: 'Përshtypje',
    impressionAlt: '{name} — përshtypje {n}, The Sartorialist Cyrih',
    weitereEyebrow: 'Marka të tjera',
    weitereTitel: 'Zbuloni shtëpitë tona',
    ctaTitel: 'Përjetojeni {name} personalisht — në showroom-in tonë në Kuttelgasse.',
    ctaText: 'Shijoni një këshillim të qetë e pa detyrim, me një espresso — dhe frymëzohuni.',
    schemaName: '{name} në Cyrih',
  },
  farbe: {
    breadcrumbMassanzug: 'Kostum me porosi',
    eyebrow: 'Me porosi',
    bildAlt: '{name} — me porosi nga The Sartorialist Cyrih',
    termin: 'Rezervoni një takim',
    weitereFarben: 'Ngjyra të tjera',
    ctaTitel: '{name}, me porosi — nga CHF 1’690.',
    ctaText: 'Zgjedhja e stofit, marrja e masave dhe këshillimi në showroom-in tonë në Kuttelgasse 7, Cyrih.',
    schemaName: '{name}, me porosi në Cyrih',
  },
};
