import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../db/prisma'

async function main() {
  const adminEmail = 'admin@pgsystem.com'
  const ownerEmail = 'owner@pgsystem.com'

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Super Admin', role: 'super_admin', passwordHash: bcrypt.hashSync('password', 10) },
    create: { name: 'Super Admin', email: adminEmail, role: 'super_admin', passwordHash: bcrypt.hashSync('password', 10) },
  })

  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { name: 'PG Owner', role: 'pg_owner', passwordHash: bcrypt.hashSync('password', 10) },
    create: { name: 'PG Owner', email: ownerEmail, role: 'pg_owner', passwordHash: bcrypt.hashSync('password', 10) },
  })
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

