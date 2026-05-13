import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../db/prisma'

async function main() {
  const adminEmail = 'admin@gmail.com'
  const adminPassword = '123456'

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin User',
      role: 'super_admin',
      phone: '0000000000',
      passwordHash: bcrypt.hashSync(adminPassword, 10),
    },
    create: {
      name: 'Admin User',
      email: adminEmail,
      phone: '0000000000',
      role: 'super_admin',
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
        role: 'pg_owner',
        phone: '1111111111',
        pgId: existingPG.id,
        passwordHash: bcrypt.hashSync(pgOwnerPassword, 10),
      },
      create: {
        name: 'PG Owner',
        email: pgOwnerEmail,
        phone: '1111111111',
        role: 'pg_owner',
        pgId: existingPG.id,
        passwordHash: bcrypt.hashSync(pgOwnerPassword, 10),
      },
    })
  }

  const categories = [
    { name: 'Exterior', description: 'Photos of the PG exterior and street view' },
    { name: 'Interior', description: 'Photos of rooms, common areas, and interiors' },
    { name: 'Amenities', description: 'Photos of facilities, kitchen, and amenities' },
  ]

  for (const category of categories) {
    await prisma.pGPhotoCategory.upsert({
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

