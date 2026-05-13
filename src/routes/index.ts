import { Router } from 'express'
import authRoutes from './auth.routes'
import pgRoutes from './pg.routes'
import userRoutes from './user.routes'
import {
  getAllBills,
  getBillByIdUnified,
  addBillItem,
  updateBillItem,
} from '../controllers/billing.controller'
import { authRequired } from '../middleware/auth'

const router = Router()

router.get('/health', (_req, res) => res.json({ ok: true }))

router.use('/auth', authRoutes)
router.use('/pgs', pgRoutes)
router.use('/users', userRoutes)

// ============ Unified Bills Route ============
router.get('/bills', authRequired, getAllBills)
router.get('/bills/:billId', authRequired, getBillByIdUnified)
router.post('/bills/:billId/items', authRequired, addBillItem)
router.put('/bills/:billId/items/:itemId', authRequired, updateBillItem)

export default router

