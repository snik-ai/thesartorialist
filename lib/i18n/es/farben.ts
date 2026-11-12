import type { Woerterbuch } from '../de';

// Páginas de colores de traje — capa en español sobre lib/suitColors.ts (secciones: mismo número y orden).
export const farben: Woerterbuch['farben'] = {
  'anzug-blau': {
    name: 'Traje azul',
    title: 'Traje azul — Elegancia a medida en Zúrich',
    claim: 'La elegancia clásica, redefinida',
    metaDescription:
      'Traje azul a medida en Zúrich: del azul cielo al azul marino, confeccionado por The Sartorialist. Reserve ahora su cita.',
    sections: [
      {
        title: 'La elegancia clásica, redefinida',
        text: 'El traje azul es uno de los clásicos atemporales de la moda masculina y una alternativa elegante al negro y al gris. En sus múltiples tonalidades —del azul cielo claro al azul marino profundo— un traje azul resulta apropiado para casi cualquier ocasión, ya sea en el trabajo o en actos sociales. Une la elegancia clásica con un toque moderno.',
      },
      {
        title: 'Por qué elegir un traje azul',
        text: 'Un traje azul es extraordinariamente versátil y le confiere una imagen segura y cuidada. El azul transmite calma y profesionalidad y, a la vez, aporta frescura y energía a su vestuario. Ideal para la oficina, las reuniones de negocios o las ocasiones especiales, y fácil de combinar tanto con accesorios clásicos como contemporáneos.',
      },
      {
        title: 'Excelencia a medida',
        text: 'Con nosotros, su traje azul se confecciona de forma individual: con un ajuste perfecto y adaptado a su estilo personal. Nuestro experimentado equipo le ayuda a elegir el tono de azul ideal, el tejido adecuado y el corte perfecto.',
      },
      {
        title: 'Tejidos y acabados',
        text: 'Empleamos tejidos nobles, reconocidos por su durabilidad y su comodidad: desde la lana más lujosa y el lino fino hasta el noble cachemir. La elección del tejido define no solo el aspecto, sino también la comodidad de su traje.',
      },
      {
        title: 'Diseño individual',
        text: 'Diseñe su traje azul exactamente como lo imagina: tejidos, cortes y detalles a su elección. Una pieza única que subraya su personalidad.',
      },
    ],
    varianten: [
      {
        titel: 'Chaqueta de esmoquin azul real de jacquard',
        teile: [
          { art: 'Chaqueta de esmoquin azul real con jacquard de guepardo', material: '100 % seda' },
          { art: 'Pantalón de bengalina negra', material: '100 % lana virgen' },
        ],
      },
      {
        titel: 'Abrigo azul marino en espiga',
        teile: [
          { art: 'Abrigo azul marino en espiga', material: '100 % lana virgen' },
          { art: 'Dos piezas rojo medio en espiga', material: '100 % lana virgen Super 120\'s' },
        ],
      },
    ],
  },
  'anzug-gruen': {
    name: 'Traje verde',
    title: 'Traje verde — Elegancia a medida en Zúrich',
    claim: 'Acentos frescos para su estilo',
    metaDescription:
      'Traje verde a medida en Zúrich: del tono pastel al verde profundo, confeccionado por The Sartorialist. Reserve ahora su cita.',
    sections: [
      {
        title: 'Acentos frescos para su estilo',
        text: 'El traje verde es una elección a la moda para quien desea realzar su imagen con un toque de color. Los tonos de verde van desde suaves pasteles hasta matices intensos y profundos, y ofrecen una alternativa moderna a los colores clásicos. Un traje verde aporta acentos frescos y deja una impresión inconfundible.',
      },
      {
        title: 'Por qué elegir un traje verde',
        text: 'Un traje verde da color a su vestuario y destaca por su carácter singular. Es versátil: elegante con colores neutros, a la moda con acentos atrevidos. Sobre todo en primavera y verano, crea una imagen viva y dinámica.',
      },
      {
        title: 'Exclusividad a medida',
        text: 'Confeccionamos su traje verde de forma individual, según sus deseos y sus medidas. Nuestro equipo le asesora sobre el tono de verde perfecto, el tejido adecuado y los detalles de corte apropiados.',
      },
      {
        title: 'Tejidos y acabados',
        text: 'Lana fina, lino noble o cachemir lujoso: la elección del tejido determina la comodidad y la durabilidad. Cuidamos los detalles que subrayan el carácter único de su traje verde.',
      },
      {
        title: 'Diseño individual',
        text: 'Un traje verde de nuestra casa es más que una prenda: es una expresión de su personalidad. Elija entre una amplia selección de tejidos, cortes y detalles.',
      },
    ],
    varianten: [
      {
        titel: 'Dos piezas verde bosque con cuadro split matt',
        teile: [
          { art: 'Dos piezas verde bosque con cuadro split matt', material: '100 % lana virgen Super 120\'s' },
        ],
      },
    ],
  },
  'anzug-beige': {
    name: 'Traje beige',
    title: 'Traje beige — Elegancia a medida en Zúrich',
    claim: 'Refinamiento atemporal en beige',
    metaDescription:
      'Traje beige a medida en Zúrich: ligero, luminoso y elegante, ideal para el verano y las bodas. Confeccionado por The Sartorialist.',
    sections: [
      {
        title: 'Refinamiento atemporal en beige',
        text: 'El traje beige es un clásico que convence por su versatilidad y su elegancia. Une un refinamiento atemporal con un tono neutro, apropiado tanto para ocasiones formales como informales; ideal para la primavera y el verano, porque resulta ligero y luminoso.',
      },
      {
        title: 'Por qué elegir un traje beige',
        text: 'Un traje beige se combina sin esfuerzo con una gran variedad de colores y dibujos. Ya sea en una boda, un evento de negocios o un encuentro distendido, siempre le aporta una imagen elegante y cuidada. Su color claro refleja la luz del sol y resulta especialmente agradable de llevar.',
      },
      {
        title: 'Perfección a medida',
        text: 'Con nosotros, usted diseña su traje beige exactamente como desea: confeccionado de forma individual según sus medidas y su estilo, con asesoramiento sobre tejido, ajuste y detalles.',
      },
      {
        title: 'Tejidos y acabados',
        text: 'Solo tejidos nobles que garantizan comodidad y durabilidad, desde la lana fina y el lino noble hasta el cachemir más lujoso. Cada detalle está cuidado para que usted se sienta plenamente a gusto.',
      },
      {
        title: 'Diseño individual',
        text: 'Elija el tejido, el corte y detalles especiales como los botones y el forro: así nace un traje de ajuste perfecto que refleja su sello personal.',
      },
    ],
    varianten: [
      {
        titel: 'Americana de pata de gallo clara, pantalón blanco',
        teile: [
          { art: 'Americana de pata de gallo clara en tono camel', material: '100 % lana Shetland natural' },
          { art: 'Pantalón blanco, liso', material: '100 % lana virgen' },
        ],
      },
    ],
  },
  'anzug-grau': {
    name: 'Traje gris',
    title: 'Traje gris a medida en Zúrich',
    claim: 'El color más versátil del armario',
    metaDescription:
      'Traje gris a medida en Zúrich: del gris claro al antracita, liso o de cuadros. Tejidos de Holland & Sherry, confeccionado por The Sartorialist.',
    sections: [
      {
        title: 'El color más versátil del armario',
        text: 'El gris es el color que siempre acierta. Un traje gris resulta serio sin ser severo y combina con casi cualquier color de camisa y corbata. Del gris perla claro al gris medio y al antracita profundo, el gris sirve para la oficina, la comida de negocios y la boda de tarde.',
      },
      {
        title: 'Liso, franela o cuadros',
        text: 'Un gris medio liso es la piedra angular de todo vestuario. La franela gris aporta calidez y profundidad en otoño e invierno. Quien quiera mostrar carácter elige un cuadro: en el look book de Holland & Sherry, la americana luce un gris con cuadros rosa y un sobrecuadro bouclé, combinada con un pantalón gris medio.',
      },
      {
        title: 'A medida en Zúrich',
        text: 'Confeccionamos su traje gris según sus medidas y su estilo. En nuestro showroom de Kuttelgasse le mostramos los tonos de gris a la luz del día y le aconsejamos qué tono va con su tez y con la ocasión.',
      },
      {
        title: 'Tejidos y gramajes',
        text: 'Desde la ligera lana Super 130\'s para todo el año hasta la robusta franela para el invierno: la elección del tejido determina la caída, el brillo y la comodidad. La colección Four Seasons de Holland & Sherry está pensada para trajes que se llevan de la primavera al invierno.',
      },
      {
        title: 'Cómo combinar el gris',
        text: 'Las camisas blancas y azul claro resultan clásicas; el rosa y el burdeos aportan acentos cálidos. Los zapatos negros o marrón oscuro quedan igual de bien. La americana también puede llevarse sola, con chinos o pantalón de franela.',
      },
    ],
    varianten: [
      {
        titel: 'Americana de cuadros gris y rosa, pantalón gris medio',
        teile: [
          { art: 'Americana de cuadros gris y rosa con sobrecuadro bouclé', material: '93 % lana virgen, 7 % seda' },
          { art: 'Pantalón gris medio, liso', material: '100 % lana virgen Super 130\'s' },
        ],
      },
    ],
  },
  'anzug-schwarz': {
    name: 'Traje negro',
    title: 'Traje negro y esmoquin a medida en Zúrich',
    claim: 'Para las grandes noches',
    metaDescription:
      'Traje negro y esmoquin a medida en Zúrich: bengalina, chaleco de jacquard y Black Tie de Holland & Sherry, confeccionados por The Sartorialist.',
    sections: [
      {
        title: 'Para las grandes noches',
        text: 'El negro es el color de la noche. Un traje negro o un esmoquin tiene su lugar en galas, noches de ópera, bodas de etiqueta y recepciones festivas. Hecho a medida, sienta de forma que transmite aplomo en lugar de rigidez.',
      },
      {
        title: '¿Traje o esmoquin?',
        text: 'El esmoquin se distingue del traje negro por sus detalles: solapas forradas de seda, galón a lo largo del pantalón, normalmente un solo botón y pajarita en lugar de corbata. El traje negro es más sobrio y también puede llevarse de día. Le aconsejamos qué encaja con su ocasión y con el código de vestimenta.',
      },
      {
        title: 'Black tie con carácter',
        text: 'En el look book de Holland & Sherry, el esmoquin de bengalina negra se combina con un chaleco de jacquard floral negro: clásico en el color y singular en el detalle. Para una imagen más moderna, una chaqueta de esmoquin azul real también va bien con el pantalón negro.',
      },
      {
        title: 'A medida en Zúrich',
        text: 'Solapas, botones, forro, galón y chaleco los elige usted libremente. Tomamos medidas, confeccionamos y ajustamos hasta que el esmoquin o el traje sienta a la perfección, a tiempo para su ocasión.',
      },
      {
        title: 'Tejidos para la noche',
        text: 'La bengalina, la barathea y la lana fina dan al negro la profundidad necesaria. Las colecciones Black Tie y Masquerade de Holland & Sherry ofrecen además jacquards, terciopelo y seda para chalecos y chaquetas de esmoquin.',
      },
    ],
    varianten: [
      {
        titel: 'Esmoquin de bengalina negra con chaleco de jacquard',
        teile: [
          { art: 'Esmoquin de bengalina negra', material: '100 % lana virgen' },
          { art: 'Chaleco de jacquard floral negro', material: '45 % acrílico, 25 % lana virgen, 30 % viscosa' },
        ],
      },
    ],
  },
  'anzug-braun': {
    name: 'Traje marrón',
    title: 'Traje marrón a medida en Zúrich',
    claim: 'Cálido, elegante y atemporal',
    metaDescription:
      'Traje marrón a medida en Zúrich: raya tiza, príncipe de Gales o pana color miel. Tejidos de Holland & Sherry, confeccionado por The Sartorialist.',
    sections: [
      {
        title: 'Cálido, elegante y atemporal',
        text: 'El marrón ha vuelto, y con estilo. Un traje marrón resulta cálido, cercano y seguro de sí mismo. Es la alternativa elegante al azul y al gris, y encaja tanto en la oficina como en una boda de otoño o en un fin de semana en el campo.',
      },
      {
        title: 'Tres variantes del look book',
        text: 'En su colección otoño/invierno 2026, Holland & Sherry presenta el marrón en tres variantes: un dos piezas marrón medio de raya tiza, una americana príncipe de Gales con pantalón de franela y un traje de pana color miel con un abrigo ocre.',
      },
      {
        title: 'A medida en Zúrich',
        text: 'Confeccionamos su traje marrón según sus medidas. En nuestro showroom de Kuttelgasse encontramos juntos el tono que va con su tez, del tabaco al chocolate y la miel.',
      },
      {
        title: 'Tejidos y texturas',
        text: 'El marrón vive de la textura: raya tiza sobre lana Super 120\'s, príncipe de Gales en lana Shetland o pana de algodón de 14 canales. Cada tejido cambia el carácter del traje, del look de negocios al relajado estilo campestre.',
      },
      {
        title: 'Cómo combinar el marrón',
        text: 'Camisas azul claro y color crema, corbatas burdeos, verdes o de cachemira y zapatos marrón oscuro o de ante combinan con el traje marrón. Un abrigo camel u ocre completa el conjunto.',
      },
    ],
    varianten: [
      {
        titel: 'Dos piezas marrón medio de raya tiza',
        teile: [
          { art: 'Dos piezas marrón medio de raya tiza', material: '100 % lana virgen Super 120\'s' },
          { art: 'Abrigo camel en espiga', material: '100 % lana virgen' },
        ],
      },
      {
        titel: 'Americana príncipe de Gales marrón medio',
        teile: [
          { art: 'Americana príncipe de Gales marrón medio', material: '100 % lana Shetland natural' },
          { art: 'Pantalón marrón medio, liso', material: '100 % lana virgen Super 140\'s' },
        ],
      },
      {
        titel: 'Dos piezas de pana color miel',
        teile: [
          { art: 'Dos piezas de pana de 14 canales color miel', material: '98 % algodón, 2 % elastano' },
          { art: 'Abrigo ocre en espiga', material: '100 % lana virgen' },
        ],
      },
    ],
  },
  'anzug-rot': {
    name: 'Traje rojo',
    title: 'Traje rojo a medida en Zúrich',
    claim: 'Burdeos, merlot y borgoña',
    metaDescription:
      'Traje rojo a medida en Zúrich: rojo en espiga o americana con pantalón merlot. Tejidos de Holland & Sherry, confeccionado por The Sartorialist.',
    sections: [
      {
        title: 'Burdeos, merlot y borgoña',
        text: 'Un traje rojo es toda una declaración, pero en los tonos adecuados resulta sorprendentemente elegante. Los rojos apagados como el burdeos, el merlot y el borgoña se perciben profundos y nobles en lugar de estridentes. Encajan en eventos de noche, bodas y allí donde quiera destacar sin excederse.',
      },
      {
        title: 'Dos variantes del look book',
        text: 'En su colección otoño/invierno 2026, Holland & Sherry presenta el rojo como dos piezas rojo medio en espiga, llevado bajo un abrigo azul marino, y como pantalón merlot con una americana de cuadro gun club en camel.',
      },
      {
        title: 'A medida en Zúrich',
        text: 'Confeccionamos su traje rojo o su conjunto según sus medidas. Juntos elegimos el tono de rojo que le favorece y los detalles que lo hacen discreto o llamativo.',
      },
      {
        title: 'Tejidos para el rojo',
        text: 'La espiga sobre lana fina da al rojo profundidad y textura; la gabardina hace que el merlot luzca intenso y sereno. El terciopelo y la franela también se prestan a los tonos rojos en otoño e invierno.',
      },
      {
        title: 'Cómo combinar el rojo',
        text: 'Camisas blancas y rosa pálido, corbatas oscuras y zapatos negros o marrón oscuro mantienen la elegancia del conjunto. Un abrigo azul marino o antracita es el contrapunto sereno.',
      },
    ],
    varianten: [
      {
        titel: 'Dos piezas rojo medio en espiga',
        teile: [
          { art: 'Dos piezas rojo medio en espiga', material: '100 % lana virgen Super 120\'s' },
          { art: 'Abrigo azul marino en espiga', material: '100 % lana virgen' },
        ],
      },
      {
        titel: 'Americana de cuadro gun club, pantalón merlot',
        teile: [
          { art: 'Americana de cuadro gun club en camel y cuadro ventana en borgoña', material: '100 % lana virgen con elasticidad natural' },
          { art: 'Pantalón merlot, liso', material: '100 % lana virgen' },
        ],
      },
    ],
  },
};
