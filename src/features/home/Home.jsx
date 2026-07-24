import React, { useEffect, useState } from 'react'

export default function Home({ isActive, onSectionChange, projects = [], gallery = [], loading }) {
  const [animate, setAnimate] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const getImgUrl = (item) => {
    if (!item) return ''
    const url = item.image_url || item.img || ''
    if (!url) return ''
    const driveMatch = url.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
    if (driveMatch && driveMatch[1]) {
      return `/api/drive-image/${driveMatch[1]}`
    }
    if (url.startsWith('http')) return url
    return url.startsWith('/') ? url : `/${url}`
  }

  // Combine items from Gallery and Projects so all uploaded photos appear in Karya Unggulan (Strict max 6 photos)
  const combinedItems = []
  const seenUrls = new Set()

  // Add Gallery items first
  if (gallery && gallery.length > 0) {
    gallery.forEach((item, idx) => {
      const imgUrl = getImgUrl(item)
      if (imgUrl && !seenUrls.has(imgUrl)) {
        seenUrls.add(imgUrl)
        combinedItems.push({
          id: `gal-${item.id || idx}`,
          img: imgUrl
        })
      }
    })
  }

  // Add Project items
  if (projects && projects.length > 0) {
    projects.forEach((item, idx) => {
      const imgUrl = getImgUrl(item)
      if (imgUrl && !seenUrls.has(imgUrl)) {
        seenUrls.add(imgUrl)
        combinedItems.push({
          id: `proj-${item.id || idx}`,
          img: imgUrl
        })
      }
    })
  }

  // Fallback default sample works if both gallery & projects are empty
  if (combinedItems.length === 0) {
    combinedItems.push(
      { id: 'sample-1', img: '/about-lion.jpg' },
      { id: 'sample-2', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop' },
      { id: 'sample-3', img: '/project-sample.jpg' },
      { id: 'sample-4', img: '/gallery-knitting-1.jpg' }
    )
  }

  // Strictly display maximum 6 featured works
  const featuredWorks = combinedItems.slice(0, 6)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setAnimate(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
  }, [isActive, projects.length, gallery.length])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    }
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown)
    }
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
            ✨ Seni Rajut Handcrafted Indonesia
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
              🖼️ Jelajahi Galeri
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
              📦 Lihat Proyek Rajut
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
                      🔍 Lihat Foto Full
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
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '850px',
              width: '100%',
              background: '#0f172a',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)'
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
              ✕
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
