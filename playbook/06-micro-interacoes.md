# 06 — Micro-interações

Não é enfeite: é o que faz o site parecer terminado. **Checar antes de fechar
qualquer seção.**

---

## Hover em botão

Todo botão precisa de um estado de hover perceptível, não só `opacity: .9`.
Padrão da casa:

```css
.btn {
  transition: background-color 200ms ease, color 200ms ease,
              border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease;
}
.btn:hover  { transform: translateY(-2px); }  /* levanta */
.btn:active { transform: translateY(0); }     /* afunda no clique */

.btn-primary:hover { background: var(--color-brand-dark); }
.btn-outline:hover { background: var(--color-brand); color: var(--color-surface); }
```

E o ícone dentro do botão anda junto:

```css
.btn:hover .btn-icon { transform: translateX(3px); }
```

> Essas regras moram **fora de `@layer`** em `global.css`. Ver
> [QA-001](09-qa-erros-comuns.md#qa-001).

## `cursor: pointer` em tudo que é clicável

`<button>` não tem cursor pointer por padrão em todos os browsers, e `<summary>`,
cards clicáveis, dots de carrossel e ícones com handler nunca têm.

```css
button, summary, [role='button'], label[for], a[href] { cursor: pointer; }
```

## Hover em card

Card que abre algo ou leva a algum lugar **reage**: borda que muda de cor,
`translateY(-4px)`, sombra que cresce (`.card-interactive`). Card puramente
informativo **não reage** — hover em coisa não clicável é ruído.

## Foco visível

`:focus-visible` com outline na cor de destaque. Nunca `outline: none` sem
substituto.

## Link de texto

Sublinhado que cresce ou cor que muda, transição de 150 ms.

---

## FAQ / acordeão

Três regras, sempre:

1. **Todos os itens começam fechados.** O Figma costuma mostrar o primeiro
   aberto só para demonstrar o estado — não é o default de produção
   ([QA-005](09-qa-erros-comuns.md#qa-005)).
2. **Abertura e fechamento animados.** Acordeão que salta de 0 para a altura
   final parece quebrado. `<details>` sozinho não anima. Preferir CSS puro:

```css
.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 350ms cubic-bezier(0.22, 1, 0.36, 1);
}
.faq-item[open] .faq-answer { grid-template-rows: 1fr; }
.faq-answer > div { overflow: hidden; }
```

   Com `<details>`, o **fechamento** precisa de JS: o browser remove o atributo
   `open` na hora e o conteúdo some antes da transição rodar. Interceptar o
   `toggle` e segurar o `open` até a animação terminar
   ([QA-004](09-qa-erros-comuns.md#qa-004)).

3. **A seta gira.** `transition: transform 300ms` + `rotate(180deg)` no aberto.

Acessibilidade: `<details>/<summary>` já dá teclado e leitor de tela de graça.
Sem `<details>`, precisa de `aria-expanded` e `aria-controls` na mão.

---

## Carrossel

- Setas e dots navegáveis por teclado, com `aria-label` descritivo.
- Região com `aria-roledescription="carousel"` e `aria-live="polite"` no track.
- Autoplay pausa em `:hover`, em `:focus-within` e em `prefers-reduced-motion`.
- Dots com `cursor: pointer` e área de toque ≥ 44×44 px.

---

## Checklist

- [ ] Todo botão tem hover + active perceptíveis; ícone acompanha.
- [ ] `cursor: pointer` em botão, `summary`, card clicável e dot de carrossel.
- [ ] Cards clicáveis reagem; cards informativos não.
- [ ] FAQ: todos fechados, abertura **e** fechamento animados, seta girando.
- [ ] `:focus-visible` visível em todos os interativos.
- [ ] Nenhum hover morto por `transform` inline do Motion ([QA-002](09-qa-erros-comuns.md#qa-002)).
