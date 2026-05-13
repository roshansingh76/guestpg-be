import { Router } from 'express'
import { authRequired } from '../middleware/auth'
import {
  listTenants,
  getTenant,
  createTenant,
  updateTenant,
  checkoutTenant,
  deleteTenant,
} from '../controllers/tenant.controller'

const router = Router({ mergeParams: true })

router.get('/', authRequired, listTenants)
router.get('/:id', authRequired, getTenant)
router.post('/', authRequired, createTenant)
router.put('/:id', authRequired, updateTenant)
router.patch('/:id/checkout', authRequired, checkoutTenant)
router.delete('/:id', authRequired, deleteTenant)

export default router
