import type { Woerterbuch } from '../de';

// Spanish overlay of lib/konfigurator/daten.ts (IDs identical; codes and images stay there).
// Sub-group titles keep the form «Group — Variant»: the home page uses the part before « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Americana',
      subtitle: 'La base del traje a medida',
      description:
        'Entretela de crin de caballo trabajada a mano, proporciones de la solapa, línea del hombro y arquitectura de los bolsillos, tomadas directamente de nuestras especificaciones de sastrería.',
    },
    trousers: {
      title: 'Pantalón',
      subtitle: 'Líneas limpias y detalles de pretina',
      description:
        'Una caída impecable de la pernera, cierres de pretina, ajustadores laterales y acabados del bajo, confeccionados con precisión según su postura.',
    },
    waistcoat: {
      title: 'Chaleco',
      subtitle: 'El toque final del traje de tres piezas',
      description: 'Cortado para asentarse a ras sobre la pretina del pantalón, sin que asome la camisa.',
    },
    'black-tie': {
      title: 'Esmoquin',
      subtitle: 'Detalles de etiqueta y esmoquin',
      description: 'Indumentaria de noche formal, en estricta conformidad con el código clásico «Black Tie».',
    },
  },
  untergruppen: {
    // Jacket
    'jacket-front-sb': { title: 'Delantero — De una fila', subtitle: 'Abotonaduras para la americana de una fila' },
    'jacket-front-db': { title: 'Delantero — Cruzado', subtitle: 'Abotonaduras para la americana cruzada' },
    'jacket-lapel-notch': { title: 'Solapa — De una fila, de muesca', subtitle: 'Medida desde la línea de quiebre hasta la punta de la solapa' },
    'jacket-lapel-peak': { title: 'Solapa — De una fila, de pico', subtitle: 'Medida desde la línea de quiebre hasta el borde de la solapa' },
    'jacket-lapel-shawl': { title: 'Solapa — De una fila, cuello chal', subtitle: 'Un cuello redondeado sin interrupción' },
    'jacket-lapel-db-peak': { title: 'Solapa — Cruzado, de pico', subtitle: 'Cortada específicamente para la americana cruzada' },
    'jacket-pockets': { title: 'Bolsillos', subtitle: 'Bolsillo de pecho y bolsillos laterales' },
    'jacket-ticket-pocket': { title: 'Bolsillos — Bolsillo para billetes', subtitle: 'Bolsillo adicional («ticket pocket») a la derecha' },
    'jacket-back-style': { title: 'Espalda y aberturas', subtitle: 'Aberturas traseras y caída' },
    'jacket-shoulder-style': { title: 'Hombro', subtitle: 'Hombrera y copa de manga' },
    'jacket-canvas': { title: 'Entretela', subtitle: 'Entretela de pecho flotante' },
    'jacket-lining': { title: 'Forro', subtitle: 'Extensión del forro de cupro' },
    'jacket-cuff-buttons': { title: 'Botones de manga', subtitle: 'Número y disposición de los botones' },
    'jacket-cuff-style': { title: 'Disposición de los botones de manga', subtitle: 'Separación entre los botones' },
    'jacket-topstitching': { title: 'Pespunte (pespunte a mano AMF)', subtitle: 'Pespunte a mano en solapas, cuello y costuras' },
    'jacket-lapel-buttonhole': { title: 'Ojal de solapa', subtitle: 'Acabado como asola a mano' },
    'jacket-monogram': { title: 'Monograma interior', subtitle: 'Iniciales y letras bordadas' },
    // Trousers
    'trousers-front-style': { title: 'Delantero del pantalón', subtitle: 'Pinzas y delantero' },
    'trousers-front-closure': { title: 'Cierre', subtitle: 'Bragueta y abrochado de la pretina' },
    'trousers-waistband': { title: 'Pretina', subtitle: 'Sujeción y ajuste de la cintura' },
    'trousers-side-pockets': { title: 'Bolsillos laterales', subtitle: 'Corte e inclinación de la abertura' },
    'trousers-back-pockets': { title: 'Bolsillos traseros', subtitle: 'Disposición de los bolsillos de vivo' },
    'trousers-lining': { title: 'Forro', subtitle: 'Forro en la pernera delantera' },
    'trousers-hem': { title: 'Bajo', subtitle: 'Con vuelta o bajo liso' },
    'trousers-topstitching': { title: 'Pespunte', subtitle: 'Pespunte a mano AMF en bolsillo y costura lateral' },
    'trousers-inside-waistband': { title: 'Pretina interior', subtitle: 'Acabado de la pretina interior' },
    // Waistcoat
    'waistcoat-front-sb': { title: 'Chaleco — De una fila', subtitle: 'Delantero y posición de los botones' },
    'waistcoat-front-db': { title: 'Chaleco — Cruzado', subtitle: 'Formal, también para chaqué' },
    'waistcoat-pockets': { title: 'Bolsillos', subtitle: 'Bolsillos de vivo y de ribete' },
    'waistcoat-back': { title: 'Espalda', subtitle: 'Espalda de forro o de tejido' },
    'waistcoat-topstitching': { title: 'Pespunte', subtitle: 'Pespunte a mano a lo largo de los cantos' },
    'waistcoat-buttonholes': { title: 'Ojales', subtitle: 'Acabado de los ojales' },
    // Dinner suit
    'black-tie-jacket-style': { title: 'Chaqueta de esmoquin', subtitle: 'En azul medianoche o negro profundo' },
    'black-tie-facing': { title: 'Solapa', subtitle: 'Revestimiento de seda en la solapa del esmoquin' },
    'black-tie-trouser-details': { title: 'Pantalón de esmoquin: galón y pretina', subtitle: 'Galón de seda y pretina de esmoquin' },
    'black-tie-waistcoat': { title: 'Chaleco de noche', subtitle: 'Un chaleco festivo de escote bajo' },
  },
  optionen: {
    // Jacket — front, single-breasted
    'jacket-sb-1b': {
      label: 'Un botón',
      subLabel: 'Abotonadura baja y esbelta',
      description: 'Una abotonadura de un botón, moderna y depurada, con una profunda abertura en V.',
    },
    'jacket-sb-2b': {
      label: 'Dos botones',
      subLabel: 'El clásico estándar de negocios',
      description: 'El estándar atemporal de la sastrería masculina suiza.',
    },
    'jacket-sb-3-2b': {
      label: 'Tres botones, dos abrochados',
      subLabel: 'Suave quiebre napolitano',
      description: 'El botón superior desaparece con elegancia en la solapa de suave quiebre.',
    },
    'jacket-sb-3b': {
      label: 'Tres botones',
      subLabel: 'Tradicionalmente de abotonadura alta',
      description: 'De tradición británica y abotonadura alta, con una caída equilibrada.',
    },
    // Jacket — front, double-breasted
    'jacket-db-4x2': {
      label: 'Cuatro botones, dos abrochados',
      subLabel: 'Un cruzado deportivo y relajado',
      description: 'Cuatro botones visibles, dos de ellos para abrochar.',
    },
    'jacket-db-6x2': {
      label: 'Seis botones, dos abrochados',
      subLabel: 'El clásico de Savile Row',
      description: 'Una silueta clásica con seis botones, dos de ellos para abrochar.',
    },
    // Lapels
    'jacket-lapel-notch-s': {
      label: 'Estrecha (6,7 cm)',
      subLabel: '6,7 cm de ancho',
      description: 'Una solapa de muesca esbelta y precisa, en un ancho moderno.',
    },
    'jacket-lapel-notch-r': {
      label: 'Estándar (8,0 cm)',
      subLabel: '8,0 cm de ancho',
      description: 'Proporciones equilibradas, ideal con corbatas y cuellos de camisa clásicos.',
    },
    'jacket-lapel-notch-l': {
      label: 'Ancha (9,5 cm)',
      subLabel: '9,5 cm de ancho',
      description: 'Una solapa de muesca llamativa, con fuerte presencia sobre el pecho.',
    },
    'jacket-lapel-peak-s': {
      label: 'Estrecha (6,7 cm)',
      subLabel: '6,7 cm de ancho',
      description: 'Picos de solapa orientados hacia arriba que estilizan el torso.',
    },
    'jacket-lapel-peak-r': {
      label: 'Estándar (8,0 cm)',
      subLabel: '8,0 cm de ancho',
      description: 'Una clásica solapa de pico al estilo italiano.',
    },
    'jacket-lapel-peak-l': {
      label: 'Ancha (9,5 cm)',
      subLabel: '9,5 cm de ancho',
      description: 'Una generosa solapa de pico para una presencia imponente.',
    },
    'jacket-lapel-shawl-s': {
      label: 'Estrecho (4,5 cm)',
      subLabel: '4,5 cm de ancho',
      description: 'Un cuello esbelto y redondeado para chaquetas de noche.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Estándar (6,0 cm)',
      subLabel: '6,0 cm de ancho',
      description: 'Una curva elegante y continua para esmóquines y chaquetas de terciopelo.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'Estrecha (9,0 cm)',
      subLabel: '9,0 cm de ancho',
      description: 'Una solapa de pico estrecha para el traje cruzado.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Estándar (10,0 cm)',
      subLabel: '10,0 cm de ancho',
      description: 'Una solapa de pico plena para la elegancia clásica de la americana cruzada.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'Ancha (11,0 cm)',
      subLabel: '11,0 cm de ancho',
      description: 'Una solapa de pico expresiva y amplia.',
    },
    // Pockets
    'jacket-pocket-jetted': {
      label: 'Barchetta y bolsillo de vivo',
      description: 'La línea más limpia y formal, completamente sin carteras.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo de vivo' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta y vivo inclinado',
      description: 'Bolsillos de vivo inclinados que realzan la cintura.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo de vivo inclinado' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta y bolsillo con cartera',
      description: 'Versátiles bolsillos rectos con cartera; las carteras también pueden meterse hacia dentro.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo con cartera' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta y cartera inclinada',
      description: 'El tradicional corte «hacking» para una cintura dinámica.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo con cartera inclinado' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta y parche',
      description: 'Una combinación napolitana: bolsillo de pecho barchetta con bolsillos laterales de parche redondeados.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo de parche' },
    },
    'jacket-pocket-patch-patch': {
      label: 'Parche y parche',
      description: 'Un estilo blazer relajado, con pespuntes visibles.',
      pocketSpec: { chest: 'Bolsillo de parche', side: 'Bolsillo de parche' },
    },
    'jacket-pocket-safari': {
      label: 'Safari y safari',
      description: 'Funcionales bolsillos de fuelle con tabla central y cierre de botón.',
      pocketSpec: { chest: 'Safari', side: 'Safari' },
    },
    // Ticket pocket
    'jacket-ticket-flap': {
      label: 'Bolsillo para billetes con cartera',
      description: 'El tradicional «ticket pocket» inglés, sobre el bolsillo con cartera derecho.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo para billetes con cartera' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Bolsillo para billetes inclinado',
      description: 'Colocado con la misma inclinación que el bolsillo con cartera inclinado que tiene debajo.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo para billetes inclinado con cartera' },
    },
    'jacket-ticket-patch': {
      label: 'Bolsillo para billetes de parche',
      description: 'Una versión relajada sobre el bolsillo lateral de parche derecho.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolsillo para billetes de parche' },
    },
    'jacket-ticket-patch-double': {
      label: 'Parche + bolsillo para billetes',
      description: 'Bolsillos de parche en toda la prenda, con un pequeño bolsillo para billetes arriba a la derecha.',
      pocketSpec: { chest: 'Bolsillo de parche', side: 'Bolsillo para billetes de parche' },
    },
    // Back & vents
    'jacket-back-ventless': {
      label: 'Sin abertura',
      subLabel: 'Una espalda lisa e ininterrumpida',
      description: 'Una espalda lisa y especialmente formal, reservada a esmóquines y chaquetas de noche.',
    },
    'jacket-back-single-vent': {
      label: 'Abertura central',
      subLabel: 'Una sola abertura en el centro de la espalda',
      description: 'La tradicional abertura central americana.',
    },
    'jacket-back-side-vents': {
      label: 'Aberturas laterales',
      subLabel: 'Dos aberturas a los lados',
      description: 'Cae de forma impecable al sentarse; las manos entran en los bolsillos sin que la americana tire.',
    },
    // Shoulder
    'jacket-shoulder-soft': {
      label: 'Hombro suave',
      subLabel: 'Hombrera fina · sin realce en la copa de manga · natural',
      description: 'Costuras planchadas hacia dentro para una caída ligera, desestructurada y natural.',
    },
    'jacket-shoulder-traditional': {
      label: 'Hombro clásico',
      subLabel: 'Hombrera media · realce medio en la copa de manga',
      description: 'Costuras planchadas hacia fuera para una línea limpia y cuidada sobre el hombro.',
    },
    'jacket-shoulder-roped': {
      label: 'Hombro «roped»',
      subLabel: 'Hombrera firme · copa de manga marcadamente realzada · pagoda',
      description: 'Costuras planchadas hacia fuera, con una copa de manga claramente realzada (con rollino).',
    },
    // Canvas
    'jacket-canvas-soft': {
      label: 'Entretela suave',
      subLabel: 'Entretela de pecho de crin de caballo, flexible y flotante',
      description: 'Una entretela ligera que se adapta rápidamente al cuerpo y resulta muy cómoda de llevar.',
    },
    'jacket-canvas-traditional': {
      label: 'Entretela clásica',
      subLabel: 'Entretela completa de crin de caballo que da forma («full canvas»)',
      description: 'Un quiebre de solapa preciso y un pecho claramente modelado que perdurarán durante décadas.',
    },
    // Lining
    'jacket-lining-lined': {
      label: 'Forrada por completo',
      subLabel: 'Forro en cuerpo y mangas',
      description: 'Se desliza sin esfuerzo sobre la camisa y protege por completo el interior.',
    },
    'jacket-lining-unlined': {
      label: 'Medio forro',
      subLabel: 'Forro en las mangas y como canesú trasero',
      description: 'Más transpirabilidad para los días templados de primavera y otoño.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Sin forro',
      subLabel: 'Ni cuerpo ni mangas forrados',
      description: 'Máxima circulación del aire, con las costuras interiores pulcramente ribeteadas con cinta.',
    },
    // Sleeve buttons
    'jacket-cuff-0b': {
      label: 'Sin botones',
      subLabel: 'Una manga lisa y depurada',
      description: 'Un acabado de manga limpio, sin ojales ni botones.',
    },
    'jacket-cuff-3b': {
      label: 'Tres botones',
      subLabel: 'Clásico europeo',
      description: 'El acabado de manga tradicional al estilo continental.',
    },
    'jacket-cuff-4b': {
      label: 'Cuatro botones',
      subLabel: 'El estándar de la sastrería',
      description: 'La referencia reconocida para las mangas en la alta sastrería.',
    },
    'jacket-cuff-5b': {
      label: 'Cinco botones',
      subLabel: 'Un toque napolitano',
      description: 'Un detalle inconfundible de la fina sastrería italiana.',
    },
    'jacket-cuff-kissing': {
      label: 'Botones superpuestos («kissing»)',
      subLabel: 'Los botones se solapan entre sí (cascata)',
      description: 'Una auténtica cascada trabajada a mano en la manga.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Uno junto a otro',
      subLabel: 'Los botones se tocan sin solaparse',
      description: 'Una hilera británica limpia, con cada botón asentado en plano.',
    },
    // Topstitching
    'jacket-stitch-edge-2mm': {
      label: 'Pespunte de canto (2 mm)',
      subLabel: 'Delantero, solapas, cuello y bolsillos',
      description: 'Un fino pespunte a mano a 2 mm del canto, que define los bordes y estabiliza el quiebre de la solapa.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Pespunte de canto completo (2 mm)',
      subLabel: 'Incluidas pinzas, hombros y costuras de la espalda',
      description: 'Pespunte a mano a lo largo de todas las costuras de construcción principales.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Costura realzada (5 mm)',
      subLabel: 'Pespunte marcado para la americana sport',
      description: 'Un pespunte pronunciado a 5 mm del canto, ideal para hopsack, franela y tweed con textura.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Costuras realzadas completas (5 mm)',
      subLabel: 'Pespunteada por completo a 5 mm',
      description: 'Costuras realzadas en delantero, solapas, pinzas y todas las costuras.',
    },
    // Lapel buttonhole
    'jacket-buttonhole-machine': {
      label: 'A máquina',
      subLabel: 'Pespunte preciso',
      description: 'Un ojal cosido a máquina, fiable y resistente.',
    },
    'jacket-buttonhole-hand': {
      label: 'Cosido a mano',
      subLabel: 'Hilo de seda sobre cordoncillo, anudado',
      description: 'Cosido a mano con auténtica seda para ojales sobre un cordoncillo.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Ojal milanés',
      subLabel: 'Seda envuelta sin nudos · en relieve',
      description: 'La cumbre del trabajo artesanal: seda brillante, envuelta sin costura visible sobre un cordoncillo.',
    },
    // Monogram
    'jacket-monogram-lined': {
      label: 'Monograma en el forro',
      subLabel: 'Bordado bajo el bolsillo interior de pecho',
      description: 'Las iniciales que usted elija, bordadas a mano o a máquina en la vista del forro.',
    },
    'jacket-monogram-unlined': {
      label: 'Monograma, sin forro',
      subLabel: 'Bordado en el vivo del bolsillo',
      description: 'Discretamente situado en el vivo del bolsillo interior, para americanas ligeras sin forro.',
    },

    // Trousers — front
    'trousers-front-flat': {
      label: 'Frente plano',
      subLabel: 'Liso y moderno',
      description: 'Un delantero liso y limpio, sin pinzas, para una silueta esbelta y alargada.',
    },
    'trousers-front-single-pleat': {
      label: 'Una pinza',
      subLabel: 'Profundidad de pinza 2 cm',
      description: 'Un poco más de holgura en la cadera al sentarse, con una raya bien marcada.',
    },
    'trousers-front-double-pleat': {
      label: 'Dos pinzas',
      subLabel: 'Primera 2 cm · segunda 1,25 cm',
      description: 'Elegancia generosa con talle alto, total libertad de movimiento y una caída preciosa.',
    },
    // Closure
    'trousers-closure-extended-belt': {
      label: 'Pretina prolongada',
      subLabel: 'Lengüeta de pretina prolongada',
      description: 'Una lengüeta de pretina que se prolonga más allá de la bragueta para una cintura más limpia.',
    },
    'trousers-closure-standard': {
      label: 'Bragueta de botones — estándar',
      subLabel: 'Bragueta con botones de cuerno',
      description: 'Construcción tradicional y purista; a diferencia de una cremallera, no abulta al sentarse.',
    },
    'trousers-closure-double-belt': {
      label: 'Pretina doble',
      subLabel: 'Cierre prolongado con dos botones',
      description: 'Una pretina alta con dos botones, inspirada en la sastrería florentina.',
    },
    // Waistband
    'trousers-waistband-side-adjusters': {
      label: 'Ajustadores laterales',
      subLabel: 'Hebillas de latón · sin trabillas',
      description: 'Una pretina limpia con lengüetas de ajuste laterales, sin necesidad de cinturón.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Trabillas',
      subLabel: 'Trabillas clásicas para cinturón',
      description: 'Seis trabillas cosidas a mano para cinturones de piel fina.',
    },
    'trousers-waistband-plain': {
      label: 'Pretina lisa',
      subLabel: 'Una cintura sencilla y depurada',
      description: 'Una pretina pura y lisa, sin trabillas ni hebillas, para llevar con tirantes.',
    },
    // Side pockets
    'trousers-pocket-slanted': {
      label: 'Inclinado',
      subLabel: 'Acceso natural',
      description: 'Una abertura inclinada ergonómica; la mano entra con naturalidad sin que el tejido tire.',
    },
    'trousers-pocket-inseam': {
      label: 'En la costura',
      subLabel: 'Oculto en la costura lateral',
      description: 'Invisible dentro de la costura lateral vertical, para la línea lateral más limpia.',
    },
    'trousers-pocket-jetted': {
      label: 'Bolsillo de vivo',
      subLabel: 'Abertura horizontal, de doble vivo',
      description: 'Una fina abertura de doble vivo para pantalones formales.',
    },
    'trousers-pocket-jeans': {
      label: 'Bolsillo vaquero',
      subLabel: 'Abertura redondeada en la parte superior',
      description: 'Un bolsillo redondeado de estilo western, ideal para chinos y pana.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'Boca de rana («frog-mouth»)',
      subLabel: 'Abertura horizontal en el delantero',
      description: 'Una abertura horizontal en el delantero, como en los pantalones de caballería a medida de mediados de siglo.',
    },
    // Hip pockets
    'trousers-back-none': {
      label: 'Ninguno',
      subLabel: 'Una espalda completamente lisa',
      description: 'Sin bolsillos traseros, para una caída lisa e ininterrumpida sobre el asiento.',
    },
    'trousers-back-left': {
      label: 'Solo a la izquierda',
      subLabel: 'Un bolsillo de vivo a la izquierda',
      description: 'Un bolsillo de vivo con botón de cuerno, a la izquierda de quien lo lleva.',
    },
    'trousers-back-right': {
      label: 'Solo a la derecha',
      subLabel: 'Un bolsillo de vivo a la derecha',
      description: 'Un bolsillo de vivo con botón de cuerno, a la derecha de quien lo lleva.',
    },
    'trousers-back-two': {
      label: 'Dos bolsillos',
      subLabel: 'Dos bolsillos de vivo simétricos',
      description: 'Clásicos bolsillos de vivo a ambos lados, con cierre de botón.',
    },
    // Lining
    'trousers-lining-unlined': {
      label: 'Sin forro',
      subLabel: 'Tejido puro, transpirable',
      description: 'Sin ningún forro, para la máxima transpirabilidad en los días cálidos.',
    },
    'trousers-lining-half-lined': {
      label: 'Medio forro',
      subLabel: 'Forrado por delante hasta debajo de la rodilla',
      description: 'Un suave forro de cupro por encima de la rodilla evita el roce y las rodilleras.',
    },
    'trousers-lining-fully-lined': {
      label: 'Forrado por completo',
      subLabel: 'Forrado en toda su longitud',
      description: 'Un forro completo, cómodo para pieles sensibles y tejidos de lana pesados.',
    },
    // Hem
    'trousers-hem-plain-bottom': {
      label: 'Bajo liso',
      subLabel: 'Ligeramente inclinado hacia atrás',
      description: 'Un acabado limpio y recto, cortado algo más largo por detrás, hacia el talón.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Vuelta (3,0 cm)',
      subLabel: 'Una vuelta discreta',
      description: 'Una vuelta sobria que da a la pernera un ligero peso.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Vuelta (3,5 cm)',
      subLabel: 'Una vuelta equilibrada',
      description: 'Proporciones equilibradas, ideal para hombres de estatura media.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Vuelta (4,0 cm)',
      subLabel: 'El ancho clásico de la sastrería',
      description: 'El estándar probado de la alta sastrería, para una caída ideal y una raya nítida.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Vuelta (4,5 cm)',
      subLabel: 'Una vuelta marcada',
      description: 'Una vuelta llamativa para tejidos de lana más pesados y franela.',
    },
    // Topstitching
    'trousers-topstitching-none': {
      label: 'Ninguno',
      subLabel: 'Pespunte a mano AMF solo en el bolsillo lateral',
      description: 'Un discreto pespunte AMF, limitado al canto del bolsillo lateral.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Pespunte de canto (2 mm)',
      subLabel: 'AMF de 2 mm en bolsillos y costura lateral',
      description: 'Un acabado de pespunte a mano a 2 mm del canto, a lo largo de toda la costura lateral exterior.',
    },
    // Inside waistband
    'trousers-inside-wb-pleated': {
      label: 'Pretina plisada',
      subLabel: 'Clásica pretina interior con plisado',
      description: 'Una pretina interior plisada tradicional, para mayor comodidad y flexibilidad.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Plisado + botones para tirantes',
      subLabel: 'Botones de cuerno interiores para tirantes',
      description: 'Una pretina interior plisada con seis botones de cuerno interiores para tirantes de botón.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Pretina con sujeción de camisa',
      subLabel: 'Cinta antideslizante de goma',
      description: 'Una cinta antideslizante integrada mantiene la camisa bien metida durante todo el día.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Sujeción de camisa + botones para tirantes',
      subLabel: 'Cinta antideslizante y botones para tirantes',
      description: 'El máximo confort: cinta antideslizante y botones para tirantes combinados.',
    },

    // Waistcoat — single-breasted
    'waistcoat-sb-4b': {
      label: 'Cuatro botones',
      subLabel: 'Abertura baja',
      description: 'Abotonado bajo, deja ver más de la corbata y la pechera de la camisa.',
    },
    'waistcoat-sb-5b': {
      label: 'Cinco botones',
      subLabel: 'El chaleco clásico',
      description: 'El clásico chaleco europeo para el traje de tres piezas, con una posición de botones equilibrada.',
    },
    'waistcoat-sb-6b': {
      label: 'Seis botones',
      subLabel: 'De abotonadura alta',
      description: 'Un cierre alto; según la regla de siempre, el último botón se deja desabrochado.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'Herradura',
      subLabel: 'Abertura baja en forma de U, formal',
      description: 'Una abertura en U modelada que luce una camisa de etiqueta plisada y la pajarita.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Solapa de muesca',
      subLabel: 'Cuello de solapa clásico',
      description: 'Da estructura al cuello y los hombros y los enmarca con elegancia.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Cuello chal',
      subLabel: 'Cuello suavemente redondeado',
      description: 'Un cuello de curva suave y continua, como en los chalecos de noche históricos.',
    },
    // Waistcoat — double-breasted
    'waistcoat-db-6b': {
      label: 'Cruzado, seis botones',
      subLabel: 'Bajo recto',
      description: 'Un señorial corte cruzado con un borde inferior recto y horizontal.',
    },
    'waistcoat-db-8b': {
      label: 'Cruzado, ocho botones',
      subLabel: 'De cierre alto, formal',
      description: 'De cierre alto, para chaqué o una imponente presencia en tres piezas.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Cruzado, cuello chal',
      subLabel: 'Cuello redondeado continuo',
      description: 'Cruzado, con un amplio cuello chal.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Cruzado, solapa de muesca',
      subLabel: 'Cuello de solapa con muesca',
      description: 'Un chaleco cruzado con una solapa de muesca de corte nítido.',
    },
    // Waistcoat — pockets
    'waistcoat-pocket-jetted': {
      label: 'Bolsillos de vivo',
      subLabel: 'Dos finos bolsillos de vivo',
      description: 'Bolsillos de doble vivo especialmente planos, para una cintura impecable.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 bolsillos de ribete',
      subLabel: 'Dos clásicos bolsillos de ribete',
      description: 'Clásicos bolsillos de ribete en la parte inferior.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 bolsillos de ribete',
      subLabel: 'Dos arriba, dos abajo',
      description: 'Cuatro bolsillos de ribete, con espacio para un reloj de bolsillo y su leontina.',
    },
    // Waistcoat — back
    'waistcoat-back-cloth': {
      label: 'Espalda de tejido',
      subLabel: 'Tejido del traje delante y detrás',
      description: 'Puede llevarse con estilo sin americana, como chaleco independiente.',
    },
    'waistcoat-back-lining': {
      label: 'Espalda de forro',
      subLabel: 'Espalda de cupro transpirable',
      description: 'Una espalda lisa de cupro sobre la que la americana se desliza sin esfuerzo.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Forro + trabilla trasera',
      subLabel: 'Espalda de cupro con trabilla de hebilla',
      description: 'La trabilla trasera permite el ajuste más fino para una silueta confeccionada con precisión.',
    },
    // Waistcoat — topstitching
    'waistcoat-topstitching-none': {
      label: 'Ninguno',
      subLabel: 'Cantos limpios sin pespunte',
      description: 'Sencillez formal, sin pespunte visible.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Pespunte de canto (2 mm)',
      subLabel: 'Pespunte a mano AMF de 2 mm a lo largo de los cantos',
      description: 'Un fino pespunte a mano a 2 mm del canto, que define el delantero y el quiebre del cuello.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Costura realzada (5 mm)',
      subLabel: 'Pespunte marcado de 5 mm',
      description: 'Un pespunte pronunciado, ideal para tweed y tejidos de lana deportivos.',
    },
    // Waistcoat — buttonholes
    'waistcoat-buttonhole-none': {
      label: 'Ninguno',
      subLabel: 'Sin ojal decorativo en la solapa',
      description: 'Un canto de solapa limpio, sin ojal decorativo.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'A máquina',
      subLabel: 'Pespunte preciso',
      description: 'Un ojal hecho a máquina, pulcro, regular y muy resistente.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'Cosidos a mano',
      subLabel: 'Ojales trabajados a mano',
      description: 'Trabajados a mano con hilo de seda pura sobre un cordoncillo.',
    },

    // Dinner suit — jacket
    'black-tie-tux-shawl': {
      label: 'Esmoquin con cuello chal',
      subLabel: 'Solapa de seda redondeada · un botón',
      description: 'Un cuello de seda de curva continua con un único botón forrado.',
    },
    'black-tie-tux-peak-sb': {
      label: 'De una fila, solapa de pico',
      subLabel: 'Solapa de seda orientada hacia arriba',
      description: 'Una solapa de pico ancha y expresiva, con un fino revestimiento de seda.',
    },
    'black-tie-tux-peak-db': {
      label: 'Esmoquin cruzado',
      subLabel: 'Seis botones, dos abrochados, con solapas de seda',
      description: 'Se lleva abrochado, sin fajín ni chaleco.',
    },
    // Dinner suit — facing
    'black-tie-facing-satin': {
      label: 'Raso',
      subLabel: 'Raso de seda brillante en solapas y botones',
      description: 'Seda pura de alto brillo que capta la luz de las velas y el destello de las arañas.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Grosgrain',
      subLabel: 'Seda acanalada mate en solapas y botones',
      description: 'Seda finamente acanalada para una elegancia de noche sobria, con profundidad y textura.',
    },
    // Dinner suit — trousers
    'black-tie-trousers-braid': {
      label: 'Galón de seda',
      subLabel: 'Una franja de seda a juego a lo largo de la costura lateral',
      description: 'Un galón vertical de raso o grosgrain sobre la costura lateral exterior.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Galón de seda — vista frontal',
      subLabel: 'El delantero completo con galón',
      description: 'Visto de frente, con una caída limpia de principio a fin.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Pretina de esmoquin',
      subLabel: 'Pretina revestida de seda, sin trabillas',
      description: 'Revestida de seda a juego, con botones interiores para tirantes.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Pretina de esmoquin — vista frontal',
      subLabel: 'Un delantero liso como un fajín',
      description: 'Un cierre delantero sin costuras visibles que queda a ras bajo la chaqueta de esmoquin.',
    },
    // Dinner suit — waistcoat
    'black-tie-horseshoe': {
      label: 'Chaleco de noche en herradura',
      subLabel: 'Abertura baja que deja ver la pechera',
      description: 'La tradicional abertura baja en herradura para la etiqueta formal.',
    },
  },
};
