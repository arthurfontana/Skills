# 03 — Ciclo e gates (Framework C)

Para cada estágio: objetivo | perguntas críticas | saídas | gate de avanço.

- **0 Business Understanding.**
  - Objetivo: qual decisão melhorar, custo de aprovar mal vs. negar bem,
    assimetria FP/FN, apetite de risco.
  - Gate: decisão e métrica de sucesso de negócio definidas.
- **1 Risk Definition.**
  - Objetivo: evento de risco (default, FPD, Ever60/90, 30+/60+/90+ em
    MOB x), cura, redefault, indeterminados.
  - Gate: definição justificada pela decisão e pelo prejuízo econômico.
- **2 Regulatory Context & Proportionality.**
  - Gate: matriz R/RI preenchida e nível atribuído.
- **3 Population & Target.**
  - Objetivo: elegíveis, aprovados, negados, canais, produtos, períodos;
    janelas de observação e performance; maturação; censura.
  - Gate: "Essa população representa aquela em que o modelo será usado?"
    respondida, com vieses listados.
- **4 Data Assessment.**
  - Objetivo: lineage, qualidade, missing (distinguir ausência, zero,
    desconhecido, não aplicável, erro, atraso), MNAR, freshness, mudanças
    de sistema/fornecedor.
  - Gate: toda variável candidata existe point-in-time na data da decisão.
- **5 Segmentation Assessment.**
  - Gate: evidência comparativa único vs. segmentado (ver `05-segmentacao.md`).
- **6 Baseline Model.**
  - Gate: baseline treinada nas mesmas condições e documentada.
- **7 Candidate Models.**
  - Gate: candidatos com ganho medido contra a baseline.
- **8 Challenger Models.**
  - Gate: matriz de comparação preenchida (ver `08-champion-challenger.md`).
- **9 Validation.**
  - Gate: discriminação, estabilidade e robustez aceitas segundo critérios
    definidos antes.
- **10 Calibration.**
  - Gate: se o uso exige probabilidade, calibração-in-the-large e slope
    aceitos por segmento e safra.
- **11 Business Impact.**
  - Gate: estratégia (cortes, swap-set, EL) simulada, com o tipo de
    impacto rotulado.
- **12 Implementation.**
  - Objetivo: paridade de scoring dev vs. produção (replay), latência,
    fallback para missing/timeout, reason codes.
  - Gate: teste de paridade aprovado.
- **13 Monitoring.**
  - Gate: plano com responsáveis, frequência e thresholds-hipótese.
- **14 Governance.**
  - Gate: inventário, aprovação, Decision Log.
- **15 Redevelopment/Retirement.**
  - Gate: triggers definidos.
