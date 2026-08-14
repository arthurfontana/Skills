# Diagnóstico de consumo de contexto (repositório existente)

Use quando aparecer qualquer sintoma: boot percebido como caro ("10–20% da janela antes de
qualquer alteração"), `CLAUDE.md` acima do teto ou crescendo a cada épico, compactação de
contexto no meio de tarefas médias, regras invioláveis sendo "esquecidas" depois da
compactação, ou toda tarefa de UI começando com a mesma sequência de Grep+Read no mesmo
arquivo.

## 1. Medir (5 minutos, antes de qualquer proposta)

```bash
wc -l -c CLAUDE.md                                   # índice: linhas e bytes
find . -name "*.md" -path "*doc*" -not -path "*/node_modules/*" -exec wc -l {} + | sort -n | tail -20
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" \) \
  -exec wc -l {} + | sort -n | tail -20                # maiores arquivos de código
ls .claude/skills/ 2>/dev/null                        # skills de projeto já existentes
```

Conversões de bolso: **tokens ≈ bytes ÷ 4**; ~450 linhas de markdown ≈ ~30KB ≈ ~7 mil
tokens. Some o custo fixo: `CLAUDE.md` + descriptions das skills + memória/regras do
harness. Compare com a janela do modelo em uso e expresse em **%** — é o número que
convence.

No Claude Code, `/context` mostra a decomposição real da janela: rode antes e depois para
provar o ganho.

## 2. Classificar o `CLAUDE.md` seção a seção

Passe por cada seção e marque:

| Marca | Critério | Destino |
|---|---|---|
| **FICA** | Toda sessão precisa (stack, comandos, regra inviolável, mapa, exclusões) | `CLAUDE.md` |
| **MOVE-NORM** | Normativo, mas condicional (schema, regra de negócio, UX de um domínio) | doc normativa + 1 linha no mapa |
| **MOVE-IMPL** | Detalhe de implementação condicional (protocolo, estruturas de estado, mapas) | `docs/claude/<Dominio>.md` + 1 linha no mapa |
| **MOVE-SKILL** | Checklist mecânico de domínio onde errar é caro e silencioso | skill de projeto (regra fica; checklist vai) |
| **MORRE** | Changelog, histórico de sessões, feature já descrita na doc | apagar **só** se for cópia literal do que já existe — e diga no PR onde está o original |

Regra dura: nada sai sem lar. "MORRE" só vale para duplicação comprovada.

## 3. Plano por impacto ÷ esforço

```
G1/G2 (re-camadar o índice)  →  maior ganho, 1 sessão
G5.1 (âncoras + mapa)        →  ganho no custo variável, risco ~zero, mesma sessão
G4   (skills de projeto)     →  1 skill por domínio "erro caro", uma por vez
G5.2 (extração incremental)  →  lote a lote, só quando a sessão já for tocar o arquivo
G3   (guard no CI)           →  pequeno, mas é a única regra que faz o ganho durar
```

Se só houver orçamento para duas coisas: **G1 + G3**. Emagrecer sem guard regride.

## 4. Executar como uma sessão de documentação, não de código

- **Zero mudança de comportamento.** Nenhum teste editado, nenhuma função tocada (âncoras
  são comentários; o diff prova que só há linhas `+` nos arquivos de código).
- Rode a suíte completa mesmo assim, e registre o resultado no PR.
- Teste o guard **nos dois sentidos**: verde no tamanho atual e vermelho de verdade acima
  do teto (anexe a saída no PR).
- Registre a adoção como ADR/DEC no catálogo do projeto — inclusive o padrão de âncora
  escolhido.

## 5. Relatório (formato curto que o usuário consegue conferir)

```
Custo fixo antes:  <linhas> linhas / <KB> KB ≈ <tokens> tokens ≈ <%> da janela
Custo fixo depois: <linhas> linhas / <KB> KB ≈ <tokens> tokens ≈ <%> da janela
Movido:   <seção> → <destino>   (uma linha por seção, todas)
Criado:   docs/claude/<...>, .claude/skills/<...>, scripts/check-claude-md.mjs
Âncoras:  <n> em <m> arquivos acima de <teto> linhas (diff só aditivo)
Guard:    <comando> no CI, teto <n> linhas, testado nos dois sentidos
Verificação: <lint/typecheck/testes/build> verdes, sem mudança de comportamento
```

Nenhuma linha de "Movido" pode estar vazia: é ela que prova que nada foi perdido.
