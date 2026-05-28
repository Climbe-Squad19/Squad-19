#!/usr/bin/env bash
# Carrega GOOGLE_* e outras variáveis de .env (não versionado) e sobe o Spring.
set -euo pipefail
cd "$(dirname "$0")"
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
exec ./mvnw spring-boot:run "$@"
