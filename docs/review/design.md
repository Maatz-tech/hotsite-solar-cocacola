# Revisão de design — 04/09/2026

Rota `/`, página inteira, desktop (1440) e mobile (390 local × 375 Figma).
Base: `docs/review/coleta.json` (24 comparativos), referências nativas em
`docs/reference/`, `docs/review/deltas-figma-04-09.md`.

Nenhum arquivo de código foi alterado.

---

## 0. Confirmação do levantamento de 04/09

| Item | Confere? | Evidência |
|---|---|---|
| A1 "Nossos valores" ausente | ✅ | não há `#valores` na página; `docs/reference/valores-*.png` sem par local |
| A2 carrossel EVP ausente | ✅ | `docs/reference/carrossel-*.png` sem par local |
| A3 hero desktop −40 | ✅ | anel vermelho e foto deslocam **exatos −40px** (Figma y 204→656, site 164→593); nada além do bloco de conteúdo diverge |
| A4 "Porque" → "Por que" | ✅ | vale nos **dois** breakpoints |
| A5 Sobre −62 / −46 | ✅ | banner vermelho 207px idêntico nos dois; só o texto e o "S" maiúsculo diferem |
| A6 Programa −56 / −94 | ✅ | 3º parágrafo antigo no site |
| A7 Talentos mobile −68 | ✅ | texto antigo, 4 linhas vs 3 |

**Três coisas o levantamento não pegou** — estão em §1 e §2 (achados 1, 2 e 3).
**Duas atribuições do levantamento estão erradas** — ver §4.

---

## 1. Bloqueador

### B1 · Diferenciais — o 4º card foi trocado no Figma
**desktop + mobile** · `src/components/sections/DiferenciaisSection.astro:47-50`

| | Site | Figma |
|---|---|---|
| Título | Nossa Cultura | **Proposta de valor ao Colaborador** |
| Texto | "Um ambiente de trabalho seguro e colaborativo, onde a individualidade e a autenticidade das nossas pessoas Solares são o combustível para ir além." | "**Propósito, Desenvolvimento e Performance**: as três pilares que traduzem nossa marca empregadora e impulsionam a experiência das nossas pessoas Solares." |
| Ícone | pessoa (`cultura.svg`) na caixa vermelha 80px | garrafa + copo (o mesmo trio do banner do Sobre) na caixa vermelha 80px |

É a mesma família do carrossel EVP (A2) — Propósito / Desenvolvimento /
Performance. Provavelmente entra junto. Não está no levantamento.

### B2 · Ícone "Impacto Nacional" perdeu o recorte regional
**desktop + mobile** · `public/images/beneficios/impacto-nacional.svg`

O Figma usa um mapa do Brasil **bicolor**: Norte, Nordeste e parte do
Centro-Oeste em `#FF0000`, o resto em `#D4D4D4`, com divisas de estado. É a
ilustração literal dos "70% do território" que o próprio card diz.
O site usa um Brasil **sólido vermelho, sem divisas** — a informação some.

Medida do vermelho no mobile: Figma 45 × 27px (só a área vermelha, dentro da
caixa de 48); site 48 × 47px (mapa inteiro vermelho).

---

## 2. Importante

### I1 · Diferenciais — dois textos de card mudaram e ninguém levantou
**desktop + mobile** · `DiferenciaisSection.astro:29-37`

| Card | Site | Figma |
|---|---|---|
| Impacto Nacional | "**Entregamos** sorrisos no Norte…" | "**Distribuímos** sorrisos no Norte…" |
| Escala Global | "Somos um dos **15** maiores fabricantes… e a 2ª maior **fabricante** do Brasil, impactando **milhões** de brasileiros." | "Somos um dos maiores fabricantes… e a 2ª maior **engarrafadora** do Brasil, impactando **mais de 80 milhões** de brasileiros." |

Efeito colateral no mobile: "Distribuímos" cabe em 3 linhas, "Entregamos" quebra
em 4 (+24px no card).

### I2 · `gap-16` (64px) no empilhamento mobile — Figma usa 40–48px
**mobile** · atinge 4 seções

O gap entre o bloco de cabeçalho e o conteúdo, e entre blocos de conteúdo, é
`gap-16` sem override mobile. No Figma o mobile é mais apertado.

| Seção | Onde | Site | Figma | Arquivo |
|---|---|---|---|---|
| Benefícios | título → lista de cards | 64 | ~45 | `RequisitosSection.astro:122` |
| Benefícios | lista → "E mais:" | 64 | ~45 | idem |
| FAQ | título → 1º item | 74 | 50 | `FaqSection.astro:13` (gap interno) |
| Etapas | título → timeline | +26 acumulado | — | `EtapasSection.astro:31` |
| Diferenciais | indicadores → CTA | 103 | 77 | `DiferenciaisSection.astro:12` |

Sozinho responde por ~+90px de altura no mobile.

### I3 · Footer mobile — padding vertical e logo Eureca
**mobile** · `src/components/Footer.astro:21,24-31`

| # | Desvio | Site | Figma |
|---|---|---|---|
| a | padding-y do bloco vermelho (`py-16`) | 64 | **40** |
| b | altura do logo Eureca (`h-[30px]`) | 30 | **23** |

Os dois somam **+55px** — é o `+56` inteiro da seção. Tudo o mais bate:
gap eureca→SOLAR 40/41, logo SOLAR 26/27, assinatura 2 linhas, ícones sociais
39/40, e a **faixa legal fecha 1:1** (link a 26/28px do topo, Maatz a 61/61,
altura 104/105).

### I4 · Chips "E mais" com 20px onde o Figma usa 18px
**mobile + desktop** · `RequisitosSection.astro:167`

`text-xl` (20px/28) + `py-1.5` → pílula de **40px**. Figma: **34px**.
Larguras medidas dão razão de fonte 1,09–1,10 sobre 6 chips diferentes,
consistente com 18px. Gap entre chips (16px) e cor (`#D40808`) batem.
6 chips × 6px = **+36px** no mobile.

### I5 · Botão CTA mobile 4–6px mais alto
**mobile** · `src/styles/global.css:254-258` (`.btn-md`, height 44)

Medido em Diferenciais mobile: caixa+sombra 47px no site, **41px** no Figma
(botão ~38–40). Largura bate (210 vs 208) e o rótulo "Inscreva-se agora!" já
está atualizado.

### I6 · FAQ — item fechado 5px mais alto
**mobile** · `src/components/sections/FaqSection.astro`

Item: **96px** no site, **91px** no Figma. Pergunta em 2 linhas nos dois; gap
entre itens 16/17 ✓. 5 itens → +20px.

---

## 3. Polimento

| # | Desvio | Site | Figma | Onde |
|---|---|---|---|---|
| P1 | Etapas desktop: "Clique para se inscrever" quebra em 2 linhas | 2 linhas | 1 linha | `EtapasSection.astro` — coluna do mês estreita demais |
| P2 | Diferenciais mobile: gap título → lead | 27 | 33 | `SectionHeader.astro` |
| P3 | Benefícios mobile: gap eyebrow → título | 16 (`gap-4`) | ~12 | `RequisitosSection.astro:125` |
| P4 | Hero mobile: assinatura com ponto final | "transforma." / "impulsiona." | sem ponto | `HeroSection.astro` — cai junto com A3 |
| P5 | Diferenciais mobile: card fixo em 327px num viewport de 390 | 345 medido | 345 em 375 | `DiferenciaisSection.astro:31` — o "peek" fica maior que o desenhado |

---

## 4. Divergências intencionais — duas atribuições estão erradas

| Alegação (deltas §B) | Veredito |
|---|---|
| "FAQ +68 mobile porque temos as respostas reais" | ❌ **Errado.** Os 5 itens estão **fechados** nos dois lados. O +45 é spacing puro: +24 no gap do título (I2) e +5 por item (I6). As respostas não ocupam altura nenhuma no estado de repouso. |
| "Etapas +41 mobile por causa da correção dos chips" | ❌ **Errado.** Nesta seção os 7 chips estão em **1 linha** no site, iguais ao Figma. O +42 é o gap título → timeline (+26) mais deriva de ±5 por mês. A correção de chip que quebra em duas linhas é a de **Pré-requisitos** (`vagas`), e essa seção fecha em +7. |
| "Depoimentos +117 mobile: citação real mais longa" | ✅ Correto. O site mostra a Beatriz (5 linhas + destaque), o Figma mostra o Luiz Felipe (4 linhas). Título unificado ✓. |
| Rodapé sem "Aviso de Cookies" | ✅ Correto, e não afeta altura — a faixa legal bate 1:1. |
| Vermelho `#FF0000` mantido | ✅ Confirmado no pixel: `#FF0000`, `#F1F1F1`, `#282828`, `#FFFFFF` e `#D40808` idênticos ao Figma em todas as seções amostradas. **Zero desvio de cor na página.** |
| FAQ desktop: 1º item aberto no Figma | Não implementar. Estado de acordeão aberto no load contraria a decisão de UX registrada; e o Figma não tem resposta escrita. |

### Fotos dos depoimentos (item 6 do pedido)
**Confirmado nos dois breakpoints.** Recortei o quadro do canto superior
esquerdo em `depoimentos-desktop` e `depoimentos-mobile`: moldura **única**,
1px `#282828`, radius e sombra sólida corretos. **A borda dupla no arco sumiu.**

---

## 5. Seções que fecharam sem desvio

| Seção | Desktop | Mobile |
|---|---|---|
| Header | ✅ 0px | ✅ 0px |
| Hero (top) | ✅ só A3 (−40) | ✅ 0px, só A3 |
| Sobre | ✅ só A5 (−62) | ✅ só A5 (−46) |
| Programa | ✅ só A6 (−56) | ✅ só A6 (−94) |
| Diferenciais | ⚠ layout ✅ (+4), conteúdo ❌ (B1, B2, I1) | ⚠ +58 |
| Talentos | ✅ +1, só A7 | ✅ −68, só A7 |
| Pré-requisitos | ✅ +2 | ✅ +7 |
| Benefícios | ✅ +11 | ⚠ +89 |
| Etapas | ✅ +3 (só P1) | ⚠ +42 |
| Depoimentos | ✅ +1 | ✅ +131, conteúdo |
| FAQ | ✅ +10 | ⚠ +45 |
| Footer | ✅ +1 | ⚠ +56 |

**Veredito · desktop:** aprovado no layout. Todos os deltas ≤ 11px, cores
exatas. Pendem só os conteúdos (B1, B2, I1) e os itens A do levantamento.

**Veredito · mobile:** reprovado. 4 seções acima da tolerância, e a causa é
quase toda uma só (I2 + I4 + I3). Resolvendo I2, I3, I4, I5 e I6 o mobile cai
para dentro de ±10px em tudo.

---

## 6. Problemas da coleta (não são desvios do site)

Estes atrapalharam a auditoria e devem ser corrigidos no `capture-runner`:

1. **Header sticky sobreposto** no meio das capturas mobile de `beneficios`,
   `depoimentos`, `etapas`, `pre-requisitos`, `sobre`, `talentos`. Some com a
   faixa de conteúdo debaixo dela.
2. **Reveal-on-scroll não disparado**: em `beneficios-mobile`,
   `pre-requisitos-mobile` e `etapas-mobile` o eyebrow e o `<h2>` saíram
   **invisíveis** (ocupam espaço, não pintam); em `sobre-mobile` o CTA final
   sumiu. Não é bug do site (a página é visível sem JS e com
   `prefers-reduced-motion`), mas impediu auditar a tipografia desses títulos.
   Capturar com `prefers-reduced-motion: reduce` resolve os dois problemas.
3. **375 × 390**: referência em 375, site em 390. Comparação de quebra de linha
   é aproximada; medidas verticais de padding/gap seguem válidas.
