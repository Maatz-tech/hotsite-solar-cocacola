# 03 — Componentes globais

Nesta ordem, **um por vez**, em `src/components/`:

1. **Header** — logo, nav, CTA, menu mobile (hamburger com `aria-expanded` e
   `aria-controls`). Se o Figma não tem nav no mobile, não inventar hamburger.
2. **Footer** — colunas (marca, nav, contato) + bottom bar. Stack no mobile.
3. **Button** — variantes (`primary`/`outline`/`invert`) e tamanhos
   (`sm`/`md`/`lg`). Com `href` vira `<a>`, sem `href` vira `<button>`.
4. **Badge / Eyebrow** — pill colorida acima do heading.
5. **SectionHeader** — eyebrow + `<h2>` + subtítulo opcional. Reutilizado em
   quase toda seção.
6. **RevealText** — heading palavra a palavra. Já vem no template, ver
   [05-animacao](05-animacao.md).
7. **Icon** — SVG inline em `src/components/icons/<Nome>.astro`, com
   `currentColor`. Nunca SVG cru dentro de uma seção.

Cada componente deve:

- Aceitar props tipadas (`interface Props`) com defaults sensatos.
- Usar utilitárias semânticas (`.h2`, `.body`) e tokens (`text-brand`, `bg-ink`).
- Ser responsivo nos breakpoints do Figma.
- Ter hover/focus definidos (ver [06-micro-interacoes](06-micro-interacoes.md)).

## Regra de corte

**Só passar para o loop de seções quando Header e Footer estiverem
pixel-perfect.** Eles aparecem em todas as páginas — um bug ali contamina o site
inteiro, e corrigir depois significa revalidar tudo.
