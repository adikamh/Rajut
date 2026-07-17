import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from './db.js'
import { sendContactEmail } from './mailer.js'
import { authenticateToken, requireAdmin } from './authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'rajut_secret_token_key_123!'

// Ensure the public uploads directory exists
const uploadsDir = path.resolve(__dirname, '../public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
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

    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar!' })
    }

    const finalRole = (role === 'admin' || role === 'user') ? role : 'user'
    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(`
      INSERT INTO users (name, address, phone, email, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, address, phone, email, hashedPassword, finalRole])

    const newUser = { id: result.insertId, name, email, role: finalRole }
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

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
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
    const [rows] = await db.query('SELECT * FROM gallery ORDER BY id DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    res.status(500).json({ error: 'Failed to fetch gallery' })
  }
})

app.post('/api/gallery', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = ''

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url
    } else {
      return res.status(400).json({ error: 'No image file or URL provided' })
    }

    const [result] = await db.query('INSERT INTO gallery (image_url) VALUES (?)', [imageUrl])
    res.status(201).json({ id: result.insertId, image_url: imageUrl })
  } catch (error) {
    console.error('Error creating gallery item:', error)
    res.status(500).json({ error: 'Failed to save gallery item' })
  }
})

// 2. Projects
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM projects ORDER BY id DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

app.post('/api/projects', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const [result] = await db.query('INSERT INTO projects (title, description) VALUES (?, ?)', [title, description])
    res.status(201).json({ id: result.insertId, title, description })
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// 3. Contact Us Messages
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields (name, email, message) are required' })
    }

    const [result] = await db.query(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    )

    try {
      await sendContactEmail({ name, email, message })
    } catch (emailError) {
      console.error('Email failed to send but message was saved to database:', emailError)
    }

    res.status(201).json({
      message: 'Message received and saved successfully',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error saving contact message:', error)
    res.status(500).json({ error: 'Failed to submit contact message' })
  }
})

app.listen(PORT, () => {
  console.log(`Express API Server running at http://localhost:${PORT}`)
})
