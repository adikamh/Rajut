import React, { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { loginUser, registerUser, requestRegisterOtp, verifyRegisterOtp, requestOtp, verifyResetOtp, resetPasswordWithOtp } from '../../services/api'
import { useNotification } from '../../context/NotificationContext'
import { setCookie, eraseCookie } from '../../utils/cookie'
import { ChakraProvider, HStack, PinInput, PinInputField } from '@chakra-ui/react'

// Reusable SVG Icon Components (Replacing emojis)
const KeyIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 2l-2 2m-1.5 1.5L14 9.5M10 13a5 5 0 1 1 7-7 5 5 0 0 1-7 7z" />
    <path d="M7.5 15.5L4 19v2h2l2.5-2.5" />
  </svg>
)

const LockIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const MailIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const UserIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const MapPinIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const PhoneIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const RegisterIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
)

const EyeIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const HashIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
)

const RefreshIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

const ShieldCheckIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export default function Auth({ isActive, onLoginSuccess, onSectionChange }) {
  const { showToast } = useNotification()
  const [tab, setTab] = useState('login')
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loginAgreeTerms, setLoginAgreeTerms] = useState(false)

  // Register State (With OTP & Email Uniqueness Verification)
  const [regStep, setRegStep] = useState(1) // 1: Fill Form, 2: Enter OTP
  const [regName, setRegName] = useState('')
  const [regAddress, setRegAddress] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [regAgreeTerms, setRegAgreeTerms] = useState(false)
  const [regOtp, setRegOtp] = useState('')
  const [regResendCooldown, setRegResendCooldown] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState('')

  // Reset Password State (OTP flow)
  const [resetStep, setResetStep] = useState(1) // 1: Request OTP email, 2: OTP & New Password
  const [resetEmail, setResetEmail] = useState('')
  const [resetOtp, setResetOtp] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0) // Cooldown timer in seconds

  const [loading, setLoading] = useState(false)

  // Countdown timer for Reset Password Resend OTP (60s)
  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendCooldown])

  // Countdown timer for Register Resend OTP (60s)
  useEffect(() => {
    let timer
    if (regResendCooldown > 0) {
      timer = setInterval(() => {
        setRegResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [regResendCooldown])

  // Render Cloudflare Turnstile explicitly on Register tab step 1
  useEffect(() => {
    let widgetId = null
    if (tab === 'register' && regStep === 1) {
      const initTurnstile = () => {
        const container = document.getElementById('turnstile-container')
        if (container && window.turnstile) {
          try {
            container.innerHTML = ''
            widgetId = window.turnstile.render('#turnstile-container', {
              sitekey: '0x4AAAAAAD8f44ErKvGSm9_O',
              callback: function(token) {
                setTurnstileToken(token)
              },
              'error-callback': function() {
                showToast('Cloudflare Turnstile gagal dimuat. Silakan muat ulang halaman.', 'error')
              }
            })
          } catch (err) {
            console.error("Turnstile render error:", err)
          }
        }
      }

      if (window.turnstile) {
        initTurnstile()
      } else {
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval)
            initTurnstile()
          }
        }, 100)
        return () => clearInterval(interval)
      }
    }

    return () => {
      if (widgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch (e) {}
      }
    }
  }, [tab, regStep])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    // Explicit alert if agreement checkbox is NOT checked
    if (!loginAgreeTerms) {
      showToast('Harap centang kotak persetujuan Keamanan, Syarat Ketentuan & Kebijakan Privasi terlebih dahulu!', 'error', 4000)
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

  // Step 1: Submit Form & Request OTP for Registration
  const handleRequestRegisterOtp = async (e) => {
    if (e) e.preventDefault()

    if (!regName.trim() || !regAddress.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword) {
      showToast('Seluruh kolom pendaftaran harus diisi!', 'error')
      return
    }

    if (!regAgreeTerms) {
      showToast('Harap centang kotak persetujuan Keamanan, Syarat Ketentuan & Kebijakan Privasi terlebih dahulu!', 'error', 4000)
      return
    }

    if (!turnstileToken) {
      showToast('Harap selesaikan verifikasi keamanan Cloudflare Turnstile!', 'error')
      return
    }

    setLoading(true)
    showToast('Memeriksa ketersediaan email & mengirimkan OTP...', 'loading', 0)

    const userData = {
      name: regName.trim(),
      address: regAddress.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
      turnstileToken: turnstileToken
    }

    try {
      const data = await requestRegisterOtp(userData)
      showToast(data.message || `Kode OTP pendaftaran dikirim ke ${regEmail}! Periksa email Anda.`, 'success', 5000)
      setRegStep(2)
      setRegResendCooldown(60)
    } catch (err) {
      console.error(err)
      // Reset Turnstile token on error to force re-verification
      setTurnstileToken('')
      if (window.turnstile) {
        try { window.turnstile.reset('#turnstile-container') } catch (e) {}
      }
      showToast(err.message || 'Email ini sudah terdaftar atau gagal mengirim OTP!', 'error', 4500)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP & Create Verified Account
  const handleVerifyRegisterOtpSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!regOtp || regOtp.trim().length !== 6) {
      showToast('Harap masukkan 6-digit Kode OTP pendaftaran dengan lengkap!', 'error')
      return
    }

    setLoading(true)
    showToast('Memverifikasi OTP & membuat akun...', 'loading', 0)

    try {
      const data = await verifyRegisterOtp(regEmail.trim(), regOtp.trim())

      // Save to localStorage & Cookies
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setCookie('rajut_token', data.token, 7)
      setCookie('rajut_user', JSON.stringify(data.user), 7)

      onLoginSuccess(data.user)
      showToast('Pendaftaran akun berhasil! Akun Anda telah terverifikasi.', 'success')

      setRegName('')
      setRegAddress('')
      setRegPhone('')
      setRegEmail('')
      setRegPassword('')
      setRegOtp('')
      setRegStep(1)

      setTimeout(() => {
        onSectionChange('home')
      }, 700)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Kode OTP salah atau telah kadaluarsa!', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Request Reset Password OTP Email
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault()

    if (!resetEmail.trim()) {
      showToast('Harap masukkan alamat email Anda terlebih dahulu!', 'error')
      return
    }

    setLoading(true)
    showToast('Sedang mengirimkan kode OTP ke email Anda...', 'loading', 0)

    try {
      const data = await requestOtp(resetEmail.trim())
      showToast(data.message || `Kode OTP telah dikirim ke ${resetEmail}! Cek email Anda.`, 'success', 5000)
      setResetStep(2)
      setResendCooldown(60) // Start 60-second cooldown timer
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal mengirimkan kode OTP!', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP Code Only (Before entering new password)
  const handleVerifyResetOtpSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!resetOtp || resetOtp.trim().length !== 6) {
      showToast('Harap masukkan 6-digit Kode OTP dengan lengkap!', 'error')
      return
    }

    setLoading(true)
    showToast('Memverifikasi kode OTP...', 'loading', 0)

    try {
      const data = await verifyResetOtp(resetEmail.trim(), resetOtp.trim())
      showToast(data.message || 'Kode OTP valid! Silakan buat kata sandi baru Anda.', 'success', 4000)
      setResetStep(3)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Kode OTP yang Anda masukkan salah atau kadaluarsa!', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Save New Password
  const handleSaveNewPasswordSubmit = async (e) => {
    if (e) e.preventDefault()

    if (!resetNewPassword || !resetConfirmPassword) {
      showToast('Harap lengkapi kata sandi baru dan konfirmasi kata sandi!', 'error')
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      showToast('Konfirmasi password tidak cocok dengan password baru!', 'error')
      return
    }

    if (resetNewPassword.length < 4) {
      showToast('Kata sandi baru minimal 4 karakter!', 'error')
      return
    }

    setLoading(true)
    showToast('Sedang menyimpan kata sandi baru...', 'loading', 0)

    try {
      const data = await resetPasswordWithOtp(resetEmail.trim(), resetOtp.trim(), resetNewPassword)
      showToast(data.message || 'Kata sandi berhasil diperbarui!', 'success', 4000)
      
      setLoginEmail(resetEmail.trim())
      setResetEmail('')
      setResetOtp('')
      setResetNewPassword('')
      setResetConfirmPassword('')
      setResetStep(1)
      setResendCooldown(0)

      setTimeout(() => {
        setTab('login')
      }, 1000)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal mereset kata sandi!', 'error')
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
              {tab === 'login'
                ? 'Masuk ke akun Anda untuk mengelola katalog & pesanan'
                : tab === 'register'
                ? 'Daftar akun baru untuk bergabung di Toko Rajut'
                : 'Reset kata sandi akun Toko Rajut Anda via Kode OTP Email'}
            </p>
          </div>
          
          {/* Mode Pill Switcher */}
          <div className="mode-pill-tabs" style={{ marginBottom: '1.75rem' }}>
            <button 
              type="button" 
              className={`mode-pill-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setTab('login')
                setResetStep(1)
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <KeyIcon size={16} /> Masuk Akun
            </button>
            <button 
              type="button" 
              className={`mode-pill-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setTab('register')
                setResetStep(1)
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RegisterIcon size={16} /> Daftar Baru
            </button>
            {tab === 'reset' && (
              <button 
                type="button" 
                className="mode-pill-btn active"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ShieldCheckIcon size={16} /> Reset OTP
              </button>
            )}
          </div>

          {/* Login Form */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="loginEmail" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MailIcon size={16} color="#d2691e" /> Alamat Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="loginPassword" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LockIcon size={16} color="#d2691e" /> Kata Sandi (Password)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="loginPassword"
                    placeholder="Password"
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
                    {showLoginPassword ? <EyeOffIcon color="#64748b" /> : <EyeIcon color="#64748b" />}
                  </button>
                </div>
              </div>

              {/* Checkbox 1: Ingat Saya & Lupa Password Link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '17px', height: '17px', accentColor: '#d2691e', cursor: 'pointer' }}
                  />
                  <span><strong>Ingat Saya</strong> (Simpan sesi 7 Hari)</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginEmail)
                    setResetStep(1)
                    setTab('reset')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d2691e',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <KeyIcon size={14} color="#d2691e" /> Lupa Password?
                </button>
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

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? 'Memproses Login...' : <> <KeyIcon size={18} color="#ffffff" /> Masuk ke Akun </>}
              </Button>
            </form>
          ) : tab === 'register' ? (
            /* Register Form with 2-Step OTP Verification */
            regStep === 1 ? (
              <form onSubmit={handleRequestRegisterOtp}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="regName" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserIcon size={16} color="#d2691e" /> Nama Lengkap
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
                    <MapPinIcon size={16} color="#d2691e" /> Alamat Tempat Tinggal
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
                    <PhoneIcon size={16} color="#d2691e" /> No. Telepon / WhatsApp
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
                    <MailIcon size={16} color="#d2691e" /> Alamat Email (Wajib Unik)
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
                    <LockIcon size={16} color="#d2691e" /> Kata Sandi (Password)
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      id="regPassword"
                      placeholder="Password"
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
                      {showRegPassword ? <EyeOffIcon color="#64748b" /> : <EyeIcon color="#64748b" />}
                    </button>
                  </div>
                </div>

                {/* Terms & Privacy Agreement Card */}
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

                {/* Cloudflare Turnstile Verification Widget */}
                <div 
                  id="turnstile-container" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '1.5rem',
                    minHeight: '65px'
                  }}
                ></div>

                <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Memeriksa Email & OTP...' : <> <MailIcon size={18} color="#ffffff" /> Kirim Kode OTP Pendaftaran </>}
                </Button>
              </form>
            ) : (
              /* Register Step 2: Verification OTP Screen */
              <form onSubmit={handleVerifyRegisterOtpSubmit}>
                <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '12px', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontSize: '0.86rem', color: '#065f46', lineHeight: '1.5', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <ShieldCheckIcon size={20} color="#059669" />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px', fontSize: '0.9rem' }}>Verifikasi Keaslian Akun</strong>
                    Kami telah mengirimkan <strong>6-digit Kode OTP</strong> ke email <strong>{regEmail}</strong>. Masukkan kode tersebut untuk memverifikasi pendaftaran Anda.
                  </div>
                </div>

                {/* Chakra UI OTP PinInput Component */}
                <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <HashIcon size={16} color="#d2691e" /> Input 6-Digit Kode OTP Pendaftaran
                  </label>
                  <ChakraProvider resetCSS={false}>
                    <HStack justifyContent="center" spacing={2} style={{ margin: '10px 0' }}>
                      <PinInput otp value={regOtp} onChange={(val) => setRegOtp(val)}>
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                      </PinInput>
                    </HStack>
                  </ChakraProvider>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ← Kembali / Ubah Data
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestRegisterOtp}
                    disabled={regResendCooldown > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: regResendCooldown > 0 ? '#94a3b8' : '#d2691e',
                      fontWeight: '600',
                      cursor: regResendCooldown > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshIcon size={14} color={regResendCooldown > 0 ? '#94a3b8' : '#d2691e'} />
                    {regResendCooldown > 0 ? `Kirim Ulang (${regResendCooldown}s)` : 'Kirim Ulang OTP'}
                  </button>
                </div>

                <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Memverifikasi Kode OTP...' : <> <ShieldCheckIcon size={18} color="#ffffff" /> Verifikasi & Buat Akun </>}
                </Button>
              </form>
            )
          ) : (
            /* Reset Password 3-Step Flow with OTP */
            resetStep === 1 ? (
              /* Step 1: Input Email */
              <form onSubmit={handleRequestOtp}>
                <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#1e40af', lineHeight: '1.5', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MailIcon size={18} color="#1e40af" />
                  <span>Masukkan alamat email akun Anda. Kami akan mengirimkan <strong>6-digit Kode OTP</strong> ke email tersebut untuk memverifikasi permintaan reset password.</span>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="resetEmail" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MailIcon size={16} color="#d2691e" /> Alamat Email Akun Terdaftar
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    placeholder="Masukkan email Anda (contoh: nama@email.com)"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Mengirim Kode OTP...' : <> <MailIcon size={18} color="#ffffff" /> Kirim Kode OTP Ke Email </>}
                </Button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d2691e',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Kembali ke Halaman Login
                  </button>
                </div>
              </form>
            ) : resetStep === 2 ? (
              /* Step 2: Input & Verify OTP Code Only */
              <form onSubmit={handleVerifyResetOtpSubmit}>
                <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '12px', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontSize: '0.86rem', color: '#065f46', lineHeight: '1.5', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <ShieldCheckIcon size={20} color="#059669" />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px', fontSize: '0.9rem' }}>Verifikasi Kode OTP</strong>
                    Kode OTP 6-digit telah dikirim ke email <strong>{resetEmail}</strong>. Masukkan kode tersebut untuk memverifikasi identitas Anda.
                  </div>
                </div>

                {/* Chakra UI OTP 6-Digit PinInput */}
                <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <label style={{ fontWeight: '600', color: '#334155', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <HashIcon size={16} color="#d2691e" /> Input 6-Digit Kode OTP Reset Password
                  </label>
                  <ChakraProvider resetCSS={false}>
                    <HStack justifyContent="center" spacing={2} style={{ margin: '10px 0' }}>
                      <PinInput
                        otp
                        value={resetOtp}
                        onChange={(val) => setResetOtp(val)}
                      >
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                        <PinInputField style={{ width: '44px', height: '52px', fontSize: '1.25rem', fontWeight: '700', textAlign: 'center', borderRadius: '10px', border: '2px solid #cbd5e1', background: '#ffffff', color: '#1e293b', outline: 'none' }} />
                      </PinInput>
                    </HStack>
                  </ChakraProvider>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ← Ulangi Alamat Email
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendCooldown > 0 ? '#94a3b8' : '#d2691e',
                      fontWeight: '600',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshIcon size={14} color={resendCooldown > 0 ? '#94a3b8' : '#d2691e'} />
                    {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang OTP'}
                  </button>
                </div>

                <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Memverifikasi Kode OTP...' : <> <ShieldCheckIcon size={18} color="#ffffff" /> Verifikasi Kode OTP </>}
                </Button>
              </form>
            ) : (
              /* Step 3: Form Input Kata Sandi Baru (Tampil HANYA SETELAH OTP Terverifikasi!) */
              <form onSubmit={handleSaveNewPasswordSubmit}>
                <div style={{ background: '#ecfdf5', padding: '14px', borderRadius: '12px', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontSize: '0.86rem', color: '#065f46', lineHeight: '1.5', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ShieldCheckIcon size={20} color="#059669" />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '2px', fontSize: '0.9rem' }}>Kode OTP Terverifikasi!</strong>
                    Silakan buat kata sandi baru untuk akun <strong>{resetEmail}</strong>.
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="resetNewPassword" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LockIcon size={16} color="#d2691e" /> Kata Sandi Baru (New Password)
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      id="resetNewPassword"
                      placeholder="Masukkan kata sandi baru (min 4 karakter)"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      required
                      style={{ paddingRight: '48px', width: '100%', borderRadius: '10px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
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
                      title={showResetPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showResetPassword ? <EyeOffIcon color="#64748b" /> : <EyeIcon color="#64748b" />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="resetConfirmPassword" style={{ fontWeight: '600', color: '#334155', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LockIcon size={16} color="#d2691e" /> Konfirmasi Kata Sandi Baru
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      id="resetConfirmPassword"
                      placeholder="Ketik ulang kata sandi baru"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      required
                      style={{ paddingRight: '48px', width: '100%', borderRadius: '10px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
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
                      title={showResetConfirmPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                    >
                      {showResetConfirmPassword ? <EyeOffIcon color="#64748b" /> : <EyeIcon color="#64748b" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {loading ? 'Menyimpan Kata Sandi Baru...' : <> <KeyIcon size={18} color="#ffffff" /> Simpan Kata Sandi Baru </>}
                </Button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1)
                      setTab('login')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d2691e',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Batal & Kembali ke Login
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </section>
  )
}
