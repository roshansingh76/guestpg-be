import { prisma } from './prismaClient'
import { states } from './data/states'

export async function seedStates() {
  console.log('Seeding states...')
  for (const state of states) {
    await prisma.state.upsert({
      where: { name: state.name },
      update: {
        isActive: state.isActive
      },
      create: state
    })
  }
  console.log('States seeded.')
}

if (require.main === module) {
  seedStates()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
