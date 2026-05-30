import { prisma } from './prismaClient'
import { areas } from './data/areas'

export async function seedAreas() {
  console.log('Seeding areas...')
  for (const area of areas) {
    const city = await prisma.city.findUnique({
      where: { name: area.cityName }
    })

    if (!city) {
      throw new Error(`City not found: ${area.cityName}`)
    }

    await prisma.area.upsert({
      where: {
        name_cityId: {
          name: area.name,
          cityId: city.id
        }
      },
      update: {
        isActive: area.isActive
      },
      create: {
        name: area.name,
        cityId: city.id,
        isActive: area.isActive
      }
    })
  }
  console.log('Areas seeded.')
}

if (require.main === module) {
  seedAreas()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
