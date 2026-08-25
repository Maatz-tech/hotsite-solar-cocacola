# 05 — Animação

O pacote `motion` é o Framer Motion moderno. Ele expõe duas APIs:

- **`motion` (vanilla)** — funciona em Astro puro, dentro de `<script>`, **zero
  React, zero hidratação**. É o padrão.
- **`motion/react`** — só quando a animação depende de estado de componente
  React (`AnimatePresence`, layout animation). Aí vira ilha `client:visible`.

**Regra:** comece sempre no vanilla. Só suba pra ilha React se o vanilla não
resolver — e justifique no commit.

---

## A assinatura da casa: reveal com desfoque

Todo projeto usa a **mesma entrada**: fade + subida curta + `blur()` saindo.

```
opacity: 0 → 1     y: 24px → 0     filter: blur(10px) → blur(0px)
duração 0.7s       ease-out expo [0.22, 1, 0.36, 1]
```

O blur é o que separa "tem animação" de "parece caro". **Sem ele a entrada fica
seca e genérica** — fade+slide puro é o default de template. Não remover o blur
para "ganhar performance": `filter` é composto na GPU e o custo é irrelevante em
elementos de seção.

Variações da mesma assinatura, todas com blur:

| Função | Deslocamento | Duração | Onde |
|---|---|---|---|
| `revealOnScroll` | `y: 24 → 0`, blur 10 | 0.7 | bloco de seção, imagem, card solto |
| `revealStagger` | `y: 28 → 0`, blur 10, passo 0.10 | 0.6 | grid de cards, lista de itens |
| `revealFromX` | `x: ±32 → 0`, blur 8 | 0.55 | item de acordeão, card que entra pela lateral |
| `revealWords` | `y: 14 → 0`, blur 8, passo 0.045 | 0.55 | **só o `<h1>`/`<h2>` principal da seção** |
| `drawLine` | `scaleX: 0 → 1` | 0.6 | divisores, sublinhados, barras |
| `parallax` | `y: ±40` ligado ao scroll | — | foto grande de fundo |

`revealWords` é o efeito mais caro visualmente: **no máximo um por seção**,
sempre no heading. Palavra a palavra em body copy vira ruído.

---

## `src/lib/motion.ts` — fonte única de verdade

Nunca espalhar `duration: 0.63` mágico pelas seções. Tudo importa daqui: `EASE`,
`EASE_SOFT`, `DUR`, `IN_VIEW_AMOUNT`, `STAGGER` e as seis funções da tabela.

### Três decisões não óbvias que estão nesse arquivo

**1. Import tardio do `motion` (~26 KB gzip).** Ele competia banda com a imagem
do LCP em 4G simulado. Como todo reveal está abaixo da dobra, adiar não é
percebido — e o `inView` dispara na hora para o que já estiver na tela quando
registrar. É o que `aposCarregar()` faz (`requestIdleCallback` com timeout de
600 ms, depois do `load`).

**2. Estado inicial no CSS, condicionado à classe `.js`.** Se o `opacity: 0`
vier do JS, o elemento pisca visível antes de sumir. Se vier de CSS
incondicional, quem estiver sem JS não vê o site.

```astro
<!-- Base.astro, antes de qualquer paint -->
<script is:inline>document.documentElement.classList.add('js');</script>
```

```css
.js [data-reveal],
.js [data-reveal-x],
.js [data-reveal-stagger] > *,
.js [data-reveal-words] > [data-palavra] { opacity: 0; will-change: transform, opacity, filter; }

.js [data-draw-line] { transform: scaleX(0); transform-origin: left center; }

@media (prefers-reduced-motion: reduce) {
  .js [data-reveal], .js [data-reveal-x],
  .js [data-reveal-stagger] > *, .js [data-reveal-words] > [data-palavra] { opacity: 1; }
  .js [data-draw-line] { transform: none; }
}
```

**3. Fallback que revela.** Toda função começa com: se `prefersReducedMotion()`,
mostra tudo e sai. Conteúdo preso em `opacity: 0` porque o módulo não carregou é
conteúdo perdido — em qualquer `import('motion')` dentro de handler de clique,
envolver em `try/catch` e executar sem animação se falhar.

E ao terminar, `liberar()` devolve o controle ao CSS: o `transform` inline que o
Motion deixa mata qualquer `:hover` com transform. Ver
[QA-002](09-qa-erros-comuns.md#qa-002).

---

## `RevealText.astro` — heading palavra a palavra

As palavras são quebradas em `<span>` **no build**. Fazer isso no cliente causa
reflow e piscada ([QA-008](09-qa-erros-comuns.md#qa-008)).

```astro
<RevealText as="h2" class="h2" text="Como a gente |**trabalha**" />
```

`|` quebra linha, `**trecho**` aplica a cor de destaque. O `inline-block` no span
é obrigatório — `transform` não se aplica a elemento inline
([QA-007](09-qa-erros-comuns.md#qa-007)).

---

## Aplicando por seção

Uma seção bem animada tem **3 a 4 gestos**, não dez. Receita que funciona:

1. **Heading** → `revealWords`
2. **Parágrafo de apoio + CTA** → `revealOnScroll` com `atraso: 0.15`
3. **Grid/lista de cards** → `revealStagger`
4. **Um detalhe** que reforce o conteúdo — linha que se desenha, número que
   conta, foto com parallax

Registrar num `<script>` no fim da seção:

```astro
<script>
  import { revealWords, revealOnScroll, revealStagger } from '../../lib/motion';
  revealWords('#beneficios [data-reveal-words]');
  revealOnScroll('#beneficios [data-reveal]', { atraso: 0.15 });
  revealStagger('#beneficios [data-reveal-stagger]');
</script>
```

**Hero (acima da dobra) é exceção:** não entra com `opacity: 0` — mataria o LCP
([QA-006](09-qa-erros-comuns.md#qa-006)). No hero anima só o que não é LCP:
badge, cursor de digitação, decoração de fundo.

---

## Regras gerais

- **`prefers-reduced-motion` é obrigatório.** Sem exceção. Em React, `useReducedMotion()`.
- **Animar `transform`, `opacity` e `filter`.** `width`, `height`, `top`, `margin`
  causam layout thrash. Exceção única: altura de acordeão.
- **Nada de animação no LCP.** Acima da dobra entra imediato ou com delay ≤ 100 ms.
- **`inView` com `amount: 0.2–0.4`.** Não disparar tudo no load.
- **Durações:** micro-interação 150–250 ms · entrada 400–700 ms · slide 500–800 ms.
  Nada acima de 1 s.
- **Hover/focus continuam em CSS.** Não gastar JS com isso.
- **`will-change` só nos elementos que vão animar**, via a regra `.js [data-reveal]`.
- Import sempre dentro do `<script>` da seção que usa. Nada de `motion` global
  no `Base.astro`.
- Carrossel → `AnimatePresence`, com `aria-label`, setas navegáveis por teclado e
  autoplay pausado em `prefers-reduced-motion`.

## Checklist

- [ ] Nenhuma seção com duração/ease hard-coded — tudo de `motion.ts`.
- [ ] Classe `.js` no `<html>` e estado inicial dos reveals no CSS.
- [ ] Todo heading de seção usa `revealWords`; grids usam `revealStagger`.
- [ ] Hero não entra com `opacity: 0`.
- [ ] Com `prefers-reduced-motion: reduce`, a página inteira aparece.
- [ ] Com JS desligado, a página inteira aparece.
