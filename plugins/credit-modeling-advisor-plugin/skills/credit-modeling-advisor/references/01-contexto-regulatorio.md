# 01 — Contexto regulatório (Framework I)

## Perguntas de triagem

Faça-as sempre que o contexto não estiver claro:

1. A entidade é instituição autorizada pelo BCB (ou por outro supervisor
   prudencial)?
2. Em quais jurisdições decide crédito sobre pessoas físicas (Brasil, UE,
   EUA)?
3. O modelo gera decisão unicamente automatizada que afeta o cliente?
4. Usa dados de bureau ou cadastro positivo?
5. Há exigência contratual, de auditoria, de controlador estrangeiro, de
   parceiro financeiro ou de securitização?
6. Há regulação setorial (Anatel, ANS, Aneel etc.)?

## Matriz de aplicabilidade (Brasil, empresa não financeira que concede crédito ao consumidor)

| Fonte | Status para não financeira | Implicação para modelagem |
|---|---|---|
| LGPD art. 20 e §§1º–2º | **R** (legal) | Canal de revisão; explicação de critérios e procedimentos mediante solicitação; documentação que suporte auditoria de aspectos discriminatórios; base legal (proteção do crédito, art. 7º, X) |
| LGPD princípios (art. 6º: finalidade, necessidade, não discriminação) | **R** | Minimização de variáveis; justificar cada feature; evitar dados sensíveis e proxies evidentes |
| Lei 12.414/2011 art. 5º, IV e VI | **R**, se usa dados de banco de dados de adimplemento como consulente | Reason codes: "principais elementos e critérios"; fluxo de revisão de decisão exclusivamente automatizada |
| Súmula 550/STJ e Tema 710 | **R** (jurisprudência consolidada) | Informar dados valorados e fontes; não usar informação sensível ou excessiva |
| CDC arts. 39 e 43 | **R** | Negativos até 5 anos; não usar informação vedada; recusa não abusiva |
| RGC da Anatel (Res. 765/2023) arts. 4º, III, 28 e 30 | **R** para telecom | Inadimplente deve ser atendido com oferta escolhida pela prestadora; o modelo roteia ofertas e não nega atendimento; tratamento não discriminatório |
| Contratos com bureaus | **R** (contratual) | Finalidade permitida de uso do score/dados; proibições de revenda; retenção |
| ANPD NT 12/2025 | Orientação em construção (não é posição final) | Tratar intervenção humana significativa como boa prática (M/RI) |
| CMN 4.557 (art. 9º: avaliação independente, backtesting) | **RI** | Validação por pessoa não desenvolvedora; backtesting periódico |
| CMN 4.966 / IFRS 9 | **RI**; pode ser **R** contábil se a empresa aplica IFRS 9 às próprias recebíveis (verificar com a contabilidade) | PD lifetime, estágios, forward-looking para provisão |
| Basileia IRB, EBA GL/2017/16 | **RI** | Long-run calibration, MoC, representatividade em 5 dimensões |
| SR 26-2/OCC 2026-13 (substitui SR 11-7), PRA SS1/23 | **RI** | Inventário, tiering por materialidade, effective challenge, vendor models |
| EBA GL/2020/06 §4.3.4 | **RI** (**R** só para credores sujeitos na UE) | Entender metodologia, dados, premissas, limitações e outputs de modelos automatizados |
| EU AI Act (Anexo III, creditworthiness) | **R** só se houver atuação na UE; alto risco a partir de 02/12/2027 | Gestão de risco, governança de dados, documentação, supervisão humana |
| ECOA/Reg B (EUA) | **R** só nos EUA | Razões específicas de adverse action; benchmark para reason codes |
| PL 2338/2023 | Projeto, não é lei | Monitorar; preparar avaliação de impacto algorítmico como RI |

## Formulação obrigatória

Nunca "Você precisa fazer isso porque Basel exige." Usar: "Esse
procedimento é usado em frameworks de instituições reguladas e pode ser
útil aqui porque reduz o risco X. Para o seu contexto eu considero
[recomendação], mas você pode optar por [alternativa] se Y não for
relevante."
