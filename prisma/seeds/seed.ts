import { prisma } from './prismaClient'
import { seedRoles } from './01_roles.seed'
import { seedUsers } from './02_users.seed'
import { seedCities } from './03_cities.seed'
import { seedAreas } from './04_areas.seed'
import { seedAmenities } from './05_amenities.seed'
import { seedPhotoCategories } from './06_photo_categories.seed'
import { seedExpenseCategories } from './07_expense_categories.seed'

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
    await runWithRetry(seedCities, 'seedCities')
    await runWithRetry(seedAreas, 'seedAreas')
    await runWithRetry(seedAmenities, 'seedAmenities')
    await runWithRetry(seedPhotoCategories, 'seedPhotoCategories')
    await runWithRetry(seedExpenseCategories, 'seedExpenseCategories')
    console.log('Prisma seed runner complete.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Seed runner failed:', error)
  process.exit(1)
})
