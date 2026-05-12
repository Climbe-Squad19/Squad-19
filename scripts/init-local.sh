#!/usr/bin/env bash
# Primeira vez no repositório: cria .env a partir dos .env.example (sem sobrescrever o que já existe).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

copy_if_missing() {
  local src="$1" dest="$2"
  if [[ -f "$dest" ]]; then
    echo "Já existe: $dest"
  else
    cp "$src" "$dest"
    echo "Criado $dest (edite e preencha valores, ex.: GOOGLE_*)"
  fi
}

copy_if_missing "$ROOT/gestao-contratos/.env.example" "$ROOT/gestao-contratos/.env"
copy_if_missing "$ROOT/frontend/.env.example" "$ROOT/frontend/.env"

echo ""
echo "Próximo passo: preencha gestao-contratos/.env (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)."
echo "Instale dependências do frontend: npm run install:all"
echo "Subir stack: terminal 1 → npm run dev:api  |  terminal 2 → npm run dev:web"
