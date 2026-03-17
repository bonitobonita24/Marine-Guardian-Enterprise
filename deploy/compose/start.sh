#!/bin/bash
# Marine Guardian Enterprise — Docker Compose Start Script
# Usage: ./deploy/compose/start.sh [dev|down|restart|logs]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

NETWORK_NAME="marine_guardian_dev_network"

start_dev() {
  echo "🚀 Starting Marine Guardian Enterprise services..."

  # Create network if it doesn't exist
  if ! docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
    echo "📦 Creating Docker network..."
    docker network create "$NETWORK_NAME"
  fi

  # Start infrastructure services first
  echo "📦 Starting database (PostgreSQL + PgBouncer)..."
  docker compose -f docker-compose.db.yml up -d

  # Wait for PostgreSQL to be healthy
  echo "⏳ Waiting for PostgreSQL..."
  until docker exec postgres pg_isready -U mg_migrate -d marine_guardian > /dev/null 2>&1; do
    sleep 2
  done
  echo "✅ PostgreSQL ready"

  # Start cache (Valkey)
  echo "📦 Starting cache (Valkey)..."
  docker compose -f docker-compose.cache.yml up -d

  # Wait for Valkey
  echo "⏳ Waiting for Valkey..."
  until docker exec valkey valkey-cli ping > /dev/null 2>&1; do
    sleep 2
  done
  echo "✅ Valkey ready"

  # Start storage (MinIO + MailHog)
  echo "📦 Starting storage (MinIO + MailHog)..."
  docker compose -f docker-compose.storage.yml up -d

  # Wait for MinIO
  echo "⏳ Waiting for MinIO..."
  until curl -sf http://localhost:9000/minio/health/live > /dev/null 2>&1; do
    sleep 2
  done
  echo "✅ MinIO ready"

  echo ""
  echo "🎉 All services started successfully!"
  echo ""
  echo "Services:"
  echo "  PostgreSQL:  localhost:5432"
  echo "  PgBouncer:   localhost:6432"
  echo "  Valkey:      localhost:6379"
  echo "  MinIO:       http://localhost:9000 (console: http://localhost:9001)"
  echo "  MailHog:     http://localhost:8025"
  echo ""
  echo "Next steps:"
  echo "  1. Run: pnpm install"
  echo "  2. Run: pnpm prisma migrate dev"
  echo "  3. Run: pnpm --filter marine-guardian-enterprise dev"
}

stop_dev() {
  echo "🛑 Stopping services..."
  docker compose -f docker-compose.db.yml down || true
  docker compose -f docker-compose.cache.yml down || true
  docker compose -f docker-compose.storage.yml down || true
  echo "✅ All services stopped"
}

restart_dev() {
  stop_dev
  start_dev
}

show_logs() {
  echo "📜 Showing logs (Ctrl+C to exit)..."
  docker compose -f docker-compose.db.yml logs -f
}

case "${1:-dev}" in
  dev)
    start_dev
    ;;
  down)
    stop_dev
    ;;
  restart)
    restart_dev
    ;;
  logs)
    show_logs
    ;;
  *)
    echo "Usage: $0 {dev|down|restart|logs}"
    exit 1
    ;;
esac
