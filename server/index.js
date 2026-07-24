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

import db from './db.js' // db client for Cloudflare D1
import { sendContactEmail, sendOtpEmail } from './mailer.js'
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

// In-memory OTP storage for registration
const registerOtpStore = new Map()

// 1a. Request Register OTP Code (With Email Uniqueness Check)
app.post('/api/auth/register-request-otp', async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body

    if (!name || !address || !phone || !email || !password) {
      return res.status(400).json({ error: 'Seluruh kolom pendaftaran harus diisi!' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Format alamat email tidak valid!' })
    }

    // Check if email ALREADY exists in database
    const { data: existingUsers } = await db
      .from('users')
      .select('*')
      .eq('email', cleanEmail)

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email ini sudah terdaftar! Gunakan email lain atau silakan Masuk.' })
    }

    // Cooldown check (60 seconds)
    const existingOtp = registerOtpStore.get(cleanEmail)
    const now = Date.now()
    if (existingOtp && now - existingOtp.lastSentAt < 60 * 1000) {
      const remainingSecs = Math.ceil((60 * 1000 - (now - existingOtp.lastSentAt)) / 1000)
      return res.status(429).json({
        error: `Harap tunggu ${remainingSecs} detik sebelum meminta ulang kode OTP pendaftaran!`
      })
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    registerOtpStore.set(cleanEmail, {
      code: otpCode,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      password,
      expiresAt: now + 5 * 60 * 1000,
      lastSentAt: now
    })

    // Send OTP via Nodemailer
    try {
      await sendOtpEmail({ email: cleanEmail, otpCode, userName: name.trim() })
    } catch (mailErr) {
      console.error('Error sending registration OTP email:', mailErr)
    }

    res.json({
      message: `Kode OTP pendaftaran berhasil dikirim ke ${cleanEmail}! Silakan periksa inbox / spam email Anda.`
    })
  } catch (error) {
    console.error('Error in register-request-otp:', error)
    res.status(500).json({ error: 'Gagal memproses permintaan OTP pendaftaran.' })
  }
})

// 1b. Verify Register OTP Code & Create User Account
app.post('/api/auth/register-verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email dan kode OTP harus diisi!' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    const storedOtp = registerOtpStore.get(cleanEmail)
    if (!storedOtp) {
      return res.status(400).json({ error: 'Kode OTP tidak ditemukan atau telah kadaluarsa. Silakan minta ulang kode OTP.' })
    }

    if (Date.now() > storedOtp.expiresAt) {
      registerOtpStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Kode OTP telah kadaluarsa! Silakan minta ulang kode OTP baru.' })
    }

    if (storedOtp.code !== cleanOtp) {
      return res.status(400).json({ error: 'Kode OTP yang Anda masukkan salah!' })
    }

    // Double check email uniqueness in database
    const { data: existingUsers } = await db
      .from('users')
      .select('*')
      .eq('email', cleanEmail)

    if (existingUsers && existingUsers.length > 0) {
      registerOtpStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Email ini sudah terdaftar! Silakan gunakan email lain.' })
    }

    // Hash password and insert into users table
    const hashedPassword = await bcrypt.hash(storedOtp.password, 10)
    const newUserData = {
      name: storedOtp.name,
      address: storedOtp.address,
      phone: storedOtp.phone,
      email: cleanEmail,
      password: hashedPassword,
      role: 'user'
    }

    const { data: insertedUser } = await db
      .from('users')
      .insert([newUserData])

    registerOtpStore.delete(cleanEmail)

    const createdUser = (insertedUser && insertedUser.length > 0) 
      ? { id: insertedUser[0].id, name: storedOtp.name, email: cleanEmail, role: 'user' }
      : { id: Date.now(), name: storedOtp.name, email: cleanEmail, role: 'user' }

    const token = generateToken(createdUser)

    res.status(201).json({
      token,
      user: createdUser,
      message: 'Pendaftaran akun berhasil! Selamat datang di Toko Rajut.'
    })
  } catch (error) {
    console.error('Error in register-verify-otp:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi kode OTP.' })
  }
})

// 1c. Register User (Direct Fallback)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, address, phone, email, password, role } = req.body

    if (!name || !address || !phone || !email || !password) {
      return res.status(400).json({ error: 'Seluruh kolom pendaftaran harus diisi!' })
    }

    const cleanEmail = email.trim().toLowerCase()

    const { data: existingUsers } = await db
      .from('users')
      .select('*')
      .eq('email', cleanEmail)

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email ini sudah terdaftar! Gunakan email lain atau silakan Masuk.' })
    }

    const finalRole = (role === 'admin' || role === 'user') ? role : 'user'
    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: insertedUser } = await db
      .from('users')
      .insert([{ 
        name: name.trim(), 
        address: address.trim(), 
        phone: phone.trim(), 
        email: cleanEmail, 
        password: hashedPassword, 
        role: finalRole 
      }])

    const createdUser = (insertedUser && insertedUser.length > 0) 
      ? { id: insertedUser[0].id, name: name.trim(), email: cleanEmail, role: finalRole }
      : { id: Date.now(), name: name.trim(), email: cleanEmail, role: finalRole }

    const token = generateToken(createdUser)

    res.status(201).json({
      token,
      user: createdUser
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
      console.error('Cloudflare D1 login check error:', selectErr)
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

// In-memory OTP storage: key = email.toLowerCase() -> { code, expiresAt, lastSentAt }
const otpStore = new Map()

// 2b. Request Reset Password OTP Code
app.post('/api/auth/request-otp', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Alamat email harus diisi!' })
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Check if user exists in D1 database
    let targetUser = null

    try {
      const { data: users } = await db
        .from('users')
        .select('*')
        .eq('email', cleanEmail)

      if (users && users.length > 0) {
        targetUser = users[0]
      }
    } catch (err) {
      console.warn('D1 query fallback for request-otp:', err.message)
    }

    // 2. Fallback check or auto-locate user by email for smooth OTP flow
    if (!targetUser) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(cleanEmail)) {
        targetUser = {
          id: Date.now(),
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'user'
        }
      } else {
        return res.status(400).json({ error: 'Format alamat email tidak valid!' })
      }
    }

    // Cooldown check (60 seconds resend interval restriction)
    const existingOtp = otpStore.get(cleanEmail)
    const now = Date.now()

    if (existingOtp && now - existingOtp.lastSentAt < 60 * 1000) {
      const remainingSecs = Math.ceil((60 * 1000 - (now - existingOtp.lastSentAt)) / 1000)
      return res.status(429).json({
        error: `Harap tunggu ${remainingSecs} detik sebelum meminta ulang kode OTP baru!`
      })
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = now + 5 * 60 * 1000 // Valid for 5 minutes

    otpStore.set(cleanEmail, {
      code: otpCode,
      expiresAt,
      lastSentAt: now
    })

    // Send Email via mailer.js
    try {
      await sendOtpEmail({ email: cleanEmail, name: targetUser.name || 'Pengguna', otpCode })
    } catch (emailErr) {
      console.error('Failed to send OTP email via SMTP:', emailErr)
    }

    res.json({
      message: `Kode OTP 6-digit telah dikirim ke email ${cleanEmail}! Cek kotak masuk atau spam Anda.`,
      cooldownSeconds: 60
    })
  } catch (error) {
    console.error('Error requesting OTP:', error)
    res.status(500).json({ error: 'Gagal mengirimkan kode OTP.' })
  }
})

// 2c. Verify Reset OTP Code Only (Step 2 Verification)
app.post('/api/auth/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email dan kode OTP harus diisi!' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    const storedOtpData = otpStore.get(cleanEmail)

    if (!storedOtpData) {
      return res.status(400).json({ error: 'Kode OTP tidak ditemukan atau telah dikirim ulang. Silakan minta kode baru.' })
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Kode OTP telah kadaluarsa! Silakan klik Kirim Ulang OTP.' })
    }

    if (storedOtpData.code !== cleanOtp) {
      return res.status(400).json({ error: 'Kode OTP yang Anda masukkan tidak sesuai!' })
    }

    res.json({
      success: true,
      message: 'Kode OTP berhasil diverifikasi! Silakan buat kata sandi baru Anda.'
    })
  } catch (error) {
    console.error('Error verifying reset OTP:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi kode OTP.' })
  }
})

// 2d. Reset Password with Verified OTP (Step 3)
app.post('/api/auth/reset-password-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, kode OTP, dan kata sandi baru harus diisi!' })
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'Kata sandi baru minimal 4 karakter!' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    // 1. Verify OTP in store
    const storedOtpData = otpStore.get(cleanEmail)

    if (!storedOtpData) {
      return res.status(400).json({ error: 'Kode OTP tidak ditemukan atau telah dikirim ulang. Silakan minta kode baru.' })
    }

    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(cleanEmail)
      return res.status(400).json({ error: 'Kode OTP telah kadaluarsa! Silakan klik Kirim Ulang OTP.' })
    }

    if (storedOtpData.code !== cleanOtp) {
      return res.status(400).json({ error: 'Kode OTP yang Anda masukkan tidak sesuai!' })
    }

    // 2. Fetch user and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
      await db
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', cleanEmail)
    } catch (updateErr) {
      console.warn('D1 update error for reset-password-otp:', updateErr.message)
    }

    // Clear OTP after successful use
    otpStore.delete(cleanEmail)

    res.json({
      message: 'Kata sandi berhasil diperbarui! Silakan login dengan kata sandi baru Anda.'
    })
  } catch (error) {
    console.error('Error verifying OTP & reset password:', error)
    res.status(500).json({ error: 'Terjadi kesalahan saat verifikasi OTP.' })
  }
})

// Helper to scan and fetch all image files from Google Drive Folder
async function fetchGoogleDriveFolderImages() {
  const images = []
  try {
    let rawFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || ''
    if (rawFolderId.includes('?')) rawFolderId = rawFolderId.split('?')[0]
    const folderId = rawFolderId.trim()

    if (!driveAuthClient || !folderId || folderId.includes('MASUKKAN_FOLDER_ID')) {
      return images
    }

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, createdTime)',
      pageSize: 100,
      orderBy: 'createdTime desc'
    })

    if (res.data && res.data.files) {
      const imageExtRegex = /\.(jpg|jpeg|png|webp|heic|heif|gif|bmp|svg|tiff|avif)$/i
      for (const file of res.data.files) {
        const isImageMime = file.mimeType && file.mimeType.startsWith('image/')
        const isImageExt = file.name && imageExtRegex.test(file.name)
        if (isImageMime || isImageExt) {
          images.push({
            id: `drive-${file.id}`,
            image_url: `/api/drive-image/${file.id}`,
            created_at: file.createdTime || new Date().toISOString()
          })
        }
      }
    }
  } catch (err) {
    console.warn('Google Drive Folder Auto-Scan warning:', err.message)
  }
  return images
}

// 1. Gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const { data: galleryRows, error: galErr } = await db
      .from('gallery')
      .select('*')
      .order('id', { ascending: false })

    if (galErr) throw galErr

    const existingUrls = new Set((galleryRows || []).map(g => g.image_url))
    const combined = [...(galleryRows || [])]

    // 1. Scan and automatically include photos from Google Drive folder
    const driveImages = await fetchGoogleDriveFolderImages()
    driveImages.forEach(dImg => {
      if (!existingUrls.has(dImg.image_url)) {
        existingUrls.add(dImg.image_url)
        combined.unshift(dImg)
      }
    })

    // 2. Include project images
    const { data: projectRows } = await db
      .from('projects')
      .select('id, image_url, created_at')

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
      const driveResult = await uploadToGoogleDrive(req.file.buffer, req.file.mimetype, req.file.originalname)
      imageUrl = driveResult.directUrl
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
      const driveResult = await uploadToGoogleDrive(req.file.buffer, req.file.mimetype, req.file.originalname)
      imageUrl = driveResult.directUrl
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


// About Section Content API
app.get('/api/about', async (req, res) => {
  try {
    const { data, error } = await db.from('about_content').select('*').limit(1)
    if (error) throw error
    if (data && data.length > 0) {
      return res.json(data[0])
    }
    return res.json({
      id: 1,
      title: 'Passion & Dedikasi Dalam Setiap Helaian Benang',
      subtitle: 'Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.',
      paragraph1: 'Selamat datang di Toko Rajut. Kami percaya bahwa setiap produk rajutan memiliki jiwa dan cerita tersendiri. Kami mengkhususkan diri dalam pembuatan karya rajut tangan eksklusif seperti syal, topi, selimut bayi, hingga dekorasi rumah.',
      paragraph2: 'Setiap pasang tangan perajin kami merajut dengan teknik tradisional yang dipadukan dengan sentuhan estetika modern untuk menghadirkan produk berkualitas tinggi yang hangat dan penuh makna.',
      image_url: '/about-lion.jpg',
      badge_text: '⭐ Terpercaya Sejak 2024'
    })
  } catch (error) {
    console.error('Error fetching about content:', error)
    res.status(500).json({ error: 'Failed to fetch about content' })
  }
})

app.put('/api/about', authenticateToken, requireAdmin, memoryUpload.single('image_file'), async (req, res) => {
  try {
    const { title, subtitle, paragraph1, paragraph2, badge_text, image_url } = req.body
    let finalImageUrl = image_url

    if (req.file) {
      const isDriveConfigured = !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REFRESH_TOKEN
      )

      if (!isDriveConfigured) {
        return res.status(500).json({
          error: 'Gagal mengunggah gambar: Kredensial Google Drive API belum dikonfigurasi!'
        })
      }

      const driveRes = await uploadFileToDrive(req.file)
      if (!driveRes.success) {
        return res.status(500).json({
          error: `Gagal mengunggah gambar ke Google Drive: ${driveRes.error}`
        })
      }

      finalImageUrl = driveRes.fileUrl
    }

    const { data: existing } = await db.from('about_content').select('*').limit(1)

    let updatedData
    const updatePayload = {
      title: title || 'Passion & Dedikasi Dalam Setiap Helaian Benang',
      subtitle: subtitle || 'Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.',
      paragraph1: paragraph1 || '',
      paragraph2: paragraph2 || '',
      badge_text: badge_text || '⭐ Terpercaya Sejak 2024'
    }

    if (finalImageUrl && finalImageUrl.trim() !== '') {
      updatePayload.image_url = finalImageUrl
    }

    if (existing && existing.length > 0) {
      const { data, error } = await db.from('about_content').update(updatePayload).eq('id', existing[0].id)
      if (error) throw error
      updatedData = data && data.length > 0 ? data[0] : { ...existing[0], ...updatePayload }
    } else {
      updatePayload.id = 1
      if (!updatePayload.image_url) updatePayload.image_url = '/about-lion.jpg'
      const { data, error } = await db.from('about_content').insert([updatePayload])
      if (error) throw error
      updatedData = data && data.length > 0 ? data[0] : updatePayload
    }

    res.json({
      message: 'Konten Tentang Kami berhasil diperbarui!',
      data: updatedData
    })
  } catch (error) {
    console.error('Error updating about content:', error)
    res.status(500).json({ error: error.message || 'Failed to update about content' })
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
      return res.status(400).json({ error: 'Judul dan deskripsi proyek harus diisi!' })
    }

    let imageUrls = []

    // Process multiple uploaded file buffers with Google Drive + Local fallback
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const driveResult = await uploadToGoogleDrive(file.buffer, file.mimetype, file.originalname)
          imageUrls.push(driveResult.directUrl)
        } catch (driveErr) {
          console.warn('Google Drive upload fallback to local storage:', driveErr.message)
          const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname || '.jpg')}`
          const filePath = path.join(uploadsDir, uniqueFilename)
          fs.writeFileSync(filePath, file.buffer)
          imageUrls.push(`/uploads/${uniqueFilename}`)
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

    if (imageUrls.length === 0) {
      imageUrls = ['/project-sample.jpg']
    }

    const storedImageUrl = imageUrls.length > 1 ? JSON.stringify(imageUrls) : imageUrls[0]

    const newProjectData = {
      title: title.trim(),
      description: description.trim(),
      image_url: storedImageUrl,
      created_at: new Date().toISOString()
    }

    const { data: inserted, error } = await db
      .from('projects')
      .insert([newProjectData])

    const createdItem = (inserted && inserted.length > 0) ? inserted[0] : { id: Date.now(), ...newProjectData }

    // Sync all uploaded project photos to gallery table
    for (const url of imageUrls) {
      try {
        await db.from('gallery').insert([{ image_url: url }])
      } catch (galErr) {
        console.warn('Warning syncing project photo to gallery table:', galErr.message)
      }
    }

    res.status(201).json(createdItem)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: error.message || 'Gagal menyimpan proyek' })
  }
})

app.put('/api/projects/:id', authenticateToken, requireAdmin, memoryUpload.any(), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Judul dan deskripsi proyek harus diisi!' })
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
          console.warn('Google Drive upload fallback to local storage:', driveErr.message)
          const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname || '.jpg')}`
          const filePath = path.join(uploadsDir, uniqueFilename)
          fs.writeFileSync(filePath, file.buffer)
          imageUrls.push(`/uploads/${uniqueFilename}`)
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

    const updateData = { title: title.trim(), description: description.trim() }
    if (imageUrls.length > 0) {
      updateData.image_url = imageUrls.length > 1 ? JSON.stringify(imageUrls) : imageUrls[0]
    }

    const { data, error } = await db
      .from('projects')
      .update(updateData)
      .eq('id', id)

    const updatedItem = (data && data.length > 0) ? data[0] : { id, ...updateData, image_url: updateData.image_url || oldImageUrl }

    res.json(updatedItem)
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Gagal memperbarui proyek' })
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
      console.error('Email failed to send but message was saved to Cloudflare D1:', emailError)
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express API Server running at http://localhost:${PORT}`)
  })
}

export default app
