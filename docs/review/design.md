# Revisão de design — `/` (página inteira)

Base: `docs/review/coleta.json` (26/08/2026). 12 seções × 2 viewports, 24
comparativos. Referências do Figma baixadas depois da edição do arquivo, logo
**atuais**. Medições feitas nos PNGs individuais, normalizados para o espaço CSS
(desktop 1440; mobile: Figma 375, projeto 390).

## Antes de ler a lista

**A fonte é substituta.** Tudo que é quebra de linha diferente e altura
acumulada por causa disso não está listado como desvio. Especificamente, estas
diferenças de altura foram verificadas e **não são erro de implementação**:

| Seção | Δ altura | Causa |
|---|---|---|
| Pré-requisitos desktop | +65px | os 3 chips de localização cabem em 1 linha na VAG e quebram em 2 na Nunito. Cards 1 e 2: 175 vs 173 e 151 vs 149 — batem |
| Sobre desktop | +16px | quebra de linha do corpo |
| Diferenciais desktop | +16px | quebra do subtítulo |
| Etapas mobile | +41px | quebra de linha |
| Footer desktop | +68px | **artefato de medição**: a referência do Figma (`4016:482`) cobre só o bloco vermelho; o rodapé legal é o nó `4016:507`. O bloco vermelho mede 253px nos dois |

Também não entram como desvio: o header fixo sobreposto no topo de algumas
capturas locais, e os textos com `data-reveal` que não tinham revelado no
instante do print (pré-requisitos mobile, depoimentos mobile, último card de
benefícios mobile). São artefatos de captura — a seção correspondente foi
avaliada pelo que dá para medir.

---

## Hero (`#top`) — desktop ⚠ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | **Espessura do anel vermelho (desktop)** | `border` 287,5px → furo 263px | ~119px → furo ~600px | `HeroSection.astro:41` |
| 2 | **Espessura do anel vermelho (mobile)** | `border` 157,5px → furo 143px | ~58px → furo ~342px | `HeroSection.astro:41` |
| 3 | Fundo do card (mobile) | `#ffffff` | `#f1f1f1` | `stripes-mobile.webp` exportado com fundo branco, cobre o `bg-surface-alt` |
| 4 | Folga vertical do card (desktop) | 2px topo / 3px base | 26px / 28px | `HeroSection.astro:12,14` — seção 570px vs 619px |
| 5 | Folga vertical do card (mobile) | 0 | ~5px topo / ~6px base | card `h-[819px]` ocupa a seção inteira; no Figma o card tem 803px |
| 6 | Rótulo do CTA | "Inscreva-se" | "Inscreva-se agora!" | `HeroSection.astro:114` |
| 7 | Posição do chip de data (mobile) | abaixo do CTA | acima do "Trainee", logo sob o badge | `HeroSection.astro:116-123` |
| 8 | Texto do chip (mobile) | "Até 28 de setembro" | "Inscrições até 28 de setembro" | idem |
| 9 | Estilo do chip (mobile) | `font-bold`, texto `#282828`, `shadow-solid` | peso regular, texto vermelho `#ff0000`, sem sombra | idem |
| 10 | Gap badge ↔ chip (desktop) | 33px (`gap-8`) | 23px | `HeroSection.astro:71` |

Sobre 1 e 2 — a raiz é a mesma nos dois breakpoints: o diâmetro externo está
certo (838 / 458, medido: bordas externas coincidem pixel a pixel), o **furo é
que está pequeno demais**. Ajustando círculos ao contorno medido na referência,
o furo do Figma é ~0,72 do diâmetro externo nos dois viewports; o código usa
0,31. Medição de controle da espessura da perna do anel a 563px do topo do card
(desktop): 195px no projeto, 119px no Figma. No mobile, a 740px: 70px vs 34px.

O que bate e não precisa de atenção: largura e posição do card (40..1399 nos
dois), posição do badge, tamanho do "Trainee" (`108px` está correto — a
diferença aparente é métrica da Nunito), foto e enquadramento.

## Header — desktop ⚠ / mobile ✅

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 11 | Bloco de navegação deslocado | começa em x=554, folga nav→CTA de 172px | começa em x=695, folga de 61px | `Header.astro:8,21` |
| 12 | Largura do botão CTA | 216px | 209px | `Header.astro` |

Logo (113..281) e altura (92 vs 93) coincidem. Mobile idêntico.

## Sobre a Solar — desktop ✅ / mobile ✅

Sem desvio mensurável. Alturas 829 vs 813 e 1389 vs 1391, dentro do esperado
para a substituição de fonte.

## O programa — desktop ✅ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 13 | Ordem no mobile | foto → eyebrow → título → texto | eyebrow → título → foto → texto | `ProgramaSection.astro:51` (`max-lg:order-first`) |

Desktop bate (586 vs 584).

## Porque ser Solar (diferenciais) — desktop ⚠ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 14 | Cor dos dots do carrossel (mobile) | todos `#d4d4d4`, sem estado ativo | ativo `#ff0000`, inativos `#f4c1c1` | `DiferenciaisSection.astro:56` (`bg-ink-20`) |
| 15 | Bloco de texto do card 15px mais baixo (desktop) | título a 51px do topo do card | 36px | conteúdo centralizado verticalmente; no Figma ancora no topo |

O resto do grid bate com precisão: colunas 109..703 e 733..1328, gap 30px,
altura do card 182px nas duas linhas, gap entre linhas 33 vs 31, ícone 79×76 na
mesma posição.

## Quem procuramos (talentos) — desktop ✅ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 16 | Ordem no mobile | foto → eyebrow → título → texto | eyebrow → título → foto → texto | `TalentosSection.astro:41` (`max-lg:order-first`) |
| 17 | Starburst vermelha no mobile | presente, sobre o canto da foto | não existe no mobile do Figma | `TalentosSection.astro` |

Desktop bate (548 vs 546).

## Pré-requisitos — desktop ✅ / mobile ✅

Sem desvio. Cards, gaps (17px) e coluna da imagem coincidem; a diferença de
altura é a quebra dos chips (ver tabela do topo). Mobile 1625 vs 1620.

## Benefícios — desktop ⚠ / mobile ⛔

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 18 | **Cards do mobile com largura de conteúdo e centralizados** | 236–280px, centralizados, alturas 77–89px | 7 cards de **323px**, largura do container, alinhados à esquerda, altura uniforme 77px | `RequisitosSection.astro:128` (`flex-wrap items-center justify-center`) |
| 19 | **Seção não sangra no mobile** | margem lateral de 12px, cantos arredondados | full-bleed, 0..375 | `RequisitosSection.astro:112` (`px-3 lg:px-0`) |
| 20 | Bloco "E mais" no mobile | "E mais:" na mesma linha do 1º chip, chips centralizados | "E mais:" em linha própria, chips à esquerda | `RequisitosSection.astro:149` |
| 21 | Altura do card no desktop | 89px (padding vertical 21px) | 80px (padding 17px) | `BenefitCard.astro` |

O layout desktop está certo (full-bleed nos dois, linha 1 iniciando em 246 vs
248, gap entre linhas 19 vs 18). O que aconteceu no mobile é o layout de chips
do desktop valendo para os dois breakpoints.

## Etapas do processo — desktop ✅ / mobile ✅

Colunas, réguas de mês, chips e alturas coincidem (514 vs 513). Único ponto:
o Figma escreve "1 . Inscrições online" com espaço antes do ponto; o código usa
"1." — considerei o Figma o desalinhado aqui, não mexer sem confirmar.

## Depoimentos — desktop ✅ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 22 | Controle do carrossel no mobile | setas (topo), nenhum dot | dots vermelhos no rodapé do card, sem setas | `DepoimentosSection.astro:67,78,114` |
| 23 | Primeiro depoimento no mobile | Carlos Antonio Formenton Barp | Augusto da Rocha Simas Junior | `src/data/depoimentos.ts` |

Desktop é o mais fiel da página: 681px nos dois, card e foto na mesma posição,
setas com o mesmo tratamento (a anterior a 50% de opacidade). Confirmo a
pendência já registrada do título divergente entre breakpoints.

## FAQ — desktop ⚠ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 24 | Decoração da garrafa deslocada (desktop) | centro em x≈1152 | x≈1343 (sangra pela direita) | `FaqSection.astro` |
| 25 | Altura do item do acordeão (mobile) | 103px | 91px | `FaqSection.astro` |
| 26 | Altura do item do acordeão (desktop) | 75px | 72px | idem |
| 27 | Folga título → 1º item (desktop) | 77px | 69px | idem |

A garrafa em si tem o mesmo tamanho (≈110×330); é o grupo inteiro que está
~190px à esquerda. Largura e gaps dos itens batem (112..911 no desktop, gap 17px
nos dois viewports). O primeiro item aberto na referência e a ausência de
respostas são a pendência já registrada, não desvio de implementação.

## Footer — desktop ✅ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 28 | Altura do bloco vermelho no mobile | 372px (padding ~+24 topo, ~+23 base) | 318px | `Footer.astro` |
| 29 | Logo Eureca no mobile | 162×29 | 128×23 | `Footer.astro` — está usando a medida do desktop |

Desktop bate: bloco vermelho 253px, logo Eureca 162×29 vs 161×28, ícones
sociais 38px na mesma posição.

---

## Resumo

| Seção | Desktop | Mobile |
|---|---|---|
| Header | ⚠ nav 140px fora do lugar | ✅ |
| Hero | ⛔ anel, folga vertical, CTA | ⛔ anel, fundo branco, ordem do chip |
| Sobre | ✅ | ✅ |
| O programa | ✅ | ⚠ ordem |
| Diferenciais | ⚠ texto do card 15px baixo | ⚠ cor dos dots |
| Talentos | ✅ | ⚠ ordem + starburst |
| Pré-requisitos | ✅ | ✅ |
| Benefícios | ⚠ card +9px | ⛔ largura dos cards, sangria |
| Etapas | ✅ | ✅ |
| Depoimentos | ✅ | ⚠ setas vs dots |
| FAQ | ⚠ garrafa 190px | ⚠ item +12px |
| Footer | ✅ | ⚠ +54px, logo +27% |

**Veredito — desktop:** reprovado por 1 bloqueador (anel do hero). Fora ele, o
desktop está muito próximo do Figma: 6 das 12 seções fecham dentro de 3px, e as
falhas restantes são de posicionamento pontual, não de estrutura.

**Veredito — mobile:** reprovado por 2 bloqueadores (anel do hero e o layout dos
cards de benefícios). O mobile concentra quase tudo: 9 das 12 seções têm algum
desvio, e o padrão é claro — decisões do desktop (ordem de blocos, layout de
chips, tamanho de logo, sangria) vazando para o breakpoint pequeno.

### Classificação

**Bloqueador (2):** #1/#2 anel do hero · #18/#19 cards de benefícios no mobile.

**Importante (13):** #3 fundo branco do hero mobile · #4 folga do hero desktop ·
#6 rótulo do CTA · #7/#8/#9 chip de data no mobile · #11 nav do header · #13
ordem do programa mobile · #14 cor dos dots · #16/#17 ordem e starburst de
talentos · #20 bloco "E mais" · #22 controles do carrossel mobile · #24 garrafa
do FAQ · #25 item do FAQ mobile · #28/#29 rodapé mobile.

**Polimento (7):** #5 folga do hero mobile · #10 gap badge/chip · #12 largura do
CTA do header · #15 texto do card de diferenciais · #21 altura do card de
benefícios · #23 ordem dos depoimentos · #26/#27 acordeão desktop.
