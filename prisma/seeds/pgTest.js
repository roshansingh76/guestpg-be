const { Client } = require('pg')

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('No DATABASE_URL in env')
    process.exit(1)
  }
  const client = new Client({ connectionString: url })
  try {
    console.log('Connecting with pg client...')
    await client.connect()
    const res = await client.query('SELECT 1 as val')
    console.log('pg result:', res.rows)
    await client.end()
  } catch (err) {
    console.error('pg client error:', err)
    try { await client.end() } catch (e) {}
    process.exit(1)
  }
}

run()
