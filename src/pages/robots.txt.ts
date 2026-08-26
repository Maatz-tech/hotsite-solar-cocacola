/**
 * robots.txt gerado no build, para a linha do Sitemap acompanhar o domínio
 * real em vez de ficar comentada esperando alguém lembrar.
 */
import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

/**
 * Enquanto o domínio final não for definido, o que está no ar é preview
 * (GitHub Pages). Liberar indexação aí faria o preview competir com o site
 * real na busca — então o padrão é bloquear e só liberar quando SITE_URL
 * deixar de ser o placeholder.
 */
const ehPreview = SITE_URL.includes('exemplo.com.br');

export const GET: APIRoute = () =>
  new Response(
    ehPreview
      ? `# Preview — domínio final ainda não definido. Não indexar.
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
