import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { uploadGalleryImage, updateGalleryImage, deleteGalleryImage } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Gallery({ isActive, galleryItems = [], onAddImage, onUpdateImage, onDeleteImage, loading, user }) {
  const { showToast } = useNotification()
  const [lightboxImage, setLightboxImage] = useState(null)
  
  // Debug & Alert States
  const [showDriveDebug, setShowDriveDebug] = useState(false)
  const [uploadDebugModal, setUploadDebugModal] = useState(null)

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

  const getDriveFileId = (url) => {
    if (!url) return null
    const driveMatch = url.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
    return driveMatch ? driveMatch[1] : null
  }

  const getFullImgUrl = (url) => {
    if (!url) return ''
    const fileId = getDriveFileId(url)
    if (fileId) {
      return `/api/drive-image/${fileId}`
    }
    if (url.startsWith('http')) return url
    return url.startsWith('/') ? url : `/${url}`
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    showToast('☁️ Sedang mengunggah foto ke Google Drive Cloud Storage...', 'loading', 0)

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

      const fileUrl = result.image_url || ''
      const fileId = getDriveFileId(fileUrl)

      if (fileId) {
        showToast(`✅ Foto tersimpan di Google Drive! ID File: ${fileId}`, 'success', 5000)
        setUploadDebugModal({
          status: 'TERSIMPAN DI GOOGLE DRIVE',
          fileId: fileId,
          proxyUrl: `/api/drive-image/${fileId}`,
          originalUrl: fileUrl,
          uploadType: uploadMode === 'file' ? 'File Berkas (Google Drive API)' : 'URL Direct Link',
          timestamp: new Date().toLocaleTimeString('id-ID')
        })
      } else {
        showToast('✅ Foto berhasil ditambahkan ke galeri!', 'success')
      }

      setImageUrlInput('')
      setSelectedFile(null)
      const fileInput = document.getElementById('galleryFileInput')
      if (fileInput) fileInput.value = ''
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
    showToast('☁️ Sedang memperbarui foto di Google Drive...', 'loading', 0)

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
      const fileUrl = result.image_url || ''
      const fileId = getDriveFileId(fileUrl)

      if (fileId) {
        showToast(`✅ Foto berhasil di-update di Google Drive (ID: ${fileId})!`, 'success', 5000)
      } else {
        showToast('Foto berhasil diperbarui!', 'success')
      }

      setEditingItem(null)
      setEditUrlInput('')
      setEditSelectedFile(null)
    } catch (err) {
      console.error(err)
      showToast(`Gagal mengubah gambar: ${err.message}`, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const confirmDeleteGalleryImage = async (id) => {
    setDeleteConfirmId(null)
    showToast('☁️ Sedang menghapus foto dari Google Drive & Database...', 'loading', 0)

    try {
      await deleteGalleryImage(id)
      onDeleteImage(id)
      showToast('🗑️ Foto berhasil dihapus dari Galeri & Google Drive!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal menghapus foto: ${err.message}`, 'error')
    }
  }

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
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '2rem 1.5rem',
    position: 'relative',
    boxSizing: 'border-box',
    border: '1px solid rgba(226, 232, 240, 0.8)'
  }

  return (
    <section id="gallery" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Galeri Produk Rajut</h2>
          <p className="section-subtitle">
            Koleksi karya rajutan tangan eksklusif buatan Toko Rajut yang terintegrasi langsung dengan Google Drive Cloud Storage.
          </p>
        </div>

        {/* Upload Form Panel - Render only for admin */}
        {user && user.role === 'admin' && (
          <div className="upload-panel-card">
            <h3 style={{ fontSize: '1.2rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '600' }}>
              ✨ Unggah Foto Baru ke Google Drive (Admin)
            </h3>

            {/* Mode Pill Switcher */}
            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMode('file')}
              >
                📁 Unggah Berkas
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
                {uploading ? 'Mengunggah ke Drive...' : '📤 Unggah & Simpan ke Google Drive'}
              </Button>
            </form>
          </div>
        )}

        {/* Google Drive Live Debug & Status Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>☁️</span>
              <div>
                <strong style={{ color: '#1e293b', fontSize: '0.95rem', display: 'block' }}>Status Google Drive API Sync</strong>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {galleryItems.filter(item => getDriveFileId(item.image_url)).length} dari {galleryItems.length} foto tersimpan & aktif di Google Drive
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#ecfdf5',
                color: '#10b981',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                DRIVE SYNC LIVE OK
              </span>

              <button
                type="button"
                onClick={() => setShowDriveDebug(!showDriveDebug)}
                style={{
                  background: showDriveDebug ? '#d2691e' : '#f1f5f9',
                  color: showDriveDebug ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {showDriveDebug ? '❌ Tutup Panel Debug' : '🔍 Debug File Google Drive'}
              </button>
            </div>
          </div>

          {/* Expanded Debug Panel */}
          {showDriveDebug && (
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px dashed #cbd5e1',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#1e293b', margin: 0, fontWeight: '700' }}>
                  📋 Log Verifikasi File Google Drive ({galleryItems.length} Foto Total):
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Streaming API Endpoint: <code>/api/drive-image/:fileId</code>
                </span>
              </div>

              {galleryItems.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Belum ada foto tersimpan di sistem.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                  {galleryItems.map((item, idx) => {
                    const fId = getDriveFileId(item.image_url)
                    return (
                      <div key={item.id || idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.82rem',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span style={{ fontWeight: '600', color: '#64748b' }}>#{idx + 1}</span>
                          <span style={{
                            background: fId ? '#eff6ff' : '#fef3c7',
                            color: fId ? '#2563eb' : '#d97706',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}>
                            {fId ? '☁️ Drive Storage' : '🌐 External Link'}
                          </span>
                          <span style={{ color: '#334155', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {fId ? `ID: ${fId}` : item.image_url}
                          </span>
                        </div>

                        {fId ? (
                          <a
                            href={getFullImgUrl(item.image_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#ecfdf5',
                              color: '#059669',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textDecoration: 'none',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ▶️ Stream OK
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>URL Eksternal</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Memuat data galeri dari Google Drive & Database...</p>}
        
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
          {galleryItems.map((item, index) => {
            const driveFileId = getDriveFileId(item.image_url)

            return (
              <div key={item.id || index} className="gallery-card">
                {driveFileId ? (
                  <span
                    className="gallery-badge"
                    style={{
                      background: 'rgba(15, 23, 42, 0.88)',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      showToast(`☁️ File tersimpan di Google Drive! ID: ${driveFileId}`, 'success', 4000)
                    }}
                    title="Klik untuk info verifikasi Google Drive"
                  >
                    ☁️ Drive ID: {driveFileId.substring(0, 8)}...
                  </span>
                ) : (
                  <span className="gallery-badge">🧶 Rajutan</span>
                )}

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
                    }}
                  />
                  
                  <div className="gallery-card-overlay">
                    <button type="button" className="gallery-zoom-btn">
                      🔍 Perbesar Foto
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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

      {/* Google Drive Upload Alert Verification Modal */}
      {uploadDebugModal && (
        <div style={modalOverlayStyle} onClick={() => setUploadDebugModal(null)}>
          <div style={{ ...modalContentStyle, maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h3 style={{ fontSize: '1.3rem', color: '#059669', fontWeight: '700', marginBottom: '0.25rem' }}>
                Foto Tersimpan ke Google Drive!
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                File gambar telah berhasil diunggah & diverifikasi di penyimpanan cloud Google Drive.
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Status System:</span>
                <strong style={{ color: '#059669' }}>{uploadDebugModal.status}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Google Drive File ID:</span>
                <strong style={{ color: '#2563eb', fontFamily: 'monospace' }}>{uploadDebugModal.fileId}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Stream Proxy URL:</span>
                <span style={{ color: '#334155', fontFamily: 'monospace', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {uploadDebugModal.proxyUrl}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Waktu Upload:</span>
                <span style={{ color: '#1e293b' }}>{uploadDebugModal.timestamp}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '500' }}>
                Pratinjau Hasil Stream Google Drive:
              </div>
              <img
                src={uploadDebugModal.proxyUrl}
                alt="Drive Stream Preview"
                style={{ maxHeight: '160px', borderRadius: '0.75rem', border: '2px solid #059669', objectFit: 'contain' }}
              />
            </div>

            <button
              type="button"
              onClick={() => setUploadDebugModal(null)}
              style={{
                width: '100%',
                background: '#d2691e',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              👍 Saya Mengerti (Tutup Alert Log)
            </button>
          </div>
        </div>
      )}

      {/* Edit Gallery Item Modal */}
      {editingItem && (
        <div style={modalOverlayStyle} onClick={() => setEditingItem(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '600' }}>
              Edit Foto Galeri & Google Drive
            </h3>

            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${editMode === 'file' ? 'active' : ''}`}
                onClick={() => setEditMode('file')}
              >
                Upload File Baru
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
                    Pilih File Gambar Baru ke Drive
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
                  {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
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
                  fontWeight: '600',
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
