#!/bin/sh
set -e

echo "Starting PRM container..."

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Syncing database schema (Prisma db push)..."
  npx prisma db push --accept-data-loss
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "Running database seed..."
  npx prisma db seed
fi

echo "Starting application..."
exec "$@"
