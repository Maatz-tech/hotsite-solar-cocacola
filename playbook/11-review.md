# 11 — Review automatizado

O review roda em **duas fases, em modelos diferentes**. Comando: `/review
[ux|design|perf|tudo]`.

```
Fase 1 — COLETA                     Fase 2 — ANÁLISE
modelo pequeno (Haiku)              modelos completos, em paralelo
capture-runner                      design-reviewer
  sobe servidor                     website-reviewer
  print Figma + projeto             performance-reviewer
  audit-ux + lighthouse                 ↑ leem docs/review/
  → docs/review/coleta.json  ────────────┘
```

**Por que separar:** tirar print, subir servidor e rodar Lighthouse é execução
de comando — não se ganha nada pagando modelo caro por isso, e cada print no
contexto de um modelo grande é token queimado. Comparar pixel, julgar
usabilidade e diagnosticar performance é exatamente o oposto: é onde o modelo
bom faz diferença.

A fronteira é simples: **a coleta produz arquivos, a análise produz
julgamento.** Coleta que opina virou análise no modelo errado. Análise que tira
print está gastando modelo caro em trabalho de script.

| Agente | Modelo | Papel |
|---|---|---|
| `capture-runner` | Haiku | Coleta tudo. Não interpreta nada. Ver [12-coleta](12-coleta.md). |
| `design-reviewer` | Opus | Está igual ao Figma? |
| `website-reviewer` | Opus | É bom de usar? |
| `performance-reviewer` | Opus | É rápido o suficiente? |

Nenhum analista aplica correção sem o usuário pedir. Todos terminam
perguntando.

---

## Divisão de escopo (não sobrepor)

- **O Figma documenta e o site diverge** → `design-reviewer`.
- **O Figma não documenta** (hover, focus, erro, vazio, carregando, teclado,
  reduced-motion) → `website-reviewer`.
- **O site está fiel ao Figma e o comportamento é ruim assim mesmo** →
  `website-reviewer` reporta como observação para o designer e **não altera**.
  Mudar o layout aqui é decisão do designer, não do agente.
- **Número do Lighthouse** → `performance-reviewer`.

Essa fronteira existe para o review não virar redesign. A documentação do Figma
é preservada por padrão; alterá-la exige autorização explícita.

---

## `scripts/audit-ux.mjs`

Dirige o Chromium de verdade e mede, nos dois viewports:

- **Hover** — compara estilo computado antes e depois do `hover`, em
  `backgroundColor`, `color`, `borderColor`, `transform`, `boxShadow`, `filter`,
  `textDecoration`. Elemento sem nenhuma mudança é reportado. `opacity` sozinha
  não conta como hover.
- **Cursor** — todo interativo precisa de `pointer`.
- **Alvo de toque** — no mobile, < 44×44px é reportado.
- **Teclado** — tabula 40 vezes, registra a ordem e quem não tem indicador de
  foco.
- **Acordeão** — mede a altura em três momentos para saber se abre **e fecha**
  animado, e conta quantos já vêm abertos no load.
- **Toggles ARIA** — clica e confere se `aria-expanded` alterna.
- **axe-core** — WCAG 2.1 AA + best practices, inclusive contraste.
- **Layout** — scroll horizontal, elementos estourando o viewport, texto < 12px.
- **Conteúdo** — link `#`, âncora quebrada, `target="_blank"` sem `noopener`,
  imagem sem `alt` ou sem dimensão, id duplicado, texto placeholder.
- **Degradação** — carrega **sem JS** e com **reduced-motion** e lista o que
  ficou invisível. É o teste que pega o reveal preso em `opacity: 0`.

O script coleta evidência; ele não julga. O agente explora à mão o que o script
não cobre (carrossel, menu mobile, formulário, âncoras).

## `scripts/compare-section.mjs`

Monta `Figma | Projeto | Diferença` num PNG por viewport. O painel de diferença
usa `mix-blend-mode: difference`: preto onde bate, brilho onde desalinha.

Antes de fotografar, o script **rola a página inteira** — sem isso a seção sai
em `opacity: 0` por causa dos reveals — espera `document.fonts.ready` e remove o
dev toolbar do Astro ([QA-009](09-qa-erros-comuns.md#qa-009),
[QA-012](09-qa-erros-comuns.md#qa-012)).

## `scripts/lighthouse.mjs`

Faz `build` → `preview` → mede, mobile e desktop, e compara com os targets de
[08-entrega](08-entrega.md#performance). **Nunca medir o dev server:** HMR,
source maps e CSS não purgado inventam um número que não existe em produção.

O resumo traz o **elemento do LCP** — é por onde começa quase toda investigação
de performance neste stack.

---

## Rodar sem o coletor

Os analistas sabem coletar sozinhos (`npm run review:ux`, `review:cmp`,
`review:perf`) — o caminho existe para quando se está trabalhando numa seção só
e não vale a pena o handoff. Para review completo, use sempre as duas fases: sai
mais barato e mais rápido.

## Quando rodar

- `design-reviewer`: ao fechar cada seção (Fase 4.3) e antes da entrega.
- `website-reviewer`: quando as seções interativas estiverem prontas, e antes da
  entrega.
- `performance-reviewer`: antes da entrega, e de novo depois de qualquer
  correção de performance.

Rodar os três num projeto vazio não diz nada. Rodar os três antes de mandar para
o cliente é obrigatório.
