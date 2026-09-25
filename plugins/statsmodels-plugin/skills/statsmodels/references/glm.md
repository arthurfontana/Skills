# Referência de Modelos Lineares Generalizados (GLM)

Este documento fornece orientação abrangente sobre modelos lineares generalizados no statsmodels, incluindo famílias, funções de ligação e aplicações.

## Visão Geral

Os GLMs estendem a regressão linear para distribuições de resposta não normais por meio de:
1. **Família de distribuição**: Especifica a distribuição condicional da resposta
2. **Função de ligação**: Transforma o preditor linear para a escala da média
3. **Função de variância**: Relaciona a variância à média

**Forma geral**: g(μ) = Xβ, onde g é a função de ligação e μ = E(Y|X)

## Quando Usar GLM

- **Desfechos binários**: Regressão logística (família Binomial com ligação logit)
- **Dados de contagem**: Regressão Poisson ou Binomial Negativa
- **Dados contínuos positivos**: Gamma ou Inversa Gaussiana
- **Distribuições não normais**: Quando as pressupostos do OLS são violados
- **Funções de ligação**: Quando é necessária uma relação não linear entre preditores e a escala da resposta

## Famílias de Distribuição

### Família Binomial

Para desfechos binários (0/1) ou proporções (k/n).

**Quando usar:**
- Classificação binária
- Desfechos de sucesso/fracasso
- Proporções ou taxas

**Ligações comuns:**
- Logit (padrão): log(μ/(1-μ))
- Probit: Φ⁻¹(μ)
- Log: log(μ)

```python
import statsmodels.api as sm
import statsmodels.formula.api as smf

# Regressão logística binária
model = sm.GLM(y, X, family=sm.families.Binomial())
results = model.fit()

# API de fórmula
results = smf.glm('success ~ x1 + x2', data=df,
                  family=sm.families.Binomial()).fit()

# Acessar previsões (probabilidades)
probs = results.predict(X_new)

# Classificação (limiar de 0.5)
predictions = (probs > 0.5).astype(int)
```

**Interpretação:**
```python
import numpy as np

# Razões de chances (odds ratios) (para ligação logit)
odds_ratios = np.exp(results.params)
print("Razões de chances:", odds_ratios)

# Para um aumento de 1 unidade em x, as chances multiplicam por exp(beta)
```

### Família Poisson

Para dados de contagem (inteiros não negativos).

**Quando usar:**
- Desfechos de contagem (número de eventos)
- Eventos raros
- Modelagem de taxas (com offset)

**Ligações comuns:**
- Log (padrão): log(μ)
- Identidade: μ
- Raiz quadrada: √μ

```python
# Regressão Poisson
model = sm.GLM(y, X, family=sm.families.Poisson())
results = model.fit()

# Com exposição/offset para taxas
# Se modelando taxa = contagens/exposição
model = sm.GLM(y, X, family=sm.families.Poisson(),
               offset=np.log(exposure))
results = model.fit()

# Interpretação: exp(beta) = efeito multiplicativo na contagem esperada
import numpy as np
rate_ratios = np.exp(results.params)
print("Razões de taxa:", rate_ratios)
```

**Verificação de superdispersão:**
```python
# Deviance / gl deve ser ~1 para Poisson
overdispersion = results.deviance / results.df_resid
print(f"Superdispersão: {overdispersion}")

# Se >> 1, considere Binomial Negativa
if overdispersion > 1.5:
    print("Considere um modelo Binomial Negativo para a superdispersão")
```

### Família Binomial Negativa

Para dados de contagem superdispersos.

**Quando usar:**
- Dados de contagem com variância > média
- Excesso de zeros ou variância grande
- Modelo Poisson apresenta superdispersão

```python
# GLM Binomial Negativa
model = sm.GLM(y, X, family=sm.families.NegativeBinomial())
results = model.fit()

# Alternativa: usar modelo de escolha discreta com estimação de alpha
from statsmodels.discrete.discrete_model import NegativeBinomial
nb_model = NegativeBinomial(y, X)
nb_results = nb_model.fit()

print(f"Parâmetro de dispersão alpha: {nb_results.params[-1]}")
```

### Família Gaussiana

Equivalente ao OLS, mas ajustado via IRLS (Mínimos Quadrados Reponderados Iterativamente).

**Quando usar:**
- Deseja o arcabouço GLM por consistência
- Precisa de erros padrão robustos
- Comparação com outros GLMs

**Ligações comuns:**
- Identidade (padrão): μ
- Log: log(μ)
- Inversa: 1/μ

```python
# GLM Gaussiana (equivalente ao OLS)
model = sm.GLM(y, X, family=sm.families.Gaussian())
results = model.fit()

# Verificar equivalência com OLS
ols_results = sm.OLS(y, X).fit()
print("Parâmetros próximos:", np.allclose(results.params, ols_results.params))
```

### Família Gamma

Para dados contínuos positivos, geralmente assimétricos à direita.

**Quando usar:**
- Desfechos positivos (sinistros de seguro, tempos de sobrevivência)
- Distribuições assimétricas à direita
- Variância proporcional ao quadrado da média

**Ligações comuns:**
- Inversa (padrão): 1/μ
- Log: log(μ)
- Identidade: μ

```python
# Regressão Gamma (comum para dados de custo)
model = sm.GLM(y, X, family=sm.families.Gamma())
results = model.fit()

# Ligação log costuma ser preferida para interpretação
model = sm.GLM(y, X, family=sm.families.Gamma(link=sm.families.links.Log()))
results = model.fit()

# Com ligação log, exp(beta) = efeito multiplicativo
import numpy as np
effects = np.exp(results.params)
```

### Família Inversa Gaussiana

Para dados contínuos positivos com estrutura de variância específica.

**Quando usar:**
- Desfechos positivos assimétricos
- Variância proporcional ao cubo da média
- Alternativa à Gamma

**Ligações comuns:**
- Inversa ao quadrado (padrão): 1/μ²
- Log: log(μ)

```python
model = sm.GLM(y, X, family=sm.families.InverseGaussian())
results = model.fit()
```

### Família Tweedie

Família flexível que abrange múltiplas distribuições.

**Quando usar:**
- Sinistros de seguro (mistura de zeros e valores contínuos)
- Dados semicontínuos
- Necessidade de função de variância flexível

**Casos especiais (parâmetro de potência p):**
- p=0: Normal
- p=1: Poisson
- p=2: Gamma
- p=3: Inversa Gaussiana
- 1<p<2: Poisson-Gamma composta (comum em seguros)

```python
# Tweedie com potência=1.5
model = sm.GLM(y, X, family=sm.families.Tweedie(link=sm.families.links.Log(),
                                                 var_power=1.5))
results = model.fit()
```

## Funções de Ligação

As funções de ligação conectam o preditor linear à média da resposta.

### Ligações Disponíveis

```python
from statsmodels.genmod import families

# Identidade: g(μ) = μ
link = families.links.Identity()

# Log: g(μ) = log(μ)
link = families.links.Log()

# Logit: g(μ) = log(μ/(1-μ))
link = families.links.Logit()

# Probit: g(μ) = Φ⁻¹(μ)
link = families.links.Probit()

# Log-log complementar: g(μ) = log(-log(1-μ))
link = families.links.CLogLog()

# Inversa: g(μ) = 1/μ
link = families.links.InversePower()

# Inversa ao quadrado: g(μ) = 1/μ²
link = families.links.InverseSquared()

# Raiz quadrada: g(μ) = √μ
link = families.links.Sqrt()

# Potência: g(μ) = μ^p
link = families.links.Power(power=2)
```

### Escolhendo Funções de Ligação

**Ligações canônicas** (padrão para cada família):
- Binomial → Logit
- Poisson → Log
- Gamma → Inversa
- Gaussiana → Identidade
- Inversa Gaussiana → Inversa ao quadrado

**Quando usar ligações não canônicas:**
- **Ligação log com Binomial**: Razões de risco em vez de razões de chances
- **Ligação identidade**: Efeitos aditivos diretos (quando fizer sentido)
- **Probit vs Logit**: Resultados semelhantes, preferência baseada na área de aplicação
- **CLogLog**: Relação assimétrica, comum em análise de sobrevivência

```python
# Exemplo: Razões de risco com modelo log-binomial
model = sm.GLM(y, X, family=sm.families.Binomial(link=sm.families.links.Log()))
results = model.fit()

# exp(beta) agora fornece razões de risco, não razões de chances
risk_ratios = np.exp(results.params)
```

## Ajuste do Modelo e Resultados

### Fluxo de Trabalho Básico

```python
import statsmodels.api as sm

# Adicionar constante
X = sm.add_constant(X_data)

# Especificar família e ligação
family = sm.families.Poisson(link=sm.families.links.Log())

# Ajustar modelo usando IRLS
model = sm.GLM(y, X, family=family)
results = model.fit()

# Resumo
print(results.summary())
```

### Atributos dos Resultados

```python
# Parâmetros e inferência
results.params              # Coeficientes
results.bse                 # Erros padrão
results.tvalues            # Estatísticas Z
results.pvalues            # Valores-p
results.conf_int()         # Intervalos de confiança

# Previsões
results.fittedvalues       # Valores ajustados (μ)
results.predict(X_new)     # Previsões para novos dados

# Estatísticas de ajuste do modelo
results.aic                # Critério de Informação de Akaike
results.bic                # Critério de Informação Bayesiano
results.deviance           # Deviance
results.null_deviance      # Deviance do modelo nulo
results.pearson_chi2       # Estatística qui-quadrado de Pearson
results.df_resid           # Graus de liberdade residuais
results.llf                # Log-verossimilhança

# Resíduos
results.resid_response     # Resíduos de resposta (y - μ)
results.resid_pearson      # Resíduos de Pearson
results.resid_deviance     # Resíduos de deviance
results.resid_anscombe     # Resíduos de Anscombe
results.resid_working      # Resíduos de trabalho
```

### Pseudo R-quadrado

```python
# Pseudo R-quadrado de McFadden
pseudo_r2 = 1 - (results.deviance / results.null_deviance)
print(f"Pseudo R²: {pseudo_r2:.4f}")

# Pseudo R-quadrado ajustado
n = len(y)
k = len(results.params)
adj_pseudo_r2 = 1 - ((n-1)/(n-k)) * (results.deviance / results.null_deviance)
print(f"Pseudo R² ajustado: {adj_pseudo_r2:.4f}")
```

## Diagnósticos

### Qualidade do Ajuste

```python
# Deviance deve ser aproximadamente χ² com df_resid graus de liberdade
from scipy import stats

deviance_pval = 1 - stats.chi2.cdf(results.deviance, results.df_resid)
print(f"Valor-p do teste de deviance: {deviance_pval}")

# Teste qui-quadrado de Pearson
pearson_pval = 1 - stats.chi2.cdf(results.pearson_chi2, results.df_resid)
print(f"Valor-p do teste qui² de Pearson: {pearson_pval}")

# Verificar superdispersão/subdispersão
dispersion = results.pearson_chi2 / results.df_resid
print(f"Dispersão: {dispersion}")
# Deve ser ~1; >1 sugere superdispersão, <1 subdispersão
```

### Análise de Resíduos

```python
import matplotlib.pyplot as plt

# Resíduos de deviance vs valores ajustados
plt.figure(figsize=(10, 6))
plt.scatter(results.fittedvalues, results.resid_deviance, alpha=0.5)
plt.xlabel('Valores ajustados')
plt.ylabel('Resíduos de deviance')
plt.axhline(y=0, color='r', linestyle='--')
plt.title('Resíduos de Deviance vs Valores Ajustados')
plt.show()

# Gráfico Q-Q dos resíduos de deviance
from statsmodels.graphics.gofplots import qqplot
qqplot(results.resid_deviance, line='s')
plt.title('Gráfico Q-Q dos Resíduos de Deviance')
plt.show()

# Para desfechos binários: gráfico de resíduos agrupados (binned residual plot)
if isinstance(results.model.family, sm.families.Binomial):
    from statsmodels.graphics.gofplots import qqplot
    # Agrupar previsões e calcular resíduos médios
    # (implementação customizada necessária)
    pass
```

### Influência e Outliers

```python
from statsmodels.stats.outliers_influence import GLMInfluence

influence = GLMInfluence(results)

# Alavancagem (leverage)
leverage = influence.hat_matrix_diag

# Distância de Cook
cooks_d = influence.cooks_distance[0]

# DFFITS
dffits = influence.dffits[0]

# Encontrar observações influentes
influential = np.where(cooks_d > 4/len(y))[0]
print(f"Observações influentes: {influential}")
```

## Testes de Hipótese

```python
# Teste de Wald para parâmetro único (automaticamente no summary)

# Teste de razão de verossimilhança para modelos aninhados
# Ajustar modelo reduzido
model_reduced = sm.GLM(y, X_reduced, family=family).fit()
model_full = sm.GLM(y, X_full, family=family).fit()

# Estatística LR
lr_stat = 2 * (model_full.llf - model_reduced.llf)
df = model_full.df_model - model_reduced.df_model

from scipy import stats
lr_pval = 1 - stats.chi2.cdf(lr_stat, df)
print(f"Valor-p do teste LR: {lr_pval}")

# Teste de Wald para múltiplos parâmetros
# Testar beta_1 = beta_2 = 0
R = [[0, 1, 0, 0], [0, 0, 1, 0]]
wald_test = results.wald_test(R)
print(wald_test)
```

## Erros Padrão Robustos

```python
# Robusto à heterocedasticidade (estimador sanduíche)
results_robust = results.get_robustcov_results(cov_type='HC0')

# Robusto por cluster
results_cluster = results.get_robustcov_results(cov_type='cluster',
                                                groups=cluster_ids)

# Comparar erros padrão
print("EP regular:", results.bse)
print("EP robusto:", results_robust.bse)
```

## Comparação de Modelos

```python
# AIC/BIC para modelos não aninhados
models = [model1_results, model2_results, model3_results]
for i, res in enumerate(models, 1):
    print(f"Modelo {i}: AIC={res.aic:.2f}, BIC={res.bic:.2f}")

# Teste de razão de verossimilhança para modelos aninhados (como mostrado acima)

# Validação cruzada para desempenho preditivo
from sklearn.model_selection import KFold
from sklearn.metrics import log_loss

kf = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = []

for train_idx, val_idx in kf.split(X):
    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]

    model_cv = sm.GLM(y_train, X_train, family=family).fit()
    pred_probs = model_cv.predict(X_val)

    score = log_loss(y_val, pred_probs)
    cv_scores.append(score)

print(f"CV Log Loss: {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")
```

## Previsão

```python
# Previsões pontuais
predictions = results.predict(X_new)

# Para classificação: obter probabilidades e converter
if isinstance(family, sm.families.Binomial):
    probs = predictions
    class_predictions = (probs > 0.5).astype(int)

# Para contagens: previsões são contagens esperadas
if isinstance(family, sm.families.Poisson):
    expected_counts = predictions

# Intervalos de previsão via bootstrap
n_boot = 1000
boot_preds = np.zeros((n_boot, len(X_new)))

for i in range(n_boot):
    # Reamostragem bootstrap
    boot_idx = np.random.choice(len(y), size=len(y), replace=True)
    X_boot, y_boot = X[boot_idx], y[boot_idx]

    # Ajustar e prever
    boot_model = sm.GLM(y_boot, X_boot, family=family).fit()
    boot_preds[i] = boot_model.predict(X_new)

# Intervalos de previsão de 95%
pred_lower = np.percentile(boot_preds, 2.5, axis=0)
pred_upper = np.percentile(boot_preds, 97.5, axis=0)
```

## Aplicações Comuns

### Regressão Logística (Classificação Binária)

```python
import statsmodels.api as sm

# Ajustar regressão logística
X = sm.add_constant(X_data)
model = sm.GLM(y, X, family=sm.families.Binomial())
results = model.fit()

# Razões de chances
odds_ratios = np.exp(results.params)
odds_ci = np.exp(results.conf_int())

# Métricas de classificação
from sklearn.metrics import classification_report, roc_auc_score

probs = results.predict(X)
predictions = (probs > 0.5).astype(int)

print(classification_report(y, predictions))
print(f"AUC: {roc_auc_score(y, probs):.4f}")

# Curva ROC
from sklearn.metrics import roc_curve
import matplotlib.pyplot as plt

fpr, tpr, thresholds = roc_curve(y, probs)
plt.plot(fpr, tpr)
plt.plot([0, 1], [0, 1], 'k--')
plt.xlabel('Taxa de Falsos Positivos')
plt.ylabel('Taxa de Verdadeiros Positivos')
plt.title('Curva ROC')
plt.show()
```

### Regressão Poisson (Dados de Contagem)

```python
# Ajustar modelo Poisson
X = sm.add_constant(X_data)
model = sm.GLM(y_counts, X, family=sm.families.Poisson())
results = model.fit()

# Razões de taxa
rate_ratios = np.exp(results.params)
print("Razões de taxa:", rate_ratios)

# Verificar superdispersão
dispersion = results.pearson_chi2 / results.df_resid
if dispersion > 1.5:
    print(f"Superdispersão detectada ({dispersion:.2f}). Considere Binomial Negativa.")
```

### Regressão Gamma (Dados de Custo/Duração)

```python
# Ajustar modelo Gamma com ligação log
X = sm.add_constant(X_data)
model = sm.GLM(y_cost, X,
               family=sm.families.Gamma(link=sm.families.links.Log()))
results = model.fit()

# Efeitos multiplicativos
effects = np.exp(results.params)
print("Efeitos multiplicativos na média:", effects)
```

## Boas Práticas

1. **Verifique os pressupostos de distribuição**: Plote histogramas e gráficos Q-Q da resposta
2. **Verifique a função de ligação**: Use ligações canônicas, a menos que haja razão para não fazê-lo
3. **Examine os resíduos**: Os resíduos de deviance devem ser aproximadamente normais
4. **Teste a superdispersão**: Especialmente para modelos Poisson
5. **Use offsets adequadamente**: Para modelagem de taxas com exposição variável
6. **Considere erros padrão robustos**: Quando os pressupostos de variância forem questionáveis
7. **Compare modelos**: Use AIC/BIC para não aninhados, teste LR para aninhados
8. **Interprete na escala original**: Transforme os coeficientes (por exemplo, exp para ligação log)
9. **Verifique observações influentes**: Use a distância de Cook
10. **Valide as previsões**: Use validação cruzada ou conjunto de holdout

## Armadilhas Comuns

1. **Esquecer de adicionar a constante**: Ausência do termo de intercepto
2. **Usar a família errada**: Verifique a distribuição da resposta
3. **Ignorar a superdispersão**: Use Binomial Negativa em vez de Poisson
4. **Interpretar mal os coeficientes**: Lembre-se da transformação pela função de ligação
5. **Não verificar a convergência**: O IRLS pode não convergir; verifique os avisos
6. **Separação completa na regressão logística**: Algumas categorias preveem perfeitamente o desfecho
7. **Usar ligação identidade com desfechos limitados**: Pode prever fora do intervalo válido
8. **Comparar modelos com amostras diferentes**: Use as mesmas observações
9. **Esquecer o offset em modelos de taxa**: É preciso usar log(exposição) como offset
10. **Não considerar alternativas**: Modelos mistos, inflação de zeros para dados complexos
</content>
