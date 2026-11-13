# ConnectSpace — MVP Media Sosial Internal

Dikerjakan sesuai dokumen UJK *Junior Web Programmer* (Uji Praktik Mandiri).

| Layer | Stack |
|---|---|
| Frontend | Vite, React (JavaScript), Tailwind CSS, shadcn/ui + Lucide React, React Router DOM, React Hook Form, Axios, Sonner |
| Backend | Express.js, Prisma (migration + seeder), Joi, bcrypt, jsonwebtoken, Multer, Helmet, CORS, express-rate-limit |
| Database | MySQL (phpMyAdmin / XAMPP) |

## Menjalankan

### 1. Database
Nyalakan MySQL (XAMPP). Database `connectspace` akan dibuat otomatis oleh Prisma. Hasilnya bisa dilihat di phpMyAdmin.

### 2. Backend
```bash
cd backend
npm install
# .env sudah disediakan (salinan .env.example) — sesuaikan DATABASE_URL & JWT_SECRET
npm run migrate -- --name init   # membuat tabel + generate Prisma Client
npm run seed                     # data contoh
npm run dev                      # http://localhost:5000
```
Akun demo (seeder): `rina@connectspace.test` / `password123` (juga `budi@…`, `sari@…`).

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173
```
Vite mem-proxy `/api` dan `/uploads` ke `localhost:5000`, jadi tidak perlu konfigurasi CORS tambahan.

> Menambah komponen shadcn/ui lain: `npx shadcn@latest add <nama>` (sudah ada `components.json`).

## Arsitektur modular

```
backend/src
├── config/        env, prisma client, path upload
├── middlewares/   auth (guard JWT), validate (Joi), upload (Multer), errorHandler
├── utils/         ApiError, asyncHandler, jwt, files, serializers, response
├── modules/
│   ├── auth/      routes · controller · service · validation
│   ├── users/     profil & ubah password
│   ├── posts/     feed, buat & hapus status
│   ├── likes/     toggle like
│   └── comments/  daftar & kirim komentar (teks + gambar)
└── routes/index.js
backend/prisma     schema.prisma, seed.js

frontend/src
├── components/ui/      komponen shadcn/ui (tema bawaan shadcn di index.css)
├── components/common/  UserAvatar, ImagePicker, FormField
├── components/layout/  AppLayout, Navbar
├── features/
│   ├── auth/      AuthContext, ProtectedRoute, GuestRoute, Login, Register
│   ├── posts/     hooks/useFeed, PostComposer, PostCard, CommentSection/Form, FeedPage
│   └── profile/   ProfileForm, PasswordForm, ProfilePage
├── lib/            http (axios), storage, format, utils
└── routes/         definisi rute
```

## Endpoint API (prefix `/api`)

| Method | Path | Keterangan |
|---|---|---|
| POST | `/auth/register` | Validasi, simpan (bcrypt), **kembalikan token = auto-login** |
| POST | `/auth/login` | Verifikasi password terhadap hash |
| GET | `/auth/me` | Pulihkan sesi |
| POST | `/auth/logout` | Logout (token dihapus di klien) |
| PUT | `/users/profile` | Nama, bio, avatar (upload `avatar` atau `avatarUrl`) |
| PUT | `/users/password` | Wajib password lama yang benar |
| GET | `/posts?page=&limit=` | Feed terbaru → lama (+ `likesCount`, `likedByMe`, `commentsCount`) |
| POST | `/posts` | `content` + `image` (file) / `imageUrl`; minimal salah satu |
| DELETE | `/posts/:postId` | **Hanya pemilik** (403 untuk lainnya) |
| POST | `/posts/:postId/like` | Toggle like / unlike |
| GET/POST | `/posts/:postId/comments` | Daftar & kirim komentar (teks, gambar opsional) |

## Pemetaan ke rubrik penilaian

1. **Struktur & relasi DB** — 4 tabel (`users`, `posts`, `likes`, `comments`), kolom `avatar`/`image` sesuai data dictionary, FK `ON DELETE CASCADE`, `UNIQUE(user_id, post_id)` pada `likes` (`prisma/schema.prisma`).
2. **Registrasi & auto-login** — Joi (email valid & unik, password ≥ 6, konfirmasi cocok), bcrypt, token langsung diterbitkan lalu `navigate('/')` tanpa form login.
3. **Autentikasi & route guard** — `authenticate` di backend; `ProtectedRoute` (ke Login + notifikasi peringatan) dan `GuestRoute` (sudah login → Beranda) di frontend; logout menghapus token.
4. **Profil & foto profil** — ubah nama/bio/avatar (upload atau URL); avatar tampil di navbar, postingan, dan komentar; ubah password memverifikasi password lama.
5. **CRUD status & gambar** — teks dan/atau gambar, tampil paling atas; tombol hapus hanya untuk pemilik dan diverifikasi ulang di server.
6. **Toggle like & komentar bergambar** — 1 user = 1 like/post (dijaga constraint DB); komentar menampilkan avatar, nama, isi teks/gambar, dan waktu.
7. **Keamanan & kerapian** — Prisma (query terparameter, aman dari SQL Injection), validasi MIME + magic-bytes + batas 2 MB + nama berkas acak, Helmet, rate limit login/register, pesan login generik, error handler terpusat.

## Catatan desain
- Sesi memakai **JWT stateless** (Bearer token di `localStorage`). Logout menghapus token di klien dan token lama tetap valid sampai kedaluwarsa. Untuk pencabutan sisi server bisa ditambah kolom `token_version`.
- Berkas upload disimpan di `backend/uploads` dan disajikan di `/uploads`. Berkas lokal ikut dihapus saat postingan dihapus atau avatar diganti.
