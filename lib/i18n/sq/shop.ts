import type { Woerterbuch } from '../de';

// Shop (vetëm ndërfaqja — tekstet e produkteve vijnë nga Shopify dhe mbeten në gjermanisht)
export const shop: Woerterbuch['shop'] = {
  start: {
    meta: {
      titel: 'Shop — Blini online Woolrich, Gran Sasso dhe Tramarossa',
      beschreibung:
        'Dyqani online i The Sartorialist Cyrih: {n} copë të përzgjedhura me dorë — parka Woolrich, trikotazh Gran Sasso, xhaketa Tramarossa. Dërgesa në gjithë Zvicrën ose provë në showroom-in tonë.',
      ogTitel: 'Garderoba — Shop The Sartorialist Cyrih',
      ogBeschreibung: 'Porositni online Woolrich, Gran Sasso dhe Tramarossa — ose provojini në showroom-in tonë në Kuttelgasse 7.',
      ogAlt: 'Shop The Sartorialist Cyrih',
    },
    sortimentEyebrow: 'Koleksioni',
    alleStuecke: 'Të gjitha copët',
    direktZu: 'Direkt te',
    direktZuAria: 'Shop sipas markës dhe kategorisë',
    mass: {
      eyebrow: 'Kostumi me porosi',
      titel: 'Atë që nuk e gjeni këtu, e qepim me porosi.',
      text: 'Thelbi i punës sonë është kostumi me porosi: kanavacë e plotë (full canvas), 100 % Made in Italy, nga CHF 1’690 dhe gati për t’u tërhequr brenda 20 ditëve pune. Copët në shop janë shoqëruesit e tij.',
      knopf: 'Zbuloni kostumin me porosi',
      termin: 'Rezervoni një takim',
    },
    faqTitel: 'Pyetje rreth shop-it',
    faq: [
      {
        q: 'Ku dërgon shop-i i The Sartorialist?',
        a: ['Dërgojmë në gjithë Zvicrën. Kostot dhe afatet e dërgesës do t’i shihni gjatë pagesës, përpara se të bëni porosinë.'],
      },
      {
        q: 'A mund t’i provoj copët para blerjes?',
        a: [
          'Po. Çdo copë e shop-it gjendet edhe në showroom-in tonë në {strasse} në Cyrih. Rezervoni një takim dhe ne do ta kemi gati masën Tuaj.',
        ],
      },
      {
        q: 'Si paguaj në shop?',
        a: ['Pagesa kryhet përmes procesit të sigurt të pagesës së Shopify. Mënyrat e disponueshme të pagesës shfaqen atje në hapin e fundit.'],
      },
      {
        q: 'A ka kostume me porosi në shop?',
        a: [
          'Jo. Një kostum me porosi pritet sipas masave Tuaja dhe për këtë arsye nis me një takim në showroom-in tonë: nga CHF 1’690, kanavacë e plotë (full canvas), 100 % Made in Italy, gati për t’u tërhequr brenda 20 ditëve pune. Në shop gjeni copët që i shkojnë — trikotazh, parka, pallto dhe xhaketa.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Cyrih',
    eyebrow: 'Shop · {gruppe}',
    mehrUeber: 'Më shumë rreth {label}',
    weitereAria: 'Seksione të tjera të shop-it',
    alleStuecke: 'Të gjitha copët',
    ctaTitel: 'Preferoni ta provoni?',
    ctaText: 'Çdo copë e shop-it gjendet edhe në showroom-in tonë në Kuttelgasse 7 — së bashku me kostumet me porosi nga CHF 1’690.',
  },
  gruppen: { Marke: 'Marka', Für: 'Për', Kategorie: 'Kategoria' },
  seiten: {
    woolrich: {
      h1: 'Blini online parka dhe xhaketa Woolrich',
      title: 'Blini parka dhe xhaketa Woolrich — Shop Cyrih',
      description:
        'Woolrich te The Sartorialist Cyrih: Arctic Parka, Cloud Parka, Wool Shirt Jacket dhe pallto për burra dhe gra. Porositni online ose provojini në showroom-in tonë.',
      intro:
        'Që nga viti 1830, Woolrich përfaqëson veshje të sipërme të krijuara për dimra të vërtetë. Këtu gjeni ikonat e markës — nga Arctic Parka me pupla te Wool Shirt Jacket prej leshi Melton — për burra dhe gra. Porositni online ose provoni masën Tuaj në showroom-in tonë në Kuttelgasse 7.',
    },
    'gran-sasso': {
      h1: 'Blini online trikotazh Gran Sasso',
      title: 'Blini pulovra dhe kashmir Gran Sasso — Shop Cyrih',
      description:
        'Gran Sasso te The Sartorialist Cyrih: pulovra merino, trikotazh kashmiri, half-zip dhe xhaketa të thurura nga rajoni i Abruzzos. Porositni online ose provojini në showroom-in tonë.',
      intro:
        'Gran Sasso thur në rajonin e Abruzzos që nga viti 1952 — merino, kashmir dhe mëndafsh, të prodhuar në punishten e vet në Sant’Egidio alla Vibrata. Pulovrat, half-zip-et dhe xhaketat e thurura rrinë po aq mirë nën një xhaketë sa edhe me xhinse, dhe janë plotësimi ideal i kostumit Tuaj me porosi.',
    },
    tramarossa: {
      h1: 'Blini online xhaketa dhe chinos Tramarossa',
      title: 'Blini xhaketa dhe chinos Tramarossa — Shop Cyrih',
      description:
        'Tramarossa te The Sartorialist Cyrih: xhaketa dhe chinos të shlira në gabardinë italiane. Porositni online ose provojini në showroom-in tonë.',
      intro:
        'Tramarossa nga Veneto bashkon rrobaqepësinë italiane me një qëndrim të shlirë: xhaketa pa strukturë dhe chinos në gabardinë të butë, që shkojnë po aq mirë në përditshmëri sa edhe në zyrë. Gjithçka kombinohet — xhaketa dhe chinos në të njëjtën ngjyrë krijojnë një kostum të shlirë.',
    },
    herren: {
      label: 'Burra',
      h1: 'Blini online veshje për burra',
      title: 'Blini online veshje për burra — parka, trikotazh dhe xhaketa',
      description:
        'Veshje italiane për burra në shop-in e The Sartorialist Cyrih: parka Woolrich, trikotazh Gran Sasso dhe xhaketa Tramarossa. Dërgesa në gjithë Zvicrën.',
      intro:
        'Veshje për burra të përzgjedhura me dorë, si shoqërues të kostumit me porosi: parka dhe pallto për dimrin, trikotazh merino dhe kashmiri, xhaketa dhe chinos të shlira. Gjithçka që kemi në showroom-in tonë në Kuttelgasse mund ta porositni direkt këtu — me dërgesë në gjithë Zvicrën.',
    },
    damen: {
      label: 'Gra',
      h1: 'Blini online parka dhe pallto për gra',
      title: 'Blini parka dhe pallto për gra — Shop Cyrih',
      description:
        'Parka dhe pallto për gra nga Woolrich te The Sartorialist Cyrih: Arctic Parka, Kelly Parka dhe Madison Coat. Porositni online, dërgesa në gjithë Zvicrën.',
      intro:
        'Për gratë kemi xhaketat dimërore të Woolrich: Arctic Parka klasike, Kelly Parka e gjatë dhe Madison Coat — të ngrohta, që nuk lënë ujin të depërtojë dhe me prerje të përjetshme. Do të ishim të lumtur t’Jua tregonim modelet edhe në showroom-in tonë në Cyrih.',
    },
    parkas: {
      label: 'Parka',
      h1: 'Blini online parka',
      title: 'Blini një parka — Woolrich Arctic dhe Cloud Parka',
      description:
        'Parka për burra dhe gra te The Sartorialist Cyrih: Woolrich Arctic Parka, Cloud Parka, Polar dhe Ramar. Me pupla dhe rezistente ndaj ujit.',
      intro:
        'Një parka e mirë i reziston dimrit zviceran dhe duket po aq mirë mbi një kostum sa edhe me xhinse. Parkat tona Woolrich janë me pupla, rezistente ndaj ujit dhe kanë kapuç të heqshëm — nga Cloud Parka e shkurtër te Arctic Parka e gjatë.',
    },
    maentel: {
      label: 'Pallto',
      h1: 'Blini online pallto',
      title: 'Blini një pallto — pallto leshi për burra dhe gra',
      description:
        'Pallto te The Sartorialist Cyrih: pallto leshi dhe pardesy nga Woolrich për burra dhe gra — elegante mbi një kostum, të ngrohta në dimër.',
      intro:
        'Palltoja është gjëja e parë që shohin të tjerët mbi kostumin Tuaj. Palltot tona prej leshi dhe materialesh teknike janë mjaft të gjata për të mbuluar xhaketën poshtë tyre dhe mjaft të përmbajtura për çdo rast.',
    },
    strick: {
      label: 'Trikotazh',
      h1: 'Blini online pulovra dhe trikotazh',
      title: 'Blini pulovra dhe kashmir — trikotazh nga Italia',
      description:
        'Pulovra, half-zip dhe xhaketa të thurura merino dhe kashmiri te The Sartorialist Cyrih — prodhuar nga Gran Sasso në Itali.',
      intro:
        'Trikotazh nga Italia që nuk fryhet kurrë nën një xhaketë: dollakë të hollë merino, half-zip, pulovra kashmiri dhe xhaketa të thurura. Cilësitë më të lehta mund të vishen gjithë vitin; ato më të rënda zënë vendin e një xhakete në vjeshtë.',
    },
    jacken: {
      label: 'Xhaketa dhe overshirt',
      h1: 'Blini online xhaketa dhe overshirt',
      title: 'Blini xhaketa dhe overshirt — Woolrich Wool Shirt Jacket',
      description:
        'Xhaketa dhe overshirt te The Sartorialist Cyrih: Woolrich Wool Shirt Jacket, overshirt teknike dhe xhaketa të shkurtra për burra dhe gra.',
      intro:
        'Midis këmishës dhe palltos: overshirt prej leshi dhe xhaketa të shkurtra për stinët e ndërmjetme. Woolrich Wool Shirt Jacket është prej dekadash një klasik — e fortë, e ngrohtë dhe e endur në lesh Melton.',
    },
    'sakkos-hosen': {
      label: 'Xhaketa dhe pantallona',
      h1: 'Blini online xhaketa kostumi dhe pantallona',
      title: 'Blini xhaketa kostumi dhe chinos — veshje italiane për burra',
      description:
        'Xhaketa kostumi dhe chinos te The Sartorialist Cyrih: xhaketa pa strukturë dhe chinos në gabardinë italiane. Për një kostum me porosi: rezervoni një takim në showroom-in tonë.',
      intro:
        'Xhaketa dhe pantallona të gatshme, por me dorë italiane: pa strukturë, të buta dhe të rehatshme. Nëse kërkoni një kostum që Ju rri vërtet si duhet, rezervoni te ne një takim për një kostum me porosi — nga CHF 1’690, gati brenda 20 ditëve pune.',
    },
  },
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} nga {marke} te The Sartorialist Cyrih, {preis}. Porositni online ose provojeni në showroom-in tonë në Cyrih.',
    versand: 'Dërgesa në gjithë Zvicrën, kostot shfaqen gjatë pagesës',
    anprobe: 'Provë në showroom-in tonë: {strasse}, Cyrih',
    beratung: 'Këshillim personal:',
    beschreibung: 'Përshkrimi',
    alleKategorie: 'Të gjitha: {label}',
    massDazu: 'Një kostum me porosi që i shkon',
    passtEyebrow: 'Shkon mirë me',
    mehrTitel: 'Më shumë nga garderoba',
    ctaEyebrow: 'Këshillim në dyqan',
    ctaTitel: 'Preferoni ta provoni? Ne do ta kemi gati për Ju.',
    ctaText: 'Rezervoni një takim ose kërkoni t’Ju telefonojmë — do t’Ju këshillojmë për masën, kombinimet dhe kostumin e duhur me porosi.',
    groesse: 'Masa {groesse}',
  },
  werte: {
    // Kategorien (Gruppe → Art → Modell)
    'Jacken & Mäntel': 'Xhaketa dhe pallto',
    Strick: 'Trikotazh',
    'Sakkos & Hosen': 'Xhaketa dhe pantallona',
    Parkas: 'Parka',
    Mäntel: 'Pallto',
    Overshirts: 'Overshirt',
    Jacken: 'Xhaketa',
    Chinos: 'Chinos',
    Sakkos: 'Xhaketa kostumi',
    Polos: 'Bluza polo',
    Strickjacken: 'Xhaketa të thurura',
    Troyer: 'Half-zip',
    Rundhals: 'Jakë e rrumbullakët',
    Stehkragen: 'Jakë në këmbë',
    Pullover: 'Pulovra',
    Wollmantel: 'Pallto leshi',
    Technisch: 'Teknike',
    Zweireiher: 'Me dy radhë kopsash',
    Einreiher: 'Me një radhë kopsash',
    Wolle: 'Lesh',
    // Farben
    Schwarz: 'E zezë',
    Rot: 'E kuqe',
    Beige: 'Bezh',
    Braun: 'Kafe',
    Grün: 'Jeshile',
    Grau: 'Gri',
    Blau: 'Blu',
    // Für
    Herren: 'Burra',
    Damen: 'Gra',
  },
  groessenSysteme: { int: 'Ndërkombëtare', it: 'Italiane (xhaketa, trikotazh)', w: 'Beli (pantallona)' },
  grid: {
    facetten: {
      group: 'Kategoria',
      sub: 'Lloji',
      type: 'Modeli',
      brand: 'Marka',
      size: 'Masa',
      color: 'Ngjyra',
      price: 'Çmimi',
      gender: 'Për',
    },
    sort: {
      neu: 'Më të rejat së pari',
      'preis-auf': 'Çmimi: nga më i ulëti',
      'preis-ab': 'Çmimi: nga më i larti',
      marke: 'Marka A–Z',
    },
    anzahlEins: '{n} copë',
    anzahlMehr: '{n} copë',
    zeigen: 'Shfaq {anzahl}',
    groesseAria: 'Masa {groesse}, {anzahl}',
    nurAnLager: 'Vetëm masat në magazinë.',
    markenSuchen: 'Kërkoni në {n} marka',
    markenSuchenAria: 'Kërkoni marka',
    alle: 'Të gjitha',
    alleName: 'Të gjitha: {name}',
    kategorienAria: 'Kategoritë',
    sortiment: 'Koleksioni',
    nachArtAria: '{name} sipas llojit',
    nachModellAria: '{name} sipas modelit',
    alleFilter: 'Të gjitha filtrat',
    filter: 'Filtro',
    nachFiltern: 'Filtro sipas: {label}',
    zuruecksetzen: 'Rivendos',
    ansicht: 'Pamja',
    kompakt: 'Më shumë copë për rresht',
    gross: 'Imazhe më të mëdha',
    sortieren: 'Rendit',
    filterEntfernen: 'Hiq filtrin {label}',
    alleZuruecksetzen: 'Rivendos të gjitha',
    leer: 'Për këtë kombinim nuk kemi aktualisht asgjë në magazinë.',
    alleFilterZuruecksetzen: 'Rivendos të gjitha filtrat',
    sheetTitel: 'Filtro dhe rendit',
    filterSchliessen: 'Mbyll filtrat',
  },
  preis: {
    bis: 'deri në CHF 300',
    mitte: 'CHF 300–700',
    ab: 'nga CHF 700',
    min: 'Min.',
    max: 'Maks.',
    minAria: 'Çmimi minimal',
    maxAria: 'Çmimi maksimal',
    minFeldAria: 'Çmimi minimal në CHF',
    maxFeldAria: 'Çmimi maksimal në CHF',
    imBereichEins: '{n} copë në këtë gamë',
    imBereichMehr: '{n} copë në këtë gamë',
  },
  karte: {
    ausverkauft: 'E shitur',
    sale: 'Ulje',
  },
  buybox: {
    groesseWaehlen: 'Zgjidhni masën',
    groesseHinweis: ' — ju lutemi zgjidhni fillimisht një masë',
    groesseAria: 'Masa',
    ausverkauft: 'E shitur',
    busy: 'Po shtohet …',
    fertig: 'Në shportën Tuaj ✓',
    hinzufuegen: 'Shto në shportë',
    fehler: 'Diçka nuk shkoi mirë. Ju lutemi provoni përsëri ose na telefononi.',
    anprobieren: 'Provojeni në showroom-in tonë',
  },
  galerie: {
    ansicht: '{titel} — pamja {n}',
    bilderAria: 'Imazhet',
    bild: 'Imazhi {n}',
  },
  schrank: {
    eyebrow: 'Shop · The Sartorialist Cyrih',
    h1: 'Garderoba',
    text: '{n} copë të përzgjedhura me dorë nga Woolrich, Gran Sasso dhe Tramarossa — porositni online ose provojini në showroom-in tonë.',
    rolle: 'Karusel',
    aria: 'Garderoba — copë të përzgjedhura me dorë',
    zurueck: 'Copa e mëparshme',
    weiter: 'Copa tjetër',
    ansehen: 'Shiko →',
    alleArtikel: 'Të gjithë {n} artikujt',
  },
};
