import React from 'react'

export default function Footer({ onSectionChange }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧶</span> Toko Rajut
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
        <div className="footer-bottom">
          <p>&copy; 2024 Toko Rajut. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
