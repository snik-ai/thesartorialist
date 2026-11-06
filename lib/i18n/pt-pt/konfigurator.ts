import type { Woerterbuch } from '../de';

// Configurador de fatos por medida «Estilos e Opções»
export const konfigurator: Woerterbuch['konfigurator'] = {
  meta: {
    titel: 'Estilos e Opções — Configurador de Fatos por Medida',
    beschreibung:
      'Crie o seu próprio fato por medida: {anzahl} estilos e opções para casaco, calças, colete e smoking — lapelas, botões, bolsos, forro. Guarde a sua seleção em PDF e mande fazer o seu fato por medida em Zurique.',
    ogTitel: 'Crie o Seu Fato por Medida — Estilos e Opções, The Sartorialist Zurique',
    ogBeschreibung:
      'Escolha online as lapelas, os bolsos, os botões e o forro do seu fato por medida — e traga a sua seleção para a consulta no atelier.',
  },
  breadcrumb: { massanzug: 'Fato por medida', seite: 'Estilos e Opções' },
  hero: {
    eyebrow: 'Estilos e Opções · Configurador de estilo',
    h1: 'O seu fato por medida começa aqui.',
    lead: 'O seu estilo. As suas medidas. O seu fato. Descubra lapelas, botões, bolsos e acabamentos e componha com calma o que lhe agrada — onde e quando quiser. Traga a sua seleção para a consulta no atelier: aí tiramos-lhe as medidas, escolhemos consigo o tecido e afinamos cada detalhe até o fato assentar não só no seu corpo, mas também no seu carácter.',
    hinweise: ['Toque no que lhe agradar', 'Não precisa de escolher tudo', 'Resumo em baixo — em PDF ou diretamente para a sua marcação'],
  },
  sogehts: {
    titel: 'Crie o seu próprio fato por medida — é muito simples',
    absaetze: [
      'Um fato por medida é a soma de muitas pequenas decisões. Aqui pode tomar as primeiras com toda a calma: abotoamento simples ou trespassado, lapela entalhada ou lapela de bico, bolsos debruados ou bolsos com pala, ombro napolitano suave ou ombro clássico, com ou sem forro. Cada opção está ilustrada, para que veja exatamente o que muda.',
      'Escolha apenas o que é importante para si. A sua seleção aparece no resumo em baixo, pode ser guardada em PDF e é-nos enviada diretamente com o seu pedido de marcação.',
    ],
  },
  zuerich: {
    titel: 'O seu fato por medida em Zurique',
    text: 'No nosso atelier da Kuttelgasse 7 tiramos-lhe as medidas, mostramos-lhe tecidos da Loro Piana, Vitale Barberis Canonico, Holland & Sherry e de outras tecelagens e afinamos consigo cada detalhe. Cada fato por medida é full canvas, 100 % made in Italy, a partir de CHF 1’690 — pronto a levantar em 20 dias úteis.',
    linkMassanzug: 'Mais sobre fatos por medida em Zurique',
    linkHochzeit: 'Fatos de noivo por medida',
  },
  faqTitel: 'Perguntas sobre o configurador de fatos',
  faq: [
    {
      q: 'Posso criar o meu fato por medida online?',
      a: [
        'Sim. Em «Estilos e Opções» escolhe online os detalhes do seu fato por medida — abotoamento, lapelas, bolsos, ombro, forro, cós e muito mais. A medição e a escolha do tecido fazem-se depois pessoalmente no nosso atelier em Zurique, para que o fato assente verdadeiramente.',
      ],
    },
    {
      q: 'Para que serve o configurador de fatos?',
      a: [
        'O configurador permite-lhe tomar com calma, em casa, as primeiras decisões de estilo: lapelas, botões, bolsos, ombro, forro, cós e bainha. Traga a sua seleção para a consulta — no atelier tiramos-lhe as medidas, escolhemos o tecido e afinamos juntos cada detalhe.',
      ],
    },
    {
      q: 'Tenho de escolher todos os detalhes?',
      a: [
        'Não. Escolha apenas o que é importante para si. Tudo o que ficar em aberto combinamos na consulta, e aconselhamo-lo com honestidade sobre o que favorece a sua figura e a ocasião.',
      ],
    },
    {
      q: 'Onde fica guardada a minha seleção?',
      a: [
        'Apenas no seu navegador, neste dispositivo. Só a recebemos quando pede uma marcação com a sua seleção ou no-la envia em PDF ou em texto.',
      ],
    },
    {
      q: 'Quanto custa um fato por medida com estes detalhes?',
      a: [
        'Os nossos fatos por medida custam a partir de CHF 1’690. O preço final depende sobretudo do tecido e chega, normalmente, a cerca de CHF 2’500. Cada fato é full canvas, 100 % made in Italy e fica pronto a levantar em 20 dias úteis.',
      ],
    },
  ],
  cta: {
    titel: 'Seleção concluída? Agora é altura de tirar as medidas.',
    text: 'Traga a sua seleção de estilo para uma consulta gratuita na Kuttelgasse 7 — ou ligamos-lhe e combinamos tudo por telefone.',
  },
  schema: {
    name: 'Configurador de fatos por medida',
    beschreibung:
      'Seleção de estilo online para fatos por medida: casaco, calças, colete e smoking — seleção em PDF e para a sua consulta no atelier em Zurique.',
  },
  ui: {
    kategorienAria: 'Categorias',
    gewaehltAria: '{n} escolhidos',
    stoff: 'Tecido',
    meineAuswahl: 'A minha seleção',
    brustSeite: 'Peito · Lado',
    detailsZu: 'Detalhes de {label}',
    stoffSub: 'A coleção de tecidos Holland & Sherry',
    stoffText:
      'Desde 1836 que a Holland & Sherry tece tecidos para os melhores alfaiates do mundo. Percorra a coleção e anote os números dos seus favoritos — teremos as amostras prontas para a sua consulta no atelier.',
    stoffBildAlt: 'Tecidos da Holland & Sherry',
    stoffAnsehen: 'Ver a coleção de tecidos',
    neuesFenster: 'Abre numa nova janela',
    stoffKicker: 'Número do tecido (opcional)',
    stoffPlatzhalter: 'p. ex. 9722022',
    stoffAria: 'Número do tecido',
    hinzufuegen: 'Adicionar',
    stoffHinweis:
      'Encontra o número na página do tecido, em «Product Code». É possível indicar vários números — ou simplesmente escolher o tecido no atelier.',
    stoffEntfernen: 'Remover tecido {n}',
    uebersicht: 'Resumo',
    summaryTitelEins: 'O seu fato por medida em {n} detalhe',
    summaryTitelMehr: 'O seu fato por medida em {n} detalhes',
    summaryText: 'Guardado neste navegador. Tiramos-lhe as medidas juntos no atelier — onde afinamos cada detalhe.',
    reset: 'Repor tudo',
    stoffGruppe: 'Tecido · Holland & Sherry',
    stoffnummer: 'Número do tecido',
    leerTitel: 'Ainda nada escolhido.',
    leerText: 'Toque acima em lapelas, bolsos, botões e forro — a sua seleção aparecerá aqui.',
    leerKnopf: 'Começar pelo casaco',
    entfernen: 'Remover {label}',
    terminKnopf: 'Marcar uma consulta com esta seleção',
    pdfKnopf: 'Descarregar PDF',
    pdfLaeuft: 'A criar o PDF …',
    pdfFertig: 'PDF descarregado',
    pdfFehler: 'Não foi possível criar o PDF',
    dockLeer: 'O seu resumo',
    dockEins: '{n} detalhe escolhido',
    dockMehr: '{n} detalhes escolhidos',
    dockText: 'Não precisa de escolher tudo — o resto combinamos no atelier.',
    dockGo: 'Ir para o resumo',
    schliessen: 'Fechar',
    code: 'Código {code}',
    brusttasche: 'Bolso de peito:',
    seitentaschen: 'Bolsos laterais:',
    abwaehlen: 'Retirar da seleção',
    waehlen: 'Escolher este detalhe',
    auswahl: {
      taschen: 'Peito {brust}, lado {seite}',
      stoffKopf: 'TECIDO (HOLLAND & SHERRY)',
      stoffnummer: 'Número do tecido',
      stoffnummern: 'Números dos tecidos',
    },
  },
  pdf: {
    dateiname: 'The-Sartorialist-Selecao-de-Estilo.pdf',
    locale: 'pt-PT',
    dokTitel: 'Seleção de Estilo, Fato por Medida — The Sartorialist Zurique',
    dokThema: 'Fato por medida, Estilos e Opções',
    ort: 'ZURIQUE',
    kopfFolge: 'Seleção de estilo · {datum}',
    titel: 'A Minha Seleção de Estilo',
    untertitel: 'para o fato por medida — Estilos e Opções',
    detailEins: '{n} detalhe',
    detailMehr: '{n} detalhes',
    stoffEins: '{n} tecido',
    stoffMehr: '{n} tecidos',
    stoffAbschnitt: 'Tecido · Holland & Sherry',
    stoffnummerKopf: 'NÚMERO DO TECIDO',
    stoffnummernKopf: 'NÚMEROS DOS TECIDOS',
    notizen: 'Notas para o atelier',
    fussHinweis: 'Tiramos-lhe as medidas no atelier — traga esta seleção para a sua consulta.',
    seite: 'Página {p} de {n}',
  },
};
