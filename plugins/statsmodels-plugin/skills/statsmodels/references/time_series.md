# Referência de Análise de Séries Temporais

Este documento fornece orientação abrangente sobre modelos de séries temporais no statsmodels, incluindo ARIMA, modelos de espaço de estados, VAR, suavização exponencial e métodos de previsão.

## Visão Geral

O statsmodels oferece amplas capacidades de séries temporais:
- **Modelos univariados**: AR, ARIMA, SARIMAX, Suavização Exponencial
- **Modelos multivariados**: VAR, VARMAX, Modelos de Fatores Dinâmicos
- **Framework de espaço de estados**: Modelos customizados, filtragem de Kalman
- **Ferramentas de diagnóstico**: ACF, PACF, testes de estacionariedade, análise de resíduos
- **Previsão**: Previsões pontuais e intervalos de previsão

## Modelos Univariados de Séries Temporais

### AutoReg (Modelo AR)

Modelo autorregressivo: o valor atual depende de valores passados.

**Quando usar:**
- Série temporal univariada
- Valores passados predizem o futuro
- Série estacionária

**Modelo**: yₜ = c + φ₁yₜ₋₁ + φ₂yₜ₋₂ + ... + φₚyₜ₋ₚ + εₜ

```python
from statsmodels.tsa.ar_model import AutoReg
import pandas as pd

# Ajustar modelo AR(p)
model = AutoReg(y, lags=5)  # AR(5)
results = model.fit()

print(results.summary())
```

**Com regressores exógenos:**
```python
# AR com variáveis exógenas (ARX)
model = AutoReg(y, lags=5, exog=X_exog)
results = model.fit()
```

**AR sazonal:**
```python
# Defasagens sazonais (ex.: dados mensais com sazonalidade anual)
model = AutoReg(y, lags=12, seasonal=True)
results = model.fit()
```

### ARIMA (Autorregressivo Integrado de Médias Móveis)

Combina os componentes AR, diferenciação (I) e MA.

**Quando usar:**
- Série temporal não estacionária (precisa de diferenciação)
- Valores passados e erros predizem o futuro
- Modelo flexível para muitas séries temporais

**Modelo**: ARIMA(p,d,q)
- p: ordem AR (defasagens)
- d: ordem de diferenciação (para obter estacionariedade)
- q: ordem MA (erros de previsão defasados)

```python
from statsmodels.tsa.arima.model import ARIMA

# Ajustar ARIMA(p,d,q)
model = ARIMA(y, order=(1, 1, 1))  # ARIMA(1,1,1)
results = model.fit()

print(results.summary())
```

**Escolhendo p, d, q:**

1. **Determinar d (ordem de diferenciação)**:
```python
from statsmodels.tsa.stattools import adfuller

# Teste ADF para estacionariedade
def check_stationarity(series):
    result = adfuller(series)
    print(f"Estatística ADF: {result[0]:.4f}")
    print(f"valor-p: {result[1]:.4f}")
    if result[1] <= 0.05:
        print("A série é estacionária")
        return True
    else:
        print("A série é não estacionária, precisa de diferenciação")
        return False

# Testar a série original
if not check_stationarity(y):
    # Diferenciar uma vez
    y_diff = y.diff().dropna()
    if not check_stationarity(y_diff):
        # Diferenciar novamente
        y_diff2 = y_diff.diff().dropna()
        check_stationarity(y_diff2)
```

2. **Determinar p e q (ACF/PACF)**:
```python
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
import matplotlib.pyplot as plt

# Após diferenciar até a estacionariedade
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

# ACF: ajuda a determinar q (ordem MA)
plot_acf(y_stationary, lags=40, ax=ax1)
ax1.set_title('Função de Autocorrelação (ACF)')

# PACF: ajuda a determinar p (ordem AR)
plot_pacf(y_stationary, lags=40, ax=ax2)
ax2.set_title('Função de Autocorrelação Parcial (PACF)')

plt.tight_layout()
plt.show()

# Regras práticas:
# - PACF corta na defasagem p → AR(p)
# - ACF corta na defasagem q → MA(q)
# - Ambas decaem gradualmente → ARMA(p,q)
```

3. **Seleção de modelo (AIC/BIC)**:
```python
# Busca em grade pelo melhor (p,q) dado d
import numpy as np

best_aic = np.inf
best_order = None

for p in range(5):
    for q in range(5):
        try:
            model = ARIMA(y, order=(p, d, q))
            results = model.fit()
            if results.aic < best_aic:
                best_aic = results.aic
                best_order = (p, d, q)
        except:
            continue

print(f"Melhor ordem: {best_order} com AIC: {best_aic:.2f}")
```

### SARIMAX (ARIMA Sazonal com Variáveis Exógenas)

Estende o ARIMA com sazonalidade e regressores exógenos.

**Quando usar:**
- Padrões sazonais (dados mensais, trimestrais)
- Variáveis externas influenciam a série
- Modelo univariado mais flexível

**Modelo**: SARIMAX(p,d,q)(P,D,Q,s)
- (p,d,q): ARIMA não sazonal
- (P,D,Q,s): ARIMA sazonal com período s

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

# ARIMA sazonal para dados mensais (s=12)
model = SARIMAX(y,
                order=(1, 1, 1),           # (p,d,q)
                seasonal_order=(1, 1, 1, 12))  # (P,D,Q,s)
results = model.fit()

print(results.summary())
```

**Com variáveis exógenas:**
```python
# SARIMAX com preditores externos
model = SARIMAX(y,
                exog=X_exog,
                order=(1, 1, 1),
                seasonal_order=(1, 1, 1, 12))
results = model.fit()
```

**Exemplo: vendas mensais com tendência e sazonalidade**
```python
# Típico para dados mensais: (p,d,q)(P,D,Q,12)
# Comece com (1,1,1)(1,1,1,12) ou (0,1,1)(0,1,1,12)

model = SARIMAX(monthly_sales,
                order=(0, 1, 1),
                seasonal_order=(0, 1, 1, 12),
                enforce_stationarity=False,
                enforce_invertibility=False)
results = model.fit()
```

### Suavização Exponencial

Médias ponderadas de observações passadas com pesos decrescendo exponencialmente.

**Quando usar:**
- Previsões simples e interpretáveis
- Presença de tendência e/ou sazonalidade
- Sem necessidade de especificação explícita do modelo

**Tipos:**
- Suavização Exponencial Simples: sem tendência, sem sazonalidade
- Método de Holt: com tendência
- Holt-Winters: com tendência e sazonalidade

```python
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Suavização exponencial simples
model = ExponentialSmoothing(y, trend=None, seasonal=None)
results = model.fit()

# Método de Holt (com tendência)
model = ExponentialSmoothing(y, trend='add', seasonal=None)
results = model.fit()

# Holt-Winters (tendência + sazonalidade)
model = ExponentialSmoothing(y,
                            trend='add',           # 'add' ou 'mul'
                            seasonal='add',        # 'add' ou 'mul'
                            seasonal_periods=12)   # ex.: 12 para dados mensais
results = model.fit()

print(results.summary())
```

**Aditivo vs Multiplicativo:**
```python
# Aditivo: variação sazonal constante
# yₜ = Nível + Tendência + Sazonal + Erro

# Multiplicativo: variação sazonal proporcional
# yₜ = Nível × Tendência × Sazonal × Erro

# Escolha com base nos dados:
# - Aditivo: variação sazonal constante ao longo do tempo
# - Multiplicativo: variação sazonal aumenta com o nível
```

**Espaço de estados de inovações (ETS):**
```python
from statsmodels.tsa.exponential_smoothing.ets import ETSModel

# Formulação mais robusta, em espaço de estados
model = ETSModel(y,
                error='add',           # 'add' ou 'mul'
                trend='add',           # 'add', 'mul', ou None
                seasonal='add',        # 'add', 'mul', ou None
                seasonal_periods=12)
results = model.fit()
```

## Séries Temporais Multivariadas

### VAR (Vetor Autorregressivo)

Sistema de equações em que cada variável depende dos valores passados de todas as variáveis.

**Quando usar:**
- Múltiplas séries temporais inter-relacionadas
- Relações bidirecionais
- Testes de causalidade de Granger

**Modelo**: Cada variável é um AR em função de todas as variáveis:
- y₁ₜ = c₁ + φ₁₁y₁ₜ₋₁ + φ₁₂y₂ₜ₋₁ + ... + ε₁ₜ
- y₂ₜ = c₂ + φ₂₁y₁ₜ₋₁ + φ₂₂y₂ₜ₋₁ + ... + ε₂ₜ

```python
from statsmodels.tsa.api import VAR
import pandas as pd

# Os dados devem ser um DataFrame com múltiplas colunas
# Cada coluna é uma série temporal
df_multivariate = pd.DataFrame({'series1': y1, 'series2': y2, 'series3': y3})

# Ajustar VAR
model = VAR(df_multivariate)

# Selecionar a ordem de defasagem usando AIC/BIC
lag_order_results = model.select_order(maxlags=15)
print(lag_order_results.summary())

# Ajustar com o número ótimo de defasagens
results = model.fit(maxlags=5, ic='aic')
print(results.summary())
```

**Teste de causalidade de Granger:**
```python
# Testar se series1 causa (no sentido de Granger) series2
from statsmodels.tsa.stattools import grangercausalitytests

# Requer um array 2D [series2, series1]
test_data = df_multivariate[['series2', 'series1']]

# Testar até max_lag
max_lag = 5
results = grangercausalitytests(test_data, max_lag, verbose=True)

# Valores-p para cada defasagem
for lag in range(1, max_lag + 1):
    p_value = results[lag][0]['ssr_ftest'][1]
    print(f"Defasagem {lag}: valor-p = {p_value:.4f}")
```

**Funções de Resposta ao Impulso (IRF):**
```python
# Traçar o efeito de um choque ao longo do sistema
irf = results.irf(10)  # 10 períodos à frente

# Plotar as IRFs
irf.plot(orth=True)  # Ortogonalizadas (decomposição de Cholesky)
plt.show()

# Efeitos cumulativos
irf.plot_cum_effects(orth=True)
plt.show()
```

**Decomposição da Variância do Erro de Previsão:**
```python
# Contribuição de cada variável para a variância do erro de previsão
fevd = results.fevd(10)  # 10 períodos à frente
fevd.plot()
plt.show()
```

### VARMAX (VAR com Médias Móveis e Variáveis Exógenas)

Estende o VAR com um componente de médias móveis e regressores externos.

**Quando usar:**
- VAR inadequado (necessário componente MA)
- Variáveis externas afetam o sistema
- Modelo multivariado mais flexível

```python
from statsmodels.tsa.statespace.varmax import VARMAX

# VARMAX(p, q) com variáveis exógenas
model = VARMAX(df_multivariate,
               order=(1, 1),        # (p, q)
               exog=X_exog)
results = model.fit()

print(results.summary())
```

## Modelos de Espaço de Estados

Framework flexível para modelos customizados de séries temporais.

**Quando usar:**
- Especificação de modelo customizada
- Componentes não observados
- Filtragem/suavização de Kalman
- Dados faltantes

```python
from statsmodels.tsa.statespace.mlemodel import MLEModel

# Estender MLEModel para modelos customizados de espaço de estados
# Exemplo: modelo de nível local (passeio aleatório + ruído)
```

**Modelos de Fatores Dinâmicos:**
```python
from statsmodels.tsa.statespace.dynamic_factor import DynamicFactor

# Extrair fatores comuns de múltiplas séries temporais
model = DynamicFactor(df_multivariate,
                      k_factors=2,          # Número de fatores
                      factor_order=2)       # Ordem AR dos fatores
results = model.fit()

# Fatores estimados
factors = results.factors.filtered
```

## Previsão

### Previsões Pontuais

```python
# Previsão com ARIMA
model = ARIMA(y, order=(1, 1, 1))
results = model.fit()

# Prever h passos à frente
h = 10
forecast = results.forecast(steps=h)

# Com variáveis exógenas (SARIMAX)
model = SARIMAX(y, exog=X, order=(1, 1, 1))
results = model.fit()

# É necessário ter os valores futuros das variáveis exógenas
forecast = results.forecast(steps=h, exog=X_future)
```

### Intervalos de Previsão

```python
# Obter a previsão com intervalos de confiança
forecast_obj = results.get_forecast(steps=h)
forecast_df = forecast_obj.summary_frame()

print(forecast_df)
# Contém: mean, mean_se, mean_ci_lower, mean_ci_upper

# Extrair os componentes
forecast_mean = forecast_df['mean']
forecast_ci_lower = forecast_df['mean_ci_lower']
forecast_ci_upper = forecast_df['mean_ci_upper']

# Plotar
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plt.plot(y.index, y, label='Histórico')
plt.plot(forecast_df.index, forecast_mean, label='Previsão', color='red')
plt.fill_between(forecast_df.index,
                 forecast_ci_lower,
                 forecast_ci_upper,
                 alpha=0.3, color='red', label='IC 95%')
plt.legend()
plt.title('Previsão com Intervalos de Previsão')
plt.show()
```

### Previsões Dinâmicas vs Estáticas

```python
# Estática (um passo à frente, usando valores reais)
static_forecast = results.get_prediction(start=split_point, end=len(y)-1)

# Dinâmica (múltiplos passos, usando valores previstos)
dynamic_forecast = results.get_prediction(start=split_point,
                                          end=len(y)-1,
                                          dynamic=True)

# Plotar comparação
fig, ax = plt.subplots(figsize=(12, 6))
y.plot(ax=ax, label='Real')
static_forecast.predicted_mean.plot(ax=ax, label='Previsão estática')
dynamic_forecast.predicted_mean.plot(ax=ax, label='Previsão dinâmica')
ax.legend()
plt.show()
```

## Testes de Diagnóstico

### Testes de Estacionariedade

```python
from statsmodels.tsa.stattools import adfuller, kpss

# Teste Augmented Dickey-Fuller (ADF)
# H0: raiz unitária (não estacionária)
adf_result = adfuller(y, autolag='AIC')
print(f"Estatística ADF: {adf_result[0]:.4f}")
print(f"valor-p: {adf_result[1]:.4f}")
if adf_result[1] <= 0.05:
    print("Rejeitar H0: a série é estacionária")
else:
    print("Não rejeitar H0: a série é não estacionária")

# Teste KPSS
# H0: estacionária (oposto do ADF)
kpss_result = kpss(y, regression='c', nlags='auto')
print(f"Estatística KPSS: {kpss_result[0]:.4f}")
print(f"valor-p: {kpss_result[1]:.4f}")
if kpss_result[1] <= 0.05:
    print("Rejeitar H0: a série é não estacionária")
else:
    print("Não rejeitar H0: a série é estacionária")
```

### Diagnóstico de Resíduos

```python
# Teste de Ljung-Box para autocorrelação nos resíduos
from statsmodels.stats.diagnostic import acorr_ljungbox

lb_test = acorr_ljungbox(results.resid, lags=10, return_df=True)
print(lb_test)
# Valores-p > 0.05 indicam ausência de autocorrelação significativa (bom sinal)

# Plotar diagnósticos dos resíduos
results.plot_diagnostics(figsize=(12, 8))
plt.show()

# Componentes:
# 1. Resíduos padronizados ao longo do tempo
# 2. Histograma + KDE dos resíduos
# 3. Gráfico Q-Q para normalidade
# 4. Correlograma (ACF dos resíduos)
```

### Testes de Heterocedasticidade

```python
from statsmodels.stats.diagnostic import het_arch

# Teste ARCH para heterocedasticidade
arch_test = het_arch(results.resid, nlags=10)
print(f"Estatística do teste ARCH: {arch_test[0]:.4f}")
print(f"valor-p: {arch_test[1]:.4f}")

# Se significativo, considere um modelo GARCH
```

## Decomposição Sazonal

```python
from statsmodels.tsa.seasonal import seasonal_decompose

# Decompor em tendência, sazonalidade e resíduo
decomposition = seasonal_decompose(y,
                                   model='additive',  # ou 'multiplicative'
                                   period=12)         # período sazonal

# Plotar os componentes
fig = decomposition.plot()
fig.set_size_inches(12, 8)
plt.show()

# Acessar os componentes
trend = decomposition.trend
seasonal = decomposition.seasonal
residual = decomposition.resid

# Decomposição STL (mais robusta)
from statsmodels.tsa.seasonal import STL

stl = STL(y, seasonal=13)  # seasonal deve ser ímpar
stl_result = stl.fit()

fig = stl_result.plot()
plt.show()
```

## Avaliação de Modelos

### Métricas Dentro da Amostra

```python
# A partir do objeto results
print(f"AIC: {results.aic:.2f}")
print(f"BIC: {results.bic:.2f}")
print(f"Log-verossimilhança: {results.llf:.2f}")

# MSE nos dados de treino
from sklearn.metrics import mean_squared_error

mse = mean_squared_error(y, results.fittedvalues)
rmse = np.sqrt(mse)
print(f"RMSE: {rmse:.4f}")

# MAE
from sklearn.metrics import mean_absolute_error
mae = mean_absolute_error(y, results.fittedvalues)
print(f"MAE: {mae:.4f}")
```

### Avaliação Fora da Amostra

```python
# Divisão treino-teste para séries temporais (sem embaralhar!)
train_size = int(0.8 * len(y))
y_train = y[:train_size]
y_test = y[train_size:]

# Ajustar nos dados de treino
model = ARIMA(y_train, order=(1, 1, 1))
results = model.fit()

# Prever o período de teste
forecast = results.forecast(steps=len(y_test))

# Métricas
from sklearn.metrics import mean_squared_error, mean_absolute_error

rmse = np.sqrt(mean_squared_error(y_test, forecast))
mae = mean_absolute_error(y_test, forecast)
mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

print(f"RMSE de teste: {rmse:.4f}")
print(f"MAE de teste: {mae:.4f}")
print(f"MAPE de teste: {mape:.2f}%")
```

### Previsão Rolante (Rolling Forecast)

```python
# Avaliação mais realista: previsões rolantes de um passo à frente
forecasts = []

for t in range(len(y_test)):
    # Reajustar ou atualizar com a nova observação
    y_current = y[:train_size + t]
    model = ARIMA(y_current, order=(1, 1, 1))
    fit = model.fit()

    # Previsão de um passo
    fc = fit.forecast(steps=1)[0]
    forecasts.append(fc)

forecasts = np.array(forecasts)

rmse = np.sqrt(mean_squared_error(y_test, forecasts))
print(f"RMSE da previsão rolante: {rmse:.4f}")
```

### Validação Cruzada

```python
# Validação cruzada para séries temporais (janela expansível)
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
rmse_scores = []

for train_idx, test_idx in tscv.split(y):
    y_train_cv = y.iloc[train_idx]
    y_test_cv = y.iloc[test_idx]

    model = ARIMA(y_train_cv, order=(1, 1, 1))
    results = model.fit()

    forecast = results.forecast(steps=len(test_idx))
    rmse = np.sqrt(mean_squared_error(y_test_cv, forecast))
    rmse_scores.append(rmse)

print(f"RMSE da VC: {np.mean(rmse_scores):.4f} ± {np.std(rmse_scores):.4f}")
```

## Tópicos Avançados

### ARDL (Distributed Lag Autorregressivo)

Faz a ponte entre séries temporais univariadas e multivariadas.

```python
from statsmodels.tsa.ardl import ARDL

# Modelo ARDL(p, q)
# y depende de suas próprias defasagens e das defasagens de X
model = ARDL(y, lags=2, exog=X, exog_lags=2)
results = model.fit()
```

### Modelos de Correção de Erros

Para séries cointegradas.

```python
from statsmodels.tsa.vector_ar.vecm import coint_johansen

# Testar cointegração
johansen_test = coint_johansen(df_multivariate, det_order=0, k_ar_diff=1)

# Ajustar VECM se houver cointegração
from statsmodels.tsa.vector_ar.vecm import VECM

model = VECM(df_multivariate, k_ar_diff=1, coint_rank=1)
results = model.fit()
```

### Modelos de Mudança de Regime

Para quebras estruturais e mudanças de regime.

```python
from statsmodels.tsa.regime_switching.markov_regression import MarkovRegression

# Modelo de mudança de regime markoviano
model = MarkovRegression(y, k_regimes=2, order=1)
results = model.fit()

# Probabilidades suavizadas dos regimes
regime_probs = results.smoothed_marginal_probabilities
```

## Boas Práticas

1. **Verifique a estacionariedade**: Diferencie se necessário, confirme com os testes ADF/KPSS
2. **Plote os dados**: Sempre visualize antes de modelar
3. **Identifique a sazonalidade**: Use modelos sazonais apropriados (SARIMAX, Holt-Winters)
4. **Seleção de modelo**: Use AIC/BIC e validação fora da amostra
5. **Diagnóstico de resíduos**: Verifique autocorrelação, normalidade e heterocedasticidade
6. **Avaliação de previsões**: Use previsões rolantes e validação cruzada adequada para séries temporais
7. **Evite overfitting**: Prefira modelos mais simples, use critérios de informação
8. **Documente as premissas**: Registre quaisquer transformações nos dados (log, diferenciação)
9. **Intervalos de previsão**: Sempre forneça estimativas de incerteza
10. **Reajuste regularmente**: Atualize os modelos à medida que novos dados chegam

## Armadilhas Comuns

1. **Não verificar a estacionariedade**: Ajustar ARIMA em dados não estacionários
2. **Vazamento de dados (data leakage)**: Usar dados futuros nas transformações
3. **Período sazonal errado**: S=4 para dados trimestrais, S=12 para mensais
4. **Overfitting**: Parâmetros em excesso em relação aos dados
5. **Ignorar a autocorrelação dos resíduos**: Modelo inadequado
6. **Usar métricas inadequadas**: O MAPE falha com zeros ou valores negativos
7. **Não tratar dados faltantes**: Afeta a estimação do modelo
8. **Extrapolar variáveis exógenas**: É preciso ter valores futuros de X para o SARIMAX
9. **Confundir previsões estáticas com dinâmicas**: A dinâmica é mais realista para múltiplos passos
10. **Não validar as previsões**: Sempre verifique o desempenho fora da amostra
