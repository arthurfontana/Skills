# Referência de Modelos de Escolha Discreta

Este documento fornece orientação abrangente sobre modelos de escolha discreta no statsmodels, incluindo modelos binários, multinomiais, de contagem e ordinais.

## Visão Geral

Modelos de escolha discreta lidam com desfechos que são:
- **Binários**: 0/1, sucesso/fracasso
- **Multinomiais**: múltiplas categorias não ordenadas
- **Ordinais**: categorias ordenadas
- **Contagem**: inteiros não negativos

Todos os modelos usam estimação por máxima verossimilhança e assumem erros i.i.d.

## Modelos Binários

### Logit (Regressão Logística)

Usa a distribuição logística para desfechos binários.

**Quando usar:**
- Classificação binária (sim/não, sucesso/fracasso)
- Estimação de probabilidade para desfechos binários
- Razões de chances (odds ratios) interpretáveis

**Modelo**: P(Y=1|X) = 1 / (1 + exp(-Xβ))

```python
import statsmodels.api as sm
from statsmodels.discrete.discrete_model import Logit

# Prepara os dados
X = sm.add_constant(X_data)

# Ajusta o modelo
model = Logit(y, X)
results = model.fit()

print(results.summary())
```

**Interpretação:**
```python
import numpy as np

# Razões de chances (odds ratios)
odds_ratios = np.exp(results.params)
print("Odds ratios:", odds_ratios)

# Para um aumento de 1 unidade em X, as chances multiplicam por exp(β)
# OR > 1: aumenta as chances de sucesso
# OR < 1: diminui as chances de sucesso
# OR = 1: sem efeito

# Intervalos de confiança para as razões de chances
odds_ci = np.exp(results.conf_int())
print("IC 95% da odds ratio:")
print(odds_ci)
```

**Efeitos marginais:**
```python
# Efeitos marginais médios (AME)
marginal_effects = results.get_margeff(at='mean')
print(marginal_effects.summary())

# Efeitos marginais nas médias (MEM)
marginal_effects_mem = results.get_margeff(at='mean', method='dydx')

# Efeitos marginais em valores representativos
marginal_effects_custom = results.get_margeff(at='mean',
                                              atexog={'x1': 1, 'x2': 5})
```

**Predições:**
```python
# Probabilidades preditas
probs = results.predict(X)

# Predições binárias (limiar de 0,5)
predictions = (probs > 0.5).astype(int)

# Limiar customizado
threshold = 0.3
predictions_custom = (probs > threshold).astype(int)

# Para novos dados
X_new = sm.add_constant(X_new_data)
new_probs = results.predict(X_new)
```

**Avaliação do modelo:**
```python
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, roc_curve)

# Relatório de classificação
print(classification_report(y, predictions))

# Matriz de confusão
print(confusion_matrix(y, predictions))

# AUC-ROC
auc = roc_auc_score(y, probs)
print(f"AUC: {auc:.4f}")

# Pseudo R-quadrado
print(f"Pseudo R² de McFadden: {results.prsquared:.4f}")
```

### Probit

Usa a distribuição normal para desfechos binários.

**Quando usar:**
- Desfechos binários
- Preferência pela suposição de distribuição normal
- Convenção da área (econometria costuma usar probit)

**Modelo**: P(Y=1|X) = Φ(Xβ), onde Φ é a função de distribuição acumulada normal padrão

```python
from statsmodels.discrete.discrete_model import Probit

model = Probit(y, X)
results = model.fit()

print(results.summary())
```

**Comparação com o Logit:**
- Probit e Logit geralmente dão resultados semelhantes
- Probit: simétrico, baseado na distribuição normal
- Logit: caudas ligeiramente mais pesadas, interpretação mais fácil (razões de chances)
- Coeficientes não são diretamente comparáveis (diferença de escala)

```python
# Efeitos marginais são comparáveis
logit_me = logit_results.get_margeff().margeff
probit_me = probit_results.get_margeff().margeff

print("Efeitos marginais do Logit:", logit_me)
print("Efeitos marginais do Probit:", probit_me)
```

## Modelos Multinomiais

### MNLogit (Logit Multinomial)

Para desfechos categóricos não ordenados com 3 ou mais categorias.

**Quando usar:**
- Múltiplas categorias não ordenadas (ex.: modo de transporte, escolha de marca)
- Sem ordenação natural entre as categorias
- Necessidade de probabilidades para cada categoria

**Modelo**: P(Y=j|X) = exp(Xβⱼ) / Σₖ exp(Xβₖ)

```python
from statsmodels.discrete.discrete_model import MNLogit

# y deve ser inteiros 0, 1, 2, ... para as categorias
model = MNLogit(y, X)
results = model.fit()

print(results.summary())
```

**Interpretação:**
```python
# Uma categoria é a referência (geralmente a categoria 0)
# Os coeficientes representam log-odds relativas à referência

# Para categoria j vs. referência:
# exp(β_j) = razão de chances da categoria j vs. referência

# Probabilidades preditas para cada categoria
probs = results.predict(X)  # Formato: (n_amostras, n_categorias)

# Categoria mais provável
predicted_categories = probs.argmax(axis=1)
```

**Razões de risco relativo:**
```python
# Exponencia os coeficientes para obter razões de risco relativo
import numpy as np
import pandas as pd

# Obtém nomes e valores dos parâmetros
params_df = pd.DataFrame({
    'coef': results.params,
    'RRR': np.exp(results.params)
})
print(params_df)
```

### Logit Condicional

Para modelos de escolha em que as alternativas têm características próprias.

**Quando usar:**
- Regressores específicos por alternativa (variam entre as escolhas)
- Dados em painel com escolhas
- Experimentos de escolha discreta

```python
from statsmodels.discrete.conditional_models import ConditionalLogit

# Estrutura de dados: formato longo com indicador de escolha
model = ConditionalLogit(y_choice, X_alternatives, groups=individual_id)
results = model.fit()
```

## Modelos de Contagem

### Poisson

Modelo padrão para dados de contagem.

**Quando usar:**
- Desfechos de contagem (eventos, ocorrências)
- Eventos raros
- Média ≈ variância

**Modelo**: P(Y=k|X) = exp(-λ) λᵏ / k!, onde log(λ) = Xβ

```python
from statsmodels.discrete.count_model import Poisson

model = Poisson(y_counts, X)
results = model.fit()

print(results.summary())
```

**Interpretação:**
```python
# Razões de taxa (incident rate ratios)
rate_ratios = np.exp(results.params)
print("Razões de taxa:", rate_ratios)

# Para um aumento de 1 unidade em X, a contagem esperada multiplica por exp(β)
```

**Verificando superdispersão:**
```python
# Média e variância devem ser semelhantes no modelo Poisson
print(f"Média: {y_counts.mean():.2f}")
print(f"Variância: {y_counts.var():.2f}")

# Teste formal
from statsmodels.stats.stattools import durbin_watson

# Há superdispersão se a variância for muito maior que a média
# Regra prática: variância/média > 1,5 sugere superdispersão
overdispersion_ratio = y_counts.var() / y_counts.mean()
print(f"Variância/Média: {overdispersion_ratio:.2f}")

if overdispersion_ratio > 1.5:
    print("Considere o modelo Binomial Negativo")
```

**Com offset (para taxas):**
```python
# Ao modelar taxas com exposição variável
# log(λ) = log(exposição) + Xβ

model = Poisson(y_counts, X, offset=np.log(exposure))
results = model.fit()
```

### Binomial Negativo

Para dados de contagem superdispersos (variância > média).

**Quando usar:**
- Dados de contagem com superdispersão
- Variância excedente não explicada pelo modelo Poisson
- Heterogeneidade nas contagens

**Modelo**: Adiciona um parâmetro de dispersão α para explicar a superdispersão

```python
from statsmodels.discrete.count_model import NegativeBinomial

model = NegativeBinomial(y_counts, X)
results = model.fit()

print(results.summary())
print(f"Parâmetro de dispersão alpha: {results.params['alpha']:.4f}")
```

**Comparação com o Poisson:**
```python
# Ajusta ambos os modelos
poisson_results = Poisson(y_counts, X).fit()
nb_results = NegativeBinomial(y_counts, X).fit()

# Comparação de AIC (menor é melhor)
print(f"AIC Poisson: {poisson_results.aic:.2f}")
print(f"AIC Binomial Negativo: {nb_results.aic:.2f}")

# Teste de razão de verossimilhança (se o Binomial Negativo for melhor)
from scipy import stats
lr_stat = 2 * (nb_results.llf - poisson_results.llf)
lr_pval = 1 - stats.chi2.cdf(lr_stat, df=1)  # 1 parâmetro extra (alpha)
print(f"p-valor do teste de razão de verossimilhança: {lr_pval:.4f}")

if lr_pval < 0.05:
    print("Binomial Negativo é significativamente melhor")
```

### Modelos com Inflação de Zeros

Para dados de contagem com excesso de zeros.

**Quando usar:**
- Mais zeros do que o esperado pelo Poisson/Binomial Negativo
- Dois processos: um para os zeros, outro para as contagens
- Exemplos: número de visitas ao médico, sinistros de seguro

**Modelos:**
- ZeroInflatedPoisson (ZIP)
- ZeroInflatedNegativeBinomialP (ZINB)

```python
from statsmodels.discrete.count_model import (ZeroInflatedPoisson,
                                               ZeroInflatedNegativeBinomialP)

# Modelo ZIP
zip_model = ZeroInflatedPoisson(y_counts, X, exog_infl=X_inflation)
zip_results = zip_model.fit()

# Modelo ZINB (para superdispersão + excesso de zeros)
zinb_model = ZeroInflatedNegativeBinomialP(y_counts, X, exog_infl=X_inflation)
zinb_results = zinb_model.fit()

print(zip_results.summary())
```

**Duas partes do modelo:**
```python
# 1. Modelo de inflação: P(Y=0 devido à inflação)
# 2. Modelo de contagem: distribuição das contagens

# Probabilidades preditas de inflação
inflation_probs = zip_results.predict(X, which='prob')

# Contagens preditas
predicted_counts = zip_results.predict(X, which='mean')
```

### Modelos Hurdle

Modelo em dois estágios: se há alguma contagem e, em seguida, quantas.

**Quando usar:**
- Excesso de zeros
- Processos diferentes para zero vs. contagens positivas
- Zeros estruturalmente diferentes dos valores positivos

```python
from statsmodels.discrete.count_model import HurdleCountModel

# Especifica a distribuição de contagem e a inflação de zeros
model = HurdleCountModel(y_counts, X,
                         exog_infl=X_hurdle,
                         dist='poisson')  # ou 'negbin'
results = model.fit()

print(results.summary())
```

## Modelos Ordinais

### Logit/Probit Ordenado

Para desfechos categóricos ordenados.

**Quando usar:**
- Categorias ordenadas (ex.: baixo/médio/alto, notas de 1 a 5)
- A ordenação natural importa
- Deseja-se respeitar a estrutura ordinal

**Modelo**: modelo de probabilidade cumulativa com pontos de corte

```python
from statsmodels.miscmodels.ordinal_model import OrderedModel

# y deve ser inteiros ordenados: 0, 1, 2, ...
model = OrderedModel(y_ordered, X, distr='logit')  # ou 'probit'
results = model.fit(method='bfgs')

print(results.summary())
```

**Interpretação:**
```python
# Pontos de corte (limiares entre categorias)
cutpoints = results.params[-n_categories+1:]
print("Pontos de corte:", cutpoints)

# Coeficientes
coefficients = results.params[:-n_categories+1]
print("Coeficientes:", coefficients)

# Probabilidades preditas para cada categoria
probs = results.predict(X)  # Formato: (n_amostras, n_categorias)

# Categoria mais provável
predicted_categories = probs.argmax(axis=1)
```

**Suposição de chances proporcionais:**
```python
# Testa se os coeficientes são iguais entre os pontos de corte
# (teste de Brant - implementar manualmente ou verificar resíduos)

# Verificação: ajustar cada ponto de corte separadamente e comparar coeficientes
```

## Diagnósticos do Modelo

### Qualidade de Ajuste

```python
# Pseudo R-quadrado (McFadden)
print(f"Pseudo R²: {results.prsquared:.4f}")

# AIC/BIC para comparação de modelos
print(f"AIC: {results.aic:.2f}")
print(f"BIC: {results.bic:.2f}")

# Log-verossimilhança
print(f"Log-verossimilhança: {results.llf:.2f}")

# Teste de razão de verossimilhança vs. modelo nulo
lr_stat = 2 * (results.llf - results.llnull)
from scipy import stats
lr_pval = 1 - stats.chi2.cdf(lr_stat, results.df_model)
print(f"p-valor do teste de razão de verossimilhança: {lr_pval}")
```

### Métricas de Classificação (Binária)

```python
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score)

# Predições
probs = results.predict(X)
predictions = (probs > 0.5).astype(int)

# Métricas
print(f"Acurácia: {accuracy_score(y, predictions):.4f}")
print(f"Precisão: {precision_score(y, predictions):.4f}")
print(f"Revocação (Recall): {recall_score(y, predictions):.4f}")
print(f"F1: {f1_score(y, predictions):.4f}")
print(f"AUC: {roc_auc_score(y, probs):.4f}")
```

### Métricas de Classificação (Multinomial)

```python
from sklearn.metrics import accuracy_score, classification_report, log_loss

# Categorias preditas
probs = results.predict(X)
predictions = probs.argmax(axis=1)

# Acurácia
accuracy = accuracy_score(y, predictions)
print(f"Acurácia: {accuracy:.4f}")

# Relatório de classificação
print(classification_report(y, predictions))

# Log loss
logloss = log_loss(y, probs)
print(f"Log Loss: {logloss:.4f}")
```

### Diagnósticos de Modelos de Contagem

```python
# Frequências observadas vs. preditas
observed = pd.Series(y_counts).value_counts().sort_index()
predicted = results.predict(X)
predicted_counts = pd.Series(np.round(predicted)).value_counts().sort_index()

# Compara as distribuições
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
observed.plot(kind='bar', alpha=0.5, label='Observado', ax=ax)
predicted_counts.plot(kind='bar', alpha=0.5, label='Predito', ax=ax)
ax.legend()
ax.set_xlabel('Contagem')
ax.set_ylabel('Frequência')
plt.show()

# Rootograma (visualização melhor)
from statsmodels.graphics.agreement import mean_diff_plot
# Implementação customizada de rootograma necessária
```

### Influência e Outliers

```python
# Resíduos padronizados
std_resid = (y - results.predict(X)) / np.sqrt(results.predict(X))

# Verifica outliers (|std_resid| > 2)
outliers = np.where(np.abs(std_resid) > 2)[0]
print(f"Número de outliers: {len(outliers)}")

# Alavancagem (hat values) - para logit/probit
# from statsmodels.stats.outliers_influence
```

## Testes de Hipótese

```python
# Teste de parâmetro único (automático no summary)

# Múltiplos parâmetros: teste de Wald
# Testa H0: β₁ = β₂ = 0
R = [[0, 1, 0, 0], [0, 0, 1, 0]]
wald_test = results.wald_test(R)
print(wald_test)

# Teste de razão de verossimilhança para modelos aninhados
model_reduced = Logit(y, X_reduced).fit()
model_full = Logit(y, X_full).fit()

lr_stat = 2 * (model_full.llf - model_reduced.llf)
df = model_full.df_model - model_reduced.df_model
from scipy import stats
lr_pval = 1 - stats.chi2.cdf(lr_stat, df)
print(f"p-valor do teste de razão de verossimilhança: {lr_pval:.4f}")
```

## Seleção e Comparação de Modelos

```python
# Ajusta múltiplos modelos
models = {
    'Logit': Logit(y, X).fit(),
    'Probit': Probit(y, X).fit(),
    # Adicione mais modelos
}

# Compara AIC/BIC
comparison = pd.DataFrame({
    'AIC': {name: model.aic for name, model in models.items()},
    'BIC': {name: model.bic for name, model in models.items()},
    'Pseudo R²': {name: model.prsquared for name, model in models.items()}
})
print(comparison.sort_values('AIC'))

# Validação cruzada para desempenho preditivo
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression

# Use o wrapper do sklearn ou validação cruzada manual
```

## API de Fórmulas

Use fórmulas no estilo R para especificação mais fácil.

```python
import statsmodels.formula.api as smf

# Logit com fórmula
formula = 'y ~ x1 + x2 + C(category) + x1:x2'
results = smf.logit(formula, data=df).fit()

# MNLogit com fórmula
results = smf.mnlogit(formula, data=df).fit()

# Poisson com fórmula
results = smf.poisson(formula, data=df).fit()

# Binomial Negativo com fórmula
results = smf.negativebinomial(formula, data=df).fit()
```

## Aplicações Comuns

### Classificação Binária (Resposta de Marketing)

```python
# Prevê a probabilidade de compra do cliente
X = sm.add_constant(customer_features)
model = Logit(purchased, X)
results = model.fit()

# Direcionamento: seleciona os 20% mais propensos a comprar
probs = results.predict(X)
top_20_pct_idx = np.argsort(probs)[-int(0.2*len(probs)):]
```

### Escolha Multinomial (Modo de Transporte)

```python
# Prevê a escolha do modo de transporte
model = MNLogit(mode_choice, X)
results = model.fit()

# Modo predito para um novo passageiro
new_commuter = sm.add_constant(new_features)
mode_probs = results.predict(new_commuter)
predicted_mode = mode_probs.argmax(axis=1)
```

### Dados de Contagem (Número de Visitas ao Médico)

```python
# Modela a utilização de serviços de saúde
model = NegativeBinomial(num_visits, X)
results = model.fit()

# Visitas esperadas para um novo paciente
expected_visits = results.predict(new_patient_X)
```

### Inflação de Zeros (Sinistros de Seguro)

```python
# Muitas pessoas têm zero sinistros
# Inflação de zeros: algumas nunca fazem sinistro
# Processo de contagem: aqueles que podem fazer sinistro

zip_model = ZeroInflatedPoisson(claims, X_count, exog_infl=X_inflation)
results = zip_model.fit()

# P(nunca faz sinistro)
never_claim_prob = results.predict(X, which='prob-zero')

# Sinistros esperados
expected_claims = results.predict(X, which='mean')
```

## Boas Práticas

1. **Verifique o tipo de dado**: garanta que o desfecho corresponda ao modelo (binário, contagens, categorias)
2. **Adicione a constante**: sempre use `sm.add_constant()`, a menos que não se deseje intercepto
3. **Padronize preditores contínuos**: para melhor convergência e interpretação
4. **Verifique a convergência**: fique atento a avisos de convergência
5. **Use a API de fórmulas**: para variáveis categóricas e interações
6. **Efeitos marginais**: reporte efeitos marginais, não apenas coeficientes
7. **Comparação de modelos**: use AIC/BIC e validação cruzada
8. **Valide**: use conjunto de validação (holdout) ou validação cruzada para modelos preditivos
9. **Verifique superdispersão**: para modelos de contagem, teste a suposição do Poisson
10. **Considere alternativas**: inflação de zeros, modelos hurdle para excesso de zeros

## Armadilhas Comuns

1. **Esquecer a constante**: ausência de termo de intercepto
2. **Separação perfeita**: logit/probit pode não convergir
3. **Usar Poisson com superdispersão**: verifique e use o Binomial Negativo
4. **Interpretar mal os coeficientes**: lembre-se de que estão na escala log-odds/log
5. **Não verificar a convergência**: a otimização pode falhar silenciosamente
6. **Distribuição errada**: combine o modelo com o tipo de dado (binário/contagem/categórico)
7. **Ignorar o excesso de zeros**: use ZIP/ZINB quando apropriado
8. **Não validar as predições**: sempre verifique o desempenho fora da amostra
9. **Comparar modelos não aninhados**: use AIC/BIC, não o teste de razão de verossimilhança
10. **Tratar ordinal como nominal**: use OrderedModel para categorias ordenadas
