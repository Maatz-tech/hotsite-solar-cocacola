# Revisão de performance — hotsite-solar-cocacola

Rota `/` (single page).

## Procedência dos dados

Os JSONs do Lighthouse em `docs/review/` são de **25/08 19:47–19:48**, logo após
o commit atual `13a2af7` (19:46) — refletem o código de hoje.

A etapa `perf` da coleta de 25/08 23:35 **falhou**: `scripts/lighthouse.mjs` sobe
o preview na porta fixa 4322, ocupada por outro projeto (`kaspersky-site`) de
outra sessão. Erro: `preview não subiu em 20s`. Por instrução, o Lighthouse
**não** foi reexecutado e a porta 4322 não foi tocada.

O que **foi** medido nesta revisão, em servidor próprio na porta 4399 sobre o
build de produção (`npx astro build` + `astro preview`), Chromium headless via
Playwright: `currentSrc` e largura renderizada de cada `<img srcset>` em
7 combinações de viewport × DPR. Preview encerrado e `dist/` restaurado ao fim.

---

## Scores

| Categoria | Mobile | Desktop | Target | |
|---|---|---|---|---|
| Performance | **95** | 100 | ≥ 95 | ✓ (no limite) |
| Accessibility | 96 | 96 | ≥ 95 | ✓ |
| Best Practices | 100 | 100 | 100 | ✓ |
| SEO | 100 | 100 | 100 | ✓ |

**Ressalva sobre o mobile.** O usuário rodou 4 vezes e observou 90, 93, 90, 95.
O arquivo disponível é a execução que deu 95. A faixa real é **90–95**, ou seja
o projeto está **abaixo do target na maioria das execuções** e o 95 é o teto,
não a mediana. Tratar performance mobile como **não atingida**.

## Métricas

| | Mobile | Desktop |
|---|---|---|
| LCP | 2.9 s | 0.7 s |
| FCP | 1.2 s | 0.3 s |
| CLS | 0.001 | 0.01 |
| TBT | 0 ms | 0 ms |
| Speed Index | 1.2 s | 0.3 s |

**Elemento do LCP**
- Mobile: `<img src="/images/hero/stripes-mobile.webp">` — a textura do hero rasterizada.
- Desktop: `/images/hero/stripes.svg` — a mesma textura em vetor.

**Decomposição do LCP mobile (2.860 ms)** — é aqui que está o diagnóstico:

| Fase | Tempo | % |
|---|---|---|
| TTFB | 455 ms | 16% |
| **Load Delay** | **1.169 ms** | **41%** |
| Load Time | 256 ms | 9% |
| Render Delay | 980 ms | 34% |

O arquivo do LCP tem 18 KB e leva 256 ms para transferir. **O problema não é o
elemento do LCP — é a fila na frente dele.** O `preload` funciona: a requisição
começa em 71 ms, logo depois do documento. Mas sob o throttling simulado do
Lighthouse (1.638 kbps, 150 ms RTT) ela divide banda com `pessoas.webp` (126 KB,
`fetchpriority="high"`, mesma prioridade), com o CSS e com a fonte. Os 1.169 ms
de Load Delay são contenção de banda, não latência de descoberta.

Peso total da página no mobile: **727 KB**, dos quais ~590 KB são imagens.

---

## Achado principal: o `srcset` não dispara — confirmado, com uma correção ao diagnóstico

**Confirmado.** Em DPR 2 e DPR 3 nenhuma variante `-sm` é servida. Medição
(`currentSrc` real, build de produção):

| Cenário | variantes `-sm` servidas |
|---|---|
| iPhone SE / 13 — 390 @ 2x | 0 de 12 |
| iPhone 15 Pro — 390 @ 3x | 0 de 12 |
| iPhone Pro Max — 430 @ 3x | 0 de 12 |
| Desktop 1440 @ 1x | 8 de 12 (só aqui funcionam) |

Os 12 arquivos `-sm` só são servidos em DPR 1 — que praticamente não existe em
celular. A economia pretendida de ~450 KB nunca chega ao usuário móvel.

### As duas causas apontadas: uma é suficiente, a outra não é a que você pensa

**Causa 1 — `sizes` superestimado: confirmada, e é a causa dominante.**

Larguras reais dos slots, medidas por regressão em 8 viewports (320–1023 px):

| Imagem | `sizes` declarado (mobile) | slot real | erro |
|---|---|---|---|
| `programa/time` | `100vw` | `calc(100vw - 72px)` | +23% |
| `requisitos/mesa` | `100vw` | `calc(100vw - 72px)` | +23% |
| `sobre/card-icones` | `100vw` | `calc(100vw - 48px)` | +14% |
| `talentos/selfie` | `100vw` | `calc(100vw - 48px)` * | +9% |
| `depoimentos/*` | `100vw` | `calc(100vw - 120px)` | **+44%** |
| `sobre/foto-1,2` | `45vw` | `calc(50vw - 36px)` | +10% |
| `hero/pessoas` | `526px` | 526 px | correto |

\* abaixo de 430 px o slot de `selfie` fica travado em 358 px, acima segue `100vw - 48px`.

**Causa 2 — variantes `-sm` pequenas demais: verdadeira para celulares reais,
mas irrelevante para o número do Lighthouse.**

Detalhe que muda tudo: **o Lighthouse mobile emula DPR 1,75**, não 2 nem 3
(`configSettings.screenEmulation: {width: 412, deviceScaleFactor: 1.75}`).
Nesse DPR as variantes atuais **já seriam suficientes** — só o `sizes` errado as
impede de serem escolhidas.

Prova empírica: corrigi apenas os `sizes` no HTML já compilado (sem tocar em
nenhum arquivo de imagem) e remedi:

| Cenário | antes | depois de corrigir só o `sizes` |
|---|---|---|
| **Lighthouse mobile — 412 @ 1.75x** | 0 de 12 | **11 de 12** |
| iPhone SE / 13 — 390 @ 2x | 0 de 12 | 8 de 12 |
| 390 @ 3x / 430 @ 3x | 0 de 12 | 0 de 12 (esperado — DPR 3 deve usar o arquivo grande) |

Conclusão: **corrigir o `sizes` sozinho já entrega quase toda a economia na
métrica**, sem reexportar nada. Redimensionar as variantes é o passo seguinte,
para os celulares DPR 2 reais que o Lighthouse não representa.

### Achado adicional que ninguém levantou: o topo da escada é o que o Lighthouse baixa

Em DPR 3 — a maioria dos celulares premium — o browser sempre escolhe o arquivo
maior. E esses arquivos estão dimensionados para ~3× o slot de desktop e
comprimidos em qualidade alta:

| Arquivo | largura atual | máximo necessário (desktop @2x) | peso atual | @ q75 |
|---|---|---|---|---|
| `programa/time.webp` | 1638w | 1092 px | 241 KB | 142 KB |
| `requisitos/mesa.webp` | 1542w | 1028 px | 114 KB | 79 KB |
| `talentos/selfie.webp` | 1479w | 976 px | 109 KB | 77 KB |
| `sobre/card-icones.webp` | 1464w | 976 px | 82 KB | 53 KB |
| `hero/pessoas.webp` | 1449w | 1928 px | 126 KB | 78 KB |

O esforço do `-sm` otimizou o caso que o Lighthouse nunca mede, enquanto o
arquivo do topo — o único que a auditoria sempre baixa — ficou em 1464–1638w e
qualidade ~80. Recomprimir para q75 sozinho, sem mudar uma linha de markup,
tira ~200 KB dessas cinco imagens.

---

## Valores corretos por imagem

`sizes` corrigido e escada de larguras. A escada mira **2× no slot do maior
celular comum (430 px)** para a variante pequena, e **desktop @2×** para o topo —
DPR 3 cai no topo, que é o comportamento certo.

| Imagem | `sizes` correto | `-sm` atual → correto | topo atual → correto |
|---|---|---|---|
| `hero/pessoas` | `(min-width:1024px) 964px, 526px` (já certo) | 760w → **manter + degrau 1060w** | 1449w ✓ |
| `sobre/foto-1`, `foto-2` | `(min-width:1024px) 232px, calc(50vw - 36px)` | 320w → **380w** | 696w ✓ |
| `sobre/card-icones` | `(min-width:1024px) 488px, calc(100vw - 48px)` | 660w → **790w** | 1464w → **1160w** |
| `programa/time` | `(min-width:1024px) 546px, calc(100vw - 72px)` | 620w → **740w** | 1638w → **1120w** |
| `talentos/selfie` | `(min-width:1024px) 488px, calc(100vw - 48px)` | 660w → **790w** | 1479w → **1160w** |
| `requisitos/mesa` | `(min-width:1024px) 514px, calc(100vw - 72px)` | 660w → **740w** | 1542w → **1120w** |
| `depoimentos/*` | `(min-width:1024px) 300px, calc(100vw - 120px)` | 620w → **640w** (margem) | 918w ✓ |

Reexportar tudo em **WebP q75** (q70 se quiser mais agressivo — a diferença
visual em foto é imperceptível, o ganho é mais 10–15%).

---

## Plano de correção, por impacto

### Bloqueador

**1. Corrigir os `sizes` das 7 imagens com `srcset`**
Causa: `100vw` / `45vw` ignoram o padding das seções; o slot real é 9–44% menor,
o que empurra a escolha para o arquivo grande.
Arquivos: `src/components/sections/{Programa,Sobre,Talentos,Requisitos,Depoimentos}Section.astro`
Ganho: **11 de 12 imagens passam a servir a variante pequena na emulação do
Lighthouse**; ~340 KB a menos no peso da página, dos quais ~200 KB saem do
caminho crítico do LCP (`time` 241→35 KB, `card-icones` 82→27 KB, `foto-1`
77→21 KB, `foto-2` 42→16 KB). Ataca diretamente os 1.169 ms de Load Delay.
Custo: **baixo** — 7 atributos, nenhum arquivo novo. Já validado por medição.

**2. Tirar `pessoas.webp` da disputa com o elemento do LCP**
Causa: duas imagens do hero com `fetchpriority="high"`; só uma é o LCP. A de
126 KB (`pessoas`) come a banda da de 18 KB (`stripes-mobile`) que é o LCP.
Em DPR 1,75 o slot pede 921 px e a escada pula de 760w direto para 1449w.
Arquivo: `src/components/sections/HeroSection.astro` (+ novo `pessoas-1060.webp`)
Ganho: degrau de **1060w** em q75 ≈ 42 KB no lugar de 126 KB → **−84 KB no
caminho crítico**. Estimo 300–500 ms de LCP mobile.
Custo: **baixo** — um export, um descritor.

### Importante

**3. Recomprimir as 5 imagens grandes para q75 e limitar a largura do topo**
Causa: os arquivos de topo estão em ~3× o slot de desktop e qualidade ~80. São
os únicos que DPR 3 baixa.
Arquivos: `public/images/{programa/time,requisitos/mesa,talentos/selfie,sobre/card-icones,hero/pessoas}.webp`
Ganho: **~200 KB** só na recompressão; com o corte de largura (1638→1120w etc.),
`time.webp` cai de 241 KB para ~66 KB. Beneficia o usuário DPR 3 real, que hoje
não ganha nada do trabalho de `srcset`.
Custo: **médio** — reexportar 5 imagens, revalidar nitidez no comparativo visual.

**4. Reexportar as variantes `-sm` nas larguras da tabela acima**
Causa: as variantes atuais não satisfazem 2× do slot em DPR 2 (faltam 16–64 px
em `card-icones`, `time`, `selfie`, `foto-1/2`).
Ganho: leva os celulares DPR 2 reais de 8/12 para 12/12 servindo a variante
pequena. **Não muda o score do Lighthouse** (DPR 1,75 já está resolvido no
item 1) — é ganho de campo, não de auditoria.
Custo: **médio** — 8 exports.

**5. Contraste da cor de destaque (Accessibility 96 nos dois presets)**
`color-contrast` falha em `.btn.btn-primary` e em dois `<strong>`. É o suspeito
de sempre do playbook. Cruzar com o `website-reviewer` antes de mexer no token —
mudança de cor de marca precisa de aval.
Ganho: 96 → 100 em Accessibility. Custo: baixo, mas exige decisão de marca.

### Polimento

**6. `sizes` de `talentos/selfie` abaixo de 430 px**
`calc(100vw - 48px)` subdeclara ~4,5% (342 vs 358 px reais) porque o slot é
travado em 358 px nos viewports pequenos. Risco de nitidez desprezível. Se
quiser exato: `(min-width:1024px) 488px, (min-width:412px) calc(100vw - 48px), 360px`.

**7. CSS render-blocking (29,7 KB)**
`render-blocking-resources` marca 0,5 mas com **economia estimada de 0 ms** — o
Lighthouse não vê ganho. Não mexer: inline de CSS crítico aqui é custo sem
retorno mensurável.

**8. Textura do LCP em 702w para um slot de 366 px**
1,92× em DPR 2, abaixo do ideal em DPR 3. São 18 KB e é o elemento do LCP —
aumentar troca LCP por nitidez de uma textura abstrata. Recomendo **não mexer**;
está registrado só para não ser "descoberto" de novo.

---

## O que já está bom — não regredir

- **TBT 0 ms nos dois presets.** O import tardio do `motion` funciona: os 67 KB
  (24 KB gzip) da lib entram como chunk assíncrono depois de `load` +
  `requestIdleCallback`. Nenhuma ilha React hidratada. Os 9 scripts de seção
  somam ~2 KB. [QA-011] está respeitado — não regredir voltando a importar
  `motion` no topo.
- **CLS 0,001 mobile / 0,01 desktop.** Todas as imagens têm `width`/`height`;
  a fonte entra com `display=swap` e `preconnect`.
- **O elemento do LCP não tem reveal.** `HeroSection.astro` documenta e cumpre
  [QA-006]: acima da dobra só o que não é LCP anima.
- **Decisão de rasterizar a textura no mobile está certa.** Os 67 paths do SVG
  custavam ~2 s em CPU lenta; o WebP de 18 KB carrega em 256 ms.
- **`preload` do LCP separado por breakpoint com `media`** — funciona, requisição
  começa em 71 ms. Não é aí que está o Load Delay.
- **SEO 100 e Best Practices 100 nos dois presets.** Canonical, `lang="pt-BR"`,
  title, description, JSON-LD, favicons e OG estão completos.
- **Desktop em 100 de performance.** Qualquer mudança nas imagens precisa ser
  remedida também em desktop — a escada de larguras é compartilhada.

---

## Nota de processo

`scripts/lighthouse.mjs` usa porta fixa 4322 e falha inteiro quando ela está
ocupada. Em workspace com vários projetos isso vai se repetir. Candidato a
entrada `QA-XXX` no template: **porta fixa em script de medição** — sortear porta
livre ou aceitar `--porta`.

Segundo candidato a `QA-XXX`, mais valioso: **`sizes` com `100vw` em seção com
padding invalida o `srcset` inteiro** — o browser escolhe sempre o arquivo maior
e as variantes pequenas viram peso morto no repositório. Verificar `currentSrc`
em DPR 1,75/2/3 é o único jeito de saber; o Lighthouse não avisa que o `srcset`
não disparou, ele só reclama de "properly size images".
