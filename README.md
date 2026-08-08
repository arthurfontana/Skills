# Skills

Marketplace pessoal de plugins/skills do Claude Code.

## Uso

```
/plugin marketplace add arthurfontana/Skills
/plugin install especificacao-e-sessoes-plugin@arthurfontana-skills
```

## Plugins

| Plugin | Skill | Descrição |
|---|---|---|
| [`especificacao-e-sessoes-plugin`](plugins/especificacao-e-sessoes-plugin) | `especificacao-e-sessoes` | Fluxo padrão de especificação, documentação viva e planejamento de desenvolvimento por sessões incrementais de IA. |

## Adicionar uma nova skill

1. Crie `plugins/<nome>-plugin/.claude-plugin/plugin.json` e `plugins/<nome>-plugin/skills/<nome>/SKILL.md` (com `references/`/`assets/` se necessário).
2. Registre o plugin em `.claude-plugin/marketplace.json`.
3. Atualize a tabela acima.
