import React, { useState, useEffect } from 'react'

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const GalleryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
    <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
    <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12" />
  </svg>
)

const ZoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function Home({ isActive, onSectionChange, featuredWorks = [], loading = false }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isActive) {
      setTimeout(() => setAnimate(true), 100)
    } else {
      setAnimate(false)
    }
  }, [isActive])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImage])

  return (
    <section id="home" className={`section ${isActive ? 'active' : ''}`}>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <span style={{ display: 'inline-block', background: 'rgba(210, 105, 30, 0.1)', color: '#d2691e', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.25rem' }}>
            <SparkleIcon /> Seni Rajut Handcrafted Indonesia
          </span>
          <h1 style={{ lineHeight: '1.25', marginBottom: '1.25rem' }}>
            Kehangatan & Keindahan dalam Setiap Helaian Rajutan
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Temukan koleksi aksesoris, pakaian, dan perlengkapan rajut buatan tangan eksklusif yang dibuat dengan cinta, ketelitian, dan benang premium pilihan.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="#gallery"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault()
                onSectionChange('gallery')
              }}
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '10px' }}
            >
              <GalleryIcon /> Jelajahi Galeri
            </a>
            <a
              href="#projects"
              className="btn"
              onClick={(e) => {
                e.preventDefault()
                onSectionChange('projects')
              }}
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '10px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }}
            >
              <PackageIcon /> Lihat Proyek Rajut
            </a>
          </div>
        </div>

        <div className="hero-image" style={{ position: 'relative' }}>
          <img
            src="/about-lion.jpg"
            alt="Handmade knitting artistry"
            style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(210, 105, 30, 0.25)' }}
          />
        </div>
      </div>

      {/* Featured Works Section - Clean Photo Cards with Lightbox Modal */}
      <div className="featured-works" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Karya Unggulan Pilihan</h2>
            <p className="section-subtitle">
              Hasil kreasi terbaik yang paling diminati oleh pelanggan setia Toko Rajut.
            </p>
          </div>

          {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Memuat karya unggulan...</p>}

          <div className="works-grid">
            {featuredWorks.map((work, index) => (
              <div
                key={work.id || index}
                className="gallery-item"
                onClick={() => setSelectedImage(work)}
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'translateY(0)' : 'translateY(24px)',
                  transition: animate ? `opacity 0.6s ease ${index * 0.12}s, transform 0.6s ease ${index * 0.12}s` : 'none',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  background: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div className="gallery-image-container" style={{ position: 'relative', width: '100%', paddingTop: '80%', overflow: 'hidden' }}>
                  <img
                    src={work.img}
                    alt={`Karya Unggulan #${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/about-lion.jpg'
                    }}
                  />
                  <div className="gallery-overlay">
                    <span className="gallery-zoom-icon">
                      <ZoomIcon /> Lihat Foto Full
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Home Featured Works */}
      {selectedImage && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            className="modal-content-wrapper"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s ease'
              }}
              title="Tutup (Escape)"
            >
              <CloseIcon />
            </button>

            {/* Modal Image */}
            <img
              src={selectedImage.img}
              alt="Preview Foto Karya Unggulan"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                background: '#0f172a'
              }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/about-lion.jpg'
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
