import React, { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { submitContact } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Contact({ isActive, user, onSectionChange }) {
  const { showToast } = useNotification()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleWhatsAppClick = (e) => {
    e.preventDefault()

    if (!user) {
      showToast('⚠️ Silakan login terlebih dahulu untuk menghubungi WhatsApp Support!', 'error')
      if (onSectionChange) {
        onSectionChange('auth')
      } else {
        window.location.hash = 'auth'
      }
      return
    }

    const namaAkun = user.name || user.username || user.email || 'Pengguna'
    const lokasiAkun = user.address || user.location || user.city || 'Indonesia'

    const messageText = `Halo kakak!, nama saya ${namaAkun} dari ${lokasiAkun} ingin menanyakan tentang rajutan lebih lanjut 😊`
    const waNumber = '6285773649935'
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageText)}`

    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, message } = formData

    if (!name || !email || !message) {
      showToast('Harap isi semua kolom terlebih dahulu!', 'error')
      return
    }

    setSubmitting(true)
    showToast('Sedang mengirim pesan Anda...', 'loading', 0)

    try {
      await submitContact(name, email, message)
      showToast(`Pesan terkirim! Terima kasih ${name}.`, 'success')
      
      setFormData({
        name: '',
        email: '',
        message: ''
      })
    } catch (err) {
      console.error(err)
      showToast(`Gagal mengirim pesan: ${err.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2>Hubungi Kami</h2>
          <p className="section-subtitle">
            Punya pertanyaan mengenai produk atau mau pesan rajutan custom? Kami siap membantu Anda!
          </p>
        </div>

        <div className="contact-content">
          {/* Glassmorphism Form Card */}
          <div className="contact-form" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#d2691e', marginBottom: '1.5rem', fontWeight: '600' }}>
              ✉️ Kirim Pesan / Pertanyaan
            </h3>
            <form id="contactForm" onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="name" style={{ fontWeight: '500', color: '#1e293b' }}>Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukkan nama Anda"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="email" style={{ fontWeight: '500', color: '#1e293b' }}>Alamat Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="message" style={{ fontWeight: '500', color: '#1e293b' }}>Pesan Anda</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tuliskan pertanyaan atau detail pesanan custom Anda..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  style={{ minHeight: '130px' }}
                ></textarea>
              </div>

              <Button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: '10px' }}>
                {submitting ? 'Mengirim Pesan...' : '🚀 Kirim Pesan Sekarang'}
              </Button>
            </form>
          </div>

          {/* Contact Details Info Card */}
          <div className="contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff3eb', color: '#d2691e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                📧
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2px', fontWeight: '600' }}>Email Resmi</h4>
                <a href="mailto:haikaladika8@gmail.com" style={{ color: '#d2691e', fontSize: '0.95rem', textDecoration: 'none', fontWeight: '500' }}>
                  haikaladika8@gmail.com
                </a>
              </div>
            </div>

            {/* Interactive WhatsApp Support Card */}
            <div
              onClick={handleWhatsAppClick}
              style={{
                background: '#ffffff',
                padding: '1.5rem 1.75rem',
                borderRadius: '1.25rem',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                border: '1.5px solid #25D366',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
              className="whatsapp-contact-card"
              title={user ? 'Klik untuk langsung chat di WhatsApp' : 'Wajib login terlebih dahulu untuk menghubungkan ke WhatsApp'}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#25D366',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                flexShrink: 0
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.283-1.385c1.455.795 3.1 1.214 4.786 1.215h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.667-1.037-5.176-2.924-7.062-1.886-1.886-4.394-2.923-7.065-2.923zm5.952 14.174c-.252.71-1.242 1.3-1.716 1.38-.475.08-1.087.143-3.486-.85-3.07-1.272-5.045-4.394-5.198-4.598-.153-.204-1.243-1.654-1.243-3.155 0-1.502.786-2.241 1.062-2.548.277-.306.604-.383.805-.383.201 0 .403.002.578.01.187.009.438-.07.685.522.253.606.862 2.1.937 2.253.076.153.127.332.025.536-.102.204-.153.332-.306.51-.153.179-.322.399-.46.536-.153.153-.313.32-.134.627.179.307.795 1.31 1.706 2.122 1.17 1.042 2.158 1.365 2.465 1.518.307.153.485.127.664-.077.179-.204.766-.894.97-1.201.204-.306.408-.255.684-.153.276.102 1.758.829 2.064.982.306.153.51.23.587.357.077.127.077.736-.175 1.446z"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2px', fontWeight: '600' }}>WhatsApp Support</h4>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    background: user ? '#dcfce7' : '#fee2e2',
                    color: user ? '#15803d' : '#b91c1c',
                    border: user ? '1px solid #bbf7d0' : '1px solid #fecaca'
                  }}>
                    {user ? '● Chat Langsung' : '🔒 Wajib Login'}
                  </span>
                </div>
                <p style={{ color: '#25D366', fontSize: '0.95rem', fontWeight: '600', margin: '2px 0' }}>
                  08577364 9935
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {user ? 'Klik untuk langsung terhubung di WhatsApp' : 'Klik untuk login & terhubung ke WhatsApp'}
                </p>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                📍
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2px', fontWeight: '600' }}>Lokasi Workshop</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Jakarta, Indonesia</p>
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                ⏰
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2px', fontWeight: '600' }}>Jam Operasional</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Senin - Sabtu: 08.00 - 17.00 WIB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
