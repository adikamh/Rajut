import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
}

const dbName = process.env.DB_NAME || 'rajut'

let pool

async function initializeDatabase() {
  try {
    // 1. Create connection without DB name to run CREATE DATABASE
    const connection = await mysql.createConnection(dbConfig)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    await connection.end()

    // 2. Create connection pool with DB name
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    console.log(`Connected to MySQL database "${dbName}"`)

    // 3. Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Migration check: check if image_url column exists in projects
    const [projectCols] = await pool.query("SHOW COLUMNS FROM projects LIKE 'image_url'")
    if (projectCols.length === 0) {
      await pool.query('ALTER TABLE projects ADD COLUMN image_url VARCHAR(255) NULL')
      console.log('Migrated projects table: Added image_url column.')
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Database tables verified/created successfully.')

    // 4. Seed initial data if tables are empty
    const [galleryRows] = await pool.query('SELECT COUNT(*) as count FROM gallery')
    if (galleryRows[0].count === 0) {
      const defaultGallery = [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
        'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
        'https://images.unsplash.com/photo-1601762603339-fd61e28b698a',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
      ]
      for (const img of defaultGallery) {
        await pool.query('INSERT INTO gallery (image_url) VALUES (?)', [img])
      }
      console.log('Default gallery images seeded.')
    }

    const [projectsRows] = await pool.query('SELECT COUNT(*) as count FROM projects')
    if (projectsRows[0].count === 0) {
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
      for (const proj of defaultProjects) {
        await pool.query('INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)', [proj.title, proj.description, proj.image_url])
      }
      console.log('Default projects seeded.')
    }

    // 5. Seed default users
    const [usersRows] = await pool.query('SELECT COUNT(*) as count FROM users')
    if (usersRows[0].count === 0) {
      const adminPasswordHash = await bcrypt.hash('admin', 10)
      await pool.query(`
        INSERT INTO users (name, address, phone, email, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Administrator', 'Kantor Pusat Toko Rajut', '08123456789', 'admin@tokorajut.com', adminPasswordHash, 'admin'])
      
      const userPasswordHash = await bcrypt.hash('user', 10)
      await pool.query(`
        INSERT INTO users (name, address, phone, email, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Budi Santoso', 'Jl. Kenari No. 12, Jakarta', '08987654321', 'user@tokorajut.com', userPasswordHash, 'user'])
      
      console.log('Default user accounts seeded.')
    }

  } catch (error) {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

// Initialize database
await initializeDatabase()

export default {
  query: (sql, params) => pool.query(sql, params),
  pool
}
