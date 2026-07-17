import React, { useEffect, useState } from 'react'

export default function Home({ isActive, onSectionChange, projects = [], loading }) {
  const [animate, setAnimate] = useState(false)

  const featuredWorks = projects.map((proj, index) => {
    const titleLower = proj.title.toLowerCase()
    let img = 'https://images.unsplash.com/photo-1556906781-9a412961c28c'
    
    if (titleLower.includes('scarf')) {
      img = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
    } else if (titleLower.includes('blanket')) {
      img = 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'
    } else if (titleLower.includes('hat') || titleLower.includes('beanie')) {
      img = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'
    } else if (titleLower.includes('glove')) {
      img = 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a'
    } else {
      const staticPics = [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
        'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
        'https://images.unsplash.com/photo-1601762603339-fd61e28b698a'
      ]
      img = staticPics[index % staticPics.length]
    }

    return {
      img,
      title: proj.title,
      desc: proj.description
    }
  })

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
      <div className="hero">
        <div className="hero-content">
          <h1>Handmade Knitting Artistry</h1>
          <p>Discover unique handcrafted knitting pieces made with love and care. Each creation tells its own story.</p>
          <a
            href="#gallery"
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault()
              onSectionChange('gallery')
            }}
          >
            Explore Gallery
          </a>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1679847628912-4c3e7402abc7" alt="Handmade knitting artistry" />
        </div>
      </div>

      {/* Featured Works */}
      <div className="featured-works">
        <div className="container">
          <h2>Featured Works</h2>
          {loading && <p style={{ textAlign: 'center', color: '#6c757d' }}>Memuat data...</p>}
          {!loading && featuredWorks.length === 0 && (
            <p style={{ textAlign: 'center', color: '#6c757d' }}>Belum ada karya yang ditampilkan.</p>
          )}
          <div className="works-grid">
            {featuredWorks.map((work, index) => (
              <div
                key={index}
                className="work-card"
                style={{
                  opacity: animate ? 1 : 0,
                  transform: animate ? 'translateY(0)' : 'translateY(20px)',
                  transition: animate ? `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s` : 'none'
                }}
              >
                <img src={work.img} alt={work.title} />
                <div className="work-info">
                  <h3>{work.title}</h3>
                  <p>{work.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
