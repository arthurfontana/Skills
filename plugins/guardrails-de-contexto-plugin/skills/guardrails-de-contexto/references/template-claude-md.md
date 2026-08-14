# Esqueleto de `CLAUDE.md` como índice em camadas (G1)

Copie a estrutura abaixo e preencha. Regra de leitura ao preencher: **cada bloco só existe
se TODA sessão precisar dele**. Qualquer coisa que só algumas sessões precisam vira
ponteiro na tabela "Onde vive o quê" (ou skill de projeto).

Teto: ~450 linhas (≈ ~7 mil tokens). Instale o guard (`assets/check-claude-md.mjs`) junto
com o arquivo, não depois.

---

````markdown
# CLAUDE.md

<3–5 linhas: o que o produto é, a restrição que comanda a arquitetura (offline, sem banco,
single-file, latência...) e onde está a doc normativa. Se o produto é entregue por sessões
incrementais, diga onde vive o roadmap e os prompts.>

## Documentação em camadas — como usar este repositório

Este `CLAUDE.md` é um **índice enxuto**, carregado inteiro em toda sessão. Ele NÃO contém
o detalhe de cada domínio — isso vive em `<doc normativa>` (o que o sistema é e por quê) e
em `docs/claude/*.md` (detalhe de implementação, sob demanda). **Antes de mexer em
qualquer domínio, leia o ponteiro da tabela "Onde vive o quê"** — não peça para "ler o
projeto inteiro primeiro". Pesquisa exploratória grande vale mais delegada a um subagent
de busca do que a Reads amplos nesta sessão.

**Regra de tamanho**: feature nova documenta na camada certa; aqui entra **no máximo 1
linha** no mapa de ponteiros. Teto de ~450 linhas, checado por `<comando do guard>` no CI.
Estourou? Pode primeiro uma seção que regrediu de ponteiro para detalhe (move e deixa o
ponteiro) — **nunca apague informação para caber**. Índice já enxuto? Spillover da tabela
para `docs/claude/Onde-Vive-O-Que.md`, com 1 link aqui.

## Comandos

```bash
<dev / build / lint / typecheck / testes / guards — um comentário por linha>
```

## Regras invioláveis

<As 1–5 regras que, violadas, corrompem dados, perdem trabalho do usuário ou quebram a
restrição de arquitetura. Na íntegra, aqui — não são ponteiro. Se houver uma checklist
mecânica por trás de alguma, a checklist vira skill de projeto e aqui fica a regra.>

## Estrutura de pastas (resumida)

```
<árvore com 1 comentário por diretório/arquivo relevante>
```

<Exclusões de varredura: "`release/`/`dist/` é artefato de build — nunca ler/varrer,
exceto <exceção>".>

## Onde vive o quê (leia antes de mexer no domínio)

| Domínio | Doc | Código |
|---|---|---|
| <um domínio funcional por linha> | `<doc normativa ou docs/claude/*>` | `<diretório/arquivo>` |

<1 linha para o mapa de âncoras de região, com o comando de grep.>

## Decisões arquiteturais (resumo — catálogo completo em `<doc de decisões>`)

| ADR | Decisão | Justificativa |
|---|---|---|
| ADR-001 | <uma linha> | <uma linha> |
````

---

## Blocos opcionais (só se o projeto tiver)

- **Tabela de GATEs de teste** (arquivo de teste → o que ele trava): vale o espaço quando
  o projeto tem provas de equivalência numérica; caso contrário, ponteiro.
- **Padrão de código repetido em toda sessão** (ex.: "todo estado crítico tem um ref
  espelho"): 3–6 linhas, porque toda sessão que edita a UI precisa.
- **Convenção de UI/UX transversal**: idem, se toda tela nova precisa aplicar.
- **Branch de trabalho atual**: 1 linha.

## O que NUNCA entra

Changelog de épicos · histórico de sessões · detalhe de payload/protocolo · tabelas de
schema · descrição de feature · qualquer parágrafo que duplique doc de domínio · lista de
tudo o que já foi entregue.
