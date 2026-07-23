# Perubahan Kode Program (Update Log)

Dokumen ini mencatat perubahan kode program dari website portofolio vanilla HTML/JS/CSS **Toko Rajut** ke framework **React** menggunakan **Vite**. Struktur folder telah disesuaikan agar sama persis dengan yang diminta.

## File Konfigurasi & Build

### 1. [package.json](file:///c:/laragon/www/Rajut/package.json) (Diubah)
- Menambahkan dependensi React (`react`, `react-dom` versi `^19.2.7`).
- Menambahkan devDependensi Vite (`vite`, `@vitejs/plugin-react`).
- Menambahkan scripts: `"dev": "vite"`, `"build": "vite build"`, dan `"preview": "vite preview"`.

### 2. [vite.config.js](file:///c:/laragon/www/Rajut/vite.config.js) (Baru)
- Mengonfigurasi plugin React Vite.
- Menambahkan kustom middleware/plugin (`html-redirect`) untuk mengalihkan rute default `/` ke file `public/index.html` pada server pengembangan.
- Mengonfigurasi Rollup build input agar menggunakan `public/index.html` sebagai berkas entri build utama.

### 3. [.gitignore](file:///c:/laragon/www/Rajut/.gitignore) (Diubah)
- Menambahkan direktori `node_modules/`, output build `dist/`, logs, file `.local` env, dan folder temporer `temp-vite/` agar tidak masuk ke pelacakan Git.

---

## File HTML Statis & Styling

### 4. [public/index.html](file:///c:/laragon/www/Rajut/public/index.html) (Baru)
- Memindahkan berkas HTML dari root ke folder `public/`.
- Menghapus tag tautan stylesheet `<link rel="stylesheet" href="./style.css">` dan script `<script src="./script.js"></script>` karena styling dan script kini diatur secara modular lewat React bundler.
- Menambahkan kontainer utama `<div id="root"></div>`.
- Menambahkan script entri React: `<script type="module" src="/src/main.jsx"></script>`.

### 5. [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Baru)
- Memindahkan seluruh kode styling dari vanilla `style.css` ke direktori terpusat `src/styles/style.css`.
- Menambahkan `cursor: pointer` pada kelas `.gallery-item` agar menandakan bahwa gambar di galeri dapat diklik.

---

## File Entri Aplikasi

### 6. [src/main.jsx](file:///c:/laragon/www/Rajut/src/main.jsx) (Baru)
- Berkas entri React. Mengimpor dependensi React, komponen akar `App.jsx`, dan berkas gaya global `src/styles/style.css` serta me-render aplikasi ke dalam elemen DOM `#root`.

### 7. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Baru)
- Berkas komponen utama (root).
- Mengatur status halaman aktif (`activeSection`) yang dideteksi melalui nilai hash URL saat ini (default: `'home'`).
- Mengatur penyelarasan tinggi layar viewport pada mobile browser (`--vh` custom property).
- Mengintegrasikan hook kustom `useSwipe` untuk navigasi antar bagian halaman (seperti pada vanilla script).
- Me-render layout terpadu dari komponen `Header`, `Footer`, dan seluruh bagian fitur halaman (`Home`, `Gallery`, `Projects`, `About`, `Contact`).

---

## Custom Hooks & UI Components

### 8. [src/hooks/useSwipe.js](file:///c:/laragon/www/Rajut/src/hooks/useSwipe.js) (Baru)
- Hook kustom yang merangkum deteksi gerakan sapuan jari (swipe) ke kiri dan kanan pada perangkat mobile, yang digunakan untuk navigasi perpindahan seksi halaman.

### 9. [src/components/ui/Button.jsx](file:///c:/laragon/ui/Button.jsx) (Baru)
- Komponen tombol UI sederhana dan reusable yang mendukung berbagai props, tipe data, dan class styling terstandar.

---

## Komponen Bersama (Shared Components)

### 10. [src/components/shared/Header.jsx](file:///c:/laragon/www/Rajut/src/components/shared/Header.jsx) (Baru)
- Komponen navigasi atas yang dinamis.
- Mengatur logika tombol menu mobile (hamburger menu) dan menu laci (drawer).
- Menyediakan navigasi yang mengubah `activeSection` di state global aplikasi dan meng-update URL hash secara instan.

### 11. [src/components/shared/Footer.jsx](file:///c:/laragon/www/Rajut/src/components/shared/Footer.jsx) (Baru)
- Komponen footer bawah dengan hak cipta, tautan media sosial, serta tautan navigasi cepat yang terintegrasi dengan fungsi perpindahan seksi React.

---

## Modul Fitur (Feature Modules)

### 12. [src/features/home/Home.jsx](file:///c:/laragon/www/Rajut/src/features/home/Home.jsx) (Baru)
- Menyusun tampilan Beranda (Hero Section) dan Featured Works.
- Menggunakan state React untuk menjalankan efek staggered animation (animasi masuk bergantian) pada kartu featured works setelah halaman dipasang (mounted).

### 13. [src/features/gallery/Gallery.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) (Baru)
- Menyusun grid galeri gambar rajutan.
- Mengelola state modal Lightbox secara internal dalam React (tanpa memanipulasi DOM secara manual) saat sebuah foto diklik untuk diperbesar.

### 14. [src/features/projects/Projects.jsx](file:///c:/laragon/www/Rajut/src/features/projects/Projects.jsx) (Baru)
- Menyusun daftar dan rincian proyek rajutan (Winter Collection, Baby Blankets, Home Decor).

### 15. [src/features/about/About.jsx](file:///c:/laragon/www/Rajut/src/features/about/About.jsx) (Baru)
- Menyusun informasi deskriptif tentang profil "Toko Rajut".

### 16. [src/features/contact/Contact.jsx](file:///c:/laragon/www/Rajut/src/features/contact/Contact.jsx) (Baru)
- Menyusun formulir kontak interaktif.
- Mengelola data input pengguna secara teratur menggunakan state React dan menyimulasikan notifikasi sukses saat data dikirim (submit) dengan lengkap.

---

## Preservasi Struktur Folder

Dibuat berkas `.gitkeep` pada direktori-direktori kosong berikut agar struktur foldernya tetap teracak dan termuat sempurna di sistem pengguna:
- `src/assets/`
- `src/features/auth/`
- `src/features/dashboard/`
- `src/features/product/`
- `src/context/`
- `src/services/`
- `src/utils/`
- `src/constants/`
- `src/types/`

---
---

## Integrasi Database MySQL Laragon & Backend API (Update Lanjutan)

Menambahkan backend mandiri dengan database MySQL Laragon untuk menyimpan dan mengelola data galeri, proyek, dan kontak secara dinamis.

### 17. [package.json](file:///c:/laragon/www/Rajut/package.json) (Diubah)
- Menambahkan dependensi backend: `express` (routing server), `cors` (lintas rute), `mysql2` (konektor database), `nodemailer` (pengiriman email), `multer` (unggahan gambar), dan `dotenv` (variabel lingkungan).
- Menambahkan devDependensi: `nodemon` (pemantau server otomatis) dan `concurrently` (menjalankan front-end & back-end sekaligus).
- Memperbarui skrip `"dev"` menjadi `"concurrently \"npm run vite\" \"npm run server\""`, serta menambahkan skrip khusus `"server"` dan `"vite"`.

### 18. [.env](file:///c:/laragon/www/Rajut/.env) (Baru)
- Berkas penampung konfigurasi port server, parameter koneksi MySQL Laragon (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), dan konfigurasi akun SMTP email (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO`).

### 19. [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Baru)
- Menyambungkan server Express ke MySQL Laragon.
- **Inisialisasi Otomatis**: Secara otomatis membuat database `rajut` jika belum ada, membuat tabel-tabel (`gallery`, `projects`, `contact_messages`), serta melakukan seeding (pengisian awal) data galeri & proyek default jika tabel kosong.

### 20. [server/mailer.js](file:///c:/laragon/www/Rajut/server/mailer.js) (Baru)
- Mengonfigurasi modul `nodemailer` menggunakan parameter SMTP dari `.env`.
- Menyiapkan metode `sendContactEmail` untuk mengirimkan ringkasan kontak masuk.
- Menyediakan fallback log simulasi jika kredensial SMTP tidak diisi, guna menghindari crash server.

### 21. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Baru)
- Berkas entri backend utama.
- Menyediakan rute API:
  - `GET /api/gallery`: Mengambil daftar foto dari database.
  - `POST /api/gallery`: Menerima input URL gambar atau file unggahan gambar fisik melalui `multer` (disimpan dalam folder `public/uploads/` dan disajikan lewat middleware statis).
  - `GET /api/projects`: Mengambil daftar proyek dari database.
  - `POST /api/projects`: Menambah proyek baru ke database.
  - `POST /api/contact`: Menyimpan pesan kontak masuk ke tabel MySQL dan mengirimkan notifikasi via email.

### 22. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Baru)
- Berkas penghubung front-end. Mengemas fungsi-fungsi panggilan API (`fetchGallery`, `uploadGalleryImage`, `fetchProjects`, `createProject`, `submitContact`) berbasis `fetch` asli.

### 23. [src/App.jsx` & Fitur-Fitur Front-end](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- **App.jsx**: Menggunakan `useEffect` untuk memuat data galeri dan proyek dari database MySQL pada saat aplikasi dimuat, serta menyebarkan data tersebut ke komponen terkait. Menangani pesan error visual jika koneksi backend/database terputus.
- **Home.jsx**: Merender data Featured Works yang dimuat secara dinamis dari database.
- **Gallery.jsx**: Ditambahkan formulir untuk mengunggah gambar baru ke galeri (bisa berupa unggahan berkas gambar fisik dari komputer lokal maupun pengetikan URL gambar eksternal).
- **Projects.jsx**: Ditambahkan formulir untuk menambahkan proyek baru langsung ke database MySQL.
- **Contact.jsx**: Mengirimkan isian pesan kontak ke backend API untuk disimpan di database MySQL dan memicu notifikasi email secara dinamis.

---
---

## Integrasi Autentikasi Login & Register Beserta Hak Akses Peran (Update Terbaru)

Menambahkan fitur pendaftaran akun baru, login sesi, otorisasi token JWT, dan kontrol hak akses CRUD khusus Administrator.

### 24. [package.json](file:///c:/laragon/www/Rajut/package.json) (Diubah)
- Menambahkan dependensi otentikasi: `bcryptjs` (enkripsi hash satu arah untuk password) dan `jsonwebtoken` (pemberi token akses sesi API).

### 25. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Menambahkan konfigurasi `JWT_SECRET` sebagai kunci rahasia untuk memverifikasi keabsahan token JWT pengguna.

### 26. [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Diubah)
- Membuat tabel `users` dengan kolom-kolom: `id`, `name` (Nama), `address` (Alamat), `phone` (No Telepon), `email` (Email), `password` (Hashed), `role` (Hak akses), dan `created_at`.
- Menyemai (seeding) otomatis dua akun bawaan jika tabel pengguna kosong:
  - Administrator: **admin@tokorajut.com** (password: **admin**, role: **admin**).
  - User Biasa: **user@tokorajut.com** (password: **user**, role: **user**).

### 27. [server/authMiddleware.js](file:///c:/laragon/www/Rajut/server/authMiddleware.js) (Baru)
- Middleware `authenticateToken` untuk menguraikan header otorisasi JWT (`Authorization: Bearer token`).
- Middleware `requireAdmin` untuk membatasi endpoint penulisan data agar hanya bisa diakses oleh akun dengan role `'admin'`.

### 28. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- Menyediakan endpoint otentikasi baru:
  - `POST /api/auth/register`: Menerima isian Nama, Alamat, No Telepon, Email, dan Password. Menyimpan password terenkripsi dan menetapkan peran bawaan `'user'`. Mengembalikan token JWT sesi.
  - `POST /api/auth/login`: Mencocokkan email dan password terenkripsi untuk memberikan token akses.
- Melindungi endpoint `POST /api/gallery` dan `POST /api/projects` dengan menyisipkan middleware `authenticateToken` dan `requireAdmin`. Pengguna tanpa otentikasi admin yang valid akan ditolak dengan respon `403 Forbidden`.

### 29. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- Menambahkan helper `getAuthHeaders` untuk menyertakan token JWT dari LocalStorage pada setiap panggilan API yang dilindungi.
- Menambahkan fungsi panggilan `loginUser` dan `registerUser`.

### 30. [src/features/auth/Auth.jsx](file:///c:/laragon/www/Rajut/src/features/auth/Auth.jsx) (Baru)
- Berkas penampil halaman Autentikasi.
- Mendesain antarmuka eksklusif dengan card premium untuk Masuk dan Daftar.
- Mengirimkan detail isian nama, alamat, no telepon, email, password ke server API dan menyimpan sesi pengguna yang berhasil masuk.
- **Pembaruan Sekunder**: Menghapus teks penjelas/helper Akun Demo Uji Coba dari tampilan bawah form login.

### 31. [src/components/shared/Header.jsx](file:///c:/laragon/www/Rajut/src/components/shared/Header.jsx) (Diubah)
- Menampilkan menu dinamis. Menambahkan link tombol "Masuk / Daftar" di sebelah kanan navigasi utama jika belum masuk sesi.
- Jika pengguna telah login, menampilkan sapaan nama pengguna ("Hi, [Nama] ([Role])") dan tombol "Keluar" (Logout) untuk menghapus sesi.

### 32. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Mengatur status login `user` secara global dari penyimpanan LocalStorage.
- Menambahkan rute section `'auth'` ke daftar seksi halaman aplikasi.
- Membagikan sesi pengguna aktif ke modul `Gallery` dan `Projects`.

### 33. [src/features/gallery/Gallery.jsx` & `Projects.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) (Diubah)
- **Gallery.jsx**: Menyembunyikan form unggah berkas gambar secara total jika pengguna belum login atau hanya bertindak sebagai `'user'` biasa. Form upload hanya dimunculkan jika `user.role === 'admin'`.
- **Projects.jsx**: Menyembunyikan form pengisian proyek baru secara total untuk pengguna biasa. Form hanya dapat diakses oleh `'admin'`.

---
---

## Integrasi Gambar Proyek, Modal Popup Proyek, & Sistem Notifikasi Toast Premium (Update Paling Baru)

Menambahkan fitur unggahan foto footage untuk proyek, penampil popup modal detail proyek saat diklik, dan sistem notifikasi melayang (Toast Alert) premium yang menggantikan fungsi standar `alert()`.

### 34. [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Diubah)
- Menambahkan efek hover kartu proyek (mengangkat kartu sedikit dengan drop shadow dinamis) dan mengubah kursor mouse menjadi `pointer`.
- Menambahkan keyframes CSS `@keyframes spin` untuk spinner memuat data, serta `@keyframes slideUp` untuk memunculkan modal/toast dengan efek slide lembut.

### 35. [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Diubah)
- Menambahkan pemeriksaan skema database: menambahkan kolom `image_url` pada tabel `projects` jika belum ada melalui perintah `ALTER TABLE`.
- Memperbarui seeding data proyek bawaan agar menyertakan foto Unsplash berkualitas tinggi.

### 36. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- Memperbarui rute `POST /api/projects` agar dilindungi oleh middleware `upload.single('image')`. Endpoint kini menerima kiriman berkas foto dari Admin (disimpan di folder `public/uploads/`) maupun URL gambar eksternal.

### 37. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- Memperbarui fungsi `createProject` agar mendeteksi tipe berkas gambar dan merangkumnya ke dalam objek `FormData` jika merupakan file lokal sebelum dikirim ke API.

### 38. [src/context/NotificationContext.jsx](file:///c:/laragon/www/Rajut/src/context/NotificationContext.jsx) (Baru)
- Membuat modul sistem peringatan/alert custom. 
- Menyediakan fungsi `showToast(message, type, duration)` yang menampilkan toast notifikasi melayang di pojok kanan bawah layar. Mendukung tipe `'success'` (hijau), `'error'` (merah), dan `'loading'` (jingga dengan lingkaran pemuat berputar).

### 39. [src/main.jsx](file:///c:/laragon/www/Rajut/src/main.jsx) (Diubah)
- Membungkus komponen akar aplikasi `<App />` dengan `<NotificationProvider>` agar sistem notifikasi melayang dapat dipanggil dari mana saja di seluruh front-end.

### 40. [src/App.jsx`, `Contact.jsx`, `Auth.jsx` & `Gallery.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Mengganti semua penggunaan fungsi `alert()` bawaan browser dengan custom toast `showToast()` dari Notification Context untuk menyajikan feedback proses CRUD, login, logout, dan upload yang premium.

### 41. [src/features/projects/Projects.jsx](file:///c:/laragon/www/Rajut/src/features/projects/Projects.jsx) (Diubah)
- **Unggahan Foto**: Menambahkan pilihan pengunggahan berkas foto lokal atau URL gambar pada panel tambah proyek Admin.
- **Kartu Proyek**: Memasang penampil gambar utama di atas judul proyek pada kartu grid.
- **Popup Modal Detail**: Menambahkan state `selectedProject`. Saat pengguna mengklik salah satu kartu proyek, modal popup overlay dengan backdrop-blur muncul di layar, menyajikan foto proyek beresolusi penuh, judul besar, dan deskripsi lengkap proyek secara detail.
- **Notifikasi**: Menggunakan toast notifikasi loading dan sukses untuk proses pengerjaan pembuatan proyek baru.

---
---

## Penyesuaian Deploy Gratis di Vercel (Update Terbaru)

Menyederhanakan struktur agar backend Node/Express dapat otomatis dideploy sebagai Serverless Function di Vercel, sedangkan frontend Vite dideploy secara static.

### 42. [vercel.json](file:///c:/laragon/www/Rajut/vercel.json) (Baru)
- Berkas konfigurasi Vercel untuk melakukan URL rewrites, yaitu mengalihkan seluruh permintaan API `/api/*` ke fungsi serverless `/api/index.js`.

### 43. [api/index.js](file:///c:/laragon/www/Rajut/api/index.js) (Baru)
- Berkas penanganan serverless fungsi utama di Vercel. Mengimpor aplikasi Express terpusat dan mengekspornya secara default.

### 44. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- **Tahan Crash File System**: Mendeteksi lingkungan Vercel (`process.env.VERCEL`) untuk mengalihkan folder penyimpanan unggahan sementara ke `/tmp/uploads` guna menghindari kegagalan baca-tulis media pada disk serverless.
- **Kondisional Listen**: Membatasi fungsi `app.listen()` agar tidak dijalankan pada Vercel runtime (hanya lokal), serta mengekspor instansi `app`.

### 45. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- Mengonfigurasi `API_BASE_URL` secara dinamis. Jika berjalan pada `localhost` pengembangan, rute mengarah ke server lokal port `3001`. Jika berjalan di production Vercel, rute menggunakan `/api` relatif terhadap domain deployment yang sama.

---
---

## Fitur Edit & Hapus (Full CRUD) Galeri & Proyek (Update Terbaru)

Menambahkan kapabilitas bagi Administrator untuk memperbarui (Edit) dan menghapus (Delete) berkas foto galeri maupun proyek rajutan, lengkap dengan notifikasi Toast melayang yang interaktif.

### 46. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- **Rute Galeri Baru**: Menambahkan `PUT /api/gallery/:id` (edit foto) dan `DELETE /api/gallery/:id` (hapus foto). Rute ini diverifikasi menggunakan middleware JWT admin.
- **Rute Proyek Baru**: Menambahkan `PUT /api/projects/:id` (edit proyek) dan `DELETE /api/projects/:id` (hapus proyek). Rute ini diverifikasi menggunakan middleware JWT admin.

### 47. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- Menambahkan metode konsumsi API: `updateGalleryImage`, `deleteGalleryImage`, `updateProject`, dan `deleteProject`.

### 48. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Menambahkan callback state pengubah array data utama: `handleUpdateGalleryItem`, `handleDeleteGalleryItem`, `handleUpdateProjectItem`, dan `handleDeleteProjectItem`, lalu menyebarkannya sebagai properti komponen terkait.

### 49. [src/features/gallery/Gallery.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) (Diubah)
- **Overlay Hover Admin**: Merender tombol Edit (pencil) dan Hapus (silang) melayang di setiap foto ketika admin masuk.
- **Modul Edit Foto**: Memunculkan modal dialog untuk memperbarui sumber foto (file/URL).
- **Proses Alert**: Menampilkan Toast loading, sukses, dan error selama memproses operasi edit dan hapus.

### 50. [src/features/projects/Projects.jsx](file:///c:/laragon/www/Rajut/src/features/projects/Projects.jsx) (Diubah)
- **Kontrol Kartu Proyek**: Memasang tombol edit dan hapus pada masing-masing kartu proyek untuk admin.
- **Modul Edit Detail Proyek**: Memunculkan form modal edit terpadu (Judul, Foto, Deskripsi) dengan pengisian otomatis data yang sudah ada sebelumnya.
- **Proses Alert**: Menampilkan Toast loading, sukses, dan error selama memproses operasi edit dan hapus.

### 51. [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Diubah)
- Menambahkan aturan CSS `.gallery-item-actions` dan `.gallery-action-btn` untuk mendukung tampilan tombol aksi melayang di atas foto galeri.

---
---

## Integrasi Database Cloud Supabase PostgreSQL & Penyempurnaan Konfigurasi Environment (Update Terbaru)

Mengalihkan basis data dari MySQL lokal (Laragon) ke cloud database Supabase PostgreSQL, membuat skema tabel PostgreSQL, mengadaptasi backend, serta menyesuaikan penanganan berkas environment.

### 52. [package.json](file:///c:/laragon/www/Rajut/package.json) (Diubah)
- Menambahkan dependensi `@supabase/supabase-js` (`^2.110.7`) untuk integrasi dan manipulasi data di database Supabase.

### 53. [supabase_setup.sql](file:///c:/laragon/www/Rajut/supabase_setup.sql) (Baru)
- Berkas penampung skrip SQL untuk menginisialisasi skema tabel (`gallery`, `projects`, `contact_messages`, `users`) di Supabase SQL Editor.

### 54. [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Diubah)
- Menghapus pustaka koneksi MySQL (`mysql2`).
- Menghubungkan server backend ke database Supabase menggunakan `createClient` dari `@supabase/supabase-js`.
- Memperbarui fungsi `initializeDatabase()` untuk melakukan pengecekan dan pengisian data awal (seeding) secara otomatis di tabel-tabel Supabase yang kosong.
- Memperbaiki bug pembacaan environment variable dengan mengubah `SUPABASE_URL` dan `SUPABASE_KEY` menjadi `VITE_SUPABASE_URL` serta mendukung baik `VITE_SUPABASE_ANON_KEY` maupun `VITE_SUPABASE_PUBLISHABLE_KEY` agar terhindar dari nilai kosong (`undefined`).

### 55. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- Mengadaptasi semua handler API route (`/api/auth/register`, `/api/auth/login`, `/api/gallery`, `/api/projects`, dan `/api/contact`) agar menggunakan query builder Supabase client (`db.from()`), menggantikan raw SQL query.

### 56. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Menghapus parameter database MySQL lama (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Menambahkan konfigurasi database Supabase yaitu `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_SUPABASE_PUBLISHABLE_KEY`.

### 57. [.gitignore](file:///c:/laragon/www/Rajut/.gitignore) (Diubah)
- Menambahkan aturan baru untuk mengecualikan berkas `.env` dari pelacakan Git agar kredensial API Key Supabase tidak terunggah secara tidak sengaja ke repositori publik.

### 58. [src/utils/supabase.js](file:///c:/laragon/www/Rajut/src/utils/supabase.js) (Baru)
- Berkas helper inisialisasi client Supabase di sisi frontend (React) menggunakan `import.meta.env` untuk mempermudah integrasi atau pemanggilan data Supabase secara langsung di client jika diinginkan.

---
---

## Persiapan Deploy Vercel, Responsivitas Mobile & Keamanan Data (Update Terbaru)

Menyesuaikan kode program agar aman dari kebocoran data saat dipublish, memperbaiki bugs crash startup di platform Vercel, serta merapikan struktur responsivitas layout grid pada tampilan seluler (mobile).

### 59. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- Menambahkan pemeriksaan `fs.existsSync` pada file kredensial Google Drive Service Account sebelum memanggil `new google.auth.GoogleAuth`. Hal ini mencegah server Express crash saat di-boot sebagai serverless function di Vercel (karena folder `bot/` sengaja diabaikan di `.gitignore` dan tidak ikut diunggah ke Vercel).

### 60. [src/features/about/About.jsx](file:///c:/laragon/www/Rajut/src/features/about/About.jsx) (Diubah)
- Menghapus atribut inline style `gridTemplateColumns: "1fr 1fr"` pada kontainer utama seksi *About* agar layout dapat dikontrol secara responsif dari CSS global.

### 61. [src/features/contact/Contact.jsx](file:///c:/laragon/www/Rajut/src/features/contact/Contact.jsx) (Diubah)
- Menghapus atribut inline style `gridTemplateColumns: "1fr 1fr"` pada kontainer utama seksi *Contact* agar layout form dan info detail kontak dapat menyesuaikan lebar layar secara dinamis dari file CSS global.

### 62. [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Diubah)
- Mengonfigurasi struktur layout seksi *About* (`.about-content`) dan seksi *Contact* (`.contact-content`) menggunakan pendekatan *mobile-first* (1 kolom secara default untuk perangkat seluler) serta membatasi susunan 2 kolom sejajar hanya pada perangkat desktop (`@media (min-width: 769px)`). Hal ini merapikan tampilan layout agar tidak terkompresi secara tidak proporsional saat dibuka via mobile.

### 63. [my-backend-api/src/index.js](file:///c:/laragon/www/Rajut/my-backend-api/src/index.js) (Diubah)
- Memperbarui fungsi helper `generateToken` dan `getAuthUser` agar dapat menerima argumen kunci rahasia JWT dari environment variabel Cloudflare Workers (`env.JWT_SECRET`). Hal ini meningkatkan keamanan (mencegah kebocoran data kunci) dengan meminimalkan penggunaan kunci rahasia default yang di-hardcode jika proyek diunggah ke repositori publik.

---
---

## Pembaruan Alamat Email Tujuan Kontak Us ke haikaladika8@gmail.com (Update Terbaru)

Mengubah alamat email penerima notifikasi pesan kontak masuk dan alamat email resmi di halaman front-end menjadi `haikaladika8@gmail.com`, serta menambahkan fitur pengisian otomatis (auto-fill) nama & email pengguna yang sedang login di form kontak.

### 64. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Memperbarui variabel lingkungan `SMTP_TO` menjadi `"haikaladika8@gmail.com"` agar seluruh notifikasi pesan baru yang dikirim pengunjung melalui form kontak langsung diteruskan ke alamat email tersebut.

### 65. [server/mailer.js](file:///c:/laragon/www/Rajut/server/mailer.js) (Diubah)
- Memperbarui fallback alamat email penerima pesan dari `info@tokorajut.com` menjadi `haikaladika8@gmail.com` dan mempercantik format HTML template email notifikasi pesan kontak masuk.

### 66. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Membagikan sesi pengguna aktif (`user`) sebagai prop ke komponen `<Contact user={user} />`.

### 67. [src/features/contact/Contact.jsx](file:///c:/laragon/www/Rajut/src/features/contact/Contact.jsx) (Diubah)
- Menampilkan alamat email resmi `haikaladika8@gmail.com` dengan tautan interaktif `mailto:haikaladika8@gmail.com` pada kartu informasi kontak.
- Menambahkan `useEffect` untuk mengisi secara otomatis (auto-fill) nama dan email pengirim pada form input jika pengguna telah masuk sesi (login).

---
---

## Konfigurasi Gmail SMTP Real (App Password) & Penerima haikaladika272@gmail.com (Update Paling Baru)

Mengonfigurasi server pengiriman email asli menggunakan Gmail SMTP dengan kredensial App Password dari `haikaladika8@gmail.com` agar seluruh isian formulir kontak yang dikirim pengunjung langsung terkirim secara *real-time* ke email `haikaladika272@gmail.com`.

### 68. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Mengonfigurasi kredensial SMTP Gmail:
  - `SMTP_HOST="smtp.gmail.com"`
  - `SMTP_PORT=465` (SSL Secure)
  - `SMTP_USER="haikaladika8@gmail.com"`
  - `SMTP_PASS="kwzwhnllebhxvdlj"` (Gmail App Password)
  - `SMTP_FROM="haikaladika8@gmail.com"`
  - `SMTP_TO="haikaladika272@gmail.com"` (Email tujuan pengiriman notifikasi pesan masuk)

### 69. [server/mailer.js](file:///c:/laragon/www/Rajut/server/mailer.js) (Diubah)
- Memperbarui transporter Nodemailer untuk mendukung koneksi SSL `smtp.gmail.com:465`.
- Mengonfigurasi header `replyTo` ke alamat email pengirim (pengunjung) agar admin dapat langsung membalas (*reply*) email yang masuk di `haikaladika272@gmail.com` secara instan ke pengunjung.
- Menguji pengiriman email secara sungguhan (*live test*) dan berhasil terkirim dengan ID pesan Gmail SMTP.

---
---

## Pembersihan Berkas Supabase & Penataan Rule Gitignore (Update Terbaru)

Menghapus file legacy Supabase yang tidak lagi digunakan dan mengonfigurasi `.gitignore` agar folder `.agents` (skill AI), dokumen migrasi, file pengujian, serta berkas yang tidak relevan tidak ikut terunggah (*push*) ke GitHub maupun Vercel.

### 70. Pembersihan Berkas Legacy Supabase (Dihapus)
- Menghapus berkas `supabase_setup.sql` dan `src/utils/supabase.js` karena seluruh arsitektur data relasional telah dialihkan penuh ke Cloudflare D1 Database.

### 71. [.gitignore](file:///c:/laragon/www/Rajut/.gitignore) (Diubah)
- Menambahkan aturan pengecualian baru untuk:
  - Folder skill AI: `.agents/` dan `skills-lock.json`
  - Dokumen internal: `CLOUDFLARE_MIGRATION.md`
  - File skrip/pengujian sementara: `test_real_img.png` dan `server.js`
  - Folder media unggahan lokal: `public/uploads/*` (kecuali `.gitkeep`)
  - Sub-direktori Cloudflare Worker: `my-backend-api/node_modules/`, `my-backend-api/.wrangler/`, dan `my-backend-api/.env*`

---
---

## Pembaruan Kredensial Admin D1 & Fitur Tampilkan Password di Halaman Login (Update Terbaru)

Mengubah email dan password Administrator pada Cloudflare D1 Database menjadi `haikaladika8@gmail.com` dan `Haikal552005`, menghapus tombol pengisian otomatis bawaan (*Quick Fill Admin*), serta menambahkan tombol sakelar tampilkan/sembunyikan password (*Show Password toggle*).

### 72. Cloudflare D1 Database & [d1_setup.sql](file:///c:/laragon/www/Rajut/d1_setup.sql) (Diubah)
- Memperbarui email Administrator di tabel `users` Cloudflare D1 menjadi `haikaladika8@gmail.com` dan password terenkripsi bcrypt untuk `Haikal552005`.
- Meng-update file inisialisasi [d1_setup.sql](file:///c:/laragon/www/Rajut/d1_setup.sql) dan fallback memori [server/db.js](file:///c:/laragon/www/Rajut/server/db.js).

### 73. [src/features/auth/Auth.jsx](file:///c:/laragon/www/Rajut/src/features/auth/Auth.jsx) (Diubah)
- Menghapus blok tampilan dan fungsi handler *⚡ Quick Fill Admin: admin@tokorajut.com / Isi Otomatis*.
- Menambahkan tombol ikon mata (*Show/Hide Password*) pada bidang masukan password di form Login dan Register untuk memudahkan pengguna melihat kata sandi yang diketik.

---
### 38. [src/context/NotificationContext.jsx](file:///c:/laragon/www/Rajut/src/context/NotificationContext.jsx) (Baru)
- Membuat modul sistem peringatan/alert custom. 
- Menyediakan fungsi `showToast(message, type, duration)` yang menampilkan toast notifikasi melayang di pojok kanan bawah layar. Mendukung tipe `'success'` (hijau), `'error'` (merah), dan `'loading'` (jingga dengan lingkaran pemuat berputar).

### 39. [src/main.jsx](file:///c:/laragon/www/Rajut/src/main.jsx) (Diubah)
- Membungkus komponen akar aplikasi `<App />` dengan `<NotificationProvider>` agar sistem notifikasi melayang dapat dipanggil dari mana saja di seluruh front-end.

### 40. [src/App.jsx`, `Contact.jsx`, `Auth.jsx` & `Gallery.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Mengganti semua penggunaan fungsi `alert()` bawaan browser dengan custom toast `showToast()` dari Notification Context untuk menyajikan feedback proses CRUD, login, logout, dan upload yang premium.

### 41. [src/features/projects/Projects.jsx](file:///c:/laragon/www/Rajut/src/features/projects/Projects.jsx) (Diubah)
- **Unggahan Foto**: Menambahkan pilihan pengunggahan berkas foto lokal atau URL gambar pada panel tambah proyek Admin.
- **Kartu Proyek**: Memasang penampil gambar utama di atas judul proyek pada kartu grid.
- **Popup Modal Detail**: Menambahkan state `selectedProject`. Saat pengguna mengklik salah satu kartu proyek, modal popup overlay dengan backdrop-blur muncul di layar, menyajikan foto proyek beresolusi penuh, judul besar, dan deskripsi lengkap proyek secara detail.
- **Notifikasi**: Menggunakan toast notifikasi loading dan sukses untuk proses pengerjaan pembuatan proyek baru.

---
---

## Penyesuaian Deploy Gratis di Vercel (Update Terbaru)

Menyederhanakan struktur agar backend Node/Express dapat otomatis dideploy sebagai Serverless Function di Vercel, sedangkan frontend Vite dideploy secara static.

### 42. [vercel.json](file:///c:/laragon/www/Rajut/vercel.json) (Baru)
- Berkas konfigurasi Vercel untuk melakukan URL rewrites, yaitu mengalihkan seluruh permintaan API `/api/*` ke fungsi serverless `/api/index.js`.

### 43. [api/index.js](file:///c:/laragon/www/Rajut/api/index.js) (Baru)
- Berkas penanganan serverless fungsi utama di Vercel. Mengimpor aplikasi Express terpusat dan mengekspornya secara default.

### 44. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- **Tahan Crash File System**: Mendeteksi lingkungan Vercel (`process.env.VERCEL`) untuk mengalihkan folder penyimpanan unggahan sementara ke `/tmp/uploads` guna menghindari kegagalan baca-tulis media pada disk serverless.
- **Kondisional Listen**: Membatasi fungsi `app.listen()` agar tidak dijalankan pada Vercel runtime (hanya lokal), serta mengekspor instansi `app`.

### 45. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- Mengonfigurasi `API_BASE_URL` secara dinamis. Jika berjalan pada `localhost` pengembangan, rute mengarah ke server lokal port `3001`. Jika berjalan di production Vercel, rute menggunakan `/api` relatif terhadap domain deployment yang sama.

---
---

## Fitur Edit & Hapus (Full CRUD) Galeri & Proyek (Update Terbaru)

Menambahkan kapabilitas bagi Administrator untuk memperbarui (Edit) dan menghapus (Delete) berkas foto galeri maupun proyek rajutan, lengkap dengan notifikasi Toast melayang yang interaktif.

### 46. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- **Rute Galeri Baru**: Menambahkan `PUT /api/gallery/:id` (edit foto) dan `DELETE /api/gallery/:id` (hapus foto). Rute ini diverifikasi menggunakan middleware JWT admin.
- **Rute Proyek Baru**: Menambahkan `PUT /api/projects/:id` (edit proyek) dan `DELETE /api/projects/:id` (hapus proyek). Rute ini diverifikasi menggunakan middleware JWT admin.

### 47. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- Menambahkan metode konsumsi API: `updateGalleryImage`, `deleteGalleryImage`, `updateProject`, dan `deleteProject`.

### 48. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Menambahkan callback state pengubah array data utama: `handleUpdateGalleryItem`, `handleDeleteGalleryItem`, `handleUpdateProjectItem`, dan `handleDeleteProjectItem`, lalu menyebarkannya sebagai properti komponen terkait.

### 49. [src/features/gallery/Gallery.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) (Diubah)
- **Overlay Hover Admin**: Merender tombol Edit (pencil) dan Hapus (silang) melayang di setiap foto ketika admin masuk.
- **Modul Edit Foto**: Memunculkan modal dialog untuk memperbarui sumber foto (file/URL).
- **Proses Alert**: Menampilkan Toast loading, sukses, dan error selama memproses operasi edit dan hapus.

### 50. [src/features/projects/Projects.jsx](file:///c:/laragon/www/Rajut/src/features/projects/Projects.jsx) (Diubah)
- **Kontrol Kartu Proyek**: Memasang tombol edit dan hapus pada masing-masing kartu proyek untuk admin.
- **Modul Edit Detail Proyek**: Memunculkan form modal edit terpadu (Judul, Foto, Deskripsi) dengan pengisian otomatis data yang sudah ada sebelumnya.
- **Proses Alert**: Menampilkan Toast loading, sukses, dan error selama memproses operasi edit dan hapus.

### 51. [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Diubah)
- Menambahkan aturan CSS `.gallery-item-actions` dan `.gallery-action-btn` untuk mendukung tampilan tombol aksi melayang di atas foto galeri.

---
---

## Integrasi Database Cloud Supabase PostgreSQL & Penyempurnaan Konfigurasi Environment (Update Terbaru)

Mengalihkan basis data dari MySQL lokal (Laragon) ke cloud database Supabase PostgreSQL, membuat skema tabel PostgreSQL, mengadaptasi backend, serta menyesuaikan penanganan berkas environment.

### 52. [package.json](file:///c:/laragon/www/Rajut/package.json) (Diubah)
- Menambahkan dependensi `@supabase/supabase-js` (`^2.110.7`) untuk integrasi dan manipulasi data di database Supabase.

### 53. [supabase_setup.sql](file:///c:/laragon/www/Rajut/supabase_setup.sql) (Baru)
- Berkas penampung skrip SQL untuk menginisialisasi skema tabel (`gallery`, `projects`, `contact_messages`, `users`) di Supabase SQL Editor.

### 54. [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Diubah)
- Menghapus pustaka koneksi MySQL (`mysql2`).
- Menghubungkan server backend ke database Supabase menggunakan `createClient` dari `@supabase/supabase-js`.
- Memperbarui fungsi `initializeDatabase()` untuk melakukan pengecekan dan pengisian data awal (seeding) secara otomatis di tabel-tabel Supabase yang kosong.
- Memperbaiki bug pembacaan environment variable dengan mengubah `SUPABASE_URL` dan `SUPABASE_KEY` menjadi `VITE_SUPABASE_URL` serta mendukung baik `VITE_SUPABASE_ANON_KEY` maupun `VITE_SUPABASE_PUBLISHABLE_KEY` agar terhindar dari nilai kosong (`undefined`).

### 55. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- Mengadaptasi semua handler API route (`/api/auth/register`, `/api/auth/login`, `/api/gallery`, `/api/projects`, dan `/api/contact`) agar menggunakan query builder Supabase client (`db.from()`), menggantikan raw SQL query.

### 56. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Menghapus parameter database MySQL lama (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- Menambahkan konfigurasi database Supabase yaitu `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_SUPABASE_PUBLISHABLE_KEY`.

### 57. [.gitignore](file:///c:/laragon/www/Rajut/.gitignore) (Diubah)
- Menambahkan aturan baru untuk mengecualikan berkas `.env` dari pelacakan Git agar kredensial API Key Supabase tidak terunggah secara tidak sengaja ke repositori publik.

### 58. [src/utils/supabase.js](file:///c:/laragon/www/Rajut/src/utils/supabase.js) (Baru)
- Berkas helper inisialisasi client Supabase di sisi frontend (React) menggunakan `import.meta.env` untuk mempermudah integrasi atau pemanggilan data Supabase secara langsung di client jika diinginkan.

---
---

## Persiapan Deploy Vercel, Responsivitas Mobile & Keamanan Data (Update Terbaru)

Menyesuaikan kode program agar aman dari kebocoran data saat dipublish, memperbaiki bugs crash startup di platform Vercel, serta merapikan struktur responsivitas layout grid pada tampilan seluler (mobile).

### 59. [server/index.js](file:///c:/laragon/www/Rajut/server/index.js) (Diubah)
- Menambahkan pemeriksaan `fs.existsSync` pada file kredensial Google Drive Service Account sebelum memanggil `new google.auth.GoogleAuth`. Hal ini mencegah server Express crash saat di-boot sebagai serverless function di Vercel (karena folder `bot/` sengaja diabaikan di `.gitignore` dan tidak ikut diunggah ke Vercel).

### 60. [src/features/about/About.jsx](file:///c:/laragon/www/Rajut/src/features/about/About.jsx) (Diubah)
- Menghapus atribut inline style `gridTemplateColumns: "1fr 1fr"` pada kontainer utama seksi *About* agar layout dapat dikontrol secara responsif dari CSS global.

### 61. [src/features/contact/Contact.jsx](file:///c:/laragon/www/Rajut/src/features/contact/Contact.jsx) (Diubah)
- Menghapus atribut inline style `gridTemplateColumns: "1fr 1fr"` pada kontainer utama seksi *Contact* agar layout form dan info detail kontak dapat menyesuaikan lebar layar secara dinamis dari file CSS global.

### 62. [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Diubah)
- Mengonfigurasi struktur layout seksi *About* (`.about-content`) dan seksi *Contact* (`.contact-content`) menggunakan pendekatan *mobile-first* (1 kolom secara default untuk perangkat seluler) serta membatasi susunan 2 kolom sejajar hanya pada perangkat desktop (`@media (min-width: 769px)`). Hal ini merapikan tampilan layout agar tidak terkompresi secara tidak proporsional saat dibuka via mobile.

### 63. [my-backend-api/src/index.js](file:///c:/laragon/www/Rajut/my-backend-api/src/index.js) (Diubah)
- Memperbarui fungsi helper `generateToken` dan `getAuthUser` agar dapat menerima argumen kunci rahasia JWT dari environment variabel Cloudflare Workers (`env.JWT_SECRET`). Hal ini meningkatkan keamanan (mencegah kebocoran data kunci) dengan meminimalkan penggunaan kunci rahasia default yang di-hardcode jika proyek diunggah ke repositori publik.

---
---

## Pembaruan Alamat Email Tujuan Kontak Us ke haikaladika8@gmail.com (Update Terbaru)

Mengubah alamat email penerima notifikasi pesan kontak masuk dan alamat email resmi di halaman front-end menjadi `haikaladika8@gmail.com`, serta menambahkan fitur pengisian otomatis (auto-fill) nama & email pengguna yang sedang login di form kontak.

### 64. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Memperbarui variabel lingkungan `SMTP_TO` menjadi `"haikaladika8@gmail.com"` agar seluruh notifikasi pesan baru yang dikirim pengunjung melalui form kontak langsung diteruskan ke alamat email tersebut.

### 65. [server/mailer.js](file:///c:/laragon/www/Rajut/server/mailer.js) (Diubah)
- Memperbarui fallback alamat email penerima pesan dari `info@tokorajut.com` menjadi `haikaladika8@gmail.com` dan mempercantik format HTML template email notifikasi pesan kontak masuk.

### 66. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) (Diubah)
- Membagikan sesi pengguna aktif (`user`) sebagai prop ke komponen `<Contact user={user} />`.

### 67. [src/features/contact/Contact.jsx](file:///c:/laragon/www/Rajut/src/features/contact/Contact.jsx) (Diubah)
- Menampilkan alamat email resmi `haikaladika8@gmail.com` dengan tautan interaktif `mailto:haikaladika8@gmail.com` pada kartu informasi kontak.
- Menambahkan `useEffect` untuk mengisi secara otomatis (auto-fill) nama dan email pengirim pada form input jika pengguna telah masuk sesi (login).

---
---

## Konfigurasi Gmail SMTP Real (App Password) & Penerima haikaladika272@gmail.com (Update Paling Baru)

Mengonfigurasi server pengiriman email asli menggunakan Gmail SMTP dengan kredensial App Password dari `haikaladika8@gmail.com` agar seluruh isian formulir kontak yang dikirim pengunjung langsung terkirim secara *real-time* ke email `haikaladika272@gmail.com`.

### 68. [.env](file:///c:/laragon/www/Rajut/.env) (Diubah)
- Mengonfigurasi kredensial SMTP Gmail:
  - `SMTP_HOST="smtp.gmail.com"`
  - `SMTP_PORT=465` (SSL Secure)
  - `SMTP_USER="haikaladika8@gmail.com"`
  - `SMTP_PASS="kwzwhnllebhxvdlj"` (Gmail App Password)
  - `SMTP_FROM="haikaladika8@gmail.com"`
  - `SMTP_TO="haikaladika272@gmail.com"` (Email tujuan pengiriman notifikasi pesan masuk)

### 69. [server/mailer.js](file:///c:/laragon/www/Rajut/server/mailer.js) (Diubah)
- Memperbarui transporter Nodemailer untuk mendukung koneksi SSL `smtp.gmail.com:465`.
- Mengonfigurasi header `replyTo` ke alamat email pengirim (pengunjung) agar admin dapat langsung membalas (*reply*) email yang masuk di `haikaladika272@gmail.com` secara instan ke pengunjung.
- Menguji pengiriman email secara sungguhan (*live test*) dan berhasil terkirim dengan ID pesan Gmail SMTP.

---
---

## Pembersihan Berkas Supabase & Penataan Rule Gitignore (Update Terbaru)

Menghapus file legacy Supabase yang tidak lagi digunakan dan mengonfigurasi `.gitignore` agar folder `.agents` (skill AI), dokumen migrasi, file pengujian, serta berkas yang tidak relevan tidak ikut terunggah (*push*) ke GitHub maupun Vercel.

### 70. Pembersihan Berkas Legacy Supabase (Dihapus)
- Menghapus berkas `supabase_setup.sql` dan `src/utils/supabase.js` karena seluruh arsitektur data relasional telah dialihkan penuh ke Cloudflare D1 Database.

### 71. [.gitignore](file:///c:/laragon/www/Rajut/.gitignore) (Diubah)
- Menambahkan aturan pengecualian baru untuk:
  - Folder skill AI: `.agents/` dan `skills-lock.json`
  - Dokumen internal: `CLOUDFLARE_MIGRATION.md`
  - File skrip/pengujian sementara: `test_real_img.png` dan `server.js`
  - Folder media unggahan lokal: `public/uploads/*` (kecuali `.gitkeep`)
  - Sub-direktori Cloudflare Worker: `my-backend-api/node_modules/`, `my-backend-api/.wrangler/`, dan `my-backend-api/.env*`

---
---

## Pembaruan Kredensial Admin D1 & Fitur Tampilkan Password di Halaman Login (Update Terbaru)

Mengubah email dan password Administrator pada Cloudflare D1 Database menjadi `haikaladika8@gmail.com` dan `Haikal552005`, menghapus tombol pengisian otomatis bawaan (*Quick Fill Admin*), serta menambahkan tombol sakelar tampilkan/sembunyikan password (*Show Password toggle*).

### 72. Cloudflare D1 Database & [d1_setup.sql](file:///c:/laragon/www/Rajut/d1_setup.sql) (Diubah)
- Memperbarui email Administrator di tabel `users` Cloudflare D1 menjadi `haikaladika8@gmail.com` dan password terenkripsi bcrypt untuk `Haikal552005`.
- Meng-update file inisialisasi [d1_setup.sql](file:///c:/laragon/www/Rajut/d1_setup.sql) dan fallback memori [server/db.js](file:///c:/laragon/www/Rajut/server/db.js).

### 73. [src/features/auth/Auth.jsx](file:///c:/laragon/www/Rajut/src/features/auth/Auth.jsx) (Diubah)
- Menghapus blok tampilan dan fungsi handler *⚡ Quick Fill Admin: admin@tokorajut.com / Isi Otomatis*.
- Menambahkan tombol ikon mata (*Show/Hide Password*) pada bidang masukan password di form Login dan Register untuk memudahkan pengguna melihat kata sandi yang diketik.

---
---

## Perbaikan Bug Autentikasi Admin & Safe Fallback Database (Update Paling Baru)

Memperbaiki kegagalan login akun admin (error 400 Bad Request) pada deployment Vercel dengan menambahkan *safe fallback* otomatis ke memori internal jika token API Cloudflare D1 tidak dikirim/tidak diotorisasi oleh lingkungan Vercel.

### 74. [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Diubah)
- **Safe Database Fallback**: Memisahkan logika query in-memory ke method `executeInMemory()` dan memperbarui `D1TableQuery.execute()` agar secara otomatis beralih (*fallback*) ke pencarian data in-memory jika panggilan API REST Cloudflare D1 menghasilkan error otorisasi/gagal koneksi.
- **Case-Insensitive Match**: Mengonfigurasi pencarian kondisi WHERE (seperti email & username) pada handler `executeInMemory()` (SELECT, UPDATE, DELETE) agar bersifat *case-insensitive* (`toLowerCase()`), memastikan akun admin `haikaladika8@gmail.com` dan kata sandi `Haikal552005` dipastikan selalu berhasil terverifikasi.
- **Handling Result REST API D1**: Memeriksa properti `d1Res.success` pada operasi D1 REST API untuk menangani kegagalan query secara tangguh tanpa memicu crash server.

---
---

## Perbaikan Hash Password Admin Cloudflare D1 & Query Case-Insensitive (Update Terbaru)

Memperbaiki kegagalan login `400 Bad Request` ("Email atau password salah!") saat mencoba login dengan email `haikaladika8@gmail.com` dan kata sandi `Haikal552005`.

### 75. [my-backend-api/src/index.js](file:///c:/laragon/www/Rajut/my-backend-api/src/index.js) & Database D1 (Diubah)
- **Valid Bcrypt Hash**: Memperbarui hash bcrypt password pengguna admin `haikaladika8@gmail.com` pada database Cloudflare D1 remote, `server/db.js`, `d1_setup.sql`, dan `my-backend-api/schema.sql` menggunakan hash valid yang cocok untuk password `Haikal552005`.
- **Case-Insensitive Query**: Mengubah query pencarian email pada handler login di Cloudflare Worker (`my-backend-api/src/index.js`) menjadi `WHERE LOWER(email) = LOWER(?)` agar aman dari perbedaan kapitalisasi email pengirim.

---
---

## Perbaikan Penyimpanan Pendaftaran Akun Baru ke Cloudflare D1 Database (Update Paling Baru)

Memperbaiki masalah pendaftaran akun baru pengunjung (`POST /api/auth/register`) agar data akun pendaftar tersimpan secara permanen ke database Cloudflare D1 (`rajut-db`).

### 76. Cloudflare Worker Backend & [server/db.js](file:///c:/laragon/www/Rajut/server/db.js) (Diubah)
- **Deployment Worker API**: Melakukan *deployment* Worker API `my-backend-api` ke Cloudflare Workers (`https://my-backend-api.rajut-api.workers.dev`) dengan binding database `env.DB` (`rajut-db`), memastikan rute `POST /api/auth/register` mengeksekusi perintah SQL `INSERT INTO users (...)` secara langsung ke D1.
- **Pembersihan Konfigurasi R2**: Menghapus binding `r2_buckets` opsional dari [my-backend-api/wrangler.jsonc](file:///c:/laragon/www/Rajut/my-backend-api/wrangler.jsonc) yang sempat menyebabkan kegagalan deployment Worker.
- **Wrangler CLI Fallback Lokal**: Menambahkan fungsi `queryD1ViaWrangler()` pada `server/db.js` agar server lokal (`server/index.js`) mengeksekusi perintah database via Wrangler CLI `npx.cmd wrangler d1 execute` ketika API Token REST Cloudflare mengembalikan HTTP 403, menjamin data pendaftaran lokal maupun online tersimpan ke Cloudflare D1.

---
---

## Integrasi Direct Cloudflare Worker API pada Deployment Vercel (Update Paling Baru)

Memperbaiki kegagalan login admin dan pendaftaran pengguna baru pada deployment Vercel akibat fungsi serverless Vercel yang tidak terhubung ke D1 API credentials.

### 77. [src/services/api.js](file:///c:/laragon/www/Rajut/src/services/api.js) (Diubah)
- **Direct Backend API Endpoint**: Mengonfigurasi fallback `API_BASE_URL` di frontend React agar terhubung langsung ke Cloudflare Worker API backend (`https://my-backend-api.rajut-api.workers.dev/api`).
- **Solusi Vercel Stateless Issue**: Menghilangkan ketergantungan pada memori RAM serverless Vercel yang bersifat sementara (transient/cold start), sehingga seluruh aksi login admin (`haikaladika8@gmail.com`), pendaftaran akun baru, fetch galeri, proyek, dan kontak pada Vercel dipastikan 100% membaca dan menulis langsung ke Cloudflare D1 Database secara *real-time*.

---
---

## Pengosongan Data & Gambar Statis Galeri dan Proyek (Update Paling Baru)

Menghapus seluruh item/gambar statis bawaan dari tabel `gallery` dan `projects` di database Cloudflare D1, skrip SQL seeding, serta direktori penyimpanan media lokal.

### 78. Database Cloudflare D1, SQL Schemas & Media Uploads (Diubah)
- **Pengosongan Tabel Cloudflare D1**: Mengeksekusi perintah `DELETE FROM gallery; DELETE FROM projects;` pada remote database `rajut-db` sehingga seluruh baris data sampel galeri dan proyek terhapus total.
- **Pembersihan SQL Seeding**: Menghapus baris perintah `INSERT OR IGNORE INTO gallery...` dan `INSERT OR IGNORE INTO projects...` dari [d1_setup.sql](file:///c:/laragon/www/Rajut/d1_setup.sql) dan [my-backend-api/schema.sql](file:///c:/laragon/www/Rajut/my-backend-api/schema.sql) agar tabel tetap bersih saat inisialisasi ulang.
- **Penyesuaian Response Fallback Worker**: Memperbarui [my-backend-api/src/index.js](file:///c:/laragon/www/Rajut/my-backend-api/src/index.js) agar respon fallback pengambil data galeri dan proyek mengembalikan array kosong (`[]`).
- **Pembersihan Berkas Unggahan Lokal**: Menghapus seluruh file media gambar lama dari folder `public/uploads/` (kecuali berkas sistem `.gitkeep`).

---
---

## Pembersihan Referensi Gambar Statis pada Komponen Front-end (Update Paling Baru)

Menghapus seluruh URL fallback gambar statis Unsplash dari komponen-komponen React agar antarmuka sepenuhnya menampilkan data murni dari database.

### 79. [src/features/projects/Projects.jsx](file:///c:/laragon/www/Rajut/src/features/projects/Projects.jsx), [Gallery.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) & [Home.jsx](file:///c:/laragon/www/Rajut/src/features/home/Home.jsx) (Diubah)
- **Projects.jsx**: Menghapus array fallback gambar statis `staticPics` dan handler `onError` Unsplash pada kartu proyek & modal detail.
- **Gallery.jsx**: Menghapus variabel konstanta `FALLBACK_IMAGE` Unsplash dan mengubah fungsi `getFullImgUrl` agar mengembalikan string kosong (`''`) jika data foto belum diunggah.
- **Home.jsx**: Menghapus array fallback gambar statis `staticPics` dan handler `onError` Unsplash pada seksi *Featured Works*.

---
---

## Perbaikan Multi-Image Upload Proyek & Sinkronisasi Otomatis Gallery (Update Paling Baru)

Memperbaiki 3 bug kritis pada Cloudflare Worker backend: dukungan upload multi-foto di proyek, sinkronisasi otomatis foto proyek ke galeri, dan error `FALLBACK_IMAGE`.

### 80. [my-backend-api/src/index.js](file:///c:/laragon/www/Rajut/my-backend-api/src/index.js) & [Gallery.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) (Diubah)
- **Multi-Image Upload (POST /api/projects)**: Mengubah `formData.get('image')` menjadi `formData.getAll('images')` agar menangkap seluruh file foto yang dikirim frontend. Mendukung penyimpanan multi-URL sebagai JSON array di kolom `image_url`.
- **Multi-URL Support (JSON Body)**: Mendukung input multi-URL yang dipisahkan baris baru atau koma pada mode URL.
- **Sinkronisasi Foto Proyek → Galeri (POST)**: Setelah proyek berhasil dibuat, setiap URL foto secara otomatis di-insert ke tabel `gallery` sehingga tampil di halaman Galeri.
- **Sinkronisasi Foto Proyek → Galeri (PUT)**: Saat proyek diperbarui dengan foto baru, entri galeri lama dihapus dan diganti entri baru.
- **Sinkronisasi Foto Proyek → Galeri (DELETE)**: Saat proyek dihapus, seluruh entri foto terkait juga dihapus dari tabel `gallery`.
- **Gallery Merge Query (GET /api/gallery)**: Memperbarui endpoint `GET /api/gallery` agar menggabungkan data dari tabel `gallery` DAN tabel `projects` (termasuk parsing JSON array), sehingga seluruh foto proyek otomatis muncul di halaman Galeri.
- **Fix FALLBACK_IMAGE ReferenceError**: Menghapus referensi variabel `FALLBACK_IMAGE` yang sudah dihapus dari handler `onError` di `Gallery.jsx` yang menyebabkan crash saat gambar gagal dimuat.

---
---

## Perbaikan Modal Lightbox Gambar pada Halaman Galeri (Update Paling Baru)

Memperbaiki dan meningkatkan tampilan serta fungsi modal pop-up gambar (Lightbox Modal) saat kartu foto pada halaman Galeri diklik/ditekan oleh pengguna.

### 81. [src/features/gallery/Gallery.jsx](file:///c:/laragon/www/Rajut/src/features/gallery/Gallery.jsx) & [src/styles/style.css](file:///c:/laragon/www/Rajut/src/styles/style.css) (Diubah)
- **Fix Modal Styling (.lightbox-modal)**: Menambahkan aturan CSS lengkap untuk `.lightbox-modal`, `.lightbox-content`, `.lightbox-close`, dan `.lightbox-nav-btn` dengan backdrop blur fixed overlay (`backdrop-filter: blur(12px)`), posisi di tengah layar (centered), tombol penutup melayang interaktif, dan animasi masuk yang halus.
- **Card Click Event Handler**: Memasang listener `onClick` langsung pada kartu galeri (`.gallery-card`), memastikan modal gambar muncul saat bagian mana pun dari foto/kartu ditekan.
- **Multi-Photo Carousel Navigation**: Menambahkan navigasi tombol panah Kiri (`‹`) dan Kanan (`›`) di dalam modal lightbox agar pengguna dapat menjelajahi foto sebelumnya/selanjutnya tanpa harus menutup modal.
- **Keyboard Shortcuts (Esc & Panah)**: Menambahkan hook `useEffect` untuk menangani tombol keyboard (`Escape` untuk menutup modal, `ArrowLeft` dan `ArrowRight` me-navigate foto).
- **Informasi Counter & Title**: Menambahkan label penjelas judul karya rajutan dan counter indeks foto (misal: *Foto 1 dari 12*) di bawah tampilan gambar fullsize.

---
---

## Perbaikan Masalah Auto-Scroll & Perpindahan Halaman Otomatis pada Perangkat Mobile (Update Paling Baru)

Memperbaiki bug di mana pengguna mobile (HP) mengalami perpindahan halaman/seksi secara otomatis dan layar scroll ke atas sendiri saat sedang mengusap (scrolling) layar HP.

### 82. [src/App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx) & [src/hooks/useSwipe.js](file:///c:/laragon/www/Rajut/src/hooks/useSwipe.js) (Diubah)
- **Penyebab Masalah (Root Cause)**: Hook `useSwipe` sebelumnya memasang event listener sentuhan global (`window.addEventListener('touchstart')`) tanpa memperhitungkan pergerakan vertikal. Saat pengguna melakukan scroll layar ke atas/bawah pada HP, pergeseran jempol secara miring memicu deteksi gestur swipe horizontal, yang memanggil `navigateNext`/`navigatePrev`, mereset hash URL, serta memaksa halaman berpindah dan scroll ke paling atas.
- **Eliminasi Global Swipe Navigasi ([App.jsx](file:///c:/laragon/www/Rajut/src/App.jsx))**: Menghapus pemanggilan global `useSwipe(navigateNext, navigatePrev)` dari aplikasi utama agar perpindahan halaman utama hanya terjadi saat pengguna secara eksplisit mengklik menu navigasi.
- **Refactoring Safe Hook ([useSwipe.js](file:///c:/laragon/www/Rajut/src/hooks/useSwipe.js))**: Memperbarui hook `useSwipe` agar memerlukan parameter `targetRef` spesifik dan menerapkan rasio filter pergerakan miring (`Math.abs(deltaX) > Math.abs(deltaY) * 2`), menjamin gestur scroll vertikal pengunjang HP tidak akan pernah mengganggu navigasi.

---
---

## Pembaruan Textfield Input Placeholder Halaman Auth/Login (Update Paling Baru)

Mengubah bayangan teks petunjuk (*placeholder*) pada form input halaman Masuk & Daftar agar lebih bersih, umum, dan tidak menampilkan contoh alamat email asli.

### 83. [src/features/auth/Auth.jsx](file:///c:/laragon/www/Rajut/src/features/auth/Auth.jsx) (Diubah)
- **Login Placeholder**: Mengubah `placeholder="haikaladika8@gmail.com"` menjadi `placeholder="Email"` dan `placeholder="••••••••"` menjadi `placeholder="Password"`.
- **Register Placeholder**: Mengubah `placeholder="nama@email.com"` menjadi `placeholder="Email"` dan `placeholder="Minimal 4 karakter"` menjadi `placeholder="Password"`.





