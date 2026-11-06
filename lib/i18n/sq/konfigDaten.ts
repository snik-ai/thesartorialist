import type { Woerterbuch } from '../de';

// Albanische Überlagerung von lib/konfigurator/daten.ts (IDs identisch; Codes und Bilder bleiben dort).
// Untergruppen-Titel behalten die Form «Gruppe — Variante»: die Startseite nutzt den Teil vor « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Xhaketa',
      subtitle: 'Themeli i qepjes me porosi',
      description:
        'Kanavacë prej qimeje kali e punuar me dorë, përmasat e jakës, linja e supeve dhe arkitektura e xhepave, marrë drejtpërdrejt nga specifikimet tona të rrobaqepësisë.',
    },
    trousers: {
      title: 'Pantallonat',
      subtitle: 'Linja të pastra dhe detaje të brezit',
      description:
        'Rënie e përsosur e këmbës, mbërthime të brezit, rregullues anësorë (side adjusters) dhe përfundime të fundit, të përshtatura saktësisht me qëndrimin Tuaj.',
    },
    waistcoat: {
      title: 'Jeleku',
      subtitle: 'Prekja përmbyllëse e kostumit me tre pjesë',
      description: 'I prerë që të qëndrojë ngjitur mbi brezin e pantallonave, pa lënë të duket këmisha në mes.',
    },
    'black-tie': {
      title: 'Smokingu',
      subtitle: 'Veshje mbrëmjeje dhe detaje smokingu',
      description: 'Veshje formale mbrëmjeje, në përputhje të rreptë me kodin klasik të veshjes «Black Tie».',
    },
  },
  untergruppen: {
    // Jacket
    'jacket-front-sb': { title: 'Pjesa e përparme — Me një rresht kopsash', subtitle: 'Mbërthimet për xhaketën me një rresht kopsash' },
    'jacket-front-db': { title: 'Pjesa e përparme — Me dy rreshta kopsash', subtitle: 'Mbërthimet për xhaketën me dy rreshta kopsash' },
    'jacket-lapel-notch': { title: 'Jaka — Një rresht, prerje klasike (notch)', subtitle: 'Matur nga vija e kthimit deri te maja e jakës' },
    'jacket-lapel-peak': { title: 'Jaka — Një rresht, me majë (peak)', subtitle: 'Matur nga vija e kthimit deri te buza e jakës' },
    'jacket-lapel-shawl': { title: 'Jaka — Një rresht, jakë shall (shawl collar)', subtitle: 'Një jakë e rrumbullakosur pa ndërprerje' },
    'jacket-lapel-db-peak': { title: 'Jaka — Dy rreshta, me majë (peak)', subtitle: 'E prerë posaçërisht për xhaketën me dy rreshta kopsash' },
    'jacket-pockets': { title: 'Xhepat', subtitle: 'Xhepi i gjoksit dhe xhepat anësorë' },
    'jacket-ticket-pocket': { title: 'Xhepat — Xhep bilete (ticket pocket)', subtitle: 'Xhep shtesë bilete në të djathtë' },
    'jacket-back-style': { title: 'Shpina dhe çarjet', subtitle: 'Çarjet e shpinës (vents) dhe rënia' },
    'jacket-shoulder-style': { title: 'Supi', subtitle: 'Mbushja e supit dhe koka e mëngës' },
    'jacket-canvas': { title: 'Kanavaca', subtitle: 'Kanavacë lundruese e gjoksit (floating canvas)' },
    'jacket-lining': { title: 'Astari', subtitle: 'Shtrirja e astarit prej kupro (cupro)' },
    'jacket-cuff-buttons': { title: 'Kopsat e mëngës', subtitle: 'Numri dhe renditja e kopsave' },
    'jacket-cuff-style': { title: 'Renditja e kopsave të mëngës', subtitle: 'Largësia mes kopsave' },
    'jacket-topstitching': { title: 'Qepje e dukshme (qepje dore AMF)', subtitle: 'Qepje dore në jakë, kollare dhe tegela' },
    'jacket-lapel-buttonhole': { title: 'Vrima e kopsës në jakë', subtitle: 'E përfunduar si asola a mano' },
    'jacket-monogram': { title: 'Monogrami i brendshëm', subtitle: 'Inicialet dhe mbishkrimi i qëndisur' },
    // Trousers
    'trousers-front-style': { title: 'Pjesa e përparme e pantallonave', subtitle: 'Palat dhe paneli i përparmë' },
    'trousers-front-closure': { title: 'Mbërthimi', subtitle: 'Mbërthimi i përparmë dhe i brezit' },
    'trousers-waistband': { title: 'Brezi', subtitle: 'Mbajtja dhe rregullimi i belit' },
    'trousers-side-pockets': { title: 'Xhepat anësorë', subtitle: 'Prerja dhe këndi i hapjes' },
    'trousers-back-pockets': { title: 'Xhepat e pasmë', subtitle: 'Renditja e xhepave me buzë (jetted)' },
    'trousers-lining': { title: 'Astari', subtitle: 'Astari në pjesën e përparme të këmbës' },
    'trousers-hem': { title: 'Fundi', subtitle: 'Me kthesë (turn-up) ose fund i thjeshtë' },
    'trousers-topstitching': { title: 'Qepje e dukshme', subtitle: 'Qepje dore AMF në xhep dhe në tegelin anësor' },
    'trousers-inside-waistband': { title: 'Brezi i brendshëm', subtitle: 'Përfundimi i brezit të brendshëm' },
    // Waistcoat
    'waistcoat-front-sb': { title: 'Jeleku — Me një rresht kopsash', subtitle: 'Pjesa e përparme dhe pozicioni i kopsave' },
    'waistcoat-front-db': { title: 'Jeleku — Me dy rreshta kopsash', subtitle: 'Formal, edhe për veshjen e mëngjesit (morning dress)' },
    'waistcoat-pockets': { title: 'Xhepat', subtitle: 'Xhepa me buzë (jetted) dhe me kapak të ngushtë (welt)' },
    'waistcoat-back': { title: 'Shpina', subtitle: 'Shpinë prej astari ose prej stofi' },
    'waistcoat-topstitching': { title: 'Qepje e dukshme', subtitle: 'Qepje dore përgjatë buzëve' },
    'waistcoat-buttonholes': { title: 'Vrimat e kopsave', subtitle: 'Përfundimi i vrimave të kopsave' },
    // Dinner suit
    'black-tie-jacket-style': { title: 'Xhaketa e smokingut', subtitle: 'Në blu mesnate ose në të zezë të thellë' },
    'black-tie-facing': { title: 'Jaka', subtitle: 'Veshje mëndafshi në jakën e smokingut' },
    'black-tie-trouser-details': { title: 'Pantallonat e smokingut: shirit dhe brez', subtitle: 'Shirit mëndafshi dhe brez smokingu' },
    'black-tie-waistcoat': { title: 'Jeleku i mbrëmjes', subtitle: 'Një jelek festiv me prerje të ulët' },
  },
  optionen: {
    // Jacket — front, single-breasted
    'jacket-sb-1b': {
      label: 'Një kopsë',
      subLabel: 'Mbërthim i ulët dhe i hollë',
      description: 'Mbërthim modern e i thjeshtë me një kopsë, me hapje të thellë në formë V.',
    },
    'jacket-sb-2b': {
      label: 'Dy kopsa',
      subLabel: 'Standardi klasik i biznesit',
      description: 'Standardi i përjetshëm i rrobaqepësisë zviceriane për zotërinj.',
    },
    'jacket-sb-3-2b': {
      label: 'Tre kopsa, dy të mbërthyera (three-roll-two)',
      subLabel: 'Kthim i butë napolitan',
      description: 'Kopsa e sipërme zhduket me elegancë në jakën e kthyer butësisht.',
    },
    'jacket-sb-3b': {
      label: 'Tre kopsa',
      subLabel: 'Tradicionalisht e mbërthyer lart',
      description: 'Tradicionalisht britanike dhe e mbërthyer lart, me rënie të ekuilibruar.',
    },
    // Jacket — front, double-breasted
    'jacket-db-4x2': {
      label: 'Katër kopsa, dy për mbërthim (4×2)',
      subLabel: 'Një xhaketë sportive dhe e çlirët me dy rreshta',
      description: 'Katër kopsa të dukshme, dy prej tyre për t’u mbërthyer.',
    },
    'jacket-db-6x2': {
      label: 'Gjashtë kopsa, dy për mbërthim (6×2)',
      subLabel: 'Klasikja e Savile Row',
      description: 'Siluetë klasike me gjashtë kopsa, dy prej tyre për t’u mbërthyer.',
    },
    // Lapels
    'jacket-lapel-notch-s': {
      label: 'E ngushtë (6,7 cm)',
      subLabel: '6,7 cm e gjerë',
      description: 'Jakë me prerje klasike (notch lapel), e hollë dhe e saktë, në gjerësi moderne.',
    },
    'jacket-lapel-notch-r': {
      label: 'Standarde (8,0 cm)',
      subLabel: '8,0 cm e gjerë',
      description: 'Përmasa të ekuilibruara, ideale me kravata dhe jaka këmishe klasike.',
    },
    'jacket-lapel-notch-l': {
      label: 'E gjerë (9,5 cm)',
      subLabel: '9,5 cm e gjerë',
      description: 'Jakë me prerje klasike, e theksuar, me prani të fortë mbi gjoks.',
    },
    'jacket-lapel-peak-s': {
      label: 'E ngushtë (6,7 cm)',
      subLabel: '6,7 cm e gjerë',
      description: 'Maja të jakës që ngrihen lart dhe e zgjatin pjesën e sipërme të trupit.',
    },
    'jacket-lapel-peak-r': {
      label: 'Standarde (8,0 cm)',
      subLabel: '8,0 cm e gjerë',
      description: 'Jakë klasike me majë (peak lapel) sipas mënyrës italiane.',
    },
    'jacket-lapel-peak-l': {
      label: 'E gjerë (9,5 cm)',
      subLabel: '9,5 cm e gjerë',
      description: 'Jakë bujare me majë për një paraqitje autoritare.',
    },
    'jacket-lapel-shawl-s': {
      label: 'E ngushtë (4,5 cm)',
      subLabel: '4,5 cm e gjerë',
      description: 'Jakë e hollë e rrumbullakosur për xhaketa mbrëmjeje.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Standarde (6,0 cm)',
      subLabel: '6,0 cm e gjerë',
      description: 'Një hark elegant pa ndërprerje për smokingje dhe xhaketa prej kadifeje.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'E ngushtë (9,0 cm)',
      subLabel: '9,0 cm e gjerë',
      description: 'Jakë e ngushtë me majë për kostumin me dy rreshta kopsash.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Standarde (10,0 cm)',
      subLabel: '10,0 cm e gjerë',
      description: 'Jakë e plotë me majë për elegancën klasike të xhaketës me dy rreshta kopsash.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'E gjerë (11,0 cm)',
      subLabel: '11,0 cm e gjerë',
      description: 'Jakë ekspresive me majë, me hark të gjerë.',
    },
    // Pockets
    'jacket-pocket-jetted': {
      label: 'Barchetta dhe xhep me buzë',
      description: 'Linja më e pastër dhe më formale, krejtësisht pa kapakë.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep me buzë (jetted)' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta dhe xhep i pjerrët me buzë',
      description: 'Xhepa të pjerrët me buzë që theksojnë belin.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep i pjerrët me buzë' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta dhe xhep me kapak',
      description: 'Xhepa të drejtë me kapak, të gjithanshëm; kapakët mund të futen edhe brenda.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep me kapak (flap)' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta dhe xhep i pjerrët me kapak',
      description: 'Prerja tradicionale e kalorësisë (hacking) për një bel dinamik.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep i pjerrët me kapak' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta dhe xhep i qepur sipër',
      description: 'Kombinim napolitan: xhep gjoksi barchetta me xhepa anësorë të rrumbullakosur, të qepur sipër (patch).',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep i qepur sipër (patch)' },
    },
    'jacket-pocket-patch-patch': {
      label: 'Xhepa të qepur sipër (patch)',
      description: 'Stil i çlirët blazeri me qepje të dukshme.',
      pocketSpec: { chest: 'Xhep i qepur sipër (patch)', side: 'Xhep i qepur sipër (patch)' },
    },
    'jacket-pocket-safari': {
      label: 'Safari',
      description: 'Xhepa funksionalë me fizarmonikë (bellows), me palë kutie dhe mbërthim me kopsë në mes.',
      pocketSpec: { chest: 'Safari', side: 'Safari' },
    },
    // Ticket pocket
    'jacket-ticket-flap': {
      label: 'Xhep bilete me kapak',
      description: 'Xhepi tradicional anglez i biletës (ticket pocket) mbi xhepin e djathtë me kapak.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep bilete me kapak' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Xhep bilete i pjerrët',
      description: 'I vendosur në të njëjtin kënd si xhepi i pjerrët me kapak poshtë tij.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep bilete i pjerrët me kapak' },
    },
    'jacket-ticket-patch': {
      label: 'Xhep bilete i qepur sipër',
      description: 'Një version i çlirët mbi xhepin e djathtë anësor të qepur sipër.',
      pocketSpec: { chest: 'Barchetta', side: 'Xhep bilete i qepur sipër' },
    },
    'jacket-ticket-patch-double': {
      label: 'Xhepa patch dhe xhep bilete',
      description: 'Kudo xhepa të qepur sipër, me një xhep të vogël bilete lart djathtas.',
      pocketSpec: { chest: 'Xhep i qepur sipër (patch)', side: 'Xhep bilete i qepur sipër' },
    },
    // Back & vents
    'jacket-back-ventless': {
      label: 'Pa çarje',
      subLabel: 'Shpinë e lëmuar, pa ndërprerje',
      description: 'Shpinë veçanërisht formale dhe e lëmuar, e rezervuar për smokingje dhe xhaketa mbrëmjeje.',
    },
    'jacket-back-single-vent': {
      label: 'Çarje në mes',
      subLabel: 'Një çarje e vetme në mes të shpinës',
      description: 'Çarja tradicionale amerikane në mes (centre vent).',
    },
    'jacket-back-side-vents': {
      label: 'Çarje anësore',
      subLabel: 'Dy çarje në anët (side vents)',
      description: 'Bie në mënyrë të përsosur kur jeni ulur; duart Tuaja gjejnë vend në xhepa pa e tërhequr xhaketën.',
    },
    // Shoulder
    'jacket-shoulder-soft': {
      label: 'Sup i butë',
      subLabel: 'Mbushje e hollë · pa ngritje të kokës së mëngës · natyral',
      description: 'Tegela të shtypura nga brenda për një rënie të lehtë, të pastrukturuar dhe natyrale.',
    },
    'jacket-shoulder-traditional': {
      label: 'Sup klasik',
      subLabel: 'Mbushje mesatare · ngritje mesatare e kokës së mëngës',
      description: 'Tegela të shtypura nga jashtë për një linjë të pastër dhe të kuruar mbi sup.',
    },
    'jacket-shoulder-roped': {
      label: 'Sup me rollino (roped shoulder)',
      subLabel: 'Mbushje e fortë · kokë mënge e theksuar · pagoda',
      description: 'Tegela të shtypura nga jashtë, me kokë mënge qartësisht të ngritur (con rollino).',
    },
    // Canvas
    'jacket-canvas-soft': {
      label: 'Kanavacë e butë',
      subLabel: 'Kanavacë gjoksi prej qimeje kali, fleksibile dhe lundruese',
      description: 'Kanavacë e lehtë që merr shpejt formën e trupit dhe vishet jashtëzakonisht rehat.',
    },
    'jacket-canvas-traditional': {
      label: 'Kanavacë klasike',
      subLabel: 'Kanavacë formuese prej qimeje kali në gjithë pjesën e përparme (full canvas)',
      description: 'Kthim i saktë i jakës dhe gjoks i formuar qartë, që zgjasin për dekada.',
    },
    // Lining
    'jacket-lining-lined': {
      label: 'Me astar të plotë',
      subLabel: 'Astar në trup dhe në mëngë',
      description: 'Rrëshqet pa mundim mbi këmishë dhe e mbron plotësisht pjesën e brendshme.',
    },
    'jacket-lining-unlined': {
      label: 'Me gjysmë astari',
      subLabel: 'Astar në mëngë dhe si pjesë e sipërme e shpinës',
      description: 'Më shumë frymëmarrje për ditët e buta të pranverës dhe të vjeshtës.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Pa astar',
      subLabel: 'As trupi, as mëngët me astar',
      description: 'Qarkullim maksimal i ajrit, me tegelat e brendshëm të mbështjellë mjeshtërisht me shirit.',
    },
    // Sleeve buttons
    'jacket-cuff-0b': {
      label: 'Pa kopsa',
      subLabel: 'Mëngë e thjeshtë dhe e pastër',
      description: 'Përfundim i pastër i mëngës, pa vrima kopsash dhe pa kopsa.',
    },
    'jacket-cuff-3b': {
      label: 'Tre kopsa',
      subLabel: 'Klasike evropiane',
      description: 'Përfundimi tradicional i mëngës sipas stilit kontinental.',
    },
    'jacket-cuff-4b': {
      label: 'Katër kopsa',
      subLabel: 'Standardi i rrobaqepësisë',
      description: 'Masa e pranuar për mëngët në rrobaqepësinë e hollë.',
    },
    'jacket-cuff-5b': {
      label: 'Pesë kopsa',
      subLabel: 'Një prekje napolitane',
      description: 'Një detaj i pagabueshëm i rrobaqepësisë së hollë italiane.',
    },
    'jacket-cuff-kissing': {
      label: 'Kopsa që puthen (kissing buttons)',
      subLabel: 'Kopsat mbivendosen njëra mbi tjetrën (cascata)',
      description: 'Një kaskadë e vërtetë e punuar me dorë në mëngë.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Njëra pranë tjetrës',
      subLabel: 'Kopsat preken pa u mbivendosur',
      description: 'Një rresht i pastër britanik, me secilën kopsë të shtrirë rrafsh.',
    },
    // Topstitching
    'jacket-stitch-edge-2mm': {
      label: 'Qepje buze (2 mm)',
      subLabel: 'Buza e përparme, jaka, kollarja dhe xhepat',
      description: 'Qepje e hollë dore 2 mm nga buza, që përcakton konturet dhe stabilizon kthimin e jakës.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Qepje buze kudo (2 mm)',
      subLabel: 'Përfshirë pensat, supet dhe tegelat e shpinës',
      description: 'Qepje dore e plotë përgjatë të gjithë tegelave kryesorë të konstruksionit.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Tegel i ngritur (5 mm)',
      subLabel: 'Qepje e dukshme dalluese për xhaketën sportive',
      description: 'Qepje e theksuar 5 mm nga buza, ideale për hopsack me teksturë, fanellë dhe tweed.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Tegela të ngritur kudo (5 mm)',
      subLabel: 'Qepje e dukshme e plotë në 5 mm',
      description: 'Tegela të ngritur në pjesën e përparme, në jakë, në pensa dhe në të gjithë tegelat.',
    },
    // Lapel buttonhole
    'jacket-buttonhole-machine': {
      label: 'Me makinë',
      subLabel: 'Qepje e saktë me makinë (lockstitch)',
      description: 'Vrimë kopse e qepur me makinë, e besueshme dhe e qëndrueshme.',
    },
    'jacket-buttonhole-hand': {
      label: 'E qepur me dorë',
      subLabel: 'Fije mëndafshi mbi kordon (gimp), me nyje',
      description: 'E qepur me dorë me mëndafsh të vërtetë për vrima kopsash mbi një kordon.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Vrimë kopse milaneze',
      subLabel: 'Mëndafsh i mbështjellë pa nyje · e ngritur',
      description: 'Kulmi i punës me dorë: mëndafsh me shkëlqim, i mbështjellë pa ndërprerje mbi një kordon.',
    },
    // Monogram
    'jacket-monogram-lined': {
      label: 'Monogram në astar',
      subLabel: 'I qëndisur poshtë xhepit të brendshëm të gjoksit',
      description: 'Inicialet sipas zgjedhjes Suaj, të qëndisura me dorë ose me makinë në veshjen e astarit.',
    },
    'jacket-monogram-unlined': {
      label: 'Monogram, pa astar',
      subLabel: 'I qëndisur në buzën e xhepit',
      description: 'I vendosur me diskrecion në buzën e xhepit të brendshëm, për xhaketa të lehta pa astar.',
    },

    // Trousers — front
    'trousers-front-flat': {
      label: 'Pa pala (flat front)',
      subLabel: 'E lëmuar dhe moderne',
      description: 'Pjesë e përparme e lëmuar dhe e pastër, pa pala, për një siluetë të hollë dhe të zgjatur.',
    },
    'trousers-front-single-pleat': {
      label: 'Një palë',
      subLabel: 'Thellësia e palës 2 cm',
      description: 'Pak më shumë hapësirë në ijë kur jeni ulur, me një vijë të mprehtë hekurosjeje.',
    },
    'trousers-front-double-pleat': {
      label: 'Dy pala',
      subLabel: 'E para 2 cm · e dyta 1,25 cm',
      description: 'Elegancë bujare me bel të lartë, liri të plotë lëvizjeje dhe rënie të bukur.',
    },
    // Closure
    'trousers-closure-extended-belt': {
      label: 'Brez i zgjatur',
      subLabel: 'Gjuhëz e zgjatur e brezit',
      description: 'Një gjuhëz e zgjatur e brezit që shkon përtej mbërthimit të përparmë, për një bel më të pastër.',
    },
    'trousers-closure-standard': {
      label: 'Mbërthim me kopsa — standard',
      subLabel: 'Mbërthim i përparmë me kopsa prej briri',
      description: 'Konstruksion tradicional dhe i pastër; ndryshe nga zinxhiri, nuk fryhet kur jeni ulur.',
    },
    'trousers-closure-double-belt': {
      label: 'Brez i dyfishtë',
      subLabel: 'Mbërthim i zgjatur me dy kopsa',
      description: 'Brez i lartë me dy kopsa, i frymëzuar nga rrobaqepësia fiorentine.',
    },
    // Waistband
    'trousers-waistband-side-adjusters': {
      label: 'Rregullues anësorë (side adjusters)',
      subLabel: 'Tokëza prej bronzi · pa gjalmë për rrip',
      description: 'Brez i pastër me gjuhëza rregulluese anësore, krejtësisht pa rrip.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Gjalmë për rrip',
      subLabel: 'Gjalmë klasike për rrip',
      description: 'Gjashtë gjalmë të qepura me dorë për rripa të hollë lëkure.',
    },
    'trousers-waistband-plain': {
      label: 'Brez i thjeshtë',
      subLabel: 'Bel i thjeshtë dhe i pastër',
      description: 'Brez i pastër dhe i lëmuar, pa gjalmë dhe pa tokëza, për t’u veshur me aski (braces).',
    },
    // Side pockets
    'trousers-pocket-slanted': {
      label: 'I pjerrët',
      subLabel: 'Hyrje natyrale',
      description: 'Hapje e pjerrët ergonomike; dora futet natyrshëm pa e tërhequr stofin.',
    },
    'trousers-pocket-inseam': {
      label: 'Në tegel',
      subLabel: 'I fshehur në tegelin anësor',
      description: 'I padukshëm brenda tegelit vertikal anësor, për linjën më të pastër anësore.',
    },
    'trousers-pocket-jetted': {
      label: 'Xhep me buzë',
      subLabel: 'Hapje horizontale, me buzë të dyfishtë',
      description: 'Hapje e hollë me buzë të dyfishtë (double-jetted) për pantallona formale.',
    },
    'trousers-pocket-jeans': {
      label: 'Xhep xhinse',
      subLabel: 'Hapje e rrumbullakosur lart',
      description: 'Xhep i rrumbullakosur në stilin Western, ideal për pantallona chino dhe kadife me vija.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'Gojë bretkose (frog-mouth)',
      subLabel: 'Hapje horizontale përpara',
      description: 'Hapje horizontale përpara, si te pantallonat e kalorësisë të qepura me porosi në mesin e shekullit të kaluar.',
    },
    // Hip pockets
    'trousers-back-none': {
      label: 'Asnjë',
      subLabel: 'Shpinë krejtësisht e lëmuar',
      description: 'Pa xhepa të pasmë, për një rënie të lëmuar dhe pa ndërprerje mbi vithe.',
    },
    'trousers-back-left': {
      label: 'Vetëm majtas',
      subLabel: 'Një xhep me buzë në të majtë',
      description: 'Një xhep me buzë dhe kopsë prej briri, në të majtën e atij që e vesh.',
    },
    'trousers-back-right': {
      label: 'Vetëm djathtas',
      subLabel: 'Një xhep me buzë në të djathtë',
      description: 'Një xhep me buzë dhe kopsë prej briri, në të djathtën e atij që e vesh.',
    },
    'trousers-back-two': {
      label: 'Dy xhepa',
      subLabel: 'Dy xhepa simetrikë me buzë',
      description: 'Xhepa klasikë me buzë në të dyja anët, me mbërthim me kopsë.',
    },
    // Lining
    'trousers-lining-unlined': {
      label: 'Pa astar',
      subLabel: 'Stof i pastër, që merr frymë',
      description: 'Pa asnjë astar, për frymëmarrje maksimale në ditët e ngrohta.',
    },
    'trousers-lining-half-lined': {
      label: 'Me gjysmë astari',
      subLabel: 'Me astar përpara deri poshtë gjurit',
      description: 'Astari i lëmuar prej kupro mbi gjunjë parandalon fërkimin dhe fryrjen e gjunjëve.',
    },
    'trousers-lining-fully-lined': {
      label: 'Me astar të plotë',
      subLabel: 'Me astar në gjithë gjatësinë',
      description: 'Astar i plotë, i rehatshëm për lëkurë të ndjeshme dhe stofa të rëndë leshi.',
    },
    // Hem
    'trousers-hem-plain-bottom': {
      label: 'Fund i thjeshtë',
      subLabel: 'Lehtësisht i pjerrët drejt pjesës së pasme',
      description: 'Përfundim i pastër dhe i drejtë, i prerë pak më gjatë pas, drejt thembrës.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Kthesë (3,0 cm)',
      subLabel: 'Kthesë diskrete (turn-up)',
      description: 'Kthesë e përmbajtur që i jep këmbës së pantallonave një peshë të lehtë.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Kthesë (3,5 cm)',
      subLabel: 'Kthesë e ekuilibruar',
      description: 'Përmasa të ekuilibruara, ideale për burra me gjatësi mesatare.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Kthesë (4,0 cm)',
      subLabel: 'Gjerësia klasike e rrobaqepësisë',
      description: 'Standardi i provuar i rrobaqepësisë së hollë, për rënie ideale dhe vijë të mprehtë hekurosjeje.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Kthesë (4,5 cm)',
      subLabel: 'Kthesë e guximshme',
      description: 'Kthesë e theksuar për stofa më të rëndë leshi dhe fanellë.',
    },
    // Topstitching
    'trousers-topstitching-none': {
      label: 'Asnjë',
      subLabel: 'Qepje dore AMF vetëm në xhepin anësor',
      description: 'Qepje diskrete AMF, e kufizuar në buzën e xhepit anësor.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Qepje buze (2 mm)',
      subLabel: 'AMF 2 mm në xhepa dhe në tegelin anësor',
      description: 'Pamje qepjeje dore 2 mm nga buza, përgjatë gjithë tegelit të jashtëm anësor.',
    },
    // Inside waistband
    'trousers-inside-wb-pleated': {
      label: 'Brez me pala',
      subLabel: 'Brez i brendshëm klasik me pala (curtain)',
      description: 'Brez i brendshëm tradicional me pala, për rehati dhe fleksibilitet.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Pala dhe kopsa për aski',
      subLabel: 'Kopsa të brendshme prej briri për aski',
      description: 'Brez i brendshëm me pala, me gjashtë kopsa të brendshme prej briri për aski me kopsa.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Brez që mban këmishën',
      subLabel: 'Shirit i gomuar mbajtës',
      description: 'Një shirit i integruar i gomuar e mban këmishën të futur mjeshtërisht gjatë gjithë ditës.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Mbajtës këmishe dhe kopsa për aski',
      subLabel: 'Shirit mbajtës dhe kopsa për aski',
      description: 'Rehatia maksimale: shirit mbajtës dhe kopsa për aski së bashku.',
    },

    // Waistcoat — single-breasted
    'waistcoat-sb-4b': {
      label: 'Katër kopsa',
      subLabel: 'Hapje e ulët',
      description: 'I mbërthyer poshtë, duke treguar më shumë nga kravata dhe pjesa e përparme e këmishës.',
    },
    'waistcoat-sb-5b': {
      label: 'Pesë kopsa',
      subLabel: 'Jeleku klasik',
      description: 'Jeleku klasik evropian për kostumin me tre pjesë, me pozicion të ekuilibruar të kopsave.',
    },
    'waistcoat-sb-6b': {
      label: 'Gjashtë kopsa',
      subLabel: 'I mbërthyer lart',
      description: 'Mbërthim i lartë; sipas rregullit të vjetër, kopsa e fundit lihet e hapur.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'Patkua (horseshoe)',
      subLabel: 'Hapje e ulët në formë U, formale',
      description: 'Hapje e formuar në U që nxjerr në pah një këmishë ceremonie me pala dhe papijon.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Jakë me prerje klasike (notch lapel)',
      subLabel: 'Jakë klasike me revers',
      description: 'U jep qafës dhe supeve strukturë dhe një kornizë të hijshme.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Jakë shall (shawl collar)',
      subLabel: 'Jakë e rrumbullakosur butësisht',
      description: 'Jakë e rrumbullakosur butësisht dhe pa ndërprerje, si te jelekët historikë të mbrëmjes.',
    },
    // Waistcoat — double-breasted
    'waistcoat-db-6b': {
      label: 'Me dy rreshta, gjashtë kopsa',
      subLabel: 'Fund i drejtë',
      description: 'Prerje madhështore me dy rreshta kopsash, me buzë të poshtme të drejtë dhe horizontale.',
    },
    'waistcoat-db-8b': {
      label: 'Me dy rreshta, tetë kopsa',
      subLabel: 'I mbyllur lart, formal',
      description: 'I mbyllur lart, për veshjen e mëngjesit (morning dress) ose për një paraqitje autoritare me tre pjesë.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Me dy rreshta, jakë shall',
      subLabel: 'Jakë e rrumbullakosur pa ndërprerje',
      description: 'Me dy rreshta kopsash dhe me një jakë shall me hark të gjerë.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Me dy rreshta, jakë me prerje klasike',
      subLabel: 'Jakë me revers me prerje (notch)',
      description: 'Jelek me dy rreshta kopsash me një jakë me prerje klasike, të prerë me saktësi.',
    },
    // Waistcoat — pockets
    'waistcoat-pocket-jetted': {
      label: 'Xhepa me buzë',
      subLabel: 'Dy xhepa të hollë me buzë',
      description: 'Xhepa veçanërisht të rrafshët me buzë të dyfishtë, për një bel të mprehtë si brisk.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 xhepa me kapak të ngushtë (welt)',
      subLabel: 'Dy xhepa klasikë welt',
      description: 'Xhepa klasikë welt në pjesën e poshtme.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 xhepa me kapak të ngushtë (welt)',
      subLabel: 'Dy sipër, dy poshtë',
      description: 'Katër xhepa welt, me vend për një orë xhepi dhe zinxhirin e saj.',
    },
    // Waistcoat — back
    'waistcoat-back-cloth': {
      label: 'Shpinë prej stofi',
      subLabel: 'Stofi i kostumit përpara dhe pas',
      description: 'Mund të vishet me stil edhe pa xhaketë, si jelek më vete.',
    },
    'waistcoat-back-lining': {
      label: 'Shpinë prej astari',
      subLabel: 'Shpinë prej kupro që merr frymë',
      description: 'Shpinë e lëmuar prej kupro, mbi të cilën xhaketa rrëshqet pa mundim.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Astar dhe rrip shpine',
      subLabel: 'Shpinë prej kupro me rrip me tokëz',
      description: 'Rripi në shpinë lejon rregullimin më të hollë për një siluetë të përshtatur me saktësi.',
    },
    // Waistcoat — topstitching
    'waistcoat-topstitching-none': {
      label: 'Asnjë',
      subLabel: 'Buzë të pastra pa qepje',
      description: 'Thjeshtësi formale, pa qepje të dukshme.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Qepje buze (2 mm)',
      subLabel: 'Qepje dore AMF 2 mm përgjatë buzëve',
      description: 'Qepje e hollë dore 2 mm nga buza, që përcakton buzën e përparme dhe kthimin e jakës.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Tegel i ngritur (5 mm)',
      subLabel: 'Qepje e dukshme dalluese 5 mm',
      description: 'Qepje e theksuar, ideale për tweed dhe stofa sportivë leshi.',
    },
    // Waistcoat — buttonholes
    'waistcoat-buttonhole-none': {
      label: 'Asnjë',
      subLabel: 'Pa vrimë dekorative kopse në jakë',
      description: 'Buzë e pastër e jakës, pa vrimë dekorative kopse.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'Me makinë',
      subLabel: 'Qepje e saktë me makinë (lockstitch)',
      description: 'Vrimë kopse e qepur me makinë, e rregullt, e njëtrajtshme dhe shumë e qëndrueshme.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'E qepur me dorë',
      subLabel: 'Vrima kopsash të punuara me dorë',
      description: 'E punuar me dorë me fije mëndafshi të pastër mbi një kordon.',
    },

    // Dinner suit — jacket
    'black-tie-tux-shawl': {
      label: 'Smoking me jakë shall',
      subLabel: 'Jakë mëndafshi e rrumbullakosur · një kopsë',
      description: 'Jakë mëndafshi e rrumbullakosur pa ndërprerje, me një kopsë të vetme të veshur.',
    },
    'black-tie-tux-peak-sb': {
      label: 'Me një rresht kopsash, jakë me majë',
      subLabel: 'Jakë mëndafshi me maja të ngritura',
      description: 'Jakë ekspresive e gjerë me majë, me veshje të hollë mëndafshi.',
    },
    'black-tie-tux-peak-db': {
      label: 'Smoking me dy rreshta kopsash',
      subLabel: 'Gjashtë kopsa, dy për mbërthim, me jakë mëndafshi',
      description: 'Vishet i mbërthyer, pa brez mëndafshi (cummerbund) dhe pa jelek.',
    },
    // Dinner suit — facing
    'black-tie-facing-satin': {
      label: 'Saten',
      subLabel: 'Saten mëndafshi me shkëlqim në jakë dhe kopsa',
      description: 'Mëndafsh i pastër me shkëlqim të lartë, që kap dritën e qirinjve dhe vezullimin e llambadarëve.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Grosgrain',
      subLabel: 'Mëndafsh mat me brinjëza në jakë dhe kopsa',
      description: 'Mëndafsh me brinjëza të holla, për elegancë të përmbajtur mbrëmjeje me thellësi dhe teksturë.',
    },
    // Dinner suit — trousers
    'black-tie-trousers-braid': {
      label: 'Shirit mëndafshi',
      subLabel: 'Shirit mëndafshi në të njëjtin ton përgjatë tegelit anësor',
      description: 'Shirit vertikal prej sateni ose grosgrain mbi tegelin e jashtëm anësor.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Shirit mëndafshi — pamje përpara',
      subLabel: 'Pjesa e plotë e përparme me shirit',
      description: 'Parë nga përpara, me rënie të pastër kudo.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Brez smokingu',
      subLabel: 'Brez i veshur me mëndafsh, pa gjalmë për rrip',
      description: 'I veshur me mëndafsh në të njëjtin ton, me kopsa të brendshme për aski.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Brez smokingu — pamje përpara',
      subLabel: 'Pjesë e përparme e lëmuar si një cummerbund',
      description: 'Mbërthim i përparmë pa tegel, që qëndron ngjitur poshtë xhaketës së smokingut.',
    },
    // Dinner suit — waistcoat
    'black-tie-horseshoe': {
      label: 'Jelek mbrëmjeje në formë patkoi',
      subLabel: 'Hapje e ulët që tregon pjesën e përparme të këmishës',
      description: 'Hapja tradicionale e ulët në formë patkoi (horseshoe) për veshjen formale të mbrëmjes.',
    },
  },
};
