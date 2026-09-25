# Referência de Testes Estatísticos e Diagnósticos

Este documento fornece orientação abrangente sobre testes estatísticos, diagnósticos e ferramentas disponíveis no statsmodels.

## Visão Geral

O statsmodels oferece amplas capacidades de teste estatístico:
- Diagnósticos de resíduos e testes de especificação
- Testes de hipótese (paramétricos e não paramétricos)
- Testes de qualidade de ajuste
- Comparações múltiplas e testes post-hoc
- Cálculos de poder estatístico e tamanho amostral
- Matrizes de covariância robustas
- Detecção de influência e outliers

## Diagnósticos de Resíduos

### Testes de Autocorrelação

**Teste de Ljung-Box**: Testa autocorrelação nos resíduos

```python
from statsmodels.stats.diagnostic import acorr_ljungbox

# Testa autocorrelação nos resíduos
lb_test = acorr_ljungbox(residuals, lags=10, return_df=True)
print(lb_test)

# H0: Sem autocorrelação até a defasagem k
# Se p-valor < 0.05, rejeita-se H0 (há autocorrelação)
```

**Teste de Durbin-Watson**: Testa autocorrelação de primeira ordem

```python
from statsmodels.stats.stattools import durbin_watson

dw_stat = durbin_watson(residuals)
print(f"Durbin-Watson: {dw_stat:.4f}")

# DW ≈ 2: sem autocorrelação
# DW < 2: autocorrelação positiva
# DW > 2: autocorrelação negativa
# Valores críticos exatos dependem de n e k
```

**Teste de Breusch-Godfrey**: Teste mais geral para autocorrelação

```python
from statsmodels.stats.diagnostic import acorr_breusch_godfrey

bg_test = acorr_breusch_godfrey(results, nlags=5)
lm_stat, lm_pval, f_stat, f_pval = bg_test

print(f"Estatística LM: {lm_stat:.4f}, p-valor: {lm_pval:.4f}")
# H0: Sem autocorrelação até a defasagem k
```

### Testes de Heterocedasticidade

**Teste de Breusch-Pagan**: Testa heterocedasticidade

```python
from statsmodels.stats.diagnostic import het_breuschpagan

bp_test = het_breuschpagan(residuals, exog)
lm_stat, lm_pval, f_stat, f_pval = bp_test

print(f"p-valor do teste de Breusch-Pagan: {lm_pval:.4f}")
# H0: Homocedasticidade (variância constante)
# Se p-valor < 0.05, rejeita-se H0 (há heterocedasticidade)
```

**Teste de White**: Teste mais geral para heterocedasticidade

```python
from statsmodels.stats.diagnostic import het_white

white_test = het_white(residuals, exog)
lm_stat, lm_pval, f_stat, f_pval = white_test

print(f"p-valor do teste de White: {lm_pval:.4f}")
# H0: Homocedasticidade
```

**Teste ARCH**: Testa heterocedasticidade condicional autorregressiva

```python
from statsmodels.stats.diagnostic import het_arch

arch_test = het_arch(residuals, nlags=5)
lm_stat, lm_pval, f_stat, f_pval = arch_test

print(f"p-valor do teste ARCH: {lm_pval:.4f}")
# H0: Sem efeitos ARCH
# Se significativo, considere um modelo GARCH
```

### Testes de Normalidade

**Teste de Jarque-Bera**: Testa normalidade usando assimetria e curtose

```python
from statsmodels.stats.stattools import jarque_bera

jb_stat, jb_pval, skew, kurtosis = jarque_bera(residuals)

print(f"Estatística de Jarque-Bera: {jb_stat:.4f}")
print(f"p-valor: {jb_pval:.4f}")
print(f"Assimetria: {skew:.4f}")
print(f"Curtose: {kurtosis:.4f}")

# H0: Resíduos são normalmente distribuídos
# Normal: assimetria ≈ 0, curtose ≈ 3
```

**Teste Omnibus**: Outro teste de normalidade (também baseado em assimetria/curtose)

```python
from statsmodels.stats.stattools import omni_normtest

omni_stat, omni_pval = omni_normtest(residuals)
print(f"p-valor do teste Omnibus: {omni_pval:.4f}")
# H0: Normalidade
```

**Teste de Anderson-Darling**: Teste de ajuste de distribuição

```python
from statsmodels.stats.diagnostic import normal_ad

ad_stat, ad_pval = normal_ad(residuals)
print(f"p-valor do teste de Anderson-Darling: {ad_pval:.4f}")
```

**Teste de Lilliefors**: Versão modificada do teste de Kolmogorov-Smirnov

```python
from statsmodels.stats.diagnostic import lilliefors

lf_stat, lf_pval = lilliefors(residuals, dist='norm')
print(f"p-valor do teste de Lilliefors: {lf_pval:.4f}")
```

### Testes de Linearidade e Especificação

**Teste RESET de Ramsey**: Testa má especificação da forma funcional

```python
from statsmodels.stats.diagnostic import linear_reset

reset_test = linear_reset(results, power=2)
f_stat, f_pval = reset_test

print(f"p-valor do teste RESET: {f_pval:.4f}")
# H0: O modelo está corretamente especificado (linear)
# Se rejeitado, pode ser necessário incluir termos polinomiais ou transformações
```

**Teste de Harvey-Collier**: Testa linearidade

```python
from statsmodels.stats.diagnostic import linear_harvey_collier

hc_stat, hc_pval = linear_harvey_collier(results)
print(f"p-valor do teste de Harvey-Collier: {hc_pval:.4f}")
# H0: A especificação linear está correta
```

## Detecção de Multicolinearidade

**Fator de Inflação da Variância (VIF)**:

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor
import pandas as pd

# Calcula o VIF para cada variável
vif_data = pd.DataFrame()
vif_data["Variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i)
                   for i in range(X.shape[1])]

print(vif_data.sort_values('VIF', ascending=False))

# Interpretação:
# VIF = 1: Sem correlação com outros preditores
# VIF > 5: Multicolinearidade moderada
# VIF > 10: Problema sério de multicolinearidade
# VIF > 20: Multicolinearidade severa (considere remover a variável)
```

**Número de Condição**: A partir dos resultados da regressão

```python
print(f"Número de condição: {results.condition_number:.2f}")

# Interpretação:
# < 10: Sem preocupação com multicolinearidade
# 10-30: Multicolinearidade moderada
# > 30: Multicolinearidade forte
# > 100: Multicolinearidade severa
```

## Detecção de Influência e Outliers

### Alavancagem (Leverage)

Pontos de alta alavancagem têm valores extremos nos preditores.

```python
from statsmodels.stats.outliers_influence import OLSInfluence

influence = results.get_influence()

# Valores de hat (alavancagem)
leverage = influence.hat_matrix_diag

# Regra prática: alavancagem > 2*p/n ou 3*p/n é alta
# p = número de parâmetros, n = tamanho da amostra
threshold = 2 * len(results.params) / len(y)
high_leverage = np.where(leverage > threshold)[0]

print(f"Observações de alta alavancagem: {high_leverage}")
```

### Distância de Cook

Mede a influência geral de cada observação.

```python
# Distância de Cook
cooks_d = influence.cooks_distance[0]

# Regra prática: Distância de Cook > 4/n é influente
threshold = 4 / len(y)
influential = np.where(cooks_d > threshold)[0]

print(f"Observações influentes (Distância de Cook): {influential}")

# Gráfico
import matplotlib.pyplot as plt
plt.stem(range(len(cooks_d)), cooks_d)
plt.axhline(y=threshold, color='r', linestyle='--', label=f'Limiar (4/n)')
plt.xlabel('Observação')
plt.ylabel("Distância de Cook")
plt.legend()
plt.show()
```

### DFFITS

Mede a influência sobre o valor ajustado.

```python
# DFFITS
dffits = influence.dffits[0]

# Regra prática: |DFFITS| > 2*sqrt(p/n) é influente
p = len(results.params)
n = len(y)
threshold = 2 * np.sqrt(p / n)

influential_dffits = np.where(np.abs(dffits) > threshold)[0]
print(f"Observações influentes (DFFITS): {influential_dffits}")
```

### DFBETAs

Mede a influência sobre cada coeficiente.

```python
# DFBETAs (um para cada parâmetro)
dfbetas = influence.dfbetas

# Regra prática: |DFBETA| > 2/sqrt(n)
threshold = 2 / np.sqrt(n)

for i, param_name in enumerate(results.params.index):
    influential = np.where(np.abs(dfbetas[:, i]) > threshold)[0]
    if len(influential) > 0:
        print(f"Influente para {param_name}: {influential}")
```

### Gráfico de Influência

```python
from statsmodels.graphics.regressionplots import influence_plot

fig, ax = plt.subplots(figsize=(12, 8))
influence_plot(results, ax=ax, criterion='cooks')
plt.show()

# Combina alavancagem, resíduos e distância de Cook
# Bolhas grandes = alta distância de Cook
# Longe de x=0 = alta alavancagem
# Longe de y=0 = resíduo grande
```

### Resíduos Estudentizados

```python
# Resíduos estudentizados (outliers)
student_resid = influence.resid_studentized_internal

# Resíduos estudentizados externos (mais conservadores)
student_resid_external = influence.resid_studentized_external

# Outliers: |resíduo estudentizado| > 3 (ou > 2.5)
outliers = np.where(np.abs(student_resid_external) > 3)[0]
print(f"Outliers: {outliers}")
```

## Testes de Hipótese

### Testes t

**Teste t de uma amostra**: Testa se a média é igual a um valor específico

```python
from scipy import stats

# H0: média populacional = mu_0
t_stat, p_value = stats.ttest_1samp(data, popmean=mu_0)

print(f"Estatística t: {t_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**Teste t de duas amostras**: Compara as médias de dois grupos

```python
# H0: média1 = média2 (variâncias iguais)
t_stat, p_value = stats.ttest_ind(group1, group2)

# Teste t de Welch (variâncias desiguais)
t_stat, p_value = stats.ttest_ind(group1, group2, equal_var=False)

print(f"Estatística t: {t_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**Teste t pareado**: Compara observações pareadas

```python
# H0: diferença média = 0
t_stat, p_value = stats.ttest_rel(before, after)

print(f"Estatística t: {t_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

### Testes de Proporção

**Teste de uma proporção**:

```python
from statsmodels.stats.proportion import proportions_ztest

# H0: proporção = p0
count = 45  # sucessos
nobs = 100  # total de observações
p0 = 0.5    # proporção hipotetizada

z_stat, p_value = proportions_ztest(count, nobs, value=p0)

print(f"Estatística z: {z_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**Teste de duas proporções**:

```python
# H0: proporção1 = proporção2
counts = [45, 60]
nobs = [100, 120]

z_stat, p_value = proportions_ztest(counts, nobs)
print(f"Estatística z: {z_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

### Testes Qui-quadrado

**Teste qui-quadrado de independência**:

```python
from scipy.stats import chi2_contingency

# Tabela de contingência
contingency_table = pd.crosstab(variable1, variable2)

chi2, p_value, dof, expected = chi2_contingency(contingency_table)

print(f"Estatística qui-quadrado: {chi2:.4f}")
print(f"p-valor: {p_value:.4f}")
print(f"Graus de liberdade: {dof}")

# H0: As variáveis são independentes
```

**Teste qui-quadrado de qualidade de ajuste**:

```python
from scipy.stats import chisquare

# Frequências observadas
observed = [20, 30, 25, 25]

# Frequências esperadas (iguais por padrão)
expected = [25, 25, 25, 25]

chi2, p_value = chisquare(observed, expected)

print(f"Estatística qui-quadrado: {chi2:.4f}")
print(f"p-valor: {p_value:.4f}")

# H0: Os dados seguem a distribuição esperada
```

### Testes Não Paramétricos

**Teste U de Mann-Whitney** (amostras independentes):

```python
from scipy.stats import mannwhitneyu

# H0: As distribuições são iguais
u_stat, p_value = mannwhitneyu(group1, group2, alternative='two-sided')

print(f"Estatística U: {u_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**Teste de postos sinalizados de Wilcoxon** (amostras pareadas):

```python
from scipy.stats import wilcoxon

# H0: Diferença mediana = 0
w_stat, p_value = wilcoxon(before, after)

print(f"Estatística W: {w_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**Teste H de Kruskal-Wallis** (>2 grupos):

```python
from scipy.stats import kruskal

# H0: Todos os grupos têm a mesma distribuição
h_stat, p_value = kruskal(group1, group2, group3)

print(f"Estatística H: {h_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**Teste de sinais**:

```python
from statsmodels.stats.descriptivestats import sign_test

# H0: Mediana = m0
result = sign_test(data, m0=0)
print(result)
```

### ANOVA

**ANOVA de um fator**:

```python
from scipy.stats import f_oneway

# H0: Todas as médias dos grupos são iguais
f_stat, p_value = f_oneway(group1, group2, group3)

print(f"Estatística F: {f_stat:.4f}")
print(f"p-valor: {p_value:.4f}")
```

**ANOVA de dois fatores** (com statsmodels):

```python
from statsmodels.formula.api import ols
from statsmodels.stats.anova import anova_lm

# Ajusta o modelo
model = ols('response ~ C(factor1) + C(factor2) + C(factor1):C(factor2)',
            data=df).fit()

# Tabela ANOVA
anova_table = anova_lm(model, typ=2)
print(anova_table)
```

**ANOVA de medidas repetidas**:

```python
from statsmodels.stats.anova import AnovaRM

# Requer dados em formato longo
aovrm = AnovaRM(df, depvar='score', subject='subject_id', within=['time'])
results = aovrm.fit()

print(results.summary())
```

## Comparações Múltiplas

### Testes Post-hoc

**HSD de Tukey** (Diferença Honestamente Significativa):

```python
from statsmodels.stats.multicomp import pairwise_tukeyhsd

# Executa o teste HSD de Tukey
tukey = pairwise_tukeyhsd(data, groups, alpha=0.05)

print(tukey.summary())

# Gráfico dos intervalos de confiança
tukey.plot_simultaneous()
plt.show()
```

**Correção de Bonferroni**:

```python
from statsmodels.stats.multitest import multipletests

# p-valores de múltiplos testes
p_values = [0.01, 0.03, 0.04, 0.15, 0.001]

# Aplica a correção
reject, pvals_corrected, alphac_sidak, alphac_bonf = multipletests(
    p_values,
    alpha=0.05,
    method='bonferroni'
)

print("Rejeitados:", reject)
print("p-valores corrigidos:", pvals_corrected)
```

**Taxa de Descoberta Falsa (FDR)**:

```python
# Correção FDR (menos conservadora que Bonferroni)
reject, pvals_corrected, alphac_sidak, alphac_bonf = multipletests(
    p_values,
    alpha=0.05,
    method='fdr_bh'  # Benjamini-Hochberg
)

print("Rejeitados:", reject)
print("p-valores corrigidos:", pvals_corrected)
```

## Matrizes de Covariância Robustas

### Erros Padrão Consistentes sob Heterocedasticidade (HC)

```python
# Após ajustar o OLS
results = sm.OLS(y, X).fit()

# HC0 (erros padrão consistentes sob heterocedasticidade de White)
results_hc0 = results.get_robustcov_results(cov_type='HC0')

# HC1 (ajuste de graus de liberdade)
results_hc1 = results.get_robustcov_results(cov_type='HC1')

# HC2 (ajuste de alavancagem)
results_hc2 = results.get_robustcov_results(cov_type='HC2')

# HC3 (mais conservador, recomendado para amostras pequenas)
results_hc3 = results.get_robustcov_results(cov_type='HC3')

print("Erros padrão do OLS padrão:", results.bse)
print("Erros padrão robustos HC3:", results_hc3.bse)
```

### HAC (Consistente sob Heterocedasticidade e Autocorrelação)

**Erros padrão de Newey-West**:

```python
# Para séries temporais com autocorrelação e heterocedasticidade
results_hac = results.get_robustcov_results(cov_type='HAC', maxlags=4)

print("Erros padrão HAC (Newey-West):", results_hac.bse)
print(results_hac.summary())
```

### Erros Padrão Robustos por Cluster

```python
# Para dados agrupados/clusterizados
results_cluster = results.get_robustcov_results(
    cov_type='cluster',
    groups=cluster_ids
)

print("Erros padrão robustos por cluster:", results_cluster.bse)
```

## Estatística Descritiva

**Estatísticas descritivas básicas**:

```python
from statsmodels.stats.api import DescrStatsW

# Estatísticas descritivas abrangentes
desc = DescrStatsW(data)

print("Média:", desc.mean)
print("Desvio padrão:", desc.std)
print("Variância:", desc.var)
print("Intervalo de confiança:", desc.tconfint_mean())

# Quantis
print("Mediana:", desc.quantile(0.5))
print("IQR:", desc.quantile([0.25, 0.75]))
```

**Estatísticas ponderadas**:

```python
# Com pesos
desc_weighted = DescrStatsW(data, weights=weights)

print("Média ponderada:", desc_weighted.mean)
print("Desvio padrão ponderado:", desc_weighted.std)
```

**Comparar dois grupos**:

```python
from statsmodels.stats.weightstats import CompareMeans

# Cria o objeto de comparação
cm = CompareMeans(DescrStatsW(group1), DescrStatsW(group2))

# Teste t
print("Teste t:", cm.ttest_ind())

# Intervalo de confiança para a diferença
print("IC para a diferença:", cm.tconfint_diff())

# Teste de igualdade de variâncias
print("Teste de variâncias iguais:", cm.test_equal_var())
```

## Análise de Poder e Tamanho Amostral

**Poder para teste t**:

```python
from statsmodels.stats.power import tt_ind_solve_power

# Resolve para o tamanho amostral
effect_size = 0.5  # d de Cohen
alpha = 0.05
power = 0.8

n = tt_ind_solve_power(effect_size=effect_size,
                        alpha=alpha,
                        power=power,
                        alternative='two-sided')

print(f"Tamanho amostral necessário por grupo: {n:.0f}")

# Resolve para o poder dado n
power = tt_ind_solve_power(effect_size=0.5,
                           nobs1=50,
                           alpha=0.05,
                           alternative='two-sided')

print(f"Poder: {power:.4f}")
```

**Poder para teste de proporção**:

```python
from statsmodels.stats.power import zt_ind_solve_power

# Para testes de proporção (teste z)
effect_size = 0.3  # Diferença entre proporções
alpha = 0.05
power = 0.8

n = zt_ind_solve_power(effect_size=effect_size,
                        alpha=alpha,
                        power=power,
                        alternative='two-sided')

print(f"Tamanho amostral necessário por grupo: {n:.0f}")
```

**Curvas de poder**:

```python
from statsmodels.stats.power import TTestIndPower
import matplotlib.pyplot as plt

# Cria o objeto de análise de poder
analysis = TTestIndPower()

# Plota curvas de poder para diferentes tamanhos amostrais
sample_sizes = range(10, 200, 10)
effect_sizes = [0.2, 0.5, 0.8]  # Pequeno, médio, grande

fig, ax = plt.subplots(figsize=(10, 6))

for es in effect_sizes:
    power = [analysis.solve_power(effect_size=es, nobs1=n, alpha=0.05)
             for n in sample_sizes]
    ax.plot(sample_sizes, power, label=f'Tamanho de efeito = {es}')

ax.axhline(y=0.8, color='r', linestyle='--', label='Poder = 0.8')
ax.set_xlabel('Tamanho amostral por grupo')
ax.set_ylabel('Poder')
ax.set_title('Curvas de Poder para Teste t de Duas Amostras')
ax.legend()
ax.grid(True, alpha=0.3)
plt.show()
```

## Tamanhos de Efeito

**d de Cohen** (diferença média padronizada):

```python
def cohens_d(group1, group2):
    \"\"\"Calcula o d de Cohen para amostras independentes\"\"\"
    n1, n2 = len(group1), len(group2)
    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)

    # Desvio padrão combinado (pooled)
    pooled_std = np.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2))

    # d de Cohen
    d = (np.mean(group1) - np.mean(group2)) / pooled_std

    return d

d = cohens_d(group1, group2)
print(f"d de Cohen: {d:.4f}")

# Interpretação:
# |d| < 0.2: desprezível
# |d| ~ 0.2: pequeno
# |d| ~ 0.5: médio
# |d| ~ 0.8: grande
```

**Eta-quadrado** (para ANOVA):

```python
# A partir da tabela ANOVA
# η² = SQ_entre / SQ_total

def eta_squared(anova_table):
    return anova_table['sum_sq'][0] / anova_table['sum_sq'].sum()

# Após executar a ANOVA
eta_sq = eta_squared(anova_table)
print(f"Eta-quadrado: {eta_sq:.4f}")

# Interpretação:
# 0.01: efeito pequeno
# 0.06: efeito médio
# 0.14: efeito grande
```

## Tabelas de Contingência e Associação

**Teste de McNemar** (dados binários pareados):

```python
from statsmodels.stats.contingency_tables import mcnemar

# Tabela de contingência 2x2
table = [[a, b],
         [c, d]]

result = mcnemar(table, exact=True)  # ou exact=False para amostras grandes
print(f"p-valor: {result.pvalue:.4f}")

# H0: As probabilidades marginais são iguais
```

**Teste de Cochran-Mantel-Haenszel**:

```python
from statsmodels.stats.contingency_tables import StratifiedTable

# Para tabelas 2x2 estratificadas
strat_table = StratifiedTable(tables_list)
result = strat_table.test_null_odds()

print(f"p-valor: {result.pvalue:.4f}")
```

## Efeitos de Tratamento e Inferência Causal

**Pareamento por escore de propensão**:

```python
from statsmodels.treatment import propensity_score

# Estima os escores de propensão
ps_model = sm.Logit(treatment, X).fit()
propensity_scores = ps_model.predict(X)

# Usar para pareamento ou ponderação
# (implementação manual do pareamento necessária)
```

**Diferenças em diferenças**:

```python
# Fórmula DiD: outcome ~ treatment * post
model = ols('outcome ~ treatment + post + treatment:post', data=df).fit()

# A estimativa DiD é o coeficiente da interação
did_estimate = model.params['treatment:post']
print(f"Estimativa DiD: {did_estimate:.4f}")
```

## Boas Práticas

1. **Sempre verifique os pressupostos**: Teste antes de interpretar os resultados
2. **Reporte tamanhos de efeito**: Não apenas p-valores
3. **Use os testes apropriados**: Ajuste o teste ao tipo de dado e à distribuição
4. **Corrija para comparações múltiplas**: Ao realizar muitos testes
5. **Verifique o tamanho amostral**: Garanta poder adequado
6. **Inspeção visual**: Plote os dados antes de testar
7. **Reporte intervalos de confiança**: Junto com as estimativas pontuais
8. **Considere alternativas**: Testes não paramétricos quando os pressupostos forem violados
9. **Erros padrão robustos**: Use quando houver heterocedasticidade/autocorrelação
10. **Documente decisões**: Anote quais testes foram usados e por quê

## Armadilhas Comuns

1. **Não verificar os pressupostos do teste**: Pode invalidar os resultados
2. **Testes múltiplos sem correção**: Erro Tipo I inflado
3. **Usar testes paramétricos em dados não normais**: Considere testes não paramétricos
4. **Ignorar a heterocedasticidade**: Use erros padrão robustos
5. **Confundir significância estatística com significância prática**: Verifique os tamanhos de efeito
6. **Não reportar intervalos de confiança**: Apenas p-valores é insuficiente
7. **Usar o teste errado**: Ajuste o teste à pergunta de pesquisa
8. **Poder insuficiente**: Risco de erro Tipo II (falsos negativos)
9. **p-hacking**: Testar muitas especificações até obter significância
10. **Superinterpretar p-valores**: Lembre-se das limitações do teste de significância de hipótese nula (NHST)
