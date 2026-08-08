#!/usr/bin/env node
// Guard mecânico (guardrail G3 — references/guardrails-de-contexto.md da skill
// especificacao-e-sessoes): o CLAUDE.md é carregado inteiro em toda sessão de IA;
// este script falha o CI se ele voltar a crescer sem controle.
//
// Instalação no projeto:
//   1. Copie para scripts/check-claude-md.js na raiz do repositório.
//   2. package.json → "scripts": { "check:claude-md": "node scripts/check-claude-md.js" }
//      (ou chame direto num step do CI, logo após a instalação de dependências).
//   3. Estourou o teto? NUNCA apague para caber: pode uma seção que virou "detalhe"
//      para a doc de domínio (docs/claude/ ou docs/wiki/) e deixe só o ponteiro.
//
// Uso: node scripts/check-claude-md.js [caminho] [maxLinhas]
//   caminho    default: CLAUDE.md (relativo ao diretório de execução)
//   maxLinhas  default: env CLAUDE_MD_MAX_LINES ou 450

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(process.argv[2] || 'CLAUDE.md');
const MAX_LINES = parseInt(
  process.argv[3] || process.env.CLAUDE_MD_MAX_LINES || '450',
  10
);

if (!fs.existsSync(filePath)) {
  console.error(`Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const lineCount = fs.readFileSync(filePath, 'utf8').split('\n').length;

if (lineCount > MAX_LINES) {
  console.error(
    `${path.basename(filePath)} tem ${lineCount} linhas (limite: ${MAX_LINES}).\n` +
      'Antes de adicionar mais conteúdo: pode uma seção que virou "detalhe" para a ' +
      'doc de domínio (docs/claude/ ou docs/wiki/) e deixe só o ponteiro de 1 linha. ' +
      'Contrato completo (poda/spillover): guardrail G3 da skill especificacao-e-sessoes.'
  );
  process.exit(1);
}

console.log(`${path.basename(filePath)}: ${lineCount}/${MAX_LINES} linhas.`);
