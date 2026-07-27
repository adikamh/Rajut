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

let isWranglerAvailable = true
let lastWranglerCheck = 0

// Cloudflare D1 Query via Wrangler CLI Fallback
export async function queryD1ViaWrangler(sql, params = []) {
  if (!isWranglerAvailable && Date.now() - lastWranglerCheck < 5 * 60 * 1000) {
    return { success: false, results: [], error: 'Wrangler CLI unavailable' }
  }

  try {
    let formattedSql = sql
    for (const param of params) {
      const val = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param
      formattedSql = formattedSql.replace('?', val)
    }

    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const command = `${npxCmd} wrangler d1 execute rajut-db --remote --json --command="${formattedSql.replace(/"/g, '\\"')}"`
    const { stdout } = await execAsync(command, { cwd: path.resolve(__dirname, '..'), shell: true, timeout: 8000 })

    const parsed = JSON.parse(stdout)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].success) {
      isWranglerAvailable = true
      return { success: true, results: parsed[0].results || [], meta: parsed[0].meta }
    }
    isWranglerAvailable = false
    lastWranglerCheck = Date.now()
    return { success: false, results: [], error: 'Wrangler query failed' }
  } catch (err) {
    isWranglerAvailable = false
    lastWranglerCheck = Date.now()
    return { success: false, results: [], error: err.message }
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
      console.warn('Cloudflare D1 REST API Error:', err.message)
    }
  }

  // Fallback to Wrangler CLI if REST API token is invalid or fails
  return queryD1ViaWrangler(sql, params)
}

// Cloudflare D1 QueryBuilder
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

  async execute() {
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
      return { data: [], error: d1Res.error || 'D1 select query failed' }
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
      return { data: null, error: 'D1 insert query failed' }
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
      return { data: null, error: 'D1 update query failed' }
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
      return { error: 'D1 delete query failed' }
    }

    return { data: null, error: 'Unsupported DB operation' }
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

console.log('Cloudflare D1 DB client initialized.')

export default db
