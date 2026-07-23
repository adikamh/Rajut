import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState(null) // { message, type: 'success' | 'error' | 'loading' }

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type })
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => {
        setToast((prev) => (prev && prev.message === message ? null : prev))
      }, duration)
    }
  }

  const hideToast = () => setToast(null)

  return (
    <NotificationContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <ToastContainer toast={toast} onClose={hideToast} />
      )}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
}

function ToastContainer({ toast, onClose }) {
  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return '#28a745'
      case 'error': return '#dc3545'
      case 'loading': return '#d2691e'
      default: return '#17a2b8'
    }
  }

  const containerStyle = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 10000,
    background: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 15px 35px rgba(0,0,0,0.12)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    animation: 'slideUp 0.3s ease-out',
    borderLeft: `5px solid ${getBorderColor()}`,
    boxSizing: 'border-box',
    maxWidth: '380px'
  }

  const iconStyle = {
    fontWeight: '700',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: 'white',
    flexShrink: 0
  }

  return (
    <div className="toast-container" style={containerStyle}>
      {toast.type === 'loading' && (
        <div style={{
          width: '20px',
          height: '20px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #d2691e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          flexShrink: 0
        }}></div>
      )}
      
      {toast.type === 'success' && (
        <div style={{ ...iconStyle, background: '#28a745' }}>✓</div>
      )}
      
      {toast.type === 'error' && (
        <div style={{ ...iconStyle, background: '#dc3545' }}>!</div>
      )}

      <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1a1a1a', flexGrow: 1 }}>
        {toast.message}
      </span>

      {toast.type !== 'loading' && (
        <button 
          onClick={onClose} 
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: '#6c757d',
            padding: '0 5px',
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
