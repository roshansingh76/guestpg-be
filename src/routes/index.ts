import { Router } from 'express'
import authRoutes from './auth.routes'
import guestRoutes from './guest.routes'

const router = Router()

router.get('/health', (_req, res) => res.json({ ok: true }))

router.use('/auth', authRoutes)
router.use('/guests', guestRoutes)

export default router

