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
  const id = args.id
  const all = args.all

  if (!password) {
    console.error('Missing required --password argument')
    process.exit(2)
  }

  if (!email && !id && !all) {
    console.error('Specify one of --email=EMAIL or --id=ID or --all to update all users')
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

    let res
    if (all) {
      res = await client.query('UPDATE "User" SET "passwordHash" = $1 RETURNING id, email', [hashed])
      console.log(`Updated ${res.rowCount} users`)
      console.table(res.rows)
    } else if (email) {
      res = await client.query('UPDATE "User" SET "passwordHash" = $1 WHERE email = $2 RETURNING id, email', [hashed, email])
      if (res.rowCount === 0) {
        console.error('No user found with email', email)
        process.exit(3)
      }
      console.log('Updated user:')
      console.table(res.rows)
    } else if (id) {
      res = await client.query('UPDATE "User" SET "passwordHash" = $1 WHERE id = $2 RETURNING id, email', [hashed, id])
      if (res.rowCount === 0) {
        console.error('No user found with id', id)
        process.exit(3)
      }
      console.log('Updated user:')
      console.table(res.rows)
    }
  } catch (err) {
    console.error('Error updating password:', err)
    process.exit(4)
  } finally {
    await client.end()
  }
}

main()
