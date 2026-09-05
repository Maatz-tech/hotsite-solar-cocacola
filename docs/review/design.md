# Revisão de design — pixel-perfect contra o Figma

Data: 2026-09-04 · Rota `/` · 13 seções · desktop 1440 · mobile 390 (Figma 375)
Fonte da verdade: `eYNkjSSqiq18W6XnQUxW6Z` · manifesto `docs/review/coleta.json`

Método: medição por perfil de pixel nos PNGs de `docs/reference/` (Figma, 1:1) e
`docs/local/` (projeto, 2× reduzido a 1×). Nós do Figma re-puxados quando a
referência precisava ser confirmada (`4010:290`, `4029:2268`, `4199:199`,
`4200:553`).

## Notas de contexto

- **A VAG Rounded Std já está instalada** (`src/assets/fonts/*.woff2`, declarada
  em `global.css:55-69`). A tipografia renderiza igual à do Figma — os desvios
  de fonte apontados abaixo são reais, não efeito de fonte substituta. O
  `PROJECT.md` ainda lista a fonte como pendente; está desatualizado.
- **Cores: 100% conferidas.** Amostragem direta nos fills sólidos bate exato em
  todas as seções — `#ff0000`, `#282828`, `#f1f1f1`, `#ffffff`. Zero desvio de cor.
- O mobile do Figma é 375px e a captura roda em 390px. Quebras de linha
  diferentes em Talentos, Programa e Diferenciais são artefato disso, não bug.

---

## Hero (#top) — desktop ⛔ / mobile ⛔

O carrossel de EVPs recém-adicionado é o problema central da revisão. Nos dois
breakpoints ele está aninhado dentro da coluna de conteúdo
(`HeroSection.astro:69` → `lg:w-[484px]`), quando no Figma é um elemento próprio,
centralizado no card do hero.

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Largura do card de EVPs (desktop) | 481px, x=113 | 908px, x=266 (centralizado) | HeroSection.astro:118 |
| 2 | Altura dos ícones/texto de EVP (desktop) | 18px | 48px (`4199:199`) | HeroSection.astro:124,127,130 |
| 3 | 3º item ("Performance") | cortado pela borda do card | inteiro, centralizado no 3º terço | HeroSection.astro:129 |
| 4 | Altura do card de EVPs (desktop) | ~98px (`py-6` + `h-12`) | 112px (`py-8` 32px + 48px) | HeroSection.astro:119 |
| 5 | Topo do card de EVPs (desktop) | y=544, cortado em 634 pelo `overflow-hidden` | y=579, desce até 691 — transborda 57px abaixo do card do hero e entra nos primeiros 33px de `#sobre` | HeroSection.astro:15,118 |
| 6 | Divisórias internas (desktop) | espaçamento irregular, itens colados | 1px em x=307 e x=611 (terços iguais de ~303px) | HeroSection.astro:122-131 |
| 7 | **Carrossel de EVPs no mobile** | presente, y 498→581 | **não existe** no nó do hero mobile `4029:2268`; o card tapa a testa e os olhos do rapaz da foto | HeroSection.astro:118 |
| 8 | Altura dos ícones de EVP (mobile) | 36px (`h-9`) | 48px (`4200:553`) | HeroSection.astro:124 |
| 9 | Coluna de conteúdo — "Trainee" (desktop) | topo do glifo y=167 | y=181 (gap badges→h1 44px, hoje 30px) | HeroSection.astro:71 (`gap-8`) |
| 10 | Coluna de conteúdo — logo/CTA (desktop) | 11px acima | logo y=302, CTA y=480 | HeroSection.astro:96 (`gap-8`) |
| 11 | Coluna de conteúdo (mobile) | 7–10px acima | idem | HeroSection.astro:69,71,96 |
| 12 | Pill "Inscrições até 28 de setembro" (desktop) | 261px de largura | 252px | HeroSection.astro:89 (`px-4`) |

**O que está certo:** "Trainee" 96px/72px (altura de glifo 73px/55px, idêntica),
largura de 484px, anel vermelho, foto, badge "Supply Chain", CTA unificado
(245→459, 215×37 nos dois), stripes. Horizontalmente a coluna bate exato
(Trainee 202→503, logo 165→403, CTA 245→459 — 0–1px de desvio).

`4200:553` existe no arquivo como slide isolado (375×104), mas não está
posicionado dentro do frame do hero mobile. **Pergunta para o designer:** o
carrossel deve entrar no mobile? Se sim, onde — o hero mobile não tem folga.

---

## Header (#site-header) — desktop ✅ / mobile ✅

Sem desvio. Altura 92/56 exata, conteúdo 23→71 vs 24→70.

---

## Sobre (#sobre) — desktop ⚠ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Padding superior (desktop) | primeiro conteúdo em y=99 | y=122 | SobreSection.astro |
| 2 | Gap bloco vermelho → CTA (desktop) | 4px | 20px | SobreSection.astro |
| 3 | Gap corpo → CTA (mobile) | 36px | 45px | SobreSection.astro |
| 4 | Copy do 1º parágrafo | "distribuição **para aproximadamente** 380 mil pontos de venda, impactando positivamente **mais de 80** milhões" | "distribuição **de sorrisos para** aproximadamente 380 mil pontos de venda, impactando positivamente **a vida de** mais de 80 milhões" | `src/data/` |

Altura total desktop 829 vs 872 (−43): −23 do topo, −16 do gap do CTA, resto da
copy encurtada. Colunas, fotos e títulos batem (título em 3 linhas, pitch 58px
nos dois; bloco vermelho 207/208px de altura).

---

## O programa (#programa) — desktop ⚠ / mobile ✅

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Altura da foto (desktop) | 546×445 (proporção 1,23) | 546×388 (proporção 1,41) | ProgramaSection.astro |

A moldura vermelha começa em y=100 nos dois e termina em 544 (projeto) contra
487 (Figma). Como a largura é idêntica, é `aspect-ratio`/`object-fit`, não
posicionamento — o enquadramento interno da foto sai deslocado (visível no painel
de diferença: o letreiro "SOLAR" aparece duplicado). Mobile: moldura 219px vs
215px, dentro da tolerância.

---

## Por que ser Solar (#diferenciais) — desktop ✅ / mobile ⚠

Desktop praticamente pixel-perfect: colunas dos cards em x=116/698 e 740/1322
idênticas, linha 1 em 285→470 nos dois, linha 2 com +2px, CTA +4px, seção +4px.
O ícone novo do "Impacto Nacional" (mapa bicolor) está correto.

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Gap carrossel → bullets (mobile) | 6px | 21px | DiferenciaisSection.astro |
| 2 | Ícone do "Impacto Nacional" (desktop) | 86×93 | 82×80 | DiferenciaisSection.astro |
| 3 | Conteúdo do card 12px mais baixo (desktop) | título em y=334 | y=322 | DiferenciaisSection.astro |
| 4 | Copy "Escala Global" | "um dos **15** maiores fabricantes" | "um dos maiores fabricantes" | `src/data/` |

Largura do card no mobile bate (326 vs 327px). A 4ª linha do corpo no mobile é
quebra de borda (o texto termina em x=316 no Figma, exatamente no limite do
container) — não é bug de padding.

**Conhecido, não é desvio:** o 4º card diverge por breakpoint no próprio Figma
("Proposta de valor ao Colaborador" no desktop, "Nossa Cultura" no mobile).

---

## Quem procuramos (#talentos) — desktop ✅ / mobile ⚠

Desktop exato (545 vs 546, conteúdo 63→449 nos dois).

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Gap foto → corpo (mobile) | 29px | 44px | TalentosSection.astro |

O título em 2 linhas (contra 3 no Figma) é o efeito 375→390px, não desvio.

---

## Pré-requisitos (#pre-requisitos) — desktop ✅ / mobile ✅

Sem desvio relevante. Desktop 973 vs 971; todas as faixas de conteúdo dentro de
2px. Mobile 1607 vs 1624 (−17), atribuível ao viewport mais largo.

---

## Benefícios (#beneficios) — desktop ✅ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Pitch das tags "E mais:" (mobile) | 56px | 50px | BenefitCard.astro / BeneficiosSection.astro |
| 2 | Altura da seção (desktop) | 669 | 658 | — |

Os 7 cards do mobile batem: pitch 96px e largura cheia menos 32/33px de margem
nos dois. O acúmulo de +41px vem só das 6 tags.

---

## Etapas (#etapas) — desktop ✅ / mobile ✅

Desktop 516 vs 513, mobile 1183 vs 1165. Timeline, pills e marcos alinhados.
"Clique para se inscrever" quebra em 2 linhas no desktop (1 no Figma) — cabe
folga de container, mas o impacto é ~14px. O "1 . Inscrições" com espaço antes
do ponto é typo do Figma; a implementação está certa.

---

## Nossos valores (#valores) — desktop ✅ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Título "Nossos valores" (mobile) | 24px (glifo 18px, largura 153px) | 32px (glifo 24px, largura 204px) | ValoresSection.astro |
| 2 | Pitch do acordeão (mobile) | ~95,5px | ~93px | ValoresSection.astro |
| 3 | Altura da seção (desktop) | 945 | 932 | — |

O título desktop bate exato (735→1039 nos dois). O 1º item aberto por padrão
está conforme o Figma.

---

## Depoimentos (#depoimentos) — desktop ⚠ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Primeiro slide | Beatriz Ribeiro Pianco da Silva | Luiz Felipe Ribas Motta | `src/data/` ou DepoimentosSection.astro |
| 2 | Bullets do carrossel (mobile) | 5 | 4 | DepoimentosSection.astro |

O layout está correto — desktop 681 vs 680, fundo `#f1f1f1` com card branco nos
dois, setas e pill de ícones no lugar. Os +131px do mobile são consequência
direta do item 1: o depoimento da Beatriz é bem mais longo que o do Luiz Felipe
e o card do mobile cresce com o texto.

**Conhecido:** o título diverge entre breakpoints no Figma; está o do desktop
nos dois, conforme registrado no `PROJECT.md`.

---

## FAQ (#faq) — desktop ⚠ / mobile ⚠

| # | Desvio | Atual | Figma | Onde |
|---|---|---|---|---|
| 1 | Título "Perguntas frequentes" (desktop) | 48px (bbox 114→557, 47px de altura) | 40px (bbox 114→483, 39px) | FaqSection.astro |
| 2 | Largura das barras (desktop) | 792px, x=116 | 800px, x=112 | FaqSection.astro |
| 3 | Início da lista (desktop) | y=222 | y=212 | FaqSection.astro |
| 4 | Pitch dos itens (mobile) | 112px | 108px | FaqSection.astro |

O pitch desktop bate (88px). No mobile o título tem o tamanho certo — o desvio
de 40 vs 48px é só do desktop. A 4ª pergunta ("Como" em vez de "Quando") é a
mudança do cliente já documentada.

---

## Footer — desktop ✅ / mobile ✅

322/323 e 421/423. A ausência de "Aviso de Cookies" é decisão documentada.

---

## Resumo por seção

| Seção | Desktop | Mobile | Pior desvio |
|---|---|---|---|
| Header | ✅ | ✅ | — |
| Hero | ⛔ | ⛔ | EVP 481px vs 908px; ícones 18px vs 48px; no mobile tapa os rostos |
| Sobre | ⚠ | ⚠ | padding topo −23px; gap CTA −16px |
| Programa | ⚠ | ✅ | foto +57px de altura |
| Diferenciais | ✅ | ⚠ | gap bullets 6 vs 21px |
| Talentos | ✅ | ⚠ | gap foto→texto 29 vs 44px |
| Pré-requisitos | ✅ | ✅ | — |
| Benefícios | ✅ | ⚠ | pitch das tags 56 vs 50px |
| Etapas | ✅ | ✅ | — |
| Valores | ✅ | ⚠ | título 24 vs 32px |
| Depoimentos | ⚠ | ⚠ | ordem dos depoimentos |
| FAQ | ⚠ | ⚠ | título 48 vs 40px |
| Footer | ✅ | ✅ | — |

**Veredito desktop:** reprovado pelo Hero. Fora dele, 9 de 12 seções passam no
critério de <3px; Sobre, Programa e FAQ precisam de ajuste.

**Veredito mobile:** reprovado pelo Hero (o carrossel oculta o rosto dos
modelos, além de não existir no Figma). Seis seções com desvios de espaçamento
de 4–15px.

## Divergências de conteúdo (decisão de cliente/designer, não de código)

1. Sobre — 1º parágrafo perdeu "de sorrisos" e "a vida de".
2. Diferenciais — "um dos 15 maiores fabricantes" (Figma: sem o "15").
3. Depoimentos — ordem dos cards e quantidade no mobile (5 vs 4).
4. Hero mobile — o carrossel de EVPs não está no design do hero mobile.
