import React, { useState, useEffect } from 'react'
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'
import Home from './features/home/Home'
import Gallery from './features/gallery/Gallery'
import Projects from './features/projects/Projects'
import About from './features/about/About'
import Contact from './features/contact/Contact'
import Auth from './features/auth/Auth'
import Privacy from './features/privacy/Privacy'
import useSwipe from './hooks/useSwipe'
import { fetchGallery, fetchProjects } from './services/api'
import { useNotification } from './context/NotificationContext'

import { getCookie, eraseCookie } from './utils/cookie'

const SECTIONS = ['home', 'gallery', 'projects', 'about', 'contact', 'auth', 'privacy']

export default function App() {
  const { showToast } = useNotification()
  const [activeSection, setActiveSection] = useState(() => {
    const hash = window.location.hash.substring(1)
    return SECTIONS.includes(hash) ? hash : 'home'
  })

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user') || getCookie('rajut_user')
      return savedUser ? (typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser) : null
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
      setError('Gagal memuat data dari database. Pastikan server API dan Cloudflare D1 terhubung.')
      showToast('Gagal memuat data dari Cloudflare D1 & Google Drive!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const silentReloadData = async () => {
    try {
      const [gal, proj] = await Promise.all([fetchGallery(), fetchProjects()])
      if (gal && Array.isArray(gal) && gal.length > 0) setGallery(gal)
      if (proj && Array.isArray(proj) && proj.length > 0) setProjects(proj)
      setError(null)
    } catch (err) {
      // Ignore background sync errors when server is restarting
    }
  }

  useEffect(() => {
    loadData()

    // Automatic real-time refresh every 5 seconds
    const syncInterval = setInterval(() => {
      silentReloadData()
    }, 5000)

    // Immediate refresh on tab focus / re-entry
    const handleFocus = () => {
      silentReloadData()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(syncInterval)
      window.removeEventListener('focus', handleFocus)
    }
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

  // Global swipe listener removed to prevent accidental page jumps & auto-scrolling during touch scrolling on mobile devices

  const handleAddGalleryItem = (newItem) => {
    setGallery((prev) => [newItem, ...prev])
    silentReloadData()
  }

  const handleUpdateGalleryItem = (updatedItem) => {
    setGallery((prev) => prev.map((item) => item.id === updatedItem.id ? updatedItem : item))
    silentReloadData()
  }

  const handleDeleteGalleryItem = (id) => {
    setGallery((prev) => prev.filter((item) => item.id !== id))
    silentReloadData()
  }

  const handleAddProjectItem = (newItem) => {
    setProjects((prev) => [newItem, ...prev])
    silentReloadData()
  }

  const handleUpdateProjectItem = (updatedItem) => {
    setProjects((prev) => prev.map((proj) => proj.id === updatedItem.id ? updatedItem : proj))
    silentReloadData()
  }

  const handleDeleteProjectItem = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
    silentReloadData()
  }


  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    eraseCookie('rajut_token')
    eraseCookie('rajut_user')
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
          projects={projects}
          gallery={gallery}
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
        <About isActive={activeSection === 'about'} user={user} />
        <Contact isActive={activeSection === 'contact'} user={user} onSectionChange={changeSection} />
        <Auth
          isActive={activeSection === 'auth'}
          onLoginSuccess={handleLoginSuccess}
          onSectionChange={changeSection}
        />
        <Privacy
          isActive={activeSection === 'privacy'}
          onSectionChange={changeSection}
        />
      </main>

      <Footer onSectionChange={changeSection} />
    </>
  )
}
