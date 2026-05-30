const { Client } = require('pg')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function exists(client, query, params) {
  const res = await client.query(query, params || [])
  return res.rowCount > 0
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    console.log('Ensuring City table exists...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS "City" (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        state TEXT,
        status TEXT DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT now(),
        updatedAt TIMESTAMP DEFAULT now()
      )
    `)

    console.log('Ensuring Area table exists...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Area" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cityId INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        createdAt TIMESTAMP DEFAULT now(),
        updatedAt TIMESTAMP DEFAULT now()
      )
    `)

    console.log('Ensuring unique indexes...')
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "Area_name_cityId_key" ON "Area"(name, cityId)')
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "City_name_key" ON "City"(name)')

    console.log('Adding foreign key for Area.cityId if missing...')
    // Add FK only if not exists
    const fkArea = await client.query(
      `SELECT 1 FROM pg_constraint WHERE conname = 'Area_cityId_fkey' LIMIT 1`
    )
    if (fkArea.rowCount === 0) {
      try {
        await client.query('ALTER TABLE "Area" ADD CONSTRAINT "Area_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"(id) ON DELETE CASCADE')
        console.log('Added Area.cityId FK')
      } catch (err) {
        console.warn('Could not add Area.cityId FK (may already exist):', err.message)
      }
    } else {
      console.log('Area.cityId FK exists')
    }

    console.log('Adding areaId and cityId to PG if missing...')
    const colAreaId = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_name='PG' AND column_name='areaId'`)
    if (colAreaId.rowCount === 0) {
      await client.query('ALTER TABLE "PG" ADD COLUMN "areaId" INTEGER')
      console.log('Added PG.areaId')
    } else console.log('PG.areaId exists')

    const colCityId = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_name='PG' AND column_name='cityId'`)
    if (colCityId.rowCount === 0) {
      await client.query('ALTER TABLE "PG" ADD COLUMN "cityId" INTEGER')
      console.log('Added PG.cityId')
    } else console.log('PG.cityId exists')

    console.log('Adding foreign keys on PG...')
    const fkPgArea = await client.query(`SELECT 1 FROM pg_constraint WHERE conname = 'PG_areaId_fkey' LIMIT 1`)
    if (fkPgArea.rowCount === 0) {
      try {
        await client.query('ALTER TABLE "PG" ADD CONSTRAINT "PG_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"(id) ON DELETE RESTRICT')
        console.log('Added PG.areaId FK')
      } catch (err) {
        console.warn('Could not add PG.areaId FK:', err.message)
      }
    } else console.log('PG.areaId FK exists')

    const fkPgCity = await client.query(`SELECT 1 FROM pg_constraint WHERE conname = 'PG_cityId_fkey' LIMIT 1`)
    if (fkPgCity.rowCount === 0) {
      try {
        await client.query('ALTER TABLE "PG" ADD CONSTRAINT "PG_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"(id) ON DELETE RESTRICT')
        console.log('Added PG.cityId FK')
      } catch (err) {
        console.warn('Could not add PG.cityId FK:', err.message)
      }
    } else console.log('PG.cityId FK exists')

    console.log('\nSchema fix completed.')
  } catch (err) {
    console.error('Error fixing schema:', err)
  } finally {
    await client.end()
  }
}

main()
