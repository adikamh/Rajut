import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { submitContact } from '../../services/api'

export default function Contact({ isActive }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

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
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      await submitContact(name, email, message)
      alert(`Terima kasih ${name}! Pesan Anda telah disimpan ke database dan notifikasi email dikirimkan.`)
      
      setFormData({
        name: '',
        email: '',
        message: ''
      })
    } catch (err) {
      console.error(err)
      alert(`Gagal mengirimkan pesan: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <h2>Contact Us</h2>
        <div className="contact-content">
          <div className="contact-form">
            <form id="contactForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>Have questions about our products or custom orders? We'd love to hear from you!</p>
            <div className="contact-details">
              <p><strong>Email:</strong> info@tokorajut.com</p>
              <p><strong>Phone:</strong> +62 123 456 7890</p>
              <p><strong>Address:</strong> Jakarta, Indonesia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
