import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
const cfD1DatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID
const cfApiToken = process.env.CLOUDFLARE_API_TOKEN

// In-Memory Database Fallback for Local Development without Cloudflare D1 API Token
const memoryDb = {
  users: [
    {
      id: 1,
      name: 'Administrator',
      address: 'Kantor Pusat Toko Rajut',
      phone: '08123456789',
      email: 'haikaladika8@gmail.com',
      password: '$2b$10$ywdZSKkl4KQN1.W4FUrbOetSJAa2vUBMgF6sUCyY2bMQHeVI8tWsS', // password: Haikal552005
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Budi Santoso',
      address: 'Jl. Kenari No. 12, Jakarta',
      phone: '08987654321',
      email: 'user@tokorajut.com',
      password: '$2b$10$X4TqekfctUWYr8QDqc4kse8iLFX6uh2thNTD7Z8hXAq5afwfrXIHy', // password: user
      role: 'user',
      created_at: new Date().toISOString()
    }
  ],
  gallery: [],

  projects: [
    {
      id: 1,
      title: 'Syal Rajut Kustom Musim Dingin',
      description: 'Syal rajutan tangan lembut berwarna krem terbuat dari benang wol sintetis premium yang memberikan kehangatan ekstra.',
      image_url: '/project-sample.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Topi Kupluk Rajut Handmade',
      description: 'Topi kupluk bergaya modern yang cocok untuk aktivitas sehari-hari di cuaca dingin.',
      image_url: '/gallery-knitting-1.jpg',
      created_at: new Date().toISOString()
    }
  ],

  contact_messages: [],

  about_content: [
    {
      id: 1,
      title: 'Passion & Dedikasi Dalam Setiap Helaian Benang',
      subtitle: 'Cerita di balik kehangatan dan keindahan seni rajut buatan tangan kami.',
      paragraph1: 'Selamat datang di Toko Rajut. Kami percaya bahwa setiap produk rajutan memiliki jiwa dan cerita tersendiri. Kami mengkhususkan diri dalam pembuatan karya rajut tangan eksklusif seperti syal, topi, selimut bayi, hingga dekorasi rumah.',
      paragraph2: 'Setiap pasang tangan perajin kami merajut dengan teknik tradisional yang dipadukan dengan sentuhan estetika modern untuk menghadirkan produk berkualitas tinggi yang hangat dan penuh makna.',
      image_url: '/about-lion.jpg',
      badge_text: '⭐ Terpercaya Sejak 2024'
    }
  ]
}

let isWranglerAvailable = true
let lastWranglerCheck = 0

// Cloudflare D1 Query via Wrangler CLI Fallback
export async function queryD1ViaWrangler(sql, params = []) {
  // If Wrangler CLI previously failed or is unavailable locally, skip to avoid slow subshell execution & log spam
  if (!isWranglerAvailable && Date.now() - lastWranglerCheck < 5 * 60 * 1000) {
    return { success: false, results: [] }
  }

  try {
    let formattedSql = sql
    for (const param of params) {
      const val = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param
      formattedSql = formattedSql.replace('?', val)
    }

    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const command = `${npxCmd} wrangler d1 execute rajut-db --remote --json --command="${formattedSql.replace(/"/g, '\\"')}"`
    const { stdout } = await execAsync(command, { cwd: path.resolve(__dirname, '..'), shell: true, timeout: 5000 })

    const parsed = JSON.parse(stdout)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].success) {
      isWranglerAvailable = true
      return { success: true, results: parsed[0].results || [], meta: parsed[0].meta }
    }
    isWranglerAvailable = false
    lastWranglerCheck = Date.now()
    return { success: false, results: [] }
  } catch (err) {
    isWranglerAvailable = false
    lastWranglerCheck = Date.now()
    return { success: false, results: [] }
  }
}

// Cloudflare D1 REST API Client with Wrangler CLI Fallback
export async function queryD1(sql, params = []) {
  if (cfAccountId && cfD1DatabaseId && cfApiToken) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/d1/database/${cfD1DatabaseId}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql, params })
        }
      )

      const json = await response.json()
      if (json.success && json.result && json.result.length > 0) {
        return { success: true, results: json.result[0].results || [] }
      }
    } catch (err) {
      // Ignore API errors gracefully
    }
  }

  // Fallback to Wrangler CLI if REST API token is invalid or fails
  return queryD1ViaWrangler(sql, params)
}

// Cloudflare D1 QueryBuilder with in-memory fallback
class D1TableQuery {
  constructor(table) {
    this.table = table
    this.operation = 'select'
    this.selectColumns = '*'
    this.selectOptions = {}
    this.insertItems = null
    this.updateData = null
    this.whereConditions = []
    this.orderBy = null
    this.limitVal = null
  }

  eq(column, value) {
    this.whereConditions.push({ col: column, val: value })
    return this
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = `${column} ${ascending ? 'ASC' : 'DESC'}`
    return this
  }

  limit(count) {
    this.limitVal = count
    return this
  }

  select(columns = '*', options = {}) {
    if (this.operation !== 'insert' && this.operation !== 'update') {
      this.operation = 'select'
    }
    this.selectColumns = columns
    this.selectOptions = options
    return this
  }


  insert(items) {
    this.operation = 'insert'
    this.insertItems = items
    return this
  }

  update(updateData) {
    this.operation = 'update'
    this.updateData = updateData
    return this
  }

  delete() {
    this.operation = 'delete'
    return this
  }

  executeInMemory() {
    const tableData = memoryDb[this.table] || []

    if (this.operation === 'select') {
      let results = [...tableData]
      for (const cond of this.whereConditions) {
        results = results.filter(r => String(r[cond.col] || '').toLowerCase() === String(cond.val || '').toLowerCase())
      }
      if (this.orderBy) {
        const [col, dir] = this.orderBy.split(' ')
        results.sort((a, b) => dir === 'DESC' ? (b[col] > a[col] ? 1 : -1) : (a[col] > b[col] ? 1 : -1))
      }
      if (this.limitVal) {
        results = results.slice(0, this.limitVal)
      }
      if (this.selectOptions.count === 'exact') {
        return { data: results, count: results.length, error: null }
      }
      return { data: results, error: null }
    }

    if (this.operation === 'insert') {
      const rows = Array.isArray(this.insertItems) ? this.insertItems : [this.insertItems]
      const insertedResults = []
      for (const row of rows) {
        const currentItems = memoryDb[this.table] || []
        const maxId = currentItems.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
        const newRow = {
          created_at: new Date().toISOString(),
          ...row,
          id: maxId + 1
        }

        if (!memoryDb[this.table]) memoryDb[this.table] = []
        memoryDb[this.table].unshift(newRow)
        insertedResults.push(newRow)
      }
      return { data: insertedResults, error: null }
    }

    if (this.operation === 'update') {
      let updated = []
      const dataArr = memoryDb[this.table] || []
      for (let i = 0; i < dataArr.length; i++) {
        let match = true
        for (const cond of this.whereConditions) {
          if (String(dataArr[i][cond.col]).toLowerCase() !== String(cond.val).toLowerCase()) {
            match = false
            break
          }
        }
        if (match) {
          dataArr[i] = { ...dataArr[i], ...this.updateData }
          updated.push(dataArr[i])
        }
      }
      return { data: updated, error: null }
    }

    if (this.operation === 'delete') {
      if (memoryDb[this.table]) {
        memoryDb[this.table] = memoryDb[this.table].filter(r => {
          for (const cond of this.whereConditions) {
            if (String(r[cond.col]).toLowerCase() === String(cond.val).toLowerCase()) return false
          }
          return true
        })
      }
      return { error: null }
    }
  }

  async execute() {
    // Attempt Cloudflare D1 query (REST API with Wrangler CLI fallback)
    if (this.operation === 'select') {
      let sql = `SELECT ${this.selectColumns === '*' ? '*' : this.selectColumns} FROM ${this.table}`
      const params = []

      if (this.whereConditions.length > 0) {
        const clauses = this.whereConditions.map(c => {
          params.push(c.val)
          return `${c.col} = ?`
        })
        sql += ` WHERE ${clauses.join(' AND ')}`
      }

      if (this.orderBy) {
        sql += ` ORDER BY ${this.orderBy}`
      }

      if (this.limitVal) {
        sql += ` LIMIT ${this.limitVal}`
      }

      const d1Res = await queryD1(sql, params)
      if (d1Res.success) {
        if (this.selectOptions.count === 'exact') {
          return { data: d1Res.results, count: d1Res.results.length, error: null }
        }
        return { data: d1Res.results, error: null }
      }
    }

    if (this.operation === 'insert') {
      const rows = Array.isArray(this.insertItems) ? this.insertItems : [this.insertItems]
      const insertedResults = []
      let allSuccess = true

      for (const row of rows) {
        const keys = Object.keys(row)
        const values = Object.values(row)
        const placeholders = keys.map(() => '?').join(', ')
        const sql = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`

        const d1Res = await queryD1(sql, values)
        if (d1Res.success && d1Res.results && d1Res.results.length > 0) {
          insertedResults.push(d1Res.results[0])
        } else if (d1Res.success) {
          insertedResults.push(row)
        } else {
          allSuccess = false
          break
        }
      }

      if (allSuccess) {
        return { data: insertedResults, error: null }
      }
    }

    if (this.operation === 'update') {
      const keys = Object.keys(this.updateData)
      const values = Object.values(this.updateData)
      const setClause = keys.map(k => `${k} = ?`).join(', ')

      let sql = `UPDATE ${this.table} SET ${setClause}`
      const params = [...values]

      if (this.whereConditions.length > 0) {
        const clauses = this.whereConditions.map(c => {
          params.push(c.val)
          return `${c.col} = ?`
        })
        sql += ` WHERE ${clauses.join(' AND ')}`
      }

      sql += ` RETURNING *`

      const d1Res = await queryD1(sql, params)
      if (d1Res.success) {
        return { data: d1Res.results, error: null }
      }
    }

    if (this.operation === 'delete') {
      let sql = `DELETE FROM ${this.table}`
      const params = []

      if (this.whereConditions.length > 0) {
        const clauses = this.whereConditions.map(c => {
          params.push(c.val)
          return `${c.col} = ?`
        })
        sql += ` WHERE ${clauses.join(' AND ')}`
      }

      const d1Res = await queryD1(sql, params)
      if (d1Res.success) {
        return { error: null }
      }
    }

    // Fallback to in-memory database store
    return this.executeInMemory()
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected)
  }
}

const db = {
  from(tableName) {
    return new D1TableQuery(tableName)
  }
}

console.log('Cloudflare D1 DB client / memory store initialized.')

export default db
