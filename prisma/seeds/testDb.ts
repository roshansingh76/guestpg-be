import { prisma } from './prismaClient'

async function run() {
  try {
    console.log('Testing DB connection with SELECT 1')
    const res = await prisma.$queryRawUnsafe('SELECT 1 as val')
    console.log('Query result:', res)
  } catch (err) {
    console.error('DB test failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
