---
description: Review em duas fases — coleta mecânica num modelo pequeno, análise nos modelos completos. Escopos: ux, design, perf, tudo.
argument-hint: "[ux|design|perf|tudo] [seção ou rota opcional]"
---

# Review

Argumento: `$ARGUMENTS` (vazio = `tudo`).

Este comando tem **duas fases, e elas rodam em modelos diferentes de
propósito**. Não misture: coletar é barato, analisar é caro. Fazer print num
modelo caro é desperdício; julgar usabilidade num modelo pequeno é erro.

---

## Fase 1 — Coleta (modelo pequeno, Haiku)

Despache **um único** `capture-runner`. Ele é Haiku e só executa comando:

| Escopo pedido | Chamada |
|---|---|
| `tudo` ou vazio | `npm run collect -- --tudo --rota <rota>` |
| `ux` | `npm run collect -- --ux` |
| `design` | `npm run collect -- --cmp` |
| `perf` | `npm run collect -- --perf` |
| seção específica | acrescentar `--secao <id>` |

Ele sobe o servidor, fotografa as seções em 1440 e 390, baixa do Figma as
referências que faltam, roda a auditoria de usabilidade e o Lighthouse, e
escreve `docs/review/coleta.json`.

**Espere ele terminar antes da fase 2.** Os analistas leem os arquivos que ele
produz — sem eles, não há o que analisar.

Se o manifesto voltar com erro em alguma etapa, resolva ou informe antes de
seguir. Se voltar com referências do Figma faltando, siga mesmo assim: o
`design-reviewer` reporta as seções sem referência como não auditadas.

---

## Fase 2 — Análise (modelos completos, em paralelo)

Despache os agentes do escopo pedido **numa só mensagem**, para rodarem juntos.
Todos leem de `docs/review/`; nenhum tira print de novo.

| Argumento | Agente | Pergunta que responde |
|---|---|---|
| `ux`, `usabilidade` | `website-reviewer` | É bom de usar? |
| `design`, `figma`, `pixel` | `design-reviewer` | Está igual ao Figma? |
| `perf`, `performance`, `lighthouse` | `performance-reviewer` | É rápido o suficiente? |
| `tudo` ou vazio | os três | |

Passe a cada um: a rota revisada, o escopo (seção específica, se houver) e o
caminho do manifesto.

---

## Consolidação

Quando todos voltarem, responda **uma vez**, com:

- Tabela: agente · bloqueadores · importantes · polimento.
- Os **bloqueadores** por extenso — é o que impede a entrega.
- Caminho dos relatórios (`docs/review/*.md`).
- Uma pergunta única no fim: o que ajustar.

Não aplique correção nenhuma antes da resposta do usuário.

---

## Exceção

Se o usuário pedir explicitamente uma medição pontual ("roda o lighthouse de
novo", "tira o print da hero"), chame só o `capture-runner`. Não acorde os
analistas para isso.
