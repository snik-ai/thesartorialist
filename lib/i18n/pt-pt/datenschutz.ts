import type { Woerterbuch } from '../de';

// Política de privacidade
export const datenschutz: Woerterbuch['datenschutz'] = {
  meta: {
    titel: 'Política de Privacidade',
    beschreibung:
      'Política de privacidade do The Sartorialist Zurique — informações sobre a recolha e o tratamento de dados pessoais.',
  },
  h1: 'Política de Privacidade',
  hinweisMassgeblich:
    'Esta tradução para português é disponibilizada apenas para sua conveniência. A versão alemã é a juridicamente vinculativa: [ler a versão alemã](/datenschutzerklaerung/).',
  adresse: { land: 'Suíça', telefon: 'Telefone: ', email: 'E-mail: ' },
  abschnitte: [
    {
      titel: '1. Proteção de dados em resumo',
      bloecke: [
        { h3: 'Informações gerais' },
        {
          p: 'As informações seguintes dão-lhe uma visão geral simples do que acontece aos seus dados pessoais quando visita este website. Dados pessoais são todos os dados que permitem identificá-lo pessoalmente.',
        },
        { h3: 'Recolha de dados neste website' },
        {
          p: 'Os dados deste website são tratados pelo operador do website, cujos contactos constam da [ficha técnica](impressum) deste website. Nas páginas fora da loja não são instalados cookies nem carregados conteúdos de terceiros (por exemplo, vídeos ou tipos de letra externos). As exceções são a medição anónima de audiência efetuada pela nossa agência web (ver secção 4, «Medição de audiência»), o filme na página inicial (Vimeo, ver secção 4, «Filme na página inicial») e a loja online em /shop, que funciona com Shopify (ver secção 4, «Loja online»).',
        },
        {
          p: 'Alguns dados são recolhidos quando no-los fornece — por exemplo, quando nos envia um pedido de marcação por e-mail ou telefone. Outros dados são recolhidos automaticamente pelos sistemas informáticos do fornecedor de alojamento quando visita o website (sobretudo dados técnicos, como o navegador, o sistema operativo ou a hora de acesso à página).',
        },
      ],
    },
    {
      titel: '2. Alojamento',
      bloecke: [
        {
          p: 'Este website está alojado num prestador de serviços externo (alojamento). Os dados recolhidos durante a visita ao website são armazenados nos servidores do fornecedor de alojamento. Trata-se sobretudo de endereços IP, metadados e dados de comunicação, bem como de dados de acesso ao website. Recorremos ao fornecedor de alojamento no interesse de disponibilizar o nosso website de forma segura, rápida e eficiente. O nosso fornecedor de alojamento trata os seus dados apenas na medida do necessário para cumprir as suas obrigações contratuais.',
        },
      ],
    },
    {
      titel: '3. Informações gerais e obrigatórias',
      bloecke: [
        { h3: 'Proteção de dados' },
        {
          p: 'Os operadores destas páginas levam muito a sério a proteção dos seus dados pessoais. Tratamos os seus dados pessoais de forma confidencial e em conformidade com as disposições legais em matéria de proteção de dados (em particular a Lei Federal Suíça sobre a Proteção de Dados (LPD) e — quando aplicável — o Regulamento Geral sobre a Proteção de Dados da UE (RGPD)) e com a presente política de privacidade.',
        },
        {
          p: 'Chamamos a atenção para o facto de a transmissão de dados pela Internet (por exemplo, na comunicação por e-mail) poder apresentar falhas de segurança. Não é possível uma proteção total dos dados contra o acesso de terceiros.',
        },
        { h3: 'Responsável pelo tratamento' },
        { p: 'O responsável pelo tratamento de dados neste website é:' },
        { adresse: true },
        { h3: 'Os seus direitos' },
        {
          p: 'Tem o direito de obter, a qualquer momento e gratuitamente, informações sobre a origem, os destinatários e a finalidade dos seus dados pessoais armazenados. Tem também o direito de solicitar a retificação ou o apagamento desses dados, a limitação do seu tratamento e a portabilidade dos dados. Pode retirar a qualquer momento, com efeitos para o futuro, qualquer consentimento que tenha dado para o tratamento de dados. Tem ainda o direito de apresentar reclamação junto da autoridade de controlo competente (na Suíça: o Comissário Federal para a Proteção de Dados e a Transparência, PFPDT).',
        },
        { h3: 'Encriptação SSL/TLS' },
        {
          p: 'Por motivos de segurança e para proteger a transmissão de conteúdos confidenciais, este site utiliza encriptação SSL/TLS. Reconhece uma ligação encriptada pela alteração da barra de endereço do navegador de «http://» para «https://» e pelo símbolo do cadeado na barra do navegador.',
        },
      ],
    },
    {
      titel: '4. Recolha de dados neste website',
      bloecke: [
        { h3: 'Ficheiros de registo do servidor' },
        {
          p: 'O fornecedor destas páginas recolhe e armazena automaticamente informações nos chamados ficheiros de registo do servidor, que o seu navegador nos transmite automaticamente:',
        },
        {
          liste: [
            'Tipo e versão do navegador',
            'Sistema operativo utilizado',
            'URL de referência',
            'Nome do anfitrião do computador que acede',
            'Hora do pedido ao servidor',
            'Endereço IP',
          ],
        },
        {
          p: 'Estes dados não são combinados com outras fontes de dados. O operador do website tem um interesse legítimo na apresentação tecnicamente sem erros e na otimização do seu website — para esse efeito, os ficheiros de registo do servidor têm de ser registados.',
        },
        { h3: 'Medição de audiência' },
        {
          p: 'Para melhorar este website, a nossa agência web DLM Digital (Zurique, Suíça) mede de forma anónima, em nosso nome, quais as páginas visitadas e quais os canais de contacto (telefone, WhatsApp, e-mail, formulário) utilizados. Para este efeito, não são instalados cookies nem armazenados endereços IP; não é possível um reconhecimento para além do próprio dia. O conteúdo dos formulários (por exemplo, nome, e-mail, mensagem) não é transmitido à DLM Digital. Os dados são tratados na Suíça ou na UE.',
        },
        { h3: 'As nossas próprias estatísticas de visitantes' },
        {
          p: 'Além disso, mantemos no nosso servidor uma estatística própria de visitas, sem cookies. Registamos a página visitada e o seu título, a versão linguística do site, o site de origem (apenas o domínio), eventuais parâmetros de campanha (utm_source, utm_medium, utm_campaign, utm_term, utm_content) e se a visita resultou de um clique num anúncio do Google (apenas sim/não), o tipo de dispositivo, o navegador e o sistema operativo (a partir do identificador do navegador), um tamanho de ecrã aproximado, o idioma do navegador, um país aproximado (a partir da região da sua definição de idioma ou de uma indicação de país do nosso fornecedor de alojamento, nunca a partir do endereço IP), o tempo de permanência visível na página, bem como os cliques nos canais de contacto (telefone, WhatsApp, e-mail, percurso), as ações no configurador e na loja e o envio de formulários (apenas o tipo, nunca o conteúdo). Para podermos contar as visitas, geramos a partir do endereço IP, do identificador do navegador e da data, juntamente com uma chave secreta, um valor de controlo abreviado (hash); as páginas vistas consecutivamente são agrupadas numa visita no nosso servidor. O endereço IP em si não é guardado; o valor de controlo muda diariamente e não permite tirar conclusões sobre a sua pessoa. Não são utilizados cookies nem qualquer outro armazenamento do seu navegador. Se o seu navegador enviar o sinal «Do Not Track» ou «Global Privacy Control», não registamos nada. Os dados são utilizados exclusivamente para a nossa própria análise, não são transmitidos a terceiros e são guardados na Suíça ou na UE. A base jurídica é o nosso interesse legítimo em conceber o site de acordo com as necessidades.',
        },
        { h3: 'Filme na página inicial (Vimeo)' },
        {
          p: 'Na página inicial apresentamos o nosso filme através do serviço de vídeo Vimeo (Vimeo.com Inc., Nova Iorque, EUA). Integramo-lo com a definição «Do Not Track»: o Vimeo não instala cookies e não cria perfis de utilização. Ao carregar o filme, o Vimeo recebe necessariamente, por razões técnicas, o seu endereço IP e informações sobre o seu navegador.',
        },
        { h3: 'Configurador de fatos por medida' },
        {
          p: 'A sua seleção no configurador de fatos por medida («Estilos e Opções») é armazenada exclusivamente no seu navegador (localStorage) e não nos é transmitida. Só a recebemos se a enviar com um pedido de marcação ou se nos enviar o PDF. Pode apagar a sua seleção a qualquer momento através de «Repor tudo».',
        },
        { h3: 'Loja online (Shopify)' },
        {
          p: 'A nossa loja online em thesartorialist.ch/shop funciona com Shopify (Shopify International Limited, Dublin, Irlanda, e Shopify Inc., Otava, Canadá). Os dados dos produtos, as imagens e os preços são carregados a partir da Shopify; as imagens dos produtos são entregues diretamente pelo servidor da Shopify (cdn.shopify.com), que recebe necessariamente, por razões técnicas, o seu endereço IP.',
        },
        {
          p: 'Logo que adicione um artigo ao cesto, instalamos um cookie estritamente necessário com a identificação do seu cesto (válido durante 14 dias), bem como os cookies de sessão da Shopify, para que o seu cesto e a sua encomenda correspondam. A encomenda propriamente dita — morada, envio e pagamento — é concluída no checkout da Shopify em shop.thesartorialist.ch, onde se aplicam também as informações de privacidade da Shopify. Os dados são tratados para a execução do contrato de compra. A Shopify pode também tratar dados em países fora da Suíça e da UE; para esse efeito existem cláusulas contratuais-tipo.',
        },
        { h3: 'Pedidos de marcação e de chamada através do website' },
        {
          p: 'Se pedir uma marcação ou uma chamada através do website, enviamos os seus dados (nome, telefone, e-mail, data preferida e — se selecionada — a sua escolha de estilo) por e-mail ao nosso atelier e enviamos-lhe uma confirmação. Para o envio destes e-mails utilizamos o serviço Resend (Resend Inc., São Francisco, EUA), com tratamento de dados na UE. Armazenamos também os seus dados na nossa base de dados de clientes, para podermos preparar a sua consulta e o aconselhamento e dar seguimento ao seu pedido. Utilizamos os dados exclusivamente para tratar o seu pedido e para o acompanhar enquanto cliente. Só o contactamos por WhatsApp ou SMS se tiver dado expressamente o seu consentimento; pode retirar este consentimento a qualquer momento.',
        },
        { h3: 'Pedidos por e-mail ou telefone' },
        {
          p: 'Se nos contactar por e-mail ou telefone (por exemplo, para um pedido de marcação), o seu pedido, incluindo os dados de contacto que indicar, é armazenado por nós para efeitos de tratamento do pedido e para o caso de questões subsequentes. Não transmitimos estes dados sem o seu consentimento. Os dados permanecem connosco até que nos solicite o seu apagamento ou até que deixe de existir a finalidade do seu armazenamento. Mantêm-se inalteradas as disposições legais imperativas — em particular os prazos de conservação.',
        },
      ],
    },
  ],
};
