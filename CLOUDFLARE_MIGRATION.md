# Panduan Migrasi & Konfigurasi Cloudflare D1 & R2 (Toko Rajut)

Dokumen ini berisi langkah-langkah untuk menyiapkan dan menghubungkan **Cloudflare D1 Database** dan **Cloudflare R2 Bucket** ke proyek website Toko Rajut.

---

## 1. Persyaratan Awal
- Pastikan CLI **Wrangler** sudah terpasang (sudah termasuk dalam `devDependencies`).
- Login ke akun Cloudflare Anda melalui terminal:
  ```bash
  npx wrangler login
  ```

---

## 2. Membuat Cloudflare D1 Database
Jalankan perintah berikut di folder `my-backend-api` (atau root):
```bash
cd my-backend-api
npx wrangler d1 create rajut-db
```

Output terminal akan menampilkan `database_id` seperti ini:
```text
[[d1_databases]]
binding = "DB"
database_name = "rajut-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Salin `database_id` tersebut dan perbarui berkas [wrangler.jsonc](file:///c:/laragon/www/Rajut/my-backend-api/wrangler.jsonc):
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "rajut-db",
    "database_id": "PASTE_DATABASE_ID_ANDA_DI_SINI"
  }
]
```

---

## 3. Menginisialisasi Skema SQL D1
Jalankan skrip SQL [d1_setup.sql](file:///c:/laragon/www/Rajut/d1_setup.sql) ke database Cloudflare D1:

**Untuk Local Development:**
```bash
npx wrangler d1 execute rajut-db --local --file=../d1_setup.sql
```

**Untuk Production Remote Database:**
```bash
npx wrangler d1 execute rajut-db --remote --file=../d1_setup.sql
```

---

## 4. Membuat Cloudflare R2 Storage Bucket (Untuk Gambar)
Jalankan perintah berikut untuk membuat R2 Bucket penampung gambar:
```bash
npx wrangler r2 bucket create rajut-images
```

Pastikan binding pada `wrangler.jsonc` sudah terkonfigurasi:
```json
"r2_buckets": [
  {
    "binding": "BUCKET",
    "bucket_name": "rajut-images"
  }
]
```

---

## 5. Deploy Cloudflare Worker API Backend
Untuk mendeploy backend worker ke Cloudflare Workers:
```bash
cd my-backend-api
npx wrangler deploy
```

---

## 6. Akun Default Seeding
Setelah skema diajukan ke D1, akun bawaan berikut akan otomatis tersedia:
- **Admin**: `admin@tokorajut.com` / `admin`
- **User**: `user@tokorajut.com` / `user`

---

## Ringkasan Perubahan Arsitektur
1. **Supabase Client -> Cloudflare Worker D1 & R2**: Semua route data dan upload gambar ditangani oleh Worker (`my-backend-api/src/index.js`).
2. **Penyimpanan Gambar**: Gambar yang diunggah dikirim ke R2 Bucket (`BUCKET.put()`) dan disajikan publik melalui endpoint `/api/uploads/:key`.
3. **Data Relasional**: Data `gallery`, `projects`, `users`, dan `contact_messages` disimpan di SQLite D1 (`env.DB`).
