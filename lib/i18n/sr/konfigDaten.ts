import type { Woerterbuch } from '../de';

// Serbische Überlagerung (Kyrillisch) von lib/konfigurator/daten.ts (IDs identisch; Codes und Bilder bleiben dort).
// Untergruppen-Titel behalten die Form «Gruppe — Variante»: die Startseite nutzt den Teil vor « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Сако',
      subtitle: 'Темељ одела по мери',
      description:
        'Ручно израђени канвас од коњске длаке, пропорције ревера, линија рамена и распоред џепова, преузети директно из наших кројачких спецификација.',
    },
    trousers: {
      title: 'Панталоне',
      subtitle: 'Чисте линије и детаљи појаса',
      description:
        'Беспрекоран пад ногавица, копчање појаса, бочни регулатори и завршеци руба, кројени тачно према Вашем држању.',
    },
    waistcoat: {
      title: 'Прслук',
      subtitle: 'Завршни детаљ одела од три дела',
      description: 'Кројен тако да равно належе преко појаса панталона, без кошуље која вири између.',
    },
    'black-tie': {
      title: 'Смокинг',
      subtitle: 'Вечерња гардероба и детаљи смокинга',
      description: 'Свечана вечерња гардероба, строго у складу са класичним кодексом облачења „Black Tie“.',
    },
  },
  untergruppen: {
    // Jacket
    'jacket-front-sb': { title: 'Предњица — Једноредни', subtitle: 'Копчање једноредног сакоа' },
    'jacket-front-db': { title: 'Предњица — Дворедни', subtitle: 'Копчање дворедног сакоа' },
    'jacket-lapel-notch': { title: 'Ревер — Једноредни, са урезом', subtitle: 'Мерено од линије превоја до врха ревера' },
    'jacket-lapel-peak': { title: 'Ревер — Једноредни, шпицасти', subtitle: 'Мерено од линије превоја до ивице ревера' },
    'jacket-lapel-shawl': { title: 'Ревер — Једноредни, шал-ревер', subtitle: 'Непрекинуто заобљена крагна' },
    'jacket-lapel-db-peak': { title: 'Ревер — Дворедни, шпицасти', subtitle: 'Кројен посебно за дворедни сако' },
    'jacket-pockets': { title: 'Џепови', subtitle: 'Грудни и бочни џепови' },
    'jacket-ticket-pocket': { title: 'Џепови — Тикет-џеп', subtitle: 'Додатни тикет-џеп са десне стране' },
    'jacket-back-style': { title: 'Леђа и шлицеви', subtitle: 'Шлицеви на леђима и пад сакоа' },
    'jacket-shoulder-style': { title: 'Раме', subtitle: 'Јастучићи за рамена и глава рукава' },
    'jacket-canvas': { title: 'Канвас', subtitle: 'Плутајући грудни канвас' },
    'jacket-lining': { title: 'Постава', subtitle: 'Обим поставе од купра' },
    'jacket-cuff-buttons': { title: 'Дугмад на рукаву', subtitle: 'Број и распоред дугмади' },
    'jacket-cuff-style': { title: 'Распоред дугмади на рукаву', subtitle: 'Размак између дугмади' },
    'jacket-topstitching': { title: 'Украсни штеп (AMF ручни бод)', subtitle: 'Ручни бод на реверима, крагни и шавовима' },
    'jacket-lapel-buttonhole': { title: 'Рупица на реверу', subtitle: 'Израђена као asola a mano' },
    'jacket-monogram': { title: 'Унутрашњи монограм', subtitle: 'Извезени иницијали и натписи' },
    // Trousers
    'trousers-front-style': { title: 'Предњица панталона', subtitle: 'Фалте и предњи део' },
    'trousers-front-closure': { title: 'Копчање', subtitle: 'Шлиц и копчање појаса' },
    'trousers-waistband': { title: 'Појас', subtitle: 'Држање и подешавање струка' },
    'trousers-side-pockets': { title: 'Бочни џепови', subtitle: 'Крој и угао отвора' },
    'trousers-back-pockets': { title: 'Задњи џепови', subtitle: 'Распоред паспул-џепова' },
    'trousers-lining': { title: 'Постава', subtitle: 'Постава у предњем делу ногавице' },
    'trousers-hem': { title: 'Руб', subtitle: 'Подврнута ногавица или раван руб' },
    'trousers-topstitching': { title: 'Украсни штеп', subtitle: 'AMF ручни бод на џепу и бочном шаву' },
    'trousers-inside-waistband': { title: 'Унутрашњи појас', subtitle: 'Обрада унутрашњег појаса' },
    // Waistcoat
    'waistcoat-front-sb': { title: 'Прслук — Једноредни', subtitle: 'Предњица и положај дугмади' },
    'waistcoat-front-db': { title: 'Прслук — Дворедни', subtitle: 'Свечани, и за јутарње одело' },
    'waistcoat-pockets': { title: 'Џепови', subtitle: 'Паспул-џепови и џепови са лајсном' },
    'waistcoat-back': { title: 'Леђа', subtitle: 'Леђа од поставе или од тканине' },
    'waistcoat-topstitching': { title: 'Украсни штеп', subtitle: 'Ручни бод дуж ивица' },
    'waistcoat-buttonholes': { title: 'Рупице за дугмад', subtitle: 'Обрада рупица за дугмад' },
    // Dinner suit
    'black-tie-jacket-style': { title: 'Сако смокинга', subtitle: 'У поноћно плавој или дубоко црној' },
    'black-tie-facing': { title: 'Ревер', subtitle: 'Свилена облога на реверу смокинга' },
    'black-tie-trouser-details': { title: 'Панталоне смокинга: галон и појас', subtitle: 'Свилени галон и појас смокинга' },
    'black-tie-waistcoat': { title: 'Вечерњи прслук', subtitle: 'Свечани, дубоко изрезани прслук' },
  },
  optionen: {
    // Jacket — front, single-breasted
    'jacket-sb-1b': {
      label: 'Једно дугме',
      subLabel: 'Ниско, витко копчање',
      description: 'Модерно, сведено копчање на једно дугме са дубоким V-изрезом.',
    },
    'jacket-sb-2b': {
      label: 'Два дугмета',
      subLabel: 'Класични пословни стандард',
      description: 'Безвремени стандард швајцарског кројења мушке гардеробе.',
    },
    'jacket-sb-3-2b': {
      label: 'Три на два',
      subLabel: 'Мекани неаполитански превој',
      description: 'Горње дугме елегантно нестаје у меко превијеном реверу.',
    },
    'jacket-sb-3b': {
      label: 'Три дугмета',
      subLabel: 'Традиционално високо копчање',
      description: 'Традиционално британско, високо копчање са уравнотеженим падом.',
    },
    // Jacket — front, double-breasted
    'jacket-db-4x2': {
      label: 'Четири на два',
      subLabel: 'Спортски, опуштени дворедни сако',
      description: 'Четири видљива дугмета, од којих се два копчају.',
    },
    'jacket-db-6x2': {
      label: 'Шест на два',
      subLabel: 'Класик са Savile Row',
      description: 'Класична силуета са шест дугмади, од којих се два копчају.',
    },
    // Lapels
    'jacket-lapel-notch-s': {
      label: 'Уски (6.7 cm)',
      subLabel: 'Ширина 6.7 cm',
      description: 'Витак, прецизан ревер са урезом у модерној ширини.',
    },
    'jacket-lapel-notch-r': {
      label: 'Стандардни (8.0 cm)',
      subLabel: 'Ширина 8.0 cm',
      description: 'Уравнотежене пропорције, идеалне уз класичне кравате и крагне кошуља.',
    },
    'jacket-lapel-notch-l': {
      label: 'Широки (9.5 cm)',
      subLabel: 'Ширина 9.5 cm',
      description: 'Упечатљив ревер са урезом и снажним присуством на грудима.',
    },
    'jacket-lapel-peak-s': {
      label: 'Уски (6.7 cm)',
      subLabel: 'Ширина 6.7 cm',
      description: 'Врхови ревера окренути навише, који издужују горњи део тела.',
    },
    'jacket-lapel-peak-r': {
      label: 'Стандардни (8.0 cm)',
      subLabel: 'Ширина 8.0 cm',
      description: 'Класични шпицасти ревер на италијански начин.',
    },
    'jacket-lapel-peak-l': {
      label: 'Широки (9.5 cm)',
      subLabel: 'Ширина 9.5 cm',
      description: 'Великодушан шпицасти ревер за појаву која оставља утисак.',
    },
    'jacket-lapel-shawl-s': {
      label: 'Уски (4.5 cm)',
      subLabel: 'Ширина 4.5 cm',
      description: 'Витка, заобљена крагна за вечерње сакое.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Стандардни (6.0 cm)',
      subLabel: 'Ширина 6.0 cm',
      description: 'Непрекинуто елегантан лук за смокинге и сакое од сомота.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'Уски (9.0 cm)',
      subLabel: 'Ширина 9.0 cm',
      description: 'Витак шпицасти ревер за дворедно одело.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Стандардни (10.0 cm)',
      subLabel: 'Ширина 10.0 cm',
      description: 'Пун шпицасти ревер за класичну елеганцију дворедног сакоа.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'Широки (11.0 cm)',
      subLabel: 'Ширина 11.0 cm',
      description: 'Изражајан, широко замахнут шпицасти ревер.',
    },
    // Pockets
    'jacket-pocket-jetted': {
      label: 'Barchetta и паспул-џеп',
      description: 'Најчистија, најсвечанија линија, потпуно без поклопаца.',
      pocketSpec: { chest: 'Barchetta', side: 'Паспул-џеп' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta и коси паспул',
      description: 'Коси паспул-џепови који наглашавају струк.',
      pocketSpec: { chest: 'Barchetta', side: 'Коси паспул-џеп' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta и џеп са поклопцем',
      description: 'Свестрани равни џепови са поклопцем; поклопци се могу и увући.',
      pocketSpec: { chest: 'Barchetta', side: 'Џеп са поклопцем' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta и коси поклопац',
      description: 'Традиционални „hacking“ крој за динамичну линију струка.',
      pocketSpec: { chest: 'Barchetta', side: 'Коси џеп са поклопцем' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta и нашивени',
      description: 'Неаполитанска комбинација: грудни џеп barchetta и заобљени нашивени бочни џепови.',
      pocketSpec: { chest: 'Barchetta', side: 'Нашивени џеп' },
    },
    'jacket-pocket-patch-patch': {
      label: 'Нашивени и нашивени',
      description: 'Опуштени стил блејзера са видљивим украсним штепом.',
      pocketSpec: { chest: 'Нашивени џеп', side: 'Нашивени џеп' },
    },
    'jacket-pocket-safari': {
      label: 'Сафари и сафари',
      description: 'Функционални џепови са мехом, кутијастом фалтом и копчањем на средини.',
      pocketSpec: { chest: 'Сафари', side: 'Сафари' },
    },
    // Ticket pocket
    'jacket-ticket-flap': {
      label: 'Тикет-џеп са поклопцем',
      description: 'Традиционални енглески тикет-џеп изнад десног џепа са поклопцем.',
      pocketSpec: { chest: 'Barchetta', side: 'Тикет-џеп са поклопцем' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Коси тикет-џеп',
      description: 'Постављен под истим углом као коси џеп са поклопцем испод њега.',
      pocketSpec: { chest: 'Barchetta', side: 'Коси тикет-џеп са поклопцем' },
    },
    'jacket-ticket-patch': {
      label: 'Нашивени тикет-џеп',
      description: 'Опуштена варијанта изнад десног нашивеног бочног џепа.',
      pocketSpec: { chest: 'Barchetta', side: 'Нашивени тикет-џеп' },
    },
    'jacket-ticket-patch-double': {
      label: 'Нашивени + тикет-џеп',
      description: 'Свуда нашивени џепови, са малим тикет-џепом горе десно.',
      pocketSpec: { chest: 'Нашивени џеп', side: 'Нашивени тикет-џеп' },
    },
    // Back & vents
    'jacket-back-ventless': {
      label: 'Без шлица',
      subLabel: 'Глатка, непрекинута леђа',
      description: 'Нарочито свечана, глатка леђа, резервисана за смокинге и вечерње сакое.',
    },
    'jacket-back-single-vent': {
      label: 'Средишњи шлиц',
      subLabel: 'Један шлиц на средини леђа',
      description: 'Традиционални амерички средишњи шлиц.',
    },
    'jacket-back-side-vents': {
      label: 'Бочни шлицеви',
      subLabel: 'Два шлица са стране',
      description: 'Беспрекорно пада и у седећем положају; руке лако налазе место у џеповима, а сако не затеже.',
    },
    // Shoulder
    'jacket-shoulder-soft': {
      label: 'Мекано раме',
      subLabel: 'Танак јастучић · без набора на глави рукава · природно',
      description: 'Шавови пеглани ка унутра за лак, неструктуриран и природан пад.',
    },
    'jacket-shoulder-traditional': {
      label: 'Класично раме',
      subLabel: 'Средњи јастучић · умерен набор на глави рукава',
      description: 'Шавови пеглани ка споља за чисту, неговану линију преко рамена.',
    },
    'jacket-shoulder-roped': {
      label: 'Rollino раме',
      subLabel: 'Чврст јастучић · изражен набор на глави рукава · пагода',
      description: 'Шавови пеглани ка споља, са јасно издигнутом главом рукава (con rollino).',
    },
    // Canvas
    'jacket-canvas-soft': {
      label: 'Мекани канвас',
      subLabel: 'Флексибилан, плутајући грудни канвас од коњске длаке',
      description: 'Лаган канвас који се брзо прилагођава телу и изузетно је удобан за ношење.',
    },
    'jacket-canvas-traditional': {
      label: 'Класични канвас',
      subLabel: 'Обликујући канвас од коњске длаке по целој предњици',
      description: 'Прецизан превој ревера и јасно обликована прса која трају деценијама.',
    },
    // Lining
    'jacket-lining-lined': {
      label: 'Потпуно постављен',
      subLabel: 'Постава у телу и рукавима',
      description: 'Без напора клизи преко кошуље и у потпуности штити унутрашњост.',
    },
    'jacket-lining-unlined': {
      label: 'Полупостављен',
      subLabel: 'Постава у рукавима и као леђни кокет',
      description: 'Више прозрачности за благе пролећне и јесење дане.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Без поставе',
      subLabel: 'Ни тело ни рукави нису постављени',
      description: 'Максимална циркулација ваздуха, са унутрашњим шавовима уредно опшивеним траком.',
    },
    // Sleeve buttons
    'jacket-cuff-0b': {
      label: 'Без дугмади',
      subLabel: 'Чист, сведен рукав',
      description: 'Чист завршетак рукава без рупица и дугмади.',
    },
    'jacket-cuff-3b': {
      label: 'Три дугмета',
      subLabel: 'Класично европски',
      description: 'Традиционални завршетак рукава на континентални начин.',
    },
    'jacket-cuff-4b': {
      label: 'Четири дугмета',
      subLabel: 'Кројачки стандард',
      description: 'Признато мерило за рукаве у врхунском кројењу.',
    },
    'jacket-cuff-5b': {
      label: 'Пет дугмади',
      subLabel: 'Неаполитански потез',
      description: 'Непогрешив детаљ врхунског италијанског кројења.',
    },
    'jacket-cuff-kissing': {
      label: 'Kissing buttons (преклопљена)',
      subLabel: 'Дугмад се међусобно преклапају (cascata)',
      description: 'Права ручно израђена каскада на рукаву.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Једно до другог',
      subLabel: 'Дугмад се додирују без преклапања',
      description: 'Чист британски низ, у ком свако дугме лежи равно.',
    },
    // Topstitching
    'jacket-stitch-edge-2mm': {
      label: 'Ивични бод (2 mm)',
      subLabel: 'Предња ивица, ревери, крагна и џепови',
      description: 'Фини ручни бод на 2 mm од ивице, који дефинише ивице и стабилизује превој ревера.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Ивични бод свуда (2 mm)',
      subLabel: 'Укључујући ушивке, рамена и шавове на леђима',
      description: 'Свеобухватан ручни бод дуж свих кључних конструктивних шавова.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Штепован шав (5 mm)',
      subLabel: 'Упечатљив украсни штеп за спортски сако',
      description: 'Изражен украсни штеп на 5 mm од ивице, идеалан за структуриран hopsack, фланел и твид.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Штепован свуда (5 mm)',
      subLabel: 'Потпуно штепован на 5 mm',
      description: 'Штеповани шавови на предњици, реверима, ушивцима и свим шавовима.',
    },
    // Lapel buttonhole
    'jacket-buttonhole-machine': {
      label: 'Машински',
      subLabel: 'Прецизан цик-цак бод',
      description: 'Поуздана, издржљива машински прошивена рупица.',
    },
    'jacket-buttonhole-hand': {
      label: 'Ручно шивена',
      subLabel: 'Свилени конац преко гимпа, са чворићима',
      description: 'Ручно шивена правим свиленим концем за рупице преко гимпа.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Миланска рупица',
      subLabel: 'Свила обмотана без чворића · издигнута',
      description: 'Врхунац ручног рада: сјајна свила, беспрекорно обмотана преко гимпа.',
    },
    // Monogram
    'jacket-monogram-lined': {
      label: 'Монограм у постави',
      subLabel: 'Извезен испод унутрашњег грудног џепа',
      description: 'Иницијали по Вашем избору, извезени ручно или машински на облоги поставе.',
    },
    'jacket-monogram-unlined': {
      label: 'Монограм, без поставе',
      subLabel: 'Извезен на паспулу џепа',
      description: 'Дискретно постављен на паспул унутрашњег џепа, за лаке сакое без поставе.',
    },

    // Trousers — front
    'trousers-front-flat': {
      label: 'Без фалти',
      subLabel: 'Глатко и модерно',
      description: 'Глатка, чиста предњица без фалти за витку, издужену силуету.',
    },
    'trousers-front-single-pleat': {
      label: 'Једна фалта',
      subLabel: 'Дубина фалте 2 cm',
      description: 'Мало више простора у куковима при седењу, уз оштру ивицу.',
    },
    'trousers-front-double-pleat': {
      label: 'Две фалте',
      subLabel: 'Прва 2 cm · друга 1.25 cm',
      description: 'Раскошна елеганција са високим струком, потпуном слободом покрета и лепим падом.',
    },
    // Closure
    'trousers-closure-extended-belt': {
      label: 'Продужени појас',
      subLabel: 'Продужени језичак појаса',
      description: 'Продужени језичак појаса који сеже преко шлица, за чистију линију струка.',
    },
    'trousers-closure-standard': {
      label: 'Шлиц на дугмад — стандард',
      subLabel: 'Шлиц са дугмадима од рога',
      description: 'Традиционална, пуристичка конструкција; за разлику од рајсфершлуса, не испупчује се при седењу.',
    },
    'trousers-closure-double-belt': {
      label: 'Двоструки појас',
      subLabel: 'Продужено копчање са два дугмета',
      description: 'Висок појас са два дугмета, инспирисан фирентинским кројењем.',
    },
    // Waistband
    'trousers-waistband-side-adjusters': {
      label: 'Бочни регулатори',
      subLabel: 'Месингане копче · без гајки за каиш',
      description: 'Чист појас са бочним регулаторима, потпуно без каиша.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Гајке за каиш',
      subLabel: 'Класичне гајке за каиш',
      description: 'Шест ручно пришивених гајки за фине кожне каишеве.',
    },
    'trousers-waistband-plain': {
      label: 'Гладак појас',
      subLabel: 'Једноставан, сведен струк',
      description: 'Чист, гладак појас без гајки и копчи, за ношење уз трегере.',
    },
    // Side pockets
    'trousers-pocket-slanted': {
      label: 'Коси',
      subLabel: 'Природан улаз',
      description: 'Ергономски кос отвор; рука природно склизне унутра, а тканина не затеже.',
    },
    'trousers-pocket-inseam': {
      label: 'У бочном шаву',
      subLabel: 'Скривен у бочном шаву',
      description: 'Невидљив у вертикалном бочном шаву, за најчистију бочну линију.',
    },
    'trousers-pocket-jetted': {
      label: 'Паспул-џеп',
      subLabel: 'Хоризонтални отвор, двоструки паспул',
      description: 'Фини отвор са двоструким паспулом за свечане панталоне.',
    },
    'trousers-pocket-jeans': {
      label: 'Џеп као на фармеркама',
      subLabel: 'Заобљени отвор при врху',
      description: 'Заобљени џеп у вестерн стилу, идеалан за чино панталоне и сомот.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'Жабља уста',
      subLabel: 'Хоризонтални отвор напред',
      description: 'Хоризонтални отвор напред, као на кројеним коњичким панталонама из средине прошлог века.',
    },
    // Hip pockets
    'trousers-back-none': {
      label: 'Без џепова',
      subLabel: 'Потпуно глатка задња страна',
      description: 'Без задњих џепова, за непрекинут, гладак пад преко седалног дела.',
    },
    'trousers-back-left': {
      label: 'Само лево',
      subLabel: 'Један паспул-џеп лево',
      description: 'Један паспул-џеп са дугметом од рога, на левој страни носиоца.',
    },
    'trousers-back-right': {
      label: 'Само десно',
      subLabel: 'Један паспул-џеп десно',
      description: 'Један паспул-џеп са дугметом од рога, на десној страни носиоца.',
    },
    'trousers-back-two': {
      label: 'Два џепа',
      subLabel: 'Два симетрична паспул-џепа',
      description: 'Класични паспул-џепови са обе стране, са копчањем на дугме.',
    },
    // Lining
    'trousers-lining-unlined': {
      label: 'Без поставе',
      subLabel: 'Чиста тканина, прозрачно',
      description: 'Потпуно без поставе, за максималну прозрачност у топлим данима.',
    },
    'trousers-lining-half-lined': {
      label: 'Полупостављене',
      subLabel: 'Напред постављене до испод колена',
      description: 'Глатка постава од купра изнад колена спречава трење и испупчена колена.',
    },
    'trousers-lining-fully-lined': {
      label: 'Потпуно постављене',
      subLabel: 'Постављене целом дужином',
      description: 'Потпуна постава, пријатна за осетљиву кожу и тешке вунене тканине.',
    },
    // Hem
    'trousers-hem-plain-bottom': {
      label: 'Раван руб',
      subLabel: 'Благо закошен ка позади',
      description: 'Чист, раван завршетак, позади мало дужи према пети.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Манжетна (3.0 cm)',
      subLabel: 'Дискретна манжетна',
      description: 'Ненаметљива манжетна која ногавици даје благу тежину.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Манжетна (3.5 cm)',
      subLabel: 'Уравнотежена манжетна',
      description: 'Уравнотежене пропорције, идеалне за мушкарце просечне висине.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Манжетна (4.0 cm)',
      subLabel: 'Класична кројачка ширина',
      description: 'Проверени стандард врхунског кројења, за идеалан пад и оштру ивицу.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Манжетна (4.5 cm)',
      subLabel: 'Смела манжетна',
      description: 'Упечатљива манжетна за теже вунене тканине и фланел.',
    },
    // Topstitching
    'trousers-topstitching-none': {
      label: 'Без штепа',
      subLabel: 'AMF ручни бод само на бочном џепу',
      description: 'Дискретан AMF бод, ограничен на ивицу бочног џепа.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Ивични бод (2 mm)',
      subLabel: '2 mm AMF на џеповима и бочном шаву',
      description: 'Изглед ручног бода на 2 mm од ивице, целом дужином спољног бочног шава.',
    },
    // Inside waistband
    'trousers-inside-wb-pleated': {
      label: 'Појас са фалтама',
      subLabel: 'Класични набрани унутрашњи појас',
      description: 'Традиционални набрани унутрашњи појас за удобност и флексибилност.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Фалте + дугмад за трегере',
      subLabel: 'Унутрашња дугмад од рога за трегере',
      description: 'Набрани унутрашњи појас са шест унутрашњих дугмади од рога за трегере на дугмад.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Појас са држачем кошуље',
      subLabel: 'Гумирана трака против клизања',
      description: 'Уграђена гумирана трака држи кошуљу уредно увученом током целог дана.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Држач кошуље + дугмад за трегере',
      subLabel: 'Трака против клизања и дугмад за трегере',
      description: 'Врхунац удобности: трака против клизања и дугмад за трегере заједно.',
    },

    // Waistcoat — single-breasted
    'waistcoat-sb-4b': {
      label: 'Четири дугмета',
      subLabel: 'Низак изрез',
      description: 'Копча се ниско и открива више кравате и предњице кошуље.',
    },
    'waistcoat-sb-5b': {
      label: 'Пет дугмади',
      subLabel: 'Класични прслук',
      description: 'Класични европски прслук за одело од три дела, са уравнотеженим положајем дугмади.',
    },
    'waistcoat-sb-6b': {
      label: 'Шест дугмади',
      subLabel: 'Високо копчање',
      description: 'Високо копчање; по старом правилу доње дугме остаје откопчано.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'Потковица',
      subLabel: 'Низак изрез у облику слова U, свечано',
      description: 'Обликован U-изрез који истиче свечану кошуљу са плисеом и лептир-машну.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Ревер са урезом',
      subLabel: 'Класична крагна са ревером',
      description: 'Даје врату и раменима структуру и леп оквир.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Шал-ревер',
      subLabel: 'Меко заобљена крагна',
      description: 'Меко, непрекинуто заобљена крагна, као на историјским вечерњим прслуцима.',
    },
    // Waistcoat — double-breasted
    'waistcoat-db-6b': {
      label: 'Дворедни, шест дугмади',
      subLabel: 'Раван доњи руб',
      description: 'Достојанствен дворедни крој са равном, хоризонталном доњом ивицом.',
    },
    'waistcoat-db-8b': {
      label: 'Дворедни, осам дугмади',
      subLabel: 'Високо копчање, свечано',
      description: 'Високо копчање, за јутарње одело или упечатљиву појаву у оделу од три дела.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Дворедни, шал-ревер',
      subLabel: 'Непрекинуто заобљена крагна',
      description: 'Дворедни прслук са широко замахнутим шал-ревером.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Дворедни, ревер са урезом',
      subLabel: 'Крагна са ревером са урезом',
      description: 'Дворедни прслук са оштро кројеним ревером са урезом.',
    },
    // Waistcoat — pockets
    'waistcoat-pocket-jetted': {
      label: 'Паспул-џепови',
      subLabel: 'Два фина паспул-џепа',
      description: 'Нарочито равни џепови са двоструким паспулом, за оштро исцртану линију струка.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 џепа са лајсном',
      subLabel: 'Два класична џепа са лајсном',
      description: 'Класични доњи џепови са лајсном.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 џепа са лајсном',
      subLabel: 'Два горе, два доле',
      description: 'Четири џепа са лајсном, са местом за џепни сат и ланчић.',
    },
    // Waistcoat — back
    'waistcoat-back-cloth': {
      label: 'Леђа од тканине',
      subLabel: 'Тканина одела напред и позади',
      description: 'Може се са стилом носити и без сакоа, као самостални прслук.',
    },
    'waistcoat-back-lining': {
      label: 'Леђа од поставе',
      subLabel: 'Прозрачна леђа од купра',
      description: 'Глатка леђа од купра, преко којих сако клизи без напора.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Постава + каишић на леђима',
      subLabel: 'Леђа од купра са каишићем и копчом',
      description: 'Каишић на леђима омогућава најфиније подешавање за прецизно кројену силуету.',
    },
    // Waistcoat — topstitching
    'waistcoat-topstitching-none': {
      label: 'Без штепа',
      subLabel: 'Чисте ивице без бода',
      description: 'Свечана једноставност без видљивог украсног штепа.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Ивични бод (2 mm)',
      subLabel: '2 mm AMF ручни бод дуж ивица',
      description: 'Фини ручни бод на 2 mm од ивице, који дефинише предњу ивицу и превој крагне.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Штепован шав (5 mm)',
      subLabel: 'Упечатљив украсни штеп од 5 mm',
      description: 'Изражен украсни штеп, идеалан за твид и спортске вунене тканине.',
    },
    // Waistcoat — buttonholes
    'waistcoat-buttonhole-none': {
      label: 'Без рупице',
      subLabel: 'Без украсне рупице на реверу',
      description: 'Чиста ивица ревера без украсне рупице.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'Машински',
      subLabel: 'Прецизан цик-цак бод',
      description: 'Уредна, равномерна и веома издржљива машински израђена рупица.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'Ручно шивене',
      subLabel: 'Ручно рађене рупице за дугмад',
      description: 'Ручно израђене чистим свиленим концем преко гимпа.',
    },

    // Dinner suit — jacket
    'black-tie-tux-shawl': {
      label: 'Смокинг са шал-ревером',
      subLabel: 'Заобљени свилени ревер · једно дугме',
      description: 'Непрекинуто заобљена свилена крагна са једним пресвученим дугметом.',
    },
    'black-tie-tux-peak-sb': {
      label: 'Једноредни, шпицасти ревер',
      subLabel: 'Свилени ревер окренут навише',
      description: 'Изражајан, широки шпицасти ревер са фином свиленом облогом.',
    },
    'black-tie-tux-peak-db': {
      label: 'Дворедни смокинг',
      subLabel: 'Шест на два дугмета, са свиленим реверима',
      description: 'Носи се закопчан, без кумербанда и без прслука.',
    },
    // Dinner suit — facing
    'black-tie-facing-satin': {
      label: 'Сатен',
      subLabel: 'Сјајни свилени сатен на реверима и дугмадима',
      description: 'Чиста свила високог сјаја која хвата светлост свећа и блистање лустера.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Гро-грен',
      subLabel: 'Мат ребраста свила на реверима и дугмадима',
      description: 'Фино ребраста свила за ненаметљиву вечерњу елеганцију са дубином и текстуром.',
    },
    // Dinner suit — trousers
    'black-tie-trousers-braid': {
      label: 'Свилени галон',
      subLabel: 'Усклађена свилена пруга дуж бочног шава',
      description: 'Вертикални галон од сатена или гро-грена преко спољног бочног шава.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Свилени галон — поглед спреда',
      subLabel: 'Цела предњица са галоном',
      description: 'Поглед спреда, са чистим падом целом дужином.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Појас смокинга',
      subLabel: 'Појас обложен свилом, без гајки за каиш',
      description: 'Обложен усклађеном свилом, са унутрашњим дугмадима за трегере.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Појас смокинга — поглед спреда',
      subLabel: 'Глатка предњица попут кумербанда',
      description: 'Беспрекорно копчање напред, које равно належе испод сакоа смокинга.',
    },
    // Dinner suit — waistcoat
    'black-tie-horseshoe': {
      label: 'Вечерњи прслук „потковица“',
      subLabel: 'Низак изрез који открива предњицу кошуље',
      description: 'Традиционални ниски изрез у облику потковице за свечану вечерњу гардеробу.',
    },
  },
};
