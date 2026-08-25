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

> Próximo ID livre: **QA-018**
