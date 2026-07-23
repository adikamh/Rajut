import React, { useEffect, useState } from 'react'

export default function Home({ isActive, onSectionChange, projects = [], gallery = [], loading }) {
  const [animate, setAnimate] = useState(false)

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

  // Combine items from Gallery and Projects so all uploaded photos appear in Karya Unggulan
  const combinedItems = []

  // Add Gallery items first
  if (gallery && gallery.length > 0) {
    gallery.forEach((item, idx) => {
      combinedItems.push({
        id: `gal-${item.id || idx}`,
        img: getImgUrl(item),
        title: item.title || `Karya Rajutan Galeri #${idx + 1}`,
        desc: item.description || 'Karya seni rajutan tangan buatan Toko Rajut yang dibuat dengan penuh kasih sayang.',
        badge: '📸 Galeri Rajut'
      })
    })
  }

  // Add Project items
  if (projects && projects.length > 0) {
    projects.forEach((item, idx) => {
      combinedItems.push({
        id: `proj-${item.id || idx}`,
        img: getImgUrl(item),
        title: item.title || `Proyek Rajut #${idx + 1}`,
        desc: item.description || 'Koleksi proyek rajutan eksklusif buatan tangan.',
        badge: '⭐ Featured Proyek'
      })
    })
  }

  // Fallback default sample works if both gallery & projects are empty
  if (combinedItems.length === 0) {
    combinedItems.push(
      {
        id: 'sample-1',
        img: '/about-lion.jpg',
        title: 'Boneka Singa Rajut Handcrafted',
        desc: 'Boneka karakter singa buatan tangan dengan benang katun lembut dan isian premium.',
        badge: '🧶 Favorit Pelanggan'
      },
      {
        id: 'sample-2',
        img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop',
        title: 'Syal Wool Warmth',
        desc: 'Syal hangat dengan kombinasi warna pastel alami dan tekstur rajut rajutan rapat.',
        badge: '✨ Koleksi Terbaru'
      }
    )
  }

  // Display top 6 featured works
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

          <div className="works-grid">
            {featuredWorks.map((work, index) => (
              <div
                key={work.id || index}
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
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
                  <img
                    src={work.img}
                    alt={work.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/about-lion.jpg'
                    }}
                  />
                  <span className="gallery-badge" style={{ top: '12px', left: '12px', background: 'rgba(210, 105, 30, 0.9)', color: '#ffffff', backdropFilter: 'blur(8px)' }}>
                    {work.badge || '⭐ Karya Unggulan'}
                  </span>
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
