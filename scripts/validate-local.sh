#!/usr/bin/env bash
# Checagens rápidas do stack local (API deve estar rodando em 8081).
set -euo pipefail
API="${API_URL:-http://127.0.0.1:8081}"
FAIL=0

echo "== Docker: container climbe-mysql =="
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'climbe-mysql'; then
    echo "OK: climbe-mysql está rodando."
  else
    echo "Aviso: climbe-mysql não está em execução (normal se a API ainda não foi iniciada com run-dev-mysql.sh)."
  fi
else
  echo "Aviso: Docker indisponível — pulando checagem do container."
fi

echo ""
echo "== GET ${API}/actuator/health =="
if ! command -v curl >/dev/null 2>&1; then
  echo "Erro: curl não encontrado."
  exit 1
fi
code=$(curl -sS -o /dev/null -w '%{http_code}' "$API/actuator/health" || echo "000")
if [[ "$code" != "200" ]]; then
  echo "Falha: HTTP $code — suba a API (npm run dev:api ou gestao-contratos/./run-dev-mysql.sh)."
  exit 1
fi

body=$(curl -sS "$API/actuator/health")
echo "HTTP 200"
if command -v python3 >/dev/null 2>&1; then
  echo "$body" | python3 -c "import json,sys; d=json.load(sys.stdin); c=d.get('components',{}).get('db',{}); print('db:', c.get('status'), '-', c.get('details',{}).get('database','(detalhe omitido)'))" 2>/dev/null || echo "$body"
else
  echo "$body"
fi
