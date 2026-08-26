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
| 1 | Header | `4010:265` | `4029:2242` | ✅ | Logo + 4 nav links + CTA. h=92 / 56 |
| 2 | Hero | `4010:290` | `4029:2268` | ✅ | Display 108px, "Trainee" |
| 3 | Sobre a Solar | `4010:796` | `4031:2385` | ✅ | "Uma empresa brasileira…" |
| 4 | O programa | `4028:1884` | `4031:2456` | ✅ | "Conectamos você a um futuro sustentável" |
| 5 | Porque ser Solar | `4015:5` | `4031:2494` | ✅ | Grid 2×2 de cards com ícone |
| 6 | Quem procuramos | `4028:1819` | `4031:2641` | ✅ | Perfil do time de Supply Chain |
| 7 | Pré-requisitos | `4015:213` | `4031:2669` | ✅ | Desktop vive dentro de `4028:1686` |
| 8 | Benefícios | `4025:651` | `4031:2785` | ✅ | Desktop vive dentro de `4028:1686` |
| 9 | Etapas do processo | `4026:905` | `4031:3006` | ✅ | Timeline Setembro → Outubro → … |
| 10 | Depoimentos | `4016:377` | `4031:3255` | 🟡 | Cards: `4102:120` `4102:127` `4102:141` `4102:149` `4102:156` |
| 11 | FAQ | `4016:326` | `4031:3326` | 🟡 | ⚠ texto placeholder de outro projeto no Figma |
| 12 | Footer | `4016:482` | `4031:2952` | ✅ | Logos + redes sociais |
| 13 | Footer legal | `4016:507` | `4031:2992` | ✅ | Cookies · Privacidade · "Desenvolvido por" |

Legenda: ⬜ não começou · 🟡 em andamento · ✅ pixel-perfect validado

Altura total contra o Figma: **desktop +1,5%** (7487 vs 7378) e **mobile +6,0%**
(11634 vs 10976). A diferença é a substituição da fonte — Nunito é mais larga
que a VAG Rounded e quebra linha antes. Deve fechar quando os `.woff2` chegarem.

### Medições (25/08/2026, build de produção)

| | Desktop | Mobile |
|---|---|---|
| Performance | **100** | **90–95** (oscila entre execuções) |
| Acessibilidade | 96 | 96 |
| Boas práticas | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 0,7 s | 2,9–3,5 s |
| CLS | 0,01 | 0,001 |

Os 96 de acessibilidade são a única violação do axe: contraste do vermelho da
marca (ver Pendências). Auditoria de usabilidade: 0 elementos sem foco visível,
0 acordeões abertos no load, 0 erros de console, página inteira visível sem JS
e com `prefers-reduced-motion`.

---

## Assets

| Asset | Origem | Destino | Formato |
|---|---|---|---|
| Logo Solar horizontal | Figma `4010:399` | `public/images/brand/logo.svg` | SVG ✅ |
| Logo Maatz | template | `public/images/brand/maatz.svg` | SVG ✅ |
| Favicon | logo horizontal, remontado empilhado | `public/favicon.svg` + PNG 96/180 | SVG ✅ |
| Logo branco (rodapé) | recolorido de `logo.svg` | `public/images/brand/logo-branco.svg` | SVG ✅ |
| Logo Eureca | Figma `4095:94` | `public/images/brand/eureca.webp` | WebP ✅ |
| Ícones (10) | Figma, por seção | `public/images/icones/` | SVG ✅ |
| Curvas do hero | Figma `4010:645` | `public/images/hero/stripes.svg` | SVG ✅ |
| Foto do hero | `rawImages` de `4012:934` | `public/images/hero/pessoas.webp` | WebP ✅ |
| Fotos de seção (7) | Figma, export 3× | `public/images/<seção>/` | WebP ✅ |
| Fotos dos depoimentos (5) | Figma `4102:*`, export 3× | `public/images/depoimentos/` | WebP ✅ |
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
- 2026-08-25 — **Foto do hero usa o `rawImages`**, não o export do nó: o export
  achata o alpha e o anel vermelho sumia por trás das pessoas. Virou
  [QA-017](playbook/09-qa-erros-comuns.md).
- 2026-08-25 — **Anel vermelho feito com `border`** em vez de dois elementos:
  assim o furo é transparente e as curvas de nível aparecem através dele.
- 2026-08-26 — **Corrigida a espessura do anel** (review de design). Eu tinha
  lido a `Ellipse 24` (263px, mesmo centro) como o furo; ela não é. No Figma o
  anel é um círculo com **traço**: `stroke-width` 120 sobre r=359 no desktop
  (`4012:936`) e 64 sobre r=197 no mobile (`4029:2377`). O furo real tem ~600px
  no desktop, não 263. Sempre conferir `stroke-width` no SVG do nó antes de
  deduzir geometria de anel a partir de dois círculos concêntricos.
- 2026-08-25 — **Assinatura do rodapé virou texto**, não o vetor do Figma —
  mesmo desenho, e legível por leitor de tela e por busca.
- 2026-08-25 — **Carrosséis com scroll-snap nativo** (depoimentos e, no mobile,
  os diferenciais) em vez de biblioteca: funciona por toque, teclado e sem JS.

---

## Pendências / bloqueios

- [ ] **Domínio final** — trava canonical, OG, sitemap e `robots.txt`. *Cliente.*
- [ ] **VAG Rounded Std (.woff2)** — Light e Bold. Até chegar, o site renderiza
      em Nunito e não fecha pixel-perfect. *Cliente.*
- [ ] **URL do formulário de inscrição** — `CTA_URL` está `#`, e o CTA aparece
      em pelo menos 4 seções. *Cliente.*
- [ ] **URLs de Aviso de Cookies e Política de Privacidade** — `LEGAL_LINKS`
      está `#`. *Cliente.*
- [ ] **Favicon** — montei um a partir do logo horizontal (SOLAR + Coca-Cola
      empilhados, fundo branco), igual à imagem que você mandou. Confirmar se é
      esse mesmo o arquivo oficial. *Cliente.*
- [ ] **Foto do hero em resolução maior** — a original no Figma tem 1449×1086,
      o que dá só 1,5× no slot do desktop. Pedir a foto em pelo menos 2000px de
      largura. *Cliente/Designer.*
- [ ] **Confirmar as 3 redes sociais** lidas das annotations do Figma. *Cliente.*
- [ ] **FAQ com texto de outro projeto** — o Figma tem "Não vendemos só a licença.
      Entregamos a proteção configurada…" na seção 11, além de `FAQ Question` /
      `FAQ Answer` genéricos. Falta o conteúdo real. *Designer/Cliente.*
- [ ] **Título da seção 10 diverge entre breakpoints** — desktop diz "Talentos que
      passaram pelo programa", mobile diz "O que nossas pessoas Solares têm a
      dizer". Definir qual vale. *Designer.*
- [ ] **Mobile do Figma é 375px**, e o review roda em 390px. Confirmar que a
      seção estica sem quebrar. *Interno.*
- [ ] **Contraste do vermelho da marca** — branco sobre `#FF0000` dá 4,0:1 e o
      vermelho sobre branco também. WCAG AA pede 4,5:1 para texto de 18px
      bold (que não conta como "texto grande"). Vale para todo botão primário e
      para os textos vermelhos. **Não mudei nada**: é a cor da marca, veio do
      Figma, e escurecer é decisão de design. Opções: escurecer o vermelho do
      texto para `#D40000` (4,8:1) mantendo o fundo, ou subir o texto dos
      botões para 20px bold. *Designer/Cliente.*
- [ ] **Título dos depoimentos diverge entre breakpoints** — desktop diz
      "Talentos que passaram pelo programa", mobile diz "O que nossas pessoas
      Solares têm a dizer". Está o do desktop nos dois. Confirmar qual vale.
      *Cliente/Designer.*
- [ ] **Respostas do FAQ** — bloqueia a seção 11. As 5 perguntas estão no
      Figma, as respostas não existem (nós `FAQ Answer` são placeholder). O
      acordeão está pronto: é só preencher `resposta` em `src/data/faq.ts`.
      *Cliente.* **Bloqueante para a entrega.**
