import { prisma } from './prismaClient'
import { roles } from './data/roles'

export async function seedRoles() {
  console.log('Seeding role definitions...')
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
        isSystem: role.isSystem
      },
      create: role
    })
  }
  console.log('Role definitions seeded.')
}

if (require.main === module) {
  seedRoles()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
