const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    const res = await client.query('SELECT "passwordHash" FROM "User" WHERE email = $1', ['admin@gmail.com'])
    const hash = res.rows[0]?.passwordHash
    console.log('hash:', JSON.stringify(hash))
    console.log('length:', hash?.length)
  } catch (err) {
    console.error('error:', err)
  } finally {
    await client.end()
  }
}

main()
