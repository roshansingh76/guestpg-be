import { prisma } from './prismaClient'
import { hashSeedPasswords, users } from './data/users'

export async function seedUsers() {
  console.log('Seeding default users...')
  const hashedUsers = await hashSeedPasswords()
  const roleNames = hashedUsers.map((user) => user.role)
  const roles = await prisma.role.findMany({ where: { name: { in: roleNames } } })
  const roleMap = new Map(roles.map((role) => [role.name, role.id]))

  for (const user of hashedUsers) {
    const roleId = roleMap.get(user.role)
    if (!roleId) {
      throw new Error(`Missing role for seed user: ${user.role}`)
    }

    const userData: any = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      passwordHash: user.passwordHash,
      role: { connect: { id: roleId } },
      isActive: user.isActive,
    }

    await prisma.user.upsert({
      where: { email: user.email },
      update: userData,
      create: userData,
    })
  }

  console.log('Default users seeded.')
}

if (require.main === module) {
  seedUsers()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
