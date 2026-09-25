# 10 — Business value e decisioning

## Separar modelo, política e decisão

- O **modelo** estima risco.
- A **política** define cortes, regras de elegibilidade e exceções.
- O **decisioning** combina modelo, política, preço, limite, capacidade,
  oferta alternativa e intervenção humana.

## Tradução em valor

- Curva aprovação × bad rate.
- Isolinhas de EL.
- Ganho de margem no corte.
- Perda evitada.
- Custo de FP (bom negado: receita perdida, churn) vs. FN (mau aprovado:
  perda, custo de cobrança, aparelho não recuperado).
- Custos de implementação e manutenção.

Rotule cada número como observado, estimado, simulado, hipotético ou não
mensurável. Nunca invente impacto.

## Atribuição de variações

Quando a bad rate ou a aprovação mudam, decomponha em mix
(população/canal), modelo (score shift), política (cortes/regras),
processo/fraude, comportamento e macro. Use análise por safra, faixa de
score fixa e decomposição de mix (shift-share).

## Overrides e julgamento humano

Monitore a taxa de override por tipo (high-side/low-side), a performance
dos overridden e a concentração por operador ou canal. Overrides
frequentes sinalizam falha de modelo ou de política.
