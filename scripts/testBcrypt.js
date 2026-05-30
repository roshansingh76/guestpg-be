const bcrypt = require('bcryptjs')
const hash = bcrypt.hashSync('12345', 10)
console.log('hash', hash)
console.log('compare', bcrypt.compareSync('12345', hash))
