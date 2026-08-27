/**
 * Dados da vaga para o schema JobPosting (Google for Jobs).
 *
 * Tudo aqui já aparece na página — isto é a mesma informação em formato que o
 * buscador entende. Se o conteúdo da página mudar, mudar aqui junto.
 *
 * Referência: https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */

/**
 * PENDENTE DE CONFIRMAÇÃO: o Google exige `datePosted` e usa a data para
 * ordenar e para expirar a vaga. Coloquei a data em que a página foi montada.
 * Trocar pela data real de publicação antes do lançamento.
 */
export const DATA_PUBLICACAO = '2026-08-26';

/** Último dia de inscrição — a página anuncia "até 28 de setembro". */
export const PRAZO_INSCRICAO = '2026-09-28T23:59:59-03:00';

export const SALARIO_MENSAL = 7500;

/** Duração do programa, em meses. */
export const DURACAO_MESES = 18;

/** Uma entrada por praça anunciada na seção de pré-requisitos. */
export const PRACAS = [
  { area: 'Engenharia', uf: 'CE' },
  { area: 'Logística', uf: 'AL' },
  { area: 'Logística', uf: 'MA' },
  { area: 'Manutenção', uf: 'MT' },
  { area: 'Manutenção', uf: 'BA' },
] as const;

export const DESCRICAO_VAGA = `Programa de Trainee 2026 da Solar Coca-Cola para Supply Chain.

Uma trilha de aprendizagem robusta, com desafios práticos e mentoria direta das principais lideranças da empresa para impulsionar as carreiras dos novos trainees rumo a posições de destaque.

Pré-requisitos: cursando ensino superior nas modalidades bacharelado, licenciatura ou tecnólogo, nas áreas de Logística, Manutenção ou Engenharia, com conclusão entre janeiro/2021 e dezembro/2026. É necessária disponibilidade para trabalhar presencialmente durante os 18 meses do programa.

Benefícios: salário de R$ 7.500,00 por mês, vale-refeição ou refeitório na unidade, plano de saúde, plano odontológico, vale-transporte ou fretado, seguro de vida, participação nos resultados, Wellhub (Gympass), desconto nos produtos, kit natalino, programa de saúde emocional, telemedicina e auxílio-mudança.`;
