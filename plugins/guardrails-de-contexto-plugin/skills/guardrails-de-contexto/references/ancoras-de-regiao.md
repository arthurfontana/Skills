# Âncoras de região e arquivos gigantes (G5)

Um arquivo maior que a janela de contexto encarece **toda** tarefa que o toca: o modelo
"pesca" trechos às cegas com Grep+Read repetidos. Dois remédios, nesta ordem.

## Por que não refatorar primeiro

Reescrita big-bang (quebrar o monólito em módulos/classes de uma vez) **não** é remédio de
contexto: o custo vem de fronteira de arquivo e de documentação em camadas, não de
paradigma. Refatoração grande contra testes numéricos é risco alto por ganho ~zero em
tokens. Âncora custa um comentário e resolve a navegação; extração vem depois, por lote,
quando uma sessão já for tocar o arquivo por outro motivo.

## Passo 1 — âncoras (barato, risco ~zero)

Comentário de linha padronizado e grep-ável, no início de cada seção lógica:

```
// #region: <slug-em-kebab-case>
```

Contrato:

- **Sem par de fechamento** (`#endregion`). O objetivo é `grep`, não dobrar/expandir no
  editor — e fechamento é mais uma coisa para deriva de manutenção.
- O slug deriva do **título que a seção já tem** no arquivo (muitos monólitos já têm
  blocos divisores em comentário). Onde não há título, ancore antes do início da função ou
  bloco lógico (helpers, componente principal, handlers, render).
- **Puramente aditivo**: nenhum código movido, renomeado ou reformatado na mesma sessão.
  O diff tem que ser só linhas `+` — isso é verificável e deve constar do PR.
- Quem faz o corte de quais arquivos anotar: um teto de tamanho (ex.: `src/` acima de ~600
  linhas), não gosto pessoal.

Variantes válidas de sintaxe — escolha **uma** por repositório e documente:

| Padrão | Bom para |
|---|---|
| `// #region: <slug>` | Muitos arquivos grandes; casa com dobra nativa de editores |
| `// ═══ REGIÃO: <Nome> ═══` | Um único monólito muito grande, onde a âncora também serve de separador visual |

Descoberta a qualquer momento:

```bash
grep -rn "// #region:" src/          # todas as âncoras, com arquivo e linha atual
grep -n  "// #region: i" src/core/document/validate.ts   # isola uma família de seções
```

## Passo 2 — mapa de regiões em `docs/claude/`

Um arquivo (`docs/claude/Mapa-de-regioes.md`) com uma seção por arquivo anotado e a lista
de âncoras. Regras que evitam que o mapa vire manutenção morta:

- O mapa orienta por **arquivo + slug**, não por número de linha. Se listar linhas, diga
  explicitamente que são a posição no momento em que foi escrito e que o `grep` é a fonte
  da verdade. **Nenhuma sessão precisa sincronizar o mapa linha a linha.**
- Quando um arquivo tem dezenas de âncoras homogêneas (uma por invariante, uma por
  mensagem de protocolo), não liste todas: registre o padrão do slug e o comando de `grep`
  que as isola.
- O mapa é **índice de navegação**, não documentação de domínio. O que a região faz mora
  na doc de domínio apontada pelo mapa "Onde vive o quê".

## Passo 3 — extração incremental (só depois, e só do que é elegível)

Elegível: função que já vive fora do componente/classe principal, sem closure sobre
estado, com teste cobrindo. Regras:

- Movimentação **literal** — zero mudança de lógica no mesmo commit.
- Um lote coeso por sessão; testes existentes passam **inalterados** ao fim.
- Candidato com dependência de closure fica onde está (parametrizar é refatoração real,
  precisa de justificativa própria).
- Aceite que o monólito tem um **piso**: o que é genuinamente acoplado ao estado não sai —
  e não precisa sair, se as âncoras existem.

## Registre como decisão

Padrão de âncora escolhido, teto de tamanho e a política de "âncora agora, extração
quando a sessão já for tocar o arquivo" viram uma linha no catálogo de decisões (ADR/DEC)
do projeto. Sem isso, a próxima sessão inventa um segundo padrão e o `grep` deixa de
achar tudo.
