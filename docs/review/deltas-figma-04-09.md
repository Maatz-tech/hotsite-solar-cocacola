# Alterações do Figma — levantamento de 04/09/2026

Comparação entre o Figma de hoje e o site no ar (`c200138`).
Referências novas em `docs/reference/`; as de 25/08 preservadas em
`docs/reference-25-08/`.

**Nada foi implementado.** Este documento é a lista para decidir o que entra.

A página cresceu bastante: **desktop 7378 → 8467px** (+1089) e
**mobile 10971 → 12193px** (+1222).

---

## A. Mudanças da designer — entram na implementação

### A1. Seção nova: "Nossos valores" 🔴 bloqueada por conteúdo
`4215:646` (desktop, 1440×932) · `4215:891` (mobile, 375×1114)
Entra **entre Etapas e Depoimentos**.

Bloco escuro com foto à esquerda (moldura branca, garrafa vermelha sangrando
no canto) e um **acordeão de 6 valores** à direita: Paixão, Valorização das
pessoas, Sentimento de dono, Protagonismo, Ética, Simplicidade.

Itens em `#535353`, radius 24, título 24px bold branco, texto 16px light,
chevron de 24px. O primeiro item nasce aberto e tem borda inferior branca de
4px marcando o estado ativo.

> **Bloqueio:** só **Paixão** tem resposta escrita —
> *"Somos apaixonados pelo que fazemos. Porque levar alegria e sorrisos para as
> pessoas nos inspira. Temos sede de vencer, servir e superar desafios."*
> Os outros cinco estão sem texto no Figma. É a mesma situação do FAQ em agosto.

Existe também `4214:82` ("Nossos valores", 897px), **oculto** — versão antiga.
Ignorar.

### A2. Carrossel EVP no hero
`4199:199` (desktop, 908×112) · `4200:553` (mobile, 375×104)

Cartão branco arredondado **sobreposto ao fim do hero** (desktop y=670, hero
termina em 750 — sobra 32px invadindo a seção seguinte). Três itens com ícone
vermelho e divisórias verticais:

- **Propósito** nos faz Solar
- **Desenvolvimento** nos faz Solar
- **Performance** nos faz Solar

**Muito provavelmente rotaciona**, por três indícios: o nó se chama "carrossel";
existe um slide **oculto** com "+200 / colaboradores"; e no mobile aparece
**um item por vez** ("Desenvolvimento nos faz Solar"), com as divisórias dos
vizinhos cortadas nas bordas — desenho clássico de trilho. No desktop os três
cabem juntos.

Se girar, temos o padrão pronto: `src/lib/carrossel.ts` com scroll-snap,
arrasto por mouse e indicadores, já usado em Depoimentos e Diferenciais.

### A3. Hero — logo e assinatura viraram um asset só ⚠️ decisão necessária
`4013:1024` (desktop) · `4029:2344` (mobile)

Onde hoje temos **logo SVG + assinatura como texto**, o Figma agora traz um
único asset `logotipo_solar_novo` (379×130 desktop / 261×90 mobile) que já
inclui "Paixão que transforma / Sede que impulsiona", maior e sem ponto final.

> **A decisão:** implementar como imagem perde o texto para leitor de tela e
> busca — foi justamente por isso que eu tinha transformado a assinatura em
> texto de verdade. Dá para reproduzir o novo tamanho mantendo texto. Recomendo
> manter texto; confirmar com a designer.

Junto vieram: bloco de conteúdo de 406 → **484px** de largura, y 83 → **70**,
e o CTA de "Inscreva-se" → **"Inscreva-se agora!"** (botão 153 → 211px).

### A4. Correção de texto: "Porque" → "Por que"
`4015:5` / `4031:2494` — o título vira **"Por que ser Solar Coca-Cola?"**.
Correção gramatical. Uma linha em `DiferenciaisSection.astro`.

### A5. Sobre a Solar — dois ajustes de texto
`4010:796` / `4031:2385` (desktop 812 → 872px)

1. Título: "pessoas solares!" → **"pessoas Solares!"** (S maiúsculo).
2. Terceiro parágrafo, trecho final reescrito para citar os valores:
   *"…É esse jeito de fazer acontecer, **com Paixão, Valorização das pessoas,
   Sentimento de dono e Protagonismo**, que impulsiona a jornada da Solar todos
   os dias."* (era "com paixão e protagonismo")

### A6. O programa — terceiro parágrafo reescrito
`4028:1884` / `4031:2456` (desktop 583 → 640px)

Substitui *"Buscamos talentos autênticos, dinâmicos e que queiram ser futuras
'Pessoas Solares'…"* por:

> "Buscamos pessoas que trabalham com paixão pelo que fazem, agem com
> protagonismo e têm muita vontade de crescer junto com a Solar. Queremos
> atrair talentos que estejam prontos para aprender, inovar e transformar,
> tornando-se futuras lideranças Solares e ajudando a construir, todos os dias,
> uma história movida por propósito, desenvolvimento e performance."

### A7. Quem procuramos — texto ajustado
`4028:1819` / `4031:2641`

> "Buscamos talentos com sede que impulsiona e que **transformam cada desafio em
> aprendizado e crescimento**. Se você tem paixão por superar metas, assumir o
> protagonismo da sua carreira e quer construir uma trajetória de conquistas, o
> seu lugar é aqui!"

(era "que enxergam cada desafio como um aprendizado e uma oportunidade de
crescimento")

---

## B. Diferenças que **não** são mudança da designer

Registrado para ninguém "corrigir" de volta:

| O quê | Diferença | Por quê |
|---|---|---|
| FAQ mais alto que o Figma | +68px mobile | Temos as respostas reais; o Figma segue sem elas |
| Etapas mais alto | +41px mobile | Correção dos chips que quebravam fora da pílula |
| Depoimentos mais alto | +117px mobile | Citação em 16px ocupa mais linhas que na arte |
| Rodapé sem "Aviso de Cookies" | — | Removido a pedido do Lucas em 27/08 |
| Título dos depoimentos | — | Unificado a pedido; o Figma mobile ainda tem outro |

---

## C. Higiene do Figma — reportar à designer

**Textos de outro projeto, visíveis na árvore mas fora do render.** Nos cards de
pré-requisitos há nós de texto falando de **estágio**:

- "Cursando alguma Instituição de Ensino Superior – B…"
- "Ter disponibilidade para estagiar em formato híbrido…"
- "Ter disponibilidade para estagiar 30 horas semanais…"

Aparecem como visíveis no `get_metadata` nos **dois** breakpoints, mas o render
mostra o conteúdo correto de trainee. São camadas soltas que sobraram de outro
arquivo. Não implementar — mas vale limpar, porque quem ler a árvore em vez do
render implementa errado.

---

## D. Ordem sugerida

1. **A4, A5, A6, A7** — só texto, risco quase zero, resolve 4 dos 7 itens.
2. **A2** — carrossel EVP, depois de confirmar se rotaciona.
3. **A3** — hero, depois de decidir imagem × texto.
4. **A1** — "Nossos valores" só quando os 5 textos chegarem. Dá para adiantar a
   estrutura e travar o conteúdo, como fizemos no FAQ.

---

## E. Perguntas para o cliente/designer

1. Os **5 textos de valores** que faltam.
2. O carrossel EVP **gira** ou é estático? Existe um slide oculto de
   "+200 colaboradores".
3. A assinatura do hero pode continuar como **texto**, em vez do asset único?
   (No mobile o carrossel mostra um item por vez; no desktop, os três — confirmar
   se é a mesma peça em dois estados ou dois comportamentos diferentes.)
4. Confirmar a limpeza das camadas de estágio no arquivo.
