import type { Woerterbuch } from '../de';

// Resumen de marcas y textos de interfaz de las páginas de marca y de color de traje
export const brands: Woerterbuch['brands'] = {
  meta: {
    titel: 'Marcas — Nuestras casas de sastrería y tejedurías',
    beschreibung:
      'Las marcas de The Sartorialist Zúrich: Gran Sasso, Berwich, Gimo’s, Woolrich, Orazio Luciano, Maria Santangelo, Loro Piana y Holland & Sherry. Casas familiares, seleccionadas personalmente.',
    ogTitel: 'Marcas — The Sartorialist Zúrich',
    ogBeschreibung: 'Casas familiares, seleccionadas personalmente.',
  },
  breadcrumb: 'Marcas',
  hero: {
    eyebrow: 'Nuestras marcas',
    h1: 'Los verdaderos rostros detrás de las etiquetas',
    lead: 'Trabajamos exclusivamente con empresas familiares que conocemos personalmente. Cada casa está dirigida por maestros de su oficio y cuenta con décadas de tradición.',
  },
  farben: {
    eyebrow: 'A medida',
    titel: 'Trajes por color',
    bildAlt: '{name}: a medida en Zúrich',
  },
  marke: {
    metaTitel: '{name} — {claim}',
    ogTitel: '{name} en The Sartorialist Zúrich',
    bildAlt: '{name} en The Sartorialist Zúrich',
    termin: 'Reservar una cita',
    shopEyebrow: 'En la tienda',
    shopTitel: '{name} en The Sartorialist',
    shopBildAlt: '{titel} — {name}',
    alleImShop: 'Todo {name} en la tienda',
    impressionenEyebrow: 'Impresiones',
    impressionAlt: '{name}: impresión {n}, The Sartorialist Zúrich',
    weitereEyebrow: 'Más marcas',
    weitereTitel: 'Descubra nuestras casas',
    ctaTitel: 'Descubra {name} en persona, en nuestro showroom de Kuttelgasse.',
    ctaText: 'Disfrute de un asesoramiento tranquilo y sin compromiso con un espresso, y déjese inspirar.',
    schemaName: '{name} en Zúrich',
  },
  farbe: {
    breadcrumbMassanzug: 'Traje a medida',
    eyebrow: 'A medida',
    bildAlt: '{name}: a medida por The Sartorialist Zúrich',
    termin: 'Reservar una cita',
    weitereFarben: 'Otros colores',
    ctaTitel: '{name}, a medida, desde CHF 1’690.',
    ctaText: 'Elección del tejido, toma de medidas y asesoramiento en nuestro showroom de Kuttelgasse 7, Zúrich.',
    schemaName: '{name}, a medida en Zúrich',
  },
};
