import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { createProject, updateProject, deleteProject } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Projects({ isActive, projectsList = [], onAddProject, onUpdateProject, onDeleteProject, loading, user }) {
  const { showToast } = useNotification()
  const [selectedProject, setSelectedProject] = useState(null)
  
  // Creation States
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploadMode, setUploadMode] = useState('file')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Edit States
  const [editingProject, setEditingProject] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editUploadMode, setEditUploadMode] = useState('file')
  const [editImageUrlInput, setEditImageUrlInput] = useState('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      showToast('Judul dan deskripsi harus diisi!', 'error')
      return
    }

    setSubmitting(true)
    showToast('Sedang menyimpan proyek...', 'loading', 0)

    try {
      let result
      if (uploadMode === 'file') {
        result = await createProject(
          title.trim(), 
          description.trim(), 
          selectedFile,
          !!selectedFile
        )
      } else {
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
      setSelectedFile(null)
      const fileInput = document.getElementById('projectFileInput')
      if (fileInput) fileInput.value = ''

      showToast('Proyek berhasil ditambahkan!', 'success')
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
          editSelectedFile, // File or null
          !!editSelectedFile
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
      setEditSelectedFile(null)
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
    showToast('Sedang menghapus proyek...', 'loading', 0)

    try {
      await deleteProject(id)
      onDeleteProject(id)
      showToast('Proyek berhasil dihapus!', 'success')
    } catch (err) {
      console.error(err)
      showToast(`Gagal menghapus proyek: ${err.message}`, 'error')
    }
  }

  const getProjectImgUrl = (proj, index) => {
    if (proj.image_url) {
      if (proj.image_url.startsWith('http')) return proj.image_url
      return `http://localhost:3001${proj.image_url}`
    }
    const titleLower = proj.title.toLowerCase()
    if (titleLower.includes('scarf')) {
      return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
    } else if (titleLower.includes('blanket')) {
      return 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'
    } else if (titleLower.includes('hat') || titleLower.includes('beanie')) {
      return 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'
    } else if (titleLower.includes('glove')) {
      return 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a'
    }
    const staticPics = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c'
    ]
    return staticPics[index % staticPics.length]
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
    maxWidth: '650px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh'
  }

  return (
    <section id="projects" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <h2>Projects</h2>
        <p>Explore our ongoing and completed knitting projects. Click a card to view full details.</p>

        {/* Create Project Form Panel - Render only for admin */}
        {user && user.role === 'admin' && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            margin: '2rem auto 4rem auto',
            maxWidth: '600px'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#d2691e', marginBottom: '1.5rem', textAlign: 'center' }}>
              Tambah Proyek Baru (Admin Only)
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setUploadMode('file')}
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
                onClick={() => setUploadMode('url')}
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

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="projectTitle" style={{ fontWeight: '500' }}>Judul Proyek</label>
                <input
                  type="text"
                  id="projectTitle"
                  placeholder="Contoh: Selimut Bayi Kustom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {uploadMode === 'file' ? (
                <div className="form-group">
                  <label htmlFor="projectFileInput" style={{ fontWeight: '500' }}>Foto Proyek (File)</label>
                  <input
                    type="file"
                    id="projectFileInput"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ border: 'none', padding: '10px 0' }}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="projectUrlInput" style={{ fontWeight: '500' }}>Foto Proyek (URL)</label>
                  <input
                    type="url"
                    id="projectUrlInput"
                    placeholder="https://example.com/project.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="projectDescription" style={{ fontWeight: '500' }}>Deskripsi Proyek</label>
                <textarea
                  id="projectDescription"
                  placeholder="Berikan detail mengenai proyek rajutan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ height: '80px', minHeight: '80px' }}
                  required
                ></textarea>
              </div>

              <Button type="submit" disabled={submitting} style={{ width: '100%', marginTop: '1rem' }}>
                {submitting ? 'Menyimpan...' : 'Tambahkan Proyek'}
              </Button>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#6c757d' }}>Memuat data proyek...</p>}
        <div className="projects-grid">
          {projectsList.map((project, index) => (
            <div 
              key={project.id || index} 
              className="project-card"
              onClick={() => setSelectedProject({ ...project, imgUrl: getProjectImgUrl(project, index) })}
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <img 
                src={getProjectImgUrl(project, index)} 
                alt={project.title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div className="work-info" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#6c757d',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.5',
                  margin: '0 0 1rem 0',
                  flexGrow: 1
                }}>
                  {project.description}
                </p>

                {/* Admin edit/delete buttons inside the card */}
                {user && user.role === 'admin' && (
                  <div 
                    style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f3f5', paddingTop: '1rem' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setEditingProject(project)
                        setEditTitle(project.title)
                        setEditDescription(project.description)
                        if (project.image_url && project.image_url.startsWith('http')) {
                          setEditUploadMode('url')
                          setEditImageUrlInput(project.image_url)
                        } else {
                          setEditUploadMode('file')
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        minHeight: 'auto',
                        fontSize: '0.85rem',
                        background: '#d2691e',
                        border: 'none',
                        color: 'white',
                        borderRadius: '6px'
                      }}
                    >
                      ✎ Edit
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setDeleteConfirmId(project.id)}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        minHeight: 'auto',
                        fontSize: '0.85rem',
                        background: '#dc3545',
                        border: 'none',
                        color: 'white',
                        borderRadius: '6px'
                      }}
                    >
                      ✕ Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Popup Modal */}
      {selectedProject && (
        <div style={modalOverlayStyle} onClick={() => setSelectedProject(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedProject(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1.2rem',
                zIndex: 10,
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: '#1a1a1a',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              ×
            </button>
            <div style={{ width: '100%', height: '320px', overflow: 'hidden' }}>
              <img 
                src={selectedProject.imgUrl} 
                alt={selectedProject.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.75rem', color: '#d2691e', marginBottom: '1rem', fontFamily: 'Lora, serif' }}>
                {selectedProject.title}
              </h3>
              <p style={{ 
                fontSize: '1.05rem', 
                lineHeight: '1.7', 
                color: '#1a1a1a', 
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedProject.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div style={modalOverlayStyle} onClick={() => setEditingProject(null)}>
          <div style={{ ...modalContentStyle, padding: '2rem', maxWidth: '600px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', color: '#d2691e', marginBottom: '1.5rem', textAlign: 'center' }}>
              Edit Detail Proyek
            </h3>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setEditUploadMode('file')}
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '0.9rem',
                  background: editUploadMode === 'file' ? '#d2691e' : '#e9ecef',
                  color: editUploadMode === 'file' ? 'white' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setEditUploadMode('url')}
                style={{
                  padding: '8px 16px',
                  minHeight: 'auto',
                  fontSize: '0.9rem',
                  background: editUploadMode === 'url' ? '#d2691e' : '#e9ecef',
                  color: editUploadMode === 'url' ? 'white' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px'
                }}
              >
                Gunakan URL
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="editProjectTitle" style={{ fontWeight: '500' }}>Judul Proyek</label>
                <input
                  type="text"
                  id="editProjectTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              {editUploadMode === 'file' ? (
                <div className="form-group">
                  <label htmlFor="editProjectFileInput" style={{ fontWeight: '500' }}>Foto Proyek Baru (File)</label>
                  <input
                    type="file"
                    id="editProjectFileInput"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    style={{ border: 'none', padding: '10px 0' }}
                  />
                  {editingProject.image_url && !editingProject.image_url.startsWith('http') && (
                    <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
                      File saat ini: {editingProject.image_url}
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="editProjectUrlInput" style={{ fontWeight: '500' }}>Foto Proyek Baru (URL)</label>
                  <input
                    type="url"
                    id="editProjectUrlInput"
                    placeholder="https://example.com/project.jpg"
                    value={editImageUrlInput}
                    onChange={(e) => setEditImageUrlInput(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="editProjectDescription" style={{ fontWeight: '500' }}>Deskripsi Proyek</label>
                <textarea
                  id="editProjectDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ height: '100px', minHeight: '100px' }}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" disabled={updating} style={{ flex: 1 }}>
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditingProject(null)}
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
          <div style={{ ...modalContentStyle, padding: '2rem', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', color: '#dc3545', marginBottom: '1rem', textAlign: 'center' }}>
              Hapus Proyek?
            </h3>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '2rem', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn"
                onClick={() => confirmDeleteProject(deleteConfirmId)}
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
