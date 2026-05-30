import { prisma } from './prismaClient'
import { seedRoles } from './01_roles.seed'
import { seedUsers } from './02_users.seed'
import { seedCities } from './03_cities.seed'
import { seedAreas } from './04_areas.seed'

async function main() {
  try {
    console.log('Starting Prisma seed runner...')
    await seedRoles()
    await seedUsers()
    await seedCities()
    await seedAreas()
    console.log('Prisma seed runner complete.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Seed runner failed:', error)
  process.exit(1)
})
