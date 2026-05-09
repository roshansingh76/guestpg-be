import { Router } from 'express'
import authRoutes from './auth.routes'
import guestRoutes from './guest.routes'
import pgRoutes from './pg.routes'
import pgAuthRoutes from './pgAuth.routes'

const router = Router()

router.get('/health', (_req, res) => res.json({ ok: true }))

router.use('/auth', authRoutes)
router.use('/guests', guestRoutes)
router.use('/pgs', pgRoutes)
router.use('/pg-auth', pgAuthRoutes)

export default router

