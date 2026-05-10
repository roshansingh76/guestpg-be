import { Router } from 'express'
import authRoutes from './auth.routes'
import pgRoutes from './pg.routes'
import userRoutes from './user.routes'

const router = Router()

router.get('/health', (_req, res) => res.json({ ok: true }))

router.use('/auth', authRoutes)
router.use('/pgs', pgRoutes)
router.use('/users', userRoutes)

export default router

