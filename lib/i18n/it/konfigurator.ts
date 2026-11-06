import type { Woerterbuch } from '../de';

// Configuratore dell'abito su misura «Stili e opzioni»
export const konfigurator: Woerterbuch['konfigurator'] = {
  meta: {
    titel: 'Stili e opzioni — Configuratore dell’abito su misura',
    beschreibung:
      'Crei il Suo abito su misura: {anzahl} stili e opzioni per giacca, pantaloni, gilet e smoking — rever, bottoni, tasche, fodera. Salvi la Sua scelta in PDF e faccia confezionare il Suo abito su misura a Zurigo.',
    ogTitel: 'Crei il Suo abito su misura — Stili e opzioni, The Sartorialist Zurigo',
    ogBeschreibung:
      'Scelga online rever, tasche, bottoni e fodera del Suo abito su misura — e porti la Sua selezione all’appuntamento in atelier.',
  },
  breadcrumb: { massanzug: 'Abito su misura', seite: 'Stili e opzioni' },
  hero: {
    eyebrow: 'Stili e opzioni · Configuratore di stile',
    h1: 'Il Suo abito su misura comincia qui.',
    lead: 'Il Suo stile. Le Sue misure. Il Suo abito. Scopra rever, bottoni, tasche e dettagli di finitura, e componga con calma ciò che Le si addice — dove e quando preferisce. Porti la Sua selezione all’appuntamento in atelier: lì prendiamo le Sue misure, scegliamo insieme il tessuto e perfezioniamo ogni dettaglio, finché l’abito non veste non solo il Suo corpo, ma anche il Suo carattere.',
    hinweise: ['Tocchi ciò che Le piace', 'Non è necessario scegliere tutto', 'Riepilogo in basso — in PDF o direttamente per l’appuntamento'],
  },
  sogehts: {
    titel: 'Crei il Suo abito su misura — ecco com’è semplice',
    absaetze: [
      'Un abito su misura è la somma di tante piccole decisioni. Qui può prendere le prime con calma: monopetto o doppiopetto, rever dentellato o a lancia, tasche a filetto o con pattina, spalla napoletana morbida o spalla classica, foderato o sfoderato. Ogni opzione è illustrata, così vede esattamente che cosa cambia.',
      'Scelga soltanto ciò che Le sta a cuore. La Sua selezione compare nel riepilogo in basso, può essere salvata in PDF e ci viene inviata direttamente con la Sua richiesta di appuntamento.',
    ],
  },
  zuerich: {
    titel: 'Il Suo abito su misura a Zurigo',
    text: 'Nel nostro atelier in Kuttelgasse 7 prendiamo le Sue misure, Le mostriamo i tessuti di Loro Piana, Vitale Barberis Canonico, Holland & Sherry e di altri lanifici, e perfezioniamo con Lei ogni dettaglio. Ogni abito su misura è a intelatura completa, 100 % Made in Italy, a partire da CHF 1’690 — pronto per il ritiro in 20 giorni lavorativi.',
    linkMassanzug: 'Di più sull’abito su misura a Zurigo',
    linkHochzeit: 'Abiti da sposo su misura',
  },
  faqTitel: 'Domande sul configuratore',
  faq: [
    {
      q: 'Posso creare il mio abito su misura online?',
      a: [
        'Sì. In «Stili e opzioni» sceglie online i dettagli del Suo abito su misura — abbottonatura, rever, tasche, spalla, fodera, cintura e altro ancora. La presa delle misure e la scelta del tessuto avvengono poi di persona nel nostro atelier a Zurigo, perché l’abito calzi davvero alla perfezione.',
      ],
    },
    {
      q: 'A che cosa serve il configuratore?',
      a: [
        'Il configuratore Le permette di prendere con calma, da casa, le prime decisioni di stile: rever, bottoni, tasche, spalla, fodera, cintura e orlo. Porti la Sua selezione all’appuntamento — in atelier prendiamo le misure, scegliamo il tessuto e perfezioniamo insieme ogni dettaglio.',
      ],
    },
    {
      q: 'Devo scegliere ogni dettaglio?',
      a: [
        'No. Scelga soltanto ciò che Le sta a cuore. Quanto resta aperto lo definiamo insieme all’appuntamento, consigliandoLa con sincerità su ciò che valorizza la Sua figura e si addice all’occasione.',
      ],
    },
    {
      q: 'Dove viene salvata la mia selezione?',
      a: [
        'Soltanto nel Suo browser, su questo dispositivo. La riceviamo solo quando richiede un appuntamento con la Sua selezione oppure ce la invia in PDF o come testo.',
      ],
    },
    {
      q: 'Quanto costa un abito su misura con questi dettagli?',
      a: [
        'I nostri abiti su misura partono da CHF 1’690. Il prezzo finale dipende soprattutto dal tessuto e arriva di norma fino a circa CHF 2’500. Ogni abito è a intelatura completa, 100 % Made in Italy, e pronto per il ritiro in 20 giorni lavorativi.',
      ],
    },
  ],
  cta: {
    titel: 'Selezione completata? Ora si faccia prendere le misure.',
    text: 'Porti la Sua selezione di stile a una consulenza gratuita in Kuttelgasse 7 — oppure La richiamiamo e definiamo tutto al telefono.',
  },
  schema: {
    name: 'Configuratore dell’abito su misura',
    beschreibung:
      'Selezione di stile online per abiti su misura: giacca, pantaloni, gilet e smoking — selezione in PDF e per l’appuntamento in atelier a Zurigo.',
  },
  ui: {
    kategorienAria: 'Categorie',
    gewaehltAria: '{n} selezionati',
    stoff: 'Tessuto',
    meineAuswahl: 'La mia selezione',
    brustSeite: 'Petto · Fianchi',
    detailsZu: 'Dettagli di {label}',
    stoffSub: 'La collezione di tessuti Holland & Sherry',
    stoffText:
      'Dal 1836 Holland & Sherry tesse stoffe per i migliori sarti del mondo. Sfogli la collezione e annoti i numeri dei Suoi preferiti — terremo pronti i campioni per il Suo appuntamento in atelier.',
    stoffBildAlt: 'Tessuti di Holland & Sherry',
    stoffAnsehen: 'Vedere la collezione di tessuti',
    neuesFenster: 'Si apre in una nuova finestra',
    stoffKicker: 'Numero del tessuto (facoltativo)',
    stoffPlatzhalter: 'p. es. 9722022',
    stoffAria: 'Numero del tessuto',
    hinzufuegen: 'Aggiungi',
    stoffHinweis:
      'Trova il numero nella pagina del tessuto alla voce «Product Code». Sono possibili più numeri — oppure scelga semplicemente il tessuto in atelier.',
    stoffEntfernen: 'Rimuovi tessuto {n}',
    uebersicht: 'Riepilogo',
    summaryTitelEins: 'Il Suo abito su misura in {n} dettaglio',
    summaryTitelMehr: 'Il Suo abito su misura in {n} dettagli',
    summaryText: 'Salvato in questo browser. Prendiamo le misure insieme in atelier — dove perfezioniamo ogni dettaglio.',
    reset: 'Azzera tutto',
    stoffGruppe: 'Tessuto · Holland & Sherry',
    stoffnummer: 'Numero del tessuto',
    leerTitel: 'Nessuna selezione per ora.',
    leerText: 'Tocchi qui sopra rever, tasche, bottoni e fodera — la Sua selezione comparirà qui.',
    leerKnopf: 'Iniziare dalla giacca',
    entfernen: 'Rimuovi {label}',
    terminKnopf: 'Prenotare un appuntamento con questa selezione',
    pdfKnopf: 'Scarica PDF',
    pdfLaeuft: 'Creazione del PDF …',
    pdfFertig: 'PDF scaricato',
    pdfFehler: 'Non è stato possibile creare il PDF',
    dockLeer: 'Il Suo riepilogo',
    dockEins: '{n} dettaglio selezionato',
    dockMehr: '{n} dettagli selezionati',
    dockText: 'Non è necessario scegliere tutto — il resto lo definiamo in atelier.',
    dockGo: 'Al riepilogo',
    schliessen: 'Chiudi',
    code: 'Codice {code}',
    brusttasche: 'Taschino:',
    seitentaschen: 'Tasche laterali:',
    abwaehlen: 'Rimuovi dalla selezione',
    waehlen: 'Scegli questo dettaglio',
    auswahl: {
      taschen: 'Taschino {brust}, tasche laterali {seite}',
      stoffKopf: 'TESSUTO (HOLLAND & SHERRY)',
      stoffnummer: 'Numero del tessuto',
      stoffnummern: 'Numeri dei tessuti',
    },
  },
  pdf: {
    dateiname: 'The-Sartorialist-Selezione-di-stile.pdf',
    locale: 'it-CH',
    dokTitel: 'Selezione di stile, abito su misura — The Sartorialist Zurigo',
    dokThema: 'Abito su misura, stili e opzioni',
    ort: 'ZURIGO',
    kopfFolge: 'Selezione di stile · {datum}',
    titel: 'La mia selezione di stile',
    untertitel: 'per l’abito su misura — Stili e opzioni',
    detailEins: '{n} dettaglio',
    detailMehr: '{n} dettagli',
    stoffEins: '{n} tessuto',
    stoffMehr: '{n} tessuti',
    stoffAbschnitt: 'Tessuto · Holland & Sherry',
    stoffnummerKopf: 'NUMERO DEL TESSUTO',
    stoffnummernKopf: 'NUMERI DEI TESSUTI',
    notizen: 'Note per l’atelier',
    fussHinweis: 'Prendiamo le Sue misure in atelier — porti questa selezione al Suo appuntamento.',
    seite: 'Pagina {p} di {n}',
  },
};
