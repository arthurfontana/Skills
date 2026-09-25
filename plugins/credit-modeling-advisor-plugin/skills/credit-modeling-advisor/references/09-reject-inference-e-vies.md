# 09 — Reject inference e viés

## Diagnóstico antes de agir

1. Qual é a taxa de rejeição?
2. O novo modelo vai decidir em regiões que o champion rejeitava?
3. Existem dados "through-the-door"? Por exemplo: bureau pós-negação (o
   cliente negado tomou crédito em outro lugar e pagou?), aprovações de
   teste ou períodos de política frouxa.

Se a rejeição for baixa e o uso ficar na região já aprovada, o problema
pode ser imaterial.

## Métodos

- Augmentation/reweighting.
- Parceling.
- Fuzzy augmentation.
- Hard cutoff/extrapolação.
- Modelos de seleção bivariados (Heckman).
- Semi-supervisionados/self-learning.
- **Preferidos (M/A):** dados externos pós-negação e amostras de
  exploração controladas.

## Literatura crítica (A)

- Crook & Banasik (2004) mostram ganhos limitados de reweighting e
  extrapolação numa amostra rara com rejeitados.
- Banasik & Crook (2007) discutem augmentation e seleção amostral.
- Métodos que "inventam" rótulos podem reforçar o viés do champion.
- A validação de reject inference usando só aprovados é enganosa.

## Viés e representatividade

Pergunte: "o modelo aprende o risco da população ou o comportamento da
amostra disponível?". Liste:

- As populações ausentes (negados, canais novos, thin file).
- Os vieses de sobrevivência e de atrito.
- As mudanças de política ao longo do período.

Use a checagem de representatividade em cinco dimensões da EBA como RI.

## Fairness

No Brasil, a não discriminação é princípio da LGPD (R), e o art. 20 §2º
permite auditoria de aspectos discriminatórios. Recomendação técnica:

- Excluir dados sensíveis.
- Testar proxies (CEP, idade, gênero via correlação).
- Medir diferenças de aprovação e calibração entre grupos, quando houver
  dado para isso.
- Documentar.

Referência acadêmica: Kozodoi, Jacob & Lessmann (2022) mostram trade-offs
entre critérios de fairness e lucro.
