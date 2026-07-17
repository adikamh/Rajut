import React, { useState, useEffect } from 'react'
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'
import Home from './features/home/Home'
import Gallery from './features/gallery/Gallery'
import Projects from './features/projects/Projects'
import About from './features/about/About'
import Contact from './features/contact/Contact'
import Auth from './features/auth/Auth'
import useSwipe from './hooks/useSwipe'
import { fetchGallery, fetchProjects } from './services/api'
import { useNotification } from './context/NotificationContext'

const SECTIONS = ['home', 'gallery', 'projects', 'about', 'contact', 'auth']

export default function App() {
  const { showToast } = useNotification()
  const [activeSection, setActiveSection] = useState(() => {
    const hash = window.location.hash.substring(1)
    return SECTIONS.includes(hash) ? hash : 'home'
  })

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [gallery, setGallery] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [gal, proj] = await Promise.all([fetchGallery(), fetchProjects()])
      setGallery(gal)
      setProjects(proj)
      setError(null)
    } catch (err) {
      console.error('Error loading data from API:', err)
      setError('Gagal memuat data dari database. Pastikan server API dan MySQL Laragon aktif.')
      showToast('Gagal memuat data dari database!', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const changeSection = (sectionId) => {
    if (SECTIONS.includes(sectionId)) {
      setActiveSection(sectionId)
      window.location.hash = sectionId
    }
  }

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1)
      if (SECTIONS.includes(hash)) {
        setActiveSection(hash)
      } else {
        changeSection('home')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
    setVH()
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)
    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
    }
  }, [])

  const navigateNext = () => {
    setActiveSection((prev) => {
      const currentIndex = SECTIONS.indexOf(prev)
      const nextIndex = (currentIndex + 1) % SECTIONS.length
      const nextSection = SECTIONS[nextIndex]
      window.location.hash = nextSection
      return nextSection
    })
  }

  const navigatePrev = () => {
    setActiveSection((prev) => {
      const currentIndex = SECTIONS.indexOf(prev)
      const prevIndex = currentIndex === 0 ? SECTIONS.length - 1 : currentIndex - 1
      const prevSection = SECTIONS[prevIndex]
      window.location.hash = prevSection
      return prevSection
    })
  }

  useSwipe(navigateNext, navigatePrev)

  const handleAddGalleryItem = (newItem) => {
    setGallery((prev) => [newItem, ...prev])
  }

  const handleUpdateGalleryItem = (updatedItem) => {
    setGallery((prev) => prev.map((item) => item.id === updatedItem.id ? updatedItem : item))
  }

  const handleDeleteGalleryItem = (id) => {
    setGallery((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAddProjectItem = (newItem) => {
    setProjects((prev) => [newItem, ...prev])
  }

  const handleUpdateProjectItem = (updatedItem) => {
    setProjects((prev) => prev.map((proj) => proj.id === updatedItem.id ? updatedItem : proj))
  }

  const handleDeleteProjectItem = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
  }

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    changeSection('home')
    showToast('Anda telah berhasil keluar.', 'success')
  }

  return (
    <>
      <Header
        activeSection={activeSection}
        onSectionChange={changeSection}
        user={user}
        onLogout={handleLogout}
      />

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          textAlign: 'center',
          position: 'sticky',
          top: '70px',
          zIndex: 999,
          borderBottom: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <main>
        <Home
          isActive={activeSection === 'home'}
          onSectionChange={changeSection}
          projects={projects.slice(0, 4)}
          loading={loading}
        />
        <Gallery
          isActive={activeSection === 'gallery'}
          galleryItems={gallery}
          onAddImage={handleAddGalleryItem}
          onUpdateImage={handleUpdateGalleryItem}
          onDeleteImage={handleDeleteGalleryItem}
          loading={loading}
          user={user}
        />
        <Projects
          isActive={activeSection === 'projects'}
          projectsList={projects}
          onAddProject={handleAddProjectItem}
          onUpdateProject={handleUpdateProjectItem}
          onDeleteProject={handleDeleteProjectItem}
          loading={loading}
          user={user}
        />
        <About isActive={activeSection === 'about'} />
        <Contact isActive={activeSection === 'contact'} />
        <Auth
          isActive={activeSection === 'auth'}
          onLoginSuccess={handleLoginSuccess}
          onSectionChange={changeSection}
        />
      </main>

      <Footer onSectionChange={changeSection} />
    </>
  )
}
