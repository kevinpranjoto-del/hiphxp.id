<div align="center">
  <img src="frontend/img/logo.png" alt="HipHxp.id Logo" width="320">
  <br><br>
  <strong>Platform media independen untuk musik hip-hop dan budaya jalanan Indonesia.</strong>
  <br>
  Review, Release Radar, Lirik & Makna, Lifestyle, Komunitas, dan Kalender Acara — dari kota ke kota.
  <br><br>

  ![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
  ![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
  ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
  ![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-black?logo=githubactions)
</div>

---

## 📖 Tentang Proyek

**HipHxp.id** adalah platform media full-stack yang dibangun untuk merepresentasikan ekosistem hip-hop Indonesia secara menyeluruh. Proyek ini mengintegrasikan:

- **Frontend statis** yang dilayani langsung oleh Express (vanilla HTML/CSS/JS)
- **Backend REST API** yang dibangun dengan Node.js + Express + TypeScript
- **Database relasional** PostgreSQL yang dikelola dengan Prisma ORM
- **Portal Musisi** — musisi dapat mendaftar, mengunggah lagu & cover, membuat event, dan mengelola profil
- **Dashboard Admin** — admin/editor dapat mengelola konten editorial, ulasan, lifestyle, hingga interview
- **Deploy otomatis** via GitHub Actions + Docker ke server produksi (Dokploy/VPS)

---

## ✨ Fitur Utama

### 🎵 Konten Musik
| Fitur | Deskripsi |
|---|---|
| **Review Musik** | Ulasan mendalam album & EP dari redaksi, lengkap dengan embed Spotify/YouTube |
| **Release Radar** | Kurasi rilisan mingguan — single, EP, dan mixtape yang wajib didengar |
| **Lirik & Makna** | Bedah lirik bar demi bar dengan makna yang ditulis langsung oleh musisi |
| **Music Player** | Pemutar musik internal dengan cover art, info lagu, dan tautan platform |

### 🧍 Portal Musisi
| Fitur | Deskripsi |
|---|---|
| **Registrasi & Login** | Auth via JWT (access + refresh token) dengan cookie HTTP-only |
| **Dashboard Musisi** | Upload lagu (audio MP3 + cover image), kelola event, edit profil |
| **Manajemen Lagu** | Tambah, edit, sembunyikan, atau hapus (soft delete) lagu |
| **Manajemen Event** | Buat, edit, dan kelola acara (soft delete) |

### 🖼️ Lifestyle & Budaya
| Fitur | Deskripsi |
|---|---|
| **Streetwear** | Artikel dan galeri fashion jalanan |
| **Graffiti / Mural** | Dokumentasi karya seni jalanan dari berbagai kota |
| **Dance** | Liputan komunitas dance hip-hop |
| **Interview** | Wawancara eksklusif dengan musisi dan pelaku budaya |
| **Editorial** | Opini, longform, dan feature story |

### 🏙️ Community Hub
| Fitur | Deskripsi |
|---|---|
| **Direktori Kolektif** | Daftar kolektif hip-hop per kota, dinamis dari database |
| **Kalender Acara** | Agenda event mendatang dengan filter kota & kategori dinamis |
| **Direktori Artist** | Halaman profil musisi/artis yang terdaftar |

### 🤝 Kerja Sama
| Fitur | Deskripsi |
|---|---|
| **Form Partnership** | Brand & kolektif bisa mengajukan kerja sama langsung |
| **Rate Card** | Daftar paket kerja sama yang bisa dikustomisasi |

### 🔧 Admin Dashboard
| Fitur | Deskripsi |
|---|---|
| **Manajemen User** | CRUD pengguna musisi dan akun lainnya |
| **CRUD Konten** | Kelola review, radar, lifestyle, interview, event |
| **Statistik** | Jumlah musisi, lagu, event, dan pengunjung real-time |
| **Upload File** | Upload gambar dan audio langsung dari form admin |

---

## 🛠️ Tech Stack

### Backend
| Layer | Teknologi |
|---|---|
| Runtime | **Node.js 20** |
| Framework | **Express.js 4.x** |
| Language | **TypeScript 5.x** |
| ORM | **Prisma** |
| Database | **PostgreSQL 15** |
| Auth | **JWT** (Access + Refresh Token, Cookie HTTP-only) |
| Upload | **Multer** (multipart/form-data) |
| Security | **Helmet**, **CORS**, **express-rate-limit** |
| Logging | **Morgan** |
| Containerization | **Docker + Docker Compose** |

### Frontend
| Layer | Teknologi |
|---|---|
| Markup | **HTML5** (Semantic) |
| Styling | **Vanilla CSS** (design system custom) |
| Logic | **Vanilla JavaScript** (ES2020+) |
| Font Headline | **Archivo Black** (Google Fonts) |
| Font Body | **Inter** (Google Fonts) |
| Font Mono | **JetBrains Mono** (Google Fonts) |
| Served by | **Express static** + Docker volume |

### Infrastructure
| Layer | Teknologi |
|---|---|
| CI/CD | **GitHub Actions** |
| Registry | **GitHub Container Registry (GHCR)** |
| Hosting | **VPS + Dokploy (Traefik reverse proxy)** |
| Container | **Docker** (Podman compatible) |
| DB Volume | **Docker named volume** (`postgres_data`) |
| Upload Storage | **Persistent volume** (`/app/public/uploads`) |

---

## 📁 Struktur Direktori

```
hiphxp.id/
├── .github/
│   └── workflows/
│       └── ci-deploy.yml       # CI/CD: build Docker image → push GHCR → SSH deploy
├── frontend/
│   ├── css/
│   │   └── style.css           # Design system — tokens, layout, semua komponen
│   ├── img/
│   │   └── logo.png            # Logo HipHxp.id (digunakan di navbar & OG image)
│   ├── js/
│   │   ├── api.js              # Fungsi-fungsi fetch ke backend API
│   │   ├── app.js              # Logic halaman utama (hero, musik, event, dll)
│   │   ├── admin.js            # Logic dashboard admin
│   │   ├── dashboard.js        # Logic dashboard musisi
│   │   ├── login.js            # Logic form login
│   │   ├── music-player.js     # Custom music player
│   │   └── tracking.js         # Tracking pengunjung
│   ├── index.html              # Halaman utama (homepage)
│   ├── admin.html              # Dashboard admin (CRUD konten)
│   ├── dashboard.html          # Portal musisi (upload lagu & event)
│   ├── login.html              # Halaman login musisi
│   ├── music.html              # Halaman pencarian & pemutar lagu
│   └── favicon.svg             # Favicon (ikon kotak HipHxp)
├── prisma/
│   ├── schema.prisma           # Schema database (50+ model)
│   ├── seed.ts                 # Seeder data awal (artikel, ulasan, musisi demo)
│   └── migrations/             # Riwayat migrasi database
├── src/
│   ├── config/
│   │   └── env.ts              # Konfigurasi & validasi environment variables
│   ├── modules/
│   │   ├── admin/routes.ts     # Admin CRUD (user, song, event, review, dll) — Auth: ADMIN
│   │   ├── artists/routes.ts   # Direktori artis
│   │   ├── auth/routes.ts      # Register, login, refresh, logout, reset password
│   │   ├── collectives/routes.ts  # Direktori kolektif hip-hop
│   │   ├── content/
│   │   │   ├── routes.ts          # Artikel & media embed
│   │   │   ├── lifestyle.routes.ts  # Streetwear, graffiti, dance posts
│   │   │   ├── editorial.routes.ts  # Editorial & longform
│   │   │   └── reviews.routes.ts    # Music review & release radar
│   │   ├── dashboard/routes.ts  # Statistik publik (lagu, musisi, event)
│   │   ├── events/routes.ts     # CRUD event (soft delete)
│   │   ├── partnership/routes.ts  # Form & manajemen kerja sama
│   │   ├── songs/routes.ts      # CRUD lagu musisi (soft delete, upload audio & cover)
│   │   ├── tracking/routes.ts   # Tracking pengunjung unik
│   │   └── users/routes.ts      # Profil & data user
│   ├── shared/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # JWT helpers (sign, verify)
│   │   └── authMiddleware.ts   # Middleware autentikasi JWT
│   └── server.ts               # Entry point — setup Express, middleware, routes
├── public/
│   └── uploads/
│       ├── audio/              # File MP3 lagu yang diunggah musisi
│       └── images/             # Cover art dan gambar lainnya
├── docker-compose.yml          # Konfigurasi Docker (db, web, frontend)
├── Dockerfile                  # Image builder untuk backend + frontend
├── package.json
├── tsconfig.json
└── .env                        # Environment variables (tidak di-commit ke git)
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstall dan berjalan

### 1. Clone repository
```bash
git clone https://github.com/kevinpranjoto-del/hiphxp.id.git
cd hiphxp.id
```

### 2. Siapkan file environment
```bash
cp .env.example .env
# Edit .env sesuai kebutuhan (minimal: JWT secrets wajib diganti!)
```

### 3. Jalankan semua service
```bash
docker compose up -d
```

> Perintah ini akan otomatis:
> 1. Menjalankan PostgreSQL
> 2. Menjalankan migrasi database (`prisma db push`)
> 3. Mengisi data awal (`seed.js`)
> 4. Menjalankan backend server

### 4. Verifikasi server berjalan
```bash
curl http://localhost:4000/health
# Response: {"status":"ok"}
```

### 5. Akses aplikasi
| URL | Keterangan |
|---|---|
| `http://localhost:4000` | Halaman utama (homepage) |
| `http://localhost:4000/login.html` | Login musisi |
| `http://localhost:4000/admin.html` | Dashboard admin |
| `http://localhost:4000/dashboard.html` | Portal musisi |
| `http://localhost:4000/music.html` | Pemutar & pencarian lagu |

---

## 💻 Development Lokal (tanpa Docker)

### Prasyarat
- Node.js 20+
- PostgreSQL berjalan secara lokal

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Salin & edit environment
cp .env.example .env
# Sesuaikan DATABASE_URL dengan PostgreSQL lokal

# 3. Jalankan migrasi & seed
npx prisma migrate dev
npx prisma db seed

# 4. Jalankan server
npm run dev
```

Server akan berjalan di `http://localhost:4000`.

---

## ⚙️ Environment Variables

| Variable | Keterangan | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:postgres@localhost:5432/hiphxp?schema=public` |
| `PORT` | Port server Express | `4000` |
| `NODE_ENV` | Mode environment | `development` / `production` |
| `JWT_ACCESS_SECRET` | Secret untuk access token JWT | random string panjang (min. 32 karakter) |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token JWT | random string panjang (min. 32 karakter) |
| `JWT_ACCESS_EXPIRES_IN` | Masa berlaku access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Masa berlaku refresh token | `7d` |
| `CORS_ORIGIN` | Origin yang diizinkan CORS | `https://hiphxp.id` |
| `RATE_LIMIT_WINDOW_MS` | Window rate limit (ms) | `900000` (= 15 menit) |
| `RATE_LIMIT_MAX` | Maks request per window | `100` |

> ⚠️ **Penting:** Jangan gunakan tanda kutip (`"`) pada nilai di file `.env`. Docker membaca nilai secara literal.

> ⚠️ **Keamanan:** Wajib ganti `JWT_ACCESS_SECRET` dan `JWT_REFRESH_SECRET` sebelum deploy ke produksi!

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrasi akun musisi baru |
| POST | `/api/auth/login` | — | Login, dapatkan access & refresh token |
| POST | `/api/auth/refresh` | Cookie | Perbarui access token |
| POST | `/api/auth/logout` | Cookie | Logout & revoke refresh token |
| POST | `/api/auth/verify-email` | — | Verifikasi email |
| POST | `/api/auth/forgot-password` | — | Request link reset password |
| POST | `/api/auth/reset-password` | — | Reset password dengan token |

### Songs (Portal Musisi)
| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/songs` | — | List semua lagu aktif |
| GET | `/api/songs/:slug` | — | Detail lagu + lirik + makna |
| POST | `/api/songs` | JWT | Upload lagu baru (audio + cover image) |
| PATCH | `/api/songs/:id` | JWT | Update data lagu |
| DELETE | `/api/songs/:id` | JWT | Soft delete lagu (musisi sendiri) |

### Events
| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/events` | — | List event mendatang (filter: kota, tanggal, kategori) |
| POST | `/api/events` | JWT | Buat event baru (musisi) |
| PATCH | `/api/events/:id` | JWT | Update event |
| DELETE | `/api/events/:id` | JWT | Soft delete event |

### Artists & Collectives
| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/artists` | — | Direktori artis |
| GET | `/api/artists/:slug` | — | Profil artis |
| GET | `/api/collectives` | — | Direktori kolektif hip-hop |

### Content (Editorial)
| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/content/articles` | — | List artikel |
| GET | `/api/content/articles/:slug` | — | Detail artikel |
| GET | `/api/content/reviews` | — | Music reviews |
| GET | `/api/content/reviews/radar` | — | Release Radar |
| GET | `/api/content/lifestyle/:category` | — | Konten lifestyle (streetwear/graffiti/dance) |
| GET | `/api/content/editorials` | — | Artikel editorial |

### Partnerships
| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| POST | `/api/partnerships` | — | Kirim form kerja sama |
| GET | `/api/partnerships` | JWT Admin | List semua pengajuan |
| PATCH | `/api/partnerships/:id` | JWT Admin | Update status partnership |
| DELETE | `/api/partnerships/:id` | JWT Admin | Hapus partnership |

### Admin (Hanya ADMIN / SUPER_ADMIN)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/admin/stats` | Statistik ringkas (user, lagu, event, visitor) |
| GET/DELETE | `/api/admin/users/:id` | Manajemen akun user |
| GET/DELETE | `/api/admin/songs/:id` | Manajemen lagu (soft delete) |
| GET/DELETE | `/api/admin/events/:id` | Manajemen event (soft delete) |
| GET/POST/DELETE | `/api/admin/reviews` | Manajemen music review + embed link |
| GET/POST/DELETE | `/api/admin/radar` | Manajemen release radar |
| GET/POST/DELETE | `/api/admin/lifestyle/:category` | Manajemen konten lifestyle |
| GET/POST/DELETE | `/api/admin/interviews` | Manajemen interview |

### Dashboard & Utilities
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/dashboard/stats` | Statistik publik (musisi, lagu, event) |
| GET | `/api/track` | Tracking pengunjung unik |
| GET | `/health` | Health check server |
| GET | `/api/docs` | Daftar semua endpoint tersedia |

---

## 🗄️ Database Schema

Database menggunakan **PostgreSQL 15** dengan **Prisma ORM**. Schema memiliki 50+ model yang mencakup:

### Core
- `User` — akun dengan role: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `WRITER`, `MUSICIAN`
- `MusicianProfile` — profil detail musisi (bio, kota, genre, sosial media)
- `Role` & `Permission` — sistem hak akses berbasis role

### Musik
- `Song` — lagu (audio, cover, slug, soft delete)
- `Artist` — profil artis publik
- `Album`, `Single` — koleksi rilisan
- `MusicReview` — ulasan album/EP (dengan link Spotify & YouTube)
- `ReleaseRadar` — kurasi rilisan mingguan
- `Lyrics` & `SongMeaning` — lirik dan makna lagu

### Konten
- `Article` — artikel editorial dengan status draft/published
- `ArticleMediaEmbed` — embed Spotify/YouTube/TikTok di artikel
- `Interview` — wawancara eksklusif
- `Editorial`, `Opinion`, `Longform`, `FeatureStory` — tipe konten panjang
- `StreetwearPost`, `GraffitiPost`, `DancePost` — konten lifestyle per kategori

### Komunitas
- `Collective` — kolektif hip-hop lokal (dengan kota & deskripsi)
- `Crew`, `CommunityDirectory` — kelompok komunitas
- `Beatmaker`, `DanceCrew`, `GraffitiArtist`, `Photographer`, `Videographer`, `Studio` — direktori pelaku kreatif
- `ArtistDirectory` — halaman publik artis

### Event & Partnership
- `Event` — acara hip-hop (kategori: GIG, FESTIVAL, RAP_BATTLE, WORKSHOP, dll)
- `Partnership` — form & manajemen kerja sama brand
- `RateCard`, `SponsoredContent`, `Promotion` — manajemen iklan & promosi

### Infrastruktur
- `FileAsset` — tracking file yang diunggah
- `SiteVisitor` — counter pengunjung unik
- `RefreshToken` — manajemen sesi login

---

## 🔁 CI/CD Pipeline

Pipeline otomatis berjalan setiap kali ada push ke branch `main`:

```
Push ke main
     │
     ▼
┌─────────────────────────────┐
│   GitHub Actions             │
│   1. npm ci                  │
│   2. prisma generate         │
│   3. npm run build           │
│   4. Docker build & push     │
│      → ghcr.io/:repo:prod    │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│   Deploy via SSH             │
│   1. docker pull image       │
│   2. docker run (new)        │
│   3. prisma migrate deploy   │
└─────────────────────────────┘
```

### GitHub Secrets yang diperlukan

| Secret | Keterangan |
|---|---|
| `SSH_HOST` | IP / hostname server produksi |
| `SSH_USER` | Username SSH |
| `SSH_PRIVATE_KEY` | Private key SSH |
| `SSH_PORT` | Port SSH (default: `22`) |
| `DATABASE_URL` | Connection string produksi |
| `JWT_ACCESS_SECRET` | Secret JWT produksi |
| `JWT_REFRESH_SECRET` | Refresh secret JWT produksi |
| `IMAGE_NAME` | (Opsional) Nama custom image GHCR |
| `PORT` | Port expose container (default: `80`) |

---

## 💾 Persistent Storage (Produksi)

Untuk memastikan file unggahan (audio & gambar cover) tidak hilang saat redeploy, wajib menggunakan **persistent volume** di server:

### Via Docker Compose (lokal/dev)
```yaml
volumes:
  - ./public/uploads:/app/public/uploads
```

### Via Dokploy (produksi — Volumes/Mounts)
| Field | Nilai |
|---|---|
| Mount Type | **Volume Mount** |
| Volume Name | `hiphxp-uploads` |
| Mount Path (container) | `/app/public/uploads` |

---

## 🎨 Design System

Frontend menggunakan sistem desain custom berbasis CSS vanilla dengan token warna:

```css
:root {
  --ink:       #0a0a0a;               /* Hitam utama */
  --paper:     #f2f1ec;               /* Krem/putih hangat */
  --grey:      #8a8a85;               /* Abu netral */
  --grey-line: rgba(10,10,10,0.14);   /* Border tipis */
  --red:       #e5342a;               /* Merah brand */
  --red-dim:   rgba(229,52,42,0.14);  /* Merah transparan */
}
```

**Tipografi:**
- **Headline besar** → `Archivo Black` (font kuat & bold)
- **Body / teks sub** → `Inter` (modern, mudah dibaca)
- **Kode / label mono** → `JetBrains Mono`

**Prinsip desain:**
- Layout berbasis grid dengan border tipis (`1px`, warna `--grey-line`)
- Estetika editorial majalah (hitam-putih-merah)
- Responsive mobile-first
- Animasi halus pada hover & transisi

---

## 👥 Role & Akses

| Role | Akses |
|---|---|
| `SUPER_ADMIN` | Full akses ke semua fitur dan data |
| `ADMIN` | Kelola semua konten, user, event, partnership |
| `EDITOR` | Kelola konten editorial (artikel, review, radar) |
| `WRITER` | Buat & edit artikel sendiri |
| `MUSICIAN` | Upload lagu, buat event, edit profil sendiri |

---

## 📝 Lisensi

Proyek ini bersifat **private** dan dimiliki oleh tim **HipHxp.id**. Seluruh kode dan aset berhak cipta.

---

<div align="center">
  Dibuat dengan ❤️ untuk ekosistem hip-hop Indonesia.<br>
  <strong>hiphxp.id</strong> — Dengar. Lihat. Rayakan.
</div>
