const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'


function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
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
    const err = await response.json()
    throw new Error(err.error || 'Gagal login')
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
    const err = await response.json()
    throw new Error(err.error || 'Gagal daftar')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to upload image')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to create project')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to submit contact message')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to update image')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to delete gallery image')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to update project')
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
    const err = await response.json()
    throw new Error(err.error || 'Failed to delete project')
  }
  return response.json()
}
