# HipHXP.id — Backend API

Backend REST API untuk platform media Hip-Hop Indonesia. Dibangun dengan **Node.js + Express + Prisma + PostgreSQL**, dan siap dijalankan via **Docker**.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Auth | JWT (Access + Refresh Token) |
| Containerization | Docker + Docker Compose |

---

## Cara Menjalankan (via Docker — Direkomendasikan)

### Prasyarat
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) sudah terinstall dan berjalan

### 1. Clone & masuk ke direktori
```bash
git clone https://github.com/kevinpranjoto-del/hiphxp.id.git
cd hiphxp.id
```

### 2. Jalankan Docker Compose
```bash
docker compose up -d
```

### 3. Jalankan migrasi database (hanya pertama kali)
```bash
docker exec web-hiphxp npx prisma migrate deploy
```

### 4. Verifikasi server berjalan
```bash
curl http://localhost:4000/health
# Response: {"status":"ok"}
```

---

## Cara Menjalankan (Lokal / Development)

### Prasyarat
- Node.js 20+
- PostgreSQL berjalan secara lokal

### 1. Install dependencies
```bash
npm install
```

### 2. Salin dan sesuaikan file environment
```bash
cp .env.example .env
# Edit .env: sesuaikan DATABASE_URL dengan konfigurasi PostgreSQL lokal kamu
```

### 3. Jalankan migrasi database
```bash
npx prisma migrate dev --name init
```

### 4. Jalankan server development
```bash
npm run dev
```

---

## Environment Variables

| Variable | Keterangan | Contoh |
|---|---|---|
| `DATABASE_URL` | Koneksi string PostgreSQL | `postgresql://postgres:postgres@localhost:5432/hiphxp?schema=public` |
| `PORT` | Port server | `4000` |
| `NODE_ENV` | Mode environment | `development` / `production` |
| `JWT_ACCESS_SECRET` | Secret untuk access token | random string panjang |
| `JWT_REFRESH_SECRET` | Secret untuk refresh token | random string panjang |
| `JWT_ACCESS_EXPIRES_IN` | Masa berlaku access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Masa berlaku refresh token | `7d` |
| `CORS_ORIGIN` | Origin yang diizinkan CORS | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Window rate limit (ms) | `900000` |
| `RATE_LIMIT_MAX` | Maks request per window | `100` |

> **Penting:** Jangan gunakan tanda kutip (`"`) pada nilai di file `.env`. Docker membaca nilai secara literal.

---

## API Endpoints

### Auth
| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Registrasi musisi baru |
| POST | `/api/auth/login` | Login dan dapatkan token |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout dan revoke token |
| POST | `/api/auth/verify-email` | Verifikasi email |
| POST | `/api/auth/forgot-password` | Request reset password |
| POST | `/api/auth/reset-password` | Reset password |

### Songs
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/songs` | List semua lagu |
| GET | `/api/songs/:slug` | Detail lagu berdasarkan slug |
| POST | `/api/songs` | Tambah lagu baru |
| PATCH | `/api/songs/:id` | Update data lagu |
| DELETE | `/api/songs/:id` | Soft delete lagu |

### Users
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/users` | List semua user |
| GET | `/api/users/:id` | Detail user beserta profil musisi |
| PATCH | `/api/users/:id` | Update data user |
| DELETE | `/api/users/:id` | Soft delete user |

### Content (Articles)
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/content/articles` | List semua artikel |
| GET | `/api/content/articles/:slug` | Detail artikel |
| POST | `/api/content/articles` | Tambah artikel |
| POST | `/api/content/articles/:id/media-embeds` | Tambah media embed ke artikel |

### Events
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/events` | List semua event |

### Partnerships
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/partnerships` | List partnership |
| GET | `/api/partnerships/:id` | Detail partnership |
| POST | `/api/partnerships` | Ajukan partnership baru |
| PATCH | `/api/partnerships/:id` | Update partnership |
| DELETE | `/api/partnerships/:id` | Hapus partnership |

### Dashboard & Utilities
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/dashboard/stats` | Statistik keseluruhan |
| GET | `/api/docs` | Daftar semua endpoint |
| GET | `/health` | Health check server |
| GET | `/maintenance` | Status maintenance |

---

## Struktur Direktori

```
src/
├── config/
│   └── env.ts              # Konfigurasi environment variables
├── modules/
│   ├── auth/routes.ts      # Auth: register, login, refresh, logout
│   ├── content/routes.ts   # Artikel & media embed
│   ├── songs/routes.ts     # CRUD lagu
│   ├── users/routes.ts     # CRUD user
│   ├── events/routes.ts    # Event hip-hop
│   ├── partnership/routes.ts # Kemitraan
│   └── dashboard/routes.ts # Statistik dashboard
├── shared/
│   ├── prisma.ts           # Prisma client singleton
│   └── auth.ts             # JWT helpers
└── server.ts               # Entry point
prisma/
└── schema.prisma           # Database schema (50+ model)
```
