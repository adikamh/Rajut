import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { google } from 'googleapis'
import { Readable } from 'stream'
import convert from 'heic-convert'

import db from './db.js' // db is now the Supabase client
import { sendContactEmail } from './mailer.js'
import { authenticateToken, requireAdmin } from './authMiddleware.js'


import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true })


const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'rajut_secret_token_key_123!'

// Ensure the public uploads directory exists safely (using /tmp on Vercel)
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production'
const uploadsDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.resolve(__dirname, '../public/uploads')

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
} catch (err) {
  console.warn('Could not create uploads directory:', err.message)
}

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// Google Drive Auth & Upload Configuration (Supports OAuth 2.0 User Refresh Token & Service Account)
let driveAuthClient

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  )
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })
  driveAuthClient = oauth2Client
  console.log('Google Drive API authenticated via OAuth 2.0 User Refresh Token.')
} else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  driveAuthClient = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/drive']
  })
  console.log('Google Drive API authenticated via Service Account Env Vars.')
} else {
  const driveKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, '../bot/confident-topic-503106-d8-4df9b39b2205.json')
  if (fs.existsSync(driveKeyPath)) {
    driveAuthClient = new google.auth.GoogleAuth({
      keyFile: driveKeyPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    })
    console.log('Google Drive API authenticated via Service Account File.')
  } else {
    console.warn('Google Drive Service Account file not found. Fallback to other auth methods or local file system if upload occurs.')
  }
}

const drive = google.drive({ version: 'v3', auth: driveAuthClient })


const memoryStorage = multer.memoryStorage()
const memoryUpload = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
})

function bufferToStream(buffer) {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)
  return stream
}

async function processImageBuffer(buffer, originalMimeType, originalName) {

  const isHeic = originalMimeType.toLowerCase().includes('heic') || 
                 originalMimeType.toLowerCase().includes('heif') || 
                 originalName.toLowerCase().endsWith('.heic') || 
                 originalName.toLowerCase().endsWith('.heif')

  if (isHeic) {
    try {
      const outputBuffer = await convert({
        buffer: buffer,
        format: 'JPEG',
        quality: 0.95
      })
      const newName = originalName.replace(/\.(heic|heif)$/i, '.jpg')
      return { buffer: Buffer.from(outputBuffer), mimeType: 'image/jpeg', name: newName }
    } catch (err) {
      console.warn('HEIC image conversion warning:', err.message)
    }
  }
  return { buffer, mimeType: originalMimeType, name: originalName }
}

async function uploadToGoogleDrive(fileBuffer, mimeType, originalName) {
  const processed = await processImageBuffer(fileBuffer, mimeType, originalName)

  let rawFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  if (rawFolderId.includes('?')) {
    rawFolderId = rawFolderId.split('?')[0]
  }
  const folderId = rawFolderId.trim()
  const isPlaceholder = !folderId || folderId.includes('MASUKKAN_FOLDER_ID')

  const fileMetadata = {
    name: `${Date.now()}-${processed.name}`,
    parents: !isPlaceholder ? [folderId] : []
  }

  const media = {
    mimeType: processed.mimeType,
    body: bufferToStream(processed.buffer)
  }

  const driveResponse = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, webContentLink'
  })

  const fileId = driveResponse.data.id

  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    })
  } catch (permErr) {
    console.warn('Gagal mengatur izin publik Google Drive:', permErr.message)
  }

  // High-Resolution Local Proxy API Endpoint for Google Drive Images
  const directUrl = `/api/drive-image/${fileId}`
  return { fileId, directUrl, webViewLink: driveResponse.data.webViewLink }
}

// GET /api/drive-image/:fileId (Streaming gambar langsung dari Google Drive ke Browser)
app.get('/api/drive-image/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    if (!fileId || fileId === 'undefined') {
      return res.status(400).send('Invalid File ID')
    }

    const metaRes = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name'
    })

    const mimeType = metaRes.data.mimeType || 'image/jpeg'
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400')

    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    )

    response.data.pipe(res)
  } catch (err) {
    console.error('Error streaming Google Drive image:', err.message)
    res.status(404).send('Image not found')
  }
})


async function deleteFromGoogleDrive(imageUrl) {
  if (!imageUrl) return
  try {
    const driveMatch = imageUrl.match(/(?:id=|\/d\/|file\/d\/)([a-zA-Z0-9_-]{25,})/)
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1]
      await drive.files.delete({ fileId: fileId })
      console.log(`Berhasil menghapus file dari Google Drive dengan ID: ${fileId}`)
    } else if (imageUrl.startsWith('/uploads/')) {
      const localFilename = path.basename(imageUrl)
      const localPath = path.join(uploadsDir, localFilename)
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath)
        console.log(`Berhasil menghapus file lokal: ${localFilename}`)
      }
    }
  } catch (err) {
    console.warn(`Peringatan saat menghapus file dari Drive/Lokal (${imageUrl}):`, err.message)
  }
}




// POST /upload (Foto ke Google Drive)
app.post('/upload', memoryUpload.single('photo'), async (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file foto yang diunggah (key: "photo").' })
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    const isPlaceholder = !folderId || folderId.includes('MASUKKAN_FOLDER_ID')

    const fileMetadata = {
      name: `${Date.now()}-${req.file.originalname}`,
      parents: !isPlaceholder ? [folderId] : []
    }

    const media = {
      mimeType: req.file.mimetype,
      body: bufferToStream(req.file.buffer)
    }

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    })

    const fileId = driveResponse.data.id

    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: { role: 'reader', type: 'anyone' }
      })
    } catch (permErr) {
      console.warn('Gagal mengatur izin publik:', permErr.message)
    }

    return res.status(200).json({
      message: 'Foto berhasil diunggah ke Google Drive!',
      fileId: fileId,
      webViewLink: driveResponse.data.webViewLink,
      webContentLink: driveResponse.data.webContentLink
    })
  } catch (error) {
    console.error('Error Google Drive upload:', error)
    return res.status(500).json({
      error: 'Gagal mengunggah file ke Google Drive',
      details: error.message
    })
  }
})


function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// ================= AUTH ROUTES =================

// 1. Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, address, phone, email, password, role } = req.body

    if (!name || !address || !phone || !email || !password) {
      return res.status(400).json({ error: 'Seluruh kolom pendaftaran harus diisi!' })
    }

    const { data: existingUsers, error: selectErr } = await db
      .from('users')
      .select('*')
      .eq('email', email)

    if (selectErr) {
      console.error('Supabase select check error:', selectErr)
      return res.status(500).json({ error: 'Gagal memeriksa ketersediaan email.' })
    }

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar!' })
    }

    const finalRole = (role === 'admin' || role === 'user') ? role : 'user'
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: insertedUser, error: insertErr } = await db
      .from('users')
      .insert([{ 
        name, 
        address, 
        phone, 
        email, 
        password: hashedPassword, 
        role: finalRole 
      }])
      .select()

    if (insertErr) {
      console.error('Supabase user insert error:', insertErr)
      return res.status(500).json({ error: 'Gagal menyimpan data pengguna baru.' })
    }

    const newUser = { id: insertedUser[0].id, name, email, role: finalRole }
    const token = generateToken(newUser)

    res.status(201).json({
      token,
      user: newUser
    })
  } catch (error) {
    console.error('Error in register:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat pendaftaran.' })
  }
})

// 2. Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi!' })
    }

    const { data: users, error: selectErr } = await db
      .from('users')
      .select('*')
      .eq('email', email)

    if (selectErr) {
      console.error('Supabase login check error:', selectErr)
      return res.status(500).json({ error: 'Gagal melakukan verifikasi akun.' })
    }

    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Email atau password salah!' })
    }

    const user = users[0]
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Email atau password salah!' })
    }

    const matchedUser = { id: user.id, name: user.name, email: user.email, role: user.role }
    const token = generateToken(matchedUser)

    res.json({
      token,
      user: matchedUser
    })
  } catch (error) {
    console.error('Error in login:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat login.' })
  }
})

// ================= DATA ROUTES =================

// 1. Gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const { data: galleryRows, error: galErr } = await db
      .from('gallery')
      .select('*')
      .order('id', { ascending: false })

    if (galErr) throw galErr

    const { data: projectRows } = await db
      .from('projects')
      .select('id, image_url, created_at')

    const existingUrls = new Set((galleryRows || []).map(g => g.image_url))
    const combined = [...(galleryRows || [])]

    if (projectRows && projectRows.length > 0) {
      projectRows.forEach(p => {
        if (p.image_url && !existingUrls.has(p.image_url)) {
          existingUrls.add(p.image_url)
          combined.push({
            id: `proj-${p.id}`,
            image_url: p.image_url,
            created_at: p.created_at || new Date().toISOString()
          })
        }
      })
    }

    res.json(combined)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})


app.post('/api/gallery', authenticateToken, requireAdmin, memoryUpload.single('image'), async (req, res) => {
  try {
    let imageUrl = ''

    if (req.file) {
      try {
        const driveResult = await uploadToGoogleDrive(req.file.buffer, req.file.mimetype, req.file.originalname)
        imageUrl = driveResult.directUrl
      } catch (driveErr) {
        console.error('Google Drive upload error, falling back to local disk:', driveErr.message)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const localFilename = uniqueSuffix + path.extname(req.file.originalname)
        const localPath = path.join(uploadsDir, localFilename)
        fs.writeFileSync(localPath, req.file.buffer)
        imageUrl = `/uploads/${localFilename}`
      }
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url
    } else {
      return res.status(400).json({ error: 'No image file or URL provided' })
    }

    const { data: inserted, error } = await db
      .from('gallery')
      .insert([{ image_url: imageUrl }])
      .select()

    if (error) throw error
    res.status(201).json(inserted[0])
  } catch (error) {
    console.error('Error creating gallery item:', error)
    res.status(500).json({ error: 'Failed to save gallery item' })
  }
})

app.put('/api/gallery/:id', authenticateToken, requireAdmin, memoryUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params

    const { data: existingRows } = await db.from('gallery').select('*').eq('id', id)
    const oldImageUrl = existingRows && existingRows.length > 0 ? existingRows[0].image_url : null

    let imageUrl = ''

    if (req.file) {
      try {
        const driveResult = await uploadToGoogleDrive(req.file.buffer, req.file.mimetype, req.file.originalname)
        imageUrl = driveResult.directUrl
      } catch (driveErr) {
        console.error('Google Drive upload error, falling back to local disk:', driveErr.message)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const localFilename = uniqueSuffix + path.extname(req.file.originalname)
        const localPath = path.join(uploadsDir, localFilename)
        fs.writeFileSync(localPath, req.file.buffer)
        imageUrl = `/uploads/${localFilename}`
      }
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url
    } else {
      return res.status(400).json({ error: 'No image file or URL provided' })
    }

    const { data, error } = await db
      .from('gallery')
      .update({ image_url: imageUrl })
      .eq('id', id)
      .select()

    if (error) throw error

    if (oldImageUrl && oldImageUrl !== imageUrl) {
      await deleteFromGoogleDrive(oldImageUrl)
    }

    res.json(data[0])
  } catch (error) {
    console.error('Error updating gallery item:', error)
    res.status(500).json({ error: 'Failed to update gallery item' })
  }
})

app.delete('/api/gallery/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { data: rows } = await db.from('gallery').select('*').eq('id', id)
    if (rows && rows.length > 0) {
      await deleteFromGoogleDrive(rows[0].image_url)
    }

    const { error } = await db
      .from('gallery')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Gallery item deleted successfully' })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    res.status(500).json({ error: 'Failed to delete gallery item' })
  }
})


// 2. Projects
app.get('/api/projects', async (req, res) => {
  try {
    const { data: rows, error } = await db
      .from('projects')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error
    res.json(rows || [])
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

app.post('/api/projects', authenticateToken, requireAdmin, memoryUpload.any(), async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    let imageUrls = []

    // Process multiple uploaded file buffers
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const driveResult = await uploadToGoogleDrive(file.buffer, file.mimetype, file.originalname)
          imageUrls.push(driveResult.directUrl)
        } catch (driveErr) {
          console.error('Google Drive upload error, falling back to local disk:', driveErr.message)
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          const localFilename = uniqueSuffix + path.extname(file.originalname)
          const localPath = path.join(uploadsDir, localFilename)
          fs.writeFileSync(localPath, file.buffer)
          imageUrls.push(`/uploads/${localFilename}`)
        }
      }
    } else if (req.body.image_url) {
      // Support multiple comma or newline separated URLs or single URL
      const rawUrl = req.body.image_url.trim()
      if (rawUrl.includes('\n')) {
        imageUrls = rawUrl.split('\n').map(u => u.trim()).filter(Boolean)
      } else if (rawUrl.includes(',')) {
        imageUrls = rawUrl.split(',').map(u => u.trim()).filter(Boolean)
      } else {
        imageUrls = [rawUrl]
      }
    }

    const storedImageUrl = imageUrls.length > 1 ? JSON.stringify(imageUrls) : (imageUrls[0] || null)

    const { data: inserted, error } = await db
      .from('projects')
      .insert([{ title, description, image_url: storedImageUrl }])
      .select()

    if (error) throw error

    // Sync all uploaded project photos to gallery table
    for (const url of imageUrls) {
      try {
        await db.from('gallery').insert([{ image_url: url }])
      } catch (galErr) {
        console.warn('Warning syncing project photo to gallery table:', galErr.message)
      }
    }

    res.status(201).json(inserted[0])
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

app.put('/api/projects/:id', authenticateToken, requireAdmin, memoryUpload.any(), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const { data: existingRows } = await db.from('projects').select('*').eq('id', id)
    const oldImageUrl = existingRows && existingRows.length > 0 ? existingRows[0].image_url : null

    let imageUrls = []

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const driveResult = await uploadToGoogleDrive(file.buffer, file.mimetype, file.originalname)
          imageUrls.push(driveResult.directUrl)
        } catch (driveErr) {
          console.error('Google Drive upload error, falling back to local disk:', driveErr.message)
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          const localFilename = uniqueSuffix + path.extname(file.originalname)
          const localPath = path.join(uploadsDir, localFilename)
          fs.writeFileSync(localPath, file.buffer)
          imageUrls.push(`/uploads/${localFilename}`)
        }
      }
    } else if (req.body.image_url) {
      const rawUrl = req.body.image_url.trim()
      if (rawUrl.includes('\n')) {
        imageUrls = rawUrl.split('\n').map(u => u.trim()).filter(Boolean)
      } else if (rawUrl.includes(',')) {
        imageUrls = rawUrl.split(',').map(u => u.trim()).filter(Boolean)
      } else {
        imageUrls = [rawUrl]
      }
    }

    const updateData = { title, description }
    if (imageUrls.length > 0) {
      updateData.image_url = imageUrls.length > 1 ? JSON.stringify(imageUrls) : imageUrls[0]
    }

    const { data, error } = await db
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    // If new images provided, sync new ones and delete old ones
    if (imageUrls.length > 0 && oldImageUrl) {
      let oldUrls = []
      try {
        if (oldImageUrl.startsWith('[')) {
          oldUrls = JSON.parse(oldImageUrl)
        } else {
          oldUrls = [oldImageUrl]
        }
      } catch (e) {
        oldUrls = [oldImageUrl]
      }

      for (const oldUrl of oldUrls) {
        await deleteFromGoogleDrive(oldUrl)
        try {
          await db.from('gallery').delete().eq('image_url', oldUrl)
        } catch (e) {}
      }

      for (const newUrl of imageUrls) {
        try {
          await db.from('gallery').insert([{ image_url: newUrl }])
        } catch (e) {}
      }
    }

    res.json(data[0])

  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

app.delete('/api/projects/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const { data: rows } = await db.from('projects').select('*').eq('id', id)
    if (rows && rows.length > 0) {
      const oldImageUrl = rows[0].image_url
      if (oldImageUrl) {
        let oldUrls = []
        try {
          if (oldImageUrl.startsWith('[')) {
            oldUrls = JSON.parse(oldImageUrl)
          } else {
            oldUrls = [oldImageUrl]
          }
        } catch (e) {
          oldUrls = [oldImageUrl]
        }

        for (const url of oldUrls) {
          await deleteFromGoogleDrive(url)
          try {
            await db.from('gallery').delete().eq('image_url', url)
          } catch (e) {}
        }
      }
    }

    const { error } = await db
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ error: 'Failed to delete project' })
  }
})



// 3. Contact Us Messages
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields (name, email, message) are required' })
    }

    const { data: inserted, error } = await db
      .from('contact_messages')
      .insert([{ name, email, message }])
      .select()

    if (error) throw error

    try {
      await sendContactEmail({ name, email, message })
    } catch (emailError) {
      console.error('Email failed to send but message was saved to Supabase:', emailError)
    }

    res.status(201).json({
      message: 'Message received and saved successfully',
      id: inserted[0].id
    })
  } catch (error) {
    console.error('Error saving contact message:', error)
    res.status(500).json({ error: 'Failed to submit contact message' })
  }
})

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express API Server running at http://localhost:${PORT}`)
  })
}

export default app
