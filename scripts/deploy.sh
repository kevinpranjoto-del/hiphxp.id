#!/usr/bin/env bash
set -euo pipefail

# Usage: IMAGE=registry.example.com/hiphxp-backend:prod DATABASE_URL=... ./scripts/deploy.sh

IMAGE=${IMAGE:-${REGISTRY:-}/hiphxp-backend:${TAG:-prod}}

if [[ -z "$IMAGE" || "$IMAGE" == "/hiphxp-backend:${TAG:-prod}" ]]; then
  echo "Error: set IMAGE or REGISTRY environment variable"
  echo "Example: IMAGE=registry.example.com/hiphxp-backend:prod DATABASE_URL=... $0"
  exit 1
fi

echo "Tagging local image hiphxp-backend:prod -> $IMAGE"
podman tag hiphxp-backend:prod "$IMAGE"

echo "Pushing image $IMAGE"
podman push "$IMAGE"

echo "Running production migrations (prisma migrate deploy)"
podman run --rm -e DATABASE_URL="$DATABASE_URL" "$IMAGE" npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Stopping any existing container 'hiphxp-app'"
podman rm -f hiphxp-app 2>/dev/null || true

echo "Starting container 'hiphxp-app' from $IMAGE"
podman run -d --name hiphxp-app \
  -e DATABASE_URL="$DATABASE_URL" \
  -e JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-prod-access}" \
  -e JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-prod-refresh}" \
  -p ${PORT:-4002}:4000 \
  "$IMAGE"

echo "Deployed. App should be reachable at http://localhost:${PORT:-4002}"
