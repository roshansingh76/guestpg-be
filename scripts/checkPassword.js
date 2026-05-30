const bcrypt = require('bcryptjs')

const password = process.argv[2]
const hash = process.argv[3]

if (!password || !hash) {
  console.error('Usage: node checkPassword.js <password> <hash>')
  process.exit(1)
}

bcrypt.compare(password, hash).then((match) => {
  console.log(match)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
