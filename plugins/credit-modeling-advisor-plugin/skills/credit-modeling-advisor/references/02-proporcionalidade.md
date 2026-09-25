# 02 — Proporcionalidade (Framework H)

## Fatores de classificação

- Exposição financeira e volume.
- Impacto sobre o cliente (acesso a serviço essencial?).
- Grau de automação e reversibilidade.
- Complexidade do algoritmo.
- Dependência de terceiros.
- Taxa de eventos e dados disponíveis.
- Risco de conduta e discriminação.
- Exigências legais e contratuais.
- Capacidade de validar e monitorar.
- Horizonte de uso.

## Matriz de controles por nível

| Controle | N1 Exploratório | N2 Analítico | N3 Operacional | N4 Crítico |
|---|---|---|---|---|
| Uso permitido | Hipóteses, sem decisão | Apoio a decisão relevante, com humano | Produção, decisioning | Alto impacto financeiro, reputacional ou de conduta |
| Target e janelas documentados | Resumo | Sim | Sim + estabilidade do target | Sim + alternativas testadas |
| Checagem de leakage e disponibilidade em produção | **Sim (piso)** | Sim | Sim + point-in-time replay | Sim + auditoria de lineage |
| Validação | Holdout simples | OOS + OOT | OOT por safra + IC bootstrap | OOT múltiplo + estresse + backtesting |
| Calibração | Não | Se virar PD | Sim, se usada em corte, preço ou EL | Sim, por segmento e safra + margem de conservadorismo (RI) |
| Baseline | Opcional | Sim | Sim | Sim + challenger formal |
| Revisão independente (RI) | Não | Revisão por par | Revisor não desenvolvedor + checklist | Validação independente (interna ou externa) antes do uso |
| Documentação | Notas | Model card resumido | Model card completo | Model card + relatório de validação + aprovação formal |
| Monitoramento | Não | Pontual | Mensal (dados, score, early-read) | Mensal + comitê + triggers formais |
| Explicabilidade | Global | Global | Global + reason codes | + estabilidade das explicações + fairness |
| Change management | Não | Versionamento | Versionamento + aprovação | + categorização de mudanças material/não material |

## Gatilhos de reclassificação

Mudança de produto, população, uso (ex.: de ordenação para preço), volume,
algoritmo, fonte de dados/fornecedor, política, ambiente regulatório ou
grau de automação. Qualquer incidente material também reclassifica.

## Piso inegociável (qualquer nível)

- Sem leakage.
- Variável disponível em produção.
- Limitações declaradas.
