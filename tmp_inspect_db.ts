import { prisma } from './src/db/prisma'

async function main() {
  const rows = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name='PGPhoto' AND column_name='categoryId';`)
  console.log(rows)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
