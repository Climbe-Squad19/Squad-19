#!/usr/bin/env bash
# Sobe MySQL (Docker) se existir, carrega .env e inicia a API com perfil mysql.
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

ROOT_PW="${MYSQL_ROOT_PASSWORD:-climbe_dev_root}"
MYSQL_HOST_PORT="${MYSQL_HOST_PORT:-3306}"

mysqladmin_ping() {
  if [[ -n "${USE_COMPOSE:-}" ]]; then
    docker compose exec -T mysql mysqladmin ping -h localhost -uroot -p"${ROOT_PW}" --silent 2>/dev/null
  else
    docker exec climbe-mysql mysqladmin ping -h localhost -uroot -p"${ROOT_PW}" --silent 2>/dev/null
  fi
}

start_mysql_docker_run() {
  echo "Plugin docker compose não encontrado; usando docker run (container climbe-mysql)..."
  if docker ps -a --format '{{.Names}}' | grep -qx 'climbe-mysql'; then
    docker start climbe-mysql >/dev/null
  else
    docker run -d --name climbe-mysql --restart unless-stopped \
      -e "MYSQL_ROOT_PASSWORD=${ROOT_PW}" \
      -e MYSQL_DATABASE=climbe \
      -p "${MYSQL_HOST_PORT}:3306" \
      -v climbe_mysql_data:/var/lib/mysql \
      mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
  fi
}

if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    echo "Iniciando MySQL no Docker..."
    USE_COMPOSE=""
    if docker compose version >/dev/null 2>&1; then
      USE_COMPOSE=1
      docker compose up mysql -d
    elif command -v docker-compose >/dev/null 2>&1; then
      USE_COMPOSE=1
      docker-compose up mysql -d
    else
      start_mysql_docker_run
    fi

    echo "Aguardando MySQL ficar saudável (até ~60s)..."
    for _ in $(seq 1 30); do
      if mysqladmin_ping; then
        echo "MySQL OK."
        break
      fi
      sleep 2
    done
  else
    echo "Docker não está acessível; use um MySQL em 127.0.0.1:${MYSQL_HOST_PORT} ou inicie o Docker."
  fi
else
  echo "Docker não instalado; assumindo MySQL já rodando em 127.0.0.1:${MYSQL_HOST_PORT}."
fi

export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-mysql}"
exec ./mvnw spring-boot:run "$@"
