import React, { useState, useEffect } from 'react'

export default function Header({ activeSection, onSectionChange, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ]

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLinkClick = (e, id) => {
    e.preventDefault()
    onSectionChange(id)
    setMobileMenuOpen(false)
  }

  const handleLogoutClick = (e) => {
    e.preventDefault()
    onLogout()
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <a href="#home" onClick={(e) => handleLinkClick(e, 'home')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🧶</span> Toko Rajut
              </a>
            </div>

            <nav className="nav" style={{ alignItems: 'center' }}>
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, item.id)}
                >
                  {item.label}
                </a>
              ))}
              
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#1a1a1a', fontWeight: '500' }}>
                    Hi, <strong style={{ color: '#d2691e' }}>{user.name}</strong> ({user.role})
                  </span>
                  <a
                    href="#logout"
                    className="nav-link"
                    onClick={handleLogoutClick}
                    style={{ color: '#dc3545', background: 'rgba(220, 53, 69, 0.05)' }}
                  >
                    Keluar
                  </a>
                </div>
              ) : (
                <a
                  href="#auth"
                  className={`nav-link ${activeSection === 'auth' ? 'active' : ''}`}
                  onClick={(e) => handleLinkClick(e, 'auth')}
                  style={{ marginLeft: '1.5rem', border: '1px solid #d2691e', color: '#d2691e' }}
                >
                  Masuk / Daftar
                </a>
              )}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                id="mobileMenuBtn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'show' : ''}`} id="mobileMenu">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, item.id)}
          >
            {item.label}
          </a>
        ))}
        {user ? (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8f9fa', background: '#f8f9fa' }}>
              <span style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>
                Hi, <strong>{user.name}</strong> ({user.role})
              </span>
            </div>
            <a
              href="#logout"
              className="mobile-nav-link"
              onClick={handleLogoutClick}
              style={{ color: '#dc3545', background: 'rgba(220, 53, 69, 0.05)' }}
            >
              Keluar (Logout)
            </a>
          </>
        ) : (
          <a
            href="#auth"
            className={`mobile-nav-link ${activeSection === 'auth' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, 'auth')}
            style={{ color: '#d2691e', background: 'rgba(210, 105, 30, 0.05)' }}
          >
            Masuk / Daftar
          </a>
        )}
      </div>
    </>
  )
}
