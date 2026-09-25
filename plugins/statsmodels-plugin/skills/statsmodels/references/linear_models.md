# Referência de Modelos de Regressão Linear

Este documento fornece orientações detalhadas sobre modelos de regressão linear no statsmodels, incluindo OLS, GLS, WLS, regressão quantílica e variantes especializadas.

## Classes Principais de Modelos

### OLS (Mínimos Quadrados Ordinários)

Assume erros independentes e identicamente distribuídos (Σ=I). Ideal para regressão padrão com erros homocedásticos.

**Quando usar:**
- Análise de regressão padrão
- Os erros são independentes e têm variância constante
- Sem autocorrelação ou heterocedasticidade
- Ponto de partida mais comum

**Uso básico:**
```python
import statsmodels.api as sm
import numpy as np

# Preparar os dados - SEMPRE adicione uma constante para o intercepto
X = sm.add_constant(X_data)  # Adiciona uma coluna de 1s para o intercepto

# Ajustar o modelo
model = sm.OLS(y, X)
results = model.fit()

# Visualizar resultados
print(results.summary())
```

**Principais atributos de resultados:**
```python
results.params           # Coeficientes
results.bse              # Erros-padrão
results.tvalues          # Estatísticas t
results.pvalues          # Valores-p
results.rsquared         # R-quadrado
results.rsquared_adj     # R-quadrado ajustado
results.fittedvalues     # Valores ajustados (previsões nos dados de treino)
results.resid            # Resíduos
results.conf_int()       # Intervalos de confiança para os parâmetros
```

**Previsão com intervalos de confiança/predição:**
```python
# Para previsões dentro da amostra
pred = results.get_prediction(X)
pred_summary = pred.summary_frame()
print(pred_summary)  # Contém média, desvio-padrão, intervalos de confiança

# Para previsões fora da amostra
X_new = sm.add_constant(X_new_data)
pred_new = results.get_prediction(X_new)
pred_summary = pred_new.summary_frame()

# Acessar os intervalos
mean_ci_lower = pred_summary["mean_ci_lower"]
mean_ci_upper = pred_summary["mean_ci_upper"]
obs_ci_lower = pred_summary["obs_ci_lower"]  # Intervalos de predição
obs_ci_upper = pred_summary["obs_ci_upper"]
```

**API de fórmula (estilo R):**
```python
import statsmodels.formula.api as smf

# Tratamento automático de variáveis categóricas e interações
formula = 'y ~ x1 + x2 + C(category) + x1:x2'
results = smf.ols(formula, data=df).fit()
```

### WLS (Mínimos Quadrados Ponderados)

Trata erros heterocedásticos (Σ diagonal), nos quais a variância difere entre observações.

**Quando usar:**
- Heterocedasticidade conhecida (variância dos erros não constante)
- Observações diferentes têm confiabilidades diferentes
- Os pesos são conhecidos ou podem ser estimados

**Uso:**
```python
# Se você conhece os pesos (inverso da variância)
weights = 1 / error_variance
model = sm.WLS(y, X, weights=weights)
results = model.fit()

# Padrões comuns de pesos:
# - 1/variância: quando a variância é conhecida
# - n_i: tamanho da amostra para dados agrupados
# - 1/x: quando a variância é proporcional a x
```

**WLS Factível (estimando os pesos):**
```python
# Etapa 1: Ajustar OLS
ols_results = sm.OLS(y, X).fit()

# Etapa 2: Modelar os resíduos ao quadrado para estimar a variância
abs_resid = np.abs(ols_results.resid)
variance_model = sm.OLS(np.log(abs_resid**2), X).fit()

# Etapa 3: Usar a variância estimada como pesos
weights = 1 / np.exp(variance_model.fittedvalues)
wls_results = sm.WLS(y, X, weights=weights).fit()
```

### GLS (Mínimos Quadrados Generalizados)

Trata estrutura de covariância arbitrária (Σ). É a superclasse para os demais métodos de regressão.

**Quando usar:**
- Estrutura de covariância conhecida
- Erros correlacionados
- Mais geral do que o WLS

**Uso:**
```python
# Especificar a estrutura de covariância
# Sigma deve ser uma matriz de covariância (n x n)
model = sm.GLS(y, X, sigma=Sigma)
results = model.fit()
```

### GLSAR (GLS com Erros Autorregressivos)

Mínimos quadrados generalizados factíveis com erros AR(p) para dados de séries temporais.

**Quando usar:**
- Regressão de séries temporais com erros autocorrelacionados
- Necessidade de considerar a correlação serial
- Violações da independência dos erros

**Uso:**
```python
# Erros AR(1)
model = sm.GLSAR(y, X, rho=1)  # rho=1 para AR(1), rho=2 para AR(2), etc.
results = model.iterative_fit()  # Estima os parâmetros AR iterativamente

print(results.summary())
print(f"Rho estimado: {results.model.rho}")
```

### RLS (Mínimos Quadrados Recursivos)

Estimação sequencial de parâmetros, útil para aprendizado adaptativo ou online.

**Quando usar:**
- Os parâmetros mudam ao longo do tempo
- Dados online/em fluxo contínuo
- Deseja-se observar a evolução dos parâmetros

**Uso:**
```python
from statsmodels.regression.recursive_ls import RecursiveLS

model = RecursiveLS(y, X)
results = model.fit()

# Acessar parâmetros variáveis no tempo
params_over_time = results.recursive_coefficients
cusum = results.cusum  # Estatística CUSUM para quebras estruturais
```

### Regressões Móveis (Rolling)

Calcula estimativas em janelas móveis para detecção de parâmetros variáveis no tempo.

**Quando usar:**
- Os parâmetros variam ao longo do tempo
- Deseja-se detectar mudanças estruturais
- Séries temporais com relações que evoluem

**Uso:**
```python
from statsmodels.regression.rolling import RollingOLS, RollingWLS

# OLS móvel com janela de 60 períodos
rolling_model = RollingOLS(y, X, window=60)
rolling_results = rolling_model.fit()

# Extrair parâmetros variáveis no tempo
rolling_params = rolling_results.params  # DataFrame com parâmetros ao longo do tempo
rolling_rsquared = rolling_results.rsquared

# Plotar a evolução dos parâmetros
import matplotlib.pyplot as plt
rolling_params.plot()
plt.title('Coeficientes Variáveis no Tempo')
plt.show()
```

### Regressão Quantílica

Analisa quantis condicionais em vez da média condicional.

**Quando usar:**
- Interesse em quantis (mediana, percentil 90, etc.)
- Robustez a outliers (regressão da mediana)
- Efeitos distribucionais entre quantis
- Efeitos heterogêneos

**Uso:**
```python
from statsmodels.regression.quantile_regression import QuantReg

# Regressão da mediana (percentil 50)
model = QuantReg(y, X)
results_median = model.fit(q=0.5)

# Múltiplos quantis
quantiles = [0.1, 0.25, 0.5, 0.75, 0.9]
results_dict = {}
for q in quantiles:
    results_dict[q] = model.fit(q=q)

# Plotar efeitos variáveis por quantil
import matplotlib.pyplot as plt
coef_dict = {q: res.params for q, res in results_dict.items()}
coef_df = pd.DataFrame(coef_dict).T
coef_df.plot()
plt.xlabel('Quantil')
plt.ylabel('Coeficiente')
plt.show()
```

## Modelos de Efeitos Mistos

Para dados hierárquicos/aninhados com efeitos aleatórios.

**Quando usar:**
- Dados agrupados/clusterizados (estudantes em escolas, pacientes em hospitais)
- Medidas repetidas
- Necessidade de efeitos aleatórios para considerar o agrupamento

**Uso:**
```python
from statsmodels.regression.mixed_linear_model import MixedLM

# Modelo de intercepto aleatório
model = MixedLM(y, X, groups=group_ids)
results = model.fit()

# Intercepto e inclinação aleatórios
model = MixedLM(y, X, groups=group_ids, exog_re=X_random)
results = model.fit()

print(results.summary())
```

## Diagnósticos e Avaliação do Modelo

### Análise de Resíduos

```python
# Gráficos básicos de resíduos
import matplotlib.pyplot as plt

# Resíduos vs. valores ajustados
plt.scatter(results.fittedvalues, results.resid)
plt.xlabel('Valores ajustados')
plt.ylabel('Resíduos')
plt.axhline(y=0, color='r', linestyle='--')
plt.title('Resíduos vs. Valores Ajustados')
plt.show()

# Gráfico Q-Q para normalidade
from statsmodels.graphics.gofplots import qqplot
qqplot(results.resid, line='s')
plt.show()

# Histograma dos resíduos
plt.hist(results.resid, bins=30, edgecolor='black')
plt.xlabel('Resíduos')
plt.ylabel('Frequência')
plt.title('Distribuição dos Resíduos')
plt.show()
```

### Testes de Especificação

```python
from statsmodels.stats.diagnostic import het_breuschpagan, het_white
from statsmodels.stats.stattools import durbin_watson, jarque_bera

# Testes de heterocedasticidade
lm_stat, lm_pval, f_stat, f_pval = het_breuschpagan(results.resid, X)
print(f"Valor-p do teste de Breusch-Pagan: {lm_pval}")

# Teste de White
white_test = het_white(results.resid, X)
print(f"Valor-p do teste de White: {white_test[1]}")

# Autocorrelação
dw_stat = durbin_watson(results.resid)
print(f"Estatística de Durbin-Watson: {dw_stat}")
# DW ~ 2 indica ausência de autocorrelação
# DW < 2 sugere autocorrelação positiva
# DW > 2 sugere autocorrelação negativa

# Teste de normalidade
jb_stat, jb_pval, skew, kurtosis = jarque_bera(results.resid)
print(f"Valor-p do teste de Jarque-Bera: {jb_pval}")
```

### Multicolinearidade

```python
from statsmodels.stats.outliers_influence import variance_inflation_factor

# Calcular o VIF para cada variável
vif_data = pd.DataFrame()
vif_data["Variable"] = X.columns
vif_data["VIF"] = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]

print(vif_data)
# VIF > 10 indica multicolinearidade problemática
# VIF > 5 sugere multicolinearidade moderada

# Número de condição (a partir do summary)
print(f"Número de condição: {results.condition_number}")
# Número de condição > 20 sugere multicolinearidade
# Número de condição > 30 indica problemas graves
```

### Estatísticas de Influência

```python
from statsmodels.stats.outliers_influence import OLSInfluence

influence = results.get_influence()

# Alavancagem (leverage / hat values)
leverage = influence.hat_matrix_diag
# Alta alavancagem: > 2*p/n (p=preditores, n=observações)

# Distância de Cook
cooks_d = influence.cooks_distance[0]
# Influente se a Distância de Cook > 4/n

# DFFITS
dffits = influence.dffits[0]
# Influente se |DFFITS| > 2*sqrt(p/n)

# Criar gráfico de influência
from statsmodels.graphics.regressionplots import influence_plot
fig, ax = plt.subplots(figsize=(12, 8))
influence_plot(results, ax=ax)
plt.show()
```

### Testes de Hipótese

```python
# Testar um único coeficiente
# H0: beta_i = 0 (já presente automaticamente no summary)

# Testar múltiplas restrições usando o teste F
# Exemplo: testar beta_1 = beta_2 = 0
R = [[0, 1, 0, 0], [0, 0, 1, 0]]  # Matriz de restrições
f_test = results.f_test(R)
print(f_test)

# Teste de hipótese baseado em fórmula
f_test = results.f_test("x1 = x2 = 0")
print(f_test)

# Testar combinação linear: beta_1 + beta_2 = 1
r_matrix = [[0, 1, 1, 0]]
q_matrix = [1]  # Valor do lado direito (RHS)
f_test = results.f_test((r_matrix, q_matrix))
print(f_test)

# Teste de Wald (equivalente ao teste F para restrições lineares)
wald_test = results.wald_test(R)
print(wald_test)
```

## Comparação de Modelos

```python
# Comparar modelos aninhados usando o teste da razão de verossimilhança (se usando MLE)
from statsmodels.stats.anova import anova_lm

# Ajustar os modelos restrito e irrestrito
model_restricted = sm.OLS(y, X_restricted).fit()
model_full = sm.OLS(y, X_full).fit()

# Tabela ANOVA para comparação de modelos
anova_results = anova_lm(model_restricted, model_full)
print(anova_results)

# AIC/BIC para comparação de modelos não aninhados
print(f"AIC do Modelo 1: {model1.aic}, BIC: {model1.bic}")
print(f"AIC do Modelo 2: {model2.aic}, BIC: {model2.bic}")
# Valores menores de AIC/BIC indicam um modelo melhor
```

## Erros-Padrão Robustos

Tratam heterocedasticidade ou clusterização sem necessidade de reponderação.

```python
# Erros-padrão robustos à heterocedasticidade (HC)
results_hc = results.get_robustcov_results(cov_type='HC0')  # De White
results_hc1 = results.get_robustcov_results(cov_type='HC1')
results_hc2 = results.get_robustcov_results(cov_type='HC2')
results_hc3 = results.get_robustcov_results(cov_type='HC3')  # Mais conservador

# Newey-West HAC (consistente à heterocedasticidade e autocorrelação)
results_hac = results.get_robustcov_results(cov_type='HAC', maxlags=4)

# Erros-padrão robustos por cluster
results_cluster = results.get_robustcov_results(cov_type='cluster',
                                                groups=cluster_ids)

# Visualizar os resultados robustos
print(results_hc3.summary())
```

## Boas Práticas

1. **Sempre adicione a constante**: use `sm.add_constant()`, a menos que você queira especificamente excluir o intercepto
2. **Verifique os pressupostos**: execute testes diagnósticos (heterocedasticidade, autocorrelação, normalidade)
3. **Use a API de fórmula para variáveis categóricas**: `smf.ols()` trata variáveis categóricas automaticamente
4. **Erros-padrão robustos**: use quando houver heterocedasticidade detectada, mas a especificação do modelo estiver correta
5. **Seleção de modelo**: use AIC/BIC para modelos não aninhados, teste F/razão de verossimilhança para modelos aninhados
6. **Outliers e influência**: sempre verifique a distância de Cook e a alavancagem
7. **Multicolinearidade**: verifique o VIF e o número de condição antes da interpretação
8. **Séries temporais**: use `GLSAR` ou erros-padrão HAC robustos para erros autocorrelacionados
9. **Dados agrupados**: considere modelos de efeitos mistos ou erros-padrão robustos por cluster
10. **Regressão quantílica**: use para estimação robusta ou quando o interesse estiver em efeitos distribucionais

## Armadilhas Comuns

1. **Esquecer de adicionar a constante**: resulta em um modelo sem intercepto
2. **Ignorar a heterocedasticidade**: use WLS ou erros-padrão robustos
3. **Usar OLS com erros autocorrelacionados**: use GLSAR ou erros-padrão HAC
4. **Interpretar em excesso na presença de multicolinearidade**: verifique o VIF primeiro
5. **Não verificar os resíduos**: sempre plote os resíduos vs. valores ajustados
6. **Usar resíduos de t-SNE/PCA**: os resíduos devem ser do espaço original
7. **Confundir intervalos de predição com intervalos de confiança**: os intervalos de predição são mais largos
8. **Não tratar adequadamente variáveis categóricas**: use a API de fórmula ou codificação manual de dummies
9. **Comparar modelos com tamanhos de amostra diferentes**: garanta que as mesmas observações sejam usadas
10. **Ignorar observações influentes**: verifique a distância de Cook e o DFFITS
