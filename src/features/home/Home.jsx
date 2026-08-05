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

const HeartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const YarnIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
    <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
    <path d="M2 12h20" />
  </svg>
)

const PaletteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 2.21.896 4.21 2.344 5.656C4.83 18.14 5 18.77 5 19.5c0 1.38 1.12 2.5 2.5 2.5h4.5z" />
    <circle cx="7.5" cy="10.5" r="1.5" />
    <circle cx="11.5" cy="7.5" r="1.5" />
    <circle cx="16.5" cy="9.5" r="1.5" />
    <circle cx="15.5" cy="14.5" r="1.5" />
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
  const minCopies = (featuredWorks && featuredWorks.length > 0) ? Math.ceil(8 / featuredWorks.length) + 1 : 2
  const marqueeItems = Array.from({ length: minCopies }, () => featuredWorks || []).flat()

  return (
    <section id="home" className={`section ${isActive ? 'active' : ''}`} style={{ padding: 0 }}>
      {/* Inject CSS once */}
      <style>{MARQUEE_CSS}</style>

      {/* ── Hero Section ── */}
      <div style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)',
        padding: '4rem 0 5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div style={{
              opacity: animate ? 1 : 0,
              transform: animate ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: '#ea580c',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '0.88rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.12)',
                border: '1px solid rgba(253, 186, 116, 0.4)'
              }}>
                <SparkleIcon /> Seni Rajut Handcrafted Indonesia
              </span>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: '800',
                lineHeight: '1.2',
                color: '#1e293b',
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em'
              }}>
                Kehangatan &amp; Keindahan Dalam Setiap Helaian Rajutan
              </h1>

              <p style={{
                color: '#475569',
                fontSize: '1.125rem',
                lineHeight: '1.7',
                marginBottom: '2.25rem',
                maxWidth: '540px'
              }}>
                Temukan koleksi aksesoris, pakaian, dan dekorasi buatan tangan eksklusif yang dirajut dengan cinta, ketelitian, dan benang kualitas terbaik.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <a
                  href="#gallery"
                  className="btn btn-primary"
                  onClick={(e) => { e.preventDefault(); onSectionChange('gallery') }}
                  style={{
                    padding: '14px 30px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    fontWeight: '700',
                    boxShadow: '0 8px 20px rgba(210, 105, 30, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <GalleryIcon /> Jelajahi Galeri
                </a>
                <a
                  href="#projects"
                  className="btn"
                  onClick={(e) => { e.preventDefault(); onSectionChange('projects') }}
                  style={{
                    padding: '14px 30px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <PackageIcon /> Lihat Proyek Rajut
                </a>
              </div>

              {/* Trust Badges Bar */}
              <div style={{
                display: 'flex',
                gap: '1.75rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ea580c', margin: 0 }}>100+</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontWeight: '600' }}>Karya Buatan Tangan</p>
                </div>
                <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '1.75rem' }}>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ea580c', margin: 0 }}>100%</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontWeight: '600' }}>Benang Premium</p>
                </div>
                <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '1.75rem' }}>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ea580c', margin: 0 }}>4.9 ★</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, fontWeight: '600' }}>Kepuasan Pelanggan</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Showcase */}
            <div style={{
              position: 'relative',
              textAlign: 'center',
              opacity: animate ? 1 : 0,
              transform: animate ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s'
            }}>
              {/* Main Banner Image */}
              <img
                src="/about-lion.jpg"
                alt="Handmade knitting artistry Dude Craft"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  maxHeight: '460px',
                  objectFit: 'cover',
                  borderRadius: '2rem',
                  boxShadow: '0 30px 60px -15px rgba(210,105,30,0.3)',
                  border: '6px solid #ffffff'
                }}
              />

              {/* Floating Badge 1 - Top Right */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '-10px',
                background: '#ffffff',
                padding: '10px 18px',
                borderRadius: '1rem',
                boxShadow: '0 12px 25px rgba(0,0,0,0.12)',
                fontWeight: '700',
                color: '#ea580c',
                fontSize: '0.85rem',
                border: '1px solid #ffedd5',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2
              }}>
                ⭐ 100% Handcrafted
              </div>

              {/* Floating Badge 2 - Bottom Left */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '-10px',
                background: '#ffffff',
                padding: '12px 20px',
                borderRadius: '1rem',
                boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
                fontWeight: '700',
                color: '#1e293b',
                fontSize: '0.88rem',
                border: '1px solid #ffedd5',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 2
              }}>
                <YarnIcon /> Benang Halus &amp; Awet
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Value Proposition Cards Section ── */}
      <div style={{ padding: '4.5rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              background: '#fff7ed',
              padding: '2.25rem 1.75rem',
              borderRadius: '1.5rem',
              border: '1px solid #ffedd5',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ marginBottom: '1.25rem' }}><YarnIcon /></div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: '700' }}>
                Kualitas Benang Premium
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Menggunakan benang pilihan yang sangat lembut, tidak panas di kulit, warna tahan lama, dan tidak gampang berbulu.
              </p>
            </div>

            <div style={{
              background: '#fff7ed',
              padding: '2.25rem 1.75rem',
              borderRadius: '1.5rem',
              border: '1px solid #ffedd5',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ marginBottom: '1.25rem' }}><HeartIcon /></div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: '700' }}>
                100% Buatan Tangan
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Dirajut penuh ketelitian dan kehangatan oleh perajin berpengalaman untuk menghasilkan karya unik yang bernilai seni.
              </p>
            </div>

            <div style={{
              background: '#fff7ed',
              padding: '2.25rem 1.75rem',
              borderRadius: '1.5rem',
              border: '1px solid #ffedd5',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <div style={{ marginBottom: '1.25rem' }}><PaletteIcon /></div>
              <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: '700' }}>
                Desain Custom &amp; Pola
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Bisa memesan rajutan custom sesuai warna, ukuran, dan motif karakter favorit Anda untuk hadiah spesial atau pemakaian sendiri.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Works Section (Marquee Slider) ── */}
      <div className="featured-works" style={{ padding: '4rem 0 5rem', background: '#f8fafc' }}>
        <div className="container">
          <div style={{
            textAlign: 'center', marginBottom: '3rem',
            opacity: animate ? 1 : 0, transform: animate ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <h2 style={{ fontSize: '2.25rem', color: '#1e293b', fontWeight: '800', marginBottom: '0.75rem' }}>
              Karya Unggulan Pilihan
            </h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', color: '#64748b' }}>
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
              style={{ gap: '1.5rem' }}>
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

        {/* CTA Button */}
        {!loading && featuredWorks.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <a href="#gallery" className="btn btn-primary"
              onClick={(e) => { e.preventDefault(); onSectionChange('gallery') }}
              style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              <GalleryIcon /> Lihat Semua di Galeri
            </a>
          </div>
        )}
      </div>

      {/* ── Lightbox Preview ── */}
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

