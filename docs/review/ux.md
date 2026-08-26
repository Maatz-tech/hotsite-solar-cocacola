# Revisão de usabilidade — `/` (single page)

Rota: `http://localhost:4321/` · viewports 1440 e 390 · coleta de
`docs/review/coleta.json` (2026-08-26) + exploração manual com Playwright.

## Resumo

A página está sólida: **nenhum bloqueador**. Tudo é alcançável por teclado (25
paradas no desktop, na ordem visual, com foco visível em todas), o menu mobile
abre, fecha com Esc, fecha ao clicar num link e se desfaz sozinho ao voltar
para o desktop; os dois carrosséis funcionam por toque, teclado e clique, e as
setas de depoimentos desabilitam exatamente nas pontas. Nada fica preso em
`opacity: 0` — varri a página inteira, entrei por deep-link e pulei direto para
o fim nos dois breakpoints. O que atrapalha são 4 itens de acabamento com peso
real: **hover que gruda depois do toque no celular**, **acordeão que salta sem
animação**, **o carrossel de diferenciais sem foco nem rótulo** e **alvos de
toque abaixo de 44 px no rodapé**. O contraste do vermelho continua sendo a
única violação do axe — proponho abaixo uma terceira saída melhor que as duas
já registradas.

Contagem: **0 bloqueadores · 4 importantes · 6 polimentos · 3 observações para
o designer**.

---

## Importante

### Todas as seções — hover grudado depois do toque (tipo C)

**Onde:** `src/styles/global.css:344-403` (todo o bloco de hover fora de
`@layer`).
**O que acontece:** medido em iPhone 13 emulado, com toque real: toquei em
"Inscreva-se" do hero e o botão ficou em `background: #cc0000` +
`transform: translate(-3px, 3px)` + sombra recolhida **depois** que soltei, e
assim permaneceu. Vale para `.btn`, `.seta-carrossel`, `.nav-link`,
`.social-link`, `.logo-link` e `.faq-item summary`.
**Por que importa:** em touch o `:hover` só sai no próximo toque em outro
lugar. O CTA principal fica com cara de "pressionado e travado" — e como o
`href` ainda é `#`, o usuário não navega e fica olhando para um botão que
parece quebrado.
**Correção proposta:** envolver o bloco de hover em
`@media (hover: hover) and (pointer: fine) { … }`, deixando `:active` e
`:focus-visible` de fora. O Figma não documenta hover, então isso é estado não
documentado — não mexe em nada que ele defina. Virou
[QA-018](../../playbook/09-qa-erros-comuns.md#qa-018).

### FAQ — acordeão abre e fecha sem transição (tipo C)

**Onde:** `src/components/sections/FaqSection.astro:29-54`.
**O que acontece:** amostrei a altura do `<details>` a cada 60 ms depois do
clique: `[116, 116, 116, 116, 116, 116]`. Salta de 0 para a altura final em um
frame, na abertura e no fechamento. A seta gira (200 ms) — só ela.
**Por que importa:** é exatamente o que
[`playbook/06-micro-interacoes.md`](../../playbook/06-micro-interacoes.md#faq--acordeão)
proíbe ("acordeão que salta de 0 para a altura final parece quebrado"), e com
`name="faq"` o item anterior fecha no mesmo frame — dois saltos ao mesmo tempo.
**Correção proposta:** o padrão da casa — envolver a resposta num `.faq-answer`
com `grid-template-rows: 0fr → 1fr` e 350 ms `cubic-bezier(0.22,1,0.36,1)`, e
segurar o `open` no `toggle` para o fechamento animar
([QA-004](../../playbook/09-qa-erros-comuns.md#qa-004)). Nada disso altera o
layout documentado no Figma.

### Diferenciais (mobile) — o trilho não recebe foco nem tem nome (tipo C)

**Onde:** `src/components/sections/DiferenciaisSection.astro:24-28`.
**O que acontece:** `#trilho-diferenciais` é uma região rolável sem
`tabindex`, sem `role` e sem `aria-label`. O axe acusa
`scrollable-region-focusable` (serious) só no mobile. No Chrome atual ele até
entra na ordem de tabulação (focusable scrollers), e aí o foco cai num bloco
anônimo que o leitor de tela anuncia como "Impacto Nacional Entregamos sorrisos
no…"; em Safari e Firefox não entra, e os 3 cards seguintes ficam inacessíveis
por teclado.
**Por que importa:** é o mesmo componente do trilho de depoimentos, que **está**
correto (`tabindex="0"`, `role="group"`, `aria-roledescription`, `aria-label`
— `DepoimentosSection.astro:101-108`). Um tem tratamento, o outro não.
**Correção proposta:** replicar os quatro atributos do trilho de depoimentos,
com `aria-label="Diferenciais de trabalhar na Solar Coca-Cola"`. Virou
[QA-019](../../playbook/09-qa-erros-comuns.md#qa-019).

### Rodapé (mobile) — alvos de toque abaixo de 44 px (tipo B na medida, C na correção)

**Onde:** `src/components/Footer.astro:52-58` (redes) e o bloco legal
(`a.text-ink-20`).
**O que acontece:** Instagram/LinkedIn/YouTube são círculos de **40×40**;
"Aviso de Cookies" mede **105×19** e "Política de Privacidade" **138×19**, lado
a lado. O logo do header no mobile tem **210×22** de área clicável.
**Por que importa:** abaixo dos 44 px do alvo mínimo; nos dois links legais o
erro de toque cai no link vizinho, porque estão colados.
**Correção proposta — sem tocar no visual:** manter o desenho do Figma e
esticar só a área de toque, com um pseudo-elemento
(`a::after { content:''; position:absolute; inset:-12px; }` + `position:
relative`). O círculo continua com 40 px e o texto legal com 19 px de altura na
tela; só a área sensível cresce. Se preferir mexer no desenho (círculo de 44,
espaçamento maior entre os links legais), aí é decisão do designer — ver
Observações.

---

## Polimento

### Depoimentos (mobile) — setas onde o Figma pede indicadores (tipo A)

**Onde:** `src/components/sections/DepoimentosSection.astro:63-86`.
`docs/reference/depoimentos-mobile.png` mostra, no mobile, **4 pontinhos**
abaixo do card (primeiro vermelho, resto rosa) e **nenhuma seta**. O site
mostra as duas setas abaixo do título e nenhum indicador. Funciona — mas o
usuário do celular não tem noção de posição entre 5 depoimentos, e o Figma já
resolveu isso.
**Correção proposta:** no mobile, esconder as setas e renderizar os pontos como
no `#diferenciais` (mesmo componente), mantendo as setas no desktop, que é o
que a referência de desktop mostra.

### Diferenciais — os pontos não são clicáveis (tipo C)

**Onde:** `DiferenciaisSection.astro:51-57`. Os indicadores são `<li>` com
`aria-hidden="true"`: clicar/tocar não faz nada (testei — `scrollLeft` não se
move). O playbook pede dots navegáveis por teclado, com `cursor: pointer` e
área ≥ 44×44. Como o Figma não documenta o comportamento, cabe propor: virar
`<button>` com `aria-label="Ir para o card N"` e `scrollTo` no trilho, com a
bolinha de 10 px dentro de um alvo de 44 px.

### Depoimentos — o trilho não anuncia a troca de slide (tipo C)

Tem `aria-roledescription="carrossel"` e rótulo, mas não tem `aria-live`.
Quem usa leitor de tela clica na seta e não ouve nada. Propor
`aria-live="polite"` no trilho (o padrão do playbook).

### Menu mobile — a página rola por baixo do menu aberto (tipo C)

Com o menu aberto, `body` continua com `overflow: visible` e a roda do mouse /
o dedo rolam a página atrás do painel (confirmei: `scrollY` foi de 0 a 600 com
o menu aberto). Como o painel é um dropdown dentro do header sticky, e não um
overlay de tela cheia, não chega a ser um erro — mas travar o scroll enquanto
`aria-expanded="true"` deixa a interação mais firme. Tudo o mais do menu está
certo: Esc fecha e devolve o foco ao botão, clicar num link fecha, o resize
para desktop fecha, e o Tab passa pelos 5 itens do painel antes de sair.

### Sem JS no celular — o botão do menu existe e não faz nada (tipo C)

`Header.astro:37-56` renderiza o `#menu-toggle` sempre, e `#menu-mobile` nasce
com o atributo `hidden`. Com JS desligado, medi **0 links de navegação
alcançáveis no mobile** — o botão fica lá, clicável, inerte. Nenhum conteúdo se
perde (é single page e todo o resto aparece), então é acabamento. Proposta:
trocar o par por `<details><summary>`, que abre sem JS e mantém exatamente o
mesmo layout; o script passa a só cuidar do Esc e do resize.

### Rodapé legal — anel de foco em cinza, não na cor de destaque (tipo C)

Os dois links legais recebem `outline` em `#d4d4d4` (a própria cor do texto),
enquanto todo o resto da página usa `#ff0000` de `--color-accent`. É visível
sobre o fundo escuro, então não é falha de acessibilidade — só inconsistência.
Vale conferir qual utilitária está sobrescrevendo `outline-color`.

---

## Observações para o designer — **não alterado**

### 1. Contraste do vermelho da marca

Confirmo o diagnóstico já registrado em Pendências, com um detalhe que muda a
escolha da saída. As 22 ocorrências (desktop) / 20 (mobile) do axe têm **uma
única causa** — `#FF0000` — mas em três formatos diferentes:

| Caso | Exemplo | Tamanho | Passa com "subir para 20 px bold"? |
|---|---|---|---|
| Branco sobre vermelho (botões) | `.btn-primary` | 18 px bold | sim (20 px bold conta como texto grande) |
| Branco sobre vermelho (corpo) | `E mais:` na seção Benefícios | 20 px regular | **não** — regular só é grande a partir de 24 px |
| Vermelho sobre branco (texto) | "Clique para se inscrever", pílulas de data | 16 px regular | **não** |

Ou seja: a opção "subir o texto dos botões para 20 px bold" resolve 13 das 22
ocorrências e deixa as outras 9 de fora. A única saída que fecha todas é
escurecer o vermelho **do texto e do preenchimento sob texto**.

**Terceira saída, que sugiro:** `#E60000` — dá **4,81:1** com branco (passa AA
em qualquer tamanho) e está a 6% de `#FF0000`, uma diferença que ninguém
percebe fora de comparação lado a lado. Bem menos deslocamento que o `#D40000`
(5,53:1) já proposto. Ficaria como um token novo (`--color-brand-aa`) usado só
onde há texto envolvido; `#FF0000` continua nas áreas gráficas (anel do hero,
bloco de Benefícios, ícones), onde WCAG não se aplica. O hover atual
(`#CC0000`, 5,89:1) continua distinguível de `#E60000`.
**Não mexi em nada.**

### 2. Hero mobile — a data mudou de lugar e de texto

`docs/reference/top-mobile.png` traz "Inscrições até 28 de setembro" numa
pílula **entre o chip "Supply Chain" e o título**. O site mostra "Até 28 de
setembro" **abaixo do CTA**, e o CTA está rotulado "Inscreva-se" onde o Figma
diz "Inscreva-se agora!". É um desvio de execução (tipo A), mas como envolve
posição e cópia da dobra principal, prefiro confirmar antes de mexer: o prazo é
a informação que cria urgência e, no Figma, ela vem antes da decisão, não
depois.

### 3. Alvos de toque de 40 px no rodapé

Os círculos de rede social com 40 px vêm do Figma (tipo B). A correção que
proponho acima (esticar só a área sensível com pseudo-elemento) **não altera o
desenho**; se o designer preferir subir o círculo para 44 px e afastar os dois
links legais, aí é mudança de layout e precisa da autorização dele.

---

## O que foi testado

- **Teclado:** tabulação completa nos dois breakpoints (25 paradas no desktop,
  21 no mobile) — ordem, tamanho e indicador de foco de cada parada. Skip link
  (`#main`) e Esc no menu.
- **Menu mobile:** abrir, fechar pelo botão, Esc (com devolução do foco),
  clique num link, scroll com menu aberto, tabulação de dentro para fora,
  resize de 390 → 1440 com o menu aberto.
- **Carrossel de depoimentos:** clique nas duas setas até as duas pontas (4
  passos de ida e 4 de volta), estado `disabled` em cada ponta, setas do
  teclado com o trilho focado, arrasto/scroll, desktop e mobile.
- **Carrossel de diferenciais:** scroll por toque, setas do teclado, sincronia
  dos indicadores, clique nos indicadores, atributos ARIA.
- **Acordeão:** abrir, fechar, exclusividade do `name="faq"`, amostragem de
  altura a 60 ms, giro da seta, tratamento do aviso de resposta pendente.
- **Âncoras:** os 5 destinos do nav nos dois breakpoints, medindo o topo da
  seção e do título contra a altura do header sticky (nenhum título fica
  encoberto; o pior caso é 8 px de folga).
- **Reveals:** varredura completa da página, deep-link em `#faq` e salto direto
  para o fim — nenhum elemento preso em `opacity: 0` (a única ocorrência é a
  pílula de data, que é `display: none` no mobile por design).
- **Toque:** `hasTouch` real em iPhone 13 emulado, comparando estilo antes e
  depois do tap.
- **axe-core** completo nos dois breakpoints, com a página inteira já revelada,
  agrupando as violações por mensagem.
- **Sem JS:** navegação e menu no mobile.

**Não foi testado:** formulários (a página não tem nenhum — o CTA é link
externo), navegação real dos CTAs (todos ainda em `#`, pendência conhecida),
leitor de tela real (VoiceOver/NVDA), Safari e Firefox de verdade (tudo rodou
em Chromium), e as respostas do FAQ (conteúdo pendente do cliente).
