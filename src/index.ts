import { createServer } from 'http'
import { createApp } from './app'

const port = process.env.PORT || 8585
const app = createApp()

const server = createServer(app)
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})