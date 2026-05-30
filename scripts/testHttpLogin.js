const { createApp } = require('../dist/app')
const { createServer } = require('http')

async function main() {
  const app = createApp()
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/api/auth/login`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: '12345' }),
  })
  const body = await res.text()
  console.log('status:', res.status)
  console.log('body:', body)
  server.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})