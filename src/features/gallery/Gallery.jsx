import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { uploadGalleryImage } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Gallery({ isActive, galleryItems = [], onAddImage, loading, user }) {
  const { showToast } = useNotification()
  const [lightboxImage, setLightboxImage] = useState(null)
  
  const [uploadMode, setUploadMode] = useState('file')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
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
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
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
            </div>
          ))}
        </div>
      </div>

      {lightboxImage && (
        <div style={overlayStyle} onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Enlarged gallery item" style={enlargedImgStyle} />
        </div>
      )}
    </section>
  )
}
