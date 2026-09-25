# 04 — Target, população e dados

## Target — checklist

- Horizonte coerente com o prejuízo e com a decisão. FPD captura
  fraude/abuso e primeiro pagamento; Ever90 em 12 MOB captura o risco de
  crédito "clássico".
- Maturação suficiente: use curvas de safra para escolher a janela em que
  a taxa acumulada estabiliza.
- Indeterminados: excluídos no treino, mas incluídos na simulação de
  negócio.
- Consistência dev vs. produção.
- Estabilidade da taxa por safra.
- Volume de eventos por segmento e por variável.
- Cura e redefault, para LGD e collections.

**Se houver ambiguidade:** pare e apresente 2 ou 3 definições com
trade-offs. Teste a correlação entre targets (ex.: FPD30 vs. Ever90@12) e a
ordenação cruzada.

## Leakage — procurar ativamente

- Variáveis pós-evento (status de cobrança, renegociação).
- Agregações cuja janela ultrapassa a data de decisão.
- Imputação ou seleção de variáveis feitas na base inteira antes do split.
- Tuning no OOT.
- Clientes repetidos entre treino e teste.
- Dados de bureau recuperados "hoje" para decisões passadas (look-ahead).
  Exija arquivos históricos point-in-time.
- Decisões humanas posteriores.
- Campos preenchidos só para aprovados.

Documente como cada item foi investigado.

## Por que random split pode enganar em crédito

Há dependência temporal, mudanças de política e macro, maturação
desigual, clientes repetidos e informação que evolui no tempo. O padrão
recomendado (M) é: treino em safras antigas, validação interna, OOT em
safras posteriores e, se possível, backtesting rolling.

## Feature engineering

Sempre pergunte "faz sentido de negócio?". Verifique também
disponibilidade, latência, custo, dependência de terceiros, estabilidade,
risco de proxy discriminatório e monitorabilidade. Não incentive geração
massiva de features sem hipótese.

## Feature selection

Combine vários critérios, nunca uma métrica só:

- IV/univariada.
- Correlação/VIF.
- Estabilidade (CSI por safra).
- Missingness.
- Coerência de sinal/monotonicidade.
- Importância por permutação/SHAP.
- Regularização.
- Custo.
- Risco de leakage.
- Risco de discriminação.

Os cortes de IV citados em livros de scorecard são heurísticas (M), não
regras.
