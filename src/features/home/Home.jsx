import React, { useState, useEffect } from 'react'

/* ── Inline keyframes injected once ── */
const MARQUEE_CSS = `
  @keyframes rajut-marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .rajut-marquee-track {
    display: flex;
    width: max-content;
    animation: rajut-marquee 18s linear infinite;
    will-change: transform;
  }
  .rajut-marquee-track.paused {
    animation-play-state: paused;
  }
  .rajut-card {
    position: relative;
    border-radius: 1.25rem;
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    width: 340px;
    background: #fff;
    box-shadow: 0 8px 24px -4px rgba(0,0,0,0.10);
    border: 1px solid rgba(226,232,240,0.8);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .rajut-card:hover {
    box-shadow: 0 16px 40px -8px rgba(210,105,30,0.25);
    transform: translateY(-4px) scale(1.015);
  }
  .rajut-card img {
    display: block;
    width: 100%;
    height: 260px;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  .rajut-card:hover img {
    transform: scale(1.07);
  }
  .rajut-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 55%);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 1.25rem;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .rajut-card:hover .rajut-card-overlay {
    opacity: 1;
  }
  /* Edge fade masks */
  .rajut-marquee-wrap::before,
  .rajut-marquee-wrap::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 80px;
    z-index: 2;
    pointer-events: none;
  }
  .rajut-marquee-wrap::before {
    left: 0;
    background: linear-gradient(to right, #f8f5f2, transparent);
  }
  .rajut-marquee-wrap::after {
    right: 0;
    background: linear-gradient(to left, #f8f5f2, transparent);
  }
`

/* ── Icons ── */
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/* ── Component ── */
export default function Home({ isActive, onSectionChange, featuredWorks = [], loading = false }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [paused, setPaused] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isActive) setTimeout(() => setAnimate(true), 80)
    else setAnimate(false)
  }, [isActive])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSelectedImage(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Duplicate items so marquee loops seamlessly (need at least 2 copies)
  const minCopies = featuredWorks.length > 0 ? Math.ceil(8 / featuredWorks.length) + 1 : 2
  const marqueeItems = Array.from({ length: minCopies }, () => featuredWorks).flat()

  return (
    <section id="home" className={`section ${isActive ? 'active' : ''}`}>
      {/* Inject CSS once */}
      <style>{MARQUEE_CSS}</style>

      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-content">
          <span style={{ display: 'inline-block', background: 'rgba(210,105,30,0.1)', color: '#d2691e', padding: '6px 14px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.25rem' }}>
            <SparkleIcon /> Seni Rajut Handcrafted Indonesia
          </span>
          <h1 style={{ lineHeight: '1.25', marginBottom: '1.25rem' }}>
            Kehangatan &amp; Keindahan dalam Setiap Helaian Rajutan
          </h1>
          <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Temukan koleksi aksesoris, pakaian, dan perlengkapan rajut buatan tangan eksklusif yang dibuat dengan cinta, ketelitian, dan benang premium pilihan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#gallery" className="btn btn-primary"
              onClick={(e) => { e.preventDefault(); onSectionChange('gallery') }}
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '10px' }}>
              <GalleryIcon /> Jelajahi Galeri
            </a>
            <a href="#projects" className="btn"
              onClick={(e) => { e.preventDefault(); onSectionChange('projects') }}
              style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '10px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1' }}>
              <PackageIcon /> Lihat Proyek Rajut
            </a>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/about-lion.jpg"
            alt="Handmade knitting artistry"
            style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(210,105,30,0.25)' }}
          />
        </div>
      </div>

      {/* ── Featured Works — Infinite Slow Marquee ── */}
      <div className="featured-works" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div className="container">
          <div style={{
            textAlign: 'center', marginBottom: '3rem',
            opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <h2>Karya Unggulan Pilihan</h2>
            <p className="section-subtitle">
              Hasil kreasi terbaik yang paling diminati oleh pelanggan setia Toko Rajut.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Memuat karya unggulan...</p>
        )}

        {/* Empty state */}
        {!loading && featuredWorks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontStyle: 'italic' }}>
            Belum ada karya di galeri. Tambahkan gambar melalui panel admin.
          </p>
        )}

        {/* Marquee */}
        {!loading && featuredWorks.length > 0 && (
          <div
            className="rajut-marquee-wrap"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '8px 0 16px',
              opacity: animate ? 1 : 0,
              transition: 'opacity 0.8s ease 0.2s',
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className={`rajut-marquee-track${paused ? ' paused' : ''}`}
              style={{ gap: '1.25rem' }}>
              {marqueeItems.map((work, idx) => (
                <div
                  key={`${work.id ?? idx}-${idx}`}
                  className="rajut-card"
                  onClick={() => setSelectedImage(work)}
                >
                  <img
                    src={work.image_url}
                    alt={`Karya Rajut #${(idx % featuredWorks.length) + 1}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/about-lion.jpg' }}
                  />
                  <div className="rajut-card-overlay">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ZoomIcon /> Lihat Full
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {!loading && featuredWorks.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="#gallery" className="btn btn-primary"
              onClick={(e) => { e.preventDefault(); onSectionChange('gallery') }}
              style={{ padding: '12px 28px', fontSize: '0.95rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <GalleryIcon /> Lihat Semua di Galeri
            </a>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute', top: '-16px', right: '-16px',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              title="Tutup (Escape)"
            >
              <CloseIcon />
            </button>
            <img
              src={selectedImage.image_url}
              alt="Preview"
              style={{
                maxWidth: '100%', maxHeight: '85vh',
                objectFit: 'contain', borderRadius: '16px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              }}
              onError={(e) => { e.target.onerror = null; e.target.src = '/about-lion.jpg' }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
