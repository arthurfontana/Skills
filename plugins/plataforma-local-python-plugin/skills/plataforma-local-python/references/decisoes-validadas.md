# Decisões validadas em produção (o que funcionou de verdade)

Resumo das decisões dos dois projetos que originaram este playbook, com a justificativa que
foi confirmada no ambiente corporativo real.

## Ambiente corporativo alvo (o que a sonda encontrou)

- Windows x64, Python 3.9+ disponível no parque (via `py -3` ou `python` no PATH), sem admin.
- Índice pip corporativo **funcionou** para numpy/scipy/scikit-learn/duckdb na máquina alvo
  (sonda rodada 2x em 09/07/2026: numpy 2.5.1, scipy 1.18.0, scikit-learn 1.9.0,
  duckdb 1.5.4 instalaram E importaram). Nenhuma wheel foi imprescindível **nessa máquina** —
  mas a camada de contingência (`--no-index --find-links wheels\`) ficou no instalador porque
  outra máquina do parque pode se comportar diferente.
- Antivírus corporativo torna a **primeira importação** de pacotes grandes (sklearn)
  lentíssima (minutos); a segunda é normal. Por isso a sonda importa duas vezes e o
  instalador avisa que a primeira carga pode demorar.

## Dependências comprovadas

| Uso | Pacotes | Estratégia de versão |
|---|---|---|
| Servidor web + API (PolicyOps) | `fastapi==0.128.8`, `uvicorn==0.39.0`, `python-multipart==0.0.20` | Pin exato = a última versão que ainda declara `requires-python >= 3.9`; wheels sempre embarcadas (parque pode ter pip bloqueado) |
| Processamento científico (AppCreditoSimulador) | `numpy>=1.24`, `scipy>=1.10` (tier full); `scikit-learn>=1.3`, `duckdb>=0.9` (extras lazy) | Piso sem pin — índice validado pela sonda; pin exato quebraria índices levemente diferentes |
| Servir estáticos + sidecar | stdlib pura (`http.server`) | Zero dependência para o boot do app |

## Decisões de arquitetura confirmadas

- **ADR-001 (PolicyOps)**: servidor Python local **por usuário**, dados em pasta de rede, sem
  máquina central — navegador não grava arquivo de forma confiável; servidor local resolve
  sem virar operação centralizada.
- **ADR-005 (PolicyOps)**: FastAPI com instalação em camadas (venv + índice pip + wheels
  offline) — determinística e offline; padrão já validado antes no AppCreditoSimulador.
- **DEC-HX-001 (AppCreditoSimulador)**: Motor Python é **opt-in e nunca bloqueia o boot** —
  sem pacotes científicos, o warm-up reporta tier `stdlib` e o app segue 100% no navegador.
- **DEC-HX-003**: sidecar montado na **mesma porta/origem** do app (`/api/compute/*`) —
  elimina CORS e pareamento; o front conversa por fetch same-origin.
- **COOP/COEP no servidor de estáticos**: `python -m http.server` não manda os headers, então
  `crossOriginIsolated` fica false e `SharedArrayBuffer` não ativa (a base colunar seria
  clonada ~200MB para o worker). Dois headers resolvem.
- **Launcher em thread, não subprocesso** (PolicyOps S28): fechar a janela do `.bat` derruba
  o servidor junto — sem processo órfão preso na porta 127.0.0.1.
- **Token por boot + bind 127.0.0.1 + faixa de portas 8770–8799**: proteção de processo
  local, declarada honestamente como não sendo perímetro de segurança corporativo.
- **Escrita atômica + backup pré-save + hash SHA-256 + lock consultivo em arquivo**: queda de
  rede no meio do save nunca deixa o JSON truncado; conflito vira 409 com o conteúdo remoto.
- **Identidade = login Windows** (`getpass.getuser()`), capturada uma vez no boot:
  identificador gratuito e não falsificável no contexto corporativo.
- **Layouts detectados, não fixados, nos `.bat`**: o mesmo instalador serve o checkout de
  dev, o pacote publicado padrão e o layout fixo do time na pasta de rede (código em
  `Aplicacao\...\server\`, dados em `Repositorios\Politicas\`). Nomes de pasta sem acento —
  batch quebra com não-ASCII.

## Armadilhas reais que os scripts tratam

- Extração dupla do zip criando `server\server\` — os `.bat` explicam e mandam apagar a
  duplicata.
- Dois saves no mesmo segundo colidindo no nome do backup — o servidor avança o carimbo até
  achar nome livre.
- Falha na pasta de backups **não** bloqueia o save (vira aviso).
- `pydantic-core` (transitiva do fastapi) publica wheel binária **por versão menor de
  Python** — o fetch de wheels baixa para 3.9 a 3.13 (`pip download --platform win_amd64
  --only-binary=:all:`).
- Config (`config.json`) inválida/ausente = aviso, nunca boot abortado.
