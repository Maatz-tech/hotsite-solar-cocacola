# Relatório — performance e SEO

**Data:** 26/08/2026 · **Commit:** `ad7ac8f` · **Build:** produção (`npm run build` + `astro preview`)

Nada foi alterado. Este documento é diagnóstico.

---

## Nota sobre o PageSpeed Insights

**Não foi possível rodar.** O PSI é um serviço do Google que busca a URL pelos
servidores dele — precisa de um endereço público, e o site está em `localhost`.
Enquanto o domínio não existir, ele não roda.

Vale saber o que muda quando rodar:

- **Metade do PSI é o mesmo Lighthouse** que rodei aqui (dados de laboratório).
  Esses números não devem mudar muito.
- **A outra metade são dados de campo (CrUX)** — usuários reais dos últimos 28
  dias. Isso só existe depois do site no ar e com tráfego. É o número que o
  Google usa em ranqueamento, e costuma ser pior que o laboratório, porque
  inclui celular ruim e rede ruim de verdade.
- O laboratório aqui roda em máquina local; num servidor real o TTFB entra na
  conta.

---

## Lighthouse

| | Mobile | Desktop | Meta do playbook |
|---|---|---|---|
| Performance | **94** | **100** | ≥ 95 |
| Acessibilidade | **92** | **96** | ≥ 95 |
| Boas práticas | **100** | **100** | 100 |
| SEO | **100** | **100** | 100 |

| Métrica | Mobile | Desktop |
|---|---|---|
| LCP | 3,0 s | 0,8 s |
| FCP | 1,3 s | 0,4 s |
| Speed Index | 1,3 s | 0,4 s |
| CLS | **0** | **0** |
| TBT | **0 ms** | **0 ms** |
| Peso total | 376 KB | 458 KB |

CLS zero e TBT zero nos dois — não há salto de layout nem JavaScript travando a
thread. O que segura a nota é rede e imagem.

> **Atenção à variação.** Em execuções anteriores a performance mobile oscilou
> entre 84 e 96 na mesma máquina. Tratar 94 como faixa, não como número.

---

## Performance — ajustes possíveis, por impacto

### 1. LCP mobile em 3,0 s (score 0,77) — o maior ganho isolado
O elemento é `stripes-mobile.webp`, a textura do hero. O arquivo tem 17 KB e
transfere rápido; o custo está na **fila na frente dele**. Caminhos:

- Embutir a textura como `background-image` em CSS crítico inline, tirando uma
  requisição do caminho.
- Ou reduzir a textura a um *tile* pequeno repetido (`background-repeat`), já
  que o padrão é orgânico e a emenda seria pouco perceptível — de 17 KB para
  ~2 KB.
- Ou aceitar: 3,0 s de LCP em 4G simulado com CPU 4× lenta não é ruim.

### 2. Imagens superdimensionadas — 75 KB (mobile) e 126 KB (desktop)
Continuação do achado do review anterior, **parcialmente resolvido**. Os `sizes`
foram corrigidos, mas três variantes `-sm` (`card-icones`, `time`, `selfie`)
foram exportadas pequenas demais para satisfazer 2× o slot real, então em
DPR ≥ 2 o browser continua baixando o arquivo grande. Falta reexportar em
~750–800w.

### 3. "Improve image delivery" — 165 KB (mobile) / 113 KB (desktop)
As imagens grandes foram geradas em qualidade ~82–85. Recomprimir para q75 e
limitar a largura do topo da escada tira o grosso disso sem tocar em markup.
`programa/time.webp` sozinho tem 241 KB.

### 4. CSS bloqueando a pintura
Uma folha de ~30 KB no `<head>`. Opções: CSS crítico inline com o resto adiado,
ou aceitar — o FCP já está em 1,3 s.

### 5. "Forced reflow" (desktop)
Provavelmente o script dos carrosséis lendo `offsetLeft`/`clientWidth` no
`scroll`. Cachear as medidas e recalcular só no `resize` resolve.

---

## Acessibilidade

### Mobile 92 · Desktop 96 — duas falhas

**1. Contraste (mobile e desktop).** Branco sobre `#FF0000` dá 4,0:1; AA pede
4,5:1 para 18px bold. Vale para todo botão primário e para os textos vermelhos.
É a cor da marca, veio do Figma — **decisão de design, não de código.**
Saída recomendada pelo revisor de usabilidade: **`#E60000`** (4,81:1), que passa
AA em qualquer tamanho e fica a 6% do vermelho atual. Resolve as 22 ocorrências.

**2. Alvos de toque pequenos (só mobile).** É o que derrubou o mobile de 96 para
92. Os ícones de rede social do rodapé têm 40×40 (mínimo recomendado 44×44) e os
links legais ficam colados. Dá para esticar só a área sensível com
pseudo-elemento, sem mudar o desenho.

---

## SEO

O Lighthouse dá **100/100**, mas ele só verifica o básico. Os problemas reais
estão abaixo e **nenhum deles aparece na nota**.

### Bloqueantes para o lançamento

| # | Problema | Efeito |
|---|---|---|
| 1 | `canonical`, `og:url` e o JSON-LD apontam para **`https://exemplo.com.br`** | Se subir assim, a página se declara cópia de outro domínio. O Google tende a não indexar. |
| 2 | `og:image` aponta para `/og.jpg`, que **não existe** | Compartilhamento no WhatsApp, LinkedIn e Slack sai sem imagem. |
| 3 | **Não há sitemap.** `@astrojs/sitemap` não está instalado e `site` não está definido no `astro.config.mjs` | O `robots.txt` tem a linha `Sitemap:` comentada esperando o domínio. |

Os três têm a mesma raiz: **o domínio final ainda não foi definido.** Assim que
chegar, é definir `site` no `astro.config.mjs`, instalar o sitemap e produzir a
imagem de compartilhamento.

### Oportunidade grande, ainda não explorada

**JSON-LD só tem `Organization`.** Para uma página de vaga, o schema
[`JobPosting`](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
faz a vaga aparecer no **Google for Jobs**, que é onde candidato procura. Já
temos no conteúdo quase tudo que ele pede: título, empregador, descrição, data
de publicação, prazo (28/09), localidades (CE, AL, MA, MT, BA), tipo de contrato
e salário (R$ 7.500). É o item de maior retorno da lista.

### Ajustes menores

- **`<title>` com 43 caracteres** — cabe até ~60. Algo como
  "Trainee 2026 Supply Chain | Solar Coca-Cola — Inscrições abertas" usaria
  melhor o espaço.
- **Dois `<h2>` para a seção de depoimentos** (um mobile, um desktop). Só um
  aparece por vez, mas os dois estão no HTML. É consequência do Figma usar
  títulos diferentes por breakpoint.
- **`<h1>` é "Trainee"** mais o `alt` do logo, o que dá "Trainee Solar
  Coca-Cola" como texto acessível. Funciona, mas um h1 mais descritivo ajudaria
  em busca. É decisão de design.

### O que já está correto

`lang="pt-BR"` · viewport · **39 de 39 imagens com `alt`** (22 decorativas com
`alt=""`, corretamente) · um único `<h1>` · hierarquia de headings sem pulos ·
`robots.txt` permissivo · Open Graph e Twitter Card completos · favicon em SVG
e PNG · `og:locale` pt_BR.

---

## Ordem sugerida

1. **Domínio** — destrava canonical, OG, sitemap e robots de uma vez. *Cliente.*
2. **`og.jpg`** — a imagem não existe. *Designer.*
3. **`JobPosting` no JSON-LD** — maior retorno de SEO da lista.
4. **Alvos de toque no rodapé** — devolve o mobile de 92 para ~96.
5. **Contraste** — decisão de marca; `#E60000` resolve tudo.
6. **Reexportar as 3 variantes `-sm`** e recomprimir para q75.
7. **LCP mobile** — só se quiser passar de 95 com folga.
