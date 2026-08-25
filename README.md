# astro-power-template

Template base para **landing pages Astro 5 + Tailwind v4 construídas a partir do
Figma**, com o processo de trabalho versionado junto ao código.

O ativo principal é o **[playbook](playbook/)** — leia
[`playbook/README.md`](playbook/README.md) antes de escrever qualquer linha.

## Stack

- **Astro 5** (output static) + **Tailwind CSS v4** (tokens `@theme` em [`src/styles/global.css`](src/styles/global.css))
- **Framer Motion** (pacote `motion`) — vanilla, sem React, via [`src/lib/motion.ts`](src/lib/motion.ts)
- **Playwright** para screenshots de comparação pixel-perfect ([`scripts/shot.mjs`](scripts/shot.mjs))
- **Figma via MCP** como fonte de verdade do design

## Começando um projeto novo

```bash
cp -R astro-power-template ../<nome-projeto>
cd ../<nome-projeto>
rm -rf node_modules .astro dist
npm pkg set name=<nome-projeto>
npm install
npm run dev
```

Depois: preencher [`PROJECT.md`](PROJECT.md) e seguir o playbook a partir da
[Fase 0](playbook/01-kickoff.md).

## Estrutura

```text
playbook/            processo de trabalho — fases, regras, QA
PROJECT.md           briefing do projeto (preencher na Fase 0)
docs/reference/      screenshots do Figma (versionados)
docs/local/          screenshots do build local (ignorados pelo git)
scripts/            shot.mjs · compare-section.mjs · audit-ux.mjs · lighthouse.mjs
docs/review/         relatórios e comparativos gerados pelos revisores
src/
  styles/global.css  tokens @theme + utilitárias semânticas
  layouts/Base.astro SEO, OG, JSON-LD, skip link, classe .js
  lib/motion.ts      primitivas de animação (fonte única de duração/ease)
  components/        globais (Header, Footer, Button, RevealText, icons/)
    sections/        uma seção do Figma = um componente
  data/site.ts       nav, social, legal — definidos uma vez
  pages/             rotas
```

## Comandos

| Comando | Ação |
|---|---|
| `npm run dev` | Dev server em `localhost:4321` |
| `npm run build` | Build de produção em `./dist/` |
| `npm run preview` | Preview do build |
| `npm run shot <url> <largura> <saída.png> [seletor]` | Screenshot headless |
| `npm run collect -- --tudo` | Coleta completa: prints, auditoria e Lighthouse |
| `npm run review:cmp -- <slug>` | Compara a seção com o Figma (desktop + mobile) |
| `npm run review:ux` | Auditoria de usabilidade no browser |
| `npm run review:perf` | Lighthouse sobre o build |

Ou, pelo agente: `/review [ux\|design\|perf\|tudo]` — ver
[`playbook/11-review.md`](playbook/11-review.md).

## Regras que não se negociam

1. Uma seção por vez, validada contra o Figma antes da próxima.
2. Zero hex hard-coded fora de `global.css`.
3. Toda animação importa duração/ease de `src/lib/motion.ts`.
4. Sem JS ou com `prefers-reduced-motion`, a página inteira aparece.
5. Erro pego em QA vira entrada em [`playbook/09-qa-erros-comuns.md`](playbook/09-qa-erros-comuns.md).
