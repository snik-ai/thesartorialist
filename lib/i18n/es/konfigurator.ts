import type { Woerterbuch } from '../de';

// Configurador de trajes a medida «Estilos y opciones»
export const konfigurator: Woerterbuch['konfigurator'] = {
  meta: {
    titel: 'Estilos y opciones — Configurador de trajes a medida',
    beschreibung:
      'Diseñe su propio traje a medida: {anzahl} estilos y opciones para americana, pantalón, chaleco y esmoquin (solapas, botones, bolsillos, forro). Guarde su selección en PDF y encargue su traje a medida en Zúrich.',
    ogTitel: 'Diseñe su traje a medida — Estilos y opciones, The Sartorialist Zúrich',
    ogBeschreibung:
      'Elija en línea las solapas, los bolsillos, los botones y el forro de su traje a medida, y traiga su selección a la cita en el atelier.',
  },
  breadcrumb: { massanzug: 'Traje a medida', seite: 'Estilos y opciones' },
  hero: {
    eyebrow: 'Estilos y opciones · Configurador de estilo',
    h1: 'Su traje a medida empieza aquí.',
    lead: 'Su estilo. Sus medidas. Su traje. Explore solapas, botones, bolsillos y detalles de acabado, y componga con calma lo que le favorece, donde y cuando quiera. Traiga su selección a la cita en el atelier: allí le tomamos las medidas, elegimos el tejido con usted y perfeccionamos cada detalle hasta que el traje se ajuste no solo a su cuerpo, sino también a su carácter.',
    hinweise: ['Toque lo que le guste', 'No es necesario elegirlo todo', 'Resumen abajo: en PDF o directamente con su cita'],
  },
  sogehts: {
    titel: 'Diseñe su propio traje a medida: así de sencillo',
    absaetze: [
      'Un traje a medida es la suma de muchas pequeñas decisiones. Aquí puede tomar las primeras con calma: de una fila o cruzado, solapa de muesca o de pico, bolsillos de vivo o con cartera, hombro napolitano suave o clásico, con forro o sin forro. Cada opción está ilustrada, para que vea exactamente qué cambia.',
      'Elija solo lo que le importe. Su selección aparece en el resumen de abajo, puede guardarse en PDF y nos llega directamente con su solicitud de cita.',
    ],
  },
  zuerich: {
    titel: 'Su traje a medida en Zúrich',
    text: 'En nuestro atelier de Kuttelgasse 7 le tomamos las medidas, le mostramos tejidos de Loro Piana, Vitale Barberis Canonico, Holland & Sherry y otras tejedurías, y perfeccionamos cada detalle con usted. Cada traje a medida lleva entretela completa, está 100 % hecho en Italia y cuesta desde CHF 1’690; listo para recoger en 20 días laborables.',
    linkMassanzug: 'Más sobre los trajes a medida en Zúrich',
    linkHochzeit: 'Trajes de boda a medida',
  },
  faqTitel: 'Preguntas sobre el configurador de trajes',
  faq: [
    {
      q: '¿Puedo diseñar mi traje a medida en línea?',
      a: [
        'Sí. En «Estilos y opciones» elige en línea los detalles de su traje a medida: abotonadura, solapas, bolsillos, hombro, forro, pretina y mucho más. La toma de medidas y la elección del tejido se realizan después en persona en nuestro atelier de Zúrich, para que el traje siente de verdad.',
      ],
    },
    {
      q: '¿Para qué sirve el configurador de trajes?',
      a: [
        'El configurador le permite tomar las primeras decisiones de estilo con calma, desde casa: solapas, botones, bolsillos, hombro, forro, pretina y bajo. Traiga su selección a la cita: en el atelier le tomamos las medidas, elegimos el tejido y perfeccionamos juntos cada detalle.',
      ],
    },
    {
      q: '¿Tengo que elegir cada detalle?',
      a: [
        'No. Elija solo lo que le importe. Lo que quede abierto lo hablamos en la cita, y le aconsejamos con sinceridad sobre lo que favorece a su figura y a la ocasión.',
      ],
    },
    {
      q: '¿Dónde se guarda mi selección?',
      a: [
        'Solo en su navegador, en este dispositivo. La recibimos únicamente cuando solicita una cita con su selección o nos la envía en PDF o como texto.',
      ],
    },
    {
      q: '¿Cuánto cuesta un traje a medida con estos detalles?',
      a: [
        'Nuestros trajes a medida cuestan desde CHF 1’690. El precio final depende sobre todo del tejido y suele llegar hasta unos CHF 2’500. Cada traje lleva entretela completa, está 100 % hecho en Italia y está listo para recoger en 20 días laborables.',
      ],
    },
  ],
  cta: {
    titel: '¿Selección completa? Ahora, la toma de medidas.',
    text: 'Traiga su selección de estilo a una consulta gratuita en Kuttelgasse 7, o le llamamos y lo hablamos todo por teléfono.',
  },
  schema: {
    name: 'Configurador de trajes a medida',
    beschreibung:
      'Selección de estilo en línea para trajes a medida: americana, pantalón, chaleco y esmoquin; selección en PDF y para su cita en el atelier de Zúrich.',
  },
  ui: {
    kategorienAria: 'Categorías',
    gewaehltAria: '{n} seleccionados',
    stoff: 'Tejido',
    meineAuswahl: 'Mi selección',
    brustSeite: 'Pecho · Lateral',
    detailsZu: 'Detalles de {label}',
    stoffSub: 'La colección de tejidos de Holland & Sherry',
    stoffText:
      'Desde 1836, Holland & Sherry teje paños para los mejores sastres del mundo. Explore la colección y anote los números de sus favoritos: tendremos las muestras preparadas para su cita en el atelier.',
    stoffBildAlt: 'Tejidos de Holland & Sherry',
    stoffAnsehen: 'Ver la colección de tejidos',
    neuesFenster: 'Se abre en una ventana nueva',
    stoffKicker: 'Número de tejido (opcional)',
    stoffPlatzhalter: 'p. ej. 9722022',
    stoffAria: 'Número de tejido',
    hinzufuegen: 'Añadir',
    stoffHinweis:
      'Encontrará el número en la página del tejido, en «Product Code». Puede indicar varios números, o simplemente elegir el tejido en el atelier.',
    stoffEntfernen: 'Eliminar tejido {n}',
    uebersicht: 'Resumen',
    summaryTitelEins: 'Su traje a medida en {n} detalle',
    summaryTitelMehr: 'Su traje a medida en {n} detalles',
    summaryText: 'Guardado en este navegador. Le tomamos las medidas juntos en el atelier, donde perfeccionamos cada detalle.',
    reset: 'Restablecer todo',
    stoffGruppe: 'Tejido · Holland & Sherry',
    stoffnummer: 'Número de tejido',
    leerTitel: 'Todavía no ha seleccionado nada.',
    leerText: 'Toque arriba solapas, bolsillos, botones y forro: su selección aparecerá aquí.',
    leerKnopf: 'Empezar por la americana',
    entfernen: 'Eliminar {label}',
    terminKnopf: 'Reservar una cita con esta selección',
    pdfKnopf: 'Descargar PDF',
    pdfLaeuft: 'Creando PDF …',
    pdfFertig: 'PDF descargado',
    pdfFehler: 'No se ha podido crear el PDF',
    dockLeer: 'Su resumen',
    dockEins: '{n} detalle seleccionado',
    dockMehr: '{n} detalles seleccionados',
    dockText: 'No es necesario elegirlo todo: el resto lo hablamos en el atelier.',
    dockGo: 'Al resumen',
    schliessen: 'Cerrar',
    code: 'Código {code}',
    brusttasche: 'Bolsillo de pecho:',
    seitentaschen: 'Bolsillos laterales:',
    abwaehlen: 'Quitar de la selección',
    waehlen: 'Elegir este detalle',
    auswahl: {
      taschen: 'Pecho {brust}, laterales {seite}',
      stoffKopf: 'TEJIDO (HOLLAND & SHERRY)',
      stoffnummer: 'Número de tejido',
      stoffnummern: 'Números de tejido',
    },
  },
  pdf: {
    dateiname: 'The-Sartorialist-Seleccion-de-estilo.pdf',
    locale: 'es-ES',
    dokTitel: 'Selección de estilo, traje a medida — The Sartorialist Zúrich',
    dokThema: 'Traje a medida: estilos y opciones',
    ort: 'ZÚRICH',
    kopfFolge: 'Selección de estilo · {datum}',
    titel: 'Mi selección de estilo',
    untertitel: 'para el traje a medida: estilos y opciones',
    detailEins: '{n} detalle',
    detailMehr: '{n} detalles',
    stoffEins: '{n} tejido',
    stoffMehr: '{n} tejidos',
    stoffAbschnitt: 'Tejido · Holland & Sherry',
    stoffnummerKopf: 'NÚMERO DE TEJIDO',
    stoffnummernKopf: 'NÚMEROS DE TEJIDO',
    notizen: 'Notas para el atelier',
    fussHinweis: 'Le tomamos las medidas en el atelier: traiga esta selección a su cita.',
    seite: 'Página {p} de {n}',
  },
};
