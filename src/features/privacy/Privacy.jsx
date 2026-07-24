import React from 'react'
import Button from '../../components/ui/Button'

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d2691e', display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="18" y1="8" x2="22" y2="12" />
    <line x1="12" y1="2" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10l-8 8a15.3 15.3 0 0 1-10-4l8-8z" />
  </svg>
)

const CloudIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1e3a8a', display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d2691e', display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d2691e', display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d2691e', display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export default function Privacy({ isActive, onSectionChange }) {
  return (
    <section id="privacy" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            background: '#ecfdf5',
            color: '#059669',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '0.75rem',
            border: '1px solid #a7f3d0'
          }}>
            <LockIcon /> Google OAuth 2.0 Compliance Approved
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
              <PinIcon /> 1. Identitas Aplikasi & Pengembang
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
              <CloudIcon /> 2. Penggunaan Google Drive API & Data Pengguna
            </h3>
            <p style={{ marginBottom: '0.75rem' }}>
              Aplikasi kami terhubung secara resmi dengan <strong>Google Drive API</strong> (`https://www.googleapis.com/auth/drive`) untuk mendukung pengelolaan media katalog produk rajutan. Berikut adalah rincian penggunaan data:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
              <li>
                <strong>Tujuan Penggunaan Akses Google Drive:</strong> Memungkinkan administrator Toko Rajut untuk mengunggah, menyimpan, memperbarui, dan menampilkan berkas gambar produk rajutan secara langsung ke Google Drive Cloud Storage.
              </li>
              <li>
                <strong>Penyimpanan Berkas:</strong> Berkas gambar yang diunggah disimpan pada folder khusus di Google Drive dan disajikan kembali ke pengguna platform dalam bentuk katalog produk.
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
              <ShieldIcon /> 3. Keamanan & Perlindungan Data
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
              <SettingsIcon /> 4. Hak Pengguna & Pencabutan Akses
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
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#d2691e', fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneIcon /> 5. Hubungi Kami
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
              <HomeIcon /> Kembali ke Halaman Utama
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
