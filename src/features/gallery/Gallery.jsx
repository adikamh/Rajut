import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { uploadGalleryImage, updateGalleryImage, deleteGalleryImage } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Gallery({ isActive, galleryItems = [], onAddImage, onUpdateImage, onDeleteImage, loading, user }) {
  const { showToast } = useNotification()
  const [lightboxImage, setLightboxImage] = useState(null)
  
  // Creation States
  const [uploadMode, setUploadMode] = useState('file')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Edit States
  const [editingItem, setEditingItem] = useState(null)
  const [editMode, setEditMode] = useState('file')
  const [editUrlInput, setEditUrlInput] = useState('')
  const [editSelectedFile, setEditSelectedFile] = useState(null)
  const [updating, setUpdating] = useState(false)

  // Custom Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditSelectedFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    showToast('Sedang mengunggah foto ke Google Drive...', 'loading', 0)

    try {
      let result
      if (uploadMode === 'file') {
        if (!selectedFile) {
          showToast('Silakan pilih file gambar terlebih dahulu!', 'error')
          setUploading(false)
          return
        }
        result = await uploadGalleryImage(selectedFile, true)
      } else {
        if (!imageUrlInput.trim()) {
          showToast('Silakan masukkan URL gambar terlebih dahulu!', 'error')
          setUploading(false)
          return
        }
        result = await uploadGalleryImage(imageUrlInput.trim(), false)
      }

      onAddImage(result)
      setImageUrlInput('')
      setSelectedFile(null)
      const fileInput = document.getElementById('galleryFileInput')
      if (fileInput) fileInput.value = ''
      
      showToast('Foto berhasil ditambahkan ke galeri!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal mengunggah gambar: ${err.message}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setUpdating(true)
    showToast('Sedang menyimpan perubahan...', 'loading', 0)

    try {
      let result
      if (editMode === 'file') {
        if (!editSelectedFile) {
          showToast('Silakan pilih file gambar terlebih dahulu atau gunakan mode URL!', 'error')
          setUpdating(false)
          return
        }
        result = await updateGalleryImage(editingItem.id, editSelectedFile, true)
      } else {
        if (!editUrlInput.trim()) {
          showToast('Silakan masukkan URL gambar terlebih dahulu!', 'error')
          setUpdating(false)
          return
        }
        result = await updateGalleryImage(editingItem.id, editUrlInput.trim(), false)
      }

      onUpdateImage(result)
      setEditingItem(null)
      setEditUrlInput('')
      setEditSelectedFile(null)
      showToast('Foto berhasil diperbarui!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal mengubah gambar: ${err.message}`, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const confirmDeleteGalleryImage = async (id) => {
    setDeleteConfirmId(null)
    showToast('Sedang menghapus foto dari Drive...', 'loading', 0)

    try {
      await deleteGalleryImage(id)
      onDeleteImage(id)
      showToast('Foto berhasil dihapus dari galeri & Google Drive!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal menghapus foto: ${err.message}`, 'error')
    }
  }

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&fit=crop'

  const getFullImgUrl = (url) => {
    if (!url) return FALLBACK_IMAGE

    // Auto-convert any Google Drive URL into proxy stream URL
    const driveMatch = url.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
    if (driveMatch && driveMatch[1]) {
      return `/api/drive-image/${driveMatch[1]}`
    }

    if (url.startsWith('http')) return url
    return url.startsWith('/') ? url : `/${url}`
  }


  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.25s ease-out',
    padding: '20px',
    boxSizing: 'border-box'
  }

  const modalContentStyle = {
    background: '#ffffff',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '520px',
    width: '100%',
    padding: '2.25rem',
    position: 'relative',
    boxSizing: 'border-box',
    border: '1px solid rgba(226, 232, 240, 0.8)'
  }

  return (
    <section id="gallery" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>Galeri Produk Rajut</h2>
          <p className="section-subtitle">
            Koleksi karya rajutan tangan eksklusif buatan Toko Rajut dengan benang berkualitas tinggi.
          </p>
        </div>

        {/* Upload Form Panel - Render only for admin */}
        {user && user.role === 'admin' && (
          <div className="upload-panel-card">
            <h3 style={{ fontSize: '1.2rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '600' }}>
              ✨ Unggah Foto Baru (Admin)
            </h3>

            {/* Mode Pill Switcher */}
            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMode('file')}
              >
                📁 Unggah File
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'url' ? 'active' : ''}`}
                onClick={() => setUploadMode('url')}
              >
                🔗 Gunakan URL
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {uploadMode === 'file' ? (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="galleryFileInput" style={{ fontWeight: '500', color: '#1e293b' }}>
                    Pilih File Foto
                  </label>
                  <input
                    type="file"
                    id="galleryFileInput"
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/heic,image/heif,.heic,.heif"
                    onChange={handleFileChange}
                    style={{ border: '2px dashed #cbd5e1', padding: '14px', borderRadius: '12px', width: '100%', background: '#f8fafc', cursor: 'pointer' }}
                    required
                  />
                  <div className="format-tags-wrapper">
                    <span className="format-pill">JPG</span>
                    <span className="format-pill">PNG</span>
                    <span className="format-pill">WEBP</span>
                    <span className="format-pill">HEIC (iPhone)</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto' }}>Direct Google Drive HD Sync</span>
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="galleryUrlInput" style={{ fontWeight: '500', color: '#1e293b' }}>
                    Masukkan URL Gambar
                  </label>
                  <input
                    type="url"
                    id="galleryUrlInput"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" disabled={uploading} style={{ width: '100%', marginTop: '0.75rem' }}>
                {uploading ? 'Mengunggah ke Drive...' : '📤 Tambahkan ke Galeri'}
              </Button>
            </form>
          </div>
        )}

        {/* Gallery Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Memuat data galeri...</p>}
        
        {!loading && galleryItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧶</div>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.5rem' }}>Belum Ada Foto di Galeri</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
              {user && user.role === 'admin'
                ? 'Gunakan form di atas untuk mengunggah foto rajutan pertama Anda ke Google Drive.'
                : 'Foto produk rajutan terbaru akan segera ditampilkan di sini.'}
            </p>
          </div>
        )}

        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div key={item.id || index} className="gallery-card">
              <span className="gallery-badge">🧶 Rajutan</span>

              {/* Admin Actions Glass Pills */}
              {user && user.role === 'admin' && (
                <div className="admin-glass-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="admin-icon-btn edit"
                    title="Edit Foto"
                    onClick={() => {
                      setEditingItem(item)
                      if (item.image_url.startsWith('http')) {
                        setEditMode('url')
                        setEditUrlInput(item.image_url)
                      } else {
                        setEditMode('file')
                      }
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn delete"
                    title="Hapus Foto"
                    onClick={() => setDeleteConfirmId(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              )}

              <div
                className="gallery-card-img-wrapper"
                onClick={() => setLightboxImage(getFullImgUrl(item.image_url))}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={getFullImgUrl(item.image_url)}
                  alt={`Karya Rajut ${index + 1}`}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = FALLBACK_IMAGE
                  }}
                />
                
                <div className="gallery-card-overlay">
                  <button type="button" className="gallery-zoom-btn">
                    🔍 Perbesar Foto
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Enlarged Image Modal */}
      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
            padding: '20px'
          }}
          onClick={() => setLightboxImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '900px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Detail Foto Rajut"
              style={{
                maxHeight: '80vh',
                maxWidth: '100%',
                borderRadius: '1.25rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                objectFit: 'contain'
              }}
            />
            <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              🔒 HD Image Streamed via Google Drive API
            </div>
          </div>
        </div>
      )}

      {/* Edit Gallery Item Modal */}
      {editingItem && (
        <div style={modalOverlayStyle} onClick={() => setEditingItem(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '600' }}>
              Edit Foto Galeri
            </h3>

            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${editMode === 'file' ? 'active' : ''}`}
                onClick={() => setEditMode('file')}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${editMode === 'url' ? 'active' : ''}`}
                onClick={() => setEditMode('url')}
              >
                Gunakan URL
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              {editMode === 'file' ? (
                <div className="form-group">
                  <label htmlFor="editGalleryFileInput" style={{ fontWeight: '500', color: '#1e293b' }}>
                    Pilih File Gambar Baru
                  </label>
                  <input
                    type="file"
                    id="editGalleryFileInput"
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/heic,image/heif,.heic,.heif"
                    onChange={handleEditFileChange}
                    style={{ border: '2px dashed #cbd5e1', padding: '12px', borderRadius: '12px', width: '100%', background: '#f8fafc' }}
                    required={!editingItem.image_url}
                  />
                  <div className="format-tags-wrapper">
                    <span className="format-pill">JPG</span>
                    <span className="format-pill">PNG</span>
                    <span className="format-pill">WEBP</span>
                    <span className="format-pill">HEIC</span>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="editGalleryUrlInput" style={{ fontWeight: '500', color: '#1e293b' }}>
                    Masukkan URL Gambar Baru
                  </label>
                  <input
                    type="url"
                    id="editGalleryUrlInput"
                    placeholder="https://example.com/image.jpg"
                    value={editUrlInput}
                    onChange={(e) => setEditUrlInput(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
                <Button type="submit" disabled={updating} style={{ flex: 1 }}>
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirmId(null)}>
          <div style={{ ...modalContentStyle, maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗑️</div>
            <h3 style={{ fontSize: '1.2rem', color: '#dc3545', marginBottom: '0.5rem', fontWeight: '600' }}>
              Hapus Foto Galeri & Drive?
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.75rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus foto ini? File fisik di <strong>Google Drive</strong> juga akan dihapus permanen.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => confirmDeleteGalleryImage(deleteConfirmId)}
                style={{
                  flex: 1,
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Hapus Foto
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
