const { UserService } = require('../dist/services/user.service')
const { prisma } = require('../dist/db/prisma')
const bcrypt = require('bcryptjs')

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } })
  console.log('DB user status:', user?.status)
  console.log('DB user hash:', user?.passwordHash)
  console.log('Hash length:', user?.passwordHash?.length)
  const compare = await bcrypt.compare('12345', user?.passwordHash || '')
  console.log('bcrypt.compare direct:', compare)
  const auth = await UserService.authenticateUser('admin@gmail.com', '12345')
  console.log('authenticateUser returned:', auth)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})