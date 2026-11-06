import type { Woerterbuch } from '../de';

// Sobreposição portuguesa de lib/konfigurator/daten.ts (IDs idênticos; códigos e imagens ficam lá).
// Os títulos dos subgrupos mantêm a forma «Grupo — Variante»: a página inicial usa a parte antes de « — ».
export const konfigDaten: Woerterbuch['konfigDaten'] = {
  kategorien: {
    jacket: {
      title: 'Casaco',
      subtitle: 'A base do por medida',
      description:
        'Entretela de crina de cavalo trabalhada à mão, proporções da lapela, linha do ombro e arquitetura dos bolsos, retiradas diretamente das nossas especificações de alfaiataria.',
    },
    trousers: {
      title: 'Calças',
      subtitle: 'Linhas limpas e detalhes do cós',
      description:
        'Um caimento impecável da perna, fechos do cós, ajustadores laterais e acabamentos da bainha, feitos com precisão à medida da sua postura.',
    },
    waistcoat: {
      title: 'Colete',
      subtitle: 'O toque final do fato de três peças',
      description: 'Cortado para assentar rente ao cós das calças, sem que a camisa se veja entre ambos.',
    },
    'black-tie': {
      title: 'Smoking',
      subtitle: 'Traje de cerimónia e detalhes do smoking',
      description: 'Traje de cerimónia formal, em estrito respeito pelo clássico código de vestuário «Black Tie».',
    },
  },
  untergruppen: {
    // Casaco
    'jacket-front-sb': { title: 'Frente — Abotoamento simples', subtitle: 'Fechos para o casaco de abotoamento simples' },
    'jacket-front-db': { title: 'Frente — Trespassado', subtitle: 'Fechos para o casaco trespassado' },
    'jacket-lapel-notch': { title: 'Lapela — Abotoamento simples, entalhada', subtitle: 'Medida da linha de dobra até à ponta da lapela' },
    'jacket-lapel-peak': { title: 'Lapela — Abotoamento simples, de bico', subtitle: 'Medida da linha de dobra até à orla da lapela' },
    'jacket-lapel-shawl': { title: 'Lapela — Abotoamento simples, gola xaile', subtitle: 'Uma gola arredondada contínua' },
    'jacket-lapel-db-peak': { title: 'Lapela — Trespassado, de bico', subtitle: 'Cortada especificamente para o casaco trespassado' },
    'jacket-pockets': { title: 'Bolsos', subtitle: 'Bolso de peito e bolsos laterais' },
    'jacket-ticket-pocket': { title: 'Bolsos — Bolso de bilhete', subtitle: 'Bolso de bilhete adicional à direita' },
    'jacket-back-style': { title: 'Costas e rachas', subtitle: 'Rachas nas costas e caimento' },
    'jacket-shoulder-style': { title: 'Ombro', subtitle: 'Chumaço e cabeça da manga' },
    'jacket-canvas': { title: 'Entretela', subtitle: 'Entretela de peito flutuante' },
    'jacket-lining': { title: 'Forro', subtitle: 'Extensão do forro de cupro' },
    'jacket-cuff-buttons': { title: 'Botões da manga', subtitle: 'Número e disposição dos botões' },
    'jacket-cuff-style': { title: 'Disposição dos botões da manga', subtitle: 'Espaçamento dos botões' },
    'jacket-topstitching': { title: 'Pesponto (ponto à mão AMF)', subtitle: 'Pesponto à mão em lapelas, gola e costuras' },
    'jacket-lapel-buttonhole': { title: 'Casa de botão na lapela', subtitle: 'Acabada como asola a mano' },
    'jacket-monogram': { title: 'Monograma interior', subtitle: 'Iniciais e inscrições bordadas' },
    // Calças
    'trousers-front-style': { title: 'Frente das calças', subtitle: 'Pregas e painel da frente' },
    'trousers-front-closure': { title: 'Fecho', subtitle: 'Braguilha e fecho do cós' },
    'trousers-waistband': { title: 'Cós', subtitle: 'Suporte e ajuste da cintura' },
    'trousers-side-pockets': { title: 'Bolsos laterais', subtitle: 'Corte e ângulo da abertura' },
    'trousers-back-pockets': { title: 'Bolsos traseiros', subtitle: 'Disposição dos bolsos debruados' },
    'trousers-lining': { title: 'Forro', subtitle: 'Forro na frente da perna' },
    'trousers-hem': { title: 'Bainha', subtitle: 'Com dobra ou bainha simples' },
    'trousers-topstitching': { title: 'Pesponto', subtitle: 'Ponto à mão AMF no bolso e na costura lateral' },
    'trousers-inside-waistband': { title: 'Cós interior', subtitle: 'Acabamento do cós interior' },
    // Colete
    'waistcoat-front-sb': { title: 'Colete — Abotoamento simples', subtitle: 'Frente e posição dos botões' },
    'waistcoat-front-db': { title: 'Colete — Trespassado', subtitle: 'Formal, e para o fraque' },
    'waistcoat-pockets': { title: 'Bolsos', subtitle: 'Bolsos debruados e de vivo' },
    'waistcoat-back': { title: 'Costas', subtitle: 'Costas em forro ou em tecido' },
    'waistcoat-topstitching': { title: 'Pesponto', subtitle: 'Pesponto à mão ao longo das orlas' },
    'waistcoat-buttonholes': { title: 'Casas de botão', subtitle: 'Acabamento das casas de botão' },
    // Smoking
    'black-tie-jacket-style': { title: 'Casaco de smoking', subtitle: 'Em azul-meia-noite ou preto profundo' },
    'black-tie-facing': { title: 'Lapela', subtitle: 'Revestimento de seda na lapela do smoking' },
    'black-tie-trouser-details': { title: 'Calças de smoking: galão e cós', subtitle: 'Galão de seda e cós de smoking' },
    'black-tie-waistcoat': { title: 'Colete de cerimónia', subtitle: 'Um colete festivo, de decote baixo' },
  },
  optionen: {
    // Casaco — frente, abotoamento simples
    'jacket-sb-1b': {
      label: 'Um botão',
      subLabel: 'Fecho baixo e esguio',
      description: 'Um fecho de um botão moderno e depurado, com uma abertura em V profunda.',
    },
    'jacket-sb-2b': {
      label: 'Dois botões',
      subLabel: 'O clássico padrão de negócios',
      description: 'O padrão intemporal da alfaiataria masculina suíça.',
    },
    'jacket-sb-3-2b': {
      label: 'Três botões, dois a abotoar',
      subLabel: 'Suave dobra napolitana',
      description: 'O botão superior desaparece elegantemente na lapela suavemente enrolada.',
    },
    'jacket-sb-3b': {
      label: 'Três botões',
      subLabel: 'Tradicionalmente de abotoamento alto',
      description: 'Tradicionalmente britânico e de abotoamento alto, com um caimento equilibrado.',
    },
    // Casaco — frente, trespassado
    'jacket-db-4x2': {
      label: 'Quatro botões, dois a abotoar',
      subLabel: 'Um trespassado desportivo e descontraído',
      description: 'Quatro botões visíveis, dois deles para abotoar.',
    },
    'jacket-db-6x2': {
      label: 'Seis botões, dois a abotoar',
      subLabel: 'O clássico de Savile Row',
      description: 'Uma silhueta clássica com seis botões, dois deles para abotoar.',
    },
    // Lapelas
    'jacket-lapel-notch-s': {
      label: 'Estreita (6,7 cm)',
      subLabel: '6,7 cm de largura',
      description: 'Uma lapela entalhada esguia e precisa, numa largura moderna.',
    },
    'jacket-lapel-notch-r': {
      label: 'Normal (8,0 cm)',
      subLabel: '8,0 cm de largura',
      description: 'Proporções equilibradas, ideais com gravatas e golas de camisa clássicas.',
    },
    'jacket-lapel-notch-l': {
      label: 'Larga (9,5 cm)',
      subLabel: '9,5 cm de largura',
      description: 'Uma lapela entalhada marcante, com uma presença forte sobre o peito.',
    },
    'jacket-lapel-peak-s': {
      label: 'Estreita (6,7 cm)',
      subLabel: '6,7 cm de largura',
      description: 'Bicos de lapela voltados para cima, que alongam o tronco.',
    },
    'jacket-lapel-peak-r': {
      label: 'Normal (8,0 cm)',
      subLabel: '8,0 cm de largura',
      description: 'Uma clássica lapela de bico, à maneira italiana.',
    },
    'jacket-lapel-peak-l': {
      label: 'Larga (9,5 cm)',
      subLabel: '9,5 cm de largura',
      description: 'Uma lapela de bico generosa, para uma presença imponente.',
    },
    'jacket-lapel-shawl-s': {
      label: 'Estreita (4,5 cm)',
      subLabel: '4,5 cm de largura',
      description: 'Uma gola arredondada e esguia para casacos de cerimónia.',
    },
    'jacket-lapel-shawl-r': {
      label: 'Normal (6,0 cm)',
      subLabel: '6,0 cm de largura',
      description: 'Uma curva elegante e contínua para casacos de smoking e casacos de veludo.',
    },
    'jacket-lapel-db-peak-s': {
      label: 'Estreita (9,0 cm)',
      subLabel: '9,0 cm de largura',
      description: 'Uma lapela de bico esguia para o fato trespassado.',
    },
    'jacket-lapel-db-peak-r': {
      label: 'Normal (10,0 cm)',
      subLabel: '10,0 cm de largura',
      description: 'Uma lapela de bico plena, para a elegância clássica do casaco trespassado.',
    },
    'jacket-lapel-db-peak-l': {
      label: 'Larga (11,0 cm)',
      subLabel: '11,0 cm de largura',
      description: 'Uma lapela de bico expressiva e ampla.',
    },
    // Bolsos
    'jacket-pocket-jetted': {
      label: 'Barchetta e bolso debruado',
      description: 'A linha mais limpa e formal, totalmente sem palas.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso debruado' },
    },
    'jacket-pocket-slanted-jet': {
      label: 'Barchetta e debruado oblíquo',
      description: 'Bolsos debruados oblíquos que acentuam a cintura.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso debruado oblíquo' },
    },
    'jacket-pocket-flap': {
      label: 'Barchetta e bolso com pala',
      description: 'Versáteis bolsos com pala direitos; as palas também podem ser recolhidas para dentro.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso com pala' },
    },
    'jacket-pocket-slanted-flap': {
      label: 'Barchetta e pala oblíqua',
      description: 'O tradicional corte hacking, para uma linha de cintura dinâmica.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso com pala oblíquo' },
    },
    'jacket-pocket-barchetta-patch': {
      label: 'Barchetta e bolso aplicado',
      description: 'Uma combinação napolitana: bolso de peito barchetta com bolsos laterais aplicados e arredondados.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso aplicado' },
    },
    'jacket-pocket-patch-patch': {
      label: 'Aplicado e aplicado',
      description: 'Um estilo blazer descontraído, com pesponto visível.',
      pocketSpec: { chest: 'Bolso aplicado', side: 'Bolso aplicado' },
    },
    'jacket-pocket-safari': {
      label: 'Safari e safari',
      description: 'Bolsos de fole funcionais, com prega macho e fecho de botão ao centro.',
      pocketSpec: { chest: 'Safari', side: 'Safari' },
    },
    // Bolso de bilhete
    'jacket-ticket-flap': {
      label: 'Bolso de bilhete com pala',
      description: 'O tradicional bolso de bilhete inglês, por cima do bolso com pala direito.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso de bilhete com pala' },
    },
    'jacket-ticket-slanted-flap': {
      label: 'Bolso de bilhete oblíquo',
      description: 'Colocado no mesmo ângulo do bolso com pala oblíquo que fica por baixo.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso de bilhete oblíquo com pala' },
    },
    'jacket-ticket-patch': {
      label: 'Bolso de bilhete aplicado',
      description: 'Uma versão descontraída, por cima do bolso lateral aplicado direito.',
      pocketSpec: { chest: 'Barchetta', side: 'Bolso de bilhete aplicado' },
    },
    'jacket-ticket-patch-double': {
      label: 'Aplicado + bolso de bilhete',
      description: 'Bolsos aplicados em toda a peça, com um pequeno bolso de bilhete em cima, à direita.',
      pocketSpec: { chest: 'Bolso aplicado', side: 'Bolso de bilhete aplicado' },
    },
    // Costas e rachas
    'jacket-back-ventless': {
      label: 'Sem racha',
      subLabel: 'Costas lisas e contínuas',
      description: 'Costas lisas e particularmente formais, reservadas aos casacos de smoking e de cerimónia.',
    },
    'jacket-back-single-vent': {
      label: 'Racha central',
      subLabel: 'Uma única racha ao centro das costas',
      description: 'A tradicional racha central americana.',
    },
    'jacket-back-side-vents': {
      label: 'Rachas laterais',
      subLabel: 'Duas rachas nos lados',
      description: 'Cai de forma impecável quando está sentado; as mãos encontram espaço nos bolsos sem que o casaco repuxe.',
    },
    // Ombro
    'jacket-shoulder-soft': {
      label: 'Ombro suave',
      subLabel: 'Chumaço fino · sem rolo na cabeça da manga · natural',
      description: 'Costuras abertas para dentro, para um caimento leve, desestruturado e natural.',
    },
    'jacket-shoulder-traditional': {
      label: 'Ombro clássico',
      subLabel: 'Chumaço médio · rolo médio na cabeça da manga',
      description: 'Costuras abertas para fora, para uma linha limpa e cuidada sobre o ombro.',
    },
    'jacket-shoulder-roped': {
      label: 'Ombro com rolo (roped)',
      subLabel: 'Chumaço firme · rolo pronunciado na cabeça da manga · pagode',
      description: 'Costuras abertas para fora, com a cabeça da manga nitidamente elevada (con rollino).',
    },
    // Entretela
    'jacket-canvas-soft': {
      label: 'Entretela suave',
      subLabel: 'Entretela de peito em crina de cavalo, flexível e flutuante',
      description: 'Uma entretela leve que se molda rapidamente ao corpo e é maravilhosamente confortável de vestir.',
    },
    'jacket-canvas-traditional': {
      label: 'Entretela clássica',
      subLabel: 'Entretela completa em crina de cavalo, que dá forma a toda a frente (full canvas)',
      description: 'Uma dobra da lapela precisa e um peito nitidamente modelado, que duram décadas.',
    },
    // Forro
    'jacket-lining-lined': {
      label: 'Forro completo',
      subLabel: 'Forro no corpo e nas mangas',
      description: 'Desliza sem esforço sobre a camisa e protege totalmente o interior.',
    },
    'jacket-lining-unlined': {
      label: 'Meio forro',
      subLabel: 'Forro nas mangas e como pala nas costas',
      description: 'Mais respirabilidade para os dias amenos de primavera e de outono.',
    },
    'jacket-lining-fully-unlined': {
      label: 'Sem forro',
      subLabel: 'Nem o corpo nem as mangas forrados',
      description: 'Máxima circulação de ar, com as costuras interiores cuidadosamente debruadas com fita.',
    },
    // Botões da manga
    'jacket-cuff-0b': {
      label: 'Sem botões',
      subLabel: 'Uma manga lisa e depurada',
      description: 'Um acabamento de manga limpo, sem casas nem botões.',
    },
    'jacket-cuff-3b': {
      label: 'Três botões',
      subLabel: 'Clássico europeu',
      description: 'O tradicional acabamento de manga à maneira continental.',
    },
    'jacket-cuff-4b': {
      label: 'Quatro botões',
      subLabel: 'O padrão da alfaiataria',
      description: 'A referência consagrada para as mangas na alta alfaiataria.',
    },
    'jacket-cuff-5b': {
      label: 'Cinco botões',
      subLabel: 'Um toque napolitano',
      description: 'Um detalhe inconfundível da fina alfaiataria italiana.',
    },
    'jacket-cuff-kissing': {
      label: 'Botões sobrepostos (kissing buttons)',
      subLabel: 'Os botões sobrepõem-se uns aos outros (cascata)',
      description: 'Uma verdadeira cascata trabalhada à mão na manga.',
    },
    'jacket-cuff-non-kissing': {
      label: 'Lado a lado',
      subLabel: 'Os botões tocam-se sem se sobreporem',
      description: 'Uma fila britânica limpa, com cada botão assente na horizontal.',
    },
    // Pesponto
    'jacket-stitch-edge-2mm': {
      label: 'Pesponto na orla (2 mm)',
      subLabel: 'Orla da frente, lapelas, gola e bolsos',
      description: 'Um fino ponto à mão a 2 mm da orla, que define os contornos e estabiliza a dobra da lapela.',
    },
    'jacket-stitch-full-edge-2mm': {
      label: 'Pesponto integral na orla (2 mm)',
      subLabel: 'Incluindo pinças, ombro e costuras das costas',
      description: 'Pesponto à mão completo ao longo de todas as costuras estruturais principais.',
    },
    'jacket-stitch-raised-5mm': {
      label: 'Costura em relevo (5 mm)',
      subLabel: 'Pesponto marcante para o casaco desportivo',
      description: 'Pesponto pronunciado a 5 mm da orla, ideal para hopsack texturado, flanela e tweed.',
    },
    'jacket-stitch-full-raised-5mm': {
      label: 'Costuras em relevo integrais (5 mm)',
      subLabel: 'Totalmente pespontado a 5 mm',
      description: 'Costuras em relevo na frente, nas lapelas, nas pinças e em todas as costuras.',
    },
    // Casa de botão na lapela
    'jacket-buttonhole-machine': {
      label: 'Feita à máquina',
      subLabel: 'Ponto preciso à máquina',
      description: 'Uma casa de botão cosida à máquina, fiável e resistente.',
    },
    'jacket-buttonhole-hand': {
      label: 'Cosida à mão',
      subLabel: 'Linha de seda sobre cordão, com nó',
      description: 'Cosida à mão com verdadeira seda para casas de botão, sobre um cordão.',
    },
    'jacket-buttonhole-milanese': {
      label: 'Casa de botão milanesa',
      subLabel: 'Seda enrolada sem nós · em relevo',
      description: 'O expoente do trabalho manual: seda brilhante, enrolada sem emendas sobre um cordão.',
    },
    // Monograma
    'jacket-monogram-lined': {
      label: 'Monograma no forro',
      subLabel: 'Bordado por baixo do bolso de peito interior',
      description: 'Iniciais à sua escolha, bordadas à mão ou à máquina no forro da vista.',
    },
    'jacket-monogram-unlined': {
      label: 'Monograma, sem forro',
      subLabel: 'Bordado no debrum do bolso',
      description: 'Discretamente colocado no debrum do bolso interior, para casacos leves sem forro.',
    },

    // Calças — frente
    'trousers-front-flat': {
      label: 'Frente lisa',
      subLabel: 'Lisa e moderna',
      description: 'Uma frente lisa e limpa, sem pregas, para uma silhueta esguia e alongada.',
    },
    'trousers-front-single-pleat': {
      label: 'Uma prega',
      subLabel: 'Profundidade da prega 2 cm',
      description: 'Um pouco mais de espaço na anca quando está sentado, com um vinco bem marcado.',
    },
    'trousers-front-double-pleat': {
      label: 'Duas pregas',
      subLabel: 'Primeira 2 cm · segunda 1,25 cm',
      description: 'Elegância generosa com cintura alta, total liberdade de movimentos e um belo caimento.',
    },
    // Fecho
    'trousers-closure-extended-belt': {
      label: 'Cós prolongado',
      subLabel: 'Patilha do cós prolongada',
      description: 'Uma patilha do cós prolongada para além da braguilha, para uma linha de cintura mais limpa.',
    },
    'trousers-closure-standard': {
      label: 'Braguilha de botões — standard',
      subLabel: 'Braguilha com botões de corno',
      description: 'Uma construção tradicional e purista; ao contrário de um fecho de correr, não faz volume quando está sentado.',
    },
    'trousers-closure-double-belt': {
      label: 'Cós duplo',
      subLabel: 'Fecho prolongado com dois botões',
      description: 'Um cós alto com dois botões, inspirado na alfaiataria florentina.',
    },
    // Cós
    'trousers-waistband-side-adjusters': {
      label: 'Ajustadores laterais',
      subLabel: 'Fivelas de latão · sem passadores',
      description: 'Um cós limpo, com patilhas de ajuste laterais, totalmente sem cinto.',
    },
    'trousers-waistband-belt-loops': {
      label: 'Passadores',
      subLabel: 'Passadores clássicos para cinto',
      description: 'Seis passadores aplicados à mão, para finos cintos de pele.',
    },
    'trousers-waistband-plain': {
      label: 'Cós liso',
      subLabel: 'Uma cintura simples e depurada',
      description: 'Um cós puro e liso, sem passadores nem fivelas, para usar com suspensórios.',
    },
    // Bolsos laterais
    'trousers-pocket-slanted': {
      label: 'Oblíquos',
      subLabel: 'Entrada natural',
      description: 'Uma abertura oblíqua ergonómica; a mão entra naturalmente sem que o tecido repuxe.',
    },
    'trousers-pocket-inseam': {
      label: 'Na costura',
      subLabel: 'Escondidos na costura lateral',
      description: 'Invisíveis na costura lateral vertical, para a linha lateral mais limpa.',
    },
    'trousers-pocket-jetted': {
      label: 'Bolso debruado',
      subLabel: 'Abertura horizontal, debrum duplo',
      description: 'Uma abertura fina, de debrum duplo, para calças formais.',
    },
    'trousers-pocket-jeans': {
      label: 'Bolso de jeans',
      subLabel: 'Abertura arredondada em cima',
      description: 'Um bolso arredondado ao estilo western, ideal para chinos e bombazina.',
    },
    'trousers-pocket-frog-mouth': {
      label: 'Boca de sapo (frog-mouth)',
      subLabel: 'Abertura horizontal à frente',
      description: 'Uma abertura horizontal à frente, como nas calças de cavalaria de alfaiataria de meados do século.',
    },
    // Bolsos traseiros
    'trousers-back-none': {
      label: 'Nenhum',
      subLabel: 'Costas completamente lisas',
      description: 'Sem bolsos traseiros, para um caimento liso e contínuo sobre o assento.',
    },
    'trousers-back-left': {
      label: 'Só à esquerda',
      subLabel: 'Um bolso debruado à esquerda',
      description: 'Um bolso debruado com botão de corno, do lado esquerdo de quem o veste.',
    },
    'trousers-back-right': {
      label: 'Só à direita',
      subLabel: 'Um bolso debruado à direita',
      description: 'Um bolso debruado com botão de corno, do lado direito de quem o veste.',
    },
    'trousers-back-two': {
      label: 'Dois bolsos',
      subLabel: 'Dois bolsos debruados simétricos',
      description: 'Clássicos bolsos debruados de ambos os lados, com fecho de botão.',
    },
    // Forro
    'trousers-lining-unlined': {
      label: 'Sem forro',
      subLabel: 'Tecido puro, respirável',
      description: 'Sem qualquer forro, para a máxima respirabilidade nos dias quentes.',
    },
    'trousers-lining-half-lined': {
      label: 'Meio forro',
      subLabel: 'Forrado à frente até abaixo do joelho',
      description: 'O forro de cupro liso acima do joelho evita a fricção e as joelheiras.',
    },
    'trousers-lining-fully-lined': {
      label: 'Forro completo',
      subLabel: 'Forrado em todo o comprimento',
      description: 'Um forro integral, confortável para peles sensíveis e tecidos de lã pesados.',
    },
    // Bainha
    'trousers-hem-plain-bottom': {
      label: 'Bainha simples',
      subLabel: 'Ligeiramente inclinada para trás',
      description: 'Um acabamento limpo e direito, cortado um pouco mais comprido atrás, em direção ao calcanhar.',
    },
    'trousers-hem-turnup-3cm': {
      label: 'Dobra (3,0 cm)',
      subLabel: 'Uma dobra discreta',
      description: 'Uma dobra sóbria, que dá à perna das calças um peso suave.',
    },
    'trousers-hem-turnup-3-5cm': {
      label: 'Dobra (3,5 cm)',
      subLabel: 'Uma dobra equilibrada',
      description: 'Proporções equilibradas, ideais para homens de estatura média.',
    },
    'trousers-hem-turnup-4cm': {
      label: 'Dobra (4,0 cm)',
      subLabel: 'A largura clássica da alfaiataria',
      description: 'O padrão comprovado da alta alfaiataria, para um caimento ideal e um vinco nítido.',
    },
    'trousers-hem-turnup-4-5cm': {
      label: 'Dobra (4,5 cm)',
      subLabel: 'Uma dobra ousada',
      description: 'Uma dobra marcante para tecidos de lã mais pesados e flanela.',
    },
    // Pesponto
    'trousers-topstitching-none': {
      label: 'Nenhum',
      subLabel: 'Ponto à mão AMF apenas no bolso lateral',
      description: 'Um discreto ponto AMF, limitado à orla do bolso lateral.',
    },
    'trousers-topstitching-edge-stitch': {
      label: 'Pesponto na orla (2 mm)',
      subLabel: 'AMF a 2 mm nos bolsos e na costura lateral',
      description: 'Um efeito de ponto à mão a 2 mm da orla, ao longo de toda a costura lateral exterior.',
    },
    // Cós interior
    'trousers-inside-wb-pleated': {
      label: 'Cós com pregas',
      subLabel: 'Clássico cós interior com cortina',
      description: 'Um tradicional cós interior com pregas, para conforto e flexibilidade.',
    },
    'trousers-inside-wb-pleated-brace': {
      label: 'Pregas + botões para suspensórios',
      subLabel: 'Botões de corno interiores para suspensórios',
      description: 'Um cós interior com pregas e seis botões de corno interiores, para suspensórios de abotoar.',
    },
    'trousers-inside-wb-shirt-stay': {
      label: 'Cós com antideslizante para camisa',
      subLabel: 'Fita antideslizante emborrachada',
      description: 'Uma fita antideslizante emborrachada integrada mantém a camisa bem metida durante todo o dia.',
    },
    'trousers-inside-wb-shirt-stay-brace': {
      label: 'Antideslizante + botões para suspensórios',
      subLabel: 'Fita antideslizante e botões para suspensórios',
      description: 'O máximo conforto: fita antideslizante e botões para suspensórios combinados.',
    },

    // Colete — abotoamento simples
    'waistcoat-sb-4b': {
      label: 'Quatro botões',
      subLabel: 'Abertura baixa',
      description: 'Abotoado em baixo, deixando ver mais da gravata e da frente da camisa.',
    },
    'waistcoat-sb-5b': {
      label: 'Cinco botões',
      subLabel: 'O colete clássico',
      description: 'O clássico colete europeu para o fato de três peças, com uma posição dos botões equilibrada.',
    },
    'waistcoat-sb-6b': {
      label: 'Seis botões',
      subLabel: 'De abotoamento alto',
      description: 'Um fecho alto; segundo a regra consagrada, o último botão fica desabotoado.',
    },
    'waistcoat-sb-horseshoe': {
      label: 'Ferradura',
      subLabel: 'Abertura baixa em U, formal',
      description: 'Uma abertura em U modelada, que realça uma camisa de cerimónia plissada e o laço.',
    },
    'waistcoat-sb-notch-lapel': {
      label: 'Lapela entalhada',
      subLabel: 'Gola clássica com lapela',
      description: 'Dá estrutura ao pescoço e aos ombros e um enquadramento elegante.',
    },
    'waistcoat-sb-shawl-lapel': {
      label: 'Gola xaile',
      subLabel: 'Gola suavemente arredondada',
      description: 'Uma gola suave e continuamente arredondada, como nos coletes de cerimónia históricos.',
    },
    // Colete — trespassado
    'waistcoat-db-6b': {
      label: 'Trespassado, seis botões',
      subLabel: 'Bainha direita',
      description: 'Um corte trespassado imponente, com uma orla inferior direita e horizontal.',
    },
    'waistcoat-db-8b': {
      label: 'Trespassado, oito botões',
      subLabel: 'Fecho alto, formal',
      description: 'De fecho alto, para o fraque ou para uma imponente presença em três peças.',
    },
    'waistcoat-db-shawl-lapel': {
      label: 'Trespassado, gola xaile',
      subLabel: 'Gola continuamente arredondada',
      description: 'Trespassado, com uma ampla gola xaile.',
    },
    'waistcoat-db-notch-lapel': {
      label: 'Trespassado, lapela entalhada',
      subLabel: 'Gola com lapela entalhada',
      description: 'Um colete trespassado com uma lapela entalhada de corte nítido.',
    },
    // Colete — bolsos
    'waistcoat-pocket-jetted': {
      label: 'Bolsos debruados',
      subLabel: 'Dois finos bolsos debruados',
      description: 'Bolsos de debrum duplo particularmente planos, para uma linha de cintura impecável.',
    },
    'waistcoat-pocket-2-welt': {
      label: '2 bolsos de vivo',
      subLabel: 'Dois bolsos de vivo clássicos',
      description: 'Clássicos bolsos de vivo inferiores.',
    },
    'waistcoat-pocket-4-welt': {
      label: '4 bolsos de vivo',
      subLabel: 'Dois em cima, dois em baixo',
      description: 'Quatro bolsos de vivo, com espaço para um relógio de bolso e respetiva corrente.',
    },
    // Colete — costas
    'waistcoat-back-cloth': {
      label: 'Costas em tecido',
      subLabel: 'Tecido do fato à frente e atrás',
      description: 'Pode ser usado com estilo sem casaco, como um colete de pleno direito.',
    },
    'waistcoat-back-lining': {
      label: 'Costas em forro',
      subLabel: 'Costas em cupro respirável',
      description: 'Umas costas lisas em cupro, sobre as quais o casaco desliza sem esforço.',
    },
    'waistcoat-back-lining-strap': {
      label: 'Forro + presilha nas costas',
      subLabel: 'Costas em cupro com presilha de fivela',
      description: 'A presilha nas costas permite o ajuste mais fino, para uma silhueta talhada com precisão.',
    },
    // Colete — pesponto
    'waistcoat-topstitching-none': {
      label: 'Nenhum',
      subLabel: 'Orlas limpas, sem pesponto',
      description: 'Simplicidade formal, sem pesponto visível.',
    },
    'waistcoat-topstitching-edge-2mm': {
      label: 'Pesponto na orla (2 mm)',
      subLabel: 'Ponto à mão AMF a 2 mm ao longo das orlas',
      description: 'Um fino ponto à mão a 2 mm da orla, que define a orla da frente e a dobra da gola.',
    },
    'waistcoat-topstitching-raised-5mm': {
      label: 'Costura em relevo (5 mm)',
      subLabel: 'Pesponto marcante a 5 mm',
      description: 'Pesponto pronunciado, ideal para tweed e tecidos de lã desportivos.',
    },
    // Colete — casas de botão
    'waistcoat-buttonhole-none': {
      label: 'Nenhuma',
      subLabel: 'Sem casa de botão decorativa na lapela',
      description: 'Uma orla de lapela limpa, sem casa de botão decorativa.',
    },
    'waistcoat-buttonhole-machine': {
      label: 'Feitas à máquina',
      subLabel: 'Ponto preciso à máquina',
      description: 'Uma casa de botão feita à máquina, cuidada, regular e muito resistente.',
    },
    'waistcoat-buttonhole-hand': {
      label: 'Cosidas à mão',
      subLabel: 'Casas de botão trabalhadas à mão',
      description: 'Trabalhadas à mão em linha de seda pura, sobre um cordão.',
    },

    // Smoking — casaco
    'black-tie-tux-shawl': {
      label: 'Casaco de smoking com gola xaile',
      subLabel: 'Lapela de seda arredondada · um botão',
      description: 'Uma gola de seda continuamente arredondada, com um único botão forrado.',
    },
    'black-tie-tux-peak-sb': {
      label: 'Abotoamento simples, lapela de bico',
      subLabel: 'Lapela de seda voltada para cima',
      description: 'Uma lapela de bico larga e expressiva, com um fino revestimento de seda.',
    },
    'black-tie-tux-peak-db': {
      label: 'Casaco de smoking trespassado',
      subLabel: 'Seis botões, dois a abotoar, com lapelas de seda',
      description: 'Usa-se abotoado, sem faixa nem colete.',
    },
    // Smoking — revestimento
    'black-tie-facing-satin': {
      label: 'Cetim',
      subLabel: 'Cetim de seda brilhante nas lapelas e nos botões',
      description: 'Seda pura de brilho intenso, que capta a luz das velas e o cintilar dos lustres.',
    },
    'black-tie-facing-grosgrain': {
      label: 'Gorgorão',
      subLabel: 'Seda canelada mate nas lapelas e nos botões',
      description: 'Seda finamente canelada, para uma elegância de cerimónia discreta, com profundidade e textura.',
    },
    // Smoking — calças
    'black-tie-trousers-braid': {
      label: 'Galão de seda',
      subLabel: 'Uma risca de seda a condizer ao longo da costura lateral',
      description: 'Um galão vertical de cetim ou gorgorão sobre a costura lateral exterior.',
    },
    'black-tie-trousers-braid-front': {
      label: 'Galão de seda — vista de frente',
      subLabel: 'A frente completa com galão',
      description: 'Vista de frente, com um caimento limpo em toda a extensão.',
    },
    'black-tie-trousers-dinner-waistband': {
      label: 'Cós de smoking',
      subLabel: 'Cós revestido a seda, sem passadores',
      description: 'Revestido com seda a condizer, com botões interiores para suspensórios.',
    },
    'black-tie-trousers-dinner-waistband-front': {
      label: 'Cós de smoking — vista de frente',
      subLabel: 'Uma frente lisa, como uma faixa',
      description: 'Um fecho frontal sem costuras visíveis, que assenta rente por baixo do casaco de smoking.',
    },
    // Smoking — colete
    'black-tie-horseshoe': {
      label: 'Colete de cerimónia em ferradura',
      subLabel: 'Abertura baixa que deixa ver a frente da camisa',
      description: 'A tradicional abertura baixa em ferradura, para o traje de cerimónia formal.',
    },
  },
};
