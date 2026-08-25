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

/** Destino do CTA principal. */
// PENDENTE: URL do formulário de inscrição não informada.
export const CTA_URL = '#';
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

export const LEGAL_LINKS = [
  // PENDENTE: URLs das políticas não informadas.
  { label: 'Aviso de Cookies', href: '#' },
  { label: 'Política de Privacidade', href: '#' },
] as const;
