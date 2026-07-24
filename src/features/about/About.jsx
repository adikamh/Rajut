import React, { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { fetchAboutContent, updateAboutContent } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

const StarIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const EditIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const YarnIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', margin: '0 auto' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
    <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
    <path d="M2 12h20" />
  </svg>
)

const HeartIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', margin: '0 auto' }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const PaletteIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', margin: '0 auto' }}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 2.21.896 4.21 2.344 5.656C4.83 18.14 5 18.77 5 19.5c0 1.38 1.12 2.5 2.5 2.5h4.5z" />
    <circle cx="7.5" cy="10.5" r="1.5" />
    <circle cx="11.5" cy="7.5" r="1.5" />
    <circle cx="16.5" cy="9.5" r="1.5" />
    <circle cx="15.5" cy="14.5" r="1.5" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d2691e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', margin: '0 auto' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

export default function About({ isActive, user }) {
  const { showToast } = useNotification()
  
  const [aboutData, setAboutData] = useState({
    title: 'Passion & Dedikasi Dalam Setiap Helaian Benang',
    subtitle: 'Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.',
    paragraph1: 'Selamat datang di Toko Rajut. Kami percaya bahwa setiap produk rajutan memiliki jiwa dan cerita tersendiri. Kami mengkhususkan diri dalam pembuatan karya rajut tangan eksklusif seperti syal, topi, selimut bayi, hingga dekorasi rumah.',
    paragraph2: 'Setiap pasang tangan perajin kami merajut dengan teknik tradisional yang dipadukan dengan sentuhan estetika modern untuk menghadirkan produk berkualitas tinggi yang hangat dan penuh makna.',
    image_url: '/about-lion.jpg',
    badge_text: 'Terpercaya Sejak 2024'
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
    showToast('Menyimpan perubahan ke Cloudflare D1 & Drive...', 'loading', 0)

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

      showToast('Halaman Tentang Kami berhasil diperbarui!', 'success')
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
      icon: <YarnIcon />,
      title: 'Kualitas Premium',
      desc: 'Menggunakan benang pilihan yang lembut, nyaman di kulit, dan tahan lama.'
    },
    {
      icon: <HeartIcon />,
      title: '100% Buatan Tangan',
      desc: 'Dibuat penuh ketelitian dan kasih sayang oleh perajin rajut berpengalaman.'
    },
    {
      icon: <PaletteIcon />,
      title: 'Desain Custom',
      desc: 'Menerima pesanan custom warna, ukuran, dan pola sesuai dengan keinginan Anda.'
    },
    {
      icon: <SparkleIcon />,
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
                <EditIcon color="#ffffff" /> Edit Halaman Tentang Kami (Admin)
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
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <StarIcon color="#d2691e" /> {aboutData.badge_text || 'Terpercaya Sejak 2024'}
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
                transition: 'transform 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>{v.icon}</div>
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
              <EditIcon color="#d2691e" /> Edit Konten Halaman Tentang Kami
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
                  placeholder="Terpercaya Sejak 2024"
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
                    <FileIcon /> Unggah Foto Baru ke Drive
                  </button>
                  <button
                    type="button"
                    className={`mode-pill-btn ${editMode === 'url' ? 'active' : ''}`}
                    onClick={() => setEditMode('url')}
                  >
                    <LinkIcon /> Gunakan URL / Foto Lokal
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
                  {saving ? 'Menyimpan...' : <><SaveIcon /> Simpan ke Cloudflare D1</>}
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
