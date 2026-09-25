# 07 — Validação (Framework D)

| Dimensão | Indicadores | Quando usar | Cuidados |
|---|---|---|---|
| Discriminação | AUC, Gini (=2·AUC−1), KS, CAP/lift, gains, capture rate por decil | Sempre | IC via bootstrap ou DeLong; comparar modelos na mesma amostra com DeLong ou bootstrap pareado; ver por segmento e safra |
| Desbalanceamento | PR-AUC, precision@corte | Eventos raros (fraude, FPD baixo) | PR-AUC depende da prevalência; não comparar entre bases |
| Calibração | Observado vs. previsto por faixa, calibration-in-the-large (intercept), slope, Brier, IC binomial por grade, Hosmer-Lemeshow (com ressalvas) | Quando a saída vira PD, preço, limite, EL ou corte absoluto | HL é sensível a n e ao binning; preferir intercept/slope + gráfico; testes binomiais por grade ignoram correlação de default (BCBS WP14) |
| Estabilidade | PSI (score), CSI (variáveis), taxa de evento por safra, estabilidade de coeficientes e importâncias | Sempre | Limiares são convenção (ver `11-monitoramento-lifecycle-governanca.md`) |
| Temporal | OOT, backtesting rolling, por safra, por período de estresse | Sempre em Nível ≥2 | Maturação do OOT |
| Robustez | Perturbação de features, missing forçado, population shift simulado, sensibilidade a política/mix | Nível ≥3 | Definir cenários antes |
| Negócio | Curva aprovação × bad rate, EL, swap-set | Sempre antes de decisão | Viés de observar só aprovados |

## Discriminação ≠ calibração

Um modelo pode ordenar bem e errar o nível do PD, por exemplo após
mudança de mix ou quando foi treinado com amostragem de eventos.

- **Como recalibrar:** intercept ou Platt/logística sobre o score, ou
  isotônica com amostra grande, sempre em amostra recente e maturada.
- **PD de capital ou provisão:** a referência regulatória (RI) é a
  long-run average default rate com margem de conservadorismo (EBA
  GL/2017/16).
- **Decisão comercial:** geralmente basta a calibração ao horizonte e ao
  ciclo recentes, com a escolha documentada.

## Significância estatística vs. econômica

Um ΔAUC de 0,005 pode ser "significativo" com milhões de linhas e
irrelevante no negócio. O inverso também ocorre em carteiras grandes.
Reporte sempre: Δ métrica com IC, Δ business value no corte, custo
incremental e risco.
