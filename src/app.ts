import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import swaggerUi from 'swagger-ui-express'
import routes from './routes'

dotenv.config()

const swaggerDocument = yaml.load(
  fs.readFileSync(path.resolve(__dirname, '../docs/swagger.yaml'), 'utf8')
) as Record<string, unknown>

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
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.use('/api', routes)

  // Basic error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  })

  return app
}

