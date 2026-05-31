import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../db/prisma'

async function main() {
  const adminEmail = 'admin@gmail.com'
  const adminPassword = '12345'

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin User',
      role: { connect: { name: 'super_admin' } },
      phone: '0000000000',
      passwordHash: bcrypt.hashSync(adminPassword, 10),
    },
    create: {
      name: 'Admin User',
      email: adminEmail,
      phone: '0000000000',
      role: { connect: { name: 'super_admin' } },
      passwordHash: bcrypt.hashSync(adminPassword, 10),
    },
  })

  // Create PG owner for existing PG
  const pgOwnerEmail = 'owner@pgsystem.com'
  const pgOwnerPassword = 'password'

  const existingPG = await prisma.pG.findFirst()
  if (existingPG) {
    await prisma.user.upsert({
      where: { email: pgOwnerEmail },
      update: {
        name: 'PG Owner',
        role: { connect: { name: 'pg_owner' } },
        phone: '1111111111',
        pg: { connect: { id: existingPG.id } },
        passwordHash: bcrypt.hashSync(pgOwnerPassword, 10),
      },
      create: {
        name: 'PG Owner',
        email: pgOwnerEmail,
        phone: '1111111111',
        role: { connect: { name: 'pg_owner' } },
        pg: { connect: { id: existingPG.id } },
        passwordHash: bcrypt.hashSync(pgOwnerPassword, 10),
      },
    })
  }

  const categories = [
    { name: 'Banner Image', description: 'Primary banner image for the PG listing' },
    { name: 'Interior Photos', description: 'Interior room and common area photos' },
    { name: 'Exterior Photos', description: 'Exterior property and street view photos' },
  ]

  for (const category of categories) {
    await prisma.photoCategory.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    })
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

