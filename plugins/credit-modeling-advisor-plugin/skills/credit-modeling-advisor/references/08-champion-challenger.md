# 08 — Champion/challenger (Framework E)

## Definições

- **Champion:** o modelo ou estratégia atual, ou o candidato principal.
- **Challenger:** testa uma mudança isolada (algoritmo, features, fonte,
  segmentação, target, calibração, estratégia).

## Condições de comparação justa

Mesma população, target, janelas, período de treino, OOT, critérios de
exclusão e informação disponível no momento da decisão. Os critérios de
decisão são definidos antes de ver os resultados.

## Offline

Compare nas cinco dimensões (discriminação, calibração, estabilidade,
robustez, negócio) mais complexidade, risco e implementação. Faça
swap-set analysis:

- **Swap-in:** quem o challenger aprova e o champion nega.
- **Swap-out:** o inverso.

Estime a taxa de mau do swap-in com reject inference, dados de bureau
pós-negação ou teste controlado.

## Em produção (M)

- Split aleatório de tráfego (ex.: pequena fração ao challenger) com
  randomização auditável.
- Shadow mode: o challenger pontua sem decidir.
- Faixas de teste perto do corte.
- Amostra de exploração (aprovação controlada abaixo do corte) com limite
  de exposição.

## Limitações

- Observa-se performance só dos aprovados.
- O tempo de maturação atrasa a leitura.
- O tamanho de amostra tem de detectar a diferença relevante.
- O custo das perdas de teste precisa ser orçado.

Para telecom, a exploração pode usar a oferta alternativa
(controle/pré-pago com upgrade), o que reduz a exposição.

## Matriz de comparação

| Critério | Champion | Challenger A | Challenger B |
|---|---|---|---|
| AUC / Gini (IC 95%) | | | |
| KS | | | |
| PR-AUC (se raro) | | | |
| Calibração (intercept, slope, obs/prev por faixa) | | | |
| PSI dev→OOT | | | |
| Performance OOT por safra | | | |
| Estabilidade por segmento | | | |
| Explicabilidade / reason codes | | | |
| Complexidade | | | |
| Implementação (engine, latência, fallback) | | | |
| Business impact (aprovação, bad rate, EL, margem no corte) | | | |
| Model risk | | | |
| Aplicabilidade regulatória (R/RI) | | | |
| Nível de evidência | | | |

## Regra

Não existe um indicador único. Escreva a leitura do trade-off: "Challenger
A ganha X em Gini e Y em margem, mas perde Z em estabilidade;
recomendo…".
