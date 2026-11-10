import type { Woerterbuch } from '../de';

// Politika e privatësisë
export const datenschutz: Woerterbuch['datenschutz'] = {
  meta: {
    titel: 'Politika e privatësisë',
    beschreibung:
      'Politika e privatësisë e The Sartorialist Cyrih — informacion mbi mbledhjen dhe përpunimin e të dhënave personale.',
  },
  h1: 'Politika e privatësisë',
  hinweisMassgeblich:
    'Ky përkthim në shqip ofrohet vetëm për lehtësi. Juridikisht i detyrueshëm është versioni gjermanisht: [lexoni versionin gjermanisht](/datenschutzerklaerung/).',
  adresse: { land: 'Zvicër', telefon: 'Telefon: ', email: 'E-mail: ' },
  abschnitte: [
    {
      titel: '1. Mbrojtja e të dhënave në një vështrim',
      bloecke: [
        { h3: 'Informacion i përgjithshëm' },
        {
          p: 'Informacioni i mëposhtëm jep një pasqyrë të thjeshtë se çfarë ndodh me të dhënat Tuaja personale kur vizitoni këtë faqe interneti. Të dhëna personale janë të gjitha të dhënat me të cilat mund të identifikoheni personalisht.',
        },
        { h3: 'Mbledhja e të dhënave në këtë faqe' },
        {
          p: 'Të dhënat në këtë faqe përpunohen nga operatori i faqes, të dhënat e kontaktit të të cilit i gjeni në [impresumin](impressum) e kësaj faqeje. Në faqet jashtë dyqanit nuk vendosen cookies dhe nuk ngarkohet përmbajtje e palëve të treta (p.sh. video ose fonte të jashtme). Përjashtim bëjnë matja anonime e audiencës nga agjencia jonë e uebit (shihni pikën 4, «Matja e audiencës»), filmi në faqen kryesore (Vimeo, shihni pikën 4, «Filmi në faqen kryesore») dhe dyqani online në /shop, i cili funksionon me Shopify (shihni pikën 4, «Dyqani online»).',
        },
        {
          p: 'Disa të dhëna mblidhen kur na i jepni Ju — për shembull, kur na dërgoni një kërkesë për takim me e-mail ose me telefon. Të dhëna të tjera mblidhen automatikisht nga sistemet IT të ofruesit të hostingut kur vizitoni faqen (kryesisht të dhëna teknike si shfletuesi, sistemi operativ ose ora e hapjes së faqes).',
        },
      ],
    },
    {
      titel: '2. Hostingu',
      bloecke: [
        {
          p: 'Kjo faqe interneti mbahet nga një ofrues i jashtëm shërbimi (host). Të dhënat që mblidhen gjatë vizitës në faqe ruhen në serverët e hostit. Këtu bëjnë pjesë kryesisht adresat IP, metadatat dhe të dhënat e komunikimit, si dhe të dhënat e qasjes në faqe. Ne e përdorim hostin në interes të ofrimit të sigurt, të shpejtë dhe efikas të faqes sonë. Hosti ynë i përpunon të dhënat Tuaja vetëm në masën e nevojshme për përmbushjen e detyrimeve të tij kontraktuale.',
        },
      ],
    },
    {
      titel: '3. Informacion i përgjithshëm dhe njoftime të detyrueshme',
      bloecke: [
        { h3: 'Mbrojtja e të dhënave' },
        {
          p: 'Operatorët e këtyre faqeve e marrin shumë seriozisht mbrojtjen e të dhënave Tuaja personale. Ne i trajtojmë të dhënat Tuaja personale në mënyrë konfidenciale dhe në përputhje me rregulloret ligjore për mbrojtjen e të dhënave (veçanërisht Ligjin federal zviceran për mbrojtjen e të dhënave (nDSG/revDSG) dhe — aty ku zbatohet — Rregulloren e Përgjithshme të BE-së për Mbrojtjen e të Dhënave (GDPR/DSGVO)), si dhe me këtë politikë privatësie.',
        },
        {
          p: 'Kini parasysh që transmetimi i të dhënave në internet (p.sh. në komunikimin me e-mail) mund të ketë boshllëqe sigurie. Një mbrojtje e plotë e të dhënave nga qasja e palëve të treta nuk është e mundur.',
        },
        { h3: 'Përgjegjësi për përpunimin' },
        { p: 'Përgjegjës për përpunimin e të dhënave në këtë faqe është:' },
        { adresse: true },
        { h3: 'Të drejtat Tuaja' },
        {
          p: 'Ju keni të drejtë në çdo kohë të merrni falas informacion mbi origjinën, marrësit dhe qëllimin e të dhënave Tuaja personale të ruajtura. Keni gjithashtu të drejtë të kërkoni korrigjimin ose fshirjen e këtyre të dhënave, kufizimin e përpunimit të tyre dhe transferueshmërinë e të dhënave. Një pëlqim i dhënë për përpunimin e të dhënave mund ta tërhiqni në çdo kohë me efekt për të ardhmen. Përveç kësaj, keni të drejtë të paraqisni ankesë pranë autoritetit mbikëqyrës kompetent (në Zvicër: Komisioneri federal për mbrojtjen e të dhënave dhe transparencën, FDPIC/EDÖB).',
        },
        { h3: 'Enkriptimi SSL/TLS' },
        {
          p: 'Për arsye sigurie dhe për të mbrojtur transmetimin e përmbajtjeve konfidenciale, kjo faqe përdor enkriptimin SSL/TLS. Një lidhje të enkriptuar e njihni nga ndryshimi i shiritit të adresës së shfletuesit nga «http://» në «https://» dhe nga simboli i drynit në shiritin e shfletuesit.',
        },
      ],
    },
    {
      titel: '4. Mbledhja e të dhënave në këtë faqe',
      bloecke: [
        { h3: 'Skedarët log të serverit' },
        {
          p: 'Ofruesi i këtyre faqeve mbledh dhe ruan automatikisht informacione në të ashtuquajturit skedarë log të serverit, të cilat shfletuesi Juaj i transmeton automatikisht:',
        },
        {
          liste: [
            'Lloji dhe versioni i shfletuesit',
            'Sistemi operativ i përdorur',
            'URL-ja referuese',
            'Emri i hostit të kompjuterit që bën qasjen',
            'Ora e kërkesës në server',
            'Adresa IP',
          ],
        },
        {
          p: 'Këto të dhëna nuk bashkohen me burime të tjera të dhënash. Operatori i faqes ka një interes legjitim për paraqitjen teknikisht pa gabime dhe optimizimin e faqes së tij — për këtë qëllim, skedarët log të serverit duhet të regjistrohen.',
        },
        { h3: 'Matja e audiencës' },
        {
          p: 'Për të përmirësuar këtë faqe, agjencia jonë e uebit DLM Digital (Cyrih, Zvicër) mat në mënyrë anonime, në emrin tonë, cilat faqe shikohen dhe cilat kanale kontakti (telefon, WhatsApp, e-mail, formular) përdoren. Për këtë nuk vendosen cookies dhe nuk ruhen adresa IP; njohja përtej së njëjtës ditë nuk është e mundur. Përmbajtja e formularëve (p.sh. emri, e-mail, mesazhi) nuk i transmetohet DLM Digital. Të dhënat përpunohen në Zvicër ose në BE.',
        },
        { h3: 'Statistikat tona të vizitorëve' },
        {
          p: 'Përveç kësaj, mbajmë në serverin tonë statistika vizitorësh pa cookies. Regjistrojmë faqen e shikuar dhe titullin e saj, versionin gjuhësor të faqes, faqen referuese (vetëm domenin), parametrat eventualë të fushatës (utm_source, utm_medium, utm_campaign, utm_term, utm_content) dhe nëse vizita erdhi nga një klikim në reklamë të Google (vetëm po/jo), llojin e pajisjes, shfletuesin dhe sistemin operativ (nga identifikuesi i shfletuesit), një madhësi të përafërt të ekranit, gjuhën e shfletuesit, një shtet të përafërt (nga rajoni i cilësimit tuaj të gjuhës ose nga një tregues shteti i ofruesit tonë të hostingut, kurrë nga adresa IP), kohën e dukshme të qëndrimit në faqe, si dhe klikimet në kanalet e kontaktit (telefon, WhatsApp, email, itinerar), veprimet në konfiguruesin dhe në dyqan dhe dërgimin e formularëve (vetëm llojin, kurrë përmbajtjen). Për të numëruar vizitat, nga adresa IP, identifikuesi i shfletuesit dhe data, së bashku me një çelës sekret, krijojmë një vlerë kontrolli të shkurtuar (hash); shikimet e njëpasnjëshme të faqeve i bashkojmë në serverin tonë në një vizitë. Vetë adresa IP nuk ruhet; vlera e kontrollit ndryshon çdo ditë dhe nuk lejon nxjerrjen e përfundimeve për personin tuaj. Nuk përdoren as cookies, as ndonjë hapësirë tjetër ruajtjeje në shfletuesin tuaj. Nëse shfletuesi juaj dërgon sinjalin «Do Not Track» ose «Global Privacy Control», nuk regjistrojmë asgjë. Të dhënat përdoren vetëm për analizën tonë, nuk u jepen palëve të treta dhe ruhen në Zvicër ose në BE. Baza ligjore është interesi ynë i ligjshëm për ta përshtatur faqen sipas nevojave.',
        },
        { h3: 'Filmi në faqen kryesore (Vimeo)' },
        {
          p: 'Në faqen kryesore shfaqim filmin tonë përmes shërbimit video Vimeo (Vimeo.com Inc., New York, SHBA). E përfshijmë me cilësimin «Do Not Track»: Vimeo nuk vendos cookies dhe nuk krijon profile përdorimi. Kur ngarkohet filmi, Vimeo merr domosdoshmërisht, për arsye teknike, adresën Tuaj IP dhe informacione mbi shfletuesin Tuaj.',
        },
        { h3: 'Konfiguruesi i kostumit me porosi' },
        {
          p: 'Zgjedhja Juaj në konfiguruesin e kostumit me porosi («Stile & opsione») ruhet vetëm në shfletuesin Tuaj (localStorage) dhe nuk na transmetohet. E marrim vetëm nëse e dërgoni bashkë me një kërkesë për takim ose na dërgoni PDF-në. Zgjedhjen Tuaj mund ta fshini në çdo kohë përmes «Rivendos të gjitha».',
        },
        { h3: 'Dyqani online (Shopify)' },
        {
          p: 'Dyqani ynë online në thesartorialist.ch/shop funksionon me Shopify (Shopify International Limited, Dublin, Irlandë, dhe Shopify Inc., Ottawa, Kanada). Të dhënat e produkteve, imazhet dhe çmimet ngarkohen nga Shopify; imazhet e produkteve shpërndahen drejtpërdrejt nga serveri i Shopify (cdn.shopify.com), i cili merr domosdoshmërisht, për arsye teknike, adresën Tuaj IP.',
        },
        {
          p: 'Sapo të shtoni një artikull në shportë, vendosim një cookie rreptësisht të nevojshme me identifikuesin e shportës Suaj (i vlefshëm 14 ditë), si dhe cookies të sesionit të Shopify, në mënyrë që shporta dhe porosia të përputhen. Vetë porosinë — adresën, dërgimin dhe pagesën — e përfundoni në arkën e Shopify në shop.thesartorialist.ch, ku vlejnë edhe njoftimet e privatësisë së Shopify. Të dhënat përpunohen për zbatimin e kontratës së shitblerjes. Shopify mund të përpunojë të dhëna edhe në vende jashtë Zvicrës dhe BE-së; për këtë ekzistojnë klauzola kontraktuale standarde.',
        },
        { h3: 'Kërkesat për takim dhe për t’Ju telefonuar përmes faqes' },
        {
          p: 'Nëse kërkoni një takim ose që t’Ju telefonojmë përmes faqes, ua dërgojmë të dhënat Tuaja (emri, telefoni, e-mail, data e dëshiruar dhe — nëse e keni zgjedhur — zgjedhja e stilit) me e-mail atelies sonë dhe Ju dërgojmë një konfirmim. Për dërgimin e këtyre e-maileve përdorim shërbimin Resend (Resend Inc., San Francisco, SHBA), me përpunim të të dhënave në BE. Të dhënat Tuaja i ruajmë gjithashtu në bazën tonë të të dhënave të klientëve, për të përgatitur takimin dhe konsultën Tuaj dhe për të ndjekur kërkesën Tuaj. Të dhënat i përdorim vetëm për trajtimin e kërkesës Suaj dhe për kujdesin ndaj Jush si klient. Ju kontaktojmë me WhatsApp ose SMS vetëm nëse keni dhënë pëlqimin e shprehur për këtë; këtë pëlqim mund ta tërhiqni në çdo kohë.',
        },
        { h3: 'Kërkesat me e-mail ose telefon' },
        {
          p: 'Nëse na kontaktoni me e-mail ose telefon (p.sh. për një kërkesë takimi), kërkesa Juaj, përfshirë të dhënat e kontaktit që jepni, ruhet nga ne për trajtimin e kërkesës dhe për pyetje të mëtejshme. Këto të dhëna nuk i kalojmë pa pëlqimin Tuaj. Të dhënat mbeten te ne derisa të kërkoni fshirjen e tyre ose derisa qëllimi i ruajtjes të mos ekzistojë më. Dispozitat ligjore të detyrueshme — veçanërisht afatet e ruajtjes — mbeten të paprekura.',
        },
      ],
    },
  ],
};
