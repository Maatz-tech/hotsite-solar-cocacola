# 10 — Anti-patterns

Lista curta do que nunca fazer. Cada item aqui já custou retrabalho.

## Processo

- Adicionar seção nova antes da anterior estar pixel-perfect.
- Marcar seção como pronta sem screenshot lado a lado.
- **Rodar o processo completo (screenshot + build + Lighthouse) para um ajuste
  de uma linha.** Ver "Modos de trabalho" no [índice](README.md).
- Entregar sem rodar Lighthouse.
- Pegar um bug em QA e não registrar em [09](09-qa-erros-comuns.md).

## Design system

- Hard-codar `#a48550` em vez de `text-gold`.
- Duplicar tipografia em cada componente em vez de usar `.h2`/`.body`.
- Criar `Section1.astro`, `Section2.astro` — usar nomes semânticos.
- Copiar SVG cru do Figma inline em uma seção.
- Deixar `data-node-id` do Figma no HTML final.
- Instalar biblioteca UI (Radix, Headless) para o que HTML nativo já faz.

## Movimento

- Entregar seção sem nenhum movimento — fica com cara de wireframe.
- Escrever `@keyframes`/tween na mão em vez de usar Framer Motion.
- Duração/ease hard-coded na seção em vez de importar de `src/lib/motion.ts`.
- `revealWords` em body copy — é só para o heading da seção.
- Remover o blur do reveal "para ganhar performance".
- Reveal com `opacity: 0` acima da dobra (mata o LCP).
- Animar `width`/`height`/`top`/`margin` (exceto altura de acordeão).
- Estado inicial invisível sem a classe `.js` — quebra a página sem JS.
- Hidratar React só para fazer um fade — vanilla `motion` resolve.

## Micro-interações

- Botão sem hover, ou hover que é só `opacity: .9`.
- Elemento clicável sem `cursor: pointer`.
- Hover em card puramente informativo.
- FAQ com item aberto no load, ou fechando sem transição.
- `outline: none` sem substituto.
