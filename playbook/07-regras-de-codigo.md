# 07 — Regras de código

Não é uma fase — vale desde a primeira linha até a entrega.

## SVG

- **Ícones reutilizáveis:** `src/components/icons/<Nome>.astro`, SVG inline com
  `currentColor` para herdar cor. **Nunca** colar SVG cru dentro de uma seção.
- **Assets estáticos** (logos, ilustrações complexas): `public/images/*.svg`
  via `<img src="/images/…">`.
- Limpar `<title>`, `<desc>`, `id` e classes geradas pelo Figma antes de commitar.

## Imagens

- Todo raster vira **WebP** (JPG só por compatibilidade específica):
  ```bash
  cwebp -q 82 input.png -o output.webp
  ```
- Usar `astro:assets` (`import { Image } from 'astro:assets'`) para imagens
  locais — gera formatos e tamanhos automaticamente.
- `loading="lazy"` em tudo abaixo da dobra; `loading="eager"` +
  `fetchpriority="high"` só no LCP.
- `width` e `height` **sempre** presentes (evita CLS).
- `alt` obrigatório: descritivo se contextual, `alt=""` se decorativa.

## CSS / Tailwind

- Tokens `@theme` são a única fonte de cores/fontes. Zero hex em componentes.
- Utilitárias semânticas (`.h2`, `.body`, `.eyebrow`) antes de duplicar
  `text-[36px] font-bold leading-10`.
- Responsivo por breakpoint (`md:` 768, `lg:` 1024, `xl:` 1280), alinhado com o
  Figma.
- Hover que disputa com utilitária mora fora de `@layer`
  ([QA-001](09-qa-erros-comuns.md#qa-001)).

## DRY

- Aparece 2 vezes → extrair componente.
- Aparece 3 vezes com variações → componente com props.
- Aparece em duas páginas → promover para `src/components/` (fora de `sections/`).
- Listas de nav, serviços, contato → `src/data/site.ts` ou `src/content/`.

## JS

- Preferir CSS/HTML nativo para **interação**: `<details>`, `:has()`,
  `:focus-within`, scroll-snap, container queries.
- Se precisar JS: `<script>` no próprio `.astro`, escopo do componente.
- **Animação é exceção:** usar Framer Motion ([05](05-animacao.md)), não escrever
  tween na mão.
- Nada de bibliotecas grandes (jQuery, Alpine full, GSAP) sem necessidade real.

## HTML semântico

- `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` corretos.
- Um único `<h1>` por página (o hero).
- `<h2>` por seção; sub-elementos em `<h3>`+. Nunca pular nível.
- Botão que navega é `<a>`; botão que executa ação é `<button>`.

## Nomes

- Seções: `HeroSection.astro`, `ServicesSection.astro`. Nunca `Section1.astro`.
- Componentes em PascalCase, dados e utilitários em camelCase.
- `id` de seção em kebab-case e igual à âncora usada no nav.
