import { prisma } from './prismaClient'
import { cities } from './data/cities'

export async function seedCities() {
  console.log('Seeding cities...')
  for (const city of cities) {
    await prisma.city.upsert({
      where: { name: city.name },
      update: {
        state: city.state,
        isActive: city.isActive
      },
      create: city
    })
  }
  console.log('Cities seeded.')
}

if (require.main === module) {
  seedCities()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
