import { getCookie, eraseCookie } from '../utils/cookie'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('token') || getCookie('rajut_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

async function handleResponseError(response, defaultMsg = 'Terjadi kesalahan') {
  let errMsg = defaultMsg
  try {
    const err = await response.json()
    errMsg = err.error || defaultMsg
  } catch (e) {
    // ignore json parse error
  }

  if (response.status === 401 || response.status === 403 || String(errMsg).toLowerCase().includes('token')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    eraseCookie('rajut_token')
    eraseCookie('rajut_user')
    window.dispatchEvent(new Event('auth_changed'))
    throw new Error('Sesi login Anda telah berakhir atau token tidak valid. Silakan login kembali sebagai Admin.')
  }

  throw new Error(errMsg)
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    await handleResponseError(response, 'Gagal login')
  }
  return response.json()
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })

  if (!response.ok) {
    await handleResponseError(response, 'Gagal daftar')
  }
  return response.json()
}

export async function fetchGallery() {
  const response = await fetch(`${API_BASE_URL}/gallery`)
  if (!response.ok) {
    throw new Error('Failed to fetch gallery')
  }
  return response.json()
}

export async function uploadGalleryImage(imageFileOrUrl, isFile = false) {
  let response
  if (isFile) {
    const formData = new FormData()
    formData.append('image', imageFileOrUrl)
    response = await fetch(`${API_BASE_URL}/gallery`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    })
  } else {
    response = await fetch(`${API_BASE_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ image_url: imageFileOrUrl })
    })
  }

  if (!response.ok) {
    await handleResponseError(response, 'Gagal mengunggah foto ke Galeri')
  }
  return response.json()
}

export async function fetchProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`)
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  return response.json()
}

export async function createProject(title, description, imageFilesOrUrl, isFile = false) {
  let response
  if (isFile) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (Array.isArray(imageFilesOrUrl) || imageFilesOrUrl instanceof FileList) {
      Array.from(imageFilesOrUrl).forEach(file => {
        formData.append('images', file)
      })
    } else if (imageFilesOrUrl) {
      formData.append('images', imageFilesOrUrl)
    }
    response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    })
  } else {
    response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title, description, image_url: imageFilesOrUrl })
    })
  }

  if (!response.ok) {
    await handleResponseError(response, 'Gagal membuat proyek baru')
  }
  return response.json()
}

export async function submitContact(name, email, message) {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, message })
  })

  if (!response.ok) {
    await handleResponseError(response, 'Gagal mengirim pesan')
  }
  return response.json()
}

export async function updateGalleryImage(id, imageFileOrUrl, isFile = false) {
  let response
  if (isFile) {
    const formData = new FormData()
    formData.append('image', imageFileOrUrl)
    response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    })
  } else {
    response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ image_url: imageFileOrUrl })
    })
  }

  if (!response.ok) {
    await handleResponseError(response, 'Gagal memperbarui foto di Galeri')
  }
  return response.json()
}

export async function deleteGalleryImage(id) {
  const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  })

  if (!response.ok) {
    await handleResponseError(response, 'Gagal menghapus foto dari Galeri')
  }
  return response.json()
}

export async function updateProject(id, title, description, imageFilesOrUrl, isFile = false) {
  let response
  if (isFile) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    if (Array.isArray(imageFilesOrUrl) || imageFilesOrUrl instanceof FileList) {
      Array.from(imageFilesOrUrl).forEach(file => {
        formData.append('images', file)
      })
    } else if (imageFilesOrUrl) {
      formData.append('images', imageFilesOrUrl)
    }
    response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    })
  } else {
    response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title, description, image_url: imageFilesOrUrl })
    })
  }

  if (!response.ok) {
    await handleResponseError(response, 'Gagal memperbarui proyek')
  }
  return response.json()
}

export async function deleteProject(id) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  })

  if (!response.ok) {
    await handleResponseError(response, 'Gagal menghapus proyek')
  }
  return response.json()
}

export async function fetchAboutContent() {
  const response = await fetch(`${API_BASE_URL}/about`)
  if (!response.ok) {
    await handleResponseError(response, 'Gagal mengambil data tentang kami')
  }
  return response.json()
}

export async function updateAboutContent(dataPayload, isFile = false) {
  let response
  if (isFile && dataPayload instanceof FormData) {
    response = await fetch(`${API_BASE_URL}/about`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders()
      },
      body: dataPayload
    })
  } else {
    response = await fetch(`${API_BASE_URL}/about`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(dataPayload)
    })
  }

  if (!response.ok) {
    await handleResponseError(response, 'Gagal memperbarui konten tentang kami')
  }
  return response.json()
}
