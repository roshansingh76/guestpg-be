import { prisma } from '../db/prisma'

async function main() {
  try {
    console.log('Testing prisma findUnique for admin@gmail.com')
    const user = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } })
    console.log('Result:', user)
  } catch (err) {
    console.error('Prisma error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
