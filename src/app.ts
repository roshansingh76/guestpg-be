import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import swaggerUi from 'swagger-ui-express'
import routes from './routes'
import { errorHandler } from './middleware/error.middleware'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

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
  app.use('/assets', express.static(path.resolve(__dirname, '../assets')))
  app.use('/api', routes)

  app.use(errorHandler)

  return app
}

