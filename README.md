# Skills

Marketplace pessoal de plugins/skills do Claude Code.

## Uso

```
/plugin marketplace add arthurfontana/Skills
/plugin install especificacao-e-sessoes-plugin@arthurfontana-skills
/plugin install guardrails-de-contexto-plugin@arthurfontana-skills
```

## Plugins

| Plugin | Skill | Descrição |
|---|---|---|
| [`especificacao-e-sessoes-plugin`](plugins/especificacao-e-sessoes-plugin) | `especificacao-e-sessoes` | Fluxo padrão de especificação, documentação viva e planejamento de desenvolvimento por sessões incrementais de IA, com guardrails de consumo de contexto (CLAUDE.md em camadas, skills de projeto, guard mecânico de tamanho). |
| [`guardrails-de-contexto-plugin`](plugins/guardrails-de-contexto-plugin) | `guardrails-de-contexto` | Playbook executável para instalar, auditar e manter os guardrails de consumo de contexto de um repositório: CLAUDE.md como índice em camadas, documentação em camadas, skills de projeto (`.claude/skills/`), guard mecânico de tamanho no CI e âncoras de região em arquivos gigantes. |

## Adicionar uma nova skill

1. Crie `plugins/<nome>-plugin/.claude-plugin/plugin.json` e `plugins/<nome>-plugin/skills/<nome>/SKILL.md` (com `references/`/`assets/` se necessário).
2. Registre o plugin em `.claude-plugin/marketplace.json`.
3. Atualize a tabela acima.
