import type { Woerterbuch } from '../de';

// Política de privacidad
export const datenschutz: Woerterbuch['datenschutz'] = {
  meta: {
    titel: 'Política de privacidad',
    beschreibung:
      'Política de privacidad de The Sartorialist Zúrich: información sobre la recogida y el tratamiento de datos personales.',
  },
  h1: 'Política de privacidad',
  hinweisMassgeblich:
    'Esta traducción al español se ofrece únicamente a título informativo. La versión alemana es la jurídicamente vinculante: [leer la versión alemana](/datenschutzerklaerung/).',
  adresse: { land: 'Suiza', telefon: 'Teléfono: ', email: 'Correo electrónico: ' },
  abschnitte: [
    {
      titel: '1. La protección de datos de un vistazo',
      bloecke: [
        { h3: 'Información general' },
        {
          p: 'La siguiente información ofrece una visión general sencilla de lo que ocurre con sus datos personales cuando visita este sitio web. Son datos personales todos aquellos datos con los que se le puede identificar personalmente.',
        },
        { h3: 'Recogida de datos en este sitio web' },
        {
          p: 'El tratamiento de datos en este sitio web lo realiza el operador del sitio, cuyos datos de contacto figuran en el [aviso legal](impressum) de este sitio web. En las páginas ajenas a la tienda no se instalan cookies ni se cargan contenidos de terceros (p. ej., vídeos o fuentes externas). Las excepciones son la medición anónima de audiencia realizada por nuestra agencia web (véase el apartado 4, «Medición de audiencia»), el vídeo de la página de inicio (Vimeo, véase el apartado 4, «Vídeo en la página de inicio») y la tienda online en /shop, gestionada con Shopify (véase el apartado 4, «Tienda online»).',
        },
        {
          p: 'Por un lado, los datos se recogen porque usted nos los facilita, por ejemplo, cuando nos envía una solicitud de cita por correo electrónico o por teléfono. Otros datos los registran automáticamente los sistemas informáticos del proveedor de alojamiento al visitar el sitio web (sobre todo datos técnicos como el navegador, el sistema operativo o la hora de acceso a la página).',
        },
      ],
    },
    {
      titel: '2. Alojamiento',
      bloecke: [
        {
          p: 'Este sitio web está alojado por un proveedor de servicios externo (proveedor de alojamiento). Los datos recogidos al visitar el sitio web se almacenan en los servidores de dicho proveedor. Se trata sobre todo de direcciones IP, metadatos y datos de comunicación, así como de datos de acceso al sitio web. Recurrimos al proveedor de alojamiento en interés de una puesta a disposición segura, rápida y eficiente de nuestra oferta online. Nuestro proveedor de alojamiento trata sus datos solo en la medida necesaria para cumplir sus obligaciones contractuales.',
        },
      ],
    },
    {
      titel: '3. Información general e información obligatoria',
      bloecke: [
        { h3: 'Protección de datos' },
        {
          p: 'Los operadores de estas páginas se toman muy en serio la protección de sus datos personales. Tratamos sus datos personales de forma confidencial y de conformidad con la normativa legal de protección de datos (en particular, la Ley Federal suiza de Protección de Datos, LPD/nDSG, y, en la medida en que sea aplicable, el Reglamento General de Protección de Datos de la UE, RGPD) y con la presente política de privacidad.',
        },
        {
          p: 'Le advertimos de que la transmisión de datos por internet (p. ej., en la comunicación por correo electrónico) puede presentar brechas de seguridad. No es posible una protección completa de los datos frente al acceso de terceros.',
        },
        { h3: 'Responsable del tratamiento' },
        { p: 'El responsable del tratamiento de datos en este sitio web es:' },
        { adresse: true },
        { h3: 'Sus derechos' },
        {
          p: 'Tiene derecho en todo momento a obtener información gratuita sobre el origen, los destinatarios y la finalidad de sus datos personales almacenados. Asimismo, tiene derecho a la rectificación o supresión de estos datos, a la limitación de su tratamiento y a la portabilidad de los datos. Puede revocar en cualquier momento, con efectos para el futuro, el consentimiento que haya otorgado para el tratamiento de datos. Además, tiene derecho a presentar una reclamación ante la autoridad de control competente (en Suiza: el Comisionado Federal de Protección de Datos y Transparencia, EDÖB/PFPDT).',
        },
        { h3: 'Cifrado SSL/TLS' },
        {
          p: 'Por motivos de seguridad y para proteger la transmisión de contenidos confidenciales, este sitio utiliza cifrado SSL/TLS. Puede reconocer una conexión cifrada porque la barra de direcciones del navegador cambia de «http://» a «https://» y por el símbolo del candado en la barra del navegador.',
        },
      ],
    },
    {
      titel: '4. Recogida de datos en este sitio web',
      bloecke: [
        { h3: 'Archivos de registro del servidor' },
        {
          p: 'El proveedor de estas páginas recoge y almacena automáticamente información en los llamados archivos de registro del servidor, que su navegador transmite de forma automática:',
        },
        {
          liste: [
            'Tipo y versión del navegador',
            'Sistema operativo utilizado',
            'URL de referencia',
            'Nombre de host del ordenador que accede',
            'Hora de la solicitud al servidor',
            'Dirección IP',
          ],
        },
        {
          p: 'Estos datos no se combinan con otras fuentes de datos. El operador del sitio web tiene un interés legítimo en la presentación técnicamente correcta y en la optimización de su sitio web; para ello es necesario registrar los archivos de registro del servidor.',
        },
        { h3: 'Medición de audiencia' },
        {
          p: 'Para mejorar este sitio web, nuestra agencia web DLM Digital (Zúrich, Suiza) mide de forma anónima, por encargo nuestro, qué páginas se visitan y qué vías de contacto (teléfono, WhatsApp, correo electrónico, formulario) se utilizan. Para ello no se instalan cookies ni se almacenan direcciones IP; no es posible un reconocimiento más allá del mismo día. El contenido de los formularios (p. ej., nombre, correo electrónico, mensaje) no se transmite a DLM Digital. Los datos se tratan en Suiza o en la UE.',
        },
        { h3: 'Estadística de visitas propia' },
        {
          p: 'Además, llevamos en nuestro servidor una estadística propia de visitas sin cookies. Registramos la página visitada y su título, la versión lingüística del sitio, el sitio web de procedencia (solo su dominio), los posibles parámetros de campaña (utm_source, utm_medium, utm_campaign, utm_term, utm_content) y si la visita procede de un clic en un anuncio de Google (solo sí/no), el tipo de dispositivo, el navegador y el sistema operativo (a partir del identificador del navegador), un tamaño de pantalla aproximado, el idioma del navegador, un país aproximado (a partir de la región de su configuración de idioma o de una indicación de país de nuestro proveedor de alojamiento, nunca a partir de la dirección IP), el tiempo de permanencia visible en la página, así como los clics en los canales de contacto (teléfono, WhatsApp, correo electrónico, ruta), las acciones en el configurador y en la tienda y el envío de formularios (solo el tipo, nunca su contenido). Para poder contar las visitas, generamos a partir de la dirección IP, el identificador del navegador y la fecha, junto con una clave secreta, un valor de control abreviado (hash); las páginas vistas consecutivamente se agrupan en una visita en nuestro servidor. La dirección IP en sí no se almacena; el valor de control cambia cada día y no permite sacar conclusiones sobre su persona. No se utilizan cookies ni ningún otro almacenamiento de su navegador. Si su navegador envía la señal «Do Not Track» o «Global Privacy Control», no registramos nada. Los datos se utilizan exclusivamente para nuestro propio análisis, no se ceden a terceros y se almacenan en Suiza o en la UE. La base jurídica es nuestro interés legítimo en diseñar el sitio web según las necesidades.',
        },
        { h3: 'Vídeo en la página de inicio (Vimeo)' },
        {
          p: 'En la página de inicio mostramos nuestro vídeo a través del servicio Vimeo (Vimeo.com Inc., Nueva York, EE. UU.). Lo integramos con la opción «Do Not Track»: Vimeo no instala cookies ni crea perfiles de uso. Al cargar el vídeo, Vimeo recibe necesariamente, por motivos técnicos, su dirección IP e información sobre su navegador.',
        },
        { h3: 'Configurador de trajes a medida' },
        {
          p: 'Su selección en el configurador de trajes a medida («Estilos y opciones») se guarda exclusivamente en su navegador (localStorage) y no se nos transmite. Solo la recibimos si la adjunta a una solicitud de cita o nos envía el PDF. Puede borrar su selección en cualquier momento mediante «Restablecer todo».',
        },
        { h3: 'Tienda online (Shopify)' },
        {
          p: 'Nuestra tienda online en thesartorialist.ch/shop funciona con Shopify (Shopify International Limited, Dublín, Irlanda, y Shopify Inc., Ottawa, Canadá). Los datos de producto, las imágenes y los precios se cargan desde Shopify; las imágenes de producto se sirven directamente desde el servidor de Shopify (cdn.shopify.com), que recibe necesariamente su dirección IP por motivos técnicos.',
        },
        {
          p: 'En cuanto añade un artículo a la cesta, instalamos una cookie técnicamente necesaria con el identificador de su cesta (válida durante 14 días), así como las cookies de sesión de Shopify, para que la cesta y el pedido coincidan. El pedido propiamente dicho (dirección, envío y pago) lo completa en el proceso de compra de Shopify en shop.thesartorialist.ch, donde se aplican además los avisos de privacidad de Shopify. El tratamiento de los datos se realiza para la ejecución del contrato de compraventa. Shopify también puede tratar datos en países fuera de Suiza y de la UE; para ello existen cláusulas contractuales tipo.',
        },
        { h3: 'Solicitudes de cita y de llamada a través del sitio web' },
        {
          p: 'Si solicita una cita o una llamada a través del sitio web, transmitimos sus datos (nombre, teléfono, correo electrónico, fecha preferida y, si la ha elegido, su selección de estilo) por correo electrónico a nuestro atelier y le enviamos una confirmación. Para el envío utilizamos el servicio Resend (Resend Inc., San Francisco, EE. UU.), con tratamiento de datos en la UE. Además, guardamos sus datos en nuestra base de datos de clientes para poder preparar la cita y el asesoramiento y hacer el seguimiento de su solicitud. Utilizamos los datos exclusivamente para tramitar su solicitud y para atenderle como cliente. Solo nos pondremos en contacto con usted por WhatsApp o SMS si nos ha dado su consentimiento expreso; puede revocar este consentimiento en cualquier momento.',
        },
        { h3: 'Consultas por correo electrónico o por teléfono' },
        {
          p: 'Si se pone en contacto con nosotros por correo electrónico o por teléfono (p. ej., para solicitar una cita), sus datos, incluidos los datos de contacto que nos facilite, se almacenan con el fin de tramitar la solicitud y para posibles consultas posteriores. No cedemos estos datos sin su consentimiento. Los datos permanecen en nuestro poder hasta que nos solicite su supresión o deje de existir la finalidad de su almacenamiento. Las disposiciones legales imperativas, en particular los plazos de conservación, no se ven afectadas.',
        },
      ],
    },
  ],
};
