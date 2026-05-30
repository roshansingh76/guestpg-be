#!/usr/bin/env node
const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const SALT_ROUNDS = 10

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  args.forEach((arg) => {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=')
      out[k] = v === undefined ? true : v
    }
  })
  return out
}

async function main() {
  const args = parseArgs()
  const password = args.password
  const email = args.email
  const name = args.name || 'Admin'
  const phone = args.phone || '0000000000'
  const role = args.role || 'super_admin'

  if (!password || !email) {
    console.error('Usage: node createAdmin.js --email=EMAIL --password=PWD [--name=NAME] [--phone=PHONE] [--role=ROLE]')
    process.exit(2)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set in .env')
    process.exit(2)
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)

    // Check if user exists
    const existing = await client.query('SELECT id, email FROM "User" WHERE email = $1', [email])
    if (existing.rowCount > 0) {
      console.log('User already exists. Updating password and role...')
      const res = await client.query(
        'UPDATE "User" SET "passwordHash" = $1, "role" = $2, name = $3, phone = $4 WHERE email = $5 RETURNING id, email',
        [hashed, role, name, phone, email]
      )
      console.table(res.rows)
    } else {
      const res = await client.query(
        'INSERT INTO "User" (name, email, phone, "passwordHash", role, status, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING id, email',
        [name, email, phone, hashed, role, 'active']
      )
      console.log('Created user:')
      console.table(res.rows)
    }
  } catch (err) {
    console.error('Error creating/updating admin user:', err)
    process.exit(3)
  } finally {
    await client.end()
  }
}

main()
