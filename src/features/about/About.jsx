import React, { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { fetchAboutContent, updateAboutContent } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function About({ isActive, user }) {
  const { showToast } = useNotification()
  
  const [aboutData, setAboutData] = useState({
    title: 'Passion & Dedikasi Dalam Setiap Helaian Benang',
    subtitle: 'Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.',
    paragraph1: 'Selamat datang di Toko Rajut. Kami percaya bahwa setiap produk rajutan memiliki jiwa dan cerita tersendiri. Kami mengkhususkan diri dalam pembuatan karya rajut tangan eksklusif seperti syal, topi, selimut bayi, hingga dekorasi rumah.',
    paragraph2: 'Setiap pasang tangan perajin kami merajut dengan teknik tradisional yang dipadukan dengan sentuhan estetika modern untuk menghadirkan produk berkualitas tinggi yang hangat dan penuh makna.',
    image_url: '/about-lion.jpg',
    badge_text: '⭐ Terpercaya Sejak 2024'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editMode, setEditMode] = useState('file')
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editP1, setEditP1] = useState('')
  const [editP2, setEditP2] = useState('')
  const [editBadge, setEditBadge] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editFile, setEditFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAboutData()
  }, [])

  const loadAboutData = async () => {
    try {
      const data = await fetchAboutContent()
      if (data && data.title) {
        setAboutData(data)
      }
    } catch (err) {
      console.warn('Using default about content:', err.message)
    }
  }

  const handleOpenEdit = () => {
    setEditTitle(aboutData.title || '')
    setEditSubtitle(aboutData.subtitle || '')
    setEditP1(aboutData.paragraph1 || '')
    setEditP2(aboutData.paragraph2 || '')
    setEditBadge(aboutData.badge_text || '')
    setEditImageUrl(aboutData.image_url || '')
    setEditFile(null)
    setEditMode('file')
    setIsEditing(true)
  }

  const handleSaveAbout = async (e) => {
    e.preventDefault()
    setSaving(true)
    showToast('☁️ Menyimpan perubahan ke Cloudflare D1 & Drive...', 'loading', 0)

    try {
      let result
      if (editMode === 'file' && editFile) {
        const formData = new FormData()
        formData.append('title', editTitle.trim())
        formData.append('subtitle', editSubtitle.trim())
        formData.append('paragraph1', editP1.trim())
        formData.append('paragraph2', editP2.trim())
        formData.append('badge_text', editBadge.trim())
        formData.append('image_file', editFile)
        result = await updateAboutContent(formData, true)
      } else {
        const payload = {
          title: editTitle.trim(),
          subtitle: editSubtitle.trim(),
          paragraph1: editP1.trim(),
          paragraph2: editP2.trim(),
          badge_text: editBadge.trim(),
          image_url: editImageUrl.trim()
        }
        result = await updateAboutContent(payload, false)
      }

      if (result && result.data) {
        setAboutData(result.data)
      } else {
        await loadAboutData()
      }

      showToast('✅ Halaman Tentang Kami berhasil diperbarui!', 'success')
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      showToast(`Gagal menyimpan: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const getFullImgUrl = (url) => {
    if (!url) return '/about-lion.jpg'
    const driveMatch = url.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
    if (driveMatch) {
      return `/api/drive-image/${driveMatch[1]}`
    }
    if (url.startsWith('/uploads/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return url
  }

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

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(15, 23, 42, 0.78)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    boxSizing: 'border-box'
  }

  const modalContentStyle = {
    background: '#ffffff',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '2rem 1.5rem',
    position: 'relative',
    boxSizing: 'border-box',
    border: '1px solid rgba(226, 232, 240, 0.8)'
  }

  return (
    <section id="about" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        {/* Header Title with Admin Action */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
          <h2>Tentang Toko Rajut</h2>
          <p className="section-subtitle">
            {aboutData.subtitle || 'Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.'}
          </p>

          {/* Admin Edit Button */}
          {user && user.role === 'admin' && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleOpenEdit}
                style={{
                  background: 'linear-gradient(135deg, #d2691e 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(210, 105, 30, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.2s ease'
                }}
              >
                ✏️ Edit Halaman Tentang Kami (Admin)
              </button>
            </div>
          )}
        </div>

        <div className="about-content">
          <div className="about-text" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: '#475569' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#d2691e', marginBottom: '1.25rem', fontWeight: '600' }}>
              {aboutData.title}
            </h3>
            <p style={{ marginBottom: '1.25rem' }}>
              {aboutData.paragraph1}
            </p>
            <p>
              {aboutData.paragraph2}
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
              {aboutData.badge_text || '⭐ Terpercaya Sejak 2024'}
            </div>
            <img
              src={getFullImgUrl(aboutData.image_url)}
              alt="About Toko Rajut Lion Mascot"
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'cover',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)'
              }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/about-lion.jpg'
              }}
            />
          </div>
        </div>

        {/* 4 Core Value Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
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

      {/* Admin Edit Modal */}
      {isEditing && (
        <div style={modalOverlayStyle} onClick={() => setIsEditing(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '700' }}>
              ✏️ Edit Konten Halaman Tentang Kami
            </h3>

            <form onSubmit={handleSaveAbout}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>Judul Utama</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Passion & Dedikasi Dalam Setiap Helaian Benang"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>Sub Judul (Subtitle)</label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  placeholder="Cerita di balik kehangatan dan keindahan seni rajut..."
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>Paragraf 1</label>
                <textarea
                  rows="3"
                  value={editP1}
                  onChange={(e) => setEditP1(e.target.value)}
                  placeholder="Isi paragraf pertama..."
                  required
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>Paragraf 2</label>
                <textarea
                  rows="3"
                  value={editP2}
                  onChange={(e) => setEditP2(e.target.value)}
                  placeholder="Isi paragraf kedua..."
                  required
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem' }}>Teks Badge Mengambang</label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  placeholder="⭐ Terpercaya Sejak 2024"
                  required
                />
              </div>

              {/* Mode Gambar (File / URL) */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'block', marginBottom: '0.75rem' }}>
                  Foto Tentang Kami
                </label>
                <div className="mode-pill-tabs" style={{ marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`mode-pill-btn ${editMode === 'file' ? 'active' : ''}`}
                    onClick={() => setEditMode('file')}
                  >
                    📁 Unggah Foto Baru ke Drive
                  </button>
                  <button
                    type="button"
                    className={`mode-pill-btn ${editMode === 'url' ? 'active' : ''}`}
                    onClick={() => setEditMode('url')}
                  >
                    🔗 Gunakan URL / Foto Lokal
                  </button>
                </div>

                {editMode === 'file' ? (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)}
                    style={{ border: '2px dashed #cbd5e1', padding: '10px', borderRadius: '10px', width: '100%', background: '#ffffff' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="/about-lion.jpg atau URL Drive"
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button type="submit" disabled={saving} style={{ flex: 1 }}>
                  {saving ? 'Menyimpan...' : '💾 Simpan ke Cloudflare D1'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
