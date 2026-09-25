---
name: statistical-analysis
description: Kit de análise estatística. Testes de hipótese (teste t, ANOVA, qui-quadrado), regressão, correlação, estatística bayesiana, análise de poder, verificação de pressupostos, relatórios no padrão APA, para pesquisa acadêmica.
metadata:
  mcpmarket-version: 1.0.0
---
# Análise Estatística

## Visão Geral

Análise estatística é um processo sistemático para testar hipóteses e quantificar relações. Realize testes de hipótese (teste t, ANOVA, qui-quadrado), regressão, correlação e análises bayesianas com verificação de pressupostos e relatórios no padrão APA. Aplique esta skill em pesquisas acadêmicas.

## Quando Usar Esta Skill

Esta skill deve ser usada quando:
- Conduzir testes de hipótese estatísticos (teste t, ANOVA, qui-quadrado)
- Realizar análises de regressão ou correlação
- Executar análises estatísticas bayesianas
- Verificar pressupostos estatísticos e diagnósticos
- Calcular tamanhos de efeito e conduzir análises de poder
- Reportar resultados estatísticos no formato APA
- Analisar dados experimentais ou observacionais para pesquisa

---

## Capacidades Principais

### 1. Seleção e Planejamento de Testes
- Escolher os testes estatísticos apropriados com base nas perguntas de pesquisa e nas características dos dados
- Conduzir análises de poder a priori para determinar o tamanho de amostra necessário
- Planejar estratégias de análise, incluindo correções para comparações múltiplas

### 2. Verificação de Pressupostos
- Verificar automaticamente todos os pressupostos relevantes antes de rodar os testes
- Fornecer visualizações diagnósticas (gráficos Q-Q, gráficos de resíduos, boxplots)
- Recomendar ações corretivas quando os pressupostos são violados

### 3. Testes Estatísticos
- Testes de hipótese: teste t, ANOVA, qui-quadrado, alternativas não paramétricas
- Regressão: linear, múltipla, logística, com diagnósticos
- Correlações: Pearson, Spearman, com intervalos de confiança
- Alternativas bayesianas: teste t bayesiano, ANOVA, regressão com Fatores de Bayes

### 4. Tamanhos de Efeito e Interpretação
- Calcular e interpretar tamanhos de efeito apropriados para todas as análises
- Fornecer intervalos de confiança para as estimativas de efeito
- Distinguir significância estatística de significância prática

### 5. Relatórios Profissionais
- Gerar relatórios estatísticos no estilo APA
- Criar figuras e tabelas prontas para publicação
- Fornecer interpretação completa com todas as estatísticas exigidas

---

## Árvore de Decisão do Fluxo de Trabalho

Use esta árvore de decisão para determinar seu caminho de análise:

```
INÍCIO
│
├─ Precisa SELECIONAR um teste estatístico?
│  └─ SIM → Ver "Guia de Seleção de Testes"
│  └─ NÃO → Continue
│
├─ Pronto para verificar PRESSUPOSTOS?
│  └─ SIM → Ver "Verificação de Pressupostos"
│  └─ NÃO → Continue
│
├─ Pronto para rodar a ANÁLISE?
│  └─ SIM → Ver "Executando Testes Estatísticos"
│  └─ NÃO → Continue
│
└─ Precisa REPORTAR resultados?
   └─ SIM → Ver "Reportando Resultados"
```

---

## Guia de Seleção de Testes

### Referência Rápida: Escolhendo o Teste Certo

Use `references/test_selection_guide.md` para orientação completa. Referência rápida:

**Comparando Dois Grupos:**
- Independentes, contínuo, normal → Teste t independente
- Independentes, contínuo, não normal → Teste de Mann-Whitney U
- Pareados, contínuo, normal → Teste t pareado
- Pareados, contínuo, não normal → Teste de Wilcoxon (postos sinalizados)
- Resultado binário → Qui-quadrado ou teste exato de Fisher

**Comparando 3+ Grupos:**
- Independentes, contínuo, normal → ANOVA de um fator
- Independentes, contínuo, não normal → Teste de Kruskal-Wallis
- Pareados, contínuo, normal → ANOVA de medidas repetidas
- Pareados, contínuo, não normal → Teste de Friedman

**Relações:**
- Duas variáveis contínuas → Correlação de Pearson (normal) ou Spearman (não normal)
- Resultado contínuo com preditor(es) → Regressão linear
- Resultado binário com preditor(es) → Regressão logística

**Alternativas Bayesianas:**
Todos os testes têm versões bayesianas que fornecem:
- Afirmações diretas de probabilidade sobre as hipóteses
- Fatores de Bayes quantificando a evidência
- Capacidade de sustentar a hipótese nula
- Ver `references/bayesian_statistics.md`

---

## Verificação de Pressupostos

### Verificação Sistemática de Pressupostos

**SEMPRE verifique os pressupostos antes de interpretar os resultados dos testes.**

Use o módulo `scripts/assumption_checks.py` para verificação automatizada:

```python
from scripts.assumption_checks import comprehensive_assumption_check

# Verificação abrangente com visualizações
results = comprehensive_assumption_check(
    data=df,
    value_col='score',
    group_col='group',  # Opcional: para comparações entre grupos
    alpha=0.05
)
```

Isso realiza:
1. **Detecção de outliers** (métodos IQR e z-score)
2. **Teste de normalidade** (teste de Shapiro-Wilk + gráficos Q-Q)
3. **Homogeneidade de variância** (teste de Levene + boxplots)
4. **Interpretação e recomendações**

### Verificações Individuais de Pressupostos

Para verificações pontuais, use as funções individuais:

```python
from scripts.assumption_checks import (
    check_normality,
    check_normality_per_group,
    check_homogeneity_of_variance,
    check_linearity,
    detect_outliers
)

# Exemplo: verificar normalidade com visualização
result = check_normality(
    data=df['score'],
    name='Test Score',
    alpha=0.05,
    plot=True
)
print(result['interpretation'])
print(result['recommendation'])
```

### O Que Fazer Quando os Pressupostos São Violados

**Normalidade violada:**
- Violação leve + n > 30 por grupo → Prosseguir com teste paramétrico (robusto)
- Violação moderada → Usar alternativa não paramétrica
- Violação severa → Transformar os dados ou usar teste não paramétrico

**Homogeneidade de variância violada:**
- Para teste t → Usar teste t de Welch
- Para ANOVA → Usar ANOVA de Welch ou ANOVA de Brown-Forsythe
- Para regressão → Usar erros-padrão robustos ou mínimos quadrados ponderados

**Linearidade violada (regressão):**
- Adicionar termos polinomiais
- Transformar variáveis
- Usar modelos não lineares ou GAM

Ver `references/assumptions_and_diagnostics.md` para orientação completa.

---

## Executando Testes Estatísticos

### Bibliotecas Python

Bibliotecas principais para análise estatística:
- **scipy.stats**: Testes estatísticos essenciais
- **statsmodels**: Regressão avançada e diagnósticos
- **pingouin**: Testes estatísticos amigáveis com tamanhos de efeito
- **pymc**: Modelagem estatística bayesiana
- **arviz**: Visualização e diagnósticos bayesianos

### Exemplos de Análises

#### Teste t com Relatório Completo

```python
import pingouin as pg
import numpy as np

# Executar teste t independente
result = pg.ttest(group_a, group_b, correction='auto')

# Extrair resultados
t_stat = result['T'].values[0]
df = result['dof'].values[0]
p_value = result['p-val'].values[0]
cohens_d = result['cohen-d'].values[0]
ci_lower = result['CI95%'].values[0][0]
ci_upper = result['CI95%'].values[0][1]

# Reportar
print(f"t({df:.0f}) = {t_stat:.2f}, p = {p_value:.3f}")
print(f"Cohen's d = {cohens_d:.2f}, 95% CI [{ci_lower:.2f}, {ci_upper:.2f}]")
```

#### ANOVA com Testes Post-Hoc

```python
import pingouin as pg

# ANOVA de um fator
aov = pg.anova(dv='score', between='group', data=df, detailed=True)
print(aov)

# Se significativo, conduzir testes post-hoc
if aov['p-unc'].values[0] < 0.05:
    posthoc = pg.pairwise_tukey(dv='score', between='group', data=df)
    print(posthoc)

# Tamanho de efeito
eta_squared = aov['np2'].values[0]  # Eta-quadrado parcial
print(f"Partial η² = {eta_squared:.3f}")
```

#### Regressão Linear com Diagnósticos

```python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor

# Ajustar o modelo
X = sm.add_constant(X_predictors)  # Adicionar intercepto
model = sm.OLS(y, X).fit()

# Resumo
print(model.summary())

# Verificar multicolinearidade (VIF)
vif_data = pd.DataFrame()
vif_data["Variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
print(vif_data)

# Verificar pressupostos
residuals = model.resid
fitted = model.fittedvalues

# Gráficos de resíduos
import matplotlib.pyplot as plt
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# Resíduos vs. valores ajustados
axes[0, 0].scatter(fitted, residuals, alpha=0.6)
axes[0, 0].axhline(y=0, color='r', linestyle='--')
axes[0, 0].set_xlabel('Fitted values')
axes[0, 0].set_ylabel('Residuals')
axes[0, 0].set_title('Residuals vs Fitted')

# Gráfico Q-Q
from scipy import stats
stats.probplot(residuals, dist="norm", plot=axes[0, 1])
axes[0, 1].set_title('Normal Q-Q')

# Escala-Localização
axes[1, 0].scatter(fitted, np.sqrt(np.abs(residuals / residuals.std())), alpha=0.6)
axes[1, 0].set_xlabel('Fitted values')
axes[1, 0].set_ylabel('√|Standardized residuals|')
axes[1, 0].set_title('Scale-Location')

# Histograma dos resíduos
axes[1, 1].hist(residuals, bins=20, edgecolor='black', alpha=0.7)
axes[1, 1].set_xlabel('Residuals')
axes[1, 1].set_ylabel('Frequency')
axes[1, 1].set_title('Histogram of Residuals')

plt.tight_layout()
plt.show()
```

#### Teste t Bayesiano

```python
import pymc as pm
import arviz as az
import numpy as np

with pm.Model() as model:
    # Priors
    mu1 = pm.Normal('mu_group1', mu=0, sigma=10)
    mu2 = pm.Normal('mu_group2', mu=0, sigma=10)
    sigma = pm.HalfNormal('sigma', sigma=10)

    # Verossimilhança
    y1 = pm.Normal('y1', mu=mu1, sigma=sigma, observed=group_a)
    y2 = pm.Normal('y2', mu=mu2, sigma=sigma, observed=group_b)

    # Quantidade derivada
    diff = pm.Deterministic('difference', mu1 - mu2)

    # Amostragem
    trace = pm.sample(2000, tune=1000, return_inferencedata=True)

# Resumir
print(az.summary(trace, var_names=['difference']))

# Probabilidade de que grupo1 > grupo2
prob_greater = np.mean(trace.posterior['difference'].values > 0)
print(f"P(μ₁ > μ₂ | data) = {prob_greater:.3f}")

# Plotar posterior
az.plot_posterior(trace, var_names=['difference'], ref_val=0)
```

---

## Tamanhos de Efeito

### Sempre Calcule Tamanhos de Efeito

**Tamanhos de efeito quantificam a magnitude, enquanto p-valores apenas indicam a existência de um efeito.**

Ver `references/effect_sizes_and_power.md` para orientação completa.

### Referência Rápida: Tamanhos de Efeito Comuns

| Teste | Tamanho de Efeito | Pequeno | Médio | Grande |
|------|-------------|-------|--------|-------|
| Teste t | Cohen's d | 0,20 | 0,50 | 0,80 |
| ANOVA | η²_p | 0,01 | 0,06 | 0,14 |
| Correlação | r | 0,10 | 0,30 | 0,50 |
| Regressão | R² | 0,02 | 0,13 | 0,26 |
| Qui-quadrado | Cramér's V | 0,07 | 0,21 | 0,35 |

**Importante**: os valores de referência são diretrizes. O contexto importa!

### Calculando Tamanhos de Efeito

A maioria dos tamanhos de efeito é calculada automaticamente pela pingouin:

```python
# Teste t retorna Cohen's d
result = pg.ttest(x, y)
d = result['cohen-d'].values[0]

# ANOVA retorna eta-quadrado parcial
aov = pg.anova(dv='score', between='group', data=df)
eta_p2 = aov['np2'].values[0]

# Correlação: r já é um tamanho de efeito
corr = pg.corr(x, y)
r = corr['r'].values[0]
```

### Intervalos de Confiança para Tamanhos de Efeito

Sempre reporte os ICs para mostrar a precisão:

```python
from pingouin import compute_effsize_from_t

# Para teste t
d, ci = compute_effsize_from_t(
    t_statistic,
    nx=len(group1),
    ny=len(group2),
    eftype='cohen'
)
print(f"d = {d:.2f}, 95% CI [{ci[0]:.2f}, {ci[1]:.2f}]")
```

---

## Análise de Poder

### Análise de Poder a Priori (Planejamento do Estudo)

Determine o tamanho de amostra necessário antes da coleta de dados:

```python
from statsmodels.stats.power import (
    tt_ind_solve_power,
    FTestAnovaPower
)

# Teste t: qual n é necessário para detectar d = 0,5?
n_required = tt_ind_solve_power(
    effect_size=0.5,
    alpha=0.05,
    power=0.80,
    ratio=1.0,
    alternative='two-sided'
)
print(f"Required n per group: {n_required:.0f}")

# ANOVA: qual n é necessário para detectar f = 0,25?
anova_power = FTestAnovaPower()
n_per_group = anova_power.solve_power(
    effect_size=0.25,
    ngroups=3,
    alpha=0.05,
    power=0.80
)
print(f"Required n per group: {n_per_group:.0f}")
```

### Análise de Sensibilidade (Pós-Estudo)

Determine qual tamanho de efeito você conseguiria detectar:

```python
# Com n=50 por grupo, qual efeito poderíamos detectar?
detectable_d = tt_ind_solve_power(
    effect_size=None,  # Resolver para isso
    nobs1=50,
    alpha=0.05,
    power=0.80,
    ratio=1.0,
    alternative='two-sided'
)
print(f"Study could detect d ≥ {detectable_d:.2f}")
```

**Observação**: a análise de poder post-hoc (calcular o poder depois do estudo) geralmente não é recomendada. Use a análise de sensibilidade em vez disso.

Ver `references/effect_sizes_and_power.md` para orientação detalhada.

---

## Reportando Resultados

### Relatório Estatístico no Estilo APA

Siga as diretrizes em `references/reporting_standards.md`.

### Elementos Essenciais do Relatório

1. **Estatísticas descritivas**: M, DP, n para todos os grupos/variáveis
2. **Estatísticas de teste**: nome do teste, estatística, gl, p-valor exato
3. **Tamanhos de efeito**: com intervalos de confiança
4. **Verificação de pressupostos**: quais testes foram feitos, resultados, ações tomadas
5. **Todas as análises planejadas**: incluindo achados não significativos

### Modelos de Relatório de Exemplo

#### Teste t Independente

```
O Grupo A (n = 48, M = 75,2, DP = 8,5) pontuou significativamente mais alto
que o Grupo B (n = 52, M = 68,3, DP = 9,2), t(98) = 3,82, p < .001, d = 0,77,
IC 95% [0,36, 1,18], bicaudal. Os pressupostos de normalidade (Shapiro-Wilk:
Grupo A W = 0,97, p = .18; Grupo B W = 0,96, p = .12) e homogeneidade
de variância (Levene's F(1, 98) = 1,23, p = .27) foram satisfeitos.
```

#### ANOVA de Um Fator

```
Uma ANOVA de um fator revelou um efeito principal significativo da condição
de tratamento sobre as pontuações do teste, F(2, 147) = 8,45, p < .001, η²_p = .10.
Comparações post hoc usando o HSD de Tukey indicaram que a Condição A (M = 78,2,
DP = 7,3) pontuou significativamente mais alto que a Condição B (M = 71,5,
DP = 8,1, p = .002, d = 0,87) e a Condição C (M = 70,1, DP = 7,9,
p < .001, d = 1,07). As Condições B e C não diferiram significativamente
(p = .52, d = 0,18).
```

#### Regressão Múltipla

```
Uma regressão linear múltipla foi conduzida para prever notas de exame a partir de
horas de estudo, GPA prévio e frequência. O modelo geral foi significativo,
F(3, 146) = 45,2, p < .001, R² = .48, R² ajustado = .47. Horas de estudo
(B = 1,80, EP = 0,31, β = .35, t = 5,78, p < .001, IC 95% [1,18, 2,42])
e GPA prévio (B = 8,52, EP = 1,95, β = .28, t = 4,37, p < .001,
IC 95% [4,66, 12,38]) foram preditores significativos, enquanto a frequência
não foi (B = 0,15, EP = 0,12, β = .08, t = 1,25, p = .21, IC 95% [-0,09, 0,39]).
Multicolinearidade não foi um problema (todos os VIF < 1,5).
```

#### Análise Bayesiana

```
Um teste t bayesiano para amostras independentes foi conduzido usando priors
fracamente informativos (Normal(0, 1) para a diferença de médias). A distribuição
posterior indicou que o Grupo A pontuou mais alto que o Grupo B
(M_dif = 6,8, intervalo de credibilidade de 95% [3,2, 10,4]). O Fator de Bayes
BF₁₀ = 45,3 forneceu evidência muito forte de diferença entre os
grupos, com 99,8% de probabilidade posterior de que a média do Grupo A excedeu
a do Grupo B. Os diagnósticos de convergência foram satisfatórios (todos os R̂ < 1,01,
ESS > 1000).
```

---

## Estatística Bayesiana

### Quando Usar Métodos Bayesianos

Considere abordagens bayesianas quando:
- Você tem informação prévia para incorporar
- Você quer afirmações diretas de probabilidade sobre as hipóteses
- O tamanho de amostra é pequeno ou você está planejando coleta de dados sequencial
- Você precisa quantificar evidência para a hipótese nula
- O modelo é complexo (hierárquico, dados faltantes)

Ver `references/bayesian_statistics.md` para orientação completa sobre:
- Teorema de Bayes e interpretação
- Especificação de priors (informativos, fracamente informativos, não informativos)
- Teste de hipótese bayesiano com Fatores de Bayes
- Intervalos de credibilidade vs. intervalos de confiança
- Teste t bayesiano, ANOVA, regressão e modelos hierárquicos
- Verificação de convergência do modelo e checagens preditivas posteriores

### Principais Vantagens

1. **Interpretação intuitiva**: "Dados os dados, há 95% de probabilidade de que o parâmetro esteja neste intervalo"
2. **Evidência para a nula**: pode quantificar suporte para ausência de efeito
3. **Flexível**: sem preocupações com p-hacking; pode analisar os dados à medida que chegam
4. **Quantificação de incerteza**: distribuição posterior completa

---

## Recursos

Esta skill inclui material de referência abrangente:

### Diretório References

- **test_selection_guide.md**: árvore de decisão para escolher os testes estatísticos apropriados
- **assumptions_and_diagnostics.md**: orientação detalhada sobre verificação e tratamento de violações de pressupostos
- **effect_sizes_and_power.md**: cálculo, interpretação e relato de tamanhos de efeito; condução de análises de poder
- **bayesian_statistics.md**: guia completo de métodos de análise bayesiana
- **reporting_standards.md**: diretrizes de relatório no estilo APA com exemplos

### Diretório Scripts

- **assumption_checks.py**: verificação automatizada de pressupostos com visualizações
  - `comprehensive_assumption_check()`: fluxo de trabalho completo
  - `check_normality()`: teste de normalidade com gráficos Q-Q
  - `check_homogeneity_of_variance()`: teste de Levene com boxplots
  - `check_linearity()`: verificações de linearidade para regressão
  - `detect_outliers()`: detecção de outliers por IQR e z-score

*Observação: os arquivos em `references/` e o script em `scripts/` permanecem no original em inglês, conforme fornecidos pela skill original.*

---

## Boas Práticas

1. **Pré-registre as análises** quando possível, para distinguir confirmatório de exploratório
2. **Sempre verifique os pressupostos** antes de interpretar os resultados
3. **Reporte tamanhos de efeito** com intervalos de confiança
4. **Reporte todas as análises planejadas**, incluindo resultados não significativos
5. **Distinga significância estatística de significância prática**
6. **Visualize os dados** antes e depois da análise
7. **Verifique diagnósticos** para regressão/ANOVA (gráficos de resíduos, VIF, etc.)
8. **Conduza análises de sensibilidade** para avaliar robustez
9. **Compartilhe dados e código** para reprodutibilidade
10. **Seja transparente** sobre violações, transformações e decisões

---

## Armadilhas Comuns a Evitar

1. **P-hacking**: não teste de várias formas até algo ser significativo
2. **HARKing**: não apresente achados exploratórios como confirmatórios
3. **Ignorar pressupostos**: verifique-os e reporte violações
4. **Confundir significância com importância**: p < .05 ≠ efeito relevante
5. **Não reportar tamanhos de efeito**: essenciais para a interpretação
6. **Cherry-picking de resultados**: reporte todas as análises planejadas
7. **Interpretar mal os p-valores**: eles NÃO são a probabilidade de a hipótese ser verdadeira
8. **Comparações múltiplas**: corrija o erro familywise quando apropriado
9. **Ignorar dados faltantes**: entenda o mecanismo (MCAR, MAR, MNAR)
10. **Superinterpretar resultados não significativos**: ausência de evidência ≠ evidência de ausência

---

## Checklist para Começar

Ao iniciar uma análise estatística:

- [ ] Defina a pergunta de pesquisa e as hipóteses
- [ ] Determine o teste estatístico apropriado (use test_selection_guide.md)
- [ ] Conduza análise de poder para determinar o tamanho da amostra
- [ ] Carregue e inspecione os dados
- [ ] Verifique dados faltantes e outliers
- [ ] Verifique os pressupostos usando assumption_checks.py
- [ ] Execute a análise principal
- [ ] Calcule tamanhos de efeito com intervalos de confiança
- [ ] Conduza testes post-hoc se necessário (com correções)
- [ ] Crie visualizações
- [ ] Escreva os resultados seguindo reporting_standards.md
- [ ] Conduza análises de sensibilidade
- [ ] Compartilhe dados e código

---

## Suporte e Leitura Adicional

Para dúvidas sobre:
- **Seleção de teste**: ver references/test_selection_guide.md
- **Pressupostos**: ver references/assumptions_and_diagnostics.md
- **Tamanhos de efeito**: ver references/effect_sizes_and_power.md
- **Métodos bayesianos**: ver references/bayesian_statistics.md
- **Relatórios**: ver references/reporting_standards.md

**Principais livros-texto**:
- Cohen, J. (1988). *Statistical Power Analysis for the Behavioral Sciences*
- Field, A. (2013). *Discovering Statistics Using IBM SPSS Statistics*
- Gelman, A., & Hill, J. (2006). *Data Analysis Using Regression and Multilevel/Hierarchical Models*
- Kruschke, J. K. (2014). *Doing Bayesian Data Analysis*

**Recursos online**:
- Guia de Estilo APA: https://apastyle.apa.org/
- Consultoria Estatística: Cross Validated (stats.stackexchange.com)

---

*Traduzido para pt-br a partir da documentação original em https://app.mcpmarket.com/arthurfontana/skills/statistical-analysis (skill statistical-analysis v1.0.0).*
