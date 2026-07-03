#!/usr/bin/env bash
set -euo pipefail

OUT_DIR=${1:-.deploy}
mkdir -p "$OUT_DIR"
KEY_FILE="$OUT_DIR/deploy_key"

if [ -f "$KEY_FILE" ]; then
  echo "Key already exists: $KEY_FILE"
  echo "Public key:"; echo
  cat "$KEY_FILE.pub"
  exit 0
fi

ssh-keygen -t ed25519 -f "$KEY_FILE" -N '' -C 'ci-deploy-key'
echo "Generated: $KEY_FILE"
echo "Public key (add to server ~/.ssh/authorized_keys):"; echo
cat "$KEY_FILE.pub"
