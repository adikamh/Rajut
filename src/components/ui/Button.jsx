import React from 'react'

export default function Button({ children, type = 'button', onClick, className = '', variant = 'primary', ...props }) {
  const baseClass = 'btn'
  const variantClass = variant === 'primary' ? 'btn-primary' : ''
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
