import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const client = new Client({ connectionString: process.env.DATABASE_URL })

async function main() {
  await client.connect()

  const cityName = 'Gurgaon'
  const cityState = 'Haryana'
  const pgName = 'Bharat PG'
  const ownerEmail = 'bharat@gmail.com'
  const ownerPassword = '12345'

  const cityResult = await client.query(
    `INSERT INTO "cities" (name, state, status, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (name) DO UPDATE SET state = EXCLUDED.state, status = EXCLUDED.status, updated_at = NOW()
     RETURNING id`,
    [cityName, cityState, 'active']
  )
  const cityId = cityResult.rows[0].id

  const areaResult = await client.query(
    `INSERT INTO "areas" (name, city_id, status, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (name, city_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
     RETURNING id`,
    [cityName, cityId, 'active']
  )
  const areaId = areaResult.rows[0].id

  const pgResult = await client.query(
    `INSERT INTO "pgs" ("pg_name", "owner_name", "owner_phone", "owner_email", "address_line1", "address_line2", "nearby_mark", "area", "city", "area_id", "city_id", "state", "latitude", "longitude", "pg_type", "number_of_rooms", "is_food_available", "status", "created_at", "updated_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
     ON CONFLICT ("owner_email") DO UPDATE SET
       "pg_name" = EXCLUDED."pg_name",
       "owner_name" = EXCLUDED."owner_name",
       "owner_phone" = EXCLUDED."owner_phone",
       "address_line1" = EXCLUDED."address_line1",
       "address_line2" = EXCLUDED."address_line2",
       "nearby_mark" = EXCLUDED."nearby_mark",
       "area" = EXCLUDED."area",
       "city" = EXCLUDED."city",
       "area_id" = EXCLUDED."area_id",
       "city_id" = EXCLUDED."city_id",
       "state" = EXCLUDED."state",
       "latitude" = EXCLUDED."latitude",
       "longitude" = EXCLUDED."longitude",
       "pg_type" = EXCLUDED."pg_type",
       "number_of_rooms" = EXCLUDED."number_of_rooms",
       "is_food_available" = EXCLUDED."is_food_available",
       "status" = EXCLUDED."status",
       "updated_at" = NOW()
     RETURNING id`,
    [
      pgName,
      'Bharat',
      '9811223344',
      ownerEmail,
      'A-12, Sector 14',
      'Near HUDA Metro Station',
      'Near Sector 14 Market',
      cityName,
      cityName,
      areaId,
      cityId,
      cityState,
      28.4751,
      77.0723,
      'Boys',
      10,
      true,
      'active',
    ]
  )
  const pgId = pgResult.rows[0].id

  const hashedPassword = bcrypt.hashSync(ownerPassword, 10)
  const userResult = await client.query(
    `INSERT INTO "users" ("name", "email", "phone", "password_hash", "role", "status", "pg_id", "created_at", "updated_at")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     ON CONFLICT ("email") DO UPDATE SET
       "name" = EXCLUDED."name",
       "phone" = EXCLUDED."phone",
       "password_hash" = EXCLUDED."password_hash",
       "role" = EXCLUDED."role",
       "status" = EXCLUDED."status",
       "pg_id" = EXCLUDED."pg_id",
       "updated_at" = NOW()
     RETURNING id`,
    ['Bharat PG Owner', ownerEmail, '9811223344', hashedPassword, 'pg_owner', 'active', pgId]
  )

  console.log('City:', { id: cityId, name: cityName, state: cityState })
  console.log('Area:', { id: areaId, name: cityName, cityId })
  console.log('PG:', { id: pgId, pgName, ownerEmail })
  console.log('User:', { id: userResult.rows[0].id, email: ownerEmail, pgId })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await client.end()
  })
