# 04 — Loop de seções

O coração do trabalho. Para **cada seção** do Figma, executar o loop abaixo
inteiro. Não pular etapas, não começar a próxima antes de fechar esta.

---

## 4.1 Coleta

1. Abrir o node da seção no Figma, copiar a URL, extrair o `nodeId`.
2. `get_design_context` no `nodeId` → código de referência (React+Tailwind) e
   lista de assets.
3. `get_screenshot` no mesmo `nodeId` → `docs/reference/<slug>-desktop.png`.
4. Repetir 2 e 3 para o node mobile → `docs/reference/<slug>-mobile.png`.
5. Baixar os assets referenciados (`figma.com/api/mcp/asset/…`) para
   `public/images/<slug>/` — convertendo raster para WebP
   (ver [07-regras-de-codigo](07-regras-de-codigo.md)).

## 4.2 Implementação

- Criar `src/components/sections/<PascalName>Section.astro`.
- Traduzir o código React de referência para Astro:
  - Remover `data-node-id` e classes geradas pelo Figma.
  - Trocar `var(--color/orange/48)` pelos tokens do projeto (`text-brand`).
  - Usar utilitárias semânticas em vez de reimplementar tipografia.
  - Sub-elementos repetidos (cards, itens de lista) viram sub-componentes —
    nunca copiar-colar 3× a mesma estrutura.
- Montar a seção na página (`src/pages/index.astro`), com `id` estável para as
  âncoras do nav.

## 4.3 Comparação pixel-perfect

É o passo que separa "quase pronto" de entrega.

```bash
npm run dev
npm run shot http://localhost:4321 1440 docs/local/<slug>-desktop.png "#<slug>"
npm run shot http://localhost:4321 390  docs/local/<slug>-mobile.png  "#<slug>"
```

Abrir lado a lado com `docs/reference/<slug>-*.png` e auditar **nesta ordem**:

1. **Layout / spacing** — paddings, gaps, margens.
2. **Tipografia** — size, line-height, letter-spacing, weight.
3. **Cores** — sempre pelo hex exato do token.
4. **Radius, sombras, blur** — copiar os valores do Figma.
5. **Imagens** — aspect ratio, `object-fit`.
6. **Estados interativos** — hover, focus, active. O Figma costuma esconder;
   na dúvida, perguntar ao designer.

Ajustar → recarregar → recomparar. **Iterar até diferença < ~3px em spacing e
cores idênticas**, nos dois viewports.

```
┌─ Figma node ─────┐   ┌─ Astro section ──┐
│ get_screenshot   │   │ npm run shot     │
│ → reference.png  │   │ → local.png      │
└────────┬─────────┘   └─────────┬────────┘
         └────────── diff ───────┘
                     │
              < 3px & cores exatas?
              /              \
            não               sim
             │                 │
        ajustar CSS      próxima seção
```

## 4.4 Fecho da seção

- [ ] Screenshots desktop e mobile validados contra o Figma.
- [ ] Zero estilo hard-coded (tudo via tokens/utilitárias).
- [ ] Nenhum sub-elemento duplicado — extraído se aparece 2+ vezes.
- [ ] Textos revisados (typos, acentuação).
- [ ] Links reais, ou placeholders `#` marcados como TODO no PROJECT.md.
- [ ] **Movimento aplicado** — heading com `revealWords`, grid com
      `revealStagger`, apoio/CTA com `revealOnScroll`. Ver [05](05-animacao.md).
- [ ] **Hover em todo elemento interativo** + `cursor: pointer`. Ver [06](06-micro-interacoes.md).
- [ ] Passada rápida no [catálogo de QA](09-qa-erros-comuns.md).
- [ ] `npm run build` ainda passa.
- [ ] Status atualizado no inventário do PROJECT.md.

**Só então** pegar a próxima seção.

---

## Páginas internas

Repetir o loop para cada rota (`/sobre`, `/contato`). Muitas seções já vão
existir como componentes — importar direto. Rotas em `src/pages/<slug>.astro`.
Para conjuntos grandes (blog), usar Content Collections em `src/content/`.
