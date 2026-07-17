import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { createProject } from '../../services/api'

export default function Projects({ isActive, projectsList = [], onAddProject, loading, user }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      alert('Judul dan deskripsi harus diisi!')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const result = await createProject(title.trim(), description.trim())
      onAddProject(result)
      setTitle('')
      setDescription('')
      setMessage('Proyek berhasil ditambahkan!')
    } catch (err) {
      console.error(err)
      setMessage(`Gagal menambahkan proyek: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="projects" className={`section ${isActive ? 'active' : ''}`}>
      <div className="container">
        <h2>Projects</h2>
        <p>Explore our ongoing and completed knitting projects.</p>

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
            {message && (
              <p style={{
                textAlign: 'center',
                marginTop: '1rem',
                color: message.includes('berhasil') ? 'green' : 'red',
                fontWeight: '500'
              }}>
                {message}
              </p>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {loading && <p style={{ textAlign: 'center', color: '#6c757d' }}>Memuat data proyek...</p>}
        <div className="projects-grid">
          {projectsList.map((project, index) => (
            <div key={project.id || index} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
