import { prisma } from './prismaClient'

const photoCategories = [
  { name: 'Banner Image', description: 'Primary banner image for the PG listing' },
  { name: 'Interior Photos', description: 'Interior room and common area photos' },
  { name: 'Exterior Photos', description: 'Exterior property and street view photos' },
]

export async function seedPhotoCategories() {
  console.log('Seeding photo categories...')
  for (const category of photoCategories) {
    await prisma.photoCategory.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    })
  }
  console.log('Photo categories seeded.')
}

if (require.main === module) {
  seedPhotoCategories()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
