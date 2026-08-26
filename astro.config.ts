// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL } from './src/data/site';

// Config em .ts (e não .mjs) para importar o SITE_URL de src/data/site.ts:
// domínio definido num lugar só alimenta canonical, OG, JSON-LD, sitemap e
// robots.txt de uma vez.
// O GitHub Pages de projeto serve em /<repo>/. O workflow passa BASE_PATH;
// em desenvolvimento e no domínio final fica na raiz.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
