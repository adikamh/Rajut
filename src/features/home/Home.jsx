import React, { useEffect, useState } from 'react'

export default function Home({ isActive, onSectionChange, projects = [], loading }) {
  const [animate, setAnimate] = useState(false)

  const getImgUrl = (proj, index) => {
    if (proj && proj.image_url) {
      const url = proj.image_url
      const driveMatch = url.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
      if (driveMatch && driveMatch[1]) {
        return `/api/drive-image/${driveMatch[1]}`
      }
      if (url.startsWith('http')) return url
      return url.startsWith('/') ? url : `/${url}`

    }
    return ''
  }

  const featuredWorks = projects.map((proj, index) => ({
    img: getImgUrl(proj, index),
    title: proj.title,
    desc: proj.description
  }))

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setAnimate(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
  }, [isActive, projects])

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

          {/* Trust Badges */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748b' }}>
              <span>⭐</span> 100% Buatan Tangan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748b' }}>
              <span>🧶</span> Benang Premium Quality
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748b' }}>
              <span>🚀</span> Pengiriman Seluruh Indonesia
            </div>
          </div>
        </div>

        <div className="hero-image" style={{ position: 'relative' }}>

          <img
            src="https://images.unsplash.com/photo-1679847628912-4c3e7402abc7?w=800&fit=crop"
            alt="Handmade knitting artistry"
            style={{ width: '100%', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(210, 105, 30, 0.25)' }}
          />
        </div>
      </div>

      {/* Featured Works Section */}
      <div className="featured-works" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Karya Unggulan Pilihan</h2>
            <p className="section-subtitle">
              Hasil kreasi terbaik yang paling diminati oleh pelanggan setia Toko Rajut.
            </p>
          </div>

          {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Memuat karya unggulan...</p>}
          
          {!loading && featuredWorks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Belum ada karya yang ditampilkan.</p>
          )}

          <div className="works-grid">
            {featuredWorks.map((work, index) => (
              <div
                key={index}
                className="work-card"
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'translateY(0)' : 'translateY(24px)',
                  transition: animate ? `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s` : 'none',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  background: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '70%', overflow: 'hidden' }}>
                  <img
                    src={work.img}
                    alt={work.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null
                    }}
                  />
                  <span className="gallery-badge" style={{ top: '12px', left: '12px' }}>⭐ Featured</span>
                </div>
                <div className="work-info" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: '600' }}>
                    {work.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    {work.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
