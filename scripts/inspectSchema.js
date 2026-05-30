const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    console.log('Listing columns for table "PG":')
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='PG' ORDER BY ordinal_position;`
    )
    console.table(cols.rows)

    console.log('\nCheck if tables Area and City exist:')
    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name IN ('Area','City')`)
    console.table(tables.rows)

    console.log('\n_prisma_migrations (last 10):')
    const migs = await client.query('SELECT id,migration_name,started_at,finished_at,status,applied_steps_count FROM _prisma_migrations ORDER BY started_at DESC LIMIT 20')
    console.table(migs.rows)
  } catch (err) {
    console.error('Error querying DB:', err)
  } finally {
    await client.end()
  }
}

main()
