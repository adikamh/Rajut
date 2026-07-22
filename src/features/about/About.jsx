import React from 'react'

export default function About({ isActive }) {
  const values = [
    {
      icon: '🧶',
      title: 'Kualitas Premium',
      desc: 'Menggunakan benang pilihan yang lembut, nyaman di kulit, dan tahan lama.'
    },
    {
      icon: '❤️',
      title: '100% Buatan Tangan',
      desc: 'Dibuat penuh ketelitian dan kasih sayang oleh perajin rajut berpengalaman.'
    },
    {
      icon: '🎨',
      title: 'Desain Custom',
      desc: 'Menerima pesanan custom warna, ukuran, dan pola sesuai dengan keinginan Anda.'
    },
    {
      icon: '✨',
      title: 'Sentuhan Estetis',
      desc: 'Kombinasi warna dan tekstur modern yang elegan untuk berbagai kesempatan.'
    }
  ]

  return (
    <section id="about" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2>Tentang Toko Rajut</h2>
          <p className="section-subtitle">
            Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.
          </p>
        </div>

        <div className="about-content">
          <div className="about-text" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#475569' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#d2691e', marginBottom: '1.25rem', fontWeight: '600' }}>
              Passion & Dedikasi Dalam Setiap Helaian Benang
            </h3>
            <p style={{ marginBottom: '1.25rem' }}>
              Selamat datang di <strong>Toko Rajut</strong>. Kami percaya bahwa setiap produk rajutan memiliki jiwa dan cerita tersendiri. Kami mengkhususkan diri dalam pembuatan karya rajut tangan eksklusif seperti syal, topi, selimut bayi, hingga dekorasi rumah.
            </p>
            <p>
              Setiap pasang tangan perajin kami merajut dengan teknik tradisional yang dipadukan dengan sentuhan estetika modern untuk menghadirkan produk berkualitas tinggi yang hangat dan penuh makna.
            </p>
          </div>

          <div className="about-image" style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '-15px',
              background: '#ffffff',
              padding: '12px 20px',
              borderRadius: '1rem',
              boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
              fontWeight: '600',
              color: '#d2691e',
              border: '1px solid #e2e8f0',
              zIndex: 2
            }}>
              ⭐ Terpercaya Sejak 2024
            </div>
            <img
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&fit=crop"
              alt="About Toko Rajut"
              style={{ width: '100%', borderRadius: '1.5rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)' }}
            />
          </div>
        </div>

        {/* 4 Core Value Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {values.map((v, i) => (
            <div
              key={i}
              style={{
                background: '#ffffff',
                padding: '2rem 1.5rem',
                borderRadius: '1.25rem',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                textAlign: 'center',
                transition: 'transform 0.3s ease'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{v.icon}</div>
              <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: '600' }}>
                {v.title}
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
