import type { Woerterbuch } from '../de';

// Shop (solo interfaccia — i testi dei prodotti arrivano da Shopify e restano in tedesco)
export const shop: Woerterbuch['shop'] = {
  start: {
    meta: {
      titel: 'Shop — Woolrich, Gran Sasso e Tramarossa online',
      beschreibung:
        'Lo shop online di The Sartorialist Zurigo: {n} capi selezionati personalmente — parka Woolrich, maglieria Gran Sasso, giacche Tramarossa. Consegna in tutta la Svizzera o prova nel nostro showroom.',
      ogTitel: 'Il Guardaroba — Shop The Sartorialist Zurigo',
      ogBeschreibung: 'Ordini online Woolrich, Gran Sasso e Tramarossa — oppure li provi nel nostro showroom in Kuttelgasse 7.',
      ogAlt: 'Shop The Sartorialist Zurigo',
    },
    sortimentEyebrow: 'La collezione',
    alleStuecke: 'Tutti i capi',
    direktZu: 'Vai a',
    direktZuAria: 'Acquisti per marchio e categoria',
    mass: {
      eyebrow: 'L’abito su misura',
      titel: 'Ciò che qui non trova, lo confezioniamo su misura.',
      text: 'Il cuore della nostra attività è l’abito su misura: intelatura completa (full canvas), 100 % Made in Italy, a partire da CHF 1’690 e pronto per il ritiro in 20 giorni lavorativi. I capi dello shop ne sono i compagni ideali.',
      knopf: 'Scopra il su misura',
      termin: 'Prenoti un appuntamento',
    },
    faqTitel: 'Domande sullo shop',
    faq: [
      {
        q: 'Dove consegna lo shop di The Sartorialist?',
        a: ['Consegniamo in tutta la Svizzera. Spese e tempi di spedizione Le vengono indicati al checkout, prima di concludere l’ordine.'],
      },
      {
        q: 'Posso provare i capi prima dell’acquisto?',
        a: [
          'Certamente. Ogni capo dello shop è disponibile anche nel nostro showroom in {strasse} a Zurigo. Prenoti un appuntamento e Le terremo pronta la Sua taglia.',
        ],
      },
      {
        q: 'Come si paga nello shop?',
        a: ['Il pagamento avviene tramite il checkout sicuro di Shopify. I metodi di pagamento disponibili sono indicati nell’ultimo passaggio.'],
      },
      {
        q: 'Nello shop si trovano anche abiti su misura?',
        a: [
          'No. Un abito su misura viene tagliato secondo le Sue misure e inizia quindi con un appuntamento nel nostro showroom: a partire da CHF 1’690, intelatura completa, 100 % Made in Italy, pronto per il ritiro in 20 giorni lavorativi. Nello shop trova i capi da abbinarvi — maglieria, parka, cappotti e giacche.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Zurigo',
    eyebrow: 'Shop · {gruppe}',
    mehrUeber: 'Di più su {label}',
    weitereAria: 'Altre sezioni dello shop',
    alleStuecke: 'Tutti i capi',
    ctaTitel: 'Preferisce provarlo?',
    ctaText: 'Ogni capo dello shop è disponibile anche nel nostro showroom in Kuttelgasse 7 — insieme agli abiti su misura a partire da CHF 1’690.',
  },
  gruppen: { Marke: 'Marchio', Für: 'Per', Kategorie: 'Categoria' },
  seiten: {
    woolrich: {
      h1: 'Parka e giacche Woolrich online',
      title: 'Parka e giacche Woolrich — Shop Zurigo',
      description:
        'Woolrich da The Sartorialist Zurigo: Arctic Parka, Cloud Parka, Wool Shirt Jacket e cappotti per uomo e donna. Ordini online o li provi nel nostro showroom.',
      intro:
        'Dal 1830 Woolrich è sinonimo di capispalla pensati per i veri inverni. Qui trova le icone del marchio — dall’Arctic Parka imbottito in piuma alla Wool Shirt Jacket in lana Melton — per uomo e donna. Ordini online o provi la Sua taglia nel nostro showroom in Kuttelgasse 7.',
    },
    'gran-sasso': {
      h1: 'Maglieria Gran Sasso online',
      title: 'Pullover e cashmere Gran Sasso — Shop Zurigo',
      description:
        'Gran Sasso da The Sartorialist Zurigo: pullover in merino, maglieria in cashmere, lupetti con zip e cardigan dall’Abruzzo. Ordini online o li provi nel nostro showroom.',
      intro:
        'Gran Sasso lavora la maglia in Abruzzo dal 1952 — merino, cashmere e seta, prodotti nella propria manifattura di Sant’Egidio alla Vibrata. Pullover, lupetti con zip e cardigan stanno bene sotto una giacca come con i jeans e sono il complemento ideale del Suo abito su misura.',
    },
    tramarossa: {
      h1: 'Giacche e chino Tramarossa online',
      title: 'Giacche e chino Tramarossa — Shop Zurigo',
      description:
        'Tramarossa da The Sartorialist Zurigo: giacche e chino disinvolti in gabardine italiana. Ordini online o li provi nel nostro showroom.',
      intro:
        'Tramarossa, dal Veneto, unisce la sartorialità italiana a un’attitudine rilassata: giacche destrutturate e chino in morbida gabardine, perfetti tanto nel quotidiano quanto in ufficio. Tutto si abbina — giacca e chino dello stesso colore formano un completo informale.',
    },
    herren: {
      label: 'Uomo',
      h1: 'Abbigliamento uomo online',
      title: 'Abbigliamento uomo online — Parka, maglieria e giacche',
      description:
        'Abbigliamento maschile italiano nello shop di The Sartorialist Zurigo: parka Woolrich, maglieria Gran Sasso e giacche Tramarossa. Consegna in tutta la Svizzera.',
      intro:
        'Abbigliamento maschile scelto personalmente, a complemento dell’abito su misura: parka e cappotti per l’inverno, maglieria in merino e cashmere, giacche e chino disinvolti. Tutto ciò che proponiamo nel nostro showroom in Kuttelgasse si può ordinare qui direttamente — con consegna in tutta la Svizzera.',
    },
    damen: {
      label: 'Donna',
      h1: 'Parka e cappotti donna online',
      title: 'Parka e cappotti donna — Shop Zurigo',
      description:
        'Parka e cappotti donna Woolrich da The Sartorialist Zurigo: Arctic Parka, Kelly Parka e Madison Coat. Ordini online, consegna in tutta la Svizzera.',
      intro:
        'Per la donna proponiamo i capispalla invernali di Woolrich: il classico Arctic Parka, il lungo Kelly Parka e il Madison Coat — caldi, idrorepellenti e dal taglio senza tempo. Saremo lieti di mostrarLe i modelli anche nel nostro showroom di Zurigo.',
    },
    parkas: {
      label: 'Parka',
      h1: 'Parka online',
      title: 'Parka — Woolrich Arctic e Cloud Parka',
      description:
        'Parka per uomo e donna da The Sartorialist Zurigo: Woolrich Arctic Parka, Cloud Parka, Polar e Ramar. Imbottiti in piuma e idrorepellenti.',
      intro:
        'Un buon parka resiste all’inverno svizzero e sta bene sopra un abito come con i jeans. I nostri parka Woolrich sono imbottiti in piuma, idrorepellenti e hanno il cappuccio staccabile — dal corto Cloud Parka al lungo Arctic Parka.',
    },
    maentel: {
      label: 'Cappotti',
      h1: 'Cappotti online',
      title: 'Cappotti — Cappotti in lana per uomo e donna',
      description:
        'Cappotti da The Sartorialist Zurigo: cappotti in lana e soprabiti Woolrich per uomo e donna — eleganti sopra l’abito, caldi d’inverno.',
      intro:
        'Il cappotto è la prima cosa che si nota sopra il Suo abito. I nostri cappotti in lana e in tessuti tecnici sono abbastanza lunghi da coprire la giacca sottostante e abbastanza sobri per ogni occasione.',
    },
    strick: {
      label: 'Maglieria',
      h1: 'Pullover e maglieria online',
      title: 'Pullover e cashmere — Maglieria dall’Italia',
      description:
        'Pullover, lupetti con zip e cardigan in merino e cashmere da The Sartorialist Zurigo — realizzati da Gran Sasso in Italia.',
      intro:
        'Maglieria italiana che non ingombra mai sotto la giacca: dolcevita in merino fine, lupetti con zip, pullover e cardigan in cashmere. Le qualità più leggere si indossano tutto l’anno; quelle più pesanti, in autunno, prendono il posto della giacca.',
    },
    jacken: {
      label: 'Giacche e overshirt',
      h1: 'Giacche e overshirt online',
      title: 'Giacche e overshirt — Woolrich Wool Shirt Jacket',
      description:
        'Giacche e overshirt da The Sartorialist Zurigo: Woolrich Wool Shirt Jacket, overshirt tecniche e giacche corte per uomo e donna.',
      intro:
        'Tra camicia e cappotto: overshirt in lana e giacche corte per le mezze stagioni. La Woolrich Wool Shirt Jacket è un classico da decenni — robusta, calda e tessuta in lana Melton.',
    },
    'sakkos-hosen': {
      label: 'Giacche e pantaloni',
      h1: 'Giacche sartoriali e pantaloni online',
      title: 'Giacche sartoriali e chino — Abbigliamento maschile italiano',
      description:
        'Giacche sartoriali e chino da The Sartorialist Zurigo: giacche destrutturate e chino in gabardine italiana. Per un abito su misura: prenoti un appuntamento nel nostro showroom.',
      intro:
        'Giacche e pantaloni pronti da indossare, ma con mano italiana: destrutturati, morbidi e confortevoli. Se cerca un abito che vesta davvero alla perfezione, prenoti da noi un appuntamento per un abito su misura — a partire da CHF 1’690, pronto in 20 giorni lavorativi.',
    },
  },
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} di {marke} da The Sartorialist Zurigo, {preis}. Ordini online o lo provi nel nostro showroom di Zurigo.',
    versand: 'Consegna in tutta la Svizzera, spese indicate al checkout',
    anprobe: 'Prova nel nostro showroom: {strasse}, Zurigo',
    beratung: 'Consulenza personale:',
    beschreibung: 'Descrizione',
    alleKategorie: 'Tutti: {label}',
    massDazu: 'Un abito su misura da abbinare',
    passtEyebrow: 'Si abbina a',
    mehrTitel: 'Altro dal guardaroba',
    ctaEyebrow: 'Consulenza in negozio',
    ctaTitel: 'Preferisce provarlo? Glielo teniamo pronto.',
    ctaText: 'Prenoti un appuntamento o richieda di essere richiamato — La consigliamo su taglia, abbinamenti e sull’abito su misura più adatto.',
    groesse: 'Taglia {groesse}',
  },
  werte: {
    // Kategorien (Gruppe → Art → Modell)
    'Jacken & Mäntel': 'Giacche e cappotti',
    Strick: 'Maglieria',
    'Sakkos & Hosen': 'Giacche e pantaloni',
    Parkas: 'Parka',
    Mäntel: 'Cappotti',
    Overshirts: 'Overshirt',
    Jacken: 'Giubbotti',
    Chinos: 'Chino',
    Sakkos: 'Giacche sartoriali',
    Polos: 'Polo',
    Strickjacken: 'Cardigan',
    Troyer: 'Lupetti con zip',
    Rundhals: 'Girocollo',
    Stehkragen: 'Collo alto',
    Pullover: 'Pullover',
    Wollmantel: 'Cappotto in lana',
    Technisch: 'Tecnico',
    Zweireiher: 'Doppiopetto',
    Einreiher: 'Monopetto',
    Wolle: 'Lana',
    // Farben
    Schwarz: 'Nero',
    Rot: 'Rosso',
    Beige: 'Beige',
    Braun: 'Marrone',
    Grün: 'Verde',
    Grau: 'Grigio',
    Blau: 'Blu',
    // Für
    Herren: 'Uomo',
    Damen: 'Donna',
  },
  groessenSysteme: { int: 'Internazionale', it: 'Italiana (giacche, maglieria)', w: 'Vita (pantaloni)' },
  grid: {
    facetten: {
      group: 'Categoria',
      sub: 'Tipo',
      type: 'Modello',
      brand: 'Marchio',
      size: 'Taglia',
      color: 'Colore',
      price: 'Prezzo',
      gender: 'Per',
    },
    sort: {
      neu: 'Novità',
      'preis-auf': 'Prezzo crescente',
      'preis-ab': 'Prezzo decrescente',
      marke: 'Marchio A–Z',
    },
    anzahlEins: '{n} capo',
    anzahlMehr: '{n} capi',
    zeigen: 'Mostra {anzahl}',
    groesseAria: 'Taglia {groesse}, {anzahl}',
    nurAnLager: 'Solo taglie disponibili.',
    markenSuchen: 'Cerca tra {n} marchi',
    markenSuchenAria: 'Cerca marchi',
    alle: 'Tutti',
    alleName: 'Tutto {name}',
    kategorienAria: 'Categorie',
    sortiment: 'Collezione',
    nachArtAria: '{name} per tipo',
    nachModellAria: '{name} per modello',
    alleFilter: 'Tutti i filtri',
    filter: 'Filtri',
    nachFiltern: 'Filtra per {label}',
    zuruecksetzen: 'Azzera',
    ansicht: 'Vista',
    kompakt: 'Più capi per riga',
    gross: 'Immagini più grandi',
    sortieren: 'Ordina',
    filterEntfernen: 'Rimuovi filtro {label}',
    alleZuruecksetzen: 'Azzera tutto',
    leer: 'Al momento non abbiamo nulla a magazzino per questa combinazione.',
    alleFilterZuruecksetzen: 'Azzera tutti i filtri',
    sheetTitel: 'Filtri e ordinamento',
    filterSchliessen: 'Chiudi filtri',
  },
  preis: {
    bis: 'fino a CHF 300',
    mitte: 'CHF 300–700',
    ab: 'da CHF 700',
    min: 'Min',
    max: 'Max',
    minAria: 'Prezzo minimo',
    maxAria: 'Prezzo massimo',
    minFeldAria: 'Prezzo minimo in CHF',
    maxFeldAria: 'Prezzo massimo in CHF',
    imBereichEins: '{n} capo in questa fascia',
    imBereichMehr: '{n} capi in questa fascia',
  },
  karte: {
    ausverkauft: 'Esaurito',
    sale: 'Saldi',
  },
  buybox: {
    groesseWaehlen: 'Scelga la taglia',
    groesseHinweis: ' — scelga prima una taglia',
    groesseAria: 'Taglia',
    ausverkauft: 'Esaurito',
    busy: 'Aggiunta in corso …',
    fertig: 'Nel carrello ✓',
    hinzufuegen: 'Aggiungi al carrello',
    fehler: 'Qualcosa non ha funzionato. La preghiamo di riprovare o di telefonarci.',
    anprobieren: 'Lo provi nel nostro showroom',
  },
  galerie: {
    ansicht: '{titel} — vista {n}',
    bilderAria: 'Immagini',
    bild: 'Immagine {n}',
  },
  schrank: {
    eyebrow: 'Shop · The Sartorialist Zurigo',
    h1: 'Il Guardaroba',
    text: '{n} capi selezionati personalmente da Woolrich, Gran Sasso e Tramarossa — li ordini online o li provi nel nostro showroom.',
    rolle: 'Carosello',
    aria: 'Il Guardaroba — capi selezionati personalmente',
    zurueck: 'Capo precedente',
    weiter: 'Capo successivo',
    ansehen: 'Scopri →',
    alleArtikel: 'Tutti i {n} articoli',
  },
};
