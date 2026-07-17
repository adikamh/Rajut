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
    showToast('Sedang mengunggah foto...', 'loading', 0)

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
      
      showToast('Gambar berhasil ditambahkan ke galeri!', 'success')
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
      showToast('Gambar berhasil diubah!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal mengubah gambar: ${err.message}`, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const confirmDeleteGalleryImage = async (id) => {
    setDeleteConfirmId(null)
    showToast('Sedang menghapus foto...', 'loading', 0)

    try {
      await deleteGalleryImage(id)
      onDeleteImage(id)
      showToast('Foto berhasil dihapus dari galeri!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal menghapus foto: ${err.message}`, 'error')
    }
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    cursor: 'pointer'
  }

  const enlargedImgStyle = {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
    borderRadius: '1rem'
  }

  const getFullImgUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
  }

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'slideUp 0.3s ease-out',
    padding: '20px',
    boxSizing: 'border-box'
  }

  const modalContentStyle = {
    background: 'white',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    maxWidth: '500px',
    width: '100%',
    padding: '2rem',
    position: 'relative',
    boxSizing: 'border-box'
  }

  return (
    <section id="gallery" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <h2>Gallery</h2>

        {/* Upload Form Panel - Render only for admin */}
        {user && user.role === 'admin' && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            marginBottom: '3rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#d2691e', marginBottom: '1.5rem', textAlign: 'center' }}>
              Unggah Foto Baru ke Galeri (Admin Only)
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => { setUploadMode('file'); }}
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '0.9rem',
                  background: uploadMode === 'file' ? '#d2691e' : '#e9ecef',
                  color: uploadMode === 'file' ? 'white' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => { setUploadMode('url'); }}
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '0.9rem',
                  background: uploadMode === 'url' ? '#d2691e' : '#e9ecef',
                  color: uploadMode === 'url' ? 'white' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Gunakan URL
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {uploadMode === 'file' ? (
                <div className="form-group">
                  <label htmlFor="galleryFileInput" style={{ fontWeight: '500' }}>Pilih File Gambar</label>
                  <input
                    type="file"
                    id="galleryFileInput"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ border: 'none', padding: '10px 0' }}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="galleryUrlInput" style={{ fontWeight: '500' }}>Masukkan URL Gambar</label>
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

              <Button type="submit" disabled={uploading} style={{ width: '100%', marginTop: '1rem' }}>
                {uploading ? 'Mengunggah...' : 'Tambahkan ke Galeri'}
              </Button>
            </form>
          </div>
        )}

        {/* Gallery Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#6c757d' }}>Memuat data galeri...</p>}
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <div
              key={item.id || index}
              className="gallery-item"
              onClick={() => setLightboxImage(getFullImgUrl(item.image_url))}
            >
              <img src={getFullImgUrl(item.image_url)} alt={`Gallery item ${index + 1}`} />
              
              {/* Admin actions overlay */}
              {user && user.role === 'admin' && (
                <div className="gallery-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="gallery-action-btn edit"
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
                    className="gallery-action-btn delete"
                    title="Hapus Foto"
                    onClick={() => setDeleteConfirmId(item.id)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {lightboxImage && (
        <div style={overlayStyle} onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Enlarged gallery item" style={enlargedImgStyle} />
        </div>
      )}

      {/* Edit Gallery Item Modal */}
      {editingItem && (
        <div style={modalOverlayStyle} onClick={() => setEditingItem(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', color: '#d2691e', marginBottom: '1.5rem', textAlign: 'center' }}>
              Edit Foto Galeri
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setEditMode('file')}
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '0.9rem',
                  background: editMode === 'file' ? '#d2691e' : '#e9ecef',
                  color: editMode === 'file' ? 'white' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditMode('url')}
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '0.9rem',
                  background: editMode === 'url' ? '#d2691e' : '#e9ecef',
                  color: editMode === 'url' ? 'white' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Gunakan URL
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              {editMode === 'file' ? (
                <div className="form-group">
                  <label htmlFor="editGalleryFileInput" style={{ fontWeight: '500' }}>Pilih File Gambar Baru</label>
                  <input
                    type="file"
                    id="editGalleryFileInput"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    style={{ border: 'none', padding: '10px 0' }}
                    required={!editingItem.image_url}
                  />
                  {editingItem.image_url && !editingItem.image_url.startsWith('http') && (
                    <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
                      File saat ini: {editingItem.image_url}
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="editGalleryUrlInput" style={{ fontWeight: '500' }}>Masukkan URL Gambar Baru</label>
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" disabled={updating} style={{ flex: 1 }}>
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{ flex: 1, background: '#e9ecef', color: '#1a1a1a' }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Premium Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirmId(null)}>
          <div style={{ ...modalContentStyle, maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', color: '#dc3545', marginBottom: '1rem', textAlign: 'center' }}>
              Hapus Foto Galeri?
            </h3>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus foto ini dari galeri? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn"
                onClick={() => confirmDeleteGalleryImage(deleteConfirmId)}
                style={{
                  flex: 1,
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1,
                  background: '#e9ecef',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: '500',
                  cursor: 'pointer'
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
