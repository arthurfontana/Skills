# 05 — Segmentação (Framework F)

**Hipótese nula da Skill:** modelo único, com variáveis de segmento e
interações. Segmentar exige evidência.

## Razões para segmentar

- Relações variável-default diferentes.
- Disponibilidade de informação distinta (thin file vs. com histórico).
- Produtos ou jornadas distintos.
- Calibração muito diferente.
- Políticas e economics distintos.

## Razões para não segmentar

- Poucos eventos.
- Instabilidade.
- Ganho marginal.
- Custo de manutenção e monitoramento.
- Risco de fragmentação e inconsistência entre segmentos.

## Protocolo de comparação

1. Treinar o modelo único e os segmentados nas mesmas condições.
2. Comparar no OOT, por segmento: Gini/KS com IC bootstrap, calibração,
   PSI, estabilidade temporal e monotonicidade.
3. Medir o ganho agregado e o ganho por segmento em business value, com o
   mesmo corte de aprovação.
4. Pesar complexidade, número de eventos por segmento e governança.
5. Decidir e registrar.

## Alternativas intermediárias

Modelo único com recalibração por segmento, modelo hierárquico, ou GBM com
a variável de segmento.
