# Struktur Folder Project Toko Rajut

Dokumen ini menjelaskan struktur folder dan berkas di dalam project **Toko Rajut** yang telah dimigrasikan dari HTML/JS/CSS vanilla ke framework **React (Vite)** dan terintegrasi dengan backend berbasis Express (untuk lokal/Vercel) serta Cloudflare Workers + D1 Database.

## Pohon Struktur Direktori

Berikut adalah visualisasi struktur direktori utama di dalam project ini:

```text
Rajut/
├── .agents/                      # Konfigurasi dan skill AI lokal (diabaikan di git)
├── .github/                      # (Jika ada) konfigurasi workflow GitHub
├── api/                          # Serverless entry point untuk Vercel
│   └── index.js                  # Entry point Express API di Vercel
├── bot/                          # File kredensial bot / pihak ketiga
│   └── *.json                    # Kredensial Google Drive Service Account
├── dist/                         # Output folder hasil build Vite
├── my-backend-api/               # Backend berbasis Cloudflare Workers
│   ├── src/
│   │   └── index.js              # Entry point API Worker (D1 & Turnstile)
│   ├── test/
│   │   └── index.spec.js         # Unit test Worker (Vitest)
│   ├── schema.sql                # Skema D1 database remote
│   ├── wrangler.jsonc            # Konfigurasi Cloudflare Workers
│   └── package.json
├── public/                       # Aset publik statis untuk frontend
│   ├── uploads/                  # Folder upload media lokal (fallback)
│   ├── index.html                # Template HTML utama
│   └── about-lion.jpg, logo.png  # Gambar & ikon statis
├── server/                       # Backend lokal berbasis Node.js/Express
│   ├── authMiddleware.js         # JWT token & Admin authentication middleware
│   ├── db.js                     # Inisialisasi DB, seeding, & query fallback D1
│   ├── index.js                  # Handler API routing server Express
│   └── mailer.js                 # Konfigurasi pengiriman email SMTP Gmail
├── src/                          # Kode sumber frontend (React)
│   ├── assets/                   # Aset gambar frontend (.gitkeep)
│   ├── components/               # Komponen React bersama (shared)
│   │   ├── shared/
│   │   │   ├── Header.jsx        # Navbar dinamis dengan role-based action
│   │   │   └── Footer.jsx        # Footer terpadu dengan link privasi
│   │   └── ui/
│   │       └── Button.jsx        # Tombol UI standar yang reusable
│   ├── constants/                # File konstanta (.gitkeep)
│   ├── context/                  # State global terpusat
│   │   └── NotificationContext.jsx # Toast Alert System premium (Success, Error, Loading)
│   ├── features/                 # Fitur-fitur modular (seksi halaman)
│   │   ├── about/
│   │   │   └── About.jsx         # Seksi profil & Vision/Mission editor untuk Admin
│   │   ├── auth/
│   │   │   └── Auth.jsx          # Form login, register, Turnstile, & show password toggle
│   │   ├── contact/
│   │   │   └── Contact.jsx       # Form kontak, auto-fill email, & SMTP trigger
│   │   ├── dashboard/            # Panel dashboard (.gitkeep)
│   │   ├── gallery/
│   │   │   └── Gallery.jsx       # Galeri rajut, Lightbox modal carousel, & uploader Admin
│   │   ├── home/
│   │   │   └── Home.jsx          # Beranda hero banner & Featured Works
│   │   ├── privacy/
│   │   │   └── Privacy.jsx       # Halaman Kebijakan Privasi
│   │   ├── product/              # Fitur produk (.gitkeep)
│   │   └── projects/
│   │       └── Projects.jsx      # Portofolio proyek rajut, modal detail, & CRUD Admin
│   ├── hooks/
│   │   └── useSwipe.js           # Deteksi gestur swipe aman untuk mobile carousel
│   ├── services/
│   │   └── api.js                # Kumpulan fungsi fetch API backend
│   ├── styles/
│   │   └── style.css             # File stylesheet utama CSS
│   ├── types/                    # Tipe data (.gitkeep)
│   ├── utils/
│   │   ├── cloudflare.js         # Utility Cloudflare
│   │   ├── cookie.js             # Pengelola cookie browser untuk sesi
│   │   └── .gitkeep
│   ├── App.jsx                   # Komponen induk frontend & pengaturan navigasi seksi
│   └── main.jsx                  # Berkas render utama React
├── .env                          # Konfigurasi environment (diabaikan di git)
├── .gitignore                    # Aturan pengabaian pelacakan berkas Git
├── CLOUDFLARE_MIGRATION.md       # Dokumentasi panduan migrasi ke Cloudflare
├── d1_setup.sql                  # Skrip pembuatan tabel database Cloudflare D1
├── index.html                    # File entri Vite root
├── package.json                  # Konfigurasi package Node.js & script build
├── README.md                     # Informasi umum repositori
├── skills-lock.json              # File kunci skill sistem AI
├── update.md                     # Riwayat update detail dari awal sampai sekarang
├── vercel.json                   # Konfigurasi routing Vercel Serverless
└── vite.config.js                # Konfigurasi bundler Vite + React
```

## Deskripsi Folder Utama

### 1. `my-backend-api/`
Folder ini berisi kode backend yang dideploy ke Cloudflare Workers. Node runtime ini melayani API secara serverless dan terhubung langsung ke **Cloudflare D1 Database** menggunakan Wrangler CLI. Di dalamnya terdapat file `schema.sql` untuk inisialisasi tabel basis data di cloud.

### 2. `server/`
Berisi backend Express.js lokal yang digunakan selama proses pengembangan (development) sebelum dideploy ke Cloudflare/Vercel. Server ini menangani API, pengunggahan file ke Google Drive (via `bot/` credentials), pengiriman notifikasi email via Gmail SMTP, serta menyediakan sistem database fallback in-memory jika D1 cloud tidak dapat dijangkau.

### 3. `src/`
Direktori utama aplikasi frontend berbasis React. Mengikuti arsitektur modular yang membagi kode menjadi:
* **`components/`**: Komponen visual global yang digunakan di banyak tempat.
* **`context/`**: State terpusat seperti Notification Context untuk memicu custom Toast notifications.
* **`features/`**: Bagian-bagian utama dari satu halaman aplikasi web (*Single Page Application*), dipisahkan per domain fungsional seperti `auth`, `about`, `gallery`, `projects`, `contact`, dan `privacy`.
* **`services/`**: Menyediakan API client untuk berkomunikasi dengan backend endpoint secara transparan.

### 4. `public/`
Direktori aset statis. Semua file di sini akan dicopy langsung ke root folder saat Vite melakukan kompilasi (`dist/`). Isi utamanya adalah berkas HTML entri `index.html` dan aset gambar seperti logo serta favicon.

### 5. File Konfigurasi di Root (`/`)
* **`update.md`**: Log lengkap yang mencatat 109+ perubahan kode program sejak migrasi dari Vanilla JS hingga implementasi fitur terbaru.
* **`vercel.json`**: Konfigurasi deployment untuk Vercel agar rute `/api` dialihkan ke Express Serverless Function (`api/index.js`).
* **`vite.config.js`**: Mengonfigurasi modul plugin React Vite dan rollup input target.
* **`d1_setup.sql`**: Berkas SQL untuk inisialisasi skema tabel lokal/D1 database.
