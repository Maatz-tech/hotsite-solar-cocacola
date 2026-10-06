/**
 * robots.txt gerado no build, para a linha do Sitemap acompanhar o domínio
 * real em vez de ficar comentada esperando alguém lembrar.
 */
import type { APIRoute } from 'astro';
import { SITE_URL, INDEXAVEL } from '../data/site';

/**
 * Quem manda é a chave `INDEXAVEL` de src/data/site.ts — a mesma que governa
 * o meta noindex do Base.astro. Antes isto era deduzido do SITE_URL ser o
 * placeholder, o que amarrava duas decisões diferentes (ter domínio e querer
 * ser indexado) numa condição só.
 */
const ehPreview = !INDEXAVEL;

export const GET: APIRoute = () =>
  new Response(
    ehPreview
      ? `# Preview ou espelho — não indexar.
User-agent: *
Disallow: /
`
      : `# Solar Coca-Cola — Trainee 2026 · indexação liberada.
User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', SITE_URL).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
