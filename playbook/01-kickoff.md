# 01 — Kickoff e setup

## Fase 0 — Design intake

Antes de escrever qualquer código, preencher [`PROJECT.md`](../PROJECT.md).

Se algum campo estiver faltando, **parar e perguntar** ao cliente/designer. Não
inventar domínio, fonte, cor ou copy.

### Ações

1. `get_metadata` no node da home → salvar a árvore para identificar
   Header/Footer/seções e seus IDs. Alimenta o **inventário de seções** do
   PROJECT.md.
2. `get_variable_defs` no node da home → extrair cores, fontes, tracking,
   line-heights. Alimenta a **tabela de tokens** do PROJECT.md.
3. `get_screenshot` na home desktop e mobile → salvar em
   `docs/reference/home-desktop.png` e `docs/reference/home-mobile.png`.
4. Inventariar assets (logos, ilustrações, fotos) e listar em PROJECT.md.

### Perguntas que sempre precisam de resposta antes de começar

- Domínio final (canonical, OG, sitemap dependem disso).
- A fonte do design é licenciada? Se sim, quem entrega os `.woff2`?
- Destino real dos formulários e CTAs (endpoint, e-mail, Formspree…).
- Perfis sociais reais e URLs de política de privacidade / cookies.
- O site vai ser indexado no lançamento?

Nada disso pode virar placeholder na entrega.

---

## Fase 1 — Setup

```bash
cp -R astro-power-template ../<nome-projeto>
cd ../<nome-projeto>
rm -rf node_modules .astro dist
npm pkg set name=<nome-projeto>
npm install
npm run dev   # sanity check, sobe em :4321
```

Depois da cópia, o que **precisa** ser trocado antes da primeira seção:

- [ ] `package.json` → `name`.
- [ ] `PROJECT.md` → preenchido.
- [ ] `src/data/site.ts` → `SITE_NAME`, `SITE_URL`, nav, social, legal.
- [ ] `src/styles/global.css` → tokens da marca (fase 02).
- [ ] `src/layouts/Base.astro` → família da fonte e descrição padrão.
- [ ] `public/images/brand/logo.svg` → logo real.
- [ ] `public/favicon.svg` e `public/og.jpg` (1200×630).

### Checklist de saída

- [ ] `npm run dev` sobe sem warning.
- [ ] `npm run build` termina sem erro.
- [ ] Nenhum resquício do template aparece na tela (`LOGO`, `<Marca>`, `Seção 1`).
