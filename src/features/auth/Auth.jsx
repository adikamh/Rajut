import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { loginUser, registerUser } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'

export default function Auth({ isActive, onLoginSuccess, onSectionChange }) {
  const { showToast } = useNotification()
  const [tab, setTab] = useState('login')
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register State
  const [regName, setRegName] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    showToast('Sedang masuk...', 'loading', 0)

    try {
      const data = await loginUser(loginEmail.trim(), loginPassword)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLoginSuccess(data.user)
      
      showToast('Masuk berhasil! Selamat datang kembali.', 'success')
      
      setLoginEmail('')
      setLoginPassword('')

      setTimeout(() => {
        onSectionChange('home')
      }, 1000)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Email atau password salah!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    showToast('Pendaftaran akun...', 'loading', 0)

    const userData = {
      name: regName.trim(),
      address: regAddress.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: 'user'
    }

    try {
      const data = await registerUser(userData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLoginSuccess(data.user)
      
      showToast('Pendaftaran akun berhasil!', 'success')
      
      setRegName('')
      setRegAddress('')
      setRegPhone('')
      setRegEmail('')
      setRegPassword('')

      setTimeout(() => {
        onSectionChange('home')
      }, 1000)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal mendaftar!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const authContainerStyle = {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '1.5rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    maxWidth: '500px',
    width: '100%',
    margin: '2rem auto',
    boxSizing: 'border-box'
  }

  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '2px solid #e9ecef',
    marginBottom: '2rem',
    gap: '1.5rem'
  }

  const getTabStyle = (currentTab) => ({
    padding: '10px 5px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: tab === currentTab ? '#d2691e' : '#6c757d',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderBottom: tab === currentTab ? '3px solid #d2691e' : '3px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.3s ease'
  })

  return (
    <section id="auth" className={`section ${isActive ? 'active' : ''}`} style={{ display: isActive ? 'flex' : 'none', alignItems: 'center', minHeight: 'calc(var(--vh, 1vh) * 80)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={authContainerStyle}>
          
          {/* Tabs */}
          <div style={tabContainerStyle}>
            <button 
              type="button" 
              style={getTabStyle('login')} 
              onClick={() => { setTab('login'); }}
            >
              Masuk
            </button>
            <button 
              type="button" 
              style={getTabStyle('register')} 
              onClick={() => { setTab('register'); }}
            >
              Daftar
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="admin@tokorajut.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input
                  type="password"
                  id="loginPassword"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          ) : (
            // Register Form
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label htmlFor="regName">Nama Lengkap</label>
                <input
                  type="text"
                  id="regName"
                  placeholder="Masukkan nama lengkap Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regAddress">Alamat</label>
                <input
                  type="text"
                  id="regAddress"
                  placeholder="Masukkan alamat tempat tinggal"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regPhone">No. Telepon</label>
                <input
                  type="tel"
                  id="regPhone"
                  placeholder="Contoh: 081234567890"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regEmail">Email</label>
                <input
                  type="email"
                  id="regEmail"
                  placeholder="nama@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <input
                  type="password"
                  id="regPassword"
                  placeholder="Buat password minimal 4 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </Button>
            </form>
          )}

        </div>
      </div>
    </section>
  )
}
