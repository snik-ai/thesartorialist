import type { Woerterbuch } from '../de';

// Konfiguruesi i kostumit me porosi “Stile & opsione”
export const konfigurator: Woerterbuch['konfigurator'] = {
  meta: {
    titel: 'Stile & opsione — Konfiguruesi i kostumit me porosi',
    beschreibung:
      'Krijoni kostumin Tuaj me porosi: {anzahl} stile & opsione për xhaketën, pantallonat, jelekun dhe smokingun — jakat, kopsat, xhepat, astari. Ruajeni përzgjedhjen si PDF dhe porositni kostumin Tuaj me masë në Cyrih.',
    ogTitel: 'Krijoni kostumin Tuaj me porosi — Stile & opsione, The Sartorialist Cyrih',
    ogBeschreibung:
      'Zgjidhni online jakat, xhepat, kopsat dhe astarin e kostumit Tuaj me porosi — dhe sillni përzgjedhjen në takimin Tuaj në atelie.',
  },
  breadcrumb: { massanzug: 'Kostum me porosi', seite: 'Stile & opsione' },
  hero: {
    eyebrow: 'Stile & opsione · Konfiguruesi i stilit',
    h1: 'Kostumi Juaj me porosi fillon këtu.',
    lead: 'Stili Juaj. Masat Tuaja. Kostumi Juaj. Zbuloni jakat, kopsat, xhepat dhe detajet e përfundimit, dhe përbëni me qetësi atë që Ju shkon — kudo dhe kurdo që të dëshironi. Sillni përzgjedhjen Tuaj në takimin në atelie: aty Ju marrim masat, zgjedhim stofin së bashku dhe e përsosim çdo detaj derisa kostumi t’i përshtatet jo vetëm trupit, por edhe karakterit Tuaj.',
    hinweise: ['Prekni atë që Ju pëlqen', 'Nuk është e nevojshme të zgjidhni gjithçka', 'Përmbledhja më poshtë — si PDF ose drejtpërdrejt për takimin'],
  },
  sogehts: {
    titel: 'Krijoni kostumin Tuaj me porosi — kaq e thjeshtë është',
    absaetze: [
      'Një kostum me porosi është shuma e shumë vendimeve të vogla. Këtu mund të merrni me qetësi të parat: me një ose me dy rreshta kopsash, jakë me prerje klasike (notch) ose me majë (peak), xhepa me buzë (jetted) ose me kapak (flap), sup i butë napolitan ose klasik, me astar ose pa astar. Çdo opsion është i ilustruar, që të shihni saktësisht se çfarë ndryshon.',
      'Zgjidhni vetëm atë që ka rëndësi për Ju. Përzgjedhja Juaj shfaqet në përmbledhjen më poshtë, mund të ruhet si PDF dhe na dërgohet drejtpërdrejt bashkë me kërkesën Tuaj për takim.',
    ],
  },
  zuerich: {
    titel: 'Kostumi Juaj me porosi në Cyrih',
    text: 'Në atelienë tonë në Kuttelgasse 7 Ju marrim masat, Ju tregojmë stofa nga Loro Piana, Vitale Barberis Canonico, Holland & Sherry dhe fabrika të tjera, dhe e përsosim çdo detaj së bashku me Ju. Çdo kostum me porosi punohet me kanavacë të plotë (full canvas), 100 % prodhuar në Itali, nga CHF 1’690 — gati për t’u marrë brenda 20 ditëve pune.',
    linkMassanzug: 'Më shumë rreth kostumeve me porosi në Cyrih',
    linkHochzeit: 'Kostume dasme me porosi',
  },
  faqTitel: 'Pyetje rreth konfiguruesit të kostumit',
  faq: [
    {
      q: 'A mund ta krijoj kostumin tim me porosi online?',
      a: [
        'Po. Te “Stile & opsione” zgjidhni online detajet e kostumit Tuaj me porosi — mbërthimin, jakat, xhepat, supin, astarin, brezin dhe më shumë. Marrja e masave dhe zgjedhja e stofit bëhen më pas personalisht në atelienë tonë në Cyrih, që kostumi të bjerë vërtet në mënyrë të përsosur.',
      ],
    },
    {
      q: 'Për çfarë shërben konfiguruesi i kostumit?',
      a: [
        'Konfiguruesi Ju lejon të merrni vendimet e para të stilit me qetësi në shtëpi: jakat, kopsat, xhepat, supi, astari, brezi dhe fundi i pantallonave. Sillni përzgjedhjen në takimin Tuaj — në atelie Ju marrim masat, zgjedhim stofin dhe e përsosim çdo detaj së bashku.',
      ],
    },
    {
      q: 'A duhet të zgjedh çdo detaj?',
      a: [
        'Jo. Zgjidhni vetëm atë që ka rëndësi për Ju. Çdo gjë që mbetet e hapur e diskutojmë në takim, dhe Ju këshillojmë sinqerisht se çfarë i shkon figurës Suaj dhe rastit.',
      ],
    },
    {
      q: 'Ku ruhet përzgjedhja ime?',
      a: [
        'Vetëm në shfletuesin Tuaj në këtë pajisje. Ne e marrim atë vetëm kur kërkoni një takim me përzgjedhjen Tuaj ose kur na e dërgoni si PDF ose tekst.',
      ],
    },
    {
      q: 'Sa kushton një kostum me porosi me këto detaje?',
      a: [
        'Kostumet tona me porosi fillojnë nga CHF 1’690. Çmimi përfundimtar varet kryesisht nga stofi dhe zakonisht arrin deri në rreth CHF 2’500. Çdo kostum punohet me kanavacë të plotë (full canvas), 100 % prodhuar në Itali, dhe është gati për t’u marrë brenda 20 ditëve pune.',
      ],
    },
  ],
  cta: {
    titel: 'Përzgjedhja gati? Tani lini t’Ju marrim masat.',
    text: 'Sillni përzgjedhjen Tuaj të stilit në një konsultë falas në Kuttelgasse 7 — ose Ju telefonojmë dhe diskutojmë gjithçka me telefon.',
  },
  schema: {
    name: 'Konfiguruesi i kostumit me porosi',
    beschreibung:
      'Përzgjedhje online e stilit për kostume me porosi: xhaketë, pantallona, jelek dhe smoking — përzgjedhja si PDF dhe për takimin Tuaj në atelie në Cyrih.',
  },
  ui: {
    kategorienAria: 'Kategoritë',
    gewaehltAria: '{n} të zgjedhura',
    stoff: 'Stofi',
    meineAuswahl: 'Përzgjedhja ime',
    brustSeite: 'Gjoks · Anë',
    detailsZu: 'Detajet e {label}',
    stoffSub: 'Koleksioni i stofave Holland & Sherry',
    stoffText:
      'Që nga viti 1836, Holland & Sherry end stofa për rrobaqepësit më të mirë të botës. Shfletoni koleksionin dhe shënoni numrat e të preferuarve Tuaj — mostrat do t’i kemi gati për takimin Tuaj në atelie.',
    stoffBildAlt: 'Stofa nga Holland & Sherry',
    stoffAnsehen: 'Shikoni koleksionin e stofave',
    neuesFenster: 'Hapet në një dritare të re',
    stoffKicker: 'Numri i stofit (opsional)',
    stoffPlatzhalter: 'p.sh. 9722022',
    stoffAria: 'Numri i stofit',
    hinzufuegen: 'Shtoni',
    stoffHinweis:
      'Numrin e gjeni në faqen e stofit nën “Product Code”. Janë të mundshëm disa numra — ose thjesht zgjidhni stofin në atelie.',
    stoffEntfernen: 'Hiqni stofin {n}',
    uebersicht: 'Përmbledhja',
    summaryTitelEins: 'Kostumi Juaj me porosi në {n} detaj',
    summaryTitelMehr: 'Kostumi Juaj me porosi në {n} detaje',
    summaryText: 'E ruajtur në këtë shfletues. Masat i marrim së bashku në atelie — aty e përsosim çdo detaj.',
    reset: 'Rivendos të gjitha',
    stoffGruppe: 'Stofi · Holland & Sherry',
    stoffnummer: 'Numri i stofit',
    leerTitel: 'Ende asgjë e zgjedhur.',
    leerText: 'Prekni më lart jakat, xhepat, kopsat dhe astarin — përzgjedhja Juaj do të shfaqet këtu.',
    leerKnopf: 'Filloni me xhaketën',
    entfernen: 'Hiqni {label}',
    terminKnopf: 'Rezervoni një takim me këtë përzgjedhje',
    pdfKnopf: 'Shkarkoni PDF-në',
    pdfLaeuft: 'Po krijohet PDF-ja …',
    pdfFertig: 'PDF-ja u shkarkua',
    pdfFehler: 'PDF-ja nuk mund të krijohej',
    dockLeer: 'Përmbledhja Juaj',
    dockEins: '{n} detaj i zgjedhur',
    dockMehr: '{n} detaje të zgjedhura',
    dockText: 'Nuk është e nevojshme të zgjidhni gjithçka — pjesën tjetër e diskutojmë në atelie.',
    dockGo: 'Te përmbledhja',
    schliessen: 'Mbyllni',
    code: 'Kodi {code}',
    brusttasche: 'Xhepi i gjoksit:',
    seitentaschen: 'Xhepat anësorë:',
    abwaehlen: 'Hiqeni nga përzgjedhja',
    waehlen: 'Zgjidhni këtë detaj',
    auswahl: {
      taschen: 'Gjoks {brust}, anë {seite}',
      stoffKopf: 'STOFI (HOLLAND & SHERRY)',
      stoffnummer: 'Numri i stofit',
      stoffnummern: 'Numrat e stofit',
    },
  },
  pdf: {
    dateiname: 'The-Sartorialist-Perzgjedhja-e-stilit.pdf',
    locale: 'sq-AL',
    dokTitel: 'Përzgjedhja e stilit, kostum me porosi — The Sartorialist Cyrih',
    dokThema: 'Kostum me porosi, Stile & opsione',
    ort: 'CYRIH',
    kopfFolge: 'Përzgjedhja e stilit · {datum}',
    titel: 'Përzgjedhja ime e stilit',
    untertitel: 'për kostumin me porosi — Stile & opsione',
    detailEins: '{n} detaj',
    detailMehr: '{n} detaje',
    stoffEins: '{n} stof',
    stoffMehr: '{n} stofa',
    stoffAbschnitt: 'Stofi · Holland & Sherry',
    stoffnummerKopf: 'NUMRI I STOFIT',
    stoffnummernKopf: 'NUMRAT E STOFIT',
    notizen: 'Shënime për atelienë',
    fussHinweis: 'Masat Ju i marrim në atelie — sillni këtë përzgjedhje në takimin Tuaj.',
    seite: 'Faqja {p} nga {n}',
  },
};
