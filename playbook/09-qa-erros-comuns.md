# 09 — QA: erros comuns

Catálogo de erros **já cometidos** em projetos reais. Ler antes de fechar uma
seção e antes da entrega. Cada entrada existe para o mesmo bug não voltar.

## Como usar

- **Antes de fechar seção:** varrer os títulos. Se algum descreve o que você
  acabou de construir, conferir.
- **Ao pegar um bug novo:** adicionar entrada aqui **na mesma sessão**, com o
  próximo `QA-XXX` livre. Erro não registrado volta.
- **Ao corrigir no template:** referenciar o ID em comentário no código
  (`Ver playbook/09-qa-erros-comuns.md#qa-001`), para quem lê o código achar o porquê.

### Formato de uma entrada

```md
## QA-0XX — <título curto do sintoma>

**Categoria:** CSS · Animação · A11y · Performance · Figma · Build · Conteúdo
**Sintoma:** o que se vê acontecendo.
**Causa:** por que acontece.
**Correção:** o que fazer, com código quando ajudar.
**Como detectar:** o teste rápido que revela o problema.
```

---

## QA-001 — Hover não aplica, por mais específico que eu escreva

**Categoria:** CSS
**Sintoma:** `.card-interactive:hover { border-color: … }` simplesmente não tem
efeito; o elemento continua com a borda da utilitária.
**Causa:** no Tailwind v4 as utilitárias moram numa `@layer` **posterior** à de
componentes. `border-transparent` no elemento vence qualquer regra dentro de
`@layer components`, independente de especificidade — cascata de layers vem
antes de especificidade.
**Correção:** deixar os hovers que disputam com utilitária **fora de qualquer
`@layer`**. Regra sem layer vence todas as layers.
**Como detectar:** DevTools mostra a regra riscada mesmo sendo mais específica.

---

## QA-002 — Hover morre depois que o elemento entra na tela

**Categoria:** Animação
**Sintoma:** o hover funciona antes do reveal e para de funcionar depois que a
animação de entrada roda.
**Causa:** o Motion deixa `transform` **inline** no elemento ao terminar. Estilo
inline vence qualquer CSS, então o `translateY(-2px)` do hover não tem efeito.
**Correção:** limpar o inline no `.finished` — é o que `liberar()` faz em
`src/lib/motion.ts`:

```ts
el.style.opacity = '1';   // continua inline: precisa vencer `.js [data-reveal]`
el.style.transform = '';  // devolve o controle ao CSS
el.style.filter = '';
el.style.willChange = '';
```

**Como detectar:** inspecionar o elemento depois do reveal e procurar
`style="transform: …"`.

---

## QA-003 — `drawLine` nunca dispara

**Categoria:** Animação
**Sintoma:** a linha fica invisível para sempre; a animação nunca começa.
**Causa:** o elemento está em `scaleX(0)`, ou seja, com caixa de **área zero**. O
IntersectionObserver nunca reporta interseção para área zero.
**Correção:** observar o **elemento pai**, não a linha.
**Como detectar:** se o alvo tem `transform: scaleX(0)` ou `width: 0` no estado
inicial, o observer precisa estar em outro elemento.

---

## QA-004 — `<details>` fecha sem animação

**Categoria:** CSS
**Sintoma:** abre bonito, fecha instantâneo.
**Causa:** o browser remove o atributo `open` imediatamente no clique; o conteúdo
sai do fluxo antes da transição rodar.
**Correção:** interceptar o evento `toggle`, segurar o `open` via JS até a
animação de fechamento terminar, e só então remover.
**Como detectar:** testar o **fechamento**, não só a abertura — quase todo mundo
só testa a abertura.

---

## QA-005 — FAQ com o primeiro item aberto no load

**Categoria:** Figma
**Sintoma:** a página carrega com uma resposta aberta empurrando o resto.
**Causa:** o Figma mostra o primeiro item aberto **para demonstrar o estado**, e
isso é copiado como se fosse o default de produção.
**Correção:** todos fechados no load. Sempre.
**Como detectar:** regra geral — estado "aberto/ativo/selecionado" no Figma quase
sempre é demonstração, não default. Na dúvida, perguntar ao designer.

---

## QA-006 — LCP ruim por causa do reveal do hero

**Categoria:** Performance
**Sintoma:** Lighthouse acusa LCP alto mesmo com imagem otimizada.
**Causa:** o elemento do LCP entra com `opacity: 0` esperando scroll reveal. O
LCP só conta quando o elemento fica visível.
**Correção:** hero **não** entra com `opacity: 0`. Animar no hero só o que não é
LCP (badge, decoração de fundo, cursor de digitação), com delay ≤ 100 ms.
**Como detectar:** painel Performance do DevTools — o marcador de LCP cai depois
do fim da animação de entrada.

---

## QA-007 — Palavras do `revealWords` não se movem

**Categoria:** Animação
**Sintoma:** o fade acontece, mas o deslocamento vertical não.
**Causa:** `transform` não se aplica a elemento `display: inline`, e `<span>` é
inline por padrão.
**Correção:** `inline-block` em todo `[data-palavra]` (já está no `RevealText.astro`).
**Como detectar:** opacidade anima, `y` não.

---

## QA-008 — Heading pisca / a página pula ao carregar

**Categoria:** Animação
**Sintoma:** flash de texto sem quebra, ou reflow visível no primeiro paint.
**Causa:** as palavras estão sendo quebradas em `<span>` **no cliente**.
**Correção:** quebrar no build (`RevealText.astro`).
**Como detectar:** desacelerar a CPU 6× no DevTools e recarregar.

---

## QA-009 — Screenshot sai com barra estranha no rodapé

**Categoria:** Build
**Sintoma:** o PNG de comparação tem uma barra flutuante que não existe no Figma.
**Causa:** o dev toolbar do Astro injeta elementos próprios na página.
**Correção:** removê-lo antes da captura — `scripts/shot.mjs` já faz
`document.querySelector('astro-dev-toolbar')?.remove()`.
**Como detectar:** olhar o rodapé do PNG antes de comparar.

---

## QA-010 — Página em branco com JS desligado

**Categoria:** A11y
**Sintoma:** sem JS (ou com o bundle falhando), as seções ficam invisíveis.
**Causa:** o `opacity: 0` inicial está em CSS **incondicional**.
**Correção:** condicionar tudo à classe `.js`, setada inline no `<head>` do
`Base.astro` antes do primeiro paint. E toda função de reveal começa com o
fallback que **mostra** em `prefers-reduced-motion`.
**Como detectar:** desabilitar JS no DevTools e recarregar. Teste obrigatório
antes da entrega.

---

## QA-011 — Imagem do hero demora em 4G

**Categoria:** Performance
**Sintoma:** LCP alto em rede lenta, mesmo com imagem leve.
**Causa:** o bundle do `motion` (~26 KB gzip) competindo banda com a imagem do LCP.
**Correção:** import tardio via `aposCarregar()` — `requestIdleCallback` com
timeout de 600 ms depois do `load`. Como todo reveal está abaixo da dobra, o
atraso não é percebido.
**Como detectar:** aba Network com throttling "Slow 4G", olhar a ordem das
requisições.

---

## QA-012 — Screenshot com a fonte errada

**Categoria:** Build
**Sintoma:** a comparação acusa diferença de tipografia que não existe no browser.
**Causa:** a captura aconteceu antes da webfont carregar; o PNG saiu com a fonte
de fallback.
**Correção:** aguardar `document.fonts.ready` antes de fotografar (já em
`scripts/shot.mjs`).
**Como detectar:** as letras do PNG têm largura diferente da tela.

---

## QA-013 — Sobrou marca de outro projeto

**Categoria:** Conteúdo
**Sintoma:** copy, cor, logo ou nav de um projeto anterior aparecendo no novo.
**Causa:** template copiado de um projeto em andamento em vez do template limpo,
ou substituição parcial dos placeholders.
**Correção:** seguir o checklist de [01-kickoff](01-kickoff.md#fase-1--setup) e
rodar o grep final de [08-entrega](08-entrega.md#grep-final).
**Como detectar:**

```bash
grep -rn "TODO\|Lorem\|<Marca>\|LOGO\|exemplo.com.br" src/ public/
```

---

## QA-014 — Screenshot da seção sai em branco ou apagado

**Categoria:** Build
**Sintoma:** o print do projeto para comparar com o Figma sai vazio, ou com o
conteúdo semitransparente, mesmo estando certo no browser.
**Causa:** a seção está abaixo da dobra e o reveal nunca disparou — o
IntersectionObserver não foi acionado porque a página não foi rolada, então tudo
continua em `opacity: 0`.
**Correção:** rolar a página inteira antes de fotografar e esperar as animações
terminarem. `scripts/compare-section.mjs` já faz isso; um script de captura
improvisado, não.
**Como detectar:** o PNG está bem mais claro que a tela.

---

## QA-015 — Lazy image não aparece no screenshot (rolar num laço síncrono não resolve)

**Categoria:** Build
**Sintoma:** logo do rodapé, decoração do fim da página ou qualquer imagem com
`loading="lazy"` sai em branco no print, mesmo com `networkidle` e mesmo estando
certa no browser.
**Causa:** o browser só avalia o `IntersectionObserver` do lazy-load **entre
tarefas**. Um `for (let y = 0; y < h; y += innerHeight) window.scrollTo(0, y)`
roda inteiro numa tarefa só: a posição final é a única que o browser vê, e se
ela for o topo, nenhuma imagem de baixo chega a carregar.
**Correção:** ceder o controle a cada passo da rolagem e só então esperar as
imagens decodificarem:

```js
const pausa = () => new Promise((r) => setTimeout(r, 80));
for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
  window.scrollTo(0, y);
  await pausa();
}
window.scrollTo(0, 0);
await pausa();
```

E correr o `decode()` contra um timeout — `img.decode()` de uma imagem que nunca
carrega não resolve nunca e trava o script.
**Como detectar:** `naturalWidth === 0` no elemento, mas a URL responde 200 no
`curl`.

---

## QA-016 — Screenshot de elemento fotografa antes da pintura

**Categoria:** Build
**Sintoma:** `locator.screenshot()` de uma seção sai sem as imagens, enquanto o
screenshot de página inteira sai correto.
**Causa:** o screenshot de elemento rola a página por conta própria para
enquadrar o alvo e, com `scroll-behavior: smooth` no `html`, dispara junto com
uma animação de rolagem — às vezes fotografa no meio.
**Correção:** tirar a página inteira e recortar pela `boundingBox()` do
elemento. É determinístico e não depende de rolagem.

```js
const caixa = await page.locator(selector).first().boundingBox();
await page.screenshot({ path: out, fullPage: true, clip: caixa });
```

**Como detectar:** o mesmo elemento sai certo em `fullPage` e errado em
`locator.screenshot()`.

---

## QA-017 — Export do Figma achata o alpha e some com o que está atrás

**Categoria:** Design intake
**Sintoma:** uma foto recortada (pessoa sem fundo) tapa a forma que deveria
aparecer por trás dela — anel, círculo, textura.
**Causa:** `download_assets` exporta o **nó renderizado no contexto da página**,
não a imagem-fonte. Se houver qualquer preenchimento atrás, ele vem achatado
junto e o PNG sai 100% opaco.
**Correção:** usar o `rawImages` da resposta (a imagem original enviada ao
Figma, com o recorte preservado) e reproduzir o enquadramento com o mesmo
`width`/`left`/`top` em % que o `get_design_context` informa.
**Como detectar:** `Image.open(png).getchannel('A').getextrema() == (255, 255)`
num asset que deveria ter recorte.

---

## QA-018 — Hover grudado depois do toque no celular

**Categoria:** Micro-interação
**Sintoma:** no celular, o botão fica com a cor de hover (e o `translate` do
`:active`) **depois** do toque, como se estivesse pressionado para sempre, até
o usuário tocar em outro lugar.
**Causa:** regras `:hover` sem media query. Em touch o browser aplica `:hover`
no toque e só solta no próximo toque fora do elemento.
**Correção:** envelopar todo bloco de hover em
`@media (hover: hover) and (pointer: fine) { … }`. `:active` e `:focus-visible`
ficam fora — esses valem nos dois.
**Como detectar:** Playwright com `hasTouch: true`, `touchscreen.tap()` no
botão e comparar `getComputedStyle` antes e depois; se o `background-color`
mudou e não voltou, é isto.

---

## QA-019 — Carrossel com `overflow-x` sem foco nem rótulo

**Categoria:** Acessibilidade
**Sintoma:** axe acusa `scrollable-region-focusable`; o trilho só rola por
toque ou mouse, e o leitor de tela anuncia o texto solto dos cards.
**Causa:** um `div` com `overflow-x: auto` é uma região rolável, mas sem
`tabindex="0"` não recebe foco (o Chrome novo até dá, o Safari e o Firefox
não) e sem `role`/`aria-label` não tem nome.
**Correção:** no trilho: `tabindex="0"`, `role="group"`,
`aria-roledescription="carrossel"`, `aria-label="…"` — e o mesmo tratamento em
**todos** os trilhos da página, não só no que tem setas.
**Como detectar:** `axe-core` na viewport mobile, regra
`scrollable-region-focusable`; ou tabular a página e ver se o trilho aparece na
ordem.

---

## QA-020 — Lighthouse mede o site errado quando a porta fixa está ocupada

**Categoria:** Build
**Sintoma:** a nota do Lighthouse não bate com a página, ou o relatório cita
elementos que não existem no projeto.
**Causa:** `scripts/lighthouse.mjs` sobe o preview numa **porta fixa (4322)** e
só espera que ela responda `ok`. Se outro projeto já estiver servindo ali — o
que acontece o tempo todo com várias sessões abertas — o `spawn` do preview
falha em silêncio e o Lighthouse mede o site do vizinho.
**Correção:** antes de medir, confirmar que quem responde na porta é o preview
que o próprio script subiu — por exemplo, buscando uma string conhecida do
projeto no HTML, ou sorteando uma porta livre em vez de fixar 4322.
**Como detectar:** parar o preview e ver se a porta continua respondendo. Se
continuar, não era ele.

---

## QA-021 — Anel deduzido de dois círculos concêntricos em vez do `stroke-width`

**Categoria:** Design intake
**Sintoma:** um anel/donut sai com a espessura errada — perna grossa demais e
furo pequeno demais — mesmo com o diâmetro externo batendo pixel a pixel.
**Causa:** o `get_metadata` lista dois `<ellipse>` concêntricos e é tentador ler
o menor como o furo. Ele costuma ser outro elemento. No Figma o anel é **um
círculo com traço**, e o metadata não mostra `stroke-width`.
**Correção:** exportar o nó da elipse como SVG (`download_assets` com
`defaultFormat: "svg"`) e ler `r` e `stroke-width` direto:
`raio externo = r + stroke/2`, `raio do furo = r - stroke/2`. Em CSS,
`border: <stroke>px` numa caixa de `2 × raio externo` com `box-sizing: border-box`.
**Como detectar:** medir a espessura da perna do anel na referência e comparar
com `(diâmetro externo - furo) / 2`. Se divergir, foi deduzido errado.

---

## QA-022 — `position: fixed` dentro de elemento com `transform` não é fixo à viewport

**Categoria:** CSS
**Sintoma:** um drawer/modal com `fixed inset-0` aparece do tamanho do
cabeçalho, ou colado nele, em vez de cobrir a tela.
**Causa:** `transform`, `filter`, `perspective`, `backdrop-filter` e
`will-change` dessas propriedades fazem o elemento virar **bloco contêiner dos
descendentes `fixed`**. Um header que recolhe com `translateY` — ou que só
declara `will-change: transform` — passa a ser a "viewport" de tudo que está
dentro dele.
**Correção:** tirar o overlay de dentro do elemento transformado. Em Astro um
componente pode ter mais de um nó raiz, então o drawer vira irmão do `<header>`,
não filho.
**Como detectar:** `getBoundingClientRect()` do overlay não bate com
`innerWidth`/`innerHeight`.

---

## QA-023 — `overflow-x: auto` recorta também na vertical

**Categoria:** CSS
**Sintoma:** a borda de baixo e a sombra dos cards de um carrossel somem.
**Causa:** quando um eixo do `overflow` é diferente de `visible`, o outro deixa
de ser `visible` também. O trilho recorta na vertical mesmo você só tendo pedido
rolagem horizontal, e o card encostado na borda perde borda e sombra.
**Correção:** dar folga vertical ao trilho e devolvê-la com margem negativa, para
o espaçamento não mudar: `py-2 -my-2`.
**Como detectar:** comparar `trilho.getBoundingClientRect().bottom` com o
`bottom` do card — se a diferença for menor que o deslocamento da sombra, ela
está sendo cortada.

---

## QA-024 — Estado ativo alternando duas utilitárias de mesma propriedade

**Categoria:** CSS
**Sintoma:** o indicador ativo do carrossel nunca muda de cor, mesmo com o
JavaScript aplicando a classe certa.
**Causa:** `classList.toggle('bg-brand')` num elemento que já tem `bg-ink-20`
deixa as duas na folha, com a mesma especificidade. Quem vence é a que aparece
**depois no CSS**, não a que foi aplicada por último no DOM.
**Correção:** a cor mora numa regra própria e o JS alterna só um estado
semântico — `aria-current="true"`, que também é o que o leitor de tela precisa:

```css
.ponto-carrossel { background: var(--color-brand-weak); }
.ponto-carrossel[aria-current='true'] { background: var(--color-brand); }
```

**Como detectar:** no devtools a classe está aplicada e riscada.

---

## QA-025 — Decoração absoluta em seção full-width foge para o canto da tela

**Categoria:** Design intake
**Sintoma:** o selo/ornamento do canto direito acompanha o conteúdo em 1440 e
gruda na borda da janela em telas maiores.
**Causa:** o `absolute right-X` é relativo à `<section>`, que não tem largura
máxima. O desenho do Figma tem 1440; a seção tem a largura da janela.
**Correção:** ancorar numa caixa da largura do desenho, centrada:

```html
<div class="pointer-events-none absolute inset-0 mx-auto max-w-[1440px]">
  <img class="absolute right-20 top-16" … />
</div>
```

Se no Figma a decoração é cortada pela borda do quadro, pôr `overflow-hidden`
nessa caixa também — senão ela aparece inteira em tela larga e vira outro
desenho.
**Como detectar:** medir a distância da decoração até a borda em 1440, 1920 e
2560. Se não cresce junto com a margem do container, está solta.

---

## QA-026 — Borda dupla: o export do Figma já traz borda e sombra desenhadas

**Categoria:** Design intake
**Sintoma:** a foto aparece com duas bordas, ou com uma sombra deslocada da
outra. Some se você remove a borda do CSS, mas aí ela deixa de escalar junto
com o card.
**Causa:** `download_assets` exporta o **nó renderizado**. Se o nó é o frame que
carrega `border` e `drop-shadow` — e no Figma costuma ser, porque a imagem é
preenchimento desse frame — os dois vêm desenhados dentro do PNG. Aplicar
`border` e `shadow` no CSS por cima duplica.
**Correção:** recortar a moldura assada e deixar a do CSS, que é a do design
system e acompanha o token. Para borda de 1px e sombra `-5px 5px` num export
em 3×: cortar 18px à esquerda (sombra 5 + borda 1), 3px em cima e à direita,
18px embaixo.
**Como detectar:** comparar o tamanho do export com o do nó. Um nó de 300×400
que exporta 306×406 em 1× tem 6px de moldura embutida. Ou olhar a cor do pixel
da borda: `Image.open(f).getpixel((0, altura//2))` devolvendo a cor da borda
em vez de transparente entrega o problema.

---

## QA-027 — Recorte retangular não tira canto arredondado do export

**Categoria:** Design intake
**Sintoma:** depois de recortar a moldura assada (QA-026), a foto ainda mostra
cunhas claras nos cantos, e por cima delas a borda do CSS — parece "borda
dupla só nos cantos".
**Causa:** duas coisas que o recorte não resolve. A borda do nó também percorre
o **arco** do canto, e nenhum recorte retangular remove uma curva. E o raio do
Figma vem como transparência: ao salvar em WebP/JPEG sem alfa, o canto vira
**branco sólido** dentro da imagem.
**Correção:** parar de usar o export do nó. Pegar a `rawImages` — a foto
original, retangular, sem moldura — e reproduzir o enquadramento com os
percentuais que o `get_design_context` informa (`w`, `h`, `left`, `top` sobre o
slot). Borda, raio e sombra ficam só no CSS, com os tokens.

```python
larg = pw/100 * SLOT_W;  esq  = -pl/100 * SLOT_W
alt  = ph/100 * SLOT_H;  topo = -pt/100 * SLOT_H
k = fonte.width / larg          # do espaço do slot para pixels da fonte
caixa = (esq*k, topo*k, (esq+SLOT_W)*k, (topo+SLOT_H)*k)
```

**Como detectar:** ler a diagonal do canto do arquivo. Branco puro (255,255,255)
ou um pixel escuro isolado antes de começar a foto entrega o problema:
`Image.open(f).convert('RGB').getpixel((3,3))`.

---

## QA-028 — Referência do Figma volta reduzida e a comparação vira lixo

**Categoria:** Build
**Sintoma:** o review de design acusa desvio em *todas* as seções, com o projeto
sempre "maior" que o Figma por uma proporção parecida. Ou várias seções mobile
com exatamente **1024px** de altura de referência.
**Causa:** `get_screenshot` tem `maxDimension` padrão de **1024** e reduz sem
avisar. Uma seção desktop de 1440 de largura volta a 71%; uma seção mobile alta
é achatada para 1024. O comparativo passa a ser entre escalas diferentes, e todo
número que sair dele está errado.
**Correção:** passar `maxDimension` com o maior lado do nó em toda chamada, e
conferir contra `original_width`/`original_height` da resposta. Melhor ainda:
puxar a página inteira uma vez e **recortar as seções pelos offsets do
`get_metadata`** — sai em resolução nativa e gasta uma chamada só.
**Como detectar:** a razão altura-da-referência ÷ altura-do-nó é a mesma em
todas as seções (0,71 para desktop de 1440), ou a altura bate em 1024 redondo.

---

> Próximo ID livre: **QA-029**
