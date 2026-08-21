---
name: import-politica-credito
description: >-
  Converte uma planilha de política de crédito no formato NMEI (linhas = Grupo de Cliente ×
  Cluster de Risco, colunas = Classe, cada Classe com Score e Limite) nos arquivos prontos
  para colar/importar no PolicyOps: tabelas de domínio para cada variável de eixo, a variável
  de Score com corte de faixa por Grupo×Classe, e o CSV de import da matriz. Use SEMPRE que o
  usuário mencionar uma planilha nesse formato (ex.: "SMALL_NMEI.xlsx"), pedir para "montar a
  matriz igual ao Excel de política de crédito", ou pedir para gerar variáveis/import a partir
  de uma tabela de score×limite por cluster de risco. Também dispara em "matriz NMEI", "score
  e limite por cluster", "cortes de score por grupo e classe".
---

# Import de política de crédito (formato NMEI) para o PolicyOps

Esta skill converte uma planilha Excel no formato "NMEI" — a forma como o usuário já trabalha
suas políticas de crédito fora do PolicyOps — em três conjuntos de arquivo prontos para colar
nas telas do PolicyOps (`docs/03-modelo-do-documento.md`, `docs/04-eixos-aninhados.md`,
`docs/12-carga-de-matrizes.md` no repositório `arthurfontana/PolicyOps`).

## Quando usar

O usuário tem (ou vai anexar) uma planilha `.xlsx` com este layout:

```
                          Classe A          Classe B          Classe C     ...
Grupos de clientes  Cluster  Score  Limite  Score  Limite  Score  Limite
Cliente Base ...       1     751-999  500 a 5K   800-1000  230 a 600 ...
                        2     601-750  250 a 4.5K ...
                        ...
                        5(pior) Reprova            Reprova
Cliente Novo ...        1     ...
```

Ou seja: **linhas** = Grupo de Cliente (nível 0) × Cluster de Risco (nível 1, do melhor 1 ao pior
N); **colunas** = Classe (A, B, C, D...), cada uma com um par Score/Limite. Isso é uma matriz 2D
(Y = Grupo→Cluster, X = Classe), mas o Score e o Limite variam de forma contínua por
combinação — não são a decisão em si, são o **corte** que produz o cluster.

## Por que não vai direto pra célula da matriz

`Cell` no PolicyOps guarda uma decisão (`decision`/`offer`/`limit` de catálogo), não uma faixa
numérica contínua. Colocar "751-999" numa célula, ou criar um item de catálogo por valor de
score/limite observado, é o erro mais comum aqui (o assistente de import tenta criar um item de
catálogo por valor único e trava — "não é possível criar itens com esses valores"). A faixa de
**Score** pertence à **variável** (`VariableVersion.groupingDimensions` +
`Domain.groupingRanges`, `docs/03-modelo-do-documento.md` §2) — o corte muda por Grupo×Classe,
mas a variável em si ("Score") é uma só. O Cluster (o resultado da classificação) é que vira
eixo/decisão na matriz.

**Limite**: até a sessão S45 do PolicyOps (`docs/prompts/S45-limite-em-faixa.md`) não existir,
`Cell` não tem um par mín/máx nativo — a única forma de carregar a faixa de limite por célula é
via atributo livre (`attrs.limitMin`/`attrs.limitMax`, mapeado no import como
`attr:limitMin`/`attr:limitMax`). Depois que a S45 for implementada, o import passa a usar os
campos nativos `limitMin`/`limitMax` — ajuste o profile de import quando isso acontecer.

## O que a skill produz

Rode o parser (seção seguinte) e entregue ao usuário estes arquivos, um por variável/matriz:

1. **Um `.tsv` por variável de eixo simples** (Grupo de Cliente, Classe) — cabeçalho `Domínio`,
   uma linha por domínio, **valor já em formato de código** (`^[A-Z0-9_]+$`, sem espaço, acento
   ou parênteses — a tela "Colar tabela de domínios" do PolicyOps deriva o código
   maiusculizando o texto ao pé da letra, sem normalizar nada).
2. **Um `.tsv` para o Cluster de Risco** — mesma forma, um domínio por linha (ex.:
   `BAIXISSIMO_RISCO`, `BAIXO_RISCO`, `MEDIO_RISCO`, `ALTO_RISCO`, `ALTISSIMO_RISCO`), **mais
   uma coluna `Cor`** com a cor oficial de cada domínio (`docs/05-regras-de-negocio.md`
   §5.6.4.2, paleta `RISCO_SIMPLIFICADO`) — a tela "Colar tabela de domínios" reconhece a
   coluna `Cor` e aplica direto, sem depender do casamento automático por código/rótulo da
   paleta (os códigos de cluster têm sufixo `_RISCO`, que não bate com os códigos da paleta):

   | Domínio | Cor |
   |---|---|
   | `BAIXISSIMO_RISCO` | `#2ECC71` |
   | `BAIXO_RISCO` | `#8BC34A` |
   | `MEDIO_RISCO` | `#FFC107` |
   | `ALTO_RISCO` | `#FF7043` |
   | `ALTISSIMO_RISCO` | `#D32F2F` |

   Se o cluster do usuário tiver um número diferente de 5 níveis, pergunte a cor de cada um —
   não invente gradiente.
3. **Um `.tsv` para a variável de Score** — colunas de agrupamento (uma por nível de
   `groupingDimensions`, ex. `GRUPO`, `CLASSE`) + `Domínio` + `Mínimo` + `Máximo`, uma linha por
   combinação observada. **Inclua o pior cluster com faixa explícita**, não como catch-all: o
   mínimo é o piso absoluto do score (pergunte ao usuário se não for óbvio — no caso já resolvido
   foi `5`) e o máximo é `mínimo_do_penúltimo_cluster − 1`; para combinações sem nenhum dado na
   planilha original, o pior cluster cobre o intervalo inteiro (`piso a teto`, ex. `5 a 1000`).
4. **Um `.csv` (`;`-separado) para o import da matriz**, formato longo: uma coluna de
   **partição** (ex. `SEGMENTO`, com um valor fixo por carga — o assistente de import do
   PolicyOps exige pelo menos uma coluna de partição, invariante I21, mesmo quando há uma
   matriz só), as colunas de eixo (`GRUPO`, `CLUSTER`, `CLASSE`) e as colunas de valor
   (`DECISAO`, e opcionalmente `LIMITE_MIN`/`LIMITE_MAX`).

**Nomeie a coluna de partição de `SEGMENTO`** (não `CANAL`), a menos que o usuário diga outra
coisa — é o nome que ele prefere para essa dimensão de carga.

## Passo a passo (parser em Python)

Use `openpyxl` (`pip install -q openpyxl` se faltar) para ler a planilha. Adapte os nomes de
coluna/linha ao arquivo real — o layout varia (nº de Classes, nº de Clusters, texto exato dos
Grupos), então **não assuma que o layout é idêntico ao exemplo**; primeiro leia a planilha
inteira e mostre ao usuário como você entendeu a estrutura antes de gerar os arquivos.

```python
import openpyxl, re, csv

wb = openpyxl.load_workbook("PLANILHA.xlsx", data_only=False)
ws = wb.active  # ou wb["NomeDaAba"]
rows = list(ws.iter_rows(values_only=True))

# 1. Identifique: linha do cabeçalho de Classe, linha do cabeçalho Score/Limite,
#    linha em que os dados de fato começam, e quantas colunas por Classe (Score, Limite).
# 2. Percorra as linhas de dado: a primeira coluna preenchida define o Grupo atual
#    (arraste pra baixo até o próximo valor não-vazio); a segunda coluna é o número
#    do Cluster (1 = melhor).
# 3. Para cada par (Classe, {Score, Limite}), parse:
#    - Score "751 - 999"           -> (min=751, max=999)
#    - Score "Reprova"/vazio       -> sem faixa (não gera groupingRange nessa combinação)
#    - Limite "500 a 5K"           -> (min=500, max=5000) — "k"/"K" multiplica por 1000,
#      vírgula decimal vira ponto
```

Depois de extrair `(grupo, cluster, classe) -> (score_min, score_max, limite_min, limite_max)`:

- **Códigos**: normalize cada texto de domínio para `^[A-Z0-9_]+$` (maiúsculas, `_` no lugar de
  espaço/acento/pontuação) **antes** de escrever qualquer `.tsv` — não deixe a tela do PolicyOps
  tentar derivar o código sozinha, ela não normaliza (ver erro reportado: `"CLUSTER 1"` com
  espaço rejeitado por `^[A-Z0-9_]+$`).
- **Contiguidade do Score**: dentro de cada combinação (Grupo, Classe), os clusters devem ser
  contíguos em modo `INCLUSIVE_INTEGER` (`min` do cluster N = `max` do cluster N+1 + 1). Se a
  planilha original tiver um erro de digitação (dois clusters compartilhando o mesmo valor de
  fronteira), avise o usuário e ajuste **um lado** da fronteira (normalmente o cluster de score
  mais baixo perde o ponto de sobreposição) — não decida sozinho que é intencional.
- **Pior cluster com faixa explícita**: depois de perguntar o piso do score ao usuário, gere,
  para toda combinação (Grupo, Classe) — inclusive as que não tinham nenhum dado na planilha —
  uma linha `pior_cluster, piso, max(min_do_penúltimo_cluster − 1, piso)`. Combinações sem
  nenhum cluster melhor viram `piso a teto`.
- **Decisão da matriz**: normalmente o pior cluster é sempre reprovado
  (`DECISAO=REPROVADO`) e os demais aprovados — mas **confirme com o usuário**, não assuma; já
  aconteceu de o corte inicial ficar errado (aprovando o pior cluster) até o usuário corrigir.

## Ao entregar os arquivos, explique ao usuário

1. **Ordem de import**: variáveis de eixo simples (Grupo, Classe, Cluster) primeiro, publicadas;
   depois a variável de Score (os códigos de `groupingDimensions` não precisam bater com os
   domínios publicados de Grupo/Classe — são independentes por design, mas manter os mesmos
   códigos evita confusão); só então a matriz.
2. **Onde cada `.tsv` entra**: tela da variável → "Colar tabela de domínios". Onde o `.csv` da
   matriz entra: assistente "Carga de matrizes", passo 1 (arquivo) → passo 2 (mapear colunas:
   partição, eixo X, eixo Y nível 0/1, valor) → passo 3 (biblioteca, deve ficar vazio se não
   houver mapeamento por catálogo) → passo 4 (regras de decisão oferta→decisão, se a coluna de
   decisão foi mapeada via `offer`) → passo 5 (plano, confira "N novas / 0 alteradas" bate com o
   esperado) → passo 6 (aplicar).
3. **IDs reais**: se o usuário já publicou as variáveis e mandar o JSON/print com os `id`s e
   códigos de domínio reais, gere os arquivos finais com esses valores — não com placeholders.
4. **Limite**: seja explícito sobre qual caminho está usando (S45 nativo se já existir, ou
   `attr:limitMin`/`attr:limitMax` como caminho provisório) — não deixe o usuário achar que é
   suporte nativo se ainda for o provisório.

## Erros conhecidos e a causa

| Sintoma na tela do PolicyOps | Causa | Correção |
|---|---|---|
| `"código 'CLUSTER 1' derivado de 'Cluster 1' é inválido"` | Texto de "Domínio" colado tem espaço/acento/parêntese; a tela só maiusculiza, não normaliza | Escreva o `Domínio` já em formato de código (`CLUSTER_1`) |
| Aviso "algumas combinações não têm faixa para todos os domínios" | Hierarquia assimétrica esperada (nem todo Grupo×Classe passa por todo cluster) | Confirmar que bate com os buracos reais da planilha antes de salvar — não é bloqueante |
| Erro de contiguidade entre dois domínios de Score | Sobreposição de 1 ponto na fronteira, normalmente erro de digitação da planilha original | Achar a única ocorrência (script de checagem de contiguidade) e corrigir um lado |
| `"O perfil precisa de ao menos uma coluna de partição (I21)"` no passo 2 da carga | Nenhuma coluna do CSV está com papel "Partição" | Acrescente uma coluna de partição fixa (ex. `SEGMENTO=SMALL`) e mapeie-a como Partição |
| `"Limite exige um valor numérico"` / tela pede para criar N itens de catálogo de Limite | Coluna de limite mapeada para o campo `Limite` (catálogo, valor único), não para atributo/campo nativo de faixa | Mapear como atributo (`attr:limitMin`/`attr:limitMax`) até a S45; depois da S45, usar os papéis nativos `limitMin`/`limitMax` |
