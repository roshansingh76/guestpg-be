const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query('SELECT email, "passwordHash" FROM "User" WHERE email = $1', ['admin@gmail.com'])
    if (res.rows.length === 0) {
      console.error('admin@gmail.com not found')
      process.exit(1)
    }
    const row = res.rows[0]
    console.log('email:', row.email)
    console.log('hash:', row.passwordHash)
    const match = await bcrypt.compare('12345', row.passwordHash)
    console.log('compare result:', match)
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
