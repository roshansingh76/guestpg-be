import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pgs = await prisma.pG.findMany()
  console.log('PGs in database:', pgs)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })