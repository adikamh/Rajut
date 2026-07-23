import React, { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { submitContact } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Contact({ isActive, user }) {
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

            <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                💬
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '2px', fontWeight: '600' }}>WhatsApp Support</h4>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>+62 812-3456-7890</p>
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
