const { UserService } = require('../dist/services/user.service')

async function main() {
  const user = await UserService.authenticateUser('admin@gmail.com', '12345')
  console.log('authenticateUser result:', user)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
