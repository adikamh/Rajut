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
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register State
  const [regName, setRegName] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    showToast('Sedang memverifikasi akun...', 'loading', 0)

    try {
      const data = await loginUser(loginEmail.trim(), loginPassword)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLoginSuccess(data.user)
      
      showToast('Login Berhasil! Selamat datang kembali.', 'success')
      
      setLoginEmail('')
      setLoginPassword('')

      setTimeout(() => {
        onSectionChange('home')
      }, 800)
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
    showToast('Sedang memproses pendaftaran...', 'loading', 0)

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
      }, 800)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal mendaftar!', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="auth" className={`section ${isActive ? 'active' : ''}`} style={{ display: isActive ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(var(--vh, 1vh) * 80)', padding: '2rem 1rem' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div className="auth-card" style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(210, 105, 30, 0.12)',
          maxWidth: '460px',
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid rgba(226, 232, 240, 0.9)'
        }}>

          {/* Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧶</div>
            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.25rem', fontWeight: '700' }}>Toko Rajut</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Masuk atau daftar untuk mengakses fitur akun</p>
          </div>
          
          {/* Mode Pill Switcher */}
          <div className="mode-pill-tabs" style={{ marginBottom: '1.75rem' }}>
            <button 
              type="button" 
              className={`mode-pill-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              🔑 Masuk
            </button>
            <button 
              type="button" 
              className={`mode-pill-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              📝 Daftar
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="loginEmail" style={{ fontWeight: '500', color: '#1e293b' }}>Email</label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="haikaladika8@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="loginPassword" style={{ fontWeight: '500', color: '#1e293b' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="loginPassword"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: '#64748b',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showLoginPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showLoginPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px' }}>
                {loading ? 'Memproses Login...' : '🔑 Masuk ke Akun'}
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regName" style={{ fontWeight: '500', color: '#1e293b' }}>Nama Lengkap</label>
                <input
                  type="text"
                  id="regName"
                  placeholder="Masukkan nama lengkap Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regAddress" style={{ fontWeight: '500', color: '#1e293b' }}>Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  id="regAddress"
                  placeholder="Contoh: Jl. Kenari No. 12, Jakarta"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regPhone" style={{ fontWeight: '500', color: '#1e293b' }}>No. Telepon / WhatsApp</label>
                <input
                  type="tel"
                  id="regPhone"
                  placeholder="Contoh: 081234567890"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regEmail" style={{ fontWeight: '500', color: '#1e293b' }}>Email</label>
                <input
                  type="email"
                  id="regEmail"
                  placeholder="nama@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="regPassword" style={{ fontWeight: '500', color: '#1e293b' }}>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regPassword"
                    placeholder="Minimal 4 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: '#64748b',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showRegPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                  >
                    {showRegPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px' }}>
                {loading ? 'Mendaftarkan Akun...' : '📝 Daftar Akun Baru'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
