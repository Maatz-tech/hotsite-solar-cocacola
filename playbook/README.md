# Playbook

Processo canônico para tocar uma landing page Astro + Tailwind a partir do
Figma, do zero à entrega. **Segue a ordem.** Só passa pra próxima fase quando a
atual está fechada.

---

## Stack e princípios

- **Stack:** Astro 5 (output static) + Tailwind CSS v4 (`@theme` em `src/styles/global.css`).
- **Animações:** Framer Motion (pacote `motion`), vanilla. Ver [05-animacao](05-animacao.md).
- **Fonte de verdade do design:** Figma via MCP (`get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs`).
- **Arquitetura:** globals → componentes → seções → páginas. Página só monta seções, seção só compõe componentes.
- **Regra-mestre:** uma seção por vez. Não desenvolver duas em paralelo, não pular pra próxima antes da anterior ficar pixel-perfect.

---

## Modos de trabalho — LEIA ANTES DE COMEÇAR QUALQUER TAREFA

O processo completo é para **construir uma seção nova do zero**. Rodar o
processo inteiro para um ajuste de 3px é desperdício de tempo e tokens.
Classifique a tarefa primeiro:

| Modo | Quando | O que roda |
|---|---|---|
| 🔧 **Quick fix** | "aumenta o padding", "troca a cor", "esse texto tá errado", ajustes de 1 propriedade | Edit direto no arquivo. **Sem** screenshot, build, Figma, subagente ou Lighthouse. Responder em 1–3 frases. |
| 🎯 **Ajuste de seção** | "essa seção tá diferente do Figma", mudança de layout dentro de seção existente | Edit + 1 screenshot local do viewport afetado. Só puxa Figma se o gap for de spec, não de execução. |
| 🏗️ **Seção nova** | Seção que ainda não existe | Loop completo de [04-loop-de-secoes](04-loop-de-secoes.md). |
| 🚀 **Pré-entrega** | Cliente vai receber | [08-entrega](08-entrega.md) inteiro. |

**Escalada de modo:** se durante um quick fix descobrir que a seção inteira está
fora do design, **avisar e perguntar** antes de subir para o loop completo. Não
escalar por conta própria.

### Regras de economia de tokens

1. **Não reler arquivo que acabou de ser editado.** O Edit falha se não aplicar.
2. **Não rodar build** para validar mudança de CSS/copy. Build é da pré-entrega.
3. **Não tirar screenshot** de ajuste que não muda layout.
4. **Não abrir o Figma** para corrigir execução — só para resolver dúvida de spec.
5. **Resposta proporcional à mudança.** Ajuste pequeno, resposta pequena.

---

## Índice

| # | Arquivo | O que cobre |
|---|---|---|
| 01 | [Kickoff e setup](01-kickoff.md) | Design intake, PROJECT.md, cópia do template |
| 02 | [Tokens e globais](02-tokens-e-globais.md) | `@theme`, escala tipográfica, utilitárias semânticas |
| 03 | [Componentes globais](03-componentes-globais.md) | Header, Footer, Button, SectionHeader, ícones |
| 04 | [Loop de seções](04-loop-de-secoes.md) | O coração do trabalho: coleta → implementação → pixel-perfect |
| 05 | [Animação](05-animacao.md) | A assinatura de movimento da casa, `motion.ts`, receitas por seção |
| 06 | [Micro-interações](06-micro-interacoes.md) | Hover, cursor, foco, acordeão, carrossel |
| 07 | [Regras de código](07-regras-de-codigo.md) | SVG, imagens, CSS, DRY, JS, HTML semântico — valem o tempo todo |
| 08 | [Entrega](08-entrega.md) | SEO, performance, acessibilidade, build e checklist final |
| 09 | [QA — erros comuns](09-qa-erros-comuns.md) | **Catálogo de erros já cometidos.** Ler antes de fechar seção. |
| 10 | [Anti-patterns](10-anti-patterns.md) | Lista curta do que nunca fazer |
| 11 | [Review automatizado](11-review.md) | Os três revisores: design, usabilidade e performance |
| 12 | [Coleta](12-coleta.md) | Runbook da etapa mecânica — prints, Lighthouse, manifesto |

> **07 não é uma fase**, é regra contínua — vale desde a primeira linha.

---

## Como este playbook evolui

Todo erro pego em QA (por mim, por revisão ou pelo cliente) vira uma entrada em
[09-qa-erros-comuns](09-qa-erros-comuns.md), com sintoma, causa e correção. É o
arquivo que impede o mesmo bug de aparecer no próximo projeto — mantê-lo é parte
do trabalho, não burocracia.

Se o cliente mudar de ideia sobre uma seção pronta, é uma **iteração**: repetir
o loop da fase 04 para aquela seção. Não abre espaço pra improviso.
