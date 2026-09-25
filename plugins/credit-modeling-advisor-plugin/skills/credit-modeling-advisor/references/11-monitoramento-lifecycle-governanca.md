# 11 — Monitoramento, lifecycle e governança

## Monitoramento por camadas

- **Dados:** missing, distribuição, CSI, freshness, falhas de integração,
  mudanças de fornecedor.
- **Score:** distribuição, PSI, concentração em faixas, reason codes mais
  frequentes.
- **Performance:** Gini/KS/bad rate por safra, canal e produto.
- **Calibração:** observado/esperado por faixa, considerando o atraso de
  maturação.
- **Negócio:** aprovação, conversão, perdas, EL, overrides, reclamações,
  pedidos de revisão (art. 20), contestação.
- **Indicadores antecipados:** FPD, curvas de safra em MOB 3/6, roll
  rates.

## Thresholds

Não invente. Os limiares 0,10/0,25 de PSI são convenção de mercado (M)
sem taxa de erro associada. Yurdakul & Naranjo (2020) derivam valores
críticos que dependem de n e de bins. Proposta inicial:

- Semáforo com os limiares convencionais, marcados como **hipótese**.
- Complemento com teste estatístico e materialidade de negócio.
- Recalibração dos thresholds após 6 a 12 ciclos.

Para Gini, sugere-se alerta quando a queda no OOT exceder o IC do
desenvolvimento, também marcado como hipótese.

## Plano de ação por severidade

- **Verde:** registrar.
- **Amarelo:** investigar a causa (dados? mix? política?).
- **Vermelho:** escalar, com possível ajuste de corte, recalibração,
  overlay temporário, redevelopment ou suspensão.

Definir responsável, frequência e prazo.

## Lifecycle e triggers

Idea → Development → Validation → Approval → Implementation → Monitoring
→ Review → Recalibration → Redevelopment → Retirement.

- **Recalibração:** ranking preservado com nível deslocado.
- **Redevelopment:** perda de ranking, nova fonte de dados, mudança de
  população ou produto.
- **Retirement:** substituição ou fim do produto. Manter o arquivo
  reprodutível.

## Governança proporcional

- Inventário: owner do modelo, owner do negócio, owner dos dados, nível,
  uso, dependências, fornecedores.
- Versionamento e reprodutibilidade (seed, código, extrato de dados).
- Change management com categorização de mudanças.
- Controle de acesso.
- Gestão de incidentes.
- Gestão de modelos de terceiros: scores de bureau também são modelos.
  Exija documentação mínima, monitore a performance própria e prepare
  contingência.

## Validação independente (RI)

É obrigatória para instituições do CMN 4.557 art. 9º. Fora desse âmbito,
as alternativas são:

- Revisão por par não desenvolvedor.
- Checklist independente.
- Validação parcial focada em leakage, OOT e implementação.
- Revisão externa pontual.
- Testes automatizados.
- Plano de validação posterior com controles compensatórios, na linha do
  que o SR 26-2 admite para urgência.
