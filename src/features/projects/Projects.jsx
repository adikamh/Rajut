import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { createProject, updateProject, deleteProject } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Projects({ isActive, projectsList = [], onAddProject, onUpdateProject, onDeleteProject, loading, user }) {
  const { showToast } = useNotification()
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0)
  
  // Creation States
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadMode, setUploadMode] = useState('file')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Edit States
  const [editingProject, setEditingProject] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editUploadMode, setEditUploadMode] = useState('file')
  const [editImageUrlInput, setEditImageUrlInput] = useState('')
  const [editSelectedFiles, setEditSelectedFiles] = useState([])
  const [updating, setUpdating] = useState(false)

  // Custom Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      showToast('Judul dan deskripsi harus diisi!', 'error')
      return
    }

    setSubmitting(true)
    showToast('Sedang mengunggah foto-foto proyek ke Google Drive...', 'loading', 0)

    try {
      let result
      if (uploadMode === 'file') {
        if (selectedFiles.length === 0) {
          showToast('Silakan pilih minimal 1 foto proyek!', 'error')
          setSubmitting(false)
          return
        }
        result = await createProject(
          title.trim(), 
          description.trim(), 
          selectedFiles,
          true
        )
      } else {
        if (!imageUrlInput.trim()) {
          showToast('Silakan masukkan URL foto proyek!', 'error')
          setSubmitting(false)
          return
        }
        result = await createProject(
          title.trim(), 
          description.trim(), 
          imageUrlInput.trim(), 
          false
        )
      }

      onAddProject(result)
      setTitle('')
      setDescription('')
      setImageUrlInput('')
      setSelectedFiles([])
      const fileInput = document.getElementById('projectFileInput')
      if (fileInput) fileInput.value = ''

      showToast('Proyek baru dengan multiple foto berhasil ditambahkan!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal menyimpan proyek: ${err.message}`, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editTitle.trim() || !editDescription.trim()) {
      showToast('Judul dan deskripsi harus diisi!', 'error')
      return
    }

    setUpdating(true)
    showToast('Sedang menyimpan perubahan proyek...', 'loading', 0)

    try {
      let result
      if (editUploadMode === 'file') {
        result = await updateProject(
          editingProject.id,
          editTitle.trim(),
          editDescription.trim(),
          editSelectedFiles.length > 0 ? editSelectedFiles : null,
          editSelectedFiles.length > 0
        )
      } else {
        result = await updateProject(
          editingProject.id,
          editTitle.trim(),
          editDescription.trim(),
          editImageUrlInput.trim(),
          false
        )
      }

      onUpdateProject(result)
      setEditingProject(null)
      setEditTitle('')
      setEditDescription('')
      setEditImageUrlInput('')
      setEditSelectedFiles([])
      showToast('Proyek berhasil diperbarui!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal memperbarui proyek: ${err.message}`, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const confirmDeleteProject = async (id) => {
    setDeleteConfirmId(null)
    showToast('Sedang menghapus proyek & foto-foto di Drive...', 'loading', 0)

    try {
      await deleteProject(id)
      onDeleteProject(id)
      showToast('Proyek & foto berhasil dihapus!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal menghapus proyek: ${err.message}`, 'error')
    }
  }

  const getProjectImgUrls = (proj, index) => {
    if (proj && proj.image_url) {
      let rawUrls = []
      try {
        if (typeof proj.image_url === 'string' && proj.image_url.startsWith('[')) {
          rawUrls = JSON.parse(proj.image_url)
        } else {
          rawUrls = [proj.image_url]
        }
      } catch (e) {
        rawUrls = [proj.image_url]
      }

      return rawUrls.map(url => {
        const driveMatch = url.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
        if (driveMatch && driveMatch[1]) {
          return `/api/drive-image/${driveMatch[1]}`
        }
        if (url.startsWith('http')) return url
        return url.startsWith('/') ? url : `/${url}`
      })

    }

    const staticPics = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&fit=crop',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&fit=crop'
    ]
    return [staticPics[index % staticPics.length]]
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
    maxWidth: '660px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    border: '1px solid rgba(226, 232, 240, 0.8)'
  }

  return (
    <section id="projects" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2>Proyek Rajutan Kustom</h2>
          <p className="section-subtitle">
            Jelajahi berbagai proyek rajutan eksklusif kami. Setiap proyek dilengkapi dengan galeri foto multi-sudut.
          </p>
        </div>

        {/* Create Project Form Panel - Render only for admin */}
        {user && user.role === 'admin' && (
          <div className="upload-panel-card">
            <h3 style={{ fontSize: '1.2rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '600' }}>
              ✨ Tambah Proyek Baru (Multi-Photo Drive Sync)
            </h3>
            
            {/* Mode Pill Switcher */}
            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMode('file')}
              >
                📁 Unggah Beberapa File
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'url' ? 'active' : ''}`}
                onClick={() => setUploadMode('url')}
              >
                🔗 Gunakan URL
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="projectTitle" style={{ fontWeight: '500', color: '#1e293b' }}>Judul Proyek</label>
                <input
                  type="text"
                  id="projectTitle"
                  placeholder="Contoh: Selimut Bayi Kustom Motif Bunga"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {uploadMode === 'file' ? (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="projectFileInput" style={{ fontWeight: '500', color: '#1e293b' }}>
                    Pilih Foto-Foto Proyek (Bisa Pilih Banyak Sekaligus)
                  </label>
                  <input
                    type="file"
                    id="projectFileInput"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/heic,image/heif,.heic,.heif"
                    onChange={handleFileChange}
                    style={{ border: '2px dashed #cbd5e1', padding: '14px', borderRadius: '12px', width: '100%', background: '#f8fafc', cursor: 'pointer' }}
                  />
                  <div className="format-tags-wrapper">
                    <span className="format-pill" style={{ background: '#d2691e', color: 'white' }}>Multi-File Upload</span>
                    <span className="format-pill">JPG</span>
                    <span className="format-pill">PNG</span>
                    <span className="format-pill">WEBP</span>
                    <span className="format-pill">HEIC</span>
                    {selectedFiles.length > 0 && (
                      <span style={{ fontSize: '0.85rem', color: '#d2691e', fontWeight: '600', marginLeft: 'auto' }}>
                        {selectedFiles.length} foto dipilih
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="projectUrlInput" style={{ fontWeight: '500', color: '#1e293b' }}>URL Foto Proyek (Pisahkan dengan Koma / Baris Baru untuk Banyak Foto)</label>
                  <textarea
                    id="projectUrlInput"
                    placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{ minHeight: '80px' }}
                  ></textarea>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="projectDescription" style={{ fontWeight: '500', color: '#1e293b' }}>Deskripsi Lengkap Proyek</label>
                <textarea
                  id="projectDescription"
                  placeholder="Jelaskan jenis benang, ukuran, teknik pembuatan, dan keunikan proyek..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: '100px' }}
                  required
                ></textarea>
              </div>

              <Button type="submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Mengunggah ke Drive...' : `📤 Tambahkan Proyek ${selectedFiles.length > 1 ? `(${selectedFiles.length} Foto)` : ''}`}
              </Button>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Memuat data proyek...</p>}

        {!loading && projectsList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.5rem' }}>Belum Ada Proyek</h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>Daftar proyek kustom yang sedang dan telah diselesaikan akan tampil di sini.</p>
          </div>
        )}

        <div className="projects-grid">
          {projectsList.map((project, index) => {
            const urls = getProjectImgUrls(project, index)
            const coverUrl = urls[0]

            return (
              <div 
                key={project.id || index} 
                className="gallery-card"
                onClick={() => {
                  setSelectedProject({ ...project, urls })
                  setActiveModalImageIndex(0)
                }}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              >
                <div className="gallery-card-img-wrapper" style={{ paddingTop: '65%', position: 'relative' }}>
                  <img 
                    src={coverUrl} 
                    alt={project.title} 
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&fit=crop'
                    }}
                  />
                  <span className="gallery-badge">📦 Proyek</span>

                  {/* Multi-Photo Indicator Badge */}
                  {urls.length > 1 && (
                    <span style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      zIndex: 3,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                      📸 +{urls.length} Foto
                    </span>
                  )}

                  <div className="gallery-card-overlay">
                    <button type="button" className="gallery-zoom-btn">
                      📄 Detail ({urls.length} Foto)
                    </button>
                  </div>
                </div>

                <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: '600' }}>
                    {project.title}
                  </h3>
                  <p style={{
                    fontSize: '0.92rem',
                    color: '#64748b',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.55',
                    marginBottom: '1.25rem',
                    flexGrow: 1
                  }}>
                    {project.description}
                  </p>

                  {/* Admin edit/delete buttons inside the card */}
                  {user && user.role === 'admin' && (
                    <div 
                      style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(project)
                          setEditTitle(project.title)
                          setEditDescription(project.description)
                          setEditUploadMode('file')
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#fff3eb',
                          color: '#d2691e',
                          border: '1px solid rgba(210, 105, 30, 0.2)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✎ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(project.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#ffeef0',
                          color: '#dc3545',
                          border: '1px solid rgba(220, 53, 69, 0.2)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Project Detail Modal with Multi-Photo Gallery & Thumbnails */}
      {selectedProject && (
        <div style={modalOverlayStyle} onClick={() => setSelectedProject(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '340px', background: '#0f172a', overflow: 'hidden' }}>
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: 'none',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
              >
                ✕
              </button>
              
              {/* Main Image View */}
              <img 
                src={selectedProject.urls[activeModalImageIndex] || selectedProject.urls[0]} 
                alt={selectedProject.title} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&fit=crop'
                }}
              />

              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '14px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem'
              }}>
                Foto {activeModalImageIndex + 1} dari {selectedProject.urls.length}
              </div>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {/* Thumbnails Row if multi-photo */}
              {selectedProject.urls.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                  {selectedProject.urls.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt={`Thumbnail ${i + 1}`}
                      onClick={() => setActiveModalImageIndex(i)}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: activeModalImageIndex === i ? '3px solid #d2691e' : '2px solid #e2e8f0',
                        opacity: activeModalImageIndex === i ? 1 : 0.65,
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              )}

              <span className="format-pill" style={{ background: '#fff3eb', color: '#d2691e', marginBottom: '8px', display: 'inline-block' }}>
                📦 Proyek Rajut ({selectedProject.urls.length} Foto)
              </span>
              <h3 style={{ fontSize: '1.35rem', color: '#1e293b', marginBottom: '0.75rem', fontWeight: '700' }}>
                {selectedProject.title}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.96rem', lineHeight: '1.65', whiteSpace: 'pre-line' }}>
                {selectedProject.description}
              </p>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {user && user.role === 'admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const proj = selectedProject
                        setSelectedProject(null)
                        setEditingProject(proj)
                        setEditTitle(proj.title)
                        setEditDescription(proj.description)
                        setEditUploadMode('file')
                      }}
                      style={{
                        padding: '10px 18px',
                        background: '#fff3eb',
                        color: '#d2691e',
                        border: '1px solid rgba(210, 105, 30, 0.3)',
                        borderRadius: '10px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ✎ Edit Proyek
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const id = selectedProject.id
                        setSelectedProject(null)
                        setDeleteConfirmId(id)
                      }}
                      style={{
                        padding: '10px 18px',
                        background: '#ffeef0',
                        color: '#dc3545',
                        border: '1px solid rgba(220, 53, 69, 0.3)',
                        borderRadius: '10px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Hapus Proyek
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  style={{
                    padding: '10px 24px',
                    background: '#1e293b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div style={modalOverlayStyle} onClick={() => setEditingProject(null)}>
          <div style={{ ...modalContentStyle, padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', color: '#d2691e', marginBottom: '1.25rem', textAlign: 'center', fontWeight: '600' }}>
              Edit Proyek Rajut (Ganti Multi-Foto)
            </h3>

            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${editUploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setEditUploadMode('file')}
              >
                Upload File Baru
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${editUploadMode === 'url' ? 'active' : ''}`}
                onClick={() => setEditUploadMode('url')}
              >
                Gunakan URL
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="editProjectTitle" style={{ fontWeight: '500', color: '#1e293b' }}>Judul Proyek</label>
                <input
                  type="text"
                  id="editProjectTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              {editUploadMode === 'file' ? (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="editProjectFileInput" style={{ fontWeight: '500', color: '#1e293b' }}>
                    Ganti Foto-Foto Proyek (Pilih Beberapa Sekaligus)
                  </label>
                  <input
                    type="file"
                    id="editProjectFileInput"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/heic,image/heif,.heic,.heif"
                    onChange={handleEditFileChange}
                    style={{ border: '2px dashed #cbd5e1', padding: '10px', borderRadius: '10px', width: '100%' }}
                  />
                  {editSelectedFiles.length > 0 && (
                    <small style={{ color: '#d2691e', fontWeight: '600', display: 'block', marginTop: '4px' }}>
                      {editSelectedFiles.length} foto baru dipilih
                    </small>
                  )}
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="editProjectUrlInput" style={{ fontWeight: '500', color: '#1e293b' }}>Ganti URL Foto Proyek</label>
                  <textarea
                    id="editProjectUrlInput"
                    value={editImageUrlInput}
                    onChange={(e) => setEditImageUrlInput(e.target.value)}
                    style={{ minHeight: '80px' }}
                  ></textarea>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="editProjectDescription" style={{ fontWeight: '500', color: '#1e293b' }}>Deskripsi Proyek</label>
                <textarea
                  id="editProjectDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ minHeight: '90px' }}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button type="submit" disabled={updating} style={{ flex: 1 }}>
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
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
          <div style={{ ...modalContentStyle, maxWidth: '420px', padding: '2rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗑️</div>
            <h3 style={{ fontSize: '1.2rem', color: '#dc3545', marginBottom: '0.5rem', fontWeight: '600' }}>
              Hapus Proyek & Semua Foto Drive?
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.75rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus proyek ini? Semua file foto terkait proyek di <strong>Google Drive</strong> dan <strong>Galeri</strong> juga akan dihapus permanen.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => confirmDeleteProject(deleteConfirmId)}
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
                Hapus
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
