/**
 * Perguntas frequentes — Figma 4016:336, respostas fornecidas pelo cliente
 * em 26/08/2026.
 *
 * A 4ª pergunta mudou de "Quando vou receber" para "Como vou receber" junto
 * com o conteúdo — a página segue o texto do cliente, não o do Figma.
 */
export type PerguntaFrequente = {
  pergunta: string;
  /** Um item por parágrafo. */
  resposta: string[];
};

export const FAQ: PerguntaFrequente[] = [
  {
    pergunta: 'Como funciona o processo seletivo?',
    resposta: [
      'O processo seletivo tem duração de 4 meses e possui várias fases, considerando desde o período de inscrições até a admissão dos aprovados. Cada fase funciona de forma diferente e vocês recebem todas as comunicações via e-mail.',
    ],
  },
  {
    pergunta: 'Quais são os requisitos para participar?',
    resposta: [
      'Ter data de formação entre janeiro/2021 e dez/2026.',
      'Disponibilidade para atuar no modelo presencial na região da vaga.',
    ],
  },
  {
    pergunta: 'Posso me candidatar para mais de uma vaga ao mesmo tempo?',
    resposta: ['Não. Você deve escolher uma das vagas para se candidatar.'],
  },
  {
    pergunta: 'Como vou receber um retorno sobre minha candidatura?',
    resposta: [
      'Você receberá por e-mail todas as informações sobre o processo e retorno, tanto de aprovação quanto reprovação. É importante checar sua caixa de spam para garantir que nossas notificações não estão sendo direcionadas para lá.',
    ],
  },
  {
    pergunta: 'Preciso ter experiência anterior para participar?',
    resposta: ['A depender da vaga.'],
  },
];
