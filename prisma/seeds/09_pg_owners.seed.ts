import { prisma } from './prismaClient'
import { hashPgOwnerPasswords, pgOwners } from './data/pgOwners'

export async function seedPgOwners() {
  console.log('Seeding dummy PG owners...')
  const hashedOwners = await hashPgOwnerPasswords()
  const role = await prisma.role.findUnique({ where: { name: 'pg_owner' } })
  if (!role) {
    throw new Error('Missing role: pg_owner')
  }

  for (const owner of hashedOwners) {
    const ownerData: any = {
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      passwordHash: owner.passwordHash,
      role: { connect: { id: role.id } },
      isActive: owner.isActive
    }

    await prisma.user.upsert({
      where: { email: owner.email },
      update: ownerData,
      create: ownerData
    })
  }

  console.log('Dummy PG owners seeded.')
}

if (require.main === module) {
  seedPgOwners()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
      process.exit(1)
    })
}
