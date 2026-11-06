import type { Woerterbuch } from '../de';

// Aviso legal
export const impressum: Woerterbuch['impressum'] = {
  meta: {
    titel: 'Aviso legal',
    beschreibung: 'Aviso legal de The Sartorialist Zúrich — Swiss Art Partner AG.',
  },
  h1: 'Aviso legal',
  hinweisMassgeblich:
    'Esta traducción al español se ofrece únicamente a título informativo. La versión alemana es la jurídicamente vinculante: [leer la versión alemana](/impressum/).',
  unternehmen: {
    titel: 'Datos de la empresa',
    land: 'Suiza',
    vertreten: 'Representada por: ',
  },
  kontakt: {
    titel: 'Contacto',
    telefon: 'Teléfono: ',
    email: 'Correo electrónico: ',
  },
  abschnitte: [
    {
      titel: 'Resolución de litigios de consumo / organismo universal de arbitraje',
      absaetze: [
        'No estamos dispuestos ni obligados a participar en procedimientos de resolución de litigios ante un organismo de arbitraje de consumo.',
      ],
    },
    {
      titel: 'Responsabilidad por los contenidos',
      absaetze: [
        'Como proveedores de servicios, somos responsables de los contenidos propios de estas páginas conforme a la legislación general. No obstante, no estamos obligados a supervisar la información de terceros transmitida o almacenada, ni a investigar circunstancias que indiquen una actividad ilícita.',
        'Las obligaciones de eliminar o bloquear el uso de información conforme a la legislación general no se ven afectadas por ello. Sin embargo, solo cabe responsabilidad a este respecto a partir del momento en que tengamos conocimiento de una infracción concreta. En cuanto tengamos conocimiento de tales infracciones, eliminaremos dichos contenidos de inmediato.',
      ],
    },
    {
      titel: 'Responsabilidad por los enlaces',
      absaetze: [
        'Nuestra oferta contiene enlaces a sitios web externos de terceros sobre cuyos contenidos no tenemos ninguna influencia. Por ello, no podemos asumir ninguna garantía por dichos contenidos ajenos. El responsable de los contenidos de las páginas enlazadas es siempre el respectivo proveedor u operador de las mismas. Las páginas enlazadas se revisaron en el momento de crear el enlace para detectar posibles infracciones legales.',
        'Un control permanente del contenido de las páginas enlazadas no es razonable sin indicios concretos de una infracción. En cuanto tengamos conocimiento de infracciones, eliminaremos dichos enlaces de inmediato.',
      ],
    },
    {
      titel: 'Derechos de autor',
      absaetze: [
        'Los contenidos y obras creados por los operadores de estas páginas están sujetos a los derechos de autor. La reproducción, edición, distribución y cualquier tipo de explotación fuera de los límites de los derechos de autor requieren el consentimiento por escrito del autor o creador correspondiente. Las descargas y copias de esta página solo están permitidas para uso privado y no comercial.',
        'En la medida en que los contenidos de esta página no hayan sido creados por el operador, se respetan los derechos de autor de terceros. Si, a pesar de ello, detectara una infracción de los derechos de autor, le rogamos que nos lo comunique. En cuanto tengamos conocimiento de infracciones, eliminaremos dichos contenidos de inmediato.',
      ],
    },
  ],
};
