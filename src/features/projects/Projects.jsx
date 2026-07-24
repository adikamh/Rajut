import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { createProject, updateProject, deleteProject } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
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

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const PackageIcon = ({ size = 22, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: size > 20 ? '0' : '6px', ...style }}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
    <polygon points="12 22.08 21 17.08 21 6.92 12 12 12 22.08" />
    <polygon points="12 12 21 6.92 12 1.84 3 6.92 12 12" />
  </svg>
)

const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const DetailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const EditIcon = ({ size = 14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = ({ size = 14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

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

  const getProjectImgUrls = (proj) => {
    if (proj && proj.image_url) {
      let rawUrls = []
      try {
        if (typeof proj.image_url === 'string' && proj.image_url.startsWith('[')) {
          rawUrls = JSON.parse(proj.image_url)
        } else if (Array.isArray(proj.image_url)) {
          rawUrls = proj.image_url
        } else {
          rawUrls = [proj.image_url]
        }
      } catch (e) {
        rawUrls = [proj.image_url]
      }

      const formatted = rawUrls.map(url => {
        if (!url) return '/project-sample.jpg'
        const urlStr = String(url).trim()
        const driveMatch = urlStr.match(/(?:id=|\/d\/|file\/d\/|drive-image\/)([a-zA-Z0-9_-]{25,})/)
        if (driveMatch && driveMatch[1]) {
          return `/api/drive-image/${driveMatch[1]}`
        }
        if (urlStr.startsWith('http')) return urlStr
        return urlStr.startsWith('/') ? urlStr : `/${urlStr}`
      }).filter(Boolean)

      return formatted.length > 0 ? formatted : ['/project-sample.jpg']
    }

    return ['/project-sample.jpg']
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
              <SparkleIcon /> Tambah Proyek Baru (Multi-Photo Drive Sync)
            </h3>
            
            {/* Mode Pill Switcher */}
            <div className="mode-pill-tabs">
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'file' ? 'active' : ''}`}
                onClick={() => setUploadMode('file')}
              >
                <FileIcon /> Unggah Beberapa File
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${uploadMode === 'url' ? 'active' : ''}`}
                onClick={() => setUploadMode('url')}
              >
                <LinkIcon /> Gunakan URL
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
                {submitting ? 'Mengunggah ke Drive...' : <><UploadIcon /> Tambahkan Proyek {selectedFiles.length > 1 ? `(${selectedFiles.length} Foto)` : ''}</>}
              </Button>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Memuat data proyek...</p>}

        {!loading && projectsList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#ffffff', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <PackageIcon size={40} color="#64748b" />
            </div>
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
                <div className="gallery-image-container" style={{ paddingTop: '75%' }}>
                  <img 
                    src={coverUrl || '/project-sample.jpg'} 
                    alt={project.title} 
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/project-sample.jpg'
                    }}
                  />
                  <span className="gallery-badge"><PackageIcon size={14} color="#64748b" style={{ marginRight: '4px' }} /> Proyek</span>

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
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CameraIcon /> +{urls.length} Foto
                    </span>
                  )}

                  <div className="gallery-overlay">
                    <span className="gallery-zoom-icon">
                      <DetailIcon /> Detail ({urls.length} Foto)
                    </span>
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
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <EditIcon size={14} style={{ color: '#d2691e' }} /> Edit
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
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <TrashIcon size={14} style={{ color: '#dc3545' }} /> Hapus
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
                <CloseIcon />
              </button>
              
              {/* Main Image View */}
              <img 
                src={selectedProject.urls[activeModalImageIndex] || selectedProject.urls[0]} 
                alt={selectedProject.title} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null
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

              <span className="format-pill" style={{ background: '#fff3eb', color: '#d2691e', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <PackageIcon size={14} color="#d2691e" /> Proyek Rajut ({selectedProject.urls.length} Foto)
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
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <EditIcon size={14} style={{ color: '#d2691e' }} /> Edit Proyek
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
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <TrashIcon size={14} style={{ color: '#dc3545' }} /> Hapus Proyek
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
                <FileIcon /> Upload File Baru
              </button>
              <button
                type="button"
                className={`mode-pill-btn ${editUploadMode === 'url' ? 'active' : ''}`}
                onClick={() => setEditUploadMode('url')}
              >
                <LinkIcon /> Gunakan URL
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
          <div style={{ ...modalContentStyle, maxWidth: '420px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: '0.75rem' }}>
              <TrashIcon size={40} style={{ color: '#dc3545' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#dc3545', marginBottom: '0.5rem', fontWeight: '600' }}>
              Hapus Proyek & Semua Foto Drive?
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.75rem', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus proyek ini? Semua file foto terkait proyek di <strong>Google Drive</strong> dan <strong>Galeri</strong> juga akan dihapus permanen.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', width: '100%' }}>
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
