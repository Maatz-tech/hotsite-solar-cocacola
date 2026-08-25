# 12 — Coleta (etapa mecânica)

Este é o **runbook da parte determinística** do review: subir o servidor, tirar
print no Chrome nas duas resoluções, baixar as referências do Figma, rodar a
auditoria de usabilidade e o Lighthouse.

Nada aqui exige julgamento. Por isso roda num **modelo pequeno**
(`capture-runner`, Haiku): é execução de comando e movimentação de arquivo. A
análise — comparar, diagnosticar, priorizar — roda nos modelos completos.

> **Separação que sustenta o custo:** a coleta produz **arquivos**; a análise
> produz **julgamento**. Se a coleta começar a opinar, ela virou análise feita
> pelo modelo errado. Se a análise começar a tirar print, ela está gastando
> modelo caro em trabalho de script.

---

## Entradas

| O quê | Onde |
|---|---|
| Rota a revisar | pedido do usuário, padrão `/` |
| `fileKey` do Figma | `PROJECT.md` → Project meta |
| Nodes por seção | `PROJECT.md` → Inventário de seções |
| `id` das seções na página | descoberto pelo DOM, não pelo PROJECT.md |

## Saídas

Tudo em `docs/review/`, indexado por `coleta.json`:

| Arquivo | O que é |
|---|---|
| `coleta.json` | **Manifesto.** Seções encontradas, artefatos gerados, refs faltando, erros. |
| `cmp-<secao>-<vp>.png` | Painéis Figma \| Projeto \| Diferença |
| `ux-<vp>.json` | Medições de usabilidade |
| `ux-<vp>-full.png` | Página inteira |
| `lighthouse-<preset>-resumo.json` | Scores, métricas, oportunidades |
| `lighthouse-<preset>.json` | Relatório completo |
| `docs/local/<secao>-<vp>.png` | Print do projeto |
| `docs/reference/<secao>-<vp>.png` | Print do Figma |

---

## Procedimento

### 1. Coleta automática

```bash
npm run collect -- --tudo --rota /
```

Escopos: `--ux`, `--perf`, `--cmp`, `--secao <id>`, `--url <url>`.

O que o script faz, em ordem:

1. Sobe `npm run dev` na porta 4321 e espera responder.
2. Enumera as seções pelo DOM: `header`, `footer` e todo
   `main section[id]`. **O id da seção é o nome do artefato** — sem id, sem
   comparativo.
3. Para cada seção, roda `compare-section.mjs` em desktop (1440) e mobile (390).
4. Roda `audit-ux.mjs` nos dois viewports.
5. **Derruba o dev server** e roda `lighthouse.mjs`, que faz o próprio build e
   preview. Medir com o dev server vivo distorce o número — os dois competem por
   CPU.
6. Escreve `coleta.json`.

### 2. Referências do Figma que faltam

O script não fala com o Figma — isso é MCP, e é a única parte da coleta que o
agente faz à mão. Para cada item de `refsFaltando`:

```
get_screenshot(fileKey do PROJECT.md, node da seção no viewport)
  → docs/reference/<id>-<viewport>.png
```

O `id` do arquivo é o **id do DOM**, não o nome bonito da seção no Figma — é
assim que o comparativo encontra o par.

Sem node no PROJECT.md para aquela seção: registrar como pendência. Não chutar
node, não usar o node de outra seção, não pular a pendência em silêncio.

### 3. Refazer o que ganhou referência

```bash
npm run collect -- --cmp --secao <id>
```

### 4. Entregar o manifesto

O relatório da coleta é: caminho do manifesto, contagens, pendências e erros
colados como vieram. Nenhuma interpretação.

---

## Erros previstos

| Sintoma | Causa | O que fazer |
|---|---|---|
| `dev server não subiu em 20s` | porta 4321 ocupada | `pkill -f "astro dev"` e repetir |
| `seletor "#x" não encontrado` | seção sem `id` no HTML | registrar; é achado do design-reviewer |
| comparativo escuro/vazio | reveal não disparou | o script já rola a página; se persistir, é [QA-014](09-qa-erros-comuns.md#qa-014) |
| build falha no Lighthouse | erro de código | colar o erro e parar — corrigir não é da coleta |
| Lighthouse variando ±3 | ruído normal | rodar duas vezes; não é regressão |
