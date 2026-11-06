import type { Woerterbuch } from '../de';

// Sovrapposizione italiana di lib/konfigurator/daten.ts (ID identici; codici e immagini restano lì).
// I titoli dei sottogruppi mantengono la forma «Gruppo — Variante»: la home page usa la parte prima di « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Giacca',
      subtitle: 'Il fondamento del su misura',
      description:
        'Intelatura in crine di cavallo lavorata a mano, proporzioni del rever, linea della spalla e architettura delle tasche, direttamente dalle nostre specifiche sartoriali.',
    },
    trousers: {
      title: 'Pantaloni',
      subtitle: 'Linee pulite e dettagli della cintura',
      description:
        'Una caduta impeccabile della gamba, chiusure in cintura, regolatori laterali e finiture dell’orlo, cuciti con precisione sulla Sua postura.',
    },
    waistcoat: {
      title: 'Gilet',
      subtitle: 'Il tocco finale dell’abito tre pezzi',
      description: 'Tagliato per aderire alla cintura dei pantaloni, senza che la camicia si intraveda in mezzo.',
    },
    'black-tie': {
      title: 'Smoking',
      subtitle: 'Abito da sera e dettagli dello smoking',
      description: 'Abbigliamento da sera formale, nel pieno rispetto del classico dress code «Black Tie».',
    },
  },
  untergruppen: {
    // Giacca
    'jacket-front-sb': { title: 'Davanti — Monopetto', subtitle: 'Abbottonature per la giacca monopetto' },
    'jacket-front-db': { title: 'Davanti — Doppiopetto', subtitle: 'Abbottonature per la giacca doppiopetto' },
    'jacket-lapel-notch': { title: 'Rever — Monopetto, dentellato', subtitle: 'Misurato dalla linea di piegatura alla punta del rever' },
    'jacket-lapel-peak': { title: 'Rever — Monopetto, a lancia', subtitle: 'Misurato dalla linea di piegatura al bordo del rever' },
    'jacket-lapel-shawl': { title: 'Rever — Monopetto, a scialle', subtitle: 'Un collo dalla curva continua' },
    'jacket-lapel-db-peak': { title: 'Rever — Doppiopetto, a lancia', subtitle: 'Tagliato appositamente per la giacca doppiopetto' },
    'jacket-pockets': { title: 'Tasche', subtitle: 'Taschino e tasche laterali' },
    'jacket-ticket-pocket': { title: 'Tasche — Tasca portabiglietti', subtitle: 'Tasca portabiglietti aggiuntiva a destra' },
    'jacket-back-style': { title: 'Dietro e spacchi', subtitle: 'Spacchi posteriori e caduta' },
    'jacket-shoulder-style': { title: 'Spalla', subtitle: 'Spallina e testa della manica' },
    'jacket-canvas': { title: 'Intelatura', subtitle: 'Intelatura del petto flottante' },
    'jacket-lining': { title: 'Fodera', subtitle: 'Estensione della fodera in cupro' },
    'jacket-cuff-buttons': { title: 'Bottoni della manica', subtitle: 'Numero e disposizione dei bottoni' },
    'jacket-cuff-style': { title: 'Disposizione dei bottoni della manica', subtitle: 'Distanza tra i bottoni' },
    'jacket-topstitching': { title: 'Impunture (punto a mano AMF)', subtitle: 'Punto a mano su rever, collo e cuciture' },
    'jacket-lapel-buttonhole': { title: 'Asola del rever', subtitle: 'Rifinita come asola a mano' },
    'jacket-monogram': { title: 'Monogramma interno', subtitle: 'Iniziali e scritte ricamate' },
    // Pantaloni
    'trousers-front-style': { title: 'Davanti dei pantaloni', subtitle: 'Pinces e parte anteriore' },
    'trousers-front-closure': { title: 'Chiusura', subtitle: 'Patta e chiusura della cintura' },
    'trousers-waistband': { title: 'Cintura', subtitle: 'Tenuta e regolazione in vita' },
    'trousers-side-pockets': { title: 'Tasche laterali', subtitle: 'Taglio e inclinazione dell’apertura' },
    'trousers-back-pockets': { title: 'Tasche posteriori', subtitle: 'Disposizione delle tasche a filetto' },
    'trousers-lining': { title: 'Fodera', subtitle: 'Fodera nella parte anteriore della gamba' },
    'trousers-hem': { title: 'Orlo', subtitle: 'Risvolto o orlo semplice' },
    'trousers-topstitching': { title: 'Impunture', subtitle: 'Punto a mano AMF su tasca e cucitura laterale' },
    'trousers-inside-waistband': { title: 'Cintura interna', subtitle: 'Finitura della cintura interna' },
    // Gilet
    'waistcoat-front-sb': { title: 'Gilet — Monopetto', subtitle: 'Davanti e posizione dei bottoni' },
    'waistcoat-front-db': { title: 'Gilet — Doppiopetto', subtitle: 'Formale, anche per il tight' },
    'waistcoat-pockets': { title: 'Tasche', subtitle: 'Tasche a filetto e a doppio filetto' },
    'waistcoat-back': { title: 'Dietro', subtitle: 'Dietro in fodera o in tessuto' },
    'waistcoat-topstitching': { title: 'Impunture', subtitle: 'Punto a mano lungo i bordi' },
    'waistcoat-buttonholes': { title: 'Asole', subtitle: 'Finitura delle asole' },
    // Smoking
    'black-tie-jacket-style': { title: 'Giacca da smoking', subtitle: 'In blu notte o nero profondo' },
    'black-tie-facing': { title: 'Rever', subtitle: 'Rivestimento in seta sul rever dello smoking' },
    'black-tie-trouser-details': { title: 'Pantaloni da smoking: gallone e cintura', subtitle: 'Gallone in seta e cintura da smoking' },
    'black-tie-waistcoat': { title: 'Gilet da sera', subtitle: 'Un gilet festoso, dalla scollatura profonda' },
  },
  optionen: {
    // Giacca — davanti, monopetto
    'jacket-sb-1b': {
      label: 'Un bottone',
      subLabel: 'Chiusura bassa e slanciata',
      description: 'Un’abbottonatura a un bottone moderna ed essenziale, con un’apertura a V profonda.',
    },
    'jacket-sb-2b': {
      label: 'Due bottoni',
      subLabel: 'Il classico standard business',
      description: 'Lo standard senza tempo della sartoria maschile svizzera.',
    },
    'jacket-sb-3-2b': {
      label: 'Tre bottoni stirato a due',
      subLabel: 'Morbido rollino napoletano',
      description: 'Il bottone superiore scompare con eleganza nel rever morbidamente arrotolato.',
    },
    'jacket-sb-3b': {
      label: 'Tre bottoni',
      subLabel: 'Tradizionalmente abbottonato alto',
      description: 'Di tradizione britannica e abbottonato alto, con una caduta equilibrata.',
    },
    // Giacca — davanti, doppiopetto
    'jacket-db-4x2': {
      label: 'Quattro bottoni, due da abbottonare',
      subLabel: 'Un doppiopetto sportivo e disinvolto',
      description: 'Quattro bottoni visibili, di cui due da abbottonare.',
    },
    'jacket-db-6x2': {
      label: 'Sei bottoni, due da abbottonare',
      subLabel: 'Il classico di Savile Row',
      description: 'Una silhouette classica con sei bottoni, di cui due da abbottonare.',
    },
    // Rever
    'jacket-lapel-notch-s': {
      label: 'Stretto (6.7 cm)',
      subLabel: 'Larghezza 6.7 cm',
      description: 'Un rever dentellato sottile e preciso, in una larghezza moderna.',
    },
    'jacket-lapel-notch-r': {
      label: 'Normale (8.0 cm)',
      subLabel: 'Larghezza 8.0 cm',
      description: 'Proporzioni equilibrate, ideali con cravatte e colli di camicia classici.',
    },
    'jacket-lapel-notch-l': {
      label: 'Largo (9.5 cm)',
      subLabel: 'Larghezza 9.5 cm',
      description: 'Un rever dentellato deciso, dalla forte presenza sul petto.',
    },
    'jacket-lapel-peak-s': {
      label: 'Stretto (6.7 cm)',
      subLabel: 'Larghezza 6.7 cm',
      description: 'Punte del rever rivolte verso l’alto che slanciano il busto.',
    },
    'jacket-lapel-peak-r': {
      label: 'Normale (8.0 cm)',
      subLabel: 'Larghezza 8.0 cm',
      description: 'Un classico rever a lancia all’italiana.',
    },
    'jacket-lapel-peak-l': {
      label: 'Largo (9.5 cm)',
      subLabel: 'Larghezza 9.5 cm',
      description: 'Un generoso rever a lancia per una presenza autorevole.',
    },
    'jacket-lapel-shawl-s': {
      label: 'Stretto (4.5 cm)',
      subLabel: 'Larghezza 4.5 cm',
      description: 'Un collo sottile e arrotondato per le giacche da sera.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Normale (6.0 cm)',
      subLabel: 'Larghezza 6.0 cm',
      description: 'Una curva continua ed elegante per smoking e giacche in velluto.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'Stretto (9.0 cm)',
      subLabel: 'Larghezza 9.0 cm',
      description: 'Un rever a lancia sottile per l’abito doppiopetto.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Normale (10.0 cm)',
      subLabel: 'Larghezza 10.0 cm',
      description: 'Un pieno rever a lancia per l’eleganza classica della giacca doppiopetto.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'Largo (11.0 cm)',
      subLabel: 'Larghezza 11.0 cm',
      description: 'Un rever a lancia espressivo e ampio.',
    },
    // Tasche
    'jacket-pocket-jetted': {
      label: 'Barchetta e tasca a filetto',
      description: 'La linea più pulita e formale, del tutto priva di pattine.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca a filetto' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta e filetto inclinato',
      description: 'Tasche a filetto inclinate che sottolineano il punto vita.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca a filetto inclinata' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta e tasca con pattina',
      description: 'Versatili tasche dritte con pattina; le pattine si possono anche infilare all’interno.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca con pattina' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta e pattina inclinata',
      description: 'Il tradizionale taglio da equitazione per un punto vita dinamico.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca con pattina inclinata' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta e a toppa',
      description: 'Una combinazione napoletana: taschino a barchetta con tasche laterali a toppa arrotondate.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca a toppa' },
    },
    'jacket-pocket-patch-patch': {
      label: 'A toppa e a toppa',
      description: 'Uno stile blazer disinvolto, con impunture a vista.',
      pocketSpec: { chest: 'Tasca a toppa', side: 'Tasca a toppa' },
    },
    'jacket-pocket-safari': {
      label: 'Safari e safari',
      description: 'Funzionali tasche a soffietto con piega cannolé e chiusura a bottone centrale.',
      pocketSpec: { chest: 'Safari', side: 'Safari' },
    },
    // Tasca portabiglietti
    'jacket-ticket-flap': {
      label: 'Tasca portabiglietti con pattina',
      description: 'La tradizionale tasca portabiglietti inglese sopra la tasca destra con pattina.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca portabiglietti con pattina' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Tasca portabiglietti inclinata',
      description: 'Posta con la stessa inclinazione della tasca con pattina sottostante.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca portabiglietti inclinata con pattina' },
    },
    'jacket-ticket-patch': {
      label: 'Tasca portabiglietti a toppa',
      description: 'Una versione disinvolta sopra la tasca laterale destra a toppa.',
      pocketSpec: { chest: 'Barchetta', side: 'Tasca portabiglietti a toppa' },
    },
    'jacket-ticket-patch-double': {
      label: 'A toppa + tasca portabiglietti',
      description: 'Tasche a toppa ovunque, con una piccola tasca portabiglietti in alto a destra.',
      pocketSpec: { chest: 'Tasca a toppa', side: 'Tasca portabiglietti a toppa' },
    },
    // Dietro e spacchi
    'jacket-back-ventless': {
      label: 'Senza spacco',
      subLabel: 'Un dietro liscio e continuo',
      description: 'Un dietro liscio e particolarmente formale, riservato a smoking e giacche da sera.',
    },
    'jacket-back-single-vent': {
      label: 'Spacco centrale',
      subLabel: 'Un unico spacco al centro del dietro',
      description: 'Il tradizionale spacco centrale all’americana.',
    },
    'jacket-back-side-vents': {
      label: 'Spacchi laterali',
      subLabel: 'Due spacchi ai lati',
      description: 'Cade in modo impeccabile anche da seduti; le mani trovano posto nelle tasche senza che la giacca tiri.',
    },
    // Spalla
    'jacket-shoulder-soft': {
      label: 'Spalla morbida',
      subLabel: 'Spallina sottile · senza rollino · naturale',
      description: 'Cuciture stirate verso l’interno per una caduta leggera, destrutturata e naturale.',
    },
    'jacket-shoulder-traditional': {
      label: 'Spalla classica',
      subLabel: 'Spallina media · rollino medio',
      description: 'Cuciture stirate verso l’esterno per una linea della spalla pulita e curata.',
    },
    'jacket-shoulder-roped': {
      label: 'Spalla con rollino',
      subLabel: 'Spallina decisa · rollino marcato · a pagoda',
      description: 'Cuciture stirate verso l’esterno, con una testa della manica nettamente rialzata (con rollino).',
    },
    // Intelatura
    'jacket-canvas-soft': {
      label: 'Intelatura morbida',
      subLabel: 'Intelatura del petto in crine flessibile e flottante',
      description: 'Un’intelatura leggera che si modella rapidamente sul corpo ed è meravigliosamente comoda da indossare.',
    },
    'jacket-canvas-traditional': {
      label: 'Intelatura classica',
      subLabel: 'Intelatura completa in crine, modellante',
      description: 'Una piegatura del rever precisa e un petto ben modellato che durano per decenni.',
    },
    // Fodera
    'jacket-lining-lined': {
      label: 'Foderata',
      subLabel: 'Fodera nel corpo e nelle maniche',
      description: 'Scivola senza sforzo sulla camicia e protegge completamente l’interno.',
    },
    'jacket-lining-unlined': {
      label: 'Mezza fodera',
      subLabel: 'Fodera nelle maniche e come carré sul dietro',
      description: 'Più traspirabilità per le miti giornate di primavera e d’autunno.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Sfoderata',
      subLabel: 'Né corpo né maniche foderati',
      description: 'Massima circolazione dell’aria, con le cuciture interne rifinite con cura in sbieco.',
    },
    // Bottoni della manica
    'jacket-cuff-0b': {
      label: 'Senza bottoni',
      subLabel: 'Una manica semplice ed essenziale',
      description: 'Una finitura pulita della manica, senza asole né bottoni.',
    },
    'jacket-cuff-3b': {
      label: 'Tre bottoni',
      subLabel: 'Classico europeo',
      description: 'La tradizionale finitura della manica, all’uso continentale.',
    },
    'jacket-cuff-4b': {
      label: 'Quattro bottoni',
      subLabel: 'Lo standard sartoriale',
      description: 'Il riferimento riconosciuto per le maniche nella sartoria di pregio.',
    },
    'jacket-cuff-5b': {
      label: 'Cinque bottoni',
      subLabel: 'Un tocco napoletano',
      description: 'Un dettaglio inconfondibile della grande sartoria italiana.',
    },
    'jacket-cuff-kissing': {
      label: 'Bottoni a cascata (sovrapposti)',
      subLabel: 'I bottoni si sovrappongono l’uno all’altro (cascata)',
      description: 'Un’autentica cascata lavorata a mano sulla manica.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Affiancati',
      subLabel: 'I bottoni si toccano senza sovrapporsi',
      description: 'Una fila pulita all’inglese, con ogni bottone ben piatto.',
    },
    // Impunture
    'jacket-stitch-edge-2mm': {
      label: 'Punto bordo (2 mm)',
      subLabel: 'Davanti, rever, collo e tasche',
      description: 'Un fine punto a mano a 2 mm dal bordo, che definisce i contorni e stabilizza la piegatura del rever.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Punto bordo ovunque (2 mm)',
      subLabel: 'Comprese pinces, spalla e cucitura posteriore',
      description: 'Un punto a mano completo lungo tutte le principali cuciture di costruzione.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Cucitura impunturata (5 mm)',
      subLabel: 'Impuntura marcata per la giacca sportiva',
      description: 'Un’impuntura pronunciata a 5 mm dal bordo, ideale per hopsack strutturato, flanella e tweed.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Impunturata ovunque (5 mm)',
      subLabel: 'Interamente impunturata a 5 mm',
      description: 'Cuciture impunturate su davanti, rever, pinces e tutte le cuciture.',
    },
    // Asola del rever
    'jacket-buttonhole-machine': {
      label: 'A macchina',
      subLabel: 'Punto preciso',
      description: 'Un’asola cucita a macchina, affidabile e resistente.',
    },
    'jacket-buttonhole-hand': {
      label: 'Cucita a mano',
      subLabel: 'Filo di seta su cordoncino, annodato',
      description: 'Cucita a mano con autentica seta da asole su un cordoncino.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Asola milanese',
      subLabel: 'Seta avvolta senza nodi · in rilievo',
      description: 'Il vertice del lavoro a mano: seta lucente, avvolta senza soluzione di continuità su un cordoncino.',
    },
    // Monogramma
    'jacket-monogram-lined': {
      label: 'Monogramma nella fodera',
      subLabel: 'Ricamato sotto il taschino interno',
      description: 'Le iniziali da Lei scelte, ricamate a mano o a macchina sulla paramontura della fodera.',
    },
    'jacket-monogram-unlined': {
      label: 'Monogramma, sfoderata',
      subLabel: 'Ricamato sul filetto della tasca',
      description: 'Collocato con discrezione sul filetto della tasca interna, per giacche leggere e sfoderate.',
    },

    // Pantaloni — davanti
    'trousers-front-flat': {
      label: 'Senza pinces',
      subLabel: 'Liscio e moderno',
      description: 'Un davanti liscio e pulito, senza pinces, per una silhouette snella e slanciata.',
    },
    'trousers-front-single-pleat': {
      label: 'Una pince',
      subLabel: 'Profondità della pince 2 cm',
      description: 'Un po’ più di agio sui fianchi da seduti, con una piega netta.',
    },
    'trousers-front-double-pleat': {
      label: 'Due pinces',
      subLabel: 'Prima 2 cm · seconda 1.25 cm',
      description: 'Un’eleganza generosa con vita alta, piena libertà di movimento e una bella caduta.',
    },
    // Chiusura
    'trousers-closure-extended-belt': {
      label: 'Cintura prolungata',
      subLabel: 'Linguetta della cintura prolungata',
      description: 'Una linguetta della cintura prolungata oltre la patta, per un punto vita più pulito.',
    },
    'trousers-closure-standard': {
      label: 'Patta con bottoni — standard',
      subLabel: 'Patta con bottoni in corno',
      description: 'Una costruzione tradizionale e purista; da seduti non fa pieghe, a differenza della cerniera.',
    },
    'trousers-closure-double-belt': {
      label: 'Doppia cintura',
      subLabel: 'Chiusura prolungata a due bottoni',
      description: 'Una cintura alta a due bottoni, ispirata alla sartoria fiorentina.',
    },
    // Cintura
    'trousers-waistband-side-adjusters': {
      label: 'Regolatori laterali',
      subLabel: 'Fibbie in ottone · senza passanti',
      description: 'Una cintura pulita con linguette di regolazione laterali, del tutto senza cinta.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Passanti',
      subLabel: 'Passanti classici per la cintura',
      description: 'Sei passanti applicati a mano per cinture in pelle pregiata.',
    },
    'trousers-waistband-plain': {
      label: 'Cintura liscia',
      subLabel: 'Una vita semplice ed essenziale',
      description: 'Una cintura pura e liscia, senza passanti né fibbie, da portare con le bretelle.',
    },
    // Tasche laterali
    'trousers-pocket-slanted': {
      label: 'Inclinate',
      subLabel: 'Accesso naturale',
      description: 'Un’apertura inclinata ed ergonomica; la mano entra con naturalezza senza che il tessuto tiri.',
    },
    'trousers-pocket-inseam': {
      label: 'Nella cucitura',
      subLabel: 'Nascoste nella cucitura laterale',
      description: 'Invisibili nella cucitura laterale verticale, per la linea del fianco più pulita.',
    },
    'trousers-pocket-jetted': {
      label: 'Tasca a filetto',
      subLabel: 'Apertura orizzontale, a doppio filetto',
      description: 'Un’apertura fine a doppio filetto per i pantaloni formali.',
    },
    'trousers-pocket-jeans': {
      label: 'Tasca jeans',
      subLabel: 'Apertura arrotondata in alto',
      description: 'Una tasca arrotondata in stile western, ideale per chino e velluto a coste.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'A bocca di rana',
      subLabel: 'Apertura orizzontale sul davanti',
      description: 'Un’apertura orizzontale sul davanti, come sui pantaloni da cavalleria su misura di metà Novecento.',
    },
    // Tasche posteriori
    'trousers-back-none': {
      label: 'Nessuna',
      subLabel: 'Un dietro completamente liscio',
      description: 'Senza tasche posteriori, per una caduta liscia e ininterrotta sul seduto.',
    },
    'trousers-back-left': {
      label: 'Solo a sinistra',
      subLabel: 'Una tasca a filetto a sinistra',
      description: 'Una tasca a filetto con bottone in corno, sul lato sinistro di chi la indossa.',
    },
    'trousers-back-right': {
      label: 'Solo a destra',
      subLabel: 'Una tasca a filetto a destra',
      description: 'Una tasca a filetto con bottone in corno, sul lato destro di chi la indossa.',
    },
    'trousers-back-two': {
      label: 'Due tasche',
      subLabel: 'Due tasche a filetto simmetriche',
      description: 'Classiche tasche a filetto su entrambi i lati, con chiusura a bottone.',
    },
    // Fodera
    'trousers-lining-unlined': {
      label: 'Sfoderati',
      subLabel: 'Solo tessuto, traspirante',
      description: 'Del tutto privi di fodera, per la massima traspirabilità nelle giornate calde.',
    },
    'trousers-lining-half-lined': {
      label: 'Mezza fodera',
      subLabel: 'Foderati sul davanti fin sotto il ginocchio',
      description: 'Una liscia fodera in cupro sopra il ginocchio evita sfregamenti e ginocchia sformate.',
    },
    'trousers-lining-fully-lined': {
      label: 'Interamente foderati',
      subLabel: 'Foderati per tutta la lunghezza',
      description: 'Una fodera completa, confortevole per le pelli sensibili e per i tessuti di lana pesanti.',
    },
    // Orlo
    'trousers-hem-plain-bottom': {
      label: 'Orlo semplice',
      subLabel: 'Leggermente inclinato verso il dietro',
      description: 'Una finitura pulita e dritta, un poco più lunga sul dietro, verso il tallone.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Risvolto (3.0 cm)',
      subLabel: 'Un risvolto discreto',
      description: 'Un risvolto sobrio che conferisce alla gamba un peso delicato.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Risvolto (3.5 cm)',
      subLabel: 'Un risvolto equilibrato',
      description: 'Proporzioni equilibrate, ideali per uomini di statura media.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Risvolto (4.0 cm)',
      subLabel: 'La classica misura sartoriale',
      description: 'Lo standard collaudato della sartoria di pregio, per una caduta ideale e una piega netta.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Risvolto (4.5 cm)',
      subLabel: 'Un risvolto deciso',
      description: 'Un risvolto marcato per i tessuti di lana più pesanti e la flanella.',
    },
    // Impunture
    'trousers-topstitching-none': {
      label: 'Nessuna',
      subLabel: 'Punto a mano AMF solo sulla tasca laterale',
      description: 'Un discreto punto AMF, limitato al bordo della tasca laterale.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Punto bordo (2 mm)',
      subLabel: 'AMF a 2 mm su tasche e cucitura laterale',
      description: 'Un effetto punto a mano a 2 mm dal bordo, lungo tutta la cucitura laterale esterna.',
    },
    // Cintura interna
    'trousers-inside-wb-pleated': {
      label: 'Cintura plissettata',
      subLabel: 'Classica cintura interna a tendina',
      description: 'Una tradizionale cintura interna plissettata, per comfort e flessibilità.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Plissé + bottoni per bretelle',
      subLabel: 'Bottoni interni in corno per le bretelle',
      description: 'Una cintura interna plissettata con sei bottoni interni in corno per bretelle da abbottonare.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Cintura con fermacamicia',
      subLabel: 'Nastro antiscivolo gommato',
      description: 'Un nastro antiscivolo gommato integrato tiene la camicia ben in ordine per tutto il giorno.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Fermacamicia + bottoni per bretelle',
      subLabel: 'Nastro antiscivolo e bottoni per bretelle',
      description: 'Il massimo del comfort: nastro antiscivolo e bottoni per le bretelle insieme.',
    },

    // Gilet — monopetto
    'waistcoat-sb-4b': {
      label: 'Quattro bottoni',
      subLabel: 'Apertura bassa',
      description: 'Abbottonato basso, lascia vedere di più la cravatta e il davanti della camicia.',
    },
    'waistcoat-sb-5b': {
      label: 'Cinque bottoni',
      subLabel: 'Il gilet classico',
      description: 'Il classico gilet europeo per l’abito tre pezzi, con una posizione dei bottoni equilibrata.',
    },
    'waistcoat-sb-6b': {
      label: 'Sei bottoni',
      subLabel: 'Abbottonato alto',
      description: 'Una chiusura alta; per antica regola l’ultimo bottone resta slacciato.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'A ferro di cavallo',
      subLabel: 'Apertura bassa a U, formale',
      description: 'Un’apertura a U sagomata che valorizza la camicia da sera plissettata e il papillon.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Rever dentellato',
      subLabel: 'Collo classico con rever',
      description: 'Dona struttura e una bella cornice al collo e alle spalle.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Collo a scialle',
      subLabel: 'Collo morbidamente arrotondato',
      description: 'Un collo dalla curva morbida e continua, come sui gilet da sera d’epoca.',
    },
    // Gilet — doppiopetto
    'waistcoat-db-6b': {
      label: 'Doppiopetto, sei bottoni',
      subLabel: 'Fondo dritto',
      description: 'Un doppiopetto solenne con il bordo inferiore dritto e orizzontale.',
    },
    'waistcoat-db-8b': {
      label: 'Doppiopetto, otto bottoni',
      subLabel: 'Chiuso alto, formale',
      description: 'Chiuso alto, per il tight o per un tre pezzi di grande presenza.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Doppiopetto, collo a scialle',
      subLabel: 'Collo dalla curva continua',
      description: 'Doppiopetto con un ampio collo a scialle.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Doppiopetto, rever dentellato',
      subLabel: 'Collo con rever dentellato',
      description: 'Un gilet doppiopetto con un rever dentellato dal taglio netto.',
    },
    // Gilet — tasche
    'waistcoat-pocket-jetted': {
      label: 'Tasche a filetto',
      subLabel: 'Due fini tasche a filetto',
      description: 'Tasche a doppio filetto particolarmente piatte, per un punto vita impeccabile.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 tasche a filetto alto',
      subLabel: 'Due classiche tasche a filetto alto',
      description: 'Classiche tasche inferiori a filetto alto.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 tasche a filetto alto',
      subLabel: 'Due sopra, due sotto',
      description: 'Quattro tasche a filetto alto, con spazio per l’orologio da tasca e la catenella.',
    },
    // Gilet — dietro
    'waistcoat-back-cloth': {
      label: 'Dietro in tessuto',
      subLabel: 'Tessuto dell’abito davanti e dietro',
      description: 'Si può portare con stile anche senza giacca, come capo a sé stante.',
    },
    'waistcoat-back-lining': {
      label: 'Dietro in fodera',
      subLabel: 'Dietro traspirante in cupro',
      description: 'Un dietro liscio in cupro, su cui la giacca scivola senza sforzo.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Fodera + martingala',
      subLabel: 'Dietro in cupro con martingala a fibbia',
      description: 'La martingala sul dietro consente la regolazione più fine, per una silhouette su misura e precisa.',
    },
    // Gilet — impunture
    'waistcoat-topstitching-none': {
      label: 'Nessuna',
      subLabel: 'Bordi puliti senza impunture',
      description: 'Una semplicità formale, senza impunture a vista.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Punto bordo (2 mm)',
      subLabel: 'Punto a mano AMF a 2 mm lungo i bordi',
      description: 'Un fine punto a mano a 2 mm dal bordo, che definisce il davanti e la piegatura del collo.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Cucitura impunturata (5 mm)',
      subLabel: 'Impuntura marcata a 5 mm',
      description: 'Un’impuntura pronunciata, ideale per il tweed e i tessuti di lana sportivi.',
    },
    // Gilet — asole
    'waistcoat-buttonhole-none': {
      label: 'Nessuna',
      subLabel: 'Nessuna asola decorativa sul rever',
      description: 'Un bordo del rever pulito, senza asola decorativa.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'A macchina',
      subLabel: 'Punto preciso',
      description: 'Un’asola a macchina ordinata, regolare e molto resistente.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'Cucite a mano',
      subLabel: 'Asole lavorate a mano',
      description: 'Lavorate a mano in puro filo di seta su un cordoncino.',
    },

    // Smoking — giacca
    'black-tie-tux-shawl': {
      label: 'Smoking con collo a scialle',
      subLabel: 'Rever in seta arrotondato · un bottone',
      description: 'Un collo in seta dalla curva continua, con un unico bottone rivestito.',
    },
    'black-tie-tux-peak-sb': {
      label: 'Monopetto, rever a lancia',
      subLabel: 'Rever in seta rivolto verso l’alto',
      description: 'Un rever a lancia ampio ed espressivo, con un fine rivestimento in seta.',
    },
    'black-tie-tux-peak-db': {
      label: 'Smoking doppiopetto',
      subLabel: 'Doppiopetto sei bottoni, due da abbottonare, con rever in seta',
      description: 'Si porta abbottonato, senza fascia da smoking né gilet.',
    },
    // Smoking — rivestimento
    'black-tie-facing-satin': {
      label: 'Raso',
      subLabel: 'Lucente raso di seta su rever e bottoni',
      description: 'Pura seta dalla lucentezza intensa, che cattura la luce delle candele e lo scintillio dei lampadari.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Gros-grain',
      subLabel: 'Seta a coste opaca su rever e bottoni',
      description: 'Seta a coste sottili per un’eleganza serale sobria, ricca di profondità e materia.',
    },
    // Smoking — pantaloni
    'black-tie-trousers-braid': {
      label: 'Gallone in seta',
      subLabel: 'Una banda di seta coordinata lungo la cucitura laterale',
      description: 'Un gallone verticale in raso o gros-grain sopra la cucitura laterale esterna.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Gallone in seta — vista frontale',
      subLabel: 'Il davanti completo con gallone',
      description: 'Visto di fronte, con una caduta pulita in tutta la lunghezza.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Cintura da smoking',
      subLabel: 'Cintura rivestita in seta, senza passanti',
      description: 'Rivestita in seta coordinata, con bottoni interni per le bretelle.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Cintura da smoking — vista frontale',
      subLabel: 'Un davanti liscio come una fascia da smoking',
      description: 'Una chiusura frontale senza interruzioni, che aderisce perfettamente sotto la giacca da smoking.',
    },
    // Smoking — gilet
    'black-tie-horseshoe': {
      label: 'Gilet da sera a ferro di cavallo',
      subLabel: 'Apertura bassa che mostra il davanti della camicia',
      description: 'La tradizionale apertura bassa a ferro di cavallo per l’abbigliamento da sera formale.',
    },
  },
};
