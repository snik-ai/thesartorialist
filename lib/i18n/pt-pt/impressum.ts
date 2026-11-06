import type { Woerterbuch } from '../de';

// Ficha técnica
export const impressum: Woerterbuch['impressum'] = {
  meta: {
    titel: 'Ficha Técnica',
    beschreibung: 'Ficha técnica do The Sartorialist Zurique — Swiss Art Partner AG.',
  },
  h1: 'Ficha técnica',
  hinweisMassgeblich:
    'Esta tradução para português é disponibilizada apenas para sua conveniência. A versão alemã é a juridicamente vinculativa: [ler a versão alemã](/impressum/).',
  unternehmen: {
    titel: 'Dados da empresa',
    land: 'Suíça',
    vertreten: 'Representada por: ',
  },
  kontakt: {
    titel: 'Contacto',
    telefon: 'Telefone: ',
    email: 'E-mail: ',
  },
  abschnitte: [
    {
      titel: 'Resolução de litígios de consumo / entidade de resolução alternativa de litígios',
      absaetze: [
        'Não estamos dispostos nem obrigados a participar em procedimentos de resolução de litígios perante uma entidade de arbitragem de consumo.',
      ],
    },
    {
      titel: 'Responsabilidade pelos conteúdos',
      absaetze: [
        'Enquanto prestador de serviços, somos responsáveis pelos nossos próprios conteúdos nestas páginas, nos termos da lei geral. Não estamos, contudo, obrigados a monitorizar informações de terceiros transmitidas ou armazenadas, nem a investigar circunstâncias que indiciem uma atividade ilícita.',
        'Mantêm-se inalteradas as obrigações de remover ou bloquear a utilização de informações nos termos da lei geral. No entanto, essa responsabilidade só é possível a partir do momento em que tomemos conhecimento de uma infração concreta. Logo que tomemos conhecimento de tal infração, removeremos de imediato os conteúdos em causa.',
      ],
    },
    {
      titel: 'Responsabilidade pelas ligações',
      absaetze: [
        'O nosso website contém ligações para websites externos de terceiros, sobre cujos conteúdos não temos qualquer controlo. Por isso, não podemos assumir qualquer responsabilidade por esses conteúdos de terceiros. O respetivo fornecedor ou operador das páginas ligadas é sempre o responsável pelos seus conteúdos. As páginas ligadas foram verificadas quanto a eventuais infrações legais no momento em que as ligações foram criadas.',
        'Não é razoável uma monitorização permanente dos conteúdos das páginas ligadas sem indícios concretos de uma infração. Logo que tomemos conhecimento de quaisquer infrações, removeremos de imediato essas ligações.',
      ],
    },
    {
      titel: 'Direitos de autor',
      absaetze: [
        'Os conteúdos e obras criados pelos operadores do site nestas páginas estão sujeitos a direitos de autor. A reprodução, edição, distribuição e qualquer forma de exploração para além dos limites da lei de direitos de autor requerem o consentimento escrito do respetivo autor ou criador. Os downloads e cópias deste site só são permitidos para uso privado e não comercial.',
        'Na medida em que os conteúdos deste site não tenham sido criados pelo operador, são respeitados os direitos de autor de terceiros. Caso, ainda assim, tome conhecimento de uma infração de direitos de autor, solicitamos que nos informe. Logo que tomemos conhecimento de quaisquer infrações, removeremos de imediato esses conteúdos.',
      ],
    },
  ],
};
