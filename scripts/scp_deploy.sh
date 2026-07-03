#!/usr/bin/env bash
set -euo pipefail

# Export image, SCP ke server, SSH run container
# Usage: SERVER_USER=user SERVER_HOST=1.2.3.4 SERVER_PORT=22 ./scripts/scp_deploy.sh

SERVER_USER=${SERVER_USER:-deploy}
SERVER_HOST=${SERVER_HOST:-}
SERVER_PORT=${SERVER_PORT:-22}
SSH_KEY=${SSH_KEY:-.deploy/deploy_key}
DATABASE_URL=${DATABASE_URL:-}
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET:-prod-access}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-prod-refresh}
PORT=${PORT:-80}

if [ -z "$SERVER_HOST" ]; then
  echo "Usage: SERVER_USER=user SERVER_HOST=1.2.3.4 DATABASE_URL=... ./scripts/scp_deploy.sh"
  exit 1
fi

echo "Exporting image hiphxp-backend:prod to tar..."
podman save -o /tmp/hiphxp-backend-prod.tar hiphxp-backend:prod

echo "Copying image to server ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
scp -P "$SERVER_PORT" -i "$SSH_KEY" /tmp/hiphxp-backend-prod.tar "${SERVER_USER}@${SERVER_HOST}:/tmp/"

echo "Loading image and starting container on server..."
ssh -p "$SERVER_PORT" -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" bash << EOSSH
set -euo pipefail
podman load -i /tmp/hiphxp-backend-prod.tar
podman rm -f hiphxp-app || true
podman run -d --name hiphxp-app \
  -e DATABASE_URL='${DATABASE_URL}' \
  -e JWT_ACCESS_SECRET='${JWT_ACCESS_SECRET}' \
  -e JWT_REFRESH_SECRET='${JWT_REFRESH_SECRET}' \
  -p ${PORT}:4000 hiphxp-backend:prod
echo "Container started. Running migrations..."
podman run --rm -e DATABASE_URL='${DATABASE_URL}' hiphxp-backend:prod npx prisma migrate deploy --schema=prisma/schema.prisma
echo "Done!"
EOSSH

rm /tmp/hiphxp-backend-prod.tar
echo "Deployed to ${SERVER_USER}@${SERVER_HOST}:${PORT}"
