// Cloudflare Worker API & D1/R2 Helper
export const CLOUDFLARE_API_URL = import.meta.env.VITE_CLOUDFLARE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('localhost') 
    ? 'http://localhost:3001/api' 
    : '/api')

export async function cfFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    ...options.headers
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${CLOUDFLARE_API_URL}${endpoint}`, {
    ...options,
    headers
  })

  return response
}
