# Instruções do projeto

Este projeto segue o playbook em [`playbook/`](playbook/). **Ler
[`playbook/README.md`](playbook/README.md) antes de qualquer tarefa** — em
especial a tabela "Modos de trabalho", que define quanto processo rodar para o
tamanho da mudança.

Atalhos:

- Ajuste pequeno → Edit direto, sem screenshot/build/Figma. Resposta em 1–3 frases.
- Seção nova → loop completo de [`playbook/04-loop-de-secoes.md`](playbook/04-loop-de-secoes.md).
- Qualquer animação → [`playbook/05-animacao.md`](playbook/05-animacao.md) e `src/lib/motion.ts`.
- Antes de fechar seção → [`playbook/09-qa-erros-comuns.md`](playbook/09-qa-erros-comuns.md).
- Bug novo pego em QA → registrar como nova entrada `QA-XXX` na mesma sessão.
- Revisão → `/review [ux|design|perf|tudo]`. Roda em duas fases: `capture-runner`
  (Haiku) coleta prints, auditoria e Lighthouse; `design-reviewer`,
  `website-reviewer` e `performance-reviewer` (Opus) analisam o que ele produziu.
  Ver [`playbook/11-review.md`](playbook/11-review.md) e [`playbook/12-coleta.md`](playbook/12-coleta.md).
- Trabalho mecânico (print, build, medição) vai para o modelo pequeno; análise e
  comparação ficam nos modelos completos. Não inverter.
- Nenhum revisor altera código sem o usuário pedir, e nenhum altera o que o Figma
  documenta.

Contexto do projeto atual: [`PROJECT.md`](PROJECT.md).
