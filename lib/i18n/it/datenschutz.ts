import type { Woerterbuch } from '../de';

// Informativa sulla privacy
export const datenschutz: Woerterbuch['datenschutz'] = {
  meta: {
    titel: 'Informativa sulla privacy',
    beschreibung:
      'Informativa sulla privacy di The Sartorialist Zurigo — informazioni sulla raccolta e sul trattamento dei dati personali.',
  },
  h1: 'Informativa sulla privacy',
  hinweisMassgeblich:
    'La presente traduzione italiana è fornita unicamente a titolo informativo. Fa fede esclusivamente la versione tedesca: [leggi la versione tedesca](/datenschutzerklaerung/).',
  adresse: { land: 'Svizzera', telefon: 'Telefono: ', email: 'E-mail: ' },
  abschnitte: [
    {
      titel: '1. La protezione dei dati in sintesi',
      bloecke: [
        { h3: 'Informazioni generali' },
        {
          p: 'Le seguenti indicazioni offrono una semplice panoramica di ciò che accade ai Suoi dati personali quando visita questo sito web. Sono dati personali tutti i dati che consentono di identificarLa personalmente.',
        },
        { h3: 'Raccolta di dati su questo sito web' },
        {
          p: 'Il trattamento dei dati su questo sito web è effettuato dal gestore del sito, i cui dati di contatto sono riportati nelle [note legali](impressum) di questo sito. Nelle pagine al di fuori dello shop non vengono impostati cookie né caricati contenuti di terzi (ad es. video o font esterni). Fanno eccezione la misurazione anonima del pubblico effettuata dalla nostra agenzia web (vedi sezione 4, «Misurazione del pubblico»), il filmato sulla pagina iniziale (Vimeo, vedi sezione 4, «Filmato sulla pagina iniziale») e lo shop online all’indirizzo /shop, gestito con Shopify (vedi sezione 4, «Shop online»).',
        },
        {
          p: 'Alcuni dati vengono raccolti quando Lei ce li comunica, ad esempio quando ci invia una richiesta di appuntamento via e-mail o per telefono. Altri dati vengono rilevati automaticamente dai sistemi informatici del fornitore di hosting durante la visita del sito (soprattutto dati tecnici come browser, sistema operativo o orario di accesso alla pagina).',
        },
      ],
    },
    {
      titel: '2. Hosting',
      bloecke: [
        {
          p: 'Questo sito web è ospitato da un fornitore di servizi esterno (hoster). I dati raccolti durante la visita del sito vengono memorizzati sui server dell’hoster. Si tratta soprattutto di indirizzi IP, metadati e dati di comunicazione nonché dati di accesso al sito. Ci avvaliamo dell’hoster nell’interesse di una messa a disposizione sicura, rapida ed efficiente del nostro sito. Il nostro hoster tratta i Suoi dati solo nella misura necessaria all’adempimento dei suoi obblighi contrattuali.',
        },
      ],
    },
    {
      titel: '3. Indicazioni generali e informazioni obbligatorie',
      bloecke: [
        { h3: 'Protezione dei dati' },
        {
          p: 'I gestori di queste pagine prendono molto sul serio la protezione dei Suoi dati personali. Trattiamo i Suoi dati personali in modo confidenziale e in conformità alle disposizioni di legge in materia di protezione dei dati (in particolare la Legge federale sulla protezione dei dati (LPD) e, ove applicabile, il Regolamento generale UE sulla protezione dei dati (RGPD)) nonché alla presente informativa.',
        },
        {
          p: 'Facciamo presente che la trasmissione di dati via Internet (ad es. nella comunicazione via e-mail) può presentare lacune di sicurezza. Una protezione completa dei dati dall’accesso di terzi non è possibile.',
        },
        { h3: 'Titolare del trattamento' },
        { p: 'Il titolare del trattamento dei dati su questo sito web è:' },
        { adresse: true },
        { h3: 'I Suoi diritti' },
        {
          p: 'Lei ha in qualsiasi momento il diritto di ottenere gratuitamente informazioni sull’origine, sui destinatari e sullo scopo dei Suoi dati personali memorizzati. Ha inoltre il diritto di richiederne la rettifica o la cancellazione, di limitarne il trattamento e alla portabilità dei dati. Un consenso al trattamento dei dati eventualmente prestato può essere revocato in qualsiasi momento con effetto per il futuro. Ha inoltre il diritto di presentare reclamo presso l’autorità di vigilanza competente (in Svizzera: l’Incaricato federale della protezione dei dati e della trasparenza, IFPDT).',
        },
        { h3: 'Crittografia SSL/TLS' },
        {
          p: 'Per motivi di sicurezza e per proteggere la trasmissione di contenuti riservati, questo sito utilizza una crittografia SSL/TLS. Una connessione crittografata è riconoscibile dal fatto che la barra degli indirizzi del browser passa da «http://» a «https://» e dal simbolo del lucchetto nella barra del browser.',
        },
      ],
    },
    {
      titel: '4. Raccolta di dati su questo sito web',
      bloecke: [
        { h3: 'File di log del server' },
        {
          p: 'Il fornitore di queste pagine raccoglie e memorizza automaticamente nei cosiddetti file di log del server le informazioni che il Suo browser trasmette automaticamente:',
        },
        {
          liste: [
            'Tipo e versione del browser',
            'Sistema operativo utilizzato',
            'URL di provenienza (referrer)',
            'Nome host del computer che accede',
            'Orario della richiesta al server',
            'Indirizzo IP',
          ],
        },
        {
          p: 'Questi dati non vengono combinati con altre fonti di dati. Il gestore del sito ha un interesse legittimo alla presentazione tecnicamente corretta e all’ottimizzazione del proprio sito web; a tal fine è necessario registrare i file di log del server.',
        },
        { h3: 'Misurazione del pubblico' },
        {
          p: 'Per migliorare questo sito web, la nostra agenzia web DLM Digital (Zurigo, Svizzera) misura in forma anonima, su nostro incarico, quali pagine vengono visitate e quali canali di contatto (telefono, WhatsApp, e-mail, modulo) vengono utilizzati. A tal fine non vengono impostati cookie né memorizzati indirizzi IP; un riconoscimento oltre la giornata stessa non è possibile. I contenuti dei moduli (ad es. nome, e-mail, messaggio) non vengono trasmessi a DLM Digital. I dati sono trattati in Svizzera o nell’UE.',
        },
        { h3: 'Statistiche dei visitatori proprie' },
        {
          p: 'Inoltre teniamo sul nostro server una statistica dei visitatori propria e priva di cookie. Registriamo la pagina visitata, il sito di provenienza (solo il dominio), eventuali parametri di campagna (utm_source, utm_medium, utm_campaign), il tipo di dispositivo (smartphone, tablet, computer), la lingua del browser nonché i clic sui canali di contatto (telefono, WhatsApp, e-mail, indicazioni stradali) e gli invii di moduli. Per poter contare le visite, generiamo dall’indirizzo IP, dall’identificativo del browser e dalla data, combinati con una chiave segreta, un valore di controllo abbreviato (hash). L’indirizzo IP stesso non viene memorizzato; il valore di controllo cambia ogni giorno e non consente di risalire alla Sua persona. Non vengono utilizzati né cookie né altre forme di memorizzazione nel Suo browser. I dati servono esclusivamente alla nostra analisi interna, non vengono trasmessi a terzi e sono memorizzati in Svizzera o nell’UE. La base giuridica è il nostro interesse legittimo a strutturare il sito web in funzione delle esigenze dei visitatori.',
        },
        { h3: 'Filmato sulla pagina iniziale (Vimeo)' },
        {
          p: 'Sulla pagina iniziale mostriamo il nostro filmato tramite il servizio video Vimeo (Vimeo.com Inc., New York, USA). Lo integriamo con l’impostazione «Do Not Track»: Vimeo non imposta cookie e non crea profili di utilizzo. Al caricamento del filmato, Vimeo riceve necessariamente, per motivi tecnici, il Suo indirizzo IP e informazioni sul Suo browser.',
        },
        { h3: 'Configuratore dell’abito su misura' },
        {
          p: 'La Sua selezione nel configuratore dell’abito su misura («Stili e opzioni») viene memorizzata esclusivamente nel Suo browser (localStorage) e non ci viene trasmessa. La riceviamo solo se ce la invia insieme a una richiesta di appuntamento o se ci trasmette il PDF. Può cancellare la Sua selezione in qualsiasi momento tramite «Azzera tutto».',
        },
        { h3: 'Shop online (Shopify)' },
        {
          p: 'Il nostro shop online all’indirizzo thesartorialist.ch/shop è gestito con Shopify (Shopify International Limited, Dublino, Irlanda, e Shopify Inc., Ottawa, Canada). Dati, immagini e prezzi dei prodotti vengono caricati da Shopify; le immagini dei prodotti sono fornite direttamente dal server di Shopify (cdn.shopify.com), che per motivi tecnici riceve necessariamente il Suo indirizzo IP.',
        },
        {
          p: 'Non appena aggiunge un articolo al carrello, impostiamo un cookie strettamente necessario con l’identificativo del Suo carrello (valido 14 giorni) nonché i cookie di sessione di Shopify, affinché carrello e ordine corrispondano. L’ordine vero e proprio (indirizzo, spedizione e pagamento) viene concluso nel checkout di Shopify su shop.thesartorialist.ch, dove si applicano anche le informative sulla privacy di Shopify. Il trattamento dei dati avviene ai fini dell’esecuzione del contratto di compravendita. Shopify può trattare dati anche in paesi al di fuori della Svizzera e dell’UE; a tal fine sono previste clausole contrattuali standard.',
        },
        { h3: 'Richieste di appuntamento e di richiamata tramite il sito web' },
        {
          p: 'Se richiede un appuntamento o una richiamata tramite il sito web, inviamo i Suoi dati (nome, telefono, e-mail, data desiderata e, se selezionata, la Sua scelta di stile) via e-mail al nostro atelier e Le inviamo una conferma. Per l’invio di queste e-mail utilizziamo il servizio Resend (Resend Inc., San Francisco, USA), con trattamento dei dati nell’UE. Memorizziamo inoltre i Suoi dati nella nostra banca dati clienti, per poter preparare il Suo appuntamento e la Sua consulenza e dare seguito alla Sua richiesta. Utilizziamo i dati esclusivamente per l’evasione della Sua richiesta e per l’assistenza ai clienti. La contattiamo tramite WhatsApp o SMS solo se vi ha acconsentito espressamente; può revocare questo consenso in qualsiasi momento.',
        },
        { h3: 'Richieste via e-mail o telefono' },
        {
          p: 'Se ci contatta via e-mail o per telefono (ad es. per una richiesta di appuntamento), la Sua richiesta, compresi i dati di contatto da Lei forniti, viene da noi conservata ai fini dell’evasione della richiesta e per eventuali domande successive. Non trasmettiamo questi dati senza il Suo consenso. I dati restano presso di noi finché Lei non ci chiede di cancellarli o finché lo scopo della conservazione non viene meno. Restano impregiudicate le disposizioni di legge imperative, in particolare i termini di conservazione.',
        },
      ],
    },
  ],
};
