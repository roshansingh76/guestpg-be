import { prisma } from './prismaClient'
import { seedRoles } from './01_roles.seed'
import { seedUsers } from './02_users.seed'
import { seedStates } from './03_states.seed'
import { seedCities } from './04_cities.seed'
import { seedAreas } from './05_areas.seed'
import { seedAmenities } from './06_amenities.seed'
import { seedPhotoCategories } from './07_photo_categories.seed'
import { seedExpenseCategories } from './08_expense_categories.seed'
import { seedPgOwners } from './09_pg_owners.seed'
import { seedPGs } from './10_pgs.seed'
import { seedRooms } from './11_rooms.seed'
import { seedTenants } from './12_tenants.seed'

async function main() {
  try {
    console.log('Starting Prisma seed runner...')

    // Ensure a stable DB connection with retries before running any seeds
    const maxConnectAttempts = 5
    let connectAttempt = 0
    while (connectAttempt < maxConnectAttempts) {
      try {
        connectAttempt++
        await prisma.$connect()
        console.log('Prisma connected to DB')
        break
      } catch (err: any) {
        console.error(`DB connect attempt ${connectAttempt} failed:`, err?.message || err)
        if (connectAttempt >= maxConnectAttempts) throw err
        const wait = 500 * Math.pow(2, connectAttempt - 1)
        console.log(`Waiting ${wait}ms before retrying DB connection...`)
        await new Promise((r) => setTimeout(r, wait))
      }
    }

    async function runWithRetry(fn: () => Promise<void>, name: string, attempts = 4) {
      let attempt = 0
      const baseDelay = 500
      while (attempt < attempts) {
        try {
          attempt++
          await fn()
          console.log(`${name} - succeeded`)
          return
        } catch (err: any) {
          const isTransient = err?.code === 'P1017' || err?.message?.includes('ConnectionClosed') || err?.code === 'P1001'
          console.error(`${name} - attempt ${attempt} failed:`, err?.message || err)
          if (!isTransient || attempt >= attempts) throw err
          const delay = baseDelay * Math.pow(2, attempt - 1)
          console.log(`${name} - transient error, retrying in ${delay}ms...`)
          await new Promise((r) => setTimeout(r, delay))
        }
      }
    }

    await runWithRetry(seedRoles, 'seedRoles')
    await runWithRetry(seedUsers, 'seedUsers')
    await runWithRetry(seedStates, 'seedStates')
    await runWithRetry(seedCities, 'seedCities')
    await runWithRetry(seedAreas, 'seedAreas')
    await runWithRetry(seedAmenities, 'seedAmenities')
    await runWithRetry(seedPhotoCategories, 'seedPhotoCategories')
    await runWithRetry(seedExpenseCategories, 'seedExpenseCategories')
    await runWithRetry(seedPgOwners, 'seedPgOwners')
    await runWithRetry(seedPGs, 'seedPGs')
    await runWithRetry(seedRooms, 'seedRooms')
    await runWithRetry(seedTenants, 'seedTenants')
    console.log('Prisma seed runner complete.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Seed runner failed:', error)
  process.exit(1)
})
