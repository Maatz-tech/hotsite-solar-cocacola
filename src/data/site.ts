/**
 * Dados compartilhados do site — definidos UMA vez, importados onde precisa.
 * Regra do playbook (DRY): listas de nav/social/legal moram aqui.
 *
 * Fonte: Figma eYNkjSSqiq18W6XnQUxW6Z (LP - Solar Coca-cola | Eureca).
 * O que está como '#' é pendência registrada no PROJECT.md.
 */

/** Nome da marca — usado em alt, aria-label e JSON-LD. */
export const SITE_NAME = 'Solar Coca-Cola';

/** URL final, sem barra no fim. Usada em canonical, OG e sitemap. */
export const SITE_URL = 'https://traineesolarcocacola.eureca.me';

/**
 * A main é produção. O espelho do GitHub Pages não é mais atualizado em push
 * (o workflow ficou só manual), mas continua existindo: é o build que recebe
 * BASE_PATH, e ele nunca é indexável, não importa a chave abaixo.
 */
export const ESPELHO = (process.env.BASE_PATH ?? '/') !== '/';

/**
 * Governa indexação em UM lugar só. Em `false`:
 *   · o Base.astro emite <meta name="robots" content="noindex, nofollow">
 *   · o robots.txt bloqueia tudo e não anuncia o sitemap
 *
 * Os dois juntos são o ponto: `Disallow` sozinho barra o rastreio, mas não
 * impede o Google de indexar a URL achada por link de fora — quem garante
 * isso é o meta.
 *
 * `LANCADO` é a decisão; `INDEXAVEL` é o que o build usa. No espelho o
 * resultado é sempre `false`, para o github.io não disputar com o domínio.
 */
const LANCADO = true;
export const INDEXAVEL = LANCADO && !ESPELHO;

/** Destino do CTA principal — formulário de inscrição (Eureca). */
export const CTA_URL = 'https://go.eureca.me/N1DfGX';
export const CTA_LABEL = 'Inscreva-se agora';

/**
 * Chave do fim das inscrições. Em `true`, os 7 CTAs da página param de levar ao
 * formulário: viram botão, trocam o rótulo para ENCERRADO_LABEL e abrem o modal
 * de aviso. Para reabrir o programa, basta voltar para `false` — nada mais muda.
 *
 * Datas exibidas no modal saem de src/data/vaga.ts, que é a mesma fonte do
 * JobPosting; não duplicar aqui.
 */
export const INSCRICOES_ENCERRADAS = true;

/** Rótulo que substitui o CTA_LABEL com as inscrições encerradas. */
export const ENCERRADO_LABEL = 'Inscrições encerradas';

export const NAV_LINKS = [
  { label: 'Pré-Requisitos', href: '#pre-requisitos' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Etapas', href: '#etapas' },
  { label: 'FAQ', href: '#faq' },
] as const;

/** URLs vindas das annotations do Figma no node 4031:3174. */
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/solarcarreiras/', icon: 'Instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/solar-coca-cola/', icon: 'LinkedIn' },
  { label: 'YouTube', href: 'https://www.youtube.com/@SolarBrCocaCola', icon: 'YouTube' },
] as const;

/** Assinatura da agência no rodapé. O utm_source identifica de qual site veio. */
export const MAATZ_URL =
  'https://maatz.com.br/sites/?utm_source=trainee-solar-coca-cola&utm_medium=footer&utm_campaign=portfolio';

/** Eureca — dona do programa; o logo do rodapé leva pro site dela. */
export const EURECA_URL = 'https://eureca.me/';

export const LEGAL_LINKS = [
  { label: 'Política de Privacidade', href: 'https://eureca.me/politica-de-privacidade/' },
] as const;
