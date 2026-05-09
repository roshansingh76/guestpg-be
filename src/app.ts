import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes'

dotenv.config()

export function createApp() {
  const app = express()

  app.use(express.json())
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || true,
      credentials: true,
    })
  )

  app.get('/', (_req, res) => res.send('node-aws API is running'))
  app.use('/api', routes)

  // Basic error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  })

  return app
}

