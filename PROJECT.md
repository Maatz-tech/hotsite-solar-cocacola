# PROJECT — Solar Coca-Cola · Trainee 2026 Supply Chain

> Preenchido na Fase 0 (`playbook/01-kickoff.md`) a partir do briefing e do
> intake do Figma. Campo faltando = **parar e perguntar**. Não inventar.

## Project meta

- **Nome:** `hotsite-solar-cocacola`
- **fileKey Figma:** `eYNkjSSqiq18W6XnQUxW6Z` — "LP - Solar Coca-cola | Eureca"
- **Home Desktop node:** `4013:1025` (1440 × 7394)
- **Home Mobile node:** `4030:2381` (375 × 10880)
- **Outras páginas:** nenhuma (single page)
- **Fonte(s):** VAG Rounded Std — Light (300) e Bold (700). **Licenciada**,
  ainda não entregue. Substituta em uso: **Nunito** (Google Fonts, 300/700).
- **Paleta base:** ver Design tokens
- **Domínio final:** *pendente*
- **Indexação:** sim no lançamento — `public/robots.txt` já libera tudo.
- **Assinatura de rodapé:** Solar Coca-Cola · Eureca · "Desenvolvido por Maatz"

---

## Design tokens (de `get_variable_defs`)

| Token Figma | Hex | Token CSS |
|---|---|---|
| `vermelho-solar/100` | `#ff0000` | `--color-brand` |
| `vermelho-solar/80` | `#ff3333` | `--color-brand-soft` |
| — (derivado) | `#cc0000` | `--color-brand-dark` (hover) |
| `cinza-solar/100` | `#282828` | `--color-ink` |
| `cinza-solar/80` | `#535353` | `--color-ink-70` |
| `cinza-solar/20` | `#d4d4d4` | `--color-ink-20` |
| `brand/black` | `#1c1c1b` | `--color-black` |
| `white` · `brand/white` | `#ffffff` | `--color-surface` |
| — (literal, não é variable) | `#f1f1f1` | `--color-surface-alt` |
| `drop shadow` | `-5px 5px 0 #282828` | `--shadow-solid-lg` |
| — (medido nos cards/botões) | `-3px 3px 0 #282828` | `--shadow-solid` |

Escala tipográfica medida: 108 (`.display`, hero) · 48 (`.h1`/`.h2`) ·
24 (`.h3`) · 20 (`.lead`) · 18 (botão) · 16 (`.body`, nav) · 14 (`.body-sm`).
Line-height 1.3 em títulos de card, 1.5 em corpo.

Padrões visuais recorrentes:

- **Sombra sólida deslocada** (`-3px 3px 0 #282828`) + borda `1px` `#282828`
  em botão e card — é a assinatura visual da marca, não um efeito pontual.
- **Cantos generosos:** seção `40px`, card `32px`, caixa de ícone `16px`,
  botão `12px`.
- Seções em `#f1f1f1` com container de `1216px` e padding `112px` / `100px`.

---

## Inventário de seções

Ordem da página. Nodes desktop → mobile.

| # | Seção | Desktop | Mobile | Status | Notas |
|---|---|---|---|---|---|
| 1 | Header | `4010:265` | `4029:2242` | ⬜ | Logo + 4 nav links + CTA. h=92 / 56 |
| 2 | Hero | `4010:290` | `4029:2268` | ⬜ | Display 108px, "Trainee" |
| 3 | Sobre a Solar | `4010:796` | `4031:2385` | ⬜ | "Uma empresa brasileira…" |
| 4 | O programa | `4028:1884` | `4031:2456` | ⬜ | "Conectamos você a um futuro sustentável" |
| 5 | Porque ser Solar | `4015:5` | `4031:2494` | ⬜ | Grid 2×2 de cards com ícone |
| 6 | Quem procuramos | `4028:1819` | `4031:2641` | ⬜ | Perfil do time de Supply Chain |
| 7 | Pré-requisitos | `4015:213` | `4031:2669` | ⬜ | Desktop vive dentro de `4028:1686` |
| 8 | Benefícios | `4025:651` | `4031:2785` | ⬜ | Desktop vive dentro de `4028:1686` |
| 9 | Etapas do processo | `4026:905` | `4031:3006` | ⬜ | Timeline Setembro → Outubro → … |
| 10 | Depoimentos | `4016:377` | `4031:3255` | ⬜ | Cards: `4102:120` `4102:127` `4102:141` `4102:149` `4102:156` |
| 11 | FAQ | `4016:326` | `4031:3326` | ⬜ | ⚠ texto placeholder de outro projeto no Figma |
| 12 | Footer | `4016:482` | `4031:2952` | ⬜ | Logos + redes sociais |
| 13 | Footer legal | `4016:507` | `4031:2992` | ⬜ | Cookies · Privacidade · "Desenvolvido por" |

Legenda: ⬜ não começou · 🟡 em andamento · ✅ pixel-perfect validado

---

## Assets

| Asset | Origem | Destino | Formato |
|---|---|---|---|
| Logo Solar horizontal | Figma `4010:399` | `public/images/brand/logo.svg` | SVG ✅ |
| Logo Maatz | template | `public/images/brand/maatz.svg` | SVG ✅ |
| Favicon | — | `public/favicon.svg` (placeholder) | ⬜ pendente |
| Ícones dos cards | Figma, por seção | `public/images/` | SVG — extrair no loop |
| Imagem do hero | Figma `4010:290` | `public/images/` | PNG — extrair no loop |
| VAG Rounded Std | cliente | `public/fonts/*.woff2` | ⬜ pendente |

---

## Decisões

- 2026-08-25 — **Nunito como substituta da VAG Rounded Std** — a licenciada não
  chegou; Nunito é rounded e tem 300/700. Já está atrás da VAG na cadeia de
  `--font-sans`, então basta declarar os `@font-face` para ela assumir.
- 2026-08-25 — **Redes sociais tiradas das annotations do Figma** (`4031:3174`),
  não do briefing: Instagram `@solarcarreiras`, LinkedIn `solar-coca-cola`,
  YouTube `@SolarBrCocaCola`. Confirmar com o cliente.
- 2026-08-25 — **Sombra sólida virou token** (`--shadow-solid`) em vez de valor
  solto: aparece em todo botão e card.

---

## Pendências / bloqueios

- [ ] **Domínio final** — trava canonical, OG, sitemap e `robots.txt`. *Cliente.*
- [ ] **VAG Rounded Std (.woff2)** — Light e Bold. Até chegar, o site renderiza
      em Nunito e não fecha pixel-perfect. *Cliente.*
- [ ] **URL do formulário de inscrição** — `CTA_URL` está `#`, e o CTA aparece
      em pelo menos 4 seções. *Cliente.*
- [ ] **URLs de Aviso de Cookies e Política de Privacidade** — `LEGAL_LINKS`
      está `#`. *Cliente.*
- [ ] **Favicon** — não existe ainda; hoje é o placeholder do template. *Cliente.*
- [ ] **Confirmar as 3 redes sociais** lidas das annotations do Figma. *Cliente.*
- [ ] **FAQ com texto de outro projeto** — o Figma tem "Não vendemos só a licença.
      Entregamos a proteção configurada…" na seção 11, além de `FAQ Question` /
      `FAQ Answer` genéricos. Falta o conteúdo real. *Designer/Cliente.*
- [ ] **Título da seção 10 diverge entre breakpoints** — desktop diz "Talentos que
      passaram pelo programa", mobile diz "O que nossas pessoas Solares têm a
      dizer". Definir qual vale. *Designer.*
- [ ] **Mobile do Figma é 375px**, e o review roda em 390px. Confirmar que a
      seção estica sem quebrar. *Interno.*
