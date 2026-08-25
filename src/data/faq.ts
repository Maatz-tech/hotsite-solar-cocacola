/**
 * Perguntas frequentes — Figma 4016:336.
 *
 * ⚠️ PENDÊNCIA DE CONTEÚDO: o Figma traz as 5 perguntas mas **nenhuma
 * resposta** (os nós de resposta são placeholders "FAQ Answer"). Preencher
 * `resposta` antes da entrega — ver "Pendências" no PROJECT.md.
 */
export type PerguntaFrequente = {
  pergunta: string;
  /** Vazio = conteúdo ainda não recebido do cliente. */
  resposta: string;
};

export const FAQ: PerguntaFrequente[] = [
  { pergunta: 'Como funciona o processo seletivo?', resposta: '' },
  { pergunta: 'Quais são os requisitos para participar?', resposta: '' },
  { pergunta: 'Posso me candidatar para mais de uma vaga ao mesmo tempo?', resposta: '' },
  { pergunta: 'Quando vou receber um retorno sobre minha candidatura?', resposta: '' },
  { pergunta: 'Preciso ter experiência anterior para participar?', resposta: '' },
];
