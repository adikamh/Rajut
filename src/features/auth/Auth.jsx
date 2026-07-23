import React, { useState } from 'react'
import Button from '../../components/ui/Button'
import { loginUser, registerUser } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'
import { setCookie, eraseCookie } from '../../utils/cookie'

export default function Auth({ isActive, onLoginSuccess, onSectionChange }) {
  const { showToast } = useNotification()
  const [tab, setTab] = useState('login')
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loginAgreeTerms, setLoginAgreeTerms] = useState(false)

  // Register State
  const [regName, setRegName] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regAgreeTerms, setRegAgreeTerms] = useState(false)

  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    // Explicit alert if agreement checkbox is NOT checked
    if (!loginAgreeTerms) {
      showToast('⚠️ Harap centang kotak persetujuan Keamanan, Syarat Ketentuan & Kebijakan Privasi terlebih dahulu!', 'error', 4000)
      return
    }

    setLoading(true)
    showToast('Sedang memverifikasi akun...', 'loading', 0)

    try {
      const data = await loginUser(loginEmail.trim(), loginPassword)
      
      // Save to localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Save to Cookies if Remember Me is selected
      if (rememberMe) {
        setCookie('rajut_token', data.token, 7)
        setCookie('rajut_user', JSON.stringify(data.user), 7)
      } else {
        eraseCookie('rajut_token')
        eraseCookie('rajut_user')
      }

      onLoginSuccess(data.user)
      showToast('Login Berhasil! Selamat datang kembali.', 'success')
      
      setLoginEmail('')
      setLoginPassword('')

      setTimeout(() => {
        onSectionChange('home')
      }, 700)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Email atau password salah!', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()

    // Explicit alert if agreement checkbox is NOT checked
    if (!regAgreeTerms) {
      showToast('⚠️ Harap centang kotak persetujuan Keamanan, Syarat Ketentuan & Kebijakan Privasi terlebih dahulu!', 'error', 4000)
      return
    }

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

      // Save to localStorage & Cookies
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setCookie('rajut_token', data.token, 7)
      setCookie('rajut_user', JSON.stringify(data.user), 7)

      onLoginSuccess(data.user)
      showToast('Pendaftaran akun berhasil!', 'success')
      
      setRegName('')
      setRegAddress('')
      setRegPhone('')
      setRegEmail('')
      setRegPassword('')

      setTimeout(() => {
        onSectionChange('home')
      }, 700)
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
          backdropFilter: 'blur(20px)',
          borderRadius: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(210, 105, 30, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          maxWidth: '480px',
          width: '100%',
          boxSizing: 'border-box',
          padding: '2.25rem 1.75rem'
        }}>

          {/* Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <img
              src="/logo.png"
              alt="Toko Rajut Mascot Logo"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                objectFit: 'cover',
                border: '2px solid #ffedd5',
                boxShadow: '0 12px 25px rgba(210, 105, 30, 0.25)',
                marginBottom: '0.75rem'
              }}
            />
            <h2 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '0.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Toko Rajut
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              {tab === 'login' ? 'Masuk ke akun Anda untuk mengelola katalog & pesanan' : 'Daftar akun baru untuk bergabung di Toko Rajut'}
            </p>
          </div>
          
          {/* Mode Pill Switcher */}
          <div className="mode-pill-tabs" style={{ marginBottom: '1.75rem' }}>
            <button 
              type="button" 
              className={`mode-pill-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >
              🔑 Masuk Akun
            </button>
            <button 
              type="button" 
              className={`mode-pill-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >
              📝 Daftar Baru
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="loginEmail" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✉️</span> Alamat Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="haikaladika8@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="loginPassword" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔒</span> Kata Sandi (Password)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="loginPassword"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px', width: '100%', borderRadius: '10px' }}
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

              {/* Checkbox 1: Ingat Saya (Separated near Password) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '17px', height: '17px', accentColor: '#d2691e', cursor: 'pointer' }}
                  />
                  <span><strong>Ingat Saya</strong> (Simpan sesi Cookie 7 Hari)</span>
                </label>
              </div>

              {/* Checkbox 2: Terms & Privacy Agreement Card (Separated above Submit Button) */}
              <div style={{
                background: '#fff7ed',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #ffedd5',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={loginAgreeTerms}
                    onChange={(e) => setLoginAgreeTerms(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#d2691e', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span>
                    Saya menyetujui <strong>Keamanan, Syarat Ketentuan & Kebijakan Privasi</strong> Layanan Toko Rajut.{' '}
                    <button
                      type="button"
                      onClick={() => onSectionChange('privacy')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', padding: 0, fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}
                    >
                      (Baca Kebijakan Privasi)
                    </button>
                  </span>
                </label>
              </div>

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600' }}>
                {loading ? 'Memproses Login...' : '🔑 Masuk ke Akun'}
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regName" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👤</span> Nama Lengkap
                </label>
                <input
                  type="text"
                  id="regName"
                  placeholder="Masukkan nama lengkap Anda"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regAddress" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  id="regAddress"
                  placeholder="Contoh: Jl. Kenari No. 12, Jakarta"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regPhone" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📱</span> No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  id="regPhone"
                  placeholder="Contoh: 081234567890"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="regEmail" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✉️</span> Alamat Email
                </label>
                <input
                  type="email"
                  id="regEmail"
                  placeholder="nama@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="regPassword" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔒</span> Kata Sandi (Password)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="regPassword"
                    placeholder="Minimal 4 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px', width: '100%', borderRadius: '10px' }}
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

              {/* Terms & Privacy Agreement Card (Separated above Submit Button) */}
              <div style={{
                background: '#fff7ed',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #ffedd5',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={regAgreeTerms}
                    onChange={(e) => setRegAgreeTerms(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#d2691e', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span>
                    Saya setuju dengan <strong>Keamanan, Syarat Ketentuan & Kebijakan Privasi Layanan Toko Rajut</strong>.{' '}
                    <button
                      type="button"
                      onClick={() => onSectionChange('privacy')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', padding: 0, fontSize: '0.82rem', textDecoration: 'underline', cursor: 'pointer', fontWeight: '600' }}
                    >
                      (Baca Kebijakan Privasi)
                    </button>
                  </span>
                </label>
              </div>

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600' }}>
                {loading ? 'Mendaftarkan Akun...' : '📝 Daftar Akun Baru'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
