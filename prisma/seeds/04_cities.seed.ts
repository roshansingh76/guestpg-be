import { prisma } from './prismaClient'
import { cities } from './data/cities'

export async function seedCities() {
  console.log('Seeding cities...')
  for (const city of cities) {
    let stateId: number | undefined
    if (city.stateName) {
      const state = await prisma.state.findUnique({ where: { name: city.stateName } })
      if (!state) {
        throw new Error(`State not found: ${city.stateName}`)
      }
      stateId = state.id
    }

    await prisma.city.upsert({
      where: { name: city.name },
      update: {
        stateId: stateId ?? null,
        isActive: city.isActive
      },
      create: {
        name: city.name,
        stateId,
        isActive: city.isActive
      }
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
