import React from 'react'

export default function Footer({ onSectionChange }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy', label: 'Kebijakan Privasi' }
  ]

  const handleLinkClick = (e, id) => {
    e.preventDefault()
    onSectionChange(id)
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.png" alt="Toko Rajut Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
              <span>Toko Rajut</span>
            </h3>
            <p>Seni rajut tangan eksklusif buatan Indonesia yang dibuat dengan benang berkualitas dan penuh kasih sayang.</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              {links.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} onClick={(e) => handleLinkClick(e, link.id)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-link">Instagram</a>
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <p>&copy; 2024 Toko Rajut. All rights reserved.</p>
          <a
            href="#privacy"
            onClick={(e) => handleLinkClick(e, 'privacy')}
            style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'underline', fontWeight: '500' }}
          >
            🔒 Kebijakan Privasi & Ketentuan Layanan (Google OAuth)
          </a>
        </div>
      </div>
    </footer>
  )
}
