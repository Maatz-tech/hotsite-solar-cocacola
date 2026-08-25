/**
 * Dados compartilhados do site — definidos UMA vez, importados onde precisa.
 * Regra do playbook (DRY): listas de nav/social/legal moram aqui.
 *
 * Preencher no início do projeto. Nada de placeholder na entrega.
 */

/** Nome da marca — usado em alt, aria-label e JSON-LD. */
export const SITE_NAME = '<Marca>';

/** URL final, sem barra no fim. Usada em canonical, OG e sitemap. */
export const SITE_URL = 'https://exemplo.com.br';

/** Destino do CTA principal. */
export const CTA_URL = '#contato';
export const CTA_LABEL = 'Fale conosco';

export const NAV_LINKS = [
  { label: 'Seção 1', href: '#secao-1' },
  { label: 'Seção 2', href: '#secao-2' },
  { label: 'Seção 3', href: '#secao-3' },
] as const;

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: 'Instagram' },
  { label: 'Facebook', href: '#', icon: 'Facebook' },
  { label: 'LinkedIn', href: '#', icon: 'LinkedIn' },
  { label: 'TikTok', href: '#', icon: 'TikTok' },
] as const;

export const LEGAL_LINKS = [
  { label: 'Aviso de Cookies', href: '#' },
  { label: 'Política de Privacidade', href: '#' },
] as const;
