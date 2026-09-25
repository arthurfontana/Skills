---
name: statsmodels
description: Kit de modelagem estatística. OLS, GLM, regressão logística, ARIMA, séries temporais, testes de hipótese, diagnósticos, AIC/BIC, para inferência estatística rigorosa e análise econométrica.
metadata:
  mcpmarket-version: 1.0.0
---
# Statsmodels: Modelagem Estatística e Econometria

## Visão Geral

Statsmodels é a biblioteca Python de referência para modelagem estatística, oferecendo ferramentas para estimação, inferência e diagnósticos em uma ampla gama de métodos estatísticos. Aplique esta skill para análises estatísticas rigorosas, desde regressão linear simples até modelos complexos de séries temporais e análises econométricas.

## Quando Usar Esta Skill

Esta skill deve ser usada quando:
- Ajustar modelos de regressão (OLS, WLS, GLS, regressão quantílica)
- Realizar modelagem linear generalizada (logística, Poisson, Gama, etc.)
- Analisar resultados discretos (binário, multinomial, contagem, ordinal)
- Conduzir análise de séries temporais (ARIMA, SARIMAX, VAR, previsão)
- Executar testes estatísticos e diagnósticos
- Testar pressupostos do modelo (heterocedasticidade, autocorrelação, normalidade)
- Detectar outliers e observações influentes
- Comparar modelos (AIC/BIC, testes de razão de verossimilhança)
- Estimar efeitos causais
- Produzir tabelas estatísticas e inferências prontas para publicação

## Guia de Início Rápido

### Regressão Linear (OLS)

```python
import statsmodels.api as sm
import numpy as np
import pandas as pd

# Preparar os dados - SEMPRE adicione a constante para o intercepto
X = sm.add_constant(X_data)

# Ajustar o modelo OLS
model = sm.OLS(y, X)
results = model.fit()

# Ver os resultados completos
print(results.summary())

# Resultados principais
print(f"R-squared: {results.rsquared:.4f}")
print(f"Coefficients:\\n{results.params}")
print(f"P-values:\\n{results.pvalues}")

# Previsões com intervalos de confiança
predictions = results.get_prediction(X_new)
pred_summary = predictions.summary_frame()
print(pred_summary)  # inclui média, IC e intervalos de previsão

# Diagnósticos
from statsmodels.stats.diagnostic import het_breuschpagan
bp_test = het_breuschpagan(results.resid, X)
print(f"Breusch-Pagan p-value: {bp_test[1]:.4f}")

# Visualizar resíduos
import matplotlib.pyplot as plt
plt.scatter(results.fittedvalues, results.resid)
plt.axhline(y=0, color='r', linestyle='--')
plt.xlabel('Fitted values')
plt.ylabel('Residuals')
plt.show()
```

### Regressão Logística (Resultados Binários)

```python
from statsmodels.discrete.discrete_model import Logit

# Adicionar constante
X = sm.add_constant(X_data)

# Ajustar o modelo logit
model = Logit(y_binary, X)
results = model.fit()

print(results.summary())

# Razões de chance (odds ratios)
odds_ratios = np.exp(results.params)
print("Odds ratios:\\n", odds_ratios)

# Probabilidades previstas
probs = results.predict(X)

# Previsões binárias (limiar de 0,5)
predictions = (probs > 0.5).astype(int)

# Avaliação do modelo
from sklearn.metrics import classification_report, roc_auc_score

print(classification_report(y_binary, predictions))
print(f"AUC: {roc_auc_score(y_binary, probs):.4f}")

# Efeitos marginais
marginal = results.get_margeff()
print(marginal.summary())
```

### Séries Temporais (ARIMA)

```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

# Verificar estacionariedade
from statsmodels.tsa.stattools import adfuller

adf_result = adfuller(y_series)
print(f"ADF p-value: {adf_result[1]:.4f}")

if adf_result[1] > 0.05:
    # Série não é estacionária, diferenciar
    y_diff = y_series.diff().dropna()

# Plotar ACF/PACF para identificar p, q
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
plot_acf(y_diff, lags=40, ax=ax1)
plot_pacf(y_diff, lags=40, ax=ax2)
plt.show()

# Ajustar ARIMA(p,d,q)
model = ARIMA(y_series, order=(1, 1, 1))
results = model.fit()

print(results.summary())

# Previsão
forecast = results.forecast(steps=10)
forecast_obj = results.get_forecast(steps=10)
forecast_df = forecast_obj.summary_frame()

print(forecast_df)  # inclui média e intervalos de confiança

# Diagnóstico dos resíduos
results.plot_diagnostics(figsize=(12, 8))
plt.show()
```

### Modelos Lineares Generalizados (GLM)

```python
import statsmodels.api as sm

# Regressão de Poisson para dados de contagem
X = sm.add_constant(X_data)
model = sm.GLM(y_counts, X, family=sm.families.Poisson())
results = model.fit()

print(results.summary())

# Razões de taxa (para Poisson com função de ligação log)
rate_ratios = np.exp(results.params)
print("Rate ratios:\\n", rate_ratios)

# Verificar superdispersão
overdispersion = results.pearson_chi2 / results.df_resid
print(f"Overdispersion: {overdispersion:.2f}")

if overdispersion > 1.5:
    # Usar Binomial Negativa em vez de Poisson
    from statsmodels.discrete.count_model import NegativeBinomial
    nb_model = NegativeBinomial(y_counts, X)
    nb_results = nb_model.fit()
    print(nb_results.summary())
```

## Capacidades Principais de Modelagem Estatística

### 1. Modelos de Regressão Linear

Conjunto abrangente de modelos lineares para resultados contínuos com várias estruturas de erro.

**Modelos disponíveis:**
- **OLS**: Regressão linear padrão com erros i.i.d.
- **WLS**: Mínimos quadrados ponderados para erros heterocedásticos
- **GLS**: Mínimos quadrados generalizados para estrutura de covariância arbitrária
- **GLSAR**: GLS com erros autorregressivos para séries temporais
- **Regressão Quantílica**: Quantis condicionais (robusta a outliers)
- **Efeitos Mistos**: Modelos hierárquicos/multinível com efeitos aleatórios
- **Recursiva/Móvel**: Estimação de parâmetros variantes no tempo

**Principais recursos:**
- Testes diagnósticos abrangentes
- Erros-padrão robustos (HC, HAC, robustos por cluster)
- Estatísticas de influência (distância de Cook, alavancagem, DFFITS)
- Testes de hipótese (testes F, testes de Wald)
- Comparação de modelos (AIC, BIC, testes de razão de verossimilhança)
- Previsão com intervalos de confiança e de previsão

**Quando usar:** Variável de resultado contínua, quando se deseja inferência sobre os coeficientes e diagnósticos

**Referência:** Veja `references/linear_models.md` para orientação detalhada sobre seleção de modelo, diagnósticos e boas práticas.

### 2. Modelos Lineares Generalizados (GLM)

Framework flexível que estende os modelos lineares para distribuições não normais.

**Famílias de distribuição:**
- **Binomial**: Resultados binários ou proporções (regressão logística)
- **Poisson**: Dados de contagem
- **Binomial Negativa**: Contagens superdispersas
- **Gama**: Dados contínuos positivos, assimétricos à direita
- **Gaussiana Inversa**: Dados contínuos positivos com estrutura de variância específica
- **Gaussiana**: Equivalente ao OLS
- **Tweedie**: Família flexível para dados semi-contínuos

**Funções de ligação:**
- Logit, Probit, Log, Identidade, Inversa, Raiz Quadrada, CLogLog, Potência
- Escolha com base nas necessidades de interpretação e no ajuste do modelo

**Principais recursos:**
- Estimação por máxima verossimilhança via IRLS
- Resíduos de deviance e de Pearson
- Estatísticas de qualidade de ajuste
- Medidas de pseudo R-quadrado
- Erros-padrão robustos

**Quando usar:** Resultados não normais, quando é necessária flexibilidade na variância e na função de ligação

**Referência:** Veja `references/glm.md` para seleção de família, funções de ligação, interpretação e diagnósticos.

### 3. Modelos de Escolha Discreta

Modelos para resultados categóricos e de contagem.

**Modelos binários:**
- **Logit**: Regressão logística (razões de chance)
- **Probit**: Regressão probit (distribuição normal)

**Modelos multinomiais:**
- **MNLogit**: Categorias não ordenadas (3+ níveis)
- **Logit Condicional**: Modelos de escolha com variáveis específicas de alternativa
- **Modelo Ordenado**: Resultados ordinais (categorias ordenadas)

**Modelos de contagem:**
- **Poisson**: Modelo de contagem padrão
- **Binomial Negativa**: Contagens superdispersas
- **Zero-Inflacionado**: Excesso de zeros (ZIP, ZINB)
- **Modelos Hurdle**: Modelos em dois estágios para dados com muitos zeros

**Principais recursos:**
- Estimação por máxima verossimilhança
- Efeitos marginais nas médias ou efeitos marginais médios
- Comparação de modelos via AIC/BIC
- Probabilidades previstas e classificação
- Testes de qualidade de ajuste

**Quando usar:** Resultados binários, categóricos ou de contagem

**Referência:** Veja `references/discrete_choice.md` para seleção de modelo, interpretação e avaliação.

### 4. Análise de Séries Temporais

Capacidades abrangentes de modelagem e previsão de séries temporais.

**Modelos univariados:**
- **AutoReg (AR)**: Modelos autorregressivos
- **ARIMA**: Média móvel integrada autorregressiva
- **SARIMAX**: ARIMA sazonal com variáveis exógenas
- **Suavização Exponencial**: Simples, Holt, Holt-Winters
- **ETS**: Modelos de espaço de estados de inovação

**Modelos multivariados:**
- **VAR**: Vetores autorregressivos
- **VARMAX**: VAR com MA e variáveis exógenas
- **Modelos de Fatores Dinâmicos**: Extração de fatores comuns
- **VECM**: Modelos vetoriais de correção de erros (cointegração)

**Modelos avançados:**
- **Espaço de Estados**: Filtragem de Kalman, especificações customizadas
- **Mudança de Regime**: Modelos de troca markoviana
- **ARDL**: Defasagem distribuída autorregressiva

**Principais recursos:**
- Análise ACF/PACF para identificação do modelo
- Testes de estacionariedade (ADF, KPSS)
- Previsão com intervalos de previsão
- Diagnóstico de resíduos (Ljung-Box, heterocedasticidade)
- Teste de causalidade de Granger
- Funções de resposta a impulso (IRF)
- Decomposição da variância do erro de previsão (FEVD)

**Quando usar:** Dados ordenados no tempo, previsão, entendimento de dinâmicas temporais

**Referência:** Veja `references/time_series.md` para seleção de modelo, diagnósticos e métodos de previsão.

### 5. Testes Estatísticos e Diagnósticos

Amplas capacidades de teste e diagnóstico para validação de modelos.

**Diagnósticos de resíduos:**
- Testes de autocorrelação (Ljung-Box, Durbin-Watson, Breusch-Godfrey)
- Testes de heterocedasticidade (Breusch-Pagan, White, ARCH)
- Testes de normalidade (Jarque-Bera, Omnibus, Anderson-Darling, Lilliefors)
- Testes de especificação (RESET, Harvey-Collier)

**Influência e outliers:**
- Alavancagem (hat values)
- Distância de Cook
- DFFITS e DFBETAs
- Resíduos estudentizados
- Gráficos de influência

**Testes de hipótese:**
- Testes t (uma amostra, duas amostras, pareado)
- Testes de proporção
- Testes qui-quadrado
- Testes não paramétricos (Mann-Whitney, Wilcoxon, Kruskal-Wallis)
- ANOVA (um fator, dois fatores, medidas repetidas)

**Comparações múltiplas:**
- HSD de Tukey
- Correção de Bonferroni
- Taxa de Descoberta Falsa (FDR)

**Tamanhos de efeito e poder:**
- Cohen's d, eta-quadrado
- Análise de poder para testes t, proporções
- Cálculos de tamanho de amostra

**Inferência robusta:**
- Erros-padrão consistentes à heterocedasticidade (HC0-HC3)
- Erros-padrão HAC (Newey-West)
- Erros-padrão robustos por cluster

**Quando usar:** Validação de pressupostos, detecção de problemas, garantia de inferência robusta

**Referência:** Veja `references/stats_diagnostics.md` para procedimentos abrangentes de teste e diagnóstico.

## API de Fórmulas (Estilo R)

Statsmodels suporta fórmulas no estilo R para especificação intuitiva de modelos:

```python
import statsmodels.formula.api as smf

# OLS com fórmula
results = smf.ols('y ~ x1 + x2 + x1:x2', data=df).fit()

# Variáveis categóricas (codificação dummy automática)
results = smf.ols('y ~ x1 + C(category)', data=df).fit()

# Interações
results = smf.ols('y ~ x1 * x2', data=df).fit()  # x1 + x2 + x1:x2

# Termos polinomiais
results = smf.ols('y ~ x + I(x**2)', data=df).fit()

# Logit
results = smf.logit('y ~ x1 + x2 + C(group)', data=df).fit()

# Poisson
results = smf.poisson('count ~ x1 + x2', data=df).fit()

# ARIMA (não disponível via fórmula, usar a API regular)
```

## Seleção e Comparação de Modelos

### Critérios de Informação

```python
# Comparar modelos usando AIC/BIC
models = {
    'Model 1': model1_results,
    'Model 2': model2_results,
    'Model 3': model3_results
}

comparison = pd.DataFrame({
    'AIC': {name: res.aic for name, res in models.items()},
    'BIC': {name: res.bic for name, res in models.items()},
    'Log-Likelihood': {name: res.llf for name, res in models.items()}
})

print(comparison.sort_values('AIC'))
# AIC/BIC menores indicam um modelo melhor
```

### Teste de Razão de Verossimilhança (Modelos Aninhados)

```python
# Para modelos aninhados (um é subconjunto do outro)
from scipy import stats

lr_stat = 2 * (full_model.llf - reduced_model.llf)
df = full_model.df_model - reduced_model.df_model
p_value = 1 - stats.chi2.cdf(lr_stat, df)

print(f"LR statistic: {lr_stat:.4f}")
print(f"p-value: {p_value:.4f}")

if p_value < 0.05:
    print("Full model significantly better")
else:
    print("Reduced model preferred (parsimony)")
```

### Validação Cruzada

```python
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error

kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = []

for train_idx, val_idx in kf.split(X):
    X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

    # Ajustar o modelo
    model = sm.OLS(y_train, X_train).fit()

    # Prever
    y_pred = model.predict(X_val)

    # Calcular o score
    rmse = np.sqrt(mean_squared_error(y_val, y_pred))
    cv_scores.append(rmse)

print(f"CV RMSE: {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")
```

## Boas Práticas

### Preparação dos Dados

1. **Sempre adicione a constante**: Use `sm.add_constant()`, a menos que se queira excluir o intercepto
2. **Verifique valores ausentes**: Trate ou impute antes de ajustar
3. **Padronize se necessário**: Melhora a convergência e a interpretação (mas não é obrigatório para modelos de árvore)
4. **Codifique variáveis categóricas**: Use a API de fórmulas ou codificação dummy manual

### Construção do Modelo

1. **Comece simples**: Inicie com um modelo básico e adicione complexidade conforme necessário
2. **Verifique os pressupostos**: Teste resíduos, heterocedasticidade, autocorrelação
3. **Use o modelo apropriado**: Combine o modelo com o tipo de resultado (binário→Logit, contagem→Poisson)
4. **Considere alternativas**: Se os pressupostos forem violados, use métodos robustos ou um modelo diferente

### Inferência

1. **Reporte tamanhos de efeito**: Não apenas p-valores
2. **Use erros-padrão robustos**: Quando houver heterocedasticidade ou clusterização
3. **Comparações múltiplas**: Corrija ao testar muitas hipóteses
4. **Intervalos de confiança**: Sempre reporte junto com as estimativas pontuais

### Avaliação do Modelo

1. **Verifique os resíduos**: Plote resíduos vs. valores ajustados, gráfico Q-Q
2. **Diagnóstico de influência**: Identifique e investigue observações influentes
3. **Validação fora da amostra**: Teste em conjunto de retenção (holdout) ou faça validação cruzada
4. **Compare modelos**: Use AIC/BIC para não aninhados, teste LR para aninhados

### Relato de Resultados

1. **Resumo abrangente**: Use `.summary()` para saída detalhada
2. **Documente decisões**: Registre transformações, observações excluídas
3. **Interprete com cuidado**: Considere as funções de ligação (ex.: exp(β) para ligação log)
4. **Visualize**: Plote previsões, intervalos de confiança e diagnósticos

## Fluxos de Trabalho Comuns

### Fluxo de Trabalho 1: Análise de Regressão Linear

1. Explorar os dados (gráficos, estatísticas descritivas)
2. Ajustar o modelo OLS inicial
3. Verificar diagnóstico de resíduos
4. Testar heterocedasticidade e autocorrelação
5. Verificar multicolinearidade (VIF)
6. Identificar observações influentes
7. Reajustar com erros-padrão robustos, se necessário
8. Interpretar coeficientes e inferência
9. Validar em conjunto de retenção ou via validação cruzada

### Fluxo de Trabalho 2: Classificação Binária

1. Ajustar a regressão logística (Logit)
2. Verificar problemas de convergência
3. Interpretar as razões de chance
4. Calcular efeitos marginais
5. Avaliar o desempenho de classificação (AUC, matriz de confusão)
6. Verificar observações influentes
7. Comparar com modelos alternativos (Probit)
8. Validar previsões em conjunto de teste

### Fluxo de Trabalho 3: Análise de Dados de Contagem

1. Ajustar a regressão de Poisson
2. Verificar superdispersão
3. Se houver superdispersão, ajustar Binomial Negativa
4. Verificar excesso de zeros (considerar ZIP/ZINB)
5. Interpretar razões de taxa
6. Avaliar qualidade de ajuste
7. Comparar modelos via AIC
8. Validar previsões

### Fluxo de Trabalho 4: Previsão de Séries Temporais

1. Plotar a série, verificar tendência/sazonalidade
2. Testar estacionariedade (ADF, KPSS)
3. Diferenciar se não estacionária
4. Identificar p, q a partir de ACF/PACF
5. Ajustar ARIMA ou SARIMAX
6. Verificar diagnóstico de resíduos (Ljung-Box)
7. Gerar previsões com intervalos de confiança
8. Avaliar a acurácia da previsão em conjunto de teste

## Documentação de Referência

Esta skill inclui arquivos de referência abrangentes para orientação detalhada:

### references/linear_models.md
Cobertura detalhada de modelos de regressão linear, incluindo:
- OLS, WLS, GLS, GLSAR, Regressão Quantílica
- Modelos de efeitos mistos
- Regressão recursiva e móvel
- Diagnósticos abrangentes (heterocedasticidade, autocorrelação, multicolinearidade)
- Estatísticas de influência e detecção de outliers
- Erros-padrão robustos (HC, HAC, cluster)
- Testes de hipótese e comparação de modelos

### references/glm.md
Guia completo de modelos lineares generalizados:
- Todas as famílias de distribuição (Binomial, Poisson, Gama, etc.)
- Funções de ligação e quando usar cada uma
- Ajuste e interpretação do modelo
- Pseudo R-quadrado e qualidade de ajuste
- Diagnósticos e análise de resíduos
- Aplicações (regressão logística, de Poisson, Gama)

### references/discrete_choice.md
Guia abrangente de modelos de resultado discreto:
- Modelos binários (Logit, Probit)
- Modelos multinomiais (MNLogit, Logit Condicional)
- Modelos de contagem (Poisson, Binomial Negativa, Zero-Inflacionado, Hurdle)
- Modelos ordinais
- Efeitos marginais e interpretação
- Diagnóstico e comparação de modelos

### references/time_series.md
Orientação aprofundada sobre análise de séries temporais:
- Modelos univariados (AR, ARIMA, SARIMAX, Suavização Exponencial)
- Modelos multivariados (VAR, VARMAX, Fatores Dinâmicos)
- Modelos de espaço de estados
- Testes de estacionariedade e diagnósticos
- Métodos de previsão e avaliação
- Causalidade de Granger, IRF, FEVD

### references/stats_diagnostics.md
Testes e diagnósticos estatísticos abrangentes:
- Diagnóstico de resíduos (autocorrelação, heterocedasticidade, normalidade)
- Detecção de influência e outliers
- Testes de hipótese (paramétricos e não paramétricos)
- ANOVA e testes post-hoc
- Correção de comparações múltiplas
- Matrizes de covariância robustas
- Análise de poder e tamanhos de efeito

**Quando consultar:**
- Precisar de explicações detalhadas de parâmetros
- Escolher entre modelos semelhantes
- Resolver problemas de convergência ou de diagnóstico
- Entender estatísticas de teste específicas
- Buscar exemplos de código para recursos avançados

**Padrões de busca:**
```bash
# Encontrar informações sobre modelos específicos
grep -r "Quantile Regression" references/

# Encontrar testes diagnósticos
grep -r "Breusch-Pagan" references/stats_diagnostics.md

# Encontrar orientação sobre séries temporais
grep -r "SARIMAX" references/time_series.md
```

## Armadilhas Comuns a Evitar

1. **Esquecer o termo constante**: Sempre use `sm.add_constant()`, a menos que não queira intercepto
2. **Ignorar pressupostos**: Verifique resíduos, heterocedasticidade, autocorrelação
3. **Modelo errado para o tipo de resultado**: Binário→Logit/Probit, Contagem→Poisson/BN, não OLS
4. **Não verificar convergência**: Fique atento a avisos de otimização
5. **Interpretar mal os coeficientes**: Lembre-se das funções de ligação (log, logit, etc.)
6. **Usar Poisson com superdispersão**: Verifique a dispersão, use Binomial Negativa se necessário
7. **Não usar erros-padrão robustos**: Quando houver heterocedasticidade ou clusterização
8. **Sobreajuste (overfitting)**: Muitos parâmetros em relação ao tamanho da amostra
9. **Vazamento de dados**: Ajustar no conjunto de teste ou usar informação futura
10. **Não validar previsões**: Sempre verifique o desempenho fora da amostra
11. **Comparar modelos não aninhados incorretamente**: Use AIC/BIC, não teste LR
12. **Ignorar observações influentes**: Verifique a distância de Cook e a alavancagem
13. **Testes múltiplos**: Corrija os p-valores ao testar muitas hipóteses
14. **Não diferenciar séries temporais**: Ajustar ARIMA em dados não estacionários
15. **Confundir intervalos de previsão com intervalos de confiança**: Intervalos de previsão são mais largos

## Obtendo Ajuda

Para documentação e exemplos detalhados:
- Documentação oficial: https://www.statsmodels.org/stable/
- Guia do usuário: https://www.statsmodels.org/stable/user-guide.html
- Exemplos: https://www.statsmodels.org/stable/examples/index.html
- Referência da API: https://www.statsmodels.org/stable/api.html
</content>
