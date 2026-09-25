# 14 — Bibliografia (Framework J)

## Regulatórias e jurídicas

| Fonte | Ano | Tema | Status para não financeira BR |
|---|---|---|---|
| Fed/OCC/FDIC, SR 26-2 / OCC 2026-13, Revised Guidance on MRM | 2026 | MRM baseado em risco; substitui SR 11-7/OCC 2011-12 | Benchmark |
| Fed/OCC, SR 11-7 / OCC 2011-12 | 2011 | MRM clássico (histórico) | Benchmark histórico |
| PRA, SS1/23 Model risk management principles for banks | 2023 (vigência 2024) | 5 princípios de MRM | Benchmark |
| EBA, GL/2017/16 PD/LGD estimation | 2017 | Calibração, representatividade, MoC | Benchmark |
| EBA, GL/2020/06 Loan origination and monitoring | 2020 (aplic. 2021) | Modelos automatizados na concessão | Benchmark |
| EBA, Follow-up report on ML for IRB models | 2023 | ML em PD; explicabilidade | Benchmark |
| BCBS, Working Paper 14 – Studies on the Validation of Internal Rating Systems | 2005 | Testes de discriminação e calibração | Referência metodológica |
| CMN, Resolução 4.557 | 2017 | Gerenciamento de riscos; art. 9º modelos | Benchmark (obrigatória só para IFs) |
| CMN, Resolução 4.966 | 2021 (vigência 2025) | Perda esperada | Benchmark |
| Lei 13.709/2018 (LGPD), art. 20 | 2018/2019 | Revisão e explicação de decisões automatizadas | Obrigação |
| ANPD, Nota Técnica 12/2025 | 2025 | Consolidação de subsídios sobre art. 20 | Orientação (não vinculante) |
| Lei 12.414/2011 (Cadastro Positivo), art. 5º | 2011/2019 | Critérios e revisão | Obrigação (se consulente) |
| STJ, Súmula 550 / Tema 710 | 2015 | Credit scoring | Obrigação (jurisprudencial) |
| Lei 8.078/1990 (CDC), art. 43 | 1990 | Bancos de dados de consumo | Obrigação |
| Anatel, Resolução 765/2023 (RGC) | 2023 (vigência 2025) | Direitos do consumidor de telecom | Obrigação setorial |
| UE, AI Act + Digital Omnibus | 2024/2026 | Scoring como alto risco | Só se atuar na UE |
| CFPB, Circular 2022-03 (retirada em 2025) | 2022 | Reason codes em modelos complexos | Benchmark |

## Acadêmicas

- Baesens et al. (2003), "Benchmarking state-of-the-art classification
  algorithms for credit scoring", JORS 54(6):627–635.
- Lessmann, Baesens, Seow & Thomas (2015), EJOR 247(1):124–136.
- Crook & Banasik (2004), "Does reject inference really improve the
  performance of application scoring models?", Journal of Banking &
  Finance 28(4):857–874.
- Banasik, Crook & Thomas (2003), "Sample selection bias in credit
  scoring models", JORS 54(8):822–832.
- Banasik & Crook (2007), "Reject inference, augmentation, and sample
  selection", EJOR 183(3):1582–1594.
- Yurdakul & Naranjo (2020), "Statistical properties of the population
  stability index", Journal of Risk Model Validation 14(4):89–100;
  Yurdakul (2018), tese, Western Michigan University.
- Kozodoi, Jacob & Lessmann (2022), "Fairness in credit scoring", EJOR
  297(3):1083–1094.
- Tasche (2008), "Validation of internal rating systems and PD
  estimates", em The Analytics of Risk Model Validation.

## Livros (referência metodológica)

- Siddiqi, *Credit Risk Scorecards* (2006) e *Intelligent Credit Scoring*
  (2ª ed., 2017).
- Anderson, *The Credit Scoring Toolkit* (2007).
- Thomas, Edelman & Crook, *Credit Scoring and Its Applications* (2002;
  2ª ed., 2017).
- Thomas, *Consumer Credit Models* (2009).
- Baesens, Rösch & Scheule, *Credit Risk Analytics* (2016, com SAS).

---

## Gaps e limitações (dependem do contexto da instituição)

- **IFRS 9 própria:** aplicabilidade à carteira de recebíveis da empresa e
  escolha entre abordagem simplificada e geral. Confirmar com a
  contabilidade e a auditoria.
- **Art. 20 da LGPD:** interpretação ainda não regulamentada pela ANPD.
  Os requisitos de revisão humana e o nível de detalhe da explicação
  podem mudar.
- **RGC da Anatel:** não há regra expressa sobre consulta a bureau ou
  caução no pós-pago. A tensão entre os arts. 28 e 30 exige leitura
  jurídica interna. O Manual Operacional do RGC e os arts. 72 em diante
  não foram verificados.
- **Contratos com bureaus e parceiros:** financiamento de aparelho via
  instituição parceira pode trazer obrigações de MRM por contrato.
  Verificar caso a caso.
- **Thresholds de monitoramento, cortes e tolerâncias de calibração:**
  dependem do apetite de risco e dos economics da empresa. A Skill os
  trata como hipóteses a calibrar.
- **Viabilidade de amostras de exploração e de dados de bureau
  pós-negação:** depende de custo, contrato e LGPD (finalidade).

## Revisão crítica aplicada

**1. Lacunas de um Senior Credit Risk Modeler, já incorporadas:**

- Paridade de implementação (replay dev vs. produção) e fallback de
  missing/timeout.
- Dados de bureau point-in-time (look-ahead).
- Indeterminados na simulação de negócio.
- Atribuição de variações de bad rate (mix vs. modelo vs. política).
- Scores de bureau tratados como modelos de terceiros.
- Survival/riscos competitivos para churn vs. default em telecom.
- Critérios de decisão fixados antes dos resultados.
- Limitação dos testes binomiais sob correlação de default.

**2. Práticas de MRM adicionadas:**

- Tiering por materialidade (exposição + finalidade, como no SR 26-2).
- Risco agregado entre modelos que compartilham dados.
- Uso antes da validação com controles compensatórios.
- Categorização de mudanças.
- Análise de overrides.
- Monitoramento de pedidos de revisão e reclamações como KPI de conduta.

**3. Correções de práticas regulatórias tratadas como obrigatórias sem
evidência:**

- A validação independente foi reclassificada de obrigação para RI fora
  do âmbito do CMN 4.557.
- A calibração de long-run e a MoC foram reclassificadas como RI.
- A revisão humana foi registrada como boa prática, já que o art. 20
  vigente não a exige literalmente.
- O AI Act e o ECOA foram condicionados à jurisdição.

## Caveats

- O SR 26-2 é muito recente (abril de 2026). Parte da prática de mercado
  e da literatura ainda se refere ao SR 11-7. A Skill trata ambos como
  benchmark.
- As datas do Digital Omnibus do AI Act já têm força de lei: o
  Regulamento (UE) 2026/1744 foi publicado em 24/07/2026 e está em vigor
  desde 27/07/2026. Ele adia as obrigações de alto risco do Anexo III
  para 02/12/2027. Só é relevante se houver exposição europeia.
- Este documento não constitui parecer jurídico. Os itens "R" devem ser
  confirmados pelo jurídico e pelo DPO da empresa.
