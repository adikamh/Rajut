import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
console.log('Supabase client initialized.')

// Seeding checks
async function initializeDatabase() {
  try {
    // 1. Seed Gallery
    const { count: galleryCount, error: galleryError } = await supabase
      .from('gallery')
      .select('*', { count: 'exact', head: true })
    
    if (galleryError) {
      console.warn('Gallery table check failed. Ensure you created the tables in Supabase SQL Editor. Error:', galleryError.message)
    } else if (galleryCount === 0) {
      const defaultGallery = [
        { image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96' },
        { image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b' },
        { image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea' },
        { image_url: 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a' },
        { image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c' },
        { image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96' }
      ]
      const { error: seedError } = await supabase.from('gallery').insert(defaultGallery)
      if (seedError) console.error('Failed to seed gallery:', seedError.message)
      else console.log('Default gallery seeded on Supabase.')
    }

    // 2. Seed Projects
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (projectError) {
      console.warn('Projects table check failed. Error:', projectError.message)
    } else if (projectCount === 0) {
      const defaultProjects = [
        {
          title: 'Winter Collection 2024',
          description: 'A collection of warm winter accessories including scarves, hats, and gloves.',
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
        },
        {
          title: 'Custom Baby Blankets',
          description: 'Personalized baby blankets with custom colors and patterns.',
          image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b'
        },
        {
          title: 'Home Decor Items',
          description: 'Beautiful knitted pieces for home decoration and comfort.',
          image_url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c'
        }
      ]
      const { error: seedError } = await supabase.from('projects').insert(defaultProjects)
      if (seedError) console.error('Failed to seed projects:', seedError.message)
      else console.log('Default projects seeded on Supabase.')
    }

    // 3. Seed Users
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (userError) {
      console.warn('Users table check failed. Error:', userError.message)
    } else if (userCount === 0) {
      const adminPasswordHash = await bcrypt.hash('admin', 10)
      const userPasswordHash = await bcrypt.hash('user', 10)

      const defaultUsers = [
        {
          name: 'Administrator',
          address: 'Kantor Pusat Toko Rajut',
          phone: '08123456789',
          email: 'admin@tokorajut.com',
          password: adminPasswordHash,
          role: 'admin'
        },
        {
          name: 'Budi Santoso',
          address: 'Jl. Kenari No. 12, Jakarta',
          phone: '08987654321',
          email: 'user@tokorajut.com',
          password: userPasswordHash,
          role: 'user'
        }
      ]
      const { error: seedError } = await supabase.from('users').insert(defaultUsers)
      if (seedError) console.error('Failed to seed users:', seedError.message)
      else console.log('Default user accounts seeded on Supabase.')
    }

  } catch (err) {
    console.error('Supabase initialization check failed:', err.message)
  }
}

// Initialize checks
initializeDatabase()

export default supabase
