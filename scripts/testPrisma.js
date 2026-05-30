const { prisma } = require('../dist/db/prisma')

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } })
  console.log('prisma user:', user)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
