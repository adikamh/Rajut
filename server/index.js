import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from './db.js' // db is now the Supabase client
import { sendContactEmail } from './mailer.js'
import { authenticateToken, requireAdmin } from './authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    const { data: rows, error } = await db
      .from('gallery')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error
    res.json(rows || [])
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

app.put('/api/gallery/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    let imageUrl = ''

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
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
    res.json(data[0])
  } catch (error) {
    console.error('Error updating gallery item:', error)
    res.status(500).json({ error: 'Failed to update gallery item' })
  }
})

app.delete('/api/gallery/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
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

app.post('/api/projects', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    let imageUrl = null
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url
    }

    const { data: inserted, error } = await db
      .from('projects')
      .insert([{ title, description, image_url: imageUrl }])
      .select()

    if (error) throw error
    res.status(201).json(inserted[0])
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

app.put('/api/projects/:id', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    let imageUrl = req.body.image_url || null
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    }

    const updateData = { title, description }
    if (imageUrl !== null && imageUrl !== undefined) {
      updateData.image_url = imageUrl
    }

    const { data, error } = await db
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error
    res.json(data[0])
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

app.delete('/api/projects/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
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
