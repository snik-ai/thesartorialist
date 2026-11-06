import type { Woerterbuch } from '../de';

// Servizi (riparazioni e modifiche sartoriali)
export const services: Woerterbuch['services'] = {
  meta: {
    titel: 'Modifiche sartoriali Zurigo — Servizi',
    beschreibung:
      'Servizi di The Sartorialist Zurigo: la nostra sartoria partner di lunga data per le modifiche lavora tutto ciò che passa sotto una macchina da cucire — giacche, cappotti, pantaloni e camicie a prezzi equi.',
    ogTitel: 'Servizi — The Sartorialist Zurigo',
    ogBeschreibung: 'Modifiche sartoriali per giacche, cappotti, pantaloni e camicie.',
  },
  breadcrumb: 'Servizi',
  hero: {
    eyebrow: 'Modifiche e adattamenti',
    h1: 'Servizi',
    lead: 'La nostra sartoria partner di lunga data per le modifiche lavora tutto ciò che passa sotto una macchina da cucire — e a prezzi ragionevoli.',
  },
  leistungen: [
    {
      titel: 'Giacca / cappotto',
      text: 'Accorciare o allungare le maniche, stringere in vita, correggere le spalle — dopo la modifica, la Sua giacca o il Suo cappotto vestono come fossero su misura.',
    },
    {
      titel: 'Pantaloni',
      text: 'Lunghezza, girovita, risvolti o una gamba più affusolata — modifiche rapide e precise per una silhouette perfetta.',
    },
    {
      titel: 'Camicia',
      text: 'Sciancrare, accorciare le maniche, rinnovare colletto o polsini — perché anche la Sua camicia preferita torni a vestire in modo impeccabile.',
    },
  ],
  hinweis: 'Porti semplicemente il Suo capo nel nostro negozio — oppure [prenoti un appuntamento](termin).',
  cta: {
    titel: 'Serve una modifica? Ci pensiamo noi.',
    text: 'Kuttelgasse 7, 8001 Zurigo — lun–ven 10–19, sab 10–17.',
  },
  schema: {
    name: 'Modifiche sartoriali Zurigo',
    beschreibung:
      'Modifiche per giacche, cappotti, pantaloni e camicie — la sartoria partner di The Sartorialist Zurigo.',
  },
};
