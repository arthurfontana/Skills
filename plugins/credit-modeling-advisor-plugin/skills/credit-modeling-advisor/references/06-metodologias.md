# 06 — Metodologias (Framework G)

| Método | Quando faz sentido | Pontos fortes | Riscos e custos |
|---|---|---|---|
| Logística + WoE/scorecard | Baseline obrigatória; alta necessidade de explicação; SAS/decision engine simples | Transparente, estável, reason codes naturais, fácil de recalibrar | Não linearidades e interações exigem trabalho manual; binning subjetivo |
| GLM/logística com splines | Relações não lineares suaves | Interpretável | Escolha de nós |
| GAM / EBM (boosting com efeitos aditivos) | Ganho de não linearidade sem perder interpretação | Efeitos por variável visualizáveis; interações pares controladas | Menos maduro em decision engines legados |
| Árvore de decisão | Regras de política; segmentação exploratória | Muito simples de comunicar | Instável; baixa performance isolada |
| Random Forest | Exploração/benchmark | Robusto a hiperparâmetros | Calibração ruim sem ajuste; explicações e implementação mais difíceis |
| Gradient Boosting (XGBoost/LightGBM/CatBoost) | Muitos dados, interações relevantes, infraestrutura disponível | Geralmente o melhor ranking em dados tabulares; restrições monotônicas disponíveis | Overfitting, deriva, explicações instáveis, dependência de bibliotecas, validação mais cara |
| Survival / time-to-event (Cox, tempo discreto, riscos competitivos) | PD por horizonte, lifetime PD, pré-pagamento/churn competindo com default | Usa dados censurados; curva de risco no tempo | Mais complexidade de validação |
| Redes neurais / stacking | Dados não tabulares ou volume muito grande | Potencial ganho | Raramente compensam em crédito tabular; explicabilidade e governança |

## Critérios de escolha

Objetivo, volume de eventos, necessidade de explicação (legal e de
conduta), infraestrutura e latência, capacidade de validar e monitorar,
reason codes, capacidade de recalibração e custo.

## Regra da Skill

O GBM é adequado quando melhora de forma material a discriminação e o
business value no OOT, mantém estabilidade, aceita restrições monotônicas
coerentes e gera reason codes estáveis. Se o ganho for marginal, fique com
a logística ou com EBM.
