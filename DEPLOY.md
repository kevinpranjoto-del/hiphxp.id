# Deploy Guide — hiphxp-backend

Ringkas: workflow CI sudah ada di `.github/workflows/ci-deploy.yml`. File ini menjelaskan langkah-langkah praktis untuk push image, menyiapkan SSH key, menambahkan GitHub Secrets, dan menjalankan deploy.

1) Tentukan `IMAGE_NAME`

Contoh:

- `IMAGE_NAME=ghcr.io/your-org/hiphxp-backend:prod` (GHCR)
- `IMAGE_NAME=registry.example.com/you/hiphxp:prod` (private registry)

2) Login dan push image (lokal)

Dengan Podman:

```bash
# login
podman login registry.example.com --username YOUR_USER --password-stdin

# tag dan push
podman tag hiphxp-backend:prod $IMAGE_NAME
podman push $IMAGE_NAME
```

Dengan Docker:

```bash
docker login registry.example.com
docker tag hiphxp-backend:prod $IMAGE_NAME
docker push $IMAGE_NAME
```

GHCR (GitHub Container Registry) — lokal push

1. Buat Personal Access Token (PAT) dengan scope `write:packages` (di GitHub → Settings → Developer settings → Personal access tokens).

2. Login dan push dengan Podman:

```bash
echo "YOUR_PAT" | podman login ghcr.io --username YOUR_GH_USERNAME --password-stdin
podman tag hiphxp-backend:prod ghcr.io/YOUR_GH_USERNAME/hiphxp-backend:prod
podman push ghcr.io/YOUR_GH_USERNAME/hiphxp-backend:prod
```

Catatan: workflow CI sudah dikonfigurasi untuk mendorong ke GHCR otomatis (tidak perlu PAT di Actions). Anda hanya butuh PAT untuk push dari mesin lokal.

3) Generate SSH key untuk GitHub Actions (jika deploy via SSH)

```bash
mkdir -p .deploy
ssh-keygen -t ed25519 -f .deploy/deploy_key -N '' -C 'ci-deploy-key'
echo "Public key (add this to /home/USER/.ssh/authorized_keys on target):"
cat .deploy/deploy_key.pub
```

Di server target: tambahkan isi `.deploy/deploy_key.pub` ke `~/.ssh/authorized_keys` user deploy.

4) Tambahkan Secrets di GitHub (Repo → Settings → Secrets)

Minimal yang harus ditambahkan:

- `REGISTRY_HOST`, `REGISTRY_USERNAME`, `REGISTRY_PASSWORD`
- `IMAGE_NAME` (contoh: `ghcr.io/your-org/hiphxp-backend:prod`)
- `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (isi file `.deploy/deploy_key`), `SSH_PORT` (opsional)
- `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT` (opsional)

Contoh via `gh` CLI:

```bash
gh secret set IMAGE_NAME --body "$IMAGE_NAME"
gh secret set SSH_PRIVATE_KEY --body "$(cat .deploy/deploy_key)"
gh secret set DATABASE_URL --body "postgresql://user:pw@db:5432/hiphxp?schema=public"
```

5) Trigger deploy

- Push ke `main` branch → workflow otomatis berjalan.
- Atau jalankan workflow manual dari Actions tab.

6) Verifikasi

- Periksa podman/docker di server: `podman ps -a | grep hiphxp-app` atau `docker ps`.
- Cek logs: `podman logs hiphxp-app --tail 200`.
- Pastikan `DATABASE_URL` benar dan migrasi berhasil.

Alternatif cepat: jika tidak ingin CI SSH deploy, Anda bisa push image ke registry dan jalankan `scripts/deploy.sh` manual di server.
