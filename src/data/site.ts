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
// PENDENTE: domínio final não definido — trocar antes da entrega.
export const SITE_URL = 'https://exemplo.com.br';

/** Destino do CTA principal — formulário de inscrição (Eureca). */
export const CTA_URL = 'https://go.eureca.me/N1DfGX';
export const CTA_LABEL = 'Inscreva-se agora';

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
  'https://maatz.com.br?utm_source=trainee-solar-coca-cola&utm_medium=footer&utm_campaign=portfolio';

export const LEGAL_LINKS = [
  { label: 'Política de Privacidade', href: 'https://eureca.me/politica-de-privacidade/' },
] as const;
