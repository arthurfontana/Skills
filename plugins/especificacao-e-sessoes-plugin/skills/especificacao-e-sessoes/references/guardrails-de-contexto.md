# Guardrails de consumo de contexto — economia de tokens em projetos com IA

> **Versão executável**: a skill `guardrails-de-contexto` (plugin
> `guardrails-de-contexto-plugin` deste mesmo marketplace) é o playbook de execução destas
> regras — bootstrap, diagnóstico/retrofit, manutenção, templates de `CLAUDE.md` e de
> skill de projeto, padrões de âncora e o guard mecânico pronto. Este arquivo é o
> destilado conceitual (G1–G6) que a Fase 2/3 desta skill consome; se os dois divergirem,
> vale a skill executável.
>
> Origem: diagnóstico real (Épico CTX, 07/2026) num projeto onde o `CLAUDE.md` tinha
> ~195KB (~50 mil tokens, ≈25% de uma janela de 200k) e era carregado automaticamente
> em TODA sessão, antes da primeira palavra — o usuário percebia como "leitura do
> repositório", mas era custo fixo de boot. Após aplicar estes guardrails, o custo
> fixo caiu **~92%** (para ~4 mil tokens) sem perder nenhuma informação. Este arquivo
> é o destilado genérico: aplique desde o bootstrap de qualquer projeto novo, e use
> como roteiro de diagnóstico em projeto existente com sintomas (ver §Sintomas).

## O modelo de custo (entenda antes de aplicar)

Todo projeto com IA paga dois custos de contexto distintos:

- **Custo fixo**: o que é injetado no boot de toda sessão — `CLAUDE.md` (inteiro,
  sempre), descriptions de skills, memória. Pago **mesmo em pedidos pontuais de 1
  linha**. É o custo mais caro do projeto porque multiplica por toda sessão futura.
- **Custo variável**: Greps/Reads durante a tarefa. Cresce com arquivos gigantes
  (um monólito maior que a janela obriga a "pescar" trechos às cegas) e com
  exploração não dirigida ("leia o projeto primeiro").

**A nuance que importa**: um `CLAUDE.md` gordo geralmente *funciona* — ele substitui
exploração (o modelo acha tudo sem varrer código). Emagrecê-lo ingenuamente só troca
custo fixo por custo variável. A correção certa é **re-camadar**: índice enxuto
sempre carregado + detalhe por domínio carregado **só quando a tarefa é daquele
domínio**. Nunca apagar informação — sempre mover e deixar ponteiro.

## G1 — CLAUDE.md é um índice enxuto em camadas (teto: ~450 linhas)

O `CLAUDE.md` contém **apenas o que TODA sessão precisa**:

- Stack e comandos de desenvolvimento/verificação.
- Estrutura de arquivos resumida (árvore com 1 comentário por arquivo).
- As 1–3 regras **invioláveis** do projeto, na íntegra (as que, violadas, corrompem
  dados ou perdem trabalho do usuário — ex.: "estado criado pelo usuário PRECISA ser
  salvo").
- Tabela dos testes-GATE (arquivo → o que ele trava), se o projeto tiver.
- O **mapa "onde vive o quê"**: uma linha por domínio funcional apontando o arquivo
  de documentação que o modelo deve ler ANTES de mexer naquele domínio.
- Exclusões de varredura: pastas de artefato de build ("nunca ler/varrer `release/`,
  `dist/`...") — sem isso o modelo queima janela varrendo bundle.

**Regra por feature nova**: documenta no arquivo de domínio; no `CLAUDE.md` entra
**no máximo 1 linha** no mapa de ponteiros. Detalhe de implementação, histórico de
sessões, changelog de épicos — nada disso mora no índice.

## G2 — Duas camadas de documentação, nunca uma terceira cópia

| Camada | Onde | Para quem | Sincroniza com a Wiki? |
|---|---|---|---|
| Normativa/arquitetural | `docs/wiki/*.md` | Humanos + IA (specs, DECs, roadmap — o fluxo desta skill) | ✅ via `sync-wiki.yml` |
| Detalhe de implementação por domínio | `docs/claude/*.md` | A IA, carregado sob demanda via mapa de ponteiros | ❌ (ruído para leitor humano) |

Regras anti-deriva:

1. Se já existe doc normativa equivalente em `docs/wiki/`, o ponteiro do `CLAUDE.md`
   aponta **para ela** — não criar cópia em `docs/claude/`. Duas fontes normativas
   divergem silenciosamente.
2. `docs/claude/` guarda o que só interessa a quem edita código: protocolos de
   mensagem, mapas de região de arquivo, checklists mecânicos, estruturas de estado.
3. Conteúdo é **movido, nunca perdido**: toda seção retirada do índice deixa
   ponteiro de 1 linha para o novo lar.

## G3 — Contrato de manutenção com guard mecânico

Emagrecer uma vez não basta: o índice volta a engordar ~linearmente por épico
entregue (cada sessão tende a colar sua seção de detalhe no `CLAUDE.md`, do jeito
mais rápido). O contrato que evita a regressão:

1. **Nunca apagar para caber.** O teto rege o que fica no índice, não o que existe.
   Informação só sai do `CLAUDE.md` quando já tem lar em camada de domínio com
   ponteiro correspondente.
2. **Poda antes de escrever.** Se a linha nova estouraria o teto, a sessão primeiro
   varre o índice procurando trecho que regrediu de "ponteiro" (1–3 linhas) para
   "detalhe" (parágrafo duplicando doc de domínio), move-o para o lar certo e deixa
   o ponteiro. Só então adiciona a linha nova.
3. **Spillover controlado.** Se a poda não abre espaço (índice genuinamente enxuto),
   a tabela de ponteiros migra para `docs/claude/Onde-Vive-O-Que.md` e o `CLAUDE.md`
   fica com um link único — nunca silencioso.
4. **Guard mecânico, não só disciplina**: script que conta linhas do `CLAUDE.md` e
   falha o CI se passar do teto (~450 linhas ≈ ~30KB ≈ ~7 mil tokens). Pronto em
   `assets/check-claude-md.js` desta skill — copie para `scripts/` do projeto,
   registre como script npm (ou equivalente) e plugue num step do workflow de CI
   existente. Poda/spillover é mudança só de documentação: nunca pula os testes nem
   mexe em código.

## G4 — Skills de projeto: carregamento sob demanda do que é condicional

Uma skill de projeto (`.claude/skills/<nome>/SKILL.md`) custa ~1 linha no boot (só a
description é lida); o corpo carrega **apenas quando a tarefa casa com a description**
— o oposto exato do `CLAUDE.md`.

**Regra de bolso da fronteira**:

- O que **toda** sessão precisa (mapa de arquivos, regras invioláveis, comandos) →
  `CLAUDE.md`.
- O que só **algumas** sessões precisam (checklist de persistência, protocolo de um
  worker, como regenerar fixtures, contrato de uma integração) → skill de projeto ou
  doc de domínio apontada no mapa.

Boas candidatas a skill: os domínios onde **erro é mais caro** (persistência de dados
do usuário, protocolos com paridade numérica, GATEs de teste). A description diz
QUANDO usar ("Use SEMPRE que criar/alterar estado persistente...") — ela é o gatilho
de carregamento; description vaga = skill que nunca dispara. Corpo ≤ ~150 linhas;
checklist longo vai para arquivo auxiliar na pasta da skill.

## G5 — Arquivos gigantes: âncoras primeiro, extração incremental depois

Um arquivo maior que a janela de contexto (monólito) encarece toda tarefa que o
toca. Dois remédios, nesta ordem (reescrita big-bang/OOP **não** é remédio: o custo
de contexto vem de fronteira de arquivo e documentação em camadas, não de paradigma
— e refatoração grande contra testes numéricos é alto risco por ganho ~zero):

1. **Âncoras de navegação** (barato, risco ~zero): comentários padronizados e
   grep-áveis demarcando regiões (`// ═══ REGIÃO: <nome> ═══` — números de linha não
   são estáveis; âncoras são) + um mapa de regiões em `docs/claude/` (região →
   âncora → principais funções/estados). Tarefas de UI passam de Reads às cegas para
   `grep 'REGIÃO: X'` + Read dirigido.
2. **Extração incremental de módulos puros**: só código **elegível** — funções que
   já vivem fora do componente/classe principal, sem closure sobre estado, com teste
   cobrindo. Movimentação **literal** (zero mudança de lógica), um lote coeso por
   sessão, testes passando inalterados ao fim. Candidato com dependência de closure
   fica onde está (parametrizar primeiro é refatoração real — só com justificativa
   própria). Aceite que o monólito tem um **piso**: o que é genuinamente acoplado ao
   estado não sai — e não precisa sair, se as âncoras existem.

## G6 — Higiene de fluxo de trabalho (independe de refatoração)

1. **Pesquisa exploratória via subagent**: "onde/como é feito X" → subagent
   (Explore) que devolve só conclusões com `arquivo:linha`; o contexto queimado é o
   dele, descartável.
2. **Apontar arquivo/função/região no pedido** — os prompts de sessão desta skill já
   fazem isso ("leitura dirigida"); a regra é não regredir em pedidos avulsos.
3. **Sessão nova por tarefa**; sessões longas acumulam Reads mortos. `/context`
   mostra a decomposição real da janela — use para medir antes/depois de aplicar G1.
4. **Nunca pedir "leia o projeto inteiro primeiro"** — com o índice em camadas isso
   é redundante e caro; o mapa de ponteiros resolve.
5. **Modelo por perfil de risco da tarefa** (critério da Fase 3 desta skill) — com
   G1–G4 aplicados, o boot barato devolve aos modelos intermediários a folga de
   janela que o índice gordo comia.

## Sintomas de regressão — quando rodar um diagnóstico

Rode um diagnóstico (medir `wc -c`/`wc -l` do `CLAUDE.md` e dos maiores arquivos;
estimar tokens ≈ bytes ÷ 4; calcular % da janela) quando aparecer qualquer um:

- Percepção de "10–15% da janela consumida antes de qualquer alteração".
- `CLAUDE.md` acima do teto, ou crescendo a cada épico (virou changelog/wiki).
- Compactação de contexto no meio de tarefas médias; regras críticas sendo
  resumidas/perdidas pelo compactador (regressões estranhas em regras invioláveis).
- Toda tarefa de UI começa com uma sequência longa de Grep+Read no mesmo monólito.

O plano de correção segue a ordem de impacto ÷ esforço: **G1/G2 (re-camadar o
índice) → G5.1 (âncoras) → G4 (skills) → G5.2 (extração, lote a lote) → G3 (trava
de processo — a única que faz o ganho durar)**.
