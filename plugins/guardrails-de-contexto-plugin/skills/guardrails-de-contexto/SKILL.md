---
name: guardrails-de-contexto
description: >-
  Playbook executável para instalar, auditar e manter os guardrails de consumo de contexto
  de um repositório trabalhado com IA. Use SEMPRE que: o boot das sessões estiver caro
  (CLAUDE.md gigante, "10–20% da janela antes da primeira palavra", compactação no meio de
  tarefas médias); for preciso criar ou emagrecer um CLAUDE.md; estruturar documentação em
  camadas (índice + docs/claude/ + normativa); criar uma skill de projeto
  (.claude/skills/) para um domínio onde errar é caro; instalar o guard mecânico de
  tamanho no CI; ou navegar/anotar um arquivo monólito com âncoras de região. Também
  dispara em "guardrails de contexto", "consumo de contexto", "economia de tokens",
  "CLAUDE.md em camadas", "skill de projeto", "âncora de região", "onde vive o quê" —
  e ao fazer o bootstrap de um repositório novo, antes que ele engorde.
---

# Guardrails de contexto — playbook executável

Um repositório trabalhado com IA paga dois custos de contexto:

- **Custo fixo (boot)**: `CLAUDE.md` inteiro + descriptions das skills, injetado em TODA
  sessão, antes da primeira palavra — pago até num pedido de 1 linha. É o custo que
  multiplica por toda sessão futura.
- **Custo variável (tarefa)**: Greps/Reads durante o trabalho. Cresce com arquivos
  gigantes e com exploração não dirigida ("leia o projeto primeiro").

**A nuance que comanda tudo**: um `CLAUDE.md` gordo geralmente *funciona* — ele substitui
exploração. Emagrecê-lo ingenuamente só troca custo fixo por custo variável. A correção
certa é **re-camadar**: índice enxuto sempre carregado + detalhe carregado só quando a
tarefa é daquele domínio. **Conteúdo é movido, nunca apagado.**

Origem: diagnóstico real que cortou ~92% do custo de boot (`CLAUDE.md` de ~195KB → ~4 mil
tokens) e a sessão de retrofit que aplicou o mesmo padrão num segundo repositório
(reescrita do índice + `docs/claude/` + guard no CI + 126 âncoras em 17 arquivos, zero
mudança de comportamento).

## A regra de roteamento (decida antes de escrever qualquer linha)

Antes de documentar qualquer coisa, responda **"quantas sessões precisam disto?"**:

| Quem precisa | Onde mora | Custo de boot |
|---|---|---|
| **Toda** sessão (stack, comandos, 1–3 regras invioláveis, mapa de ponteiros, exclusões de varredura) | `CLAUDE.md` | pago sempre |
| **Algumas** sessões, e errar sai caro/silencioso (persistência de dados do usuário, protocolo com paridade numérica, GATEs de teste, geração de dados) | skill de projeto `.claude/skills/<nome>/SKILL.md` | ~1 linha (só a description) |
| **Algumas** sessões, conteúdo normativo (schema, regra de negócio, UX, ADR) | doc normativa (`docs/wiki/` ou `docs/NN-*.md`), apontada pelo mapa | zero até ser lida |
| **Algumas** sessões, só detalhe de implementação (protocolo de mensagens, mapa de regiões, convenções mecânicas) | `docs/claude/<Dominio>.md`, apontada pelo mapa | zero até ser lida |
| Navegação dentro de arquivo grande | âncora `// #region: <slug>` no próprio código + mapa em `docs/claude/` | zero (é `grep`) |

Feature nova custa **1 linha** no mapa "Onde vive o quê" do `CLAUDE.md` — nunca um
parágrafo. Se a linha nova estoura o teto, **poda antes de escrever** (§ Playbook C).

## As 6 regras

- **G1 — `CLAUDE.md` é índice enxuto em camadas** (teto ~450 linhas ≈ ~7 mil tokens): o
  que o produto é em 3 linhas, comandos, regras invioláveis na íntegra, estrutura
  resumida, tabela "Onde vive o quê" (1 linha por domínio → doc + diretório de código) e
  exclusões de varredura (`dist/`, `release/`, bundles). Esqueleto:
  `references/template-claude-md.md`.
- **G2 — Duas camadas de doc, nunca uma terceira cópia**: normativa (o que o sistema é e
  por quê) e `docs/claude/` (detalhe de implementação). Se já existe doc normativa
  equivalente, o ponteiro aponta **para ela** — duas fontes normativas divergem em
  silêncio.
- **G3 — Contrato de manutenção com guard mecânico**: nunca apagar para caber; poda antes
  de escrever; spillover controlado; script de teto plugado no CI
  (`assets/check-claude-md.mjs`).
- **G4 — Skills de projeto para o que é condicional**: description = gatilho, corpo =
  checklist acionável, carregado sob demanda. Anatomia, template e teste de disparo:
  `references/skills-de-projeto.md`.
- **G5 — Arquivo gigante: âncoras primeiro, extração incremental depois**. Reescrita
  big-bang nunca. Padrões e mapa: `references/ancoras-de-regiao.md`.
- **G6 — Higiene de fluxo**: pesquisa exploratória ("onde é feito X?") via subagent de
  busca, que queima contexto descartável; pedidos apontando arquivo/função/região; sessão
  nova por tarefa; nunca "leia o projeto inteiro primeiro".

## Playbook A — repositório novo (bootstrap)

Nascer em camadas é muito mais barato que emagrecer depois.

1. `CLAUDE.md` já como índice (G1), a partir de `references/template-claude-md.md` — com o
   mapa "Onde vive o quê" mesmo que comece com 3 linhas.
2. Guard mecânico (G3) no primeiro dia: copie `assets/check-claude-md.mjs` para
   `scripts/`, registre `check:claude-md` no `package.json` (ou equivalente) e plugue num
   step do CI existente.
3. `docs/claude/` **só quando houver o primeiro conteúdo real** — pasta vazia com README
   é ruído.
4. Skill de projeto (G4) no momento em que aparecer o primeiro domínio "erro caro" — não
   antes, e nunca como cópia do que já está no `CLAUDE.md`.

## Playbook B — repositório existente (diagnóstico e retrofit)

Sintomas que disparam: boot percebido como caro; `CLAUDE.md` acima do teto ou crescendo a
cada épico (virou changelog); compactação de contexto no meio de tarefas médias; regras
invioláveis sendo "esquecidas"; toda tarefa começando com uma sequência longa de
Grep+Read no mesmo arquivo.

Roteiro completo (comandos de medição, formato do relatório, ordem de execução):
`references/playbook-diagnostico.md`. Em resumo, a ordem é por impacto ÷ esforço:

```
G1/G2 (re-camadar o índice) → G5.1 (âncoras) → G4 (skills) → G5.2 (extração, lote a lote)
→ G3 (guard no CI — a única que faz o ganho durar)
```

Trate o retrofit como **uma sessão só, sem mudança de comportamento**: o diff prova que
todo trecho retirado do índice tem destino (movido, não apagado), as âncoras são
puramente aditivas (só linhas `+`), e a suíte de testes existente fecha verde sem
alteração. Teste o guard **nos dois sentidos** (verde no tamanho atual, vermelho de
verdade acima do teto) e registre isso no PR.

## Playbook C — manutenção (toda sessão, para sempre)

O ganho regride ~linearmente por épico se o contrato não for explícito. Em toda sessão que
entrega feature:

1. O detalhe vai para a doc de domínio ou para a skill de projeto; no `CLAUDE.md` entra
   **no máximo 1 linha** de ponteiro.
2. Estourou o teto? **Poda antes de escrever**: varra o índice atrás de um trecho que
   regrediu de "ponteiro" (1–3 linhas) para "detalhe" (parágrafo duplicando doc de
   domínio), mova-o para o lar certo, deixe o ponteiro — e só então adicione a linha nova.
3. Poda não abriu espaço (índice genuinamente enxuto)? **Spillover controlado**: a tabela
   de ponteiros migra para `docs/claude/Onde-Vive-O-Que.md` com 1 link no índice — nunca
   em silêncio.
4. Domínio que já custou um bug caro por esquecimento de passo mecânico? Promova a
   checklist a skill de projeto (G4) e reduza o `CLAUDE.md` ao ponteiro.
5. Registre a adoção dos guardrails como decisão de arquitetura (ADR/DEC) no catálogo do
   projeto — assim a regra sobrevive à troca de quem executa.

## Critérios de aceite de uma sessão de guardrails

- `CLAUDE.md` dentro do teto, com o mapa cobrindo **todos** os domínios do projeto.
- Nenhuma informação sumiu: cada trecho retirado tem destino apontado (o diff prova).
- Guard mecânico rodando no CI e testado nos dois sentidos.
- Nenhuma mudança de comportamento: suíte existente verde, sem testes editados.
- Skills de projeto criadas disparam de verdade (teste de disparo em
  `references/skills-de-projeto.md`).

## Armadilhas (todas já observadas na prática)

- **Apagar para caber.** O teto rege o que fica no índice, não o que existe. Sem lar novo,
  o conteúdo não sai.
- **`docs/claude/` duplicando a doc normativa.** Vira segunda fonte da verdade e diverge
  em silêncio. Ponteiro, não cópia — a skill/`docs/claude` é a versão *acionável* de um
  contrato que mora em outro lugar; se divergirem, o normativo vence.
- **Description vaga na skill de projeto** ("ajuda com testes") = skill que nunca carrega.
  A description diz **quando** usar, nas palavras que o usuário usa.
- **Refatorar o monólito para "resolver contexto".** O custo vem de fronteira de arquivo e
  documentação em camadas, não de paradigma; reescrita grande contra testes numéricos é
  risco alto por ganho ~zero.
- **Mapa de regiões mantido linha a linha à mão.** Números de linha deslocam; o contrato é
  o `grep` da âncora. O mapa orienta por arquivo + slug.
- **Emagrecer sem guard.** Sem trava mecânica, o índice volta ao tamanho original em
  poucos épicos.

## Recursos desta skill

| Arquivo | Quando usar |
|---|---|
| `references/template-claude-md.md` | Ao criar ou reescrever um `CLAUDE.md` como índice em camadas |
| `references/skills-de-projeto.md` | Ao decidir se um domínio merece skill de projeto e ao escrevê-la (anatomia, template, teste de disparo) |
| `references/ancoras-de-regiao.md` | Ao anotar arquivo grande com âncoras e montar o mapa de regiões |
| `references/playbook-diagnostico.md` | Ao diagnosticar consumo de contexto em repositório existente (medição, relatório, plano) |
| `assets/check-claude-md.mjs` | Copiar para `scripts/` do projeto — guard mecânico do teto, plugar no CI |

Fluxo de especificação/sessões que consome estes guardrails (documentação viva, prompts de
sessão, escolha de modelo): skill `especificacao-e-sessoes`.
