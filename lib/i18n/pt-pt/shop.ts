import type { Woerterbuch } from '../de';

// Loja (apenas interface — os textos dos produtos vêm da Shopify e ficam em alemão)
export const shop: Woerterbuch['shop'] = {
  start: {
    meta: {
      titel: 'Loja — Comprar Woolrich, Gran Sasso e Tramarossa Online',
      beschreibung:
        'A loja online do The Sartorialist Zurique: {n} peças escolhidas a dedo — parkas Woolrich, malhas Gran Sasso, casacos Tramarossa. Entrega em toda a Suíça ou provas no nosso showroom.',
      ogTitel: 'O Guarda-Roupa — Loja The Sartorialist Zurique',
      ogBeschreibung: 'Encomende Woolrich, Gran Sasso e Tramarossa online — ou experimente no nosso showroom da Kuttelgasse 7.',
      ogAlt: 'Loja The Sartorialist Zurique',
    },
    sortimentEyebrow: 'A coleção',
    alleStuecke: 'Todas as peças',
    direktZu: 'Ir para',
    direktZuAria: 'Comprar por marca e categoria',
    mass: {
      eyebrow: 'O fato por medida',
      titel: 'O que aqui não encontra, fazemos por medida.',
      text: 'A nossa especialidade é o fato por medida: full canvas, 100 % made in Italy, a partir de CHF 1’690 e pronto a levantar em 20 dias úteis. As peças da loja são as suas companheiras.',
      knopf: 'Descobrir o por medida',
      termin: 'Marcar uma consulta',
    },
    faqTitel: 'Perguntas sobre a loja',
    faq: [
      {
        q: 'Para onde entrega a loja do The Sartorialist?',
        a: ['Entregamos em toda a Suíça. Os custos e prazos de envio são apresentados no checkout, antes de efetuar a encomenda.'],
      },
      {
        q: 'Posso experimentar as peças antes de comprar?',
        a: [
          'Sim. Todas as peças da loja estão também disponíveis no nosso showroom da {strasse}, em Zurique. Marque uma consulta e teremos o seu tamanho preparado.',
        ],
      },
      {
        q: 'Como pago na loja?',
        a: ['O pagamento é feito através do checkout seguro da Shopify. Os métodos de pagamento disponíveis são apresentados no último passo.'],
      },
      {
        q: 'Há fatos por medida na loja?',
        a: [
          'Não. Um fato por medida é cortado às suas medidas e começa, por isso, com uma consulta no nosso showroom: a partir de CHF 1’690, full canvas, 100 % made in Italy, pronto a levantar em 20 dias úteis. Na loja encontra as peças que o acompanham — malhas, parkas, sobretudos e casacos.',
        ],
      },
    ],
  },
  kategorie: {
    ogTitel: '{h1} — The Sartorialist Zurique',
    eyebrow: 'Loja · {gruppe}',
    mehrUeber: 'Mais sobre {label}',
    weitereAria: 'Outras secções da loja',
    alleStuecke: 'Todas as peças',
    ctaTitel: 'Prefere experimentar?',
    ctaText: 'Todas as peças da loja estão também disponíveis no nosso showroom da Kuttelgasse 7 — tal como os fatos por medida a partir de CHF 1’690.',
  },
  gruppen: { Marke: 'Marca', Für: 'Para', Kategorie: 'Categoria' },
  seiten: {
    woolrich: {
      h1: 'Comprar Parkas e Casacos Woolrich Online',
      title: 'Comprar Parkas e Casacos Woolrich — Loja Zurique',
      description:
        'Woolrich no The Sartorialist Zurique: Arctic Parka, Cloud Parka, Wool Shirt Jackets e sobretudos para homem e senhora. Encomende online ou experimente no nosso showroom.',
      intro:
        'Desde 1830 que a Woolrich é sinónimo de agasalhos feitos para invernos a sério. Aqui encontra os ícones da marca — do Arctic Parka com enchimento de penas à Wool Shirt Jacket em lã Melton — para homem e senhora. Encomende online ou experimente o seu tamanho no nosso showroom da Kuttelgasse 7.',
    },
    'gran-sasso': {
      h1: 'Comprar Malhas Gran Sasso Online',
      title: 'Comprar Camisolas e Caxemira Gran Sasso — Loja Zurique',
      description:
        'Gran Sasso no The Sartorialist Zurique: camisolas de merino, malhas de caxemira, camisolas de meio fecho e casacos de malha dos Abruzos. Encomende online ou experimente no nosso showroom.',
      intro:
        'A Gran Sasso tece malhas nos Abruzos desde 1952 — merino, caxemira e seda, produzidos na sua própria manufatura em Sant’Egidio alla Vibrata. As camisolas, as camisolas de meio fecho e os casacos de malha assentam tão bem por baixo de um casaco como com jeans e são o complemento ideal do seu fato por medida.',
    },
    tramarossa: {
      h1: 'Comprar Casacos e Chinos Tramarossa Online',
      title: 'Comprar Casacos e Chinos Tramarossa — Loja Zurique',
      description:
        'Tramarossa no The Sartorialist Zurique: casacos e chinos descontraídos em gabardina italiana. Encomende online ou experimente no nosso showroom.',
      intro:
        'A Tramarossa, do Véneto, alia a alfaiataria italiana a uma atitude descontraída: casacos desestruturados e chinos em gabardina macia, que funcionam tanto no dia a dia como no escritório. Tudo se combina — casaco e chinos da mesma cor formam um fato descontraído.',
    },
    herren: {
      label: 'Homem',
      h1: 'Comprar Moda Masculina Online',
      title: 'Comprar Moda Masculina Online — Parkas, Malhas e Casacos',
      description:
        'Moda masculina italiana na loja do The Sartorialist Zurique: parkas Woolrich, malhas Gran Sasso e casacos Tramarossa. Entrega em toda a Suíça.',
      intro:
        'Moda masculina escolhida a dedo para acompanhar o fato por medida: parkas e sobretudos para o inverno, malhas em merino e caxemira, casacos e chinos descontraídos. Tudo o que temos no nosso showroom da Kuttelgasse pode ser encomendado aqui diretamente — com entrega em toda a Suíça.',
    },
    damen: {
      label: 'Senhora',
      h1: 'Comprar Parkas e Sobretudos de Senhora Online',
      title: 'Comprar Parkas e Sobretudos de Senhora — Loja Zurique',
      description:
        'Parkas e sobretudos de senhora da Woolrich no The Sartorialist Zurique: Arctic Parka, Kelly Parka e Madison Coat. Encomende online, entrega em toda a Suíça.',
      intro:
        'Para senhora, temos os casacos de inverno da Woolrich: o clássico Arctic Parka, o comprido Kelly Parka e o Madison Coat — quentes, repelentes à água e de corte intemporal. Teremos também todo o gosto em mostrar-lhe os modelos no nosso showroom em Zurique.',
    },
    parkas: {
      label: 'Parkas',
      h1: 'Comprar Parkas Online',
      title: 'Comprar uma Parka — Woolrich Arctic e Cloud Parka',
      description:
        'Parkas para homem e senhora no The Sartorialist Zurique: Woolrich Arctic Parka, Cloud Parka, Polar e Ramar. Com enchimento de penas e repelentes à água.',
      intro:
        'Uma boa parka resiste ao inverno suíço e fica tão bem sobre um fato como com jeans. As nossas parkas Woolrich têm enchimento de penas, são repelentes à água e têm capuz amovível — do curto Cloud Parka ao comprido Arctic Parka.',
    },
    maentel: {
      label: 'Sobretudos',
      h1: 'Comprar Sobretudos Online',
      title: 'Comprar um Sobretudo — Sobretudos de Lã para Homem e Senhora',
      description:
        'Sobretudos no The Sartorialist Zurique: sobretudos de lã da Woolrich para homem e senhora — elegantes sobre um fato, quentes no inverno.',
      intro:
        'O sobretudo é a primeira coisa que se vê sobre o seu fato. Os nossos sobretudos em lã e em tecidos técnicos são suficientemente compridos para cobrir o casaco por baixo e suficientemente discretos para qualquer ocasião.',
    },
    strick: {
      label: 'Malhas',
      h1: 'Comprar Camisolas e Malhas Online',
      title: 'Comprar Camisolas e Caxemira — Malhas de Itália',
      description:
        'Camisolas, camisolas de meio fecho e casacos de malha em merino e caxemira no The Sartorialist Zurique — produzidos pela Gran Sasso em Itália.',
      intro:
        'Malhas de Itália que nunca criam volume por baixo de um casaco: golas altas finas em merino, camisolas de meio fecho, camisolas de caxemira e casacos de malha. As qualidades mais leves usam-se todo o ano; as mais pesadas substituem o casaco no outono.',
    },
    jacken: {
      label: 'Casacos e Overshirts',
      h1: 'Comprar Casacos e Overshirts Online',
      title: 'Comprar Casacos e Overshirts — Woolrich Wool Shirt Jacket',
      description:
        'Casacos e overshirts no The Sartorialist Zurique: Woolrich Wool Shirt Jackets, overshirts técnicas e casacos curtos para homem e senhora.',
      intro:
        'Entre a camisa e o sobretudo: overshirts de lã e casacos curtos para as meias-estações. A Woolrich Wool Shirt Jacket é um clássico há décadas — robusta, quente e tecida em lã Melton.',
    },
    'sakkos-hosen': {
      label: 'Blazers e Calças',
      h1: 'Comprar Blazers e Calças Online',
      title: 'Comprar Blazers e Chinos — Moda Masculina Italiana',
      description:
        'Blazers e chinos no The Sartorialist Zurique: blazers desestruturados e chinos em gabardina italiana. Para um fato por medida: marque uma consulta no nosso showroom.',
      intro:
        'Blazers e calças de pronto-a-vestir, mas com mão italiana: desestruturados, macios e confortáveis. Se procura um fato que assente verdadeiramente, marque connosco uma consulta para um fato por medida — a partir de CHF 1’690, pronto em 20 dias úteis.',
    },
  },
  produkt: {
    metaTitel: '{titel} — {marke}',
    metaBeschreibung: '{titel} da {marke} no The Sartorialist Zurique, {preis}. Encomende online ou experimente no nosso showroom em Zurique.',
    versand: 'Entrega em toda a Suíça, custos indicados no checkout',
    anprobe: 'Provas no nosso showroom: {strasse}, Zurique',
    beratung: 'Aconselhamento pessoal:',
    beschreibung: 'Descrição',
    alleKategorie: 'Todos: {label}',
    massDazu: 'Um fato por medida a condizer',
    passtEyebrow: 'Combina bem com',
    mehrTitel: 'Mais do guarda-roupa',
    ctaEyebrow: 'Aconselhamento na loja',
    ctaTitel: 'Prefere experimentar? Teremos a peça preparada para si.',
    ctaText: 'Marque uma consulta ou peça que lhe liguemos — aconselhamo-lo sobre o tamanho, as combinações e o fato por medida certo.',
    groesse: 'Tamanho {groesse}',
  },
  werte: {
    // Kategorien (Gruppe → Art → Modell)
    'Jacken & Mäntel': 'Casacos e Sobretudos',
    Strick: 'Malhas',
    'Sakkos & Hosen': 'Blazers e Calças',
    Parkas: 'Parkas',
    Mäntel: 'Sobretudos',
    Overshirts: 'Overshirts',
    Jacken: 'Casacos',
    Chinos: 'Chinos',
    Sakkos: 'Blazers',
    Polos: 'Polos',
    Strickjacken: 'Casacos de malha',
    Troyer: 'Meio fecho',
    Rundhals: 'Gola redonda',
    Stehkragen: 'Gola subida',
    Pullover: 'Camisolas',
    Wollmantel: 'Sobretudo de lã',
    Technisch: 'Técnico',
    Zweireiher: 'Trespassado',
    Einreiher: 'Abotoamento simples',
    Wolle: 'Lã',
    // Farben
    Schwarz: 'Preto',
    Rot: 'Vermelho',
    Beige: 'Bege',
    Braun: 'Castanho',
    Grün: 'Verde',
    Grau: 'Cinzento',
    Blau: 'Azul',
    // Für
    Herren: 'Homem',
    Damen: 'Senhora',
  },
  groessenSysteme: { int: 'Internacional', it: 'Italiano (casacos, malhas)', w: 'Cintura (calças)' },
  grid: {
    facetten: {
      group: 'Categoria',
      sub: 'Tipo',
      type: 'Modelo',
      brand: 'Marca',
      size: 'Tamanho',
      color: 'Cor',
      price: 'Preço',
      gender: 'Para',
    },
    sort: {
      neu: 'Mais recentes primeiro',
      'preis-auf': 'Preço: do mais baixo ao mais alto',
      'preis-ab': 'Preço: do mais alto ao mais baixo',
      marke: 'Marca A–Z',
    },
    anzahlEins: '{n} peça',
    anzahlMehr: '{n} peças',
    zeigen: 'Mostrar {anzahl}',
    groesseAria: 'Tamanho {groesse}, {anzahl}',
    nurAnLager: 'Apenas tamanhos em stock.',
    markenSuchen: 'Pesquisar {n} marcas',
    markenSuchenAria: 'Pesquisar marcas',
    alle: 'Todos',
    alleName: 'Todos: {name}',
    kategorienAria: 'Categorias',
    sortiment: 'Coleção',
    nachArtAria: '{name} por tipo',
    nachModellAria: '{name} por modelo',
    alleFilter: 'Todos os filtros',
    filter: 'Filtrar',
    nachFiltern: 'Filtrar por {label}',
    zuruecksetzen: 'Repor',
    ansicht: 'Vista',
    kompakt: 'Mais peças por linha',
    gross: 'Imagens maiores',
    sortieren: 'Ordenar',
    filterEntfernen: 'Remover filtro {label}',
    alleZuruecksetzen: 'Repor tudo',
    leer: 'De momento, não temos nada em stock para esta combinação.',
    alleFilterZuruecksetzen: 'Repor todos os filtros',
    sheetTitel: 'Filtrar e ordenar',
    filterSchliessen: 'Fechar filtros',
  },
  preis: {
    bis: 'até CHF 300',
    mitte: 'CHF 300–700',
    ab: 'a partir de CHF 700',
    min: 'Mín.',
    max: 'Máx.',
    minAria: 'Preço mínimo',
    maxAria: 'Preço máximo',
    minFeldAria: 'Preço mínimo em CHF',
    maxFeldAria: 'Preço máximo em CHF',
    imBereichEins: '{n} peça neste intervalo',
    imBereichMehr: '{n} peças neste intervalo',
  },
  karte: {
    ausverkauft: 'Esgotado',
    sale: 'Saldos',
  },
  buybox: {
    groesseWaehlen: 'Escolher tamanho',
    groesseHinweis: ' — escolha primeiro um tamanho',
    groesseAria: 'Tamanho',
    ausverkauft: 'Esgotado',
    busy: 'A adicionar …',
    fertig: 'No seu cesto ✓',
    hinzufuegen: 'Adicionar ao cesto',
    fehler: 'Ocorreu um erro. Tente novamente ou telefone-nos.',
    anprobieren: 'Experimente no nosso showroom',
  },
  galerie: {
    ansicht: '{titel} — vista {n}',
    bilderAria: 'Imagens',
    bild: 'Imagem {n}',
  },
  schrank: {
    eyebrow: 'Loja · The Sartorialist Zurique',
    h1: 'O Guarda-Roupa',
    text: '{n} peças escolhidas a dedo da Woolrich, Gran Sasso e Tramarossa — encomende online ou experimente no nosso showroom.',
    rolle: 'Carrossel',
    aria: 'O Guarda-Roupa — peças escolhidas a dedo',
    zurueck: 'Peça anterior',
    weiter: 'Peça seguinte',
    ansehen: 'Ver →',
    alleArtikel: 'Todos os {n} artigos',
  },
};
