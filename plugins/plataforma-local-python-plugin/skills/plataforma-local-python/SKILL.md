---
name: plataforma-local-python
description: >-
  Playbook validado em produção (PolicyOps e AppCreditoSimulador) para transformar uma
  aplicação web em plataforma que roda localmente numa máquina corporativa Windows, sem
  máquina central, sem admin e sem internet garantida: servidor Python por usuário em
  127.0.0.1, venv dedicado, instalação em camadas (índice pip corporativo primeiro, wheels
  offline como contingência), instalar.bat/iniciar.bat, token por boot e sonda de ambiente.
  Use SEMPRE que for: fazer uma app rodar "na minha máquina corporativa"; empacotar uma SPA
  com servidor Python local; criar instalador .bat com venv; adicionar processamento Python
  (sidecar/motor científico) a uma app de navegador; distribuir por pasta de rede; ou lidar
  com pip/proxy/antivírus corporativo bloqueando instalação.
---

# Plataforma local Python — playbook de execução corporativa

Como transformar uma aplicação (SPA ou app de navegador) em algo que roda **localmente na
máquina corporativa do usuário**, com um servidor Python por usuário, sem depender de TI para
operar, sem admin, sem máquina central e tolerando internet/pip bloqueados.

Padrão validado duas vezes em produção:

- **AppCreditoSimulador** — servidor de estáticos stdlib (`serve.py`) + **sidecar Python
  opcional** (`sidecar.py`) para processamento pesado (numpy/scipy) montado na mesma
  porta/origem sob `/api/compute/*`.
- **PolicyOps** — servidor FastAPI (`policyops_server.py` + `launcher.py`) que serve a SPA e
  uma API de persistência (`/api/*`) com dados numa pasta de rede.

## As restrições que comandam tudo

1. **Sem admin, sem alterar o Python do sistema.** Tudo acontece dentro de um **venv dedicado
   ao app** (`server/.venv/` ou `python/.venv/`), criado por script. Nada de `pip install`
   global, nada de instalador MSI.
2. **Internet/pip não são garantidos.** O índice pip corporativo pode funcionar, funcionar
   parcialmente (proxy) ou estar bloqueado. Por isso a **instalação em camadas** (§3).
3. **Bind exclusivo em `127.0.0.1`**, porta local. Nada escuta na rede — outro colega não
   alcança o servidor do usuário. Zero requisições externas em runtime.
4. **O app nunca depende do Python para abrir** quando isso for possível: o `.html` por duplo
   clique continua como plano B (modo limitado), e um motor Python é sempre **opt-in** que só
   acelera/amplia, nunca requisito de boot (DEC-HX-001 do AppCreditoSimulador).
5. **Batch é frágil**: caminhos e nomes de pasta nos `.bat` sem acento/não-ASCII; `setlocal
   enabledelayedexpansion` + `!VAR!` dentro de blocos `if`/`for`.

## 1. Antes de tudo: a sonda de ambiente (`checar_ambiente.py`)

Antes de decidir dependências, rode uma **sonda** na máquina corporativa alvo (modelo:
`AppCreditoSimulador/release/python/checar_ambiente.py`). Ela:

- reporta versão de Python/pip e disponibilidade de `venv`;
- cria um venv **descartável** em pasta temporária;
- tenta `pip install` de cada pacote candidato pelo índice configurado, com timeout,
  capturando o erro exato quando falha;
- tenta o `import` **duas vezes** — a primeira carga de pacote grande pode levar minutos sob
  antivírus (escaneando DLLs); a segunda, com cache quente, distingue "lento na primeira vez"
  de "realmente quebrado";
- grava `relatorio_ambiente.txt` (humano) + `relatorio_ambiente.json` (estruturado);
- apaga o venv ao final. Não instala nada "de verdade", não lê dados de negócio.

O relatório da sonda é o que decide: **quais pacotes podem ficar sem pin rígido** (índice
funciona) e **quais precisam de wheel offline embarcada**.

## 2. O venv dedicado

- Localizar o Python nesta ordem: `py -3` → `python` (checar com `--version >nul 2>&1`).
  Se nenhum existir, mensagem clara: "peça para a TI instalar o Python 3.9+" e sair com
  código ≠ 0 — nunca tentar baixar Python.
- `python -m venv <pasta-do-app>\.venv` — reaproveitar se `\.venv\Scripts\python.exe` já
  existe. Todo comando posterior usa **o python do venv** explicitamente
  (`.venv\Scripts\python.exe -m pip ...`), nunca ativação de shell.
- O `iniciar.bat` **prefere o venv quando existe e cai para o Python do sistema quando não**
  (no padrão sidecar) ou instrui a rodar `instalar.bat` (no padrão FastAPI). Sem venv, o app
  nunca trava: degrada para o modo limitado.

## 3. Instalação em camadas (o que fez funcionar)

Para **cada linha** de `requirements.txt` (ignorando `#` e vazias), individualmente:

1. **Camada 1 — índice pip corporativo**: `pip install --disable-pip-version-check
   --no-input <spec>` (com `--timeout 8 --retries 1` quando quiser fallback rápido).
2. **Camada 2 — wheels offline embarcadas**: se a 1 falhar, `pip install --no-index
   --find-links wheels\ <spec>` contra uma pasta `wheels/` que **faz parte do pacote
   distribuído**.
3. Contabilizar e imprimir resumo em português: quantas pelo índice, quantas pelas wheels,
   quantas falharam — e o que fazer em caso de falha.

Duas variantes válidas, escolhidas pela sonda:

- **PolicyOps (parque heterogêneo, pip pode estar 100% bloqueado)**: versões **pinadas** no
  `requirements.txt` (a mais recente que ainda declara `requires-python >= 3.9`) e wheels
  **sempre embarcadas**. Um script rodado numa máquina com internet
  (`scripts/fetch-wheels.mjs`) baixa via `pip download --platform win_amd64
  --only-binary=:all:` para **cada versão menor de Python do parque** (3.9–3.13 — pacotes com
  extensão binária, como `pydantic-core`, publicam uma wheel por versão).
- **AppCreditoSimulador (sonda confirmou índice funcionando)**: versões com **piso, sem pin
  rígido** (`numpy>=1.24`) — pin exato quebraria máquinas com índice levemente diferente — e
  `wheels/` vazia por padrão (só um LEIAME explicando como populá-la se outra máquina falhar).

**Bibliotecas que comprovadamente funcionaram no ambiente corporativo**: `fastapi`,
`uvicorn`, `python-multipart` (servidor); `numpy`, `scipy`, `scikit-learn`, `duckdb`
(processamento). Piso de compatibilidade: **Python 3.9**.

## 4. Os dois scripts (`instalar.bat` e `iniciar.bat`)

- **`instalar.bat`** — uma vez por máquina: acha o Python, cria/reaproveita o venv, roda a
  instalação em camadas, imprime o resumo, `pause` no final (o usuário abre por duplo
  clique). Nunca toca o Python do sistema.
- **`iniciar.bat`** — o dia a dia: valida que o venv existe (senão instrui rodar o
  instalador), sobe o servidor com o python do venv, abre o navegador, e diz "mantenha esta
  janela aberta / feche-a para encerrar".
- Ambos começam com `cd /d "%~dp0"` e **detectam o layout em vez de fixá-lo** (raiz do pacote
  com `server\` ao lado, dentro da própria `server\`, ou um layout fixo do time com código em
  subpasta e dados em pasta separada) — checando do mais específico para o mais genérico.
- Mensagens de erro em português, acionáveis, cobrindo os erros que aconteceram de verdade
  (ex.: pasta `server\server\` duplicada por extração dupla do zip).

## 5. O servidor local — dois padrões

### Padrão A — stdlib + sidecar opt-in (AppCreditoSimulador)

Quando o app é 100% navegador e o Python só **serve estáticos e acelera cálculo**:

- `serve.py`: `SimpleHTTPRequestHandler`/`ThreadingHTTPServer` da stdlib servindo a pasta do
  release, adicionando headers **COOP/COEP** (`Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Embedder-Policy: require-corp`) para habilitar `SharedArrayBuffer` no
  navegador, + `Cache-Control: no-cache`.
- `sidecar.py` (**um arquivo, só stdlib** no protocolo): montado ANTES dos estáticos sob
  `/api/compute/*`, na **mesma porta/origem** — zero CORS, o front fala por fetch
  same-origin. No warm-up ele reporta o **tier** (`stdlib`/`full`) conforme numpy/scipy
  importam; pacotes extras (sklearn, duckdb) são declarados em `/capabilities` e carregados
  lazy. Se nada instalar, o app segue 100% no navegador.
- No front, um **ComputeRouter**: classe A de cálculos jamais roteia para o sidecar; classe B
  tenta o sidecar e faz fallback transparente para o Web Worker. Detecção silenciosa.

### Padrão B — FastAPI com API de persistência (PolicyOps)

Quando o Python precisa **gravar arquivos com confiabilidade** (navegador não grava direito):

- FastAPI + uvicorn; dados numa pasta configurável (`--data-dir`, tipicamente pasta de rede).
  Precedência de config: CLI > `config.json` ao lado do servidor > default — config inválida
  gera aviso, nunca impede o boot.
- `launcher.py`: sobe o uvicorn **numa thread do próprio processo** (não subprocesso — fechar
  a janela do `.bat` derruba tudo, sem órfão escutando na porta), faz poll em `/api/health`
  até responder (timeout generoso ~20s para máquina/rede lentas) e só então abre o navegador
  **já na URL com token**.
- Segurança de processo local (não perímetro): porta livre numa faixa fixa (ex. 8770–8799),
  **token aleatório por boot** passado em `?t=` e exigido num header custom em toda chamada
  `/api/*` (exceto `/api/health`) — sem token: 401. Identidade = login Windows
  (`getpass.getuser()`), resolvida uma vez no boot.
- Escrita **atômica** sempre: `{nome}.tmp` na mesma pasta → `flush` + `fsync` →
  `os.replace`. Backup do conteúdo anterior antes de todo save (rotação de N cópias);
  concorrência por hash SHA-256 do arquivo (`409` em conflito) + lock consultivo em arquivo.
- Handshake de versão: toda resposta com header `X-<App>-Api: <n>`; o front recusa API mais
  nova que a dele. Envelope de erro uniforme `{ code, detail }`.
- O servidor é **infraestrutura, não negócio**: nunca interpreta/reserializa o documento —
  grava os bytes exatos que o front serializou (o hash tem que bater dos dois lados).

Escolha A quando o Python é acelerador opcional; B quando persistência/identidade/lock são o
motivo do servidor. Os dois podem coexistir (B serve a SPA e a API; A-sidecar entraria como
rotas extras na mesma origem).

## 6. Empacotamento e distribuição

- O pacote distribuído é **uma pasta** (rede ou zip): `.bat` na raiz, app buildado
  autocontido (HTML único ou `release/` com assets), pasta do servidor Python, `wheels/`,
  sonda. Atualizar a aplicação = substituir a pasta do código; **dados, backups e evidências
  nunca são tocados**.
- App autocontido: **zero referência externa em runtime** (sem CDN, sem fontes web) — vale
  ter um check mecânico no build (ex. `check-selfcontained`).
- Testes do servidor com `pytest` (+ `TestClient` no padrão FastAPI) sem subir servidor real;
  no padrão sidecar, testes de paridade número a número entre motor navegador e motor Python.

## Checklist de execução

1. [ ] Rodar a sonda na máquina alvo; decidir pin/piso e quais wheels embarcar.
2. [ ] Escolher padrão A (sidecar opt-in) ou B (FastAPI) — ou ambos.
3. [ ] `requirements.txt` fechado e comentado (por que cada versão), piso Python 3.9.
4. [ ] `instalar.bat` com venv dedicado + instalação em camadas + resumo.
5. [ ] `iniciar.bat` com detecção de layout, preferência pelo venv, navegador aberto.
6. [ ] Servidor em `127.0.0.1`, porta de faixa fixa, token por boot (padrão B).
7. [ ] Escrita atômica + backup + hash de concorrência, se houver persistência.
8. [ ] Plano B sem Python documentado nas mensagens dos `.bat`.
9. [ ] Testes (`pytest`) e check de autocontenção no CI.

## Referências vivas (código real)

- `AppCreditoSimulador/release/`: `serve.py`, `sidecar.py`, `iniciar.bat`,
  `python/instalar_motor.bat`, `python/checar_ambiente.py`, `python/requirements.txt`.
- `PolicyOps/server/`: `policyops_server.py`, `launcher.py`, `instalar.bat`, `iniciar.bat`,
  `requirements.txt`; `PolicyOps/docs/14-plataforma-local.md` (normativo);
  `PolicyOps/scripts/fetch-wheels.mjs`.
- `references/decisoes-validadas.md` neste plugin — resumo das decisões e do que
  comprovadamente funcionou.
