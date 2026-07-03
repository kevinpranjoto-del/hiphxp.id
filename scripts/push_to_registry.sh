#!/usr/bin/env bash
set -euo pipefail

if [ -z "${IMAGE_NAME:-}" ]; then
  echo "Usage: IMAGE_NAME=registry.example.com/you/hiphxp:prod $0"
  exit 1
fi

echo "Tagging local image hiphxp-backend:prod -> $IMAGE_NAME"
podman tag hiphxp-backend:prod "$IMAGE_NAME"

echo "Pushing $IMAGE_NAME"
podman push "$IMAGE_NAME"

echo "Done."
