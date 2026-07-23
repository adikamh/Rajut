import React from 'react'
import Button from '../../components/ui/Button'

export default function Privacy({ isActive, onSectionChange }) {
  return (
    <section id="privacy" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            background: '#ecfdf5',
            color: '#059669',
            padding: '4px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '0.75rem',
            border: '1px solid #a7f3d0'
          }}>
            🔒 Google OAuth 2.0 Compliance Approved
          </span>
          <h2 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            Kebijakan Privasi & Ketentuan Layanan
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
            Dokumen resmi kebijakan perlindungan data pengguna dan penggunaan Google Drive API pada platform Toko Rajut.
          </p>
        </div>

        {/* Main Content Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.5rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          lineHeight: '1.7',
          color: '#334155'
        }}>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              <strong>Terakhir Diperbarui:</strong> {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Selamat datang di <strong>Toko Rajut</strong>. Kami menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi serta data yang Anda percayakan kepada kami saat menggunakan layanan dan integrasi sistem kami.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '1.5rem 0' }} />

          {/* Section 1 */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#d2691e', fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📌</span> 1. Identitas Aplikasi & Pengembang
            </h3>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li><strong>Nama Aplikasi:</strong> Toko Rajut Platform</li>
              <li><strong>Pengembang Resmi:</strong> Toko Rajut Indonesia</li>
              <li><strong>Kontak Email Pengembang:</strong> <a href="mailto:haikaladika8@gmail.com" style={{ color: '#2563eb' }}>haikaladika8@gmail.com</a></li>
              <li><strong>Domain Resmi Platform:</strong> <code>http://localhost:5173</code></li>
            </ul>
          </div>

          {/* Section 2 - Google API Policy */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '1rem',
            padding: '1.5rem',
            borderLeft: '4px solid #2563eb',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#1e3a8a', fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>☁️</span> 2. Penggunaan Google Drive API & Data Pengguna
            </h3>
            <p style={{ marginBottom: '0.75rem' }}>
              Aplikasi kami terhubung secara resmi dengan <strong>Google Drive API</strong> (`https://www.googleapis.com/auth/drive`) untuk mendukung pengelolaan media katalog produk rajutan. Berikut adalah rincian penggunaan data:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
              <li>
                <strong>Tujuan Penggunaan Akses Google Drive:</strong> Memungkinkan administrator Toko Rajut untuk mengunggah, menyimpan, memperbarui, dan menampilkan berkas gambar produk rajutan secara langsung ke Google Drive Cloud Storage.
              </li>
              <li>
                <strong>Penyimpanan Berkas:</strong> Berkas gambar yang diunggah disimpan pada folder khusus di Google Drive dan disajikan kembali ke pengguna platform dalam bentuk tampilan katalog produk.
              </li>
              <li>
                <strong>Pemberitahuan Kepatuhan Kebijakan Penggunaan Terbatas Google:</strong>
                <blockquote style={{
                  background: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  margin: '8px 0 0 0',
                  fontStyle: 'italic',
                  fontSize: '0.9rem',
                  color: '#1e293b'
                }}>
                  "Toko Rajut's use and transfer of information received from Google APIs to any other app will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Google API Services User Data Policy</a>, including the Limited Use requirements."
                </blockquote>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#d2691e', fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span> 3. Keamanan & Perlindungan Data
            </h3>
            <p>
              Kami menerapkan standar keamanan tinggi untuk melindungi data Anda:
            </p>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li>Seluruh komunikasi data antara peramban (*browser*) dan server menggunakan enkripsi standar HTTPS / TLS.</li>
              <li>Kami **TIDAK PERNAH** memperjualbelikan, menyewakan, atau membagikan data pribadi maupun berkas pengguna kepada pihak ketiga mana pun untuk tujuan pemasaran.</li>
              <li>Kredensial dan token OAuth disimpan secara aman pada repositori server terenkripsi.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#d2691e', fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span> 4. Hak Pengguna & Pencabutan Akses
            </h3>
            <p>
              Sebagai pengguna atau administrator, Anda memiliki kontrol penuh atas akses akun Google Anda:
            </p>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li>Anda dapat menghapus berkas foto kapan saja melalui panel kontrol aplikasi Toko Rajut.</li>
              <li>Anda dapat mencabut izin akses Google Drive API kapan saja melalui halaman <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '600' }}>Pengaturan Keamanan Akun Google</a> Anda.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h3 style={{ color: '#d2691e', fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📞</span> 5. Hubungi Kami
            </h3>
            <p>
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau tentang pengolahan data pada aplikasi Toko Rajut, silakan hubungi kami di:
            </p>
            <div style={{
              background: '#fff7ed',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid #ffedd5',
              fontSize: '0.9rem'
            }}>
              <p style={{ margin: 0 }}><strong>Tim Dukungan Toko Rajut</strong></p>
              <p style={{ margin: '4px 0 0 0' }}>Email: <a href="mailto:haikaladika8@gmail.com" style={{ color: '#d2691e', fontWeight: '600' }}>haikaladika8@gmail.com</a></p>
              <p style={{ margin: '4px 0 0 0' }}>Alamat: Indonesia</p>
            </div>
          </div>

          {/* Back Action */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <Button onClick={() => onSectionChange('home')} style={{ padding: '0.75rem 2rem' }}>
              🏠 Kembali ke Halaman Utama
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
