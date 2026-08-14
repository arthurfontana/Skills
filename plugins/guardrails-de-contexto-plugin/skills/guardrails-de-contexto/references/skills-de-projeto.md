# Skills de projeto (G4) — quando criar, como escrever, como validar

> Generalizado de quatro skills de projeto em produção num app de simulação de crédito
> (`base-testes`, `gates-testes`, `persistencia-projeto`, `worker-protocolo`) e do padrão
> de índice em camadas aplicado em dois repositórios. As quatro têm a **mesma anatomia** —
> é essa anatomia que este arquivo destila.

## Por que existem

Uma skill de projeto vive em `.claude/skills/<nome>/SKILL.md` (versionada no repositório,
como o código). No boot da sessão o modelo lê **só a description** (~1 linha de custo); o
corpo carrega **apenas quando a tarefa casa com a description**. É o oposto exato do
`CLAUDE.md`, que é pago inteiro, sempre.

Isso muda a economia de um tipo específico de conteúdo: **o checklist mecânico que só
algumas sessões precisam, mas que, esquecido, causa um bug caro e silencioso.** Antes das
skills, esse conteúdo tinha dois destinos ruins — engordar o `CLAUDE.md` (caro em toda
sessão) ou virar doc de domínio que a sessão só lê se lembrar de ler.

## Teste dos 3 filtros — este domínio merece uma skill?

Crie a skill quando as três respostas forem "sim":

1. **Condicional**: só algumas sessões tocam esse domínio (se toda sessão precisa, é
   `CLAUDE.md`).
2. **Erro caro e silencioso**: esquecer um passo não quebra o build — corrompe dado do
   usuário, muda um número, quebra compatibilidade com arquivo antigo, ou só aparece em
   produção. (Se esquecer só causa teste vermelho imediato, o teste já é o guardrail.)
3. **Mecânico**: existe uma sequência de passos verificável, não uma discussão de design.

Domínios que passaram nos três filtros na prática:

| Domínio | O que a skill impede |
|---|---|
| Persistência do trabalho do usuário | Estado novo que não entra no save/load — o usuário perde o trabalho ao reabrir o arquivo |
| Testes-GATE / fixtures douradas | Regenerar fixture "para o teste passar" e enterrar uma regressão numérica |
| Protocolo de worker/serviço com paridade numérica | Mensagem nova que rota cálculo síncrono para o caminho errado |
| Base/dados de teste gerados | Regenerar artefato versionado sem pedido, ou deixar o gerador fora de sincronia com a app |

Domínios que **não** merecem skill: convenção de estilo (é lint), decisão de arquitetura
(é ADR), qualquer coisa que só algumas sessões precisam mas cujo erro é barato e visível
(é doc de domínio apontada pelo mapa).

## Anatomia (as quatro skills seguem exatamente esta ordem)

1. **`description` que é gatilho, não resumo.** Formato que funciona:
   `Use SEMPRE que <situação a> , <situação b> ou <situação c> — <o que a skill garante /
   o que ela impede>`. Enumere as situações **nas palavras que o usuário usa** e cite os
   nomes reais de arquivos/funções/estados do projeto (`src/App.jsx`,
   `buildProjectPayload()`, `COMPUTE_*`): são eles que aparecem no pedido. Description
   genérica ("ajuda com testes") = skill que nunca dispara.
2. **Regra de ouro logo no topo do corpo** — a frase que, violada, causa o dano, em
   negrito, antes de qualquer detalhe. ("Nenhuma sessão muda a matemática do motor."
   "Quem regenera o CSV é o usuário.")
3. **"Quando esta skill se aplica / não se aplica"** — exemplos concretos do que conta e
   do que é falso-positivo (ex.: estado transitório de UI não é estado persistente).
4. **Checklist numerado e ordenado**, em termos de `arquivo` → `função`, com o default
   defensivo de cada passo. É o corpo da skill; tudo o mais é contexto.
5. **Tabela de referência rápida** quando o domínio tem um inventário que precisa estar à
   mão: arquivo de teste → o que ele trava; mensagem → payload; o que hoje é salvo. A
   tabela também serve de detector: *"se o que você está adicionando não está nesta
   lista, o checklist ainda não foi aplicado"*.
6. **Comandos** exatos (rodar a suíte, regenerar fixture, subir o serviço) — copiáveis,
   sem "adapte ao seu projeto".
7. **"Onde ler mais"** — ponteiro para a doc de domínio e para o `CLAUDE.md`. Fecha o
   circuito: **a skill é a versão acionável de um contrato normativo que mora em outro
   lugar; ela nunca é a fonte da verdade.** Se divergirem, o normativo vence.

Tamanho: corpo ≤ ~150 linhas. Passou disso, o excedente vira arquivo auxiliar na pasta da
skill (`references/`), citado no "Onde ler mais".

## Relação com o `CLAUDE.md` (a parte que se erra com frequência)

- A regra **inviolável** continua no `CLAUDE.md` na íntegra (ela precisa valer mesmo em
  sessão que não carregou a skill). O que migra para a skill é o **checklist mecânico**
  que a implementa.
- O `CLAUDE.md` não ganha uma seção por skill: as descriptions já são carregadas no boot.
  No máximo 1 linha no mapa, quando o domínio também tem doc.
- Duplicação aceitável: a frase da regra de ouro (2–3 linhas, em ambos os lugares).
  Duplicação proibida: o checklist inteiro nos dois — ele passa a divergir na primeira
  mudança.

## Template

````markdown
---
name: <slug-kebab-case>
description: Use SEMPRE que <situação a>, <situação b> ou <situação c> (cite arquivos/
  funções/estados reais do projeto). Garante que <o que fica em sincronia> — senão
  <o dano concreto>.
---

# <Domínio> — <o contrato numa frase>

<2–4 linhas: o que é esse domínio e por que errar aqui é caro.>
Esta skill é a versão acionável do contrato normativo em `<doc de domínio>`.

## Regra de ouro

**<A frase que, violada, causa o dano.>** <1–3 linhas de justificativa concreta.>

## Quando esta skill se aplica

<Lista de exemplos do que conta.> **Não** se aplica a <falso-positivo típico>.

## Checklist (siga nesta ordem)

1. **<Passo>** em `<arquivo>` → `<função>` — <o que fazer, com o default defensivo>.
2. ...

## <Tabela de referência rápida do domínio>

| <Item> | <O que ele trava / o que ele guarda> |
|---|---|

## Comandos

```bash
<comando exato>
```

## Onde ler mais

`<doc de domínio>` tem o detalhe mecânico completo; a regra em si mora em `CLAUDE.md`.
````

## Teste de disparo (obrigatório antes de considerar a skill pronta)

1. Escreva 3 pedidos realistas que **deveriam** carregar a skill e 2 que **não** deveriam
   (vizinhos próximos: mesma área do código, outro domínio).
2. Confira se cada pedido do primeiro grupo contém pelo menos um termo que aparece na
   description — arquivo, função, nome do estado, ou o verbo do usuário.
3. Se um pedido do primeiro grupo não casa, o que falta na description é vocabulário do
   usuário, não mais explicação da skill. Se um do segundo grupo casa, a description está
   larga demais — restrinja pelo artefato (nome de arquivo/função), não por adjetivo.

## Distribuição

- **Skill de projeto** (`.claude/skills/` do repositório): amarrada a nomes de arquivos e
  funções daquele código. É a maioria.
- **Skill de método** (marketplace pessoal, como este plugin): o padrão generalizado, sem
  nome de arquivo do projeto — reutilizável em qualquer repositório.

Quando uma skill de projeto se provar em dois repositórios diferentes, promova o padrão
comum a skill de método e deixe a de projeto só com o que é específico.
