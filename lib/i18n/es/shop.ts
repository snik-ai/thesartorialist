import type { Woerterbuch } from '../de';

// Tienda (solo la interfaz — los textos de producto vienen de Shopify y quedan en alemán)
export const shop: Woerterbuch['shop'] = {
  start: {
    meta: {
      titel: 'Tienda — Compre Woolrich, Gran Sasso y Tramarossa online',
      beschreibung:
        'La tienda online de The Sartorialist Zúrich: {n} piezas seleccionadas a mano — parkas Woolrich, prendas de punto Gran Sasso, americanas Tramarossa. Envío a toda Suiza o prueba en nuestro showroom.',
      ogTitel: 'El Vestidor — Tienda The Sartorialist Zúrich',
      ogBeschreibung: 'Pida Woolrich, Gran Sasso y Tramarossa online, o pruébelos en nuestro showroom de la Kuttelgasse 7.',
      ogAlt: 'Tienda The Sartorialist Zúrich',
    },
    sortimentEyebrow: 'La colección',
    alleStuecke: 'Todas las piezas',
    direktZu: 'Ir a',
    direktZuAria: 'Comprar por marca y categoría',
    mass: {
      eyebrow: 'El traje a medida',
      titel: 'Lo que no encuentre aquí, se lo confeccionamos a medida.',
      text: 'Nuestra especialidad es el traje a medida: entretela completa («full canvas»), 100 % hecho en Italia, desde CHF 1’690 y listo para recoger en 20 días laborables. Las piezas de la tienda son sus compañeras.',
      knopf: 'Descubrir el traje a medida',
      termin: 'Reservar una cita',
    },
    faqTitel: 'Preguntas sobre la tienda',
    faq: [
      {
        q: '¿Adónde envía la tienda de The Sartorialist?',
        a: ['Enviamos a toda Suiza. Verá los gastos y plazos de envío en el proceso de compra, antes de realizar su pedido.'],
      },
      {
        q: '¿Puedo probarme las piezas antes de comprarlas?',
        a: [
          'Sí. Todas las piezas de la tienda también están disponibles en nuestro showroom de la {strasse}, en Zúrich. Reserve una cita y le tendremos preparada su talla.',
        ],
      },
      {
        q: '¿Cómo se paga en la tienda?',
        a: ['El pago se realiza a través del proceso de compra seguro de Shopify. Allí se muestran, en el último paso, los medios de pago disponibles.'],
      },
      {
        q: '¿Hay trajes a medida en la tienda?',
        a: [
          'No. Un traje a medida se corta según sus medidas y, por ello, comienza con una cita en nuestro showroom: desde CHF 1’690, entretela completa, 100 % hecho en Italia, listo para recoger en 20 días laborables. En la tienda encontrará las piezas que lo acompañan: prendas de punto, parkas, abrigos y chaquetas.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Zúrich',
    eyebrow: 'Tienda · {gruppe}',
    mehrUeber: 'Más sobre {label}',
    weitereAria: 'Otras secciones de la tienda',
    alleStuecke: 'Todas las piezas',
    ctaTitel: '¿Prefiere probárselo?',
    ctaText: 'Todas las piezas de la tienda también están disponibles en nuestro showroom de la Kuttelgasse 7, junto a los trajes a medida desde CHF 1’690.',
  },
  gruppen: { Marke: 'Marca', Für: 'Para', Kategorie: 'Categoría' },
  seiten: {
    woolrich: {
      h1: 'Comprar parkas y chaquetas Woolrich online',
      title: 'Comprar parkas y chaquetas Woolrich — Tienda Zúrich',
      description:
        'Woolrich en The Sartorialist Zúrich: Arctic Parka, Cloud Parka, Wool Shirt Jackets y abrigos para hombre y mujer. Pida online o pruébelos en nuestro showroom.',
      intro:
        'Desde 1830, Woolrich representa prendas de abrigo pensadas para inviernos de verdad. Aquí encontrará los iconos de la marca —del Arctic Parka relleno de plumón a la Wool Shirt Jacket en lana Melton— para hombre y mujer. Pida online o pruébese su talla en nuestro showroom de la Kuttelgasse 7.',
    },
    'gran-sasso': {
      h1: 'Comprar prendas de punto Gran Sasso online',
      title: 'Comprar jerséis y cachemir Gran Sasso — Tienda Zúrich',
      description:
        'Gran Sasso en The Sartorialist Zúrich: jerséis de merino, prendas de punto de cachemir, jerséis de media cremallera y cárdigans de los Abruzos. Pida online o pruébelos en nuestro showroom.',
      intro:
        'Gran Sasso teje en los Abruzos desde 1952: merino, cachemir y seda, confeccionados en su propia manufactura de Sant’Egidio alla Vibrata. Los jerséis, los modelos de media cremallera y los cárdigans quedan igual de bien bajo una americana que con vaqueros, y son el complemento ideal de su traje a medida.',
    },
    tramarossa: {
      h1: 'Comprar americanas y chinos Tramarossa online',
      title: 'Comprar americanas y chinos Tramarossa — Tienda Zúrich',
      description:
        'Tramarossa en The Sartorialist Zúrich: americanas desenfadadas y chinos en gabardina italiana. Pida online o pruébelos en nuestro showroom.',
      intro:
        'Tramarossa, del Véneto, une la sastrería italiana con una actitud relajada: americanas desestructuradas y chinos en suave gabardina que funcionan tanto en el día a día como en la oficina. Todo se combina: americana y chinos del mismo color forman un traje desenfadado.',
    },
    herren: {
      label: 'Hombre',
      h1: 'Comprar moda masculina online',
      title: 'Comprar moda masculina online — Parkas, punto y americanas',
      description:
        'Moda masculina italiana en la tienda de The Sartorialist Zúrich: parkas Woolrich, prendas de punto Gran Sasso y americanas Tramarossa. Envío a toda Suiza.',
      intro:
        'Moda masculina seleccionada a mano para acompañar el traje a medida: parkas y abrigos para el invierno, prendas de punto en merino y cachemir, americanas y chinos desenfadados. Todo lo que tenemos en nuestro showroom de la Kuttelgasse puede pedirse aquí directamente, con envío a toda Suiza.',
    },
    damen: {
      label: 'Mujer',
      h1: 'Comprar parkas y abrigos de mujer online',
      title: 'Comprar parkas y abrigos de mujer — Tienda Zúrich',
      description:
        'Parkas y abrigos de mujer de Woolrich en The Sartorialist Zúrich: Arctic Parka, Kelly Parka y Madison Coat. Pida online, envío a toda Suiza.',
      intro:
        'Para mujer ofrecemos las chaquetas de invierno de Woolrich: el clásico Arctic Parka, el largo Kelly Parka y el Madison Coat; cálidos, repelentes al agua y de corte atemporal. También tendremos el placer de mostrarle los modelos en nuestro showroom de Zúrich.',
    },
    parkas: {
      label: 'Parkas',
      h1: 'Comprar parkas online',
      title: 'Comprar una parka — Woolrich Arctic y Cloud Parka',
      description:
        'Parkas para hombre y mujer en The Sartorialist Zúrich: Woolrich Arctic Parka, Cloud Parka, Polar y Ramar. Con relleno de plumón y repelentes al agua.',
      intro:
        'Una buena parka resiste el invierno suizo y queda tan bien sobre un traje como con vaqueros. Nuestras parkas Woolrich llevan relleno de plumón, son repelentes al agua y tienen capucha desmontable: del corto Cloud Parka al largo Arctic Parka.',
    },
    maentel: {
      label: 'Abrigos',
      h1: 'Comprar abrigos online',
      title: 'Comprar un abrigo — Abrigos de lana para hombre y mujer',
      description:
        'Abrigos en The Sartorialist Zúrich: abrigos de lana y sobretodos de Woolrich para hombre y mujer, elegantes sobre el traje y cálidos en invierno.',
      intro:
        'El abrigo es lo primero que se ve de su traje. Nuestros abrigos de lana y de tejidos técnicos son lo bastante largos para cubrir la americana y lo bastante sobrios para cualquier ocasión.',
    },
    strick: {
      label: 'Punto',
      h1: 'Comprar jerséis y prendas de punto online',
      title: 'Comprar jerséis y cachemir — Punto de Italia',
      description:
        'Jerséis, modelos de media cremallera y cárdigans en merino y cachemir en The Sartorialist Zúrich, confeccionados por Gran Sasso en Italia.',
      intro:
        'Punto de Italia que nunca abulta bajo la americana: finos cuellos altos de merino, jerséis de media cremallera, jerséis de cachemir y cárdigans. Las calidades más ligeras se llevan todo el año; las más gruesas sustituyen a la americana en otoño.',
    },
    jacken: {
      label: 'Chaquetas y sobrecamisas',
      h1: 'Comprar chaquetas y sobrecamisas online',
      title: 'Comprar chaquetas y sobrecamisas — Woolrich Wool Shirt Jacket',
      description:
        'Chaquetas y sobrecamisas en The Sartorialist Zúrich: Wool Shirt Jackets de Woolrich, sobrecamisas técnicas y chaquetas cortas para hombre y mujer.',
      intro:
        'Entre la camisa y el abrigo: sobrecamisas de lana y chaquetas cortas para las entretemporadas. La Wool Shirt Jacket de Woolrich es un clásico desde hace décadas: robusta, cálida y tejida en lana Melton.',
    },
    'sakkos-hosen': {
      label: 'Americanas y pantalones',
      h1: 'Comprar americanas y pantalones online',
      title: 'Comprar americanas y chinos — Moda masculina italiana',
      description:
        'Americanas y chinos en The Sartorialist Zúrich: americanas desestructuradas y chinos en gabardina italiana. Para un traje a medida: reserve una cita en nuestro showroom.',
      intro:
        'Americanas y pantalones de confección, pero con mano italiana: desestructurados, suaves y cómodos. Si busca un traje que le siente de verdad, reserve con nosotros una cita para un traje a medida: desde CHF 1’690, listo en 20 días laborables.',
    },
  },
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} de {marke} en The Sartorialist Zúrich, {preis}. Pida online o pruébeselo en nuestro showroom de Zúrich.',
    versand: 'Envío a toda Suiza, gastos indicados en el proceso de compra',
    anprobe: 'Pruebas en nuestro showroom: {strasse}, Zúrich',
    beratung: 'Asesoramiento personal:',
    beschreibung: 'Descripción',
    alleKategorie: 'Ver todo: {label}',
    massDazu: 'Un traje a medida a juego',
    passtEyebrow: 'Combina bien con',
    mehrTitel: 'Más del vestidor',
    ctaEyebrow: 'Asesoramiento en tienda',
    ctaTitel: '¿Prefiere probárselo? Se lo tendremos preparado.',
    ctaText: 'Reserve una cita o solicite que le llamemos: le asesoraremos sobre la talla, las combinaciones y el traje a medida adecuado.',
    groesse: 'Talla {groesse}',
  },
  werte: {
    // Kategorien (Gruppe → Art → Modell)
    'Jacken & Mäntel': 'Chaquetas y abrigos',
    Strick: 'Punto',
    'Sakkos & Hosen': 'Americanas y pantalones',
    Parkas: 'Parkas',
    Mäntel: 'Abrigos',
    Overshirts: 'Sobrecamisas',
    Jacken: 'Chaquetas',
    Chinos: 'Chinos',
    Sakkos: 'Americanas',
    Polos: 'Polos',
    Strickjacken: 'Cárdigans',
    Troyer: 'Media cremallera',
    Rundhals: 'Cuello redondo',
    Stehkragen: 'Cuello perkins',
    Pullover: 'Jerséis',
    Wollmantel: 'Abrigo de lana',
    Technisch: 'Técnico',
    Zweireiher: 'Cruzado',
    Einreiher: 'De una fila',
    Wolle: 'Lana',
    // Farben
    Schwarz: 'Negro',
    Rot: 'Rojo',
    Beige: 'Beige',
    Braun: 'Marrón',
    Grün: 'Verde',
    Grau: 'Gris',
    Blau: 'Azul',
    // Für
    Herren: 'Hombre',
    Damen: 'Mujer',
  },
  groessenSysteme: { int: 'Internacional', it: 'Italiana (americanas, punto)', w: 'Cintura (pantalones)' },
  grid: {
    facetten: {
      group: 'Categoría',
      sub: 'Tipo',
      type: 'Modelo',
      brand: 'Marca',
      size: 'Talla',
      color: 'Color',
      price: 'Precio',
      gender: 'Para',
    },
    sort: {
      neu: 'Novedades primero',
      'preis-auf': 'Precio: de menor a mayor',
      'preis-ab': 'Precio: de mayor a menor',
      marke: 'Marca A–Z',
    },
    anzahlEins: '{n} pieza',
    anzahlMehr: '{n} piezas',
    zeigen: 'Mostrar {anzahl}',
    groesseAria: 'Talla {groesse}, {anzahl}',
    nurAnLager: 'Solo tallas disponibles.',
    markenSuchen: 'Buscar entre {n} marcas',
    markenSuchenAria: 'Buscar marcas',
    alle: 'Todo',
    alleName: 'Todo: {name}',
    kategorienAria: 'Categorías',
    sortiment: 'Colección',
    nachArtAria: '{name} por tipo',
    nachModellAria: '{name} por modelo',
    alleFilter: 'Todos los filtros',
    filter: 'Filtrar',
    nachFiltern: 'Filtrar por {label}',
    zuruecksetzen: 'Restablecer',
    ansicht: 'Vista',
    kompakt: 'Más piezas por fila',
    gross: 'Imágenes más grandes',
    sortieren: 'Ordenar',
    filterEntfernen: 'Quitar filtro {label}',
    alleZuruecksetzen: 'Restablecer todo',
    leer: 'En este momento no tenemos existencias para esta combinación.',
    alleFilterZuruecksetzen: 'Restablecer todos los filtros',
    sheetTitel: 'Filtrar y ordenar',
    filterSchliessen: 'Cerrar filtros',
  },
  preis: {
    bis: 'hasta CHF 300',
    mitte: 'CHF 300–700',
    ab: 'desde CHF 700',
    min: 'Mín.',
    max: 'Máx.',
    minAria: 'Precio mínimo',
    maxAria: 'Precio máximo',
    minFeldAria: 'Precio mínimo en CHF',
    maxFeldAria: 'Precio máximo en CHF',
    imBereichEins: '{n} pieza en este rango',
    imBereichMehr: '{n} piezas en este rango',
  },
  karte: {
    ausverkauft: 'Agotado',
    sale: 'Rebajas',
  },
  buybox: {
    groesseWaehlen: 'Elegir talla',
    groesseHinweis: ' — elija primero una talla, por favor',
    groesseAria: 'Talla',
    ausverkauft: 'Agotado',
    busy: 'Añadiendo …',
    fertig: 'En su cesta ✓',
    hinzufuegen: 'Añadir a la cesta',
    fehler: 'Se ha producido un error. Inténtelo de nuevo o llámenos.',
    anprobieren: 'Pruébeselo en nuestro showroom',
  },
  galerie: {
    ansicht: '{titel} — vista {n}',
    bilderAria: 'Imágenes',
    bild: 'Imagen {n}',
  },
  schrank: {
    eyebrow: 'Tienda · The Sartorialist Zúrich',
    h1: 'El Vestidor',
    text: '{n} piezas seleccionadas a mano de Woolrich, Gran Sasso y Tramarossa: pida online o pruébelas en nuestro showroom.',
    rolle: 'Carrusel',
    aria: 'El Vestidor — piezas seleccionadas a mano',
    zurueck: 'Pieza anterior',
    weiter: 'Pieza siguiente',
    ansehen: 'Ver →',
    alleArtikel: 'Los {n} artículos',
  },
};
