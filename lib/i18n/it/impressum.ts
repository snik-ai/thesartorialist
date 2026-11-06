import type { Woerterbuch } from '../de';

// Note legali
export const impressum: Woerterbuch['impressum'] = {
  meta: {
    titel: 'Note legali',
    beschreibung: 'Note legali di The Sartorialist Zurigo — Swiss Art Partner AG.',
  },
  h1: 'Note legali',
  hinweisMassgeblich:
    'La presente traduzione italiana è fornita unicamente a titolo informativo. Fa fede esclusivamente la versione tedesca: [leggi la versione tedesca](/impressum/).',
  unternehmen: {
    titel: 'Dati societari',
    land: 'Svizzera',
    vertreten: 'Rappresentata da: ',
  },
  kontakt: {
    titel: 'Contatto',
    telefon: 'Telefono: ',
    email: 'E-mail: ',
  },
  abschnitte: [
    {
      titel: 'Risoluzione delle controversie dei consumatori / organo di conciliazione',
      absaetze: [
        'Non siamo disposti né tenuti a partecipare a procedure di risoluzione delle controversie dinanzi a un organo di conciliazione per i consumatori.',
      ],
    },
    {
      titel: 'Responsabilità per i contenuti',
      absaetze: [
        'In qualità di fornitori di servizi, siamo responsabili dei nostri contenuti su queste pagine secondo le disposizioni di legge generali. Non siamo tuttavia tenuti a sorvegliare le informazioni di terzi trasmesse o memorizzate, né a ricercare circostanze che indichino un’attività illecita.',
        'Restano impregiudicati gli obblighi di rimozione o di blocco dell’uso di informazioni secondo le disposizioni di legge generali. Una responsabilità in tal senso è tuttavia possibile solo a partire dal momento in cui veniamo a conoscenza di una violazione concreta. Non appena venissimo a conoscenza di tali violazioni, rimuoveremo senza indugio i contenuti in questione.',
      ],
    },
    {
      titel: 'Responsabilità per i link',
      absaetze: [
        'Il nostro sito contiene link a siti web esterni di terzi, sui cui contenuti non abbiamo alcuna influenza. Non possiamo pertanto assumere alcuna responsabilità per tali contenuti di terzi. Dei contenuti delle pagine collegate è sempre responsabile il rispettivo fornitore o gestore. Al momento dell’inserimento dei link, le pagine collegate sono state verificate per eventuali violazioni di legge.',
        'Un controllo permanente dei contenuti delle pagine collegate non è ragionevolmente esigibile senza indizi concreti di una violazione. Non appena venissimo a conoscenza di violazioni, rimuoveremo senza indugio tali link.',
      ],
    },
    {
      titel: 'Diritto d’autore',
      absaetze: [
        'I contenuti e le opere create dai gestori del sito su queste pagine sono soggetti al diritto d’autore. La riproduzione, l’elaborazione, la diffusione e qualsiasi forma di utilizzo al di fuori dei limiti del diritto d’autore richiedono il consenso scritto del rispettivo autore o creatore. Download e copie di questo sito sono consentiti esclusivamente per uso privato e non commerciale.',
        'Nella misura in cui i contenuti di questo sito non siano stati creati dal gestore, sono rispettati i diritti d’autore di terzi. Qualora dovesse comunque riscontrare una violazione del diritto d’autore, La preghiamo di segnalarcelo. Non appena venissimo a conoscenza di violazioni, rimuoveremo senza indugio tali contenuti.',
      ],
    },
  ],
};
